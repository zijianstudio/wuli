// Copyright 2013-2023, University of Colorado Boulder

/**
 * Displays a (stroked) line. Inherits Path, and allows for optimized drawing and improved parameter handling.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import extendDefined from '../../../phet-core/js/extendDefined.js';
import { LineCanvasDrawable, LineSVGDrawable, Path, Renderer, scenery } from '../imports.js';
const LINE_OPTION_KEYS = ['p1',
// {Vector2} - Start position
'p2',
// {Vector2} - End position
'x1',
// {number} - Start x position
'y1',
// {number} - Start y position
'x2',
// {number} - End x position
'y2' // {number} - End y position
];

export default class Line extends Path {
  // The x coordinate of the start point (point 1)

  // The Y coordinate of the start point (point 1)

  // The x coordinate of the start point (point 2)

  // The y coordinate of the start point (point 2)

  constructor(x1, y1, x2, y2, options) {
    super(null);
    this._x1 = 0;
    this._y1 = 0;
    this._x2 = 0;
    this._y2 = 0;

    // Remap constructor parameters to options
    if (typeof x1 === 'object') {
      if (x1 instanceof Vector2) {
        // assumes Line( Vector2, Vector2, options ), where x2 is our options
        assert && assert(x2 === undefined || typeof x2 === 'object');
        assert && assert(x2 === undefined || Object.getPrototypeOf(x2) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        options = extendDefined({
          // First Vector2 is under the x1 name
          x1: x1.x,
          y1: x1.y,
          // Second Vector2 is under the y1 name
          x2: y1.x,
          y2: y1.y,
          strokePickable: true
        }, x2); // Options object (if available) is under the x2 name
      } else {
        // assumes Line( { ... } ), init to zero for now
        assert && assert(y1 === undefined);

        // Options object is under the x1 name
        assert && assert(x1 === undefined || Object.getPrototypeOf(x1) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        options = extendDefined({
          strokePickable: true
        }, x1); // Options object (if available) is under the x1 name
      }
    } else {
      // new Line( x1, y1, x2, y2, [options] )
      assert && assert(x1 !== undefined && typeof y1 === 'number' && typeof x2 === 'number' && typeof y2 === 'number');
      assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
      options = extendDefined({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        strokePickable: true
      }, options);
    }
    this.mutate(options);
  }

  /**
   * Set all of the line's x and y values.
   *
   * @param x1 - the start x coordinate
   * @param y1 - the start y coordinate
   * @param x2 - the end x coordinate
   * @param y2 - the end y coordinate
   */
  setLine(x1, y1, x2, y2) {
    assert && assert(x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined, 'parameters need to be defined');
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
    const stateLen = this._drawables.length;
    for (let i = 0; i < stateLen; i++) {
      const state = this._drawables[i];
      state.markDirtyLine();
    }
    this.invalidateLine();
    return this;
  }

  /**
   * Set the line's first point's x and y values
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  setPoint1(x1, y1) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    if (typeof x1 === 'number') {
      // setPoint1( x1, y1 );
      assert && assert(x1 !== undefined && y1 !== undefined, 'parameters need to be defined');
      this._x1 = x1;
      this._y1 = y1;
    } else {
      // setPoint1( Vector2 )
      assert && assert(x1.x !== undefined && x1.y !== undefined, 'parameters need to be defined');
      this._x1 = x1.x;
      this._y1 = x1.y;
    }
    const numDrawables = this._drawables.length;
    for (let i = 0; i < numDrawables; i++) {
      this._drawables[i].markDirtyP1();
    }
    this.invalidateLine();
    return this;
  }
  set p1(point) {
    this.setPoint1(point);
  }
  get p1() {
    return new Vector2(this._x1, this._y1);
  }

  /**
   * Set the line's second point's x and y values
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  setPoint2(x2, y2) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    if (typeof x2 === 'number') {
      // setPoint2( x2, y2 );
      assert && assert(x2 !== undefined && y2 !== undefined, 'parameters need to be defined');
      this._x2 = x2;
      this._y2 = y2;
    } else {
      // setPoint2( Vector2 )
      assert && assert(x2.x !== undefined && x2.y !== undefined, 'parameters need to be defined');
      this._x2 = x2.x;
      this._y2 = x2.y;
    }
    const numDrawables = this._drawables.length;
    for (let i = 0; i < numDrawables; i++) {
      this._drawables[i].markDirtyP2();
    }
    this.invalidateLine();
    return this;
  }
  set p2(point) {
    this.setPoint2(point);
  }
  get p2() {
    return new Vector2(this._x2, this._y2);
  }

  /**
   * Sets the x coordinate of the first point of the line.
   */
  setX1(x1) {
    if (this._x1 !== x1) {
      this._x1 = x1;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyX1();
      }
      this.invalidateLine();
    }
    return this;
  }
  set x1(value) {
    this.setX1(value);
  }
  get x1() {
    return this.getX1();
  }

  /**
   * Returns the x coordinate of the first point of the line.
   */
  getX1() {
    return this._x1;
  }

  /**
   * Sets the y coordinate of the first point of the line.
   */
  setY1(y1) {
    if (this._y1 !== y1) {
      this._y1 = y1;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyY1();
      }
      this.invalidateLine();
    }
    return this;
  }
  set y1(value) {
    this.setY1(value);
  }
  get y1() {
    return this.getY1();
  }

  /**
   * Returns the y coordinate of the first point of the line.
   */
  getY1() {
    return this._y1;
  }

  /**
   * Sets the x coordinate of the second point of the line.
   */
  setX2(x2) {
    if (this._x2 !== x2) {
      this._x2 = x2;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyX2();
      }
      this.invalidateLine();
    }
    return this;
  }
  set x2(value) {
    this.setX2(value);
  }
  get x2() {
    return this.getX2();
  }

  /**
   * Returns the x coordinate of the second point of the line.
   */
  getX2() {
    return this._x2;
  }

  /**
   * Sets the y coordinate of the second point of the line.
   */
  setY2(y2) {
    if (this._y2 !== y2) {
      this._y2 = y2;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyY2();
      }
      this.invalidateLine();
    }
    return this;
  }
  set y2(value) {
    this.setY2(value);
  }
  get y2() {
    return this.getY2();
  }

  /**
   * Returns the y coordinate of the second point of the line.
   */
  getY2() {
    return this._y2;
  }

  /**
   * Returns a Shape that is equivalent to our rendered display. Generally used to lazily create a Shape instance
   * when one is needed, without having to do so beforehand.
   */
  createLineShape() {
    return Shape.lineSegment(this._x1, this._y1, this._x2, this._y2).makeImmutable();
  }

  /**
   * Notifies that the line has changed and invalidates path information and our cached shape.
   */
  invalidateLine() {
    assert && assert(isFinite(this._x1), `A line needs to have a finite x1 (${this._x1})`);
    assert && assert(isFinite(this._y1), `A line needs to have a finite y1 (${this._y1})`);
    assert && assert(isFinite(this._x2), `A line needs to have a finite x2 (${this._x2})`);
    assert && assert(isFinite(this._y2), `A line needs to have a finite y2 (${this._y2})`);

    // sets our 'cache' to null, so we don't always have to recompute our shape
    this._shape = null;

    // should invalidate the path and ensure a redraw
    this.invalidatePath();
  }

  /**
   * Computes whether the provided point is "inside" (contained) in this Line's self content, or "outside".
   *
   * Since an unstroked Line contains no area, we can quickly shortcut this operation.
   *
   * @param point - Considered to be in the local coordinate frame
   */
  containsPointSelf(point) {
    if (this._strokePickable) {
      return super.containsPointSelf(point);
    } else {
      return false; // nothing is in a line! (although maybe we should handle edge points properly?)
    }
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
    LineCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
  }

  /**
   * Computes the bounds of the Line, including any applied stroke. Overridden for efficiency.
   */
  computeShapeBounds() {
    // optimized form for a single line segment (no joins, just two caps)
    if (this._stroke) {
      const lineCap = this.getLineCap();
      const halfLineWidth = this.getLineWidth() / 2;
      if (lineCap === 'round') {
        // we can simply dilate by half the line width
        return new Bounds2(Math.min(this._x1, this._x2) - halfLineWidth, Math.min(this._y1, this._y2) - halfLineWidth, Math.max(this._x1, this._x2) + halfLineWidth, Math.max(this._y1, this._y2) + halfLineWidth);
      } else {
        // (dx,dy) is a vector p2-p1
        const dx = this._x2 - this._x1;
        const dy = this._y2 - this._y1;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude === 0) {
          // if our line is a point, just dilate by halfLineWidth
          return new Bounds2(this._x1 - halfLineWidth, this._y1 - halfLineWidth, this._x2 + halfLineWidth, this._y2 + halfLineWidth);
        }
        // (sx,sy) is a vector with a magnitude of halfLineWidth pointed in the direction of (dx,dy)
        const sx = halfLineWidth * dx / magnitude;
        const sy = halfLineWidth * dy / magnitude;
        const bounds = Bounds2.NOTHING.copy();
        if (lineCap === 'butt') {
          // four points just using the perpendicular stroked offsets (sy,-sx) and (-sy,sx)
          bounds.addCoordinates(this._x1 - sy, this._y1 + sx);
          bounds.addCoordinates(this._x1 + sy, this._y1 - sx);
          bounds.addCoordinates(this._x2 - sy, this._y2 + sx);
          bounds.addCoordinates(this._x2 + sy, this._y2 - sx);
        } else {
          assert && assert(lineCap === 'square');

          // four points just using the perpendicular stroked offsets (sy,-sx) and (-sy,sx) and parallel stroked offsets
          bounds.addCoordinates(this._x1 - sx - sy, this._y1 - sy + sx);
          bounds.addCoordinates(this._x1 - sx + sy, this._y1 - sy - sx);
          bounds.addCoordinates(this._x2 + sx - sy, this._y2 + sy + sx);
          bounds.addCoordinates(this._x2 + sx + sy, this._y2 + sy - sx);
        }
        return bounds;
      }
    } else {
      // It might have a fill? Just include the fill bounds for now.
      const fillBounds = Bounds2.NOTHING.copy();
      fillBounds.addCoordinates(this._x1, this._y1);
      fillBounds.addCoordinates(this._x2, this._y2);
      return fillBounds;
    }
  }

  /**
   * Creates a SVG drawable for this Line.
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createSVGDrawable(renderer, instance) {
    // @ts-expect-error
    return LineSVGDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a Canvas drawable for this Line.
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createCanvasDrawable(renderer, instance) {
    // @ts-expect-error
    return LineCanvasDrawable.createFromPool(renderer, instance);
  }

  /**
   * It is impossible to set another shape on this Path subtype, as its effective shape is determined by other
   * parameters.
   *
   * Throws an error if it is not null.
   */
  setShape(shape) {
    if (shape !== null) {
      throw new Error('Cannot set the shape of a Line to something non-null');
    } else {
      // probably called from the Path constructor
      this.invalidatePath();
    }
    return this;
  }

  /**
   * Returns an immutable copy of this Path subtype's representation.
   *
   * NOTE: This is created lazily, so don't call it if you don't have to!
   */
  getShape() {
    if (!this._shape) {
      this._shape = this.createLineShape();
    }
    return this._shape;
  }

  /**
   * Returns whether this Path has an associated Shape (instead of no shape, represented by null)
   */
  hasShape() {
    return true;
  }
  mutate(options) {
    return super.mutate(options);
  }

  /**
   * Returns available fill renderers. (scenery-internal)
   *
   * Since our line can't be filled, we support all fill renderers.
   *
   * See Renderer for more information on the bitmasks
   */
  getFillRendererBitmask() {
    return Renderer.bitmaskCanvas | Renderer.bitmaskSVG | Renderer.bitmaskDOM | Renderer.bitmaskWebGL;
  }
}

/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
Line.prototype._mutatorKeys = LINE_OPTION_KEYS.concat(Path.prototype._mutatorKeys);

/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */
Line.prototype.drawableMarkFlags = Path.prototype.drawableMarkFlags.concat(['line', 'p1', 'p2', 'x1', 'x2', 'y1', 'y2']).filter(flag => flag !== 'shape');
scenery.register('Line', Line);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIlNoYXBlIiwiZXh0ZW5kRGVmaW5lZCIsIkxpbmVDYW52YXNEcmF3YWJsZSIsIkxpbmVTVkdEcmF3YWJsZSIsIlBhdGgiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJMSU5FX09QVElPTl9LRVlTIiwiTGluZSIsImNvbnN0cnVjdG9yIiwieDEiLCJ5MSIsIngyIiwieTIiLCJvcHRpb25zIiwiX3gxIiwiX3kxIiwiX3gyIiwiX3kyIiwiYXNzZXJ0IiwidW5kZWZpbmVkIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJ4IiwieSIsInN0cm9rZVBpY2thYmxlIiwibXV0YXRlIiwic2V0TGluZSIsInN0YXRlTGVuIiwiX2RyYXdhYmxlcyIsImxlbmd0aCIsImkiLCJzdGF0ZSIsIm1hcmtEaXJ0eUxpbmUiLCJpbnZhbGlkYXRlTGluZSIsInNldFBvaW50MSIsIm51bURyYXdhYmxlcyIsIm1hcmtEaXJ0eVAxIiwicDEiLCJwb2ludCIsInNldFBvaW50MiIsIm1hcmtEaXJ0eVAyIiwicDIiLCJzZXRYMSIsIm1hcmtEaXJ0eVgxIiwidmFsdWUiLCJnZXRYMSIsInNldFkxIiwibWFya0RpcnR5WTEiLCJnZXRZMSIsInNldFgyIiwibWFya0RpcnR5WDIiLCJnZXRYMiIsInNldFkyIiwibWFya0RpcnR5WTIiLCJnZXRZMiIsImNyZWF0ZUxpbmVTaGFwZSIsImxpbmVTZWdtZW50IiwibWFrZUltbXV0YWJsZSIsImlzRmluaXRlIiwiX3NoYXBlIiwiaW52YWxpZGF0ZVBhdGgiLCJjb250YWluc1BvaW50U2VsZiIsIl9zdHJva2VQaWNrYWJsZSIsImNhbnZhc1BhaW50U2VsZiIsIndyYXBwZXIiLCJtYXRyaXgiLCJwYWludENhbnZhcyIsImNvbXB1dGVTaGFwZUJvdW5kcyIsIl9zdHJva2UiLCJsaW5lQ2FwIiwiZ2V0TGluZUNhcCIsImhhbGZMaW5lV2lkdGgiLCJnZXRMaW5lV2lkdGgiLCJNYXRoIiwibWluIiwibWF4IiwiZHgiLCJkeSIsIm1hZ25pdHVkZSIsInNxcnQiLCJzeCIsInN5IiwiYm91bmRzIiwiTk9USElORyIsImNvcHkiLCJhZGRDb29yZGluYXRlcyIsImZpbGxCb3VuZHMiLCJjcmVhdGVTVkdEcmF3YWJsZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJjcmVhdGVGcm9tUG9vbCIsImNyZWF0ZUNhbnZhc0RyYXdhYmxlIiwic2V0U2hhcGUiLCJzaGFwZSIsIkVycm9yIiwiZ2V0U2hhcGUiLCJoYXNTaGFwZSIsImdldEZpbGxSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza1NWRyIsImJpdG1hc2tET00iLCJiaXRtYXNrV2ViR0wiLCJfbXV0YXRvcktleXMiLCJjb25jYXQiLCJkcmF3YWJsZU1hcmtGbGFncyIsImZpbHRlciIsImZsYWciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzcGxheXMgYSAoc3Ryb2tlZCkgbGluZS4gSW5oZXJpdHMgUGF0aCwgYW5kIGFsbG93cyBmb3Igb3B0aW1pemVkIGRyYXdpbmcgYW5kIGltcHJvdmVkIHBhcmFtZXRlciBoYW5kbGluZy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZXh0ZW5kRGVmaW5lZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXh0ZW5kRGVmaW5lZC5qcyc7XHJcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBDYW52YXNTZWxmRHJhd2FibGUsIFRMaW5lRHJhd2FibGUsIEluc3RhbmNlLCBMaW5lQ2FudmFzRHJhd2FibGUsIExpbmVTVkdEcmF3YWJsZSwgUGF0aCwgUGF0aE9wdGlvbnMsIFJlbmRlcmVyLCBzY2VuZXJ5LCBTVkdTZWxmRHJhd2FibGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IExJTkVfT1BUSU9OX0tFWVMgPSBbXHJcbiAgJ3AxJywgLy8ge1ZlY3RvcjJ9IC0gU3RhcnQgcG9zaXRpb25cclxuICAncDInLCAvLyB7VmVjdG9yMn0gLSBFbmQgcG9zaXRpb25cclxuICAneDEnLCAvLyB7bnVtYmVyfSAtIFN0YXJ0IHggcG9zaXRpb25cclxuICAneTEnLCAvLyB7bnVtYmVyfSAtIFN0YXJ0IHkgcG9zaXRpb25cclxuICAneDInLCAvLyB7bnVtYmVyfSAtIEVuZCB4IHBvc2l0aW9uXHJcbiAgJ3kyJyAvLyB7bnVtYmVyfSAtIEVuZCB5IHBvc2l0aW9uXHJcbl07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHAxPzogVmVjdG9yMjtcclxuICBwMj86IFZlY3RvcjI7XHJcbiAgeDE/OiBudW1iZXI7XHJcbiAgeTE/OiBudW1iZXI7XHJcbiAgeDI/OiBudW1iZXI7XHJcbiAgeTI/OiBudW1iZXI7XHJcbn07XHJcbmV4cG9ydCB0eXBlIExpbmVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBhdGhPcHRpb25zLCAnc2hhcGUnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbmUgZXh0ZW5kcyBQYXRoIHtcclxuXHJcbiAgLy8gVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDEpXHJcbiAgcHJpdmF0ZSBfeDE6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDEpXHJcbiAgcHJpdmF0ZSBfeTE6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDIpXHJcbiAgcHJpdmF0ZSBfeDI6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQgKHBvaW50IDIpXHJcbiAgcHJpdmF0ZSBfeTI6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogTGluZU9wdGlvbnMgKTtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHAxOiBWZWN0b3IyLCBwMjogVmVjdG9yMiwgb3B0aW9ucz86IExpbmVPcHRpb25zICk7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCBvcHRpb25zPzogTGluZU9wdGlvbnMgKTtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHgxPzogbnVtYmVyIHwgVmVjdG9yMiB8IExpbmVPcHRpb25zLCB5MT86IG51bWJlciB8IFZlY3RvcjIsIHgyPzogbnVtYmVyIHwgTGluZU9wdGlvbnMsIHkyPzogbnVtYmVyLCBvcHRpb25zPzogTGluZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggbnVsbCApO1xyXG5cclxuICAgIHRoaXMuX3gxID0gMDtcclxuICAgIHRoaXMuX3kxID0gMDtcclxuICAgIHRoaXMuX3gyID0gMDtcclxuICAgIHRoaXMuX3kyID0gMDtcclxuXHJcbiAgICAvLyBSZW1hcCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIHRvIG9wdGlvbnNcclxuICAgIGlmICggdHlwZW9mIHgxID09PSAnb2JqZWN0JyApIHtcclxuICAgICAgaWYgKCB4MSBpbnN0YW5jZW9mIFZlY3RvcjIgKSB7XHJcbiAgICAgICAgLy8gYXNzdW1lcyBMaW5lKCBWZWN0b3IyLCBWZWN0b3IyLCBvcHRpb25zICksIHdoZXJlIHgyIGlzIG91ciBvcHRpb25zXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDIgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeDIgPT09ICdvYmplY3QnICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDIgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHgyICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xyXG5cclxuICAgICAgICBvcHRpb25zID0gZXh0ZW5kRGVmaW5lZCgge1xyXG4gICAgICAgICAgLy8gRmlyc3QgVmVjdG9yMiBpcyB1bmRlciB0aGUgeDEgbmFtZVxyXG4gICAgICAgICAgeDE6IHgxLngsXHJcbiAgICAgICAgICB5MTogeDEueSxcclxuICAgICAgICAgIC8vIFNlY29uZCBWZWN0b3IyIGlzIHVuZGVyIHRoZSB5MSBuYW1lXHJcbiAgICAgICAgICB4MjogKCB5MSBhcyBWZWN0b3IyICkueCxcclxuICAgICAgICAgIHkyOiAoIHkxIGFzIFZlY3RvcjIgKS55LFxyXG5cclxuICAgICAgICAgIHN0cm9rZVBpY2thYmxlOiB0cnVlXHJcbiAgICAgICAgfSwgeDIgKTsgLy8gT3B0aW9ucyBvYmplY3QgKGlmIGF2YWlsYWJsZSkgaXMgdW5kZXIgdGhlIHgyIG5hbWVcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBhc3N1bWVzIExpbmUoIHsgLi4uIH0gKSwgaW5pdCB0byB6ZXJvIGZvciBub3dcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5MSA9PT0gdW5kZWZpbmVkICk7XHJcblxyXG4gICAgICAgIC8vIE9wdGlvbnMgb2JqZWN0IGlzIHVuZGVyIHRoZSB4MSBuYW1lXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDEgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHgxICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xyXG5cclxuICAgICAgICBvcHRpb25zID0gZXh0ZW5kRGVmaW5lZCgge1xyXG4gICAgICAgICAgc3Ryb2tlUGlja2FibGU6IHRydWVcclxuICAgICAgICB9LCB4MSApOyAvLyBPcHRpb25zIG9iamVjdCAoaWYgYXZhaWxhYmxlKSBpcyB1bmRlciB0aGUgeDEgbmFtZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gbmV3IExpbmUoIHgxLCB5MSwgeDIsIHkyLCBbb3B0aW9uc10gKVxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4MSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgIHR5cGVvZiB5MSA9PT0gJ251bWJlcicgJiZcclxuICAgICAgdHlwZW9mIHgyID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICB0eXBlb2YgeTIgPT09ICdudW1iZXInICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcclxuICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xyXG5cclxuICAgICAgb3B0aW9ucyA9IGV4dGVuZERlZmluZWQoIHtcclxuICAgICAgICB4MTogeDEsXHJcbiAgICAgICAgeTE6IHkxLFxyXG4gICAgICAgIHgyOiB4MixcclxuICAgICAgICB5MjogeTIsXHJcbiAgICAgICAgc3Ryb2tlUGlja2FibGU6IHRydWVcclxuICAgICAgfSwgb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgYWxsIG9mIHRoZSBsaW5lJ3MgeCBhbmQgeSB2YWx1ZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geDEgLSB0aGUgc3RhcnQgeCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHkxIC0gdGhlIHN0YXJ0IHkgY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB4MiAtIHRoZSBlbmQgeCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHkyIC0gdGhlIGVuZCB5IGNvb3JkaW5hdGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGluZSggeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHgxICE9PSB1bmRlZmluZWQgJiZcclxuICAgIHkxICE9PSB1bmRlZmluZWQgJiZcclxuICAgIHgyICE9PSB1bmRlZmluZWQgJiZcclxuICAgIHkyICE9PSB1bmRlZmluZWQsICdwYXJhbWV0ZXJzIG5lZWQgdG8gYmUgZGVmaW5lZCcgKTtcclxuXHJcbiAgICB0aGlzLl94MSA9IHgxO1xyXG4gICAgdGhpcy5feTEgPSB5MTtcclxuICAgIHRoaXMuX3gyID0geDI7XHJcbiAgICB0aGlzLl95MiA9IHkyO1xyXG5cclxuICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5fZHJhd2FibGVzWyBpIF07XHJcbiAgICAgICggc3RhdGUgYXMgdW5rbm93biBhcyBUTGluZURyYXdhYmxlICkubWFya0RpcnR5TGluZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0ZUxpbmUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgbGluZSdzIGZpcnN0IHBvaW50J3MgeCBhbmQgeSB2YWx1ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UG9pbnQxKCBwMTogVmVjdG9yMiApOiB0aGlzO1xyXG4gIHNldFBvaW50MSggeDE6IG51bWJlciwgeTE6IG51bWJlciApOiB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gIHNldFBvaW50MSggeDE6IG51bWJlciB8IFZlY3RvcjIsIHkxPzogbnVtYmVyICk6IHRoaXMgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcclxuICAgIGlmICggdHlwZW9mIHgxID09PSAnbnVtYmVyJyApIHtcclxuXHJcbiAgICAgIC8vIHNldFBvaW50MSggeDEsIHkxICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHgxICE9PSB1bmRlZmluZWQgJiYgeTEgIT09IHVuZGVmaW5lZCwgJ3BhcmFtZXRlcnMgbmVlZCB0byBiZSBkZWZpbmVkJyApO1xyXG4gICAgICB0aGlzLl94MSA9IHgxO1xyXG4gICAgICB0aGlzLl95MSA9IHkxITtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gc2V0UG9pbnQxKCBWZWN0b3IyIClcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDEueCAhPT0gdW5kZWZpbmVkICYmIHgxLnkgIT09IHVuZGVmaW5lZCwgJ3BhcmFtZXRlcnMgbmVlZCB0byBiZSBkZWZpbmVkJyApO1xyXG4gICAgICB0aGlzLl94MSA9IHgxLng7XHJcbiAgICAgIHRoaXMuX3kxID0geDEueTtcclxuICAgIH1cclxuICAgIGNvbnN0IG51bURyYXdhYmxlcyA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1EcmF3YWJsZXM7IGkrKyApIHtcclxuICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlQMSgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5pbnZhbGlkYXRlTGluZSgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBwMSggcG9pbnQ6IFZlY3RvcjIgKSB7IHRoaXMuc2V0UG9pbnQxKCBwb2ludCApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcDEoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5feDEsIHRoaXMuX3kxICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBsaW5lJ3Mgc2Vjb25kIHBvaW50J3MgeCBhbmQgeSB2YWx1ZXNcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UG9pbnQyKCBwMTogVmVjdG9yMiApOiB0aGlzO1xyXG4gIHNldFBvaW50MiggeDI6IG51bWJlciwgeTI6IG51bWJlciApOiB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxyXG4gIHNldFBvaW50MiggeDI6IG51bWJlciB8IFZlY3RvcjIsIHkyPzogbnVtYmVyICk6IHRoaXMgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcclxuICAgIGlmICggdHlwZW9mIHgyID09PSAnbnVtYmVyJyApIHtcclxuICAgICAgLy8gc2V0UG9pbnQyKCB4MiwgeTIgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeDIgIT09IHVuZGVmaW5lZCAmJiB5MiAhPT0gdW5kZWZpbmVkLCAncGFyYW1ldGVycyBuZWVkIHRvIGJlIGRlZmluZWQnICk7XHJcbiAgICAgIHRoaXMuX3gyID0geDI7XHJcbiAgICAgIHRoaXMuX3kyID0geTIhO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHNldFBvaW50MiggVmVjdG9yMiApXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHgyLnggIT09IHVuZGVmaW5lZCAmJiB4Mi55ICE9PSB1bmRlZmluZWQsICdwYXJhbWV0ZXJzIG5lZWQgdG8gYmUgZGVmaW5lZCcgKTtcclxuICAgICAgdGhpcy5feDIgPSB4Mi54O1xyXG4gICAgICB0aGlzLl95MiA9IHgyLnk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBudW1EcmF3YWJsZXMgPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtRHJhd2FibGVzOyBpKysgKSB7XHJcbiAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUTGluZURyYXdhYmxlICkubWFya0RpcnR5UDIoKTtcclxuICAgIH1cclxuICAgIHRoaXMuaW52YWxpZGF0ZUxpbmUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcDIoIHBvaW50OiBWZWN0b3IyICkgeyB0aGlzLnNldFBvaW50MiggcG9pbnQgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHAyKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMuX3gyLCB0aGlzLl95MiApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGxpbmUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFgxKCB4MTogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl94MSAhPT0geDEgKSB7XHJcbiAgICAgIHRoaXMuX3gxID0geDE7XHJcblxyXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlYMSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVMaW5lKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgeDEoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0WDEoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCB4MSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRYMSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGxpbmUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFgxKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5feDE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRZMSggeTE6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGlmICggdGhpcy5feTEgIT09IHkxICkge1xyXG4gICAgICB0aGlzLl95MSA9IHkxO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUTGluZURyYXdhYmxlICkubWFya0RpcnR5WTEoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlTGluZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHkxKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFkxKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeTEoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0WTEoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRZMSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3kxO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgeCBjb29yZGluYXRlIG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGxpbmUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFgyKCB4MjogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl94MiAhPT0geDIgKSB7XHJcbiAgICAgIHRoaXMuX3gyID0geDI7XHJcblxyXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlYMigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVMaW5lKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgeDIoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0WDIoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCB4MigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRYMigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRYMigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3gyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgeSBjb29yZGluYXRlIG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGxpbmUuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFkyKCB5MjogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl95MiAhPT0geTIgKSB7XHJcbiAgICAgIHRoaXMuX3kyID0geTI7XHJcblxyXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRMaW5lRHJhd2FibGUgKS5tYXJrRGlydHlZMigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVMaW5lKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgeTIoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0WTIoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCB5MigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRZMigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRZMigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3kyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFNoYXBlIHRoYXQgaXMgZXF1aXZhbGVudCB0byBvdXIgcmVuZGVyZWQgZGlzcGxheS4gR2VuZXJhbGx5IHVzZWQgdG8gbGF6aWx5IGNyZWF0ZSBhIFNoYXBlIGluc3RhbmNlXHJcbiAgICogd2hlbiBvbmUgaXMgbmVlZGVkLCB3aXRob3V0IGhhdmluZyB0byBkbyBzbyBiZWZvcmVoYW5kLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY3JlYXRlTGluZVNoYXBlKCk6IFNoYXBlIHtcclxuICAgIHJldHVybiBTaGFwZS5saW5lU2VnbWVudCggdGhpcy5feDEsIHRoaXMuX3kxLCB0aGlzLl94MiwgdGhpcy5feTIgKS5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOb3RpZmllcyB0aGF0IHRoZSBsaW5lIGhhcyBjaGFuZ2VkIGFuZCBpbnZhbGlkYXRlcyBwYXRoIGluZm9ybWF0aW9uIGFuZCBvdXIgY2FjaGVkIHNoYXBlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaW52YWxpZGF0ZUxpbmUoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5feDEgKSwgYEEgbGluZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHgxICgke3RoaXMuX3gxfSlgICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5feTEgKSwgYEEgbGluZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHkxICgke3RoaXMuX3kxfSlgICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5feDIgKSwgYEEgbGluZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHgyICgke3RoaXMuX3gyfSlgICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5feTIgKSwgYEEgbGluZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHkyICgke3RoaXMuX3kyfSlgICk7XHJcblxyXG4gICAgLy8gc2V0cyBvdXIgJ2NhY2hlJyB0byBudWxsLCBzbyB3ZSBkb24ndCBhbHdheXMgaGF2ZSB0byByZWNvbXB1dGUgb3VyIHNoYXBlXHJcbiAgICB0aGlzLl9zaGFwZSA9IG51bGw7XHJcblxyXG4gICAgLy8gc2hvdWxkIGludmFsaWRhdGUgdGhlIHBhdGggYW5kIGVuc3VyZSBhIHJlZHJhd1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgcG9pbnQgaXMgXCJpbnNpZGVcIiAoY29udGFpbmVkKSBpbiB0aGlzIExpbmUncyBzZWxmIGNvbnRlbnQsIG9yIFwib3V0c2lkZVwiLlxyXG4gICAqXHJcbiAgICogU2luY2UgYW4gdW5zdHJva2VkIExpbmUgY29udGFpbnMgbm8gYXJlYSwgd2UgY2FuIHF1aWNrbHkgc2hvcnRjdXQgdGhpcyBvcGVyYXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnQgLSBDb25zaWRlcmVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbnRhaW5zUG9pbnRTZWxmKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5jb250YWluc1BvaW50U2VsZiggcG9pbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdGhpbmcgaXMgaW4gYSBsaW5lISAoYWx0aG91Z2ggbWF5YmUgd2Ugc2hvdWxkIGhhbmRsZSBlZGdlIHBvaW50cyBwcm9wZXJseT8pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxyXG4gICAqIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhpcyBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHdyYXBwZXJcclxuICAgKiBAcGFyYW0gbWF0cml4IC0gVGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBhbHJlYWR5IGFwcGxpZWQgdG8gdGhlIGNvbnRleHQuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcclxuICAgIC8vVE9ETzogSGF2ZSBhIHNlcGFyYXRlIG1ldGhvZCBmb3IgdGhpcywgaW5zdGVhZCBvZiB0b3VjaGluZyB0aGUgcHJvdG90eXBlLiBDYW4gbWFrZSAndGhpcycgcmVmZXJlbmNlcyB0b28gZWFzaWx5LlxyXG4gICAgTGluZUNhbnZhc0RyYXdhYmxlLnByb3RvdHlwZS5wYWludENhbnZhcyggd3JhcHBlciwgdGhpcywgbWF0cml4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyB0aGUgYm91bmRzIG9mIHRoZSBMaW5lLCBpbmNsdWRpbmcgYW55IGFwcGxpZWQgc3Ryb2tlLiBPdmVycmlkZGVuIGZvciBlZmZpY2llbmN5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjb21wdXRlU2hhcGVCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICAvLyBvcHRpbWl6ZWQgZm9ybSBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50IChubyBqb2lucywganVzdCB0d28gY2FwcylcclxuICAgIGlmICggdGhpcy5fc3Ryb2tlICkge1xyXG4gICAgICBjb25zdCBsaW5lQ2FwID0gdGhpcy5nZXRMaW5lQ2FwKCk7XHJcbiAgICAgIGNvbnN0IGhhbGZMaW5lV2lkdGggPSB0aGlzLmdldExpbmVXaWR0aCgpIC8gMjtcclxuICAgICAgaWYgKCBsaW5lQ2FwID09PSAncm91bmQnICkge1xyXG4gICAgICAgIC8vIHdlIGNhbiBzaW1wbHkgZGlsYXRlIGJ5IGhhbGYgdGhlIGxpbmUgd2lkdGhcclxuICAgICAgICByZXR1cm4gbmV3IEJvdW5kczIoXHJcbiAgICAgICAgICBNYXRoLm1pbiggdGhpcy5feDEsIHRoaXMuX3gyICkgLSBoYWxmTGluZVdpZHRoLCBNYXRoLm1pbiggdGhpcy5feTEsIHRoaXMuX3kyICkgLSBoYWxmTGluZVdpZHRoLFxyXG4gICAgICAgICAgTWF0aC5tYXgoIHRoaXMuX3gxLCB0aGlzLl94MiApICsgaGFsZkxpbmVXaWR0aCwgTWF0aC5tYXgoIHRoaXMuX3kxLCB0aGlzLl95MiApICsgaGFsZkxpbmVXaWR0aCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIChkeCxkeSkgaXMgYSB2ZWN0b3IgcDItcDFcclxuICAgICAgICBjb25zdCBkeCA9IHRoaXMuX3gyIC0gdGhpcy5feDE7XHJcbiAgICAgICAgY29uc3QgZHkgPSB0aGlzLl95MiAtIHRoaXMuX3kxO1xyXG4gICAgICAgIGNvbnN0IG1hZ25pdHVkZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcclxuICAgICAgICBpZiAoIG1hZ25pdHVkZSA9PT0gMCApIHtcclxuICAgICAgICAgIC8vIGlmIG91ciBsaW5lIGlzIGEgcG9pbnQsIGp1c3QgZGlsYXRlIGJ5IGhhbGZMaW5lV2lkdGhcclxuICAgICAgICAgIHJldHVybiBuZXcgQm91bmRzMiggdGhpcy5feDEgLSBoYWxmTGluZVdpZHRoLCB0aGlzLl95MSAtIGhhbGZMaW5lV2lkdGgsIHRoaXMuX3gyICsgaGFsZkxpbmVXaWR0aCwgdGhpcy5feTIgKyBoYWxmTGluZVdpZHRoICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIChzeCxzeSkgaXMgYSB2ZWN0b3Igd2l0aCBhIG1hZ25pdHVkZSBvZiBoYWxmTGluZVdpZHRoIHBvaW50ZWQgaW4gdGhlIGRpcmVjdGlvbiBvZiAoZHgsZHkpXHJcbiAgICAgICAgY29uc3Qgc3ggPSBoYWxmTGluZVdpZHRoICogZHggLyBtYWduaXR1ZGU7XHJcbiAgICAgICAgY29uc3Qgc3kgPSBoYWxmTGluZVdpZHRoICogZHkgLyBtYWduaXR1ZGU7XHJcbiAgICAgICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcclxuXHJcbiAgICAgICAgaWYgKCBsaW5lQ2FwID09PSAnYnV0dCcgKSB7XHJcbiAgICAgICAgICAvLyBmb3VyIHBvaW50cyBqdXN0IHVzaW5nIHRoZSBwZXJwZW5kaWN1bGFyIHN0cm9rZWQgb2Zmc2V0cyAoc3ksLXN4KSBhbmQgKC1zeSxzeClcclxuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDEgLSBzeSwgdGhpcy5feTEgKyBzeCApO1xyXG4gICAgICAgICAgYm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MSArIHN5LCB0aGlzLl95MSAtIHN4ICk7XHJcbiAgICAgICAgICBib3VuZHMuYWRkQ29vcmRpbmF0ZXMoIHRoaXMuX3gyIC0gc3ksIHRoaXMuX3kyICsgc3ggKTtcclxuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDIgKyBzeSwgdGhpcy5feTIgLSBzeCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpbmVDYXAgPT09ICdzcXVhcmUnICk7XHJcblxyXG4gICAgICAgICAgLy8gZm91ciBwb2ludHMganVzdCB1c2luZyB0aGUgcGVycGVuZGljdWxhciBzdHJva2VkIG9mZnNldHMgKHN5LC1zeCkgYW5kICgtc3ksc3gpIGFuZCBwYXJhbGxlbCBzdHJva2VkIG9mZnNldHNcclxuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDEgLSBzeCAtIHN5LCB0aGlzLl95MSAtIHN5ICsgc3ggKTtcclxuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDEgLSBzeCArIHN5LCB0aGlzLl95MSAtIHN5IC0gc3ggKTtcclxuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDIgKyBzeCAtIHN5LCB0aGlzLl95MiArIHN5ICsgc3ggKTtcclxuICAgICAgICAgIGJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDIgKyBzeCArIHN5LCB0aGlzLl95MiArIHN5IC0gc3ggKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIEl0IG1pZ2h0IGhhdmUgYSBmaWxsPyBKdXN0IGluY2x1ZGUgdGhlIGZpbGwgYm91bmRzIGZvciBub3cuXHJcbiAgICAgIGNvbnN0IGZpbGxCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gICAgICBmaWxsQm91bmRzLmFkZENvb3JkaW5hdGVzKCB0aGlzLl94MSwgdGhpcy5feTEgKTtcclxuICAgICAgZmlsbEJvdW5kcy5hZGRDb29yZGluYXRlcyggdGhpcy5feDIsIHRoaXMuX3kyICk7XHJcbiAgICAgIHJldHVybiBmaWxsQm91bmRzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBMaW5lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHJldHVybiBMaW5lU1ZHRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIENhbnZhcyBkcmF3YWJsZSBmb3IgdGhpcyBMaW5lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZUNhbnZhc0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogQ2FudmFzU2VsZkRyYXdhYmxlIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHJldHVybiBMaW5lQ2FudmFzRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXQgaXMgaW1wb3NzaWJsZSB0byBzZXQgYW5vdGhlciBzaGFwZSBvbiB0aGlzIFBhdGggc3VidHlwZSwgYXMgaXRzIGVmZmVjdGl2ZSBzaGFwZSBpcyBkZXRlcm1pbmVkIGJ5IG90aGVyXHJcbiAgICogcGFyYW1ldGVycy5cclxuICAgKlxyXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiBpdCBpcyBub3QgbnVsbC5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0U2hhcGUoIHNoYXBlOiBTaGFwZSB8IG51bGwgKTogdGhpcyB7XHJcbiAgICBpZiAoIHNoYXBlICE9PSBudWxsICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgc2V0IHRoZSBzaGFwZSBvZiBhIExpbmUgdG8gc29tZXRoaW5nIG5vbi1udWxsJyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHByb2JhYmx5IGNhbGxlZCBmcm9tIHRoZSBQYXRoIGNvbnN0cnVjdG9yXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gaW1tdXRhYmxlIGNvcHkgb2YgdGhpcyBQYXRoIHN1YnR5cGUncyByZXByZXNlbnRhdGlvbi5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgaXMgY3JlYXRlZCBsYXppbHksIHNvIGRvbid0IGNhbGwgaXQgaWYgeW91IGRvbid0IGhhdmUgdG8hXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFNoYXBlKCk6IFNoYXBlIHtcclxuICAgIGlmICggIXRoaXMuX3NoYXBlICkge1xyXG4gICAgICB0aGlzLl9zaGFwZSA9IHRoaXMuY3JlYXRlTGluZVNoYXBlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fc2hhcGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoIGhhcyBhbiBhc3NvY2lhdGVkIFNoYXBlIChpbnN0ZWFkIG9mIG5vIHNoYXBlLCByZXByZXNlbnRlZCBieSBudWxsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBoYXNTaGFwZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IExpbmVPcHRpb25zICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhdmFpbGFibGUgZmlsbCByZW5kZXJlcnMuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogU2luY2Ugb3VyIGxpbmUgY2FuJ3QgYmUgZmlsbGVkLCB3ZSBzdXBwb3J0IGFsbCBmaWxsIHJlbmRlcmVycy5cclxuICAgKlxyXG4gICAqIFNlZSBSZW5kZXJlciBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgYml0bWFza3NcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0RmlsbFJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgfCBSZW5kZXJlci5iaXRtYXNrU1ZHIHwgUmVuZGVyZXIuYml0bWFza0RPTSB8IFJlbmRlcmVyLmJpdG1hc2tXZWJHTDtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCBvZiB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXHJcbiAqIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQgaW4uXHJcbiAqXHJcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxyXG4gKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cclxuICovXHJcbkxpbmUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IExJTkVfT1BUSU9OX0tFWVMuY29uY2F0KCBQYXRoLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKTtcclxuXHJcbi8qKlxyXG4gKiB7QXJyYXkuPFN0cmluZz59IC0gTGlzdCBvZiBhbGwgZGlydHkgZmxhZ3MgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlIG9uIGRyYXdhYmxlcyBjcmVhdGVkIGZyb20gdGhpcyBub2RlIChvclxyXG4gKiAgICAgICAgICAgICAgICAgICAgc3VidHlwZSkuIEdpdmVuIGEgZmxhZyAoZS5nLiByYWRpdXMpLCBpdCBpbmRpY2F0ZXMgdGhlIGV4aXN0ZW5jZSBvZiBhIGZ1bmN0aW9uXHJcbiAqICAgICAgICAgICAgICAgICAgICBkcmF3YWJsZS5tYXJrRGlydHlSYWRpdXMoKSB0aGF0IHdpbGwgaW5kaWNhdGUgdG8gdGhlIGRyYXdhYmxlIHRoYXQgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZC5cclxuICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAqIEBvdmVycmlkZVxyXG4gKi9cclxuTGluZS5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MgPSBQYXRoLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncy5jb25jYXQoIFsgJ2xpbmUnLCAncDEnLCAncDInLCAneDEnLCAneDInLCAneTEnLCAneTInIF0gKS5maWx0ZXIoIGZsYWcgPT4gZmxhZyAhPT0gJ3NoYXBlJyApO1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0xpbmUnLCBMaW5lICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBR2hELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxPQUFPQyxhQUFhLE1BQU0sd0NBQXdDO0FBQ2xFLFNBQTRFQyxrQkFBa0IsRUFBRUMsZUFBZSxFQUFFQyxJQUFJLEVBQWVDLFFBQVEsRUFBRUMsT0FBTyxRQUF5QixlQUFlO0FBRTdMLE1BQU1DLGdCQUFnQixHQUFHLENBQ3ZCLElBQUk7QUFBRTtBQUNOLElBQUk7QUFBRTtBQUNOLElBQUk7QUFBRTtBQUNOLElBQUk7QUFBRTtBQUNOLElBQUk7QUFBRTtBQUNOLElBQUksQ0FBQztBQUFBLENBQ047O0FBWUQsZUFBZSxNQUFNQyxJQUFJLFNBQVNKLElBQUksQ0FBQztFQUVyQzs7RUFHQTs7RUFHQTs7RUFHQTs7RUFNT0ssV0FBV0EsQ0FBRUMs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