// Copyright 2013-2023, University of Colorado Boulder

/**
 * A rectangular node that inherits Path, and allows for optimized drawing and improved rectangle handling.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Features, Gradient, Path, Pattern, RectangleCanvasDrawable, RectangleDOMDrawable, RectangleSVGDrawable, RectangleWebGLDrawable, Renderer, scenery, Sizable } from '../imports.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
const RECTANGLE_OPTION_KEYS = ['rectBounds',
// {Bounds2} - Sets x/y/width/height based on bounds. See setRectBounds() for more documentation.
'rectSize',
// {Dimension2} - Sets width/height based on dimension. See setRectSize() for more documentation.
'rectX',
// {number} - Sets x. See setRectX() for more documentation.
'rectY',
// {number} - Sets y. See setRectY() for more documentation.
'rectWidth',
// {number} - Sets width. See setRectWidth() for more documentation.
'rectHeight',
// Sets height. See setRectHeight() for more documentation.
'cornerRadius',
// {number} - Sets corner radii. See setCornerRadius() for more documentation.
'cornerXRadius',
// {number} - Sets horizontal corner radius. See setCornerXRadius() for more documentation.
'cornerYRadius' // {number} - Sets vertical corner radius. See setCornerYRadius() for more documentation.
];

const SuperType = Sizable(Path);
export default class Rectangle extends SuperType {
  // X value of the left side of the rectangle
  // (scenery-internal)

  // Y value of the top side of the rectangle
  // (scenery-internal)
  // Width of the rectangle
  // (scenery-internal)
  // Height of the rectangle
  // (scenery-internal)
  // X radius of rounded corners
  // (scenery-internal)
  // Y radius of rounded corners
  // (scenery-internal)
  /**
   *
   * Possible constructor signatures
   * new Rectangle( x, y, width, height, cornerXRadius, cornerYRadius, [options] )
   * new Rectangle( x, y, width, height, [options] )
   * new Rectangle( [options] )
   * new Rectangle( bounds2, [options] )
   * new Rectangle( bounds2, cornerXRadius, cornerYRadius, [options] )
   *
   * Current available options for the options object (custom for Rectangle, not Path or Node):
   * rectX - Left edge of the rectangle in the local coordinate frame
   * rectY - Top edge of the rectangle in the local coordinate frame
   * rectWidth - Width of the rectangle in the local coordinate frame
   * rectHeight - Height of the rectangle in the local coordinate frame
   * cornerXRadius - The x-axis radius for elliptical/circular rounded corners.
   * cornerYRadius - The y-axis radius for elliptical/circular rounded corners.
   * cornerRadius - Sets both "X" and "Y" corner radii above.
   *
   * NOTE: the X and Y corner radii need to both be greater than zero for rounded corners to appear. If they have the
   * same non-zero value, circular rounded corners will be used.
   *
   * Available parameters to the various constructor options:
   * @param x - x-position of the upper-left corner (left bound)
   * @param [y] - y-position of the upper-left corner (top bound)
   * @param [width] - width of the rectangle to the right of the upper-left corner, required to be >= 0
   * @param [height] - height of the rectangle below the upper-left corner, required to be >= 0
   * @param [cornerXRadius] - positive vertical radius (width) of the rounded corner, or 0 to indicate the corner should be sharp
   * @param [cornerYRadius] - positive horizontal radius (height) of the rounded corner, or 0 to indicate the corner should be sharp
   * @param [options] - Rectangle-specific options are documented in RECTANGLE_OPTION_KEYS above, and can be provided
   *                             along-side options for Node
   */
  constructor(x, y, width, height, cornerXRadius, cornerYRadius, providedOptions) {
    // We'll want to default to sizable:false, but allow clients to pass in something conflicting like widthSizable:true
    // in the super mutate. To avoid the exclusive options, we isolate this out here.
    const initialOptions = {
      sizable: false
    };
    super(null, initialOptions);
    let options = {};
    this._rectX = 0;
    this._rectY = 0;
    this._rectWidth = 0;
    this._rectHeight = 0;
    this._cornerXRadius = 0;
    this._cornerYRadius = 0;
    if (typeof x === 'object') {
      // allow new Rectangle( bounds2, { ... } ) or new Rectangle( bounds2, cornerXRadius, cornerYRadius, { ... } )
      if (x instanceof Bounds2) {
        // new Rectangle( bounds2, { ... } )
        if (typeof y !== 'number') {
          assert && assert(arguments.length === 1 || arguments.length === 2, 'new Rectangle( bounds, { ... } ) should only take one or two arguments');
          assert && assert(y === undefined || typeof y === 'object', 'new Rectangle( bounds, { ... } ) second parameter should only ever be an options object');
          assert && assert(y === undefined || Object.getPrototypeOf(y) === Object.prototype, 'Extra prototype on Node options object is a code smell');
          options = combineOptions(options, {
            rectBounds: x
          }, y); // Our options object would be at y
        }
        // Rectangle( bounds2, cornerXRadius, cornerYRadius, { ... } )
        else {
          assert && assert(arguments.length === 3 || arguments.length === 4, 'new Rectangle( bounds, cornerXRadius, cornerYRadius, { ... } ) should only take three or four arguments');
          assert && assert(height === undefined || typeof height === 'object', 'new Rectangle( bounds, cornerXRadius, cornerYRadius, { ... } ) fourth parameter should only ever be an options object');
          assert && assert(height === undefined || Object.getPrototypeOf(height) === Object.prototype, 'Extra prototype on Node options object is a code smell');
          options = combineOptions(options, {
            rectBounds: x,
            cornerXRadius: y,
            // ignore Intellij warning, our cornerXRadius is the second parameter
            cornerYRadius: width // ignore Intellij warning, our cornerYRadius is the third parameter
          }, height); // Our options object would be at height
        }
      }
      // allow new Rectangle( { rectX: x, rectY: y, rectWidth: width, rectHeight: height, ... } )
      else {
        options = combineOptions(options, x);
      }
    }
    // new Rectangle( x, y, width, height, { ... } )
    else if (cornerYRadius === undefined) {
      assert && assert(arguments.length === 4 || arguments.length === 5, 'new Rectangle( x, y, width, height, { ... } ) should only take four or five arguments');
      assert && assert(cornerXRadius === undefined || typeof cornerXRadius === 'object', 'new Rectangle( x, y, width, height, { ... } ) fifth parameter should only ever be an options object');
      assert && assert(cornerXRadius === undefined || Object.getPrototypeOf(cornerXRadius) === Object.prototype, 'Extra prototype on Node options object is a code smell');
      options = combineOptions(options, {
        rectX: x,
        rectY: y,
        rectWidth: width,
        rectHeight: height
      }, cornerXRadius);
    }
    // new Rectangle( x, y, width, height, cornerXRadius, cornerYRadius, { ... } )
    else {
      assert && assert(arguments.length === 6 || arguments.length === 7, 'new Rectangle( x, y, width, height, cornerXRadius, cornerYRadius{ ... } ) should only take six or seven arguments');
      assert && assert(options === undefined || typeof options === 'object', 'new Rectangle( x, y, width, height, cornerXRadius, cornerYRadius{ ... } ) seventh parameter should only ever be an options object');
      assert && assert(options === undefined || Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
      options = combineOptions(options, {
        rectX: x,
        rectY: y,
        rectWidth: width,
        rectHeight: height,
        cornerXRadius: cornerXRadius,
        cornerYRadius: cornerYRadius
      }, providedOptions);
    }
    this.localPreferredWidthProperty.lazyLink(this.updatePreferredSizes.bind(this));
    this.localPreferredHeightProperty.lazyLink(this.updatePreferredSizes.bind(this));
    this.mutate(options);
  }

  /**
   * Determines the maximum arc size that can be accommodated by the current width and height.
   *
   * If the corner radii are the same as the maximum arc size on a square, it will appear to be a circle (the arcs
   * take up all of the room, and leave no straight segments). In the case of a non-square, one direction of edges
   * will exist (e.g. top/bottom or left/right), while the other edges would be fully rounded.
   */
  getMaximumArcSize() {
    return Math.min(this._rectWidth / 2, this._rectHeight / 2);
  }

  /**
   * Determines the default allowed renderers (returned via the Renderer bitmask) that are allowed, given the
   * current stroke options. (scenery-internal)
   *
   * We can support the DOM renderer if there is a solid-styled stroke with non-bevel line joins
   * (which otherwise wouldn't be supported).
   *
   * @returns - Renderer bitmask, see Renderer for details
   */
  getStrokeRendererBitmask() {
    let bitmask = super.getStrokeRendererBitmask();
    const stroke = this.getStroke();
    // DOM stroke handling doesn't YET support gradients, patterns, or dashes (with the current implementation, it shouldn't be too hard)
    if (stroke && !(stroke instanceof Gradient) && !(stroke instanceof Pattern) && !this.hasLineDash()) {
      // we can't support the bevel line-join with our current DOM rectangle display
      if (this.getLineJoin() === 'miter' || this.getLineJoin() === 'round' && Features.borderRadius) {
        bitmask |= Renderer.bitmaskDOM;
      }
    }
    if (!this.hasStroke()) {
      bitmask |= Renderer.bitmaskWebGL;
    }
    return bitmask;
  }

  /**
   * Determines the allowed renderers that are allowed (or excluded) based on the current Path. (scenery-internal)
   *
   * @returns - Renderer bitmask, see Renderer for details
   */
  getPathRendererBitmask() {
    let bitmask = Renderer.bitmaskCanvas | Renderer.bitmaskSVG;
    const maximumArcSize = this.getMaximumArcSize();

    // If the top/bottom or left/right strokes touch and overlap in the middle (small rectangle, big stroke), our DOM method won't work.
    // Additionally, if we're handling rounded rectangles or a stroke with lineJoin 'round', we'll need borderRadius
    // We also require for DOM that if it's a rounded rectangle, it's rounded with circular arcs (for now, could potentially do a transform trick!)
    if ((!this.hasStroke() || this.getLineWidth() <= this._rectHeight && this.getLineWidth() <= this._rectWidth) && (!this.isRounded() || Features.borderRadius && this._cornerXRadius === this._cornerYRadius) && this._cornerYRadius <= maximumArcSize && this._cornerXRadius <= maximumArcSize) {
      bitmask |= Renderer.bitmaskDOM;
    }

    // TODO: why check here, if we also check in the 'stroke' portion?
    if (!this.hasStroke() && !this.isRounded()) {
      bitmask |= Renderer.bitmaskWebGL;
    }
    return bitmask;
  }

  /**
   * Sets all of the shape-determining parameters for the rectangle.
   *
   * @param x - The x-position of the left side of the rectangle.
   * @param y - The y-position of the top side of the rectangle.
   * @param width - The width of the rectangle.
   * @param height - The height of the rectangle.
   * @param [cornerXRadius] - The horizontal radius of curved corners (0 for sharp corners)
   * @param [cornerYRadius] - The vertical radius of curved corners (0 for sharp corners)
   */
  setRect(x, y, width, height, cornerXRadius, cornerYRadius) {
    const hasXRadius = cornerXRadius !== undefined;
    const hasYRadius = cornerYRadius !== undefined;
    assert && assert(isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height), 'x/y/width/height should be finite numbers');
    assert && assert(!hasXRadius || isFinite(cornerXRadius) && (!hasYRadius || isFinite(cornerYRadius)), 'Corner radii (if provided) should be finite numbers');

    // If this doesn't change the rectangle, don't notify about changes.
    if (this._rectX === x && this._rectY === y && this._rectWidth === width && this._rectHeight === height && (!hasXRadius || this._cornerXRadius === cornerXRadius) && (!hasYRadius || this._cornerYRadius === cornerYRadius)) {
      return this;
    }
    this._rectX = x;
    this._rectY = y;
    this._rectWidth = width;
    this._rectHeight = height;
    this._cornerXRadius = hasXRadius ? cornerXRadius : this._cornerXRadius;
    this._cornerYRadius = hasYRadius ? cornerYRadius : this._cornerYRadius;
    const stateLen = this._drawables.length;
    for (let i = 0; i < stateLen; i++) {
      this._drawables[i].markDirtyRectangle();
    }
    this.invalidateRectangle();
    return this;
  }

  /**
   * Sets the x coordinate of the left side of this rectangle (in the local coordinate frame).
   */
  setRectX(x) {
    assert && assert(isFinite(x), 'rectX should be a finite number');
    if (this._rectX !== x) {
      this._rectX = x;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyX();
      }
      this.invalidateRectangle();
    }
    return this;
  }
  set rectX(value) {
    this.setRectX(value);
  }
  get rectX() {
    return this.getRectX();
  }

  /**
   * Returns the x coordinate of the left side of this rectangle (in the local coordinate frame).
   */
  getRectX() {
    return this._rectX;
  }

  /**
   * Sets the y coordinate of the top side of this rectangle (in the local coordinate frame).
   */
  setRectY(y) {
    assert && assert(isFinite(y), 'rectY should be a finite number');
    if (this._rectY !== y) {
      this._rectY = y;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyY();
      }
      this.invalidateRectangle();
    }
    return this;
  }
  set rectY(value) {
    this.setRectY(value);
  }
  get rectY() {
    return this.getRectY();
  }

  /**
   * Returns the y coordinate of the top side of this rectangle (in the local coordinate frame).
   */
  getRectY() {
    return this._rectY;
  }

  /**
   * Sets the width of the rectangle (in the local coordinate frame).
   */
  setRectWidth(width) {
    assert && assert(isFinite(width), 'rectWidth should be a finite number');
    if (this._rectWidth !== width) {
      this._rectWidth = width;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyWidth();
      }
      this.invalidateRectangle();
    }
    return this;
  }
  set rectWidth(value) {
    this.setRectWidth(value);
  }
  get rectWidth() {
    return this.getRectWidth();
  }

  /**
   * Returns the width of the rectangle (in the local coordinate frame).
   */
  getRectWidth() {
    return this._rectWidth;
  }

  /**
   * Sets the height of the rectangle (in the local coordinate frame).
   */
  setRectHeight(height) {
    assert && assert(isFinite(height), 'rectHeight should be a finite number');
    if (this._rectHeight !== height) {
      this._rectHeight = height;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyHeight();
      }
      this.invalidateRectangle();
    }
    return this;
  }
  set rectHeight(value) {
    this.setRectHeight(value);
  }
  get rectHeight() {
    return this.getRectHeight();
  }

  /**
   * Returns the height of the rectangle (in the local coordinate frame).
   */
  getRectHeight() {
    return this._rectHeight;
  }

  /**
   * Sets the horizontal corner radius of the rectangle (in the local coordinate frame).
   *
   * If the cornerXRadius and cornerYRadius are the same, the corners will be rounded circular arcs with that radius
   * (or a smaller radius if the rectangle is too small).
   *
   * If the cornerXRadius and cornerYRadius are different, the corners will be elliptical arcs, and the horizontal
   * radius will be equal to cornerXRadius (or a smaller radius if the rectangle is too small).
   */
  setCornerXRadius(radius) {
    assert && assert(isFinite(radius), 'cornerXRadius should be a finite number');
    if (this._cornerXRadius !== radius) {
      this._cornerXRadius = radius;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyCornerXRadius();
      }
      this.invalidateRectangle();
    }
    return this;
  }
  set cornerXRadius(value) {
    this.setCornerXRadius(value);
  }
  get cornerXRadius() {
    return this.getCornerXRadius();
  }

  /**
   * Returns the horizontal corner radius of the rectangle (in the local coordinate frame).
   */
  getCornerXRadius() {
    return this._cornerXRadius;
  }

  /**
   * Sets the vertical corner radius of the rectangle (in the local coordinate frame).
   *
   * If the cornerXRadius and cornerYRadius are the same, the corners will be rounded circular arcs with that radius
   * (or a smaller radius if the rectangle is too small).
   *
   * If the cornerXRadius and cornerYRadius are different, the corners will be elliptical arcs, and the vertical
   * radius will be equal to cornerYRadius (or a smaller radius if the rectangle is too small).
   */
  setCornerYRadius(radius) {
    assert && assert(isFinite(radius), 'cornerYRadius should be a finite number');
    if (this._cornerYRadius !== radius) {
      this._cornerYRadius = radius;
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyCornerYRadius();
      }
      this.invalidateRectangle();
    }
    return this;
  }
  set cornerYRadius(value) {
    this.setCornerYRadius(value);
  }
  get cornerYRadius() {
    return this.getCornerYRadius();
  }

  /**
   * Returns the vertical corner radius of the rectangle (in the local coordinate frame).
   */
  getCornerYRadius() {
    return this._cornerYRadius;
  }

  /**
   * Sets the Rectangle's x/y/width/height from the Bounds2 passed in.
   */
  setRectBounds(bounds) {
    this.setRect(bounds.x, bounds.y, bounds.width, bounds.height);
    return this;
  }
  set rectBounds(value) {
    this.setRectBounds(value);
  }
  get rectBounds() {
    return this.getRectBounds();
  }

  /**
   * Returns a new Bounds2 generated from this Rectangle's x/y/width/height.
   */
  getRectBounds() {
    return Bounds2.rect(this._rectX, this._rectY, this._rectWidth, this._rectHeight);
  }

  /**
   * Sets the Rectangle's width/height from the Dimension2 size passed in.
   */
  setRectSize(size) {
    this.setRectWidth(size.width);
    this.setRectHeight(size.height);
    return this;
  }
  set rectSize(value) {
    this.setRectSize(value);
  }
  get rectSize() {
    return this.getRectSize();
  }

  /**
   * Returns a new Dimension2 generated from this Rectangle's width/height.
   */
  getRectSize() {
    return new Dimension2(this._rectWidth, this._rectHeight);
  }

  /**
   * Sets the width of the rectangle while keeping its right edge (x + width) in the same position
   */
  setRectWidthFromRight(width) {
    if (this._rectWidth !== width) {
      const right = this._rectX + this._rectWidth;
      this.setRectWidth(width);
      this.setRectX(right - width);
    }
    return this;
  }
  set rectWidthFromRight(value) {
    this.setRectWidthFromRight(value);
  }
  get rectWidthFromRight() {
    return this.getRectWidth();
  } // because JSHint complains

  /**
   * Sets the height of the rectangle while keeping its bottom edge (y + height) in the same position
   */
  setRectHeightFromBottom(height) {
    if (this._rectHeight !== height) {
      const bottom = this._rectY + this._rectHeight;
      this.setRectHeight(height);
      this.setRectY(bottom - height);
    }
    return this;
  }
  set rectHeightFromBottom(value) {
    this.setRectHeightFromBottom(value);
  }
  get rectHeightFromBottom() {
    return this.getRectHeight();
  } // because JSHint complains

  /**
   * Returns whether this rectangle has any rounding applied at its corners. If either the x or y corner radius is 0,
   * then there is no rounding applied.
   */
  isRounded() {
    return this._cornerXRadius !== 0 && this._cornerYRadius !== 0;
  }

  /**
   * Computes the bounds of the Rectangle, including any applied stroke. Overridden for efficiency.
   */
  computeShapeBounds() {
    let bounds = new Bounds2(this._rectX, this._rectY, this._rectX + this._rectWidth, this._rectY + this._rectHeight);
    if (this._stroke) {
      // since we are axis-aligned, any stroke will expand our bounds by a guaranteed set amount
      bounds = bounds.dilated(this.getLineWidth() / 2);
    }
    return bounds;
  }

  /**
   * Returns a Shape that is equivalent to our rendered display. Generally used to lazily create a Shape instance
   * when one is needed, without having to do so beforehand.
   */
  createRectangleShape() {
    if (this.isRounded()) {
      // copy border-radius CSS behavior in Chrome, where the arcs won't intersect, in cases where the arc segments at full size would intersect each other
      const maximumArcSize = Math.min(this._rectWidth / 2, this._rectHeight / 2);
      return Shape.roundRectangle(this._rectX, this._rectY, this._rectWidth, this._rectHeight, Math.min(maximumArcSize, this._cornerXRadius), Math.min(maximumArcSize, this._cornerYRadius)).makeImmutable();
    } else {
      return Shape.rectangle(this._rectX, this._rectY, this._rectWidth, this._rectHeight).makeImmutable();
    }
  }

  /**
   * Notifies that the rectangle has changed, and invalidates path information and our cached shape.
   */
  invalidateRectangle() {
    assert && assert(isFinite(this._rectX), `A rectangle needs to have a finite x (${this._rectX})`);
    assert && assert(isFinite(this._rectY), `A rectangle needs to have a finite y (${this._rectY})`);
    assert && assert(this._rectWidth >= 0 && isFinite(this._rectWidth), `A rectangle needs to have a non-negative finite width (${this._rectWidth})`);
    assert && assert(this._rectHeight >= 0 && isFinite(this._rectHeight), `A rectangle needs to have a non-negative finite height (${this._rectHeight})`);
    assert && assert(this._cornerXRadius >= 0 && isFinite(this._cornerXRadius), `A rectangle needs to have a non-negative finite arcWidth (${this._cornerXRadius})`);
    assert && assert(this._cornerYRadius >= 0 && isFinite(this._cornerYRadius), `A rectangle needs to have a non-negative finite arcHeight (${this._cornerYRadius})`);

    // sets our 'cache' to null, so we don't always have to recompute our shape
    this._shape = null;

    // should invalidate the path and ensure a redraw
    this.invalidatePath();

    // since we changed the rectangle arc width/height, it could make DOM work or not
    this.invalidateSupportedRenderers();
  }
  updatePreferredSizes() {
    const width = this.localPreferredWidth;
    const height = this.localPreferredHeight;
    if (width !== null) {
      this.rectWidth = this.hasStroke() ? width - this.lineWidth : width;
    }
    if (height !== null) {
      this.rectHeight = this.hasStroke() ? height - this.lineWidth : height;
    }
  }

  // We need to detect stroke changes, since our preferred size computations depend on it.
  invalidateStroke() {
    super.invalidateStroke();
    this.updatePreferredSizes();
  }

  /**
   * Computes whether the provided point is "inside" (contained) in this Rectangle's self content, or "outside".
   *
   * Handles axis-aligned optionally-rounded rectangles, although can only do optimized computation if it isn't
   * rounded. If it IS rounded, we check if a corner computation is needed (usually isn't), and only need to check
   * one corner for that test.
   *
   * @param point - Considered to be in the local coordinate frame
   */
  containsPointSelf(point) {
    const x = this._rectX;
    const y = this._rectY;
    const width = this._rectWidth;
    const height = this._rectHeight;
    const arcWidth = this._cornerXRadius;
    const arcHeight = this._cornerYRadius;
    const halfLine = this.getLineWidth() / 2;
    let result = true;
    if (this._strokePickable) {
      // test the outer boundary if we are stroke-pickable (if also fill-pickable, this is the only test we need)
      const rounded = this.isRounded();
      if (!rounded && this.getLineJoin() === 'bevel') {
        // fall-back for bevel
        return super.containsPointSelf(point);
      }
      const miter = this.getLineJoin() === 'miter' && !rounded;
      result = result && Rectangle.intersects(x - halfLine, y - halfLine, width + 2 * halfLine, height + 2 * halfLine, miter ? 0 : arcWidth + halfLine, miter ? 0 : arcHeight + halfLine, point);
    }
    if (this._fillPickable) {
      if (this._strokePickable) {
        return result;
      } else {
        return Rectangle.intersects(x, y, width, height, arcWidth, arcHeight, point);
      }
    } else if (this._strokePickable) {
      return result && !Rectangle.intersects(x + halfLine, y + halfLine, width - 2 * halfLine, height - 2 * halfLine, arcWidth - halfLine, arcHeight - halfLine, point);
    } else {
      return false; // either fill nor stroke is pickable
    }
  }

  /**
   * Returns whether this Rectangle's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */
  intersectsBoundsSelf(bounds) {
    return !this.computeShapeBounds().intersection(bounds).isEmpty();
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
    RectangleCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
  }

  /**
   * Creates a DOM drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createDOMDrawable(renderer, instance) {
    // @ts-expect-error
    return RectangleDOMDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a SVG drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createSVGDrawable(renderer, instance) {
    // @ts-expect-error
    return RectangleSVGDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a Canvas drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createCanvasDrawable(renderer, instance) {
    // @ts-expect-error
    return RectangleCanvasDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a WebGL drawable for this Rectangle. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createWebGLDrawable(renderer, instance) {
    // @ts-expect-error
    return RectangleWebGLDrawable.createFromPool(renderer, instance);
  }

  /*---------------------------------------------------------------------------*
   * Miscellaneous
   *----------------------------------------------------------------------------*/

  /**
   * It is impossible to set another shape on this Path subtype, as its effective shape is determined by other
   * parameters.
   *
   * @param shape - Throws an error if it is not null.
   */
  setShape(shape) {
    if (shape !== null) {
      throw new Error('Cannot set the shape of a Rectangle to something non-null');
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
      this._shape = this.createRectangleShape();
    }
    return this._shape;
  }

  /**
   * Returns whether this Path has an associated Shape (instead of no shape, represented by null)
   */
  hasShape() {
    return true;
  }

  /**
   * Sets both of the corner radii to the same value, so that the rounded corners will be circular arcs.
   */
  setCornerRadius(cornerRadius) {
    this.setCornerXRadius(cornerRadius);
    this.setCornerYRadius(cornerRadius);
    return this;
  }
  set cornerRadius(value) {
    this.setCornerRadius(value);
  }
  get cornerRadius() {
    return this.getCornerRadius();
  }

  /**
   * Returns the corner radius if both the horizontal and vertical corner radii are the same.
   *
   * NOTE: If there are different horizontal and vertical corner radii, this will fail an assertion and return the horizontal radius.
   */
  getCornerRadius() {
    assert && assert(this._cornerXRadius === this._cornerYRadius, 'getCornerRadius() invalid if x/y radii are different');
    return this._cornerXRadius;
  }
  mutate(options) {
    return super.mutate(options);
  }

  /**
   * Returns whether a point is within a rounded rectangle.
   *
   * @param x - X value of the left side of the rectangle
   * @param y - Y value of the top side of the rectangle
   * @param width - Width of the rectangle
   * @param height - Height of the rectangle
   * @param arcWidth - Horizontal corner radius of the rectangle
   * @param arcHeight - Vertical corner radius of the rectangle
   * @param point - The point that may or may not be in the rounded rectangle
   */
  static intersects(x, y, width, height, arcWidth, arcHeight, point) {
    const result = point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
    if (!result || arcWidth <= 0 || arcHeight <= 0) {
      return result;
    }

    // copy border-radius CSS behavior in Chrome, where the arcs won't intersect, in cases where the arc segments at full size would intersect each other
    const maximumArcSize = Math.min(width / 2, height / 2);
    arcWidth = Math.min(maximumArcSize, arcWidth);
    arcHeight = Math.min(maximumArcSize, arcHeight);

    // we are rounded and inside the logical rectangle (if it didn't have rounded corners)

    // closest corner arc's center (we assume the rounded rectangle's arcs are 90 degrees fully, and don't intersect)
    let closestCornerX;
    let closestCornerY;
    let guaranteedInside = false;

    // if we are to the inside of the closest corner arc's center, we are guaranteed to be in the rounded rectangle (guaranteedInside)
    if (point.x < x + width / 2) {
      closestCornerX = x + arcWidth;
      guaranteedInside = guaranteedInside || point.x >= closestCornerX;
    } else {
      closestCornerX = x + width - arcWidth;
      guaranteedInside = guaranteedInside || point.x <= closestCornerX;
    }
    if (guaranteedInside) {
      return true;
    }
    if (point.y < y + height / 2) {
      closestCornerY = y + arcHeight;
      guaranteedInside = guaranteedInside || point.y >= closestCornerY;
    } else {
      closestCornerY = y + height - arcHeight;
      guaranteedInside = guaranteedInside || point.y <= closestCornerY;
    }
    if (guaranteedInside) {
      return true;
    }

    // we are now in the rectangular region between the logical corner and the center of the closest corner's arc.

    // offset from the closest corner's arc center
    let offsetX = point.x - closestCornerX;
    let offsetY = point.y - closestCornerY;

    // normalize the coordinates so now we are dealing with a unit circle
    // (technically arc, but we are guaranteed to be in the area covered by the arc, so we just consider the circle)
    // NOTE: we are rounded, so both arcWidth and arcHeight are non-zero (this is well defined)
    offsetX /= arcWidth;
    offsetY /= arcHeight;
    offsetX *= offsetX;
    offsetY *= offsetY;
    return offsetX + offsetY <= 1; // return whether we are in the rounded corner. see the formula for an ellipse
  }

  /**
   * Creates a rectangle with the specified x/y/width/height.
   *
   * See Rectangle's constructor for detailed parameter information.
   */
  static rect(x, y, width, height, options) {
    return new Rectangle(x, y, width, height, 0, 0, options);
  }

  /**
   * Creates a rounded rectangle with the specified x/y/width/height/cornerXRadius/cornerYRadius.
   *
   * See Rectangle's constructor for detailed parameter information.
   */
  static roundedRect(x, y, width, height, cornerXRadius, cornerYRadius, options) {
    return new Rectangle(x, y, width, height, cornerXRadius, cornerYRadius, options);
  }

  /**
   * Creates a rectangle x/y/width/height matching the specified bounds.
   *
   * See Rectangle's constructor for detailed parameter information.
   */
  static bounds(bounds, options) {
    return new Rectangle(bounds.minX, bounds.minY, bounds.width, bounds.height, options);
  }

  /**
   * Creates a rounded rectangle x/y/width/height matching the specified bounds (Rectangle.bounds, but with additional
   * cornerXRadius and cornerYRadius).
   *
   * See Rectangle's constructor for detailed parameter information.
   */
  static roundedBounds(bounds, cornerXRadius, cornerYRadius, options) {
    return new Rectangle(bounds.minX, bounds.minY, bounds.width, bounds.height, cornerXRadius, cornerYRadius, options);
  }

  /**
   * Creates a rectangle with top/left of (0,0) with the specified {Dimension2}'s width and height.
   *
   * See Rectangle's constructor for detailed parameter information.
   */
  static dimension(dimension, options) {
    return new Rectangle(0, 0, dimension.width, dimension.height, 0, 0, options);
  }
}

/**
 * {Array.<string>} - String keys for all the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
Rectangle.prototype._mutatorKeys = [...RECTANGLE_OPTION_KEYS, ...SuperType.prototype._mutatorKeys];

/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */
Rectangle.prototype.drawableMarkFlags = Path.prototype.drawableMarkFlags.concat(['x', 'y', 'width', 'height', 'cornerXRadius', 'cornerYRadius']).filter(flag => flag !== 'shape');
scenery.register('Rectangle', Rectangle);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlNoYXBlIiwiRmVhdHVyZXMiLCJHcmFkaWVudCIsIlBhdGgiLCJQYXR0ZXJuIiwiUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUiLCJSZWN0YW5nbGVET01EcmF3YWJsZSIsIlJlY3RhbmdsZVNWR0RyYXdhYmxlIiwiUmVjdGFuZ2xlV2ViR0xEcmF3YWJsZSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlNpemFibGUiLCJjb21iaW5lT3B0aW9ucyIsIlJFQ1RBTkdMRV9PUFRJT05fS0VZUyIsIlN1cGVyVHlwZSIsIlJlY3RhbmdsZSIsImNvbnN0cnVjdG9yIiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsImNvcm5lclhSYWRpdXMiLCJjb3JuZXJZUmFkaXVzIiwicHJvdmlkZWRPcHRpb25zIiwiaW5pdGlhbE9wdGlvbnMiLCJzaXphYmxlIiwib3B0aW9ucyIsIl9yZWN0WCIsIl9yZWN0WSIsIl9yZWN0V2lkdGgiLCJfcmVjdEhlaWdodCIsIl9jb3JuZXJYUmFkaXVzIiwiX2Nvcm5lcllSYWRpdXMiLCJhc3NlcnQiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsInJlY3RCb3VuZHMiLCJyZWN0WCIsInJlY3RZIiwicmVjdFdpZHRoIiwicmVjdEhlaWdodCIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsImxhenlMaW5rIiwidXBkYXRlUHJlZmVycmVkU2l6ZXMiLCJiaW5kIiwibG9jYWxQcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsIm11dGF0ZSIsImdldE1heGltdW1BcmNTaXplIiwiTWF0aCIsIm1pbiIsImdldFN0cm9rZVJlbmRlcmVyQml0bWFzayIsImJpdG1hc2siLCJzdHJva2UiLCJnZXRTdHJva2UiLCJoYXNMaW5lRGFzaCIsImdldExpbmVKb2luIiwiYm9yZGVyUmFkaXVzIiwiYml0bWFza0RPTSIsImhhc1N0cm9rZSIsImJpdG1hc2tXZWJHTCIsImdldFBhdGhSZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrQ2FudmFzIiwiYml0bWFza1NWRyIsIm1heGltdW1BcmNTaXplIiwiZ2V0TGluZVdpZHRoIiwiaXNSb3VuZGVkIiwic2V0UmVjdCIsImhhc1hSYWRpdXMiLCJoYXNZUmFkaXVzIiwiaXNGaW5pdGUiLCJzdGF0ZUxlbiIsIl9kcmF3YWJsZXMiLCJpIiwibWFya0RpcnR5UmVjdGFuZ2xlIiwiaW52YWxpZGF0ZVJlY3RhbmdsZSIsInNldFJlY3RYIiwibWFya0RpcnR5WCIsInZhbHVlIiwiZ2V0UmVjdFgiLCJzZXRSZWN0WSIsIm1hcmtEaXJ0eVkiLCJnZXRSZWN0WSIsInNldFJlY3RXaWR0aCIsIm1hcmtEaXJ0eVdpZHRoIiwiZ2V0UmVjdFdpZHRoIiwic2V0UmVjdEhlaWdodCIsIm1hcmtEaXJ0eUhlaWdodCIsImdldFJlY3RIZWlnaHQiLCJzZXRDb3JuZXJYUmFkaXVzIiwicmFkaXVzIiwibWFya0RpcnR5Q29ybmVyWFJhZGl1cyIsImdldENvcm5lclhSYWRpdXMiLCJzZXRDb3JuZXJZUmFkaXVzIiwibWFya0RpcnR5Q29ybmVyWVJhZGl1cyIsImdldENvcm5lcllSYWRpdXMiLCJzZXRSZWN0Qm91bmRzIiwiYm91bmRzIiwiZ2V0UmVjdEJvdW5kcyIsInJlY3QiLCJzZXRSZWN0U2l6ZSIsInNpemUiLCJyZWN0U2l6ZSIsImdldFJlY3RTaXplIiwic2V0UmVjdFdpZHRoRnJvbVJpZ2h0IiwicmlnaHQiLCJyZWN0V2lkdGhGcm9tUmlnaHQiLCJzZXRSZWN0SGVpZ2h0RnJvbUJvdHRvbSIsImJvdHRvbSIsInJlY3RIZWlnaHRGcm9tQm90dG9tIiwiY29tcHV0ZVNoYXBlQm91bmRzIiwiX3N0cm9rZSIsImRpbGF0ZWQiLCJjcmVhdGVSZWN0YW5nbGVTaGFwZSIsInJvdW5kUmVjdGFuZ2xlIiwibWFrZUltbXV0YWJsZSIsInJlY3RhbmdsZSIsIl9zaGFwZSIsImludmFsaWRhdGVQYXRoIiwiaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycyIsImxvY2FsUHJlZmVycmVkV2lkdGgiLCJsb2NhbFByZWZlcnJlZEhlaWdodCIsImxpbmVXaWR0aCIsImludmFsaWRhdGVTdHJva2UiLCJjb250YWluc1BvaW50U2VsZiIsInBvaW50IiwiYXJjV2lkdGgiLCJhcmNIZWlnaHQiLCJoYWxmTGluZSIsInJlc3VsdCIsIl9zdHJva2VQaWNrYWJsZSIsInJvdW5kZWQiLCJtaXRlciIsImludGVyc2VjdHMiLCJfZmlsbFBpY2thYmxlIiwiaW50ZXJzZWN0c0JvdW5kc1NlbGYiLCJpbnRlcnNlY3Rpb24iLCJpc0VtcHR5IiwiY2FudmFzUGFpbnRTZWxmIiwid3JhcHBlciIsIm1hdHJpeCIsInBhaW50Q2FudmFzIiwiY3JlYXRlRE9NRHJhd2FibGUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiY3JlYXRlRnJvbVBvb2wiLCJjcmVhdGVTVkdEcmF3YWJsZSIsImNyZWF0ZUNhbnZhc0RyYXdhYmxlIiwiY3JlYXRlV2ViR0xEcmF3YWJsZSIsInNldFNoYXBlIiwic2hhcGUiLCJFcnJvciIsImdldFNoYXBlIiwiaGFzU2hhcGUiLCJzZXRDb3JuZXJSYWRpdXMiLCJjb3JuZXJSYWRpdXMiLCJnZXRDb3JuZXJSYWRpdXMiLCJjbG9zZXN0Q29ybmVyWCIsImNsb3Nlc3RDb3JuZXJZIiwiZ3VhcmFudGVlZEluc2lkZSIsIm9mZnNldFgiLCJvZmZzZXRZIiwicm91bmRlZFJlY3QiLCJtaW5YIiwibWluWSIsInJvdW5kZWRCb3VuZHMiLCJkaW1lbnNpb24iLCJfbXV0YXRvcktleXMiLCJkcmF3YWJsZU1hcmtGbGFncyIsImNvbmNhdCIsImZpbHRlciIsImZsYWciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlY3RhbmdsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHJlY3Rhbmd1bGFyIG5vZGUgdGhhdCBpbmhlcml0cyBQYXRoLCBhbmQgYWxsb3dzIGZvciBvcHRpbWl6ZWQgZHJhd2luZyBhbmQgaW1wcm92ZWQgcmVjdGFuZ2xlIGhhbmRsaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBDYW52YXNTZWxmRHJhd2FibGUsIERPTVNlbGZEcmF3YWJsZSwgRmVhdHVyZXMsIEdyYWRpZW50LCBJbnN0YW5jZSwgVFJlY3RhbmdsZURyYXdhYmxlLCBQYXRoLCBQYXRoT3B0aW9ucywgUGF0dGVybiwgUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUsIFJlY3RhbmdsZURPTURyYXdhYmxlLCBSZWN0YW5nbGVTVkdEcmF3YWJsZSwgUmVjdGFuZ2xlV2ViR0xEcmF3YWJsZSwgUmVuZGVyZXIsIHNjZW5lcnksIFNpemFibGUsIFNpemFibGVPcHRpb25zLCBTVkdTZWxmRHJhd2FibGUsIFdlYkdMU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbmNvbnN0IFJFQ1RBTkdMRV9PUFRJT05fS0VZUyA9IFtcclxuICAncmVjdEJvdW5kcycsIC8vIHtCb3VuZHMyfSAtIFNldHMgeC95L3dpZHRoL2hlaWdodCBiYXNlZCBvbiBib3VuZHMuIFNlZSBzZXRSZWN0Qm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICAncmVjdFNpemUnLCAvLyB7RGltZW5zaW9uMn0gLSBTZXRzIHdpZHRoL2hlaWdodCBiYXNlZCBvbiBkaW1lbnNpb24uIFNlZSBzZXRSZWN0U2l6ZSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgJ3JlY3RYJywgLy8ge251bWJlcn0gLSBTZXRzIHguIFNlZSBzZXRSZWN0WCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgJ3JlY3RZJywgLy8ge251bWJlcn0gLSBTZXRzIHkuIFNlZSBzZXRSZWN0WSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgJ3JlY3RXaWR0aCcsIC8vIHtudW1iZXJ9IC0gU2V0cyB3aWR0aC4gU2VlIHNldFJlY3RXaWR0aCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgJ3JlY3RIZWlnaHQnLCAvLyBTZXRzIGhlaWdodC4gU2VlIHNldFJlY3RIZWlnaHQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxyXG4gICdjb3JuZXJSYWRpdXMnLCAvLyB7bnVtYmVyfSAtIFNldHMgY29ybmVyIHJhZGlpLiBTZWUgc2V0Q29ybmVyUmFkaXVzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICAnY29ybmVyWFJhZGl1cycsIC8vIHtudW1iZXJ9IC0gU2V0cyBob3Jpem9udGFsIGNvcm5lciByYWRpdXMuIFNlZSBzZXRDb3JuZXJYUmFkaXVzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICAnY29ybmVyWVJhZGl1cycgLy8ge251bWJlcn0gLSBTZXRzIHZlcnRpY2FsIGNvcm5lciByYWRpdXMuIFNlZSBzZXRDb3JuZXJZUmFkaXVzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuXTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcmVjdEJvdW5kcz86IEJvdW5kczI7XHJcbiAgcmVjdFNpemU/OiBEaW1lbnNpb24yO1xyXG4gIHJlY3RYPzogbnVtYmVyO1xyXG4gIHJlY3RZPzogbnVtYmVyO1xyXG4gIHJlY3RXaWR0aD86IG51bWJlcjtcclxuICByZWN0SGVpZ2h0PzogbnVtYmVyO1xyXG4gIGNvcm5lclJhZGl1cz86IG51bWJlcjtcclxuICBjb3JuZXJYUmFkaXVzPzogbnVtYmVyO1xyXG4gIGNvcm5lcllSYWRpdXM/OiBudW1iZXI7XHJcbn07XHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFNpemFibGVPcHRpb25zICYgUGF0aE9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIFJlY3RhbmdsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UGFyZW50T3B0aW9ucywgJ3NoYXBlJz47XHJcblxyXG5jb25zdCBTdXBlclR5cGUgPSBTaXphYmxlKCBQYXRoICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTdXBlclR5cGUge1xyXG4gIC8vIFggdmFsdWUgb2YgdGhlIGxlZnQgc2lkZSBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9yZWN0WDogbnVtYmVyO1xyXG5cclxuICAvLyBZIHZhbHVlIG9mIHRoZSB0b3Agc2lkZSBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9yZWN0WTogbnVtYmVyO1xyXG5cclxuICAvLyBXaWR0aCBvZiB0aGUgcmVjdGFuZ2xlXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9yZWN0V2lkdGg6IG51bWJlcjtcclxuXHJcbiAgLy8gSGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVcclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX3JlY3RIZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgLy8gWCByYWRpdXMgb2Ygcm91bmRlZCBjb3JuZXJzXHJcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgcHVibGljIF9jb3JuZXJYUmFkaXVzOiBudW1iZXI7XHJcblxyXG4gIC8vIFkgcmFkaXVzIG9mIHJvdW5kZWQgY29ybmVyc1xyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxyXG4gIHB1YmxpYyBfY29ybmVyWVJhZGl1czogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKlxyXG4gICAqIFBvc3NpYmxlIGNvbnN0cnVjdG9yIHNpZ25hdHVyZXNcclxuICAgKiBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCBbb3B0aW9uc10gKVxyXG4gICAqIG5ldyBSZWN0YW5nbGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIFtvcHRpb25zXSApXHJcbiAgICogbmV3IFJlY3RhbmdsZSggW29wdGlvbnNdIClcclxuICAgKiBuZXcgUmVjdGFuZ2xlKCBib3VuZHMyLCBbb3B0aW9uc10gKVxyXG4gICAqIG5ldyBSZWN0YW5nbGUoIGJvdW5kczIsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIFtvcHRpb25zXSApXHJcbiAgICpcclxuICAgKiBDdXJyZW50IGF2YWlsYWJsZSBvcHRpb25zIGZvciB0aGUgb3B0aW9ucyBvYmplY3QgKGN1c3RvbSBmb3IgUmVjdGFuZ2xlLCBub3QgUGF0aCBvciBOb2RlKTpcclxuICAgKiByZWN0WCAtIExlZnQgZWRnZSBvZiB0aGUgcmVjdGFuZ2xlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogcmVjdFkgLSBUb3AgZWRnZSBvZiB0aGUgcmVjdGFuZ2xlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICogcmVjdFdpZHRoIC0gV2lkdGggb2YgdGhlIHJlY3RhbmdsZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAqIHJlY3RIZWlnaHQgLSBIZWlnaHQgb2YgdGhlIHJlY3RhbmdsZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAqIGNvcm5lclhSYWRpdXMgLSBUaGUgeC1heGlzIHJhZGl1cyBmb3IgZWxsaXB0aWNhbC9jaXJjdWxhciByb3VuZGVkIGNvcm5lcnMuXHJcbiAgICogY29ybmVyWVJhZGl1cyAtIFRoZSB5LWF4aXMgcmFkaXVzIGZvciBlbGxpcHRpY2FsL2NpcmN1bGFyIHJvdW5kZWQgY29ybmVycy5cclxuICAgKiBjb3JuZXJSYWRpdXMgLSBTZXRzIGJvdGggXCJYXCIgYW5kIFwiWVwiIGNvcm5lciByYWRpaSBhYm92ZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IHRoZSBYIGFuZCBZIGNvcm5lciByYWRpaSBuZWVkIHRvIGJvdGggYmUgZ3JlYXRlciB0aGFuIHplcm8gZm9yIHJvdW5kZWQgY29ybmVycyB0byBhcHBlYXIuIElmIHRoZXkgaGF2ZSB0aGVcclxuICAgKiBzYW1lIG5vbi16ZXJvIHZhbHVlLCBjaXJjdWxhciByb3VuZGVkIGNvcm5lcnMgd2lsbCBiZSB1c2VkLlxyXG4gICAqXHJcbiAgICogQXZhaWxhYmxlIHBhcmFtZXRlcnMgdG8gdGhlIHZhcmlvdXMgY29uc3RydWN0b3Igb3B0aW9uczpcclxuICAgKiBAcGFyYW0geCAtIHgtcG9zaXRpb24gb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyIChsZWZ0IGJvdW5kKVxyXG4gICAqIEBwYXJhbSBbeV0gLSB5LXBvc2l0aW9uIG9mIHRoZSB1cHBlci1sZWZ0IGNvcm5lciAodG9wIGJvdW5kKVxyXG4gICAqIEBwYXJhbSBbd2lkdGhdIC0gd2lkdGggb2YgdGhlIHJlY3RhbmdsZSB0byB0aGUgcmlnaHQgb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyLCByZXF1aXJlZCB0byBiZSA+PSAwXHJcbiAgICogQHBhcmFtIFtoZWlnaHRdIC0gaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUgYmVsb3cgdGhlIHVwcGVyLWxlZnQgY29ybmVyLCByZXF1aXJlZCB0byBiZSA+PSAwXHJcbiAgICogQHBhcmFtIFtjb3JuZXJYUmFkaXVzXSAtIHBvc2l0aXZlIHZlcnRpY2FsIHJhZGl1cyAod2lkdGgpIG9mIHRoZSByb3VuZGVkIGNvcm5lciwgb3IgMCB0byBpbmRpY2F0ZSB0aGUgY29ybmVyIHNob3VsZCBiZSBzaGFycFxyXG4gICAqIEBwYXJhbSBbY29ybmVyWVJhZGl1c10gLSBwb3NpdGl2ZSBob3Jpem9udGFsIHJhZGl1cyAoaGVpZ2h0KSBvZiB0aGUgcm91bmRlZCBjb3JuZXIsIG9yIDAgdG8gaW5kaWNhdGUgdGhlIGNvcm5lciBzaG91bGQgYmUgc2hhcnBcclxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gUmVjdGFuZ2xlLXNwZWNpZmljIG9wdGlvbnMgYXJlIGRvY3VtZW50ZWQgaW4gUkVDVEFOR0xFX09QVElPTl9LRVlTIGFib3ZlLCBhbmQgY2FuIGJlIHByb3ZpZGVkXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsb25nLXNpZGUgb3B0aW9ucyBmb3IgTm9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKTtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJvdW5kczogQm91bmRzMiwgb3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKTtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJvdW5kczogQm91bmRzMiwgY29ybmVyUmFkaXVzWDogbnVtYmVyLCBjb3JuZXJSYWRpdXNZOiBudW1iZXIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNvcm5lclhSYWRpdXM6IG51bWJlciwgY29ybmVyWVJhZGl1czogbnVtYmVyLCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApO1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeD86IG51bWJlciB8IEJvdW5kczIgfCBSZWN0YW5nbGVPcHRpb25zLCB5PzogbnVtYmVyIHwgUmVjdGFuZ2xlT3B0aW9ucywgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciB8IFJlY3RhbmdsZU9wdGlvbnMsIGNvcm5lclhSYWRpdXM/OiBudW1iZXIgfCBSZWN0YW5nbGVPcHRpb25zLCBjb3JuZXJZUmFkaXVzPzogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICkge1xyXG5cclxuICAgIC8vIFdlJ2xsIHdhbnQgdG8gZGVmYXVsdCB0byBzaXphYmxlOmZhbHNlLCBidXQgYWxsb3cgY2xpZW50cyB0byBwYXNzIGluIHNvbWV0aGluZyBjb25mbGljdGluZyBsaWtlIHdpZHRoU2l6YWJsZTp0cnVlXHJcbiAgICAvLyBpbiB0aGUgc3VwZXIgbXV0YXRlLiBUbyBhdm9pZCB0aGUgZXhjbHVzaXZlIG9wdGlvbnMsIHdlIGlzb2xhdGUgdGhpcyBvdXQgaGVyZS5cclxuICAgIGNvbnN0IGluaXRpYWxPcHRpb25zOiBSZWN0YW5nbGVPcHRpb25zID0ge1xyXG4gICAgICBzaXphYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuICAgIHN1cGVyKCBudWxsLCBpbml0aWFsT3B0aW9ucyApO1xyXG5cclxuICAgIGxldCBvcHRpb25zOiBSZWN0YW5nbGVPcHRpb25zID0ge307XHJcblxyXG4gICAgdGhpcy5fcmVjdFggPSAwO1xyXG4gICAgdGhpcy5fcmVjdFkgPSAwO1xyXG4gICAgdGhpcy5fcmVjdFdpZHRoID0gMDtcclxuICAgIHRoaXMuX3JlY3RIZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5fY29ybmVyWFJhZGl1cyA9IDA7XHJcbiAgICB0aGlzLl9jb3JuZXJZUmFkaXVzID0gMDtcclxuXHJcbiAgICBpZiAoIHR5cGVvZiB4ID09PSAnb2JqZWN0JyApIHtcclxuICAgICAgLy8gYWxsb3cgbmV3IFJlY3RhbmdsZSggYm91bmRzMiwgeyAuLi4gfSApIG9yIG5ldyBSZWN0YW5nbGUoIGJvdW5kczIsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIHsgLi4uIH0gKVxyXG4gICAgICBpZiAoIHggaW5zdGFuY2VvZiBCb3VuZHMyICkge1xyXG4gICAgICAgIC8vIG5ldyBSZWN0YW5nbGUoIGJvdW5kczIsIHsgLi4uIH0gKVxyXG4gICAgICAgIGlmICggdHlwZW9mIHkgIT09ICdudW1iZXInICkge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyLFxyXG4gICAgICAgICAgICAnbmV3IFJlY3RhbmdsZSggYm91bmRzLCB7IC4uLiB9ICkgc2hvdWxkIG9ubHkgdGFrZSBvbmUgb3IgdHdvIGFyZ3VtZW50cycgKTtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHkgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeSA9PT0gJ29iamVjdCcsXHJcbiAgICAgICAgICAgICduZXcgUmVjdGFuZ2xlKCBib3VuZHMsIHsgLi4uIH0gKSBzZWNvbmQgcGFyYW1ldGVyIHNob3VsZCBvbmx5IGV2ZXIgYmUgYW4gb3B0aW9ucyBvYmplY3QnICk7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCB5ICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XHJcblxyXG4gICAgICAgICAgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCBvcHRpb25zLCB7XHJcbiAgICAgICAgICAgIHJlY3RCb3VuZHM6IHhcclxuICAgICAgICAgIH0sIHkgKTsgLy8gT3VyIG9wdGlvbnMgb2JqZWN0IHdvdWxkIGJlIGF0IHlcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gUmVjdGFuZ2xlKCBib3VuZHMyLCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCB7IC4uLiB9IClcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZ3VtZW50cy5sZW5ndGggPT09IDMgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gNCxcclxuICAgICAgICAgICAgJ25ldyBSZWN0YW5nbGUoIGJvdW5kcywgY29ybmVyWFJhZGl1cywgY29ybmVyWVJhZGl1cywgeyAuLi4gfSApIHNob3VsZCBvbmx5IHRha2UgdGhyZWUgb3IgZm91ciBhcmd1bWVudHMnICk7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgaGVpZ2h0ID09PSAnb2JqZWN0JyxcclxuICAgICAgICAgICAgJ25ldyBSZWN0YW5nbGUoIGJvdW5kcywgY29ybmVyWFJhZGl1cywgY29ybmVyWVJhZGl1cywgeyAuLi4gfSApIGZvdXJ0aCBwYXJhbWV0ZXIgc2hvdWxkIG9ubHkgZXZlciBiZSBhbiBvcHRpb25zIG9iamVjdCcgKTtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGhlaWdodCA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZiggaGVpZ2h0ICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICAgICAgICdFeHRyYSBwcm90b3R5cGUgb24gTm9kZSBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XHJcblxyXG4gICAgICAgICAgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCBvcHRpb25zLCB7XHJcbiAgICAgICAgICAgIHJlY3RCb3VuZHM6IHgsXHJcbiAgICAgICAgICAgIGNvcm5lclhSYWRpdXM6IHksIC8vIGlnbm9yZSBJbnRlbGxpaiB3YXJuaW5nLCBvdXIgY29ybmVyWFJhZGl1cyBpcyB0aGUgc2Vjb25kIHBhcmFtZXRlclxyXG4gICAgICAgICAgICBjb3JuZXJZUmFkaXVzOiB3aWR0aCAvLyBpZ25vcmUgSW50ZWxsaWogd2FybmluZywgb3VyIGNvcm5lcllSYWRpdXMgaXMgdGhlIHRoaXJkIHBhcmFtZXRlclxyXG4gICAgICAgICAgfSwgaGVpZ2h0IGFzIFJlY3RhbmdsZU9wdGlvbnMgfCB1bmRlZmluZWQgKTsgLy8gT3VyIG9wdGlvbnMgb2JqZWN0IHdvdWxkIGJlIGF0IGhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBhbGxvdyBuZXcgUmVjdGFuZ2xlKCB7IHJlY3RYOiB4LCByZWN0WTogeSwgcmVjdFdpZHRoOiB3aWR0aCwgcmVjdEhlaWdodDogaGVpZ2h0LCAuLi4gfSApXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxSZWN0YW5nbGVPcHRpb25zPiggb3B0aW9ucywgeCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB7IC4uLiB9IClcclxuICAgIGVsc2UgaWYgKCBjb3JuZXJZUmFkaXVzID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZ3VtZW50cy5sZW5ndGggPT09IDQgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gNSxcclxuICAgICAgICAnbmV3IFJlY3RhbmdsZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgeyAuLi4gfSApIHNob3VsZCBvbmx5IHRha2UgZm91ciBvciBmaXZlIGFyZ3VtZW50cycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY29ybmVyWFJhZGl1cyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBjb3JuZXJYUmFkaXVzID09PSAnb2JqZWN0JyxcclxuICAgICAgICAnbmV3IFJlY3RhbmdsZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgeyAuLi4gfSApIGZpZnRoIHBhcmFtZXRlciBzaG91bGQgb25seSBldmVyIGJlIGFuIG9wdGlvbnMgb2JqZWN0JyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3JuZXJYUmFkaXVzID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBjb3JuZXJYUmFkaXVzICkgPT09IE9iamVjdC5wcm90b3R5cGUsXHJcbiAgICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBOb2RlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcclxuXHJcbiAgICAgIG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxSZWN0YW5nbGVPcHRpb25zPiggb3B0aW9ucywge1xyXG4gICAgICAgIHJlY3RYOiB4LFxyXG4gICAgICAgIHJlY3RZOiB5IGFzIG51bWJlcixcclxuICAgICAgICByZWN0V2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIHJlY3RIZWlnaHQ6IGhlaWdodCBhcyBudW1iZXJcclxuICAgICAgfSwgY29ybmVyWFJhZGl1cyBhcyBSZWN0YW5nbGVPcHRpb25zICk7XHJcbiAgICB9XHJcbiAgICAvLyBuZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzLCB7IC4uLiB9IClcclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSA2IHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDcsXHJcbiAgICAgICAgJ25ldyBSZWN0YW5nbGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXN7IC4uLiB9ICkgc2hvdWxkIG9ubHkgdGFrZSBzaXggb3Igc2V2ZW4gYXJndW1lbnRzJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnLFxyXG4gICAgICAgICduZXcgUmVjdGFuZ2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjb3JuZXJYUmFkaXVzLCBjb3JuZXJZUmFkaXVzeyAuLi4gfSApIHNldmVudGggcGFyYW1ldGVyIHNob3VsZCBvbmx5IGV2ZXIgYmUgYW4gb3B0aW9ucyBvYmplY3QnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcclxuICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIE5vZGUgb3B0aW9ucyBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xyXG5cclxuICAgICAgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFJlY3RhbmdsZU9wdGlvbnM+KCBvcHRpb25zLCB7XHJcbiAgICAgICAgcmVjdFg6IHgsXHJcbiAgICAgICAgcmVjdFk6IHkgYXMgbnVtYmVyLFxyXG4gICAgICAgIHJlY3RXaWR0aDogd2lkdGgsXHJcbiAgICAgICAgcmVjdEhlaWdodDogaGVpZ2h0IGFzIG51bWJlcixcclxuICAgICAgICBjb3JuZXJYUmFkaXVzOiBjb3JuZXJYUmFkaXVzIGFzIG51bWJlcixcclxuICAgICAgICBjb3JuZXJZUmFkaXVzOiBjb3JuZXJZUmFkaXVzXHJcbiAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnVwZGF0ZVByZWZlcnJlZFNpemVzLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgdGhpcy5sb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnVwZGF0ZVByZWZlcnJlZFNpemVzLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB0aGUgbWF4aW11bSBhcmMgc2l6ZSB0aGF0IGNhbiBiZSBhY2NvbW1vZGF0ZWQgYnkgdGhlIGN1cnJlbnQgd2lkdGggYW5kIGhlaWdodC5cclxuICAgKlxyXG4gICAqIElmIHRoZSBjb3JuZXIgcmFkaWkgYXJlIHRoZSBzYW1lIGFzIHRoZSBtYXhpbXVtIGFyYyBzaXplIG9uIGEgc3F1YXJlLCBpdCB3aWxsIGFwcGVhciB0byBiZSBhIGNpcmNsZSAodGhlIGFyY3NcclxuICAgKiB0YWtlIHVwIGFsbCBvZiB0aGUgcm9vbSwgYW5kIGxlYXZlIG5vIHN0cmFpZ2h0IHNlZ21lbnRzKS4gSW4gdGhlIGNhc2Ugb2YgYSBub24tc3F1YXJlLCBvbmUgZGlyZWN0aW9uIG9mIGVkZ2VzXHJcbiAgICogd2lsbCBleGlzdCAoZS5nLiB0b3AvYm90dG9tIG9yIGxlZnQvcmlnaHQpLCB3aGlsZSB0aGUgb3RoZXIgZWRnZXMgd291bGQgYmUgZnVsbHkgcm91bmRlZC5cclxuICAgKi9cclxuICBwcml2YXRlIGdldE1heGltdW1BcmNTaXplKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5taW4oIHRoaXMuX3JlY3RXaWR0aCAvIDIsIHRoaXMuX3JlY3RIZWlnaHQgLyAyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHRoZSBkZWZhdWx0IGFsbG93ZWQgcmVuZGVyZXJzIChyZXR1cm5lZCB2aWEgdGhlIFJlbmRlcmVyIGJpdG1hc2spIHRoYXQgYXJlIGFsbG93ZWQsIGdpdmVuIHRoZVxyXG4gICAqIGN1cnJlbnQgc3Ryb2tlIG9wdGlvbnMuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogV2UgY2FuIHN1cHBvcnQgdGhlIERPTSByZW5kZXJlciBpZiB0aGVyZSBpcyBhIHNvbGlkLXN0eWxlZCBzdHJva2Ugd2l0aCBub24tYmV2ZWwgbGluZSBqb2luc1xyXG4gICAqICh3aGljaCBvdGhlcndpc2Ugd291bGRuJ3QgYmUgc3VwcG9ydGVkKS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gUmVuZGVyZXIgYml0bWFzaywgc2VlIFJlbmRlcmVyIGZvciBkZXRhaWxzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFN0cm9rZVJlbmRlcmVyQml0bWFzaygpOiBudW1iZXIge1xyXG4gICAgbGV0IGJpdG1hc2sgPSBzdXBlci5nZXRTdHJva2VSZW5kZXJlckJpdG1hc2soKTtcclxuICAgIGNvbnN0IHN0cm9rZSA9IHRoaXMuZ2V0U3Ryb2tlKCk7XHJcbiAgICAvLyBET00gc3Ryb2tlIGhhbmRsaW5nIGRvZXNuJ3QgWUVUIHN1cHBvcnQgZ3JhZGllbnRzLCBwYXR0ZXJucywgb3IgZGFzaGVzICh3aXRoIHRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uLCBpdCBzaG91bGRuJ3QgYmUgdG9vIGhhcmQpXHJcbiAgICBpZiAoIHN0cm9rZSAmJiAhKCBzdHJva2UgaW5zdGFuY2VvZiBHcmFkaWVudCApICYmICEoIHN0cm9rZSBpbnN0YW5jZW9mIFBhdHRlcm4gKSAmJiAhdGhpcy5oYXNMaW5lRGFzaCgpICkge1xyXG4gICAgICAvLyB3ZSBjYW4ndCBzdXBwb3J0IHRoZSBiZXZlbCBsaW5lLWpvaW4gd2l0aCBvdXIgY3VycmVudCBET00gcmVjdGFuZ2xlIGRpc3BsYXlcclxuICAgICAgaWYgKCB0aGlzLmdldExpbmVKb2luKCkgPT09ICdtaXRlcicgfHwgKCB0aGlzLmdldExpbmVKb2luKCkgPT09ICdyb3VuZCcgJiYgRmVhdHVyZXMuYm9yZGVyUmFkaXVzICkgKSB7XHJcbiAgICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrRE9NO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhdGhpcy5oYXNTdHJva2UoKSApIHtcclxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJpdG1hc2s7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHRoZSBhbGxvd2VkIHJlbmRlcmVycyB0aGF0IGFyZSBhbGxvd2VkIChvciBleGNsdWRlZCkgYmFzZWQgb24gdGhlIGN1cnJlbnQgUGF0aC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlciBmb3IgZGV0YWlsc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRQYXRoUmVuZGVyZXJCaXRtYXNrKCk6IG51bWJlciB7XHJcbiAgICBsZXQgYml0bWFzayA9IFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgfCBSZW5kZXJlci5iaXRtYXNrU1ZHO1xyXG5cclxuICAgIGNvbnN0IG1heGltdW1BcmNTaXplID0gdGhpcy5nZXRNYXhpbXVtQXJjU2l6ZSgpO1xyXG5cclxuICAgIC8vIElmIHRoZSB0b3AvYm90dG9tIG9yIGxlZnQvcmlnaHQgc3Ryb2tlcyB0b3VjaCBhbmQgb3ZlcmxhcCBpbiB0aGUgbWlkZGxlIChzbWFsbCByZWN0YW5nbGUsIGJpZyBzdHJva2UpLCBvdXIgRE9NIG1ldGhvZCB3b24ndCB3b3JrLlxyXG4gICAgLy8gQWRkaXRpb25hbGx5LCBpZiB3ZSdyZSBoYW5kbGluZyByb3VuZGVkIHJlY3RhbmdsZXMgb3IgYSBzdHJva2Ugd2l0aCBsaW5lSm9pbiAncm91bmQnLCB3ZSdsbCBuZWVkIGJvcmRlclJhZGl1c1xyXG4gICAgLy8gV2UgYWxzbyByZXF1aXJlIGZvciBET00gdGhhdCBpZiBpdCdzIGEgcm91bmRlZCByZWN0YW5nbGUsIGl0J3Mgcm91bmRlZCB3aXRoIGNpcmN1bGFyIGFyY3MgKGZvciBub3csIGNvdWxkIHBvdGVudGlhbGx5IGRvIGEgdHJhbnNmb3JtIHRyaWNrISlcclxuICAgIGlmICggKCAhdGhpcy5oYXNTdHJva2UoKSB8fCAoIHRoaXMuZ2V0TGluZVdpZHRoKCkgPD0gdGhpcy5fcmVjdEhlaWdodCAmJiB0aGlzLmdldExpbmVXaWR0aCgpIDw9IHRoaXMuX3JlY3RXaWR0aCApICkgJiZcclxuICAgICAgICAgKCAhdGhpcy5pc1JvdW5kZWQoKSB8fCAoIEZlYXR1cmVzLmJvcmRlclJhZGl1cyAmJiB0aGlzLl9jb3JuZXJYUmFkaXVzID09PSB0aGlzLl9jb3JuZXJZUmFkaXVzICkgKSAmJlxyXG4gICAgICAgICB0aGlzLl9jb3JuZXJZUmFkaXVzIDw9IG1heGltdW1BcmNTaXplICYmIHRoaXMuX2Nvcm5lclhSYWRpdXMgPD0gbWF4aW11bUFyY1NpemUgKSB7XHJcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza0RPTTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiB3aHkgY2hlY2sgaGVyZSwgaWYgd2UgYWxzbyBjaGVjayBpbiB0aGUgJ3N0cm9rZScgcG9ydGlvbj9cclxuICAgIGlmICggIXRoaXMuaGFzU3Ryb2tlKCkgJiYgIXRoaXMuaXNSb3VuZGVkKCkgKSB7XHJcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1dlYkdMO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBiaXRtYXNrO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbGwgb2YgdGhlIHNoYXBlLWRldGVybWluaW5nIHBhcmFtZXRlcnMgZm9yIHRoZSByZWN0YW5nbGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geCAtIFRoZSB4LXBvc2l0aW9uIG9mIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJlY3RhbmdsZS5cclxuICAgKiBAcGFyYW0geSAtIFRoZSB5LXBvc2l0aW9uIG9mIHRoZSB0b3Agc2lkZSBvZiB0aGUgcmVjdGFuZ2xlLlxyXG4gICAqIEBwYXJhbSB3aWR0aCAtIFRoZSB3aWR0aCBvZiB0aGUgcmVjdGFuZ2xlLlxyXG4gICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUuXHJcbiAgICogQHBhcmFtIFtjb3JuZXJYUmFkaXVzXSAtIFRoZSBob3Jpem9udGFsIHJhZGl1cyBvZiBjdXJ2ZWQgY29ybmVycyAoMCBmb3Igc2hhcnAgY29ybmVycylcclxuICAgKiBAcGFyYW0gW2Nvcm5lcllSYWRpdXNdIC0gVGhlIHZlcnRpY2FsIHJhZGl1cyBvZiBjdXJ2ZWQgY29ybmVycyAoMCBmb3Igc2hhcnAgY29ybmVycylcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmVjdCggeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjb3JuZXJYUmFkaXVzPzogbnVtYmVyLCBjb3JuZXJZUmFkaXVzPzogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgY29uc3QgaGFzWFJhZGl1cyA9IGNvcm5lclhSYWRpdXMgIT09IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IGhhc1lSYWRpdXMgPSBjb3JuZXJZUmFkaXVzICE9PSB1bmRlZmluZWQ7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSAmJiBpc0Zpbml0ZSggeSApICYmXHJcbiAgICBpc0Zpbml0ZSggd2lkdGggKSAmJiBpc0Zpbml0ZSggaGVpZ2h0ICksICd4L3kvd2lkdGgvaGVpZ2h0IHNob3VsZCBiZSBmaW5pdGUgbnVtYmVycycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFoYXNYUmFkaXVzIHx8IGlzRmluaXRlKCBjb3JuZXJYUmFkaXVzICkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICggIWhhc1lSYWRpdXMgfHwgaXNGaW5pdGUoIGNvcm5lcllSYWRpdXMgKSApLFxyXG4gICAgICAnQ29ybmVyIHJhZGlpIChpZiBwcm92aWRlZCkgc2hvdWxkIGJlIGZpbml0ZSBudW1iZXJzJyApO1xyXG5cclxuICAgIC8vIElmIHRoaXMgZG9lc24ndCBjaGFuZ2UgdGhlIHJlY3RhbmdsZSwgZG9uJ3Qgbm90aWZ5IGFib3V0IGNoYW5nZXMuXHJcbiAgICBpZiAoIHRoaXMuX3JlY3RYID09PSB4ICYmXHJcbiAgICAgICAgIHRoaXMuX3JlY3RZID09PSB5ICYmXHJcbiAgICAgICAgIHRoaXMuX3JlY3RXaWR0aCA9PT0gd2lkdGggJiZcclxuICAgICAgICAgdGhpcy5fcmVjdEhlaWdodCA9PT0gaGVpZ2h0ICYmXHJcbiAgICAgICAgICggIWhhc1hSYWRpdXMgfHwgdGhpcy5fY29ybmVyWFJhZGl1cyA9PT0gY29ybmVyWFJhZGl1cyApICYmXHJcbiAgICAgICAgICggIWhhc1lSYWRpdXMgfHwgdGhpcy5fY29ybmVyWVJhZGl1cyA9PT0gY29ybmVyWVJhZGl1cyApICkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZWN0WCA9IHg7XHJcbiAgICB0aGlzLl9yZWN0WSA9IHk7XHJcbiAgICB0aGlzLl9yZWN0V2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuX3JlY3RIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLl9jb3JuZXJYUmFkaXVzID0gaGFzWFJhZGl1cyA/IGNvcm5lclhSYWRpdXMgOiB0aGlzLl9jb3JuZXJYUmFkaXVzO1xyXG4gICAgdGhpcy5fY29ybmVyWVJhZGl1cyA9IGhhc1lSYWRpdXMgPyBjb3JuZXJZUmFkaXVzIDogdGhpcy5fY29ybmVyWVJhZGl1cztcclxuXHJcbiAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFJlY3RhbmdsZURyYXdhYmxlICkubWFya0RpcnR5UmVjdGFuZ2xlKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmludmFsaWRhdGVSZWN0YW5nbGUoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoaXMgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFJlY3RYKCB4OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAncmVjdFggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3JlY3RYICE9PSB4ICkge1xyXG4gICAgICB0aGlzLl9yZWN0WCA9IHg7XHJcblxyXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRSZWN0YW5nbGVEcmF3YWJsZSApLm1hcmtEaXJ0eVgoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUmVjdGFuZ2xlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcmVjdFgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdFgoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0WCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSZWN0WCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoaXMgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJlY3RYKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVjdFg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIHRvcCBzaWRlIG9mIHRoaXMgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFJlY3RZKCB5OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCAncmVjdFkgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3JlY3RZICE9PSB5ICkge1xyXG4gICAgICB0aGlzLl9yZWN0WSA9IHk7XHJcblxyXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRSZWN0YW5nbGVEcmF3YWJsZSApLm1hcmtEaXJ0eVkoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUmVjdGFuZ2xlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcmVjdFkoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdFkoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0WSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSZWN0WSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIHNpZGUgb2YgdGhpcyByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmVjdFkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9yZWN0WTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmVjdFdpZHRoKCB3aWR0aDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHdpZHRoICksICdyZWN0V2lkdGggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3JlY3RXaWR0aCAhPT0gd2lkdGggKSB7XHJcbiAgICAgIHRoaXMuX3JlY3RXaWR0aCA9IHdpZHRoO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUmVjdGFuZ2xlRHJhd2FibGUgKS5tYXJrRGlydHlXaWR0aCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVSZWN0YW5nbGUoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCByZWN0V2lkdGgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdFdpZHRoKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcmVjdFdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJlY3RXaWR0aCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmVjdFdpZHRoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVjdFdpZHRoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmVjdEhlaWdodCggaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaGVpZ2h0ICksICdyZWN0SGVpZ2h0IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9yZWN0SGVpZ2h0ICE9PSBoZWlnaHQgKSB7XHJcbiAgICAgIHRoaXMuX3JlY3RIZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0YXRlTGVuOyBpKysgKSB7XHJcbiAgICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRSZWN0YW5nbGVEcmF3YWJsZSApLm1hcmtEaXJ0eUhlaWdodCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVSZWN0YW5nbGUoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCByZWN0SGVpZ2h0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJlY3RIZWlnaHQoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0SGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJlY3RIZWlnaHQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIHJlY3RhbmdsZSAoaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSZWN0SGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVjdEhlaWdodDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGhvcml6b250YWwgY29ybmVyIHJhZGl1cyBvZiB0aGUgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgY29ybmVyWFJhZGl1cyBhbmQgY29ybmVyWVJhZGl1cyBhcmUgdGhlIHNhbWUsIHRoZSBjb3JuZXJzIHdpbGwgYmUgcm91bmRlZCBjaXJjdWxhciBhcmNzIHdpdGggdGhhdCByYWRpdXNcclxuICAgKiAob3IgYSBzbWFsbGVyIHJhZGl1cyBpZiB0aGUgcmVjdGFuZ2xlIGlzIHRvbyBzbWFsbCkuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgY29ybmVyWFJhZGl1cyBhbmQgY29ybmVyWVJhZGl1cyBhcmUgZGlmZmVyZW50LCB0aGUgY29ybmVycyB3aWxsIGJlIGVsbGlwdGljYWwgYXJjcywgYW5kIHRoZSBob3Jpem9udGFsXHJcbiAgICogcmFkaXVzIHdpbGwgYmUgZXF1YWwgdG8gY29ybmVyWFJhZGl1cyAob3IgYSBzbWFsbGVyIHJhZGl1cyBpZiB0aGUgcmVjdGFuZ2xlIGlzIHRvbyBzbWFsbCkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENvcm5lclhSYWRpdXMoIHJhZGl1czogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJhZGl1cyApLCAnY29ybmVyWFJhZGl1cyBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xyXG5cclxuICAgIGlmICggdGhpcy5fY29ybmVyWFJhZGl1cyAhPT0gcmFkaXVzICkge1xyXG4gICAgICB0aGlzLl9jb3JuZXJYUmFkaXVzID0gcmFkaXVzO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUUmVjdGFuZ2xlRHJhd2FibGUgKS5tYXJrRGlydHlDb3JuZXJYUmFkaXVzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVJlY3RhbmdsZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGNvcm5lclhSYWRpdXMoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Q29ybmVyWFJhZGl1cyggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNvcm5lclhSYWRpdXMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Q29ybmVyWFJhZGl1cygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGhvcml6b250YWwgY29ybmVyIHJhZGl1cyBvZiB0aGUgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENvcm5lclhSYWRpdXMoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9jb3JuZXJYUmFkaXVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmVydGljYWwgY29ybmVyIHJhZGl1cyBvZiB0aGUgcmVjdGFuZ2xlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgY29ybmVyWFJhZGl1cyBhbmQgY29ybmVyWVJhZGl1cyBhcmUgdGhlIHNhbWUsIHRoZSBjb3JuZXJzIHdpbGwgYmUgcm91bmRlZCBjaXJjdWxhciBhcmNzIHdpdGggdGhhdCByYWRpdXNcclxuICAgKiAob3IgYSBzbWFsbGVyIHJhZGl1cyBpZiB0aGUgcmVjdGFuZ2xlIGlzIHRvbyBzbWFsbCkuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgY29ybmVyWFJhZGl1cyBhbmQgY29ybmVyWVJhZGl1cyBhcmUgZGlmZmVyZW50LCB0aGUgY29ybmVycyB3aWxsIGJlIGVsbGlwdGljYWwgYXJjcywgYW5kIHRoZSB2ZXJ0aWNhbFxyXG4gICAqIHJhZGl1cyB3aWxsIGJlIGVxdWFsIHRvIGNvcm5lcllSYWRpdXMgKG9yIGEgc21hbGxlciByYWRpdXMgaWYgdGhlIHJlY3RhbmdsZSBpcyB0b28gc21hbGwpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDb3JuZXJZUmFkaXVzKCByYWRpdXM6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCByYWRpdXMgKSwgJ2Nvcm5lcllSYWRpdXMgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2Nvcm5lcllSYWRpdXMgIT09IHJhZGl1cyApIHtcclxuICAgICAgdGhpcy5fY29ybmVyWVJhZGl1cyA9IHJhZGl1cztcclxuXHJcbiAgICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RhdGVMZW47IGkrKyApIHtcclxuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVFJlY3RhbmdsZURyYXdhYmxlICkubWFya0RpcnR5Q29ybmVyWVJhZGl1cygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVSZWN0YW5nbGUoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBjb3JuZXJZUmFkaXVzKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldENvcm5lcllSYWRpdXMoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBjb3JuZXJZUmFkaXVzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENvcm5lcllSYWRpdXMoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB2ZXJ0aWNhbCBjb3JuZXIgcmFkaXVzIG9mIHRoZSByZWN0YW5nbGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q29ybmVyWVJhZGl1cygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2Nvcm5lcllSYWRpdXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBSZWN0YW5nbGUncyB4L3kvd2lkdGgvaGVpZ2h0IGZyb20gdGhlIEJvdW5kczIgcGFzc2VkIGluLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSZWN0Qm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogdGhpcyB7XHJcbiAgICB0aGlzLnNldFJlY3QoIGJvdW5kcy54LCBib3VuZHMueSwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0ICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHJlY3RCb3VuZHMoIHZhbHVlOiBCb3VuZHMyICkgeyB0aGlzLnNldFJlY3RCb3VuZHMoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0Qm91bmRzKCk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5nZXRSZWN0Qm91bmRzKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMyIGdlbmVyYXRlZCBmcm9tIHRoaXMgUmVjdGFuZ2xlJ3MgeC95L3dpZHRoL2hlaWdodC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmVjdEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBCb3VuZHMyLnJlY3QoIHRoaXMuX3JlY3RYLCB0aGlzLl9yZWN0WSwgdGhpcy5fcmVjdFdpZHRoLCB0aGlzLl9yZWN0SGVpZ2h0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBSZWN0YW5nbGUncyB3aWR0aC9oZWlnaHQgZnJvbSB0aGUgRGltZW5zaW9uMiBzaXplIHBhc3NlZCBpbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmVjdFNpemUoIHNpemU6IERpbWVuc2lvbjIgKTogdGhpcyB7XHJcbiAgICB0aGlzLnNldFJlY3RXaWR0aCggc2l6ZS53aWR0aCApO1xyXG4gICAgdGhpcy5zZXRSZWN0SGVpZ2h0KCBzaXplLmhlaWdodCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCByZWN0U2l6ZSggdmFsdWU6IERpbWVuc2lvbjIgKSB7IHRoaXMuc2V0UmVjdFNpemUoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0U2l6ZSgpOiBEaW1lbnNpb24yIHsgcmV0dXJuIHRoaXMuZ2V0UmVjdFNpemUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IERpbWVuc2lvbjIgZ2VuZXJhdGVkIGZyb20gdGhpcyBSZWN0YW5nbGUncyB3aWR0aC9oZWlnaHQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJlY3RTaXplKCk6IERpbWVuc2lvbjIge1xyXG4gICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCB0aGlzLl9yZWN0V2lkdGgsIHRoaXMuX3JlY3RIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSByZWN0YW5nbGUgd2hpbGUga2VlcGluZyBpdHMgcmlnaHQgZWRnZSAoeCArIHdpZHRoKSBpbiB0aGUgc2FtZSBwb3NpdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSZWN0V2lkdGhGcm9tUmlnaHQoIHdpZHRoOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBpZiAoIHRoaXMuX3JlY3RXaWR0aCAhPT0gd2lkdGggKSB7XHJcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5fcmVjdFggKyB0aGlzLl9yZWN0V2lkdGg7XHJcbiAgICAgIHRoaXMuc2V0UmVjdFdpZHRoKCB3aWR0aCApO1xyXG4gICAgICB0aGlzLnNldFJlY3RYKCByaWdodCAtIHdpZHRoICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHJlY3RXaWR0aEZyb21SaWdodCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSZWN0V2lkdGhGcm9tUmlnaHQoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0V2lkdGhGcm9tUmlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmVjdFdpZHRoKCk7IH0gLy8gYmVjYXVzZSBKU0hpbnQgY29tcGxhaW5zXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiB0aGUgcmVjdGFuZ2xlIHdoaWxlIGtlZXBpbmcgaXRzIGJvdHRvbSBlZGdlICh5ICsgaGVpZ2h0KSBpbiB0aGUgc2FtZSBwb3NpdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRSZWN0SGVpZ2h0RnJvbUJvdHRvbSggaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBpZiAoIHRoaXMuX3JlY3RIZWlnaHQgIT09IGhlaWdodCApIHtcclxuICAgICAgY29uc3QgYm90dG9tID0gdGhpcy5fcmVjdFkgKyB0aGlzLl9yZWN0SGVpZ2h0O1xyXG4gICAgICB0aGlzLnNldFJlY3RIZWlnaHQoIGhlaWdodCApO1xyXG4gICAgICB0aGlzLnNldFJlY3RZKCBib3R0b20gLSBoZWlnaHQgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgcmVjdEhlaWdodEZyb21Cb3R0b20oIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0UmVjdEhlaWdodEZyb21Cb3R0b20oIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByZWN0SGVpZ2h0RnJvbUJvdHRvbSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSZWN0SGVpZ2h0KCk7IH0gLy8gYmVjYXVzZSBKU0hpbnQgY29tcGxhaW5zXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIHJlY3RhbmdsZSBoYXMgYW55IHJvdW5kaW5nIGFwcGxpZWQgYXQgaXRzIGNvcm5lcnMuIElmIGVpdGhlciB0aGUgeCBvciB5IGNvcm5lciByYWRpdXMgaXMgMCxcclxuICAgKiB0aGVuIHRoZXJlIGlzIG5vIHJvdW5kaW5nIGFwcGxpZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGlzUm91bmRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9jb3JuZXJYUmFkaXVzICE9PSAwICYmIHRoaXMuX2Nvcm5lcllSYWRpdXMgIT09IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyB0aGUgYm91bmRzIG9mIHRoZSBSZWN0YW5nbGUsIGluY2x1ZGluZyBhbnkgYXBwbGllZCBzdHJva2UuIE92ZXJyaWRkZW4gZm9yIGVmZmljaWVuY3kuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbXB1dGVTaGFwZUJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIGxldCBib3VuZHMgPSBuZXcgQm91bmRzMiggdGhpcy5fcmVjdFgsIHRoaXMuX3JlY3RZLCB0aGlzLl9yZWN0WCArIHRoaXMuX3JlY3RXaWR0aCwgdGhpcy5fcmVjdFkgKyB0aGlzLl9yZWN0SGVpZ2h0ICk7XHJcbiAgICBpZiAoIHRoaXMuX3N0cm9rZSApIHtcclxuICAgICAgLy8gc2luY2Ugd2UgYXJlIGF4aXMtYWxpZ25lZCwgYW55IHN0cm9rZSB3aWxsIGV4cGFuZCBvdXIgYm91bmRzIGJ5IGEgZ3VhcmFudGVlZCBzZXQgYW1vdW50XHJcbiAgICAgIGJvdW5kcyA9IGJvdW5kcy5kaWxhdGVkKCB0aGlzLmdldExpbmVXaWR0aCgpIC8gMiApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gb3VyIHJlbmRlcmVkIGRpc3BsYXkuIEdlbmVyYWxseSB1c2VkIHRvIGxhemlseSBjcmVhdGUgYSBTaGFwZSBpbnN0YW5jZVxyXG4gICAqIHdoZW4gb25lIGlzIG5lZWRlZCwgd2l0aG91dCBoYXZpbmcgdG8gZG8gc28gYmVmb3JlaGFuZC5cclxuICAgKi9cclxuICBwcml2YXRlIGNyZWF0ZVJlY3RhbmdsZVNoYXBlKCk6IFNoYXBlIHtcclxuICAgIGlmICggdGhpcy5pc1JvdW5kZWQoKSApIHtcclxuICAgICAgLy8gY29weSBib3JkZXItcmFkaXVzIENTUyBiZWhhdmlvciBpbiBDaHJvbWUsIHdoZXJlIHRoZSBhcmNzIHdvbid0IGludGVyc2VjdCwgaW4gY2FzZXMgd2hlcmUgdGhlIGFyYyBzZWdtZW50cyBhdCBmdWxsIHNpemUgd291bGQgaW50ZXJzZWN0IGVhY2ggb3RoZXJcclxuICAgICAgY29uc3QgbWF4aW11bUFyY1NpemUgPSBNYXRoLm1pbiggdGhpcy5fcmVjdFdpZHRoIC8gMiwgdGhpcy5fcmVjdEhlaWdodCAvIDIgKTtcclxuICAgICAgcmV0dXJuIFNoYXBlLnJvdW5kUmVjdGFuZ2xlKCB0aGlzLl9yZWN0WCwgdGhpcy5fcmVjdFksIHRoaXMuX3JlY3RXaWR0aCwgdGhpcy5fcmVjdEhlaWdodCxcclxuICAgICAgICBNYXRoLm1pbiggbWF4aW11bUFyY1NpemUsIHRoaXMuX2Nvcm5lclhSYWRpdXMgKSwgTWF0aC5taW4oIG1heGltdW1BcmNTaXplLCB0aGlzLl9jb3JuZXJZUmFkaXVzICkgKS5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFNoYXBlLnJlY3RhbmdsZSggdGhpcy5fcmVjdFgsIHRoaXMuX3JlY3RZLCB0aGlzLl9yZWN0V2lkdGgsIHRoaXMuX3JlY3RIZWlnaHQgKS5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOb3RpZmllcyB0aGF0IHRoZSByZWN0YW5nbGUgaGFzIGNoYW5nZWQsIGFuZCBpbnZhbGlkYXRlcyBwYXRoIGluZm9ybWF0aW9uIGFuZCBvdXIgY2FjaGVkIHNoYXBlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBpbnZhbGlkYXRlUmVjdGFuZ2xlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3JlY3RYICksIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgZmluaXRlIHggKCR7dGhpcy5fcmVjdFh9KWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9yZWN0WSApLCBgQSByZWN0YW5nbGUgbmVlZHMgdG8gaGF2ZSBhIGZpbml0ZSB5ICgke3RoaXMuX3JlY3RZfSlgICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9yZWN0V2lkdGggPj0gMCAmJiBpc0Zpbml0ZSggdGhpcy5fcmVjdFdpZHRoICksXHJcbiAgICAgIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSB3aWR0aCAoJHt0aGlzLl9yZWN0V2lkdGh9KWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3JlY3RIZWlnaHQgPj0gMCAmJiBpc0Zpbml0ZSggdGhpcy5fcmVjdEhlaWdodCApLFxyXG4gICAgICBgQSByZWN0YW5nbGUgbmVlZHMgdG8gaGF2ZSBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgaGVpZ2h0ICgke3RoaXMuX3JlY3RIZWlnaHR9KWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2Nvcm5lclhSYWRpdXMgPj0gMCAmJiBpc0Zpbml0ZSggdGhpcy5fY29ybmVyWFJhZGl1cyApLFxyXG4gICAgICBgQSByZWN0YW5nbGUgbmVlZHMgdG8gaGF2ZSBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgYXJjV2lkdGggKCR7dGhpcy5fY29ybmVyWFJhZGl1c30pYCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY29ybmVyWVJhZGl1cyA+PSAwICYmIGlzRmluaXRlKCB0aGlzLl9jb3JuZXJZUmFkaXVzICksXHJcbiAgICAgIGBBIHJlY3RhbmdsZSBuZWVkcyB0byBoYXZlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBhcmNIZWlnaHQgKCR7dGhpcy5fY29ybmVyWVJhZGl1c30pYCApO1xyXG5cclxuICAgIC8vIHNldHMgb3VyICdjYWNoZScgdG8gbnVsbCwgc28gd2UgZG9uJ3QgYWx3YXlzIGhhdmUgdG8gcmVjb21wdXRlIG91ciBzaGFwZVxyXG4gICAgdGhpcy5fc2hhcGUgPSBudWxsO1xyXG5cclxuICAgIC8vIHNob3VsZCBpbnZhbGlkYXRlIHRoZSBwYXRoIGFuZCBlbnN1cmUgYSByZWRyYXdcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhdGgoKTtcclxuXHJcbiAgICAvLyBzaW5jZSB3ZSBjaGFuZ2VkIHRoZSByZWN0YW5nbGUgYXJjIHdpZHRoL2hlaWdodCwgaXQgY291bGQgbWFrZSBET00gd29yayBvciBub3RcclxuICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVQcmVmZXJyZWRTaXplcygpOiB2b2lkIHtcclxuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5sb2NhbFByZWZlcnJlZEhlaWdodDtcclxuXHJcbiAgICBpZiAoIHdpZHRoICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLnJlY3RXaWR0aCA9IHRoaXMuaGFzU3Ryb2tlKCkgPyB3aWR0aCAtIHRoaXMubGluZVdpZHRoIDogd2lkdGg7XHJcbiAgICB9XHJcbiAgICBpZiAoIGhlaWdodCAhPT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5yZWN0SGVpZ2h0ID0gdGhpcy5oYXNTdHJva2UoKSA/IGhlaWdodCAtIHRoaXMubGluZVdpZHRoIDogaGVpZ2h0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gV2UgbmVlZCB0byBkZXRlY3Qgc3Ryb2tlIGNoYW5nZXMsIHNpbmNlIG91ciBwcmVmZXJyZWQgc2l6ZSBjb21wdXRhdGlvbnMgZGVwZW5kIG9uIGl0LlxyXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlU3Ryb2tlKCk6IHZvaWQge1xyXG4gICAgc3VwZXIuaW52YWxpZGF0ZVN0cm9rZSgpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUHJlZmVycmVkU2l6ZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBvaW50IGlzIFwiaW5zaWRlXCIgKGNvbnRhaW5lZCkgaW4gdGhpcyBSZWN0YW5nbGUncyBzZWxmIGNvbnRlbnQsIG9yIFwib3V0c2lkZVwiLlxyXG4gICAqXHJcbiAgICogSGFuZGxlcyBheGlzLWFsaWduZWQgb3B0aW9uYWxseS1yb3VuZGVkIHJlY3RhbmdsZXMsIGFsdGhvdWdoIGNhbiBvbmx5IGRvIG9wdGltaXplZCBjb21wdXRhdGlvbiBpZiBpdCBpc24ndFxyXG4gICAqIHJvdW5kZWQuIElmIGl0IElTIHJvdW5kZWQsIHdlIGNoZWNrIGlmIGEgY29ybmVyIGNvbXB1dGF0aW9uIGlzIG5lZWRlZCAodXN1YWxseSBpc24ndCksIGFuZCBvbmx5IG5lZWQgdG8gY2hlY2tcclxuICAgKiBvbmUgY29ybmVyIGZvciB0aGF0IHRlc3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnQgLSBDb25zaWRlcmVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbnRhaW5zUG9pbnRTZWxmKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHggPSB0aGlzLl9yZWN0WDtcclxuICAgIGNvbnN0IHkgPSB0aGlzLl9yZWN0WTtcclxuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5fcmVjdFdpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5fcmVjdEhlaWdodDtcclxuICAgIGNvbnN0IGFyY1dpZHRoID0gdGhpcy5fY29ybmVyWFJhZGl1cztcclxuICAgIGNvbnN0IGFyY0hlaWdodCA9IHRoaXMuX2Nvcm5lcllSYWRpdXM7XHJcbiAgICBjb25zdCBoYWxmTGluZSA9IHRoaXMuZ2V0TGluZVdpZHRoKCkgLyAyO1xyXG5cclxuICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG4gICAgaWYgKCB0aGlzLl9zdHJva2VQaWNrYWJsZSApIHtcclxuICAgICAgLy8gdGVzdCB0aGUgb3V0ZXIgYm91bmRhcnkgaWYgd2UgYXJlIHN0cm9rZS1waWNrYWJsZSAoaWYgYWxzbyBmaWxsLXBpY2thYmxlLCB0aGlzIGlzIHRoZSBvbmx5IHRlc3Qgd2UgbmVlZClcclxuICAgICAgY29uc3Qgcm91bmRlZCA9IHRoaXMuaXNSb3VuZGVkKCk7XHJcbiAgICAgIGlmICggIXJvdW5kZWQgJiYgdGhpcy5nZXRMaW5lSm9pbigpID09PSAnYmV2ZWwnICkge1xyXG4gICAgICAgIC8vIGZhbGwtYmFjayBmb3IgYmV2ZWxcclxuICAgICAgICByZXR1cm4gc3VwZXIuY29udGFpbnNQb2ludFNlbGYoIHBvaW50ICk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbWl0ZXIgPSB0aGlzLmdldExpbmVKb2luKCkgPT09ICdtaXRlcicgJiYgIXJvdW5kZWQ7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiBSZWN0YW5nbGUuaW50ZXJzZWN0cyggeCAtIGhhbGZMaW5lLCB5IC0gaGFsZkxpbmUsXHJcbiAgICAgICAgd2lkdGggKyAyICogaGFsZkxpbmUsIGhlaWdodCArIDIgKiBoYWxmTGluZSxcclxuICAgICAgICBtaXRlciA/IDAgOiAoIGFyY1dpZHRoICsgaGFsZkxpbmUgKSwgbWl0ZXIgPyAwIDogKCBhcmNIZWlnaHQgKyBoYWxmTGluZSApLFxyXG4gICAgICAgIHBvaW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLl9maWxsUGlja2FibGUgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fc3Ryb2tlUGlja2FibGUgKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gUmVjdGFuZ2xlLmludGVyc2VjdHMoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGFyY1dpZHRoLCBhcmNIZWlnaHQsIHBvaW50ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9zdHJva2VQaWNrYWJsZSApIHtcclxuICAgICAgcmV0dXJuIHJlc3VsdCAmJiAhUmVjdGFuZ2xlLmludGVyc2VjdHMoIHggKyBoYWxmTGluZSwgeSArIGhhbGZMaW5lLFxyXG4gICAgICAgIHdpZHRoIC0gMiAqIGhhbGZMaW5lLCBoZWlnaHQgLSAyICogaGFsZkxpbmUsXHJcbiAgICAgICAgYXJjV2lkdGggLSBoYWxmTGluZSwgYXJjSGVpZ2h0IC0gaGFsZkxpbmUsXHJcbiAgICAgICAgcG9pbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7IC8vIGVpdGhlciBmaWxsIG5vciBzdHJva2UgaXMgcGlja2FibGVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIFJlY3RhbmdsZSdzIHNlbGZCb3VuZHMgaXMgaW50ZXJzZWN0ZWQgYnkgdGhlIHNwZWNpZmllZCBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYm91bmRzIC0gQm91bmRzIHRvIHRlc3QsIGFzc3VtZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGludGVyc2VjdHNCb3VuZHNTZWxmKCBib3VuZHM6IEJvdW5kczIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXRoaXMuY29tcHV0ZVNoYXBlQm91bmRzKCkuaW50ZXJzZWN0aW9uKCBib3VuZHMgKS5pc0VtcHR5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxyXG4gICAqIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhpcyBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHdyYXBwZXJcclxuICAgKiBAcGFyYW0gbWF0cml4IC0gVGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBhbHJlYWR5IGFwcGxpZWQgdG8gdGhlIGNvbnRleHQuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcclxuICAgIC8vVE9ETzogSGF2ZSBhIHNlcGFyYXRlIG1ldGhvZCBmb3IgdGhpcywgaW5zdGVhZCBvZiB0b3VjaGluZyB0aGUgcHJvdG90eXBlLiBDYW4gbWFrZSAndGhpcycgcmVmZXJlbmNlcyB0b28gZWFzaWx5LlxyXG4gICAgUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUucHJvdG90eXBlLnBhaW50Q2FudmFzKCB3cmFwcGVyLCB0aGlzLCBtYXRyaXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBET00gZHJhd2FibGUgZm9yIHRoaXMgUmVjdGFuZ2xlLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxyXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVET01EcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IERPTVNlbGZEcmF3YWJsZSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICByZXR1cm4gUmVjdGFuZ2xlRE9NRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBSZWN0YW5nbGUuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHJldHVybiBSZWN0YW5nbGVTVkdEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgQ2FudmFzIGRyYXdhYmxlIGZvciB0aGlzIFJlY3RhbmdsZS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cclxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlQ2FudmFzRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBDYW52YXNTZWxmRHJhd2FibGUge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgcmV0dXJuIFJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBXZWJHTCBkcmF3YWJsZSBmb3IgdGhpcyBSZWN0YW5nbGUuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVdlYkdMRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBXZWJHTFNlbGZEcmF3YWJsZSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICByZXR1cm4gUmVjdGFuZ2xlV2ViR0xEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBNaXNjZWxsYW5lb3VzXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogSXQgaXMgaW1wb3NzaWJsZSB0byBzZXQgYW5vdGhlciBzaGFwZSBvbiB0aGlzIFBhdGggc3VidHlwZSwgYXMgaXRzIGVmZmVjdGl2ZSBzaGFwZSBpcyBkZXRlcm1pbmVkIGJ5IG90aGVyXHJcbiAgICogcGFyYW1ldGVycy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzaGFwZSAtIFRocm93cyBhbiBlcnJvciBpZiBpdCBpcyBub3QgbnVsbC5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0U2hhcGUoIHNoYXBlOiBTaGFwZSB8IHN0cmluZyB8IG51bGwgKTogdGhpcyB7XHJcbiAgICBpZiAoIHNoYXBlICE9PSBudWxsICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgc2V0IHRoZSBzaGFwZSBvZiBhIFJlY3RhbmdsZSB0byBzb21ldGhpbmcgbm9uLW51bGwnICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gcHJvYmFibHkgY2FsbGVkIGZyb20gdGhlIFBhdGggY29uc3RydWN0b3JcclxuICAgICAgdGhpcy5pbnZhbGlkYXRlUGF0aCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGltbXV0YWJsZSBjb3B5IG9mIHRoaXMgUGF0aCBzdWJ0eXBlJ3MgcmVwcmVzZW50YXRpb24uXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGlzIGNyZWF0ZWQgbGF6aWx5LCBzbyBkb24ndCBjYWxsIGl0IGlmIHlvdSBkb24ndCBoYXZlIHRvIVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRTaGFwZSgpOiBTaGFwZSB7XHJcbiAgICBpZiAoICF0aGlzLl9zaGFwZSApIHtcclxuICAgICAgdGhpcy5fc2hhcGUgPSB0aGlzLmNyZWF0ZVJlY3RhbmdsZVNoYXBlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fc2hhcGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBQYXRoIGhhcyBhbiBhc3NvY2lhdGVkIFNoYXBlIChpbnN0ZWFkIG9mIG5vIHNoYXBlLCByZXByZXNlbnRlZCBieSBudWxsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBoYXNTaGFwZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBib3RoIG9mIHRoZSBjb3JuZXIgcmFkaWkgdG8gdGhlIHNhbWUgdmFsdWUsIHNvIHRoYXQgdGhlIHJvdW5kZWQgY29ybmVycyB3aWxsIGJlIGNpcmN1bGFyIGFyY3MuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENvcm5lclJhZGl1cyggY29ybmVyUmFkaXVzOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICB0aGlzLnNldENvcm5lclhSYWRpdXMoIGNvcm5lclJhZGl1cyApO1xyXG4gICAgdGhpcy5zZXRDb3JuZXJZUmFkaXVzKCBjb3JuZXJSYWRpdXMgKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBjb3JuZXJSYWRpdXMoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0Q29ybmVyUmFkaXVzKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY29ybmVyUmFkaXVzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENvcm5lclJhZGl1cygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNvcm5lciByYWRpdXMgaWYgYm90aCB0aGUgaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgY29ybmVyIHJhZGlpIGFyZSB0aGUgc2FtZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBkaWZmZXJlbnQgaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgY29ybmVyIHJhZGlpLCB0aGlzIHdpbGwgZmFpbCBhbiBhc3NlcnRpb24gYW5kIHJldHVybiB0aGUgaG9yaXpvbnRhbCByYWRpdXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENvcm5lclJhZGl1cygpOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY29ybmVyWFJhZGl1cyA9PT0gdGhpcy5fY29ybmVyWVJhZGl1cyxcclxuICAgICAgJ2dldENvcm5lclJhZGl1cygpIGludmFsaWQgaWYgeC95IHJhZGlpIGFyZSBkaWZmZXJlbnQnICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2Nvcm5lclhSYWRpdXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApOiB0aGlzIHtcclxuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBhIHBvaW50IGlzIHdpdGhpbiBhIHJvdW5kZWQgcmVjdGFuZ2xlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBYIHZhbHVlIG9mIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJlY3RhbmdsZVxyXG4gICAqIEBwYXJhbSB5IC0gWSB2YWx1ZSBvZiB0aGUgdG9wIHNpZGUgb2YgdGhlIHJlY3RhbmdsZVxyXG4gICAqIEBwYXJhbSB3aWR0aCAtIFdpZHRoIG9mIHRoZSByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gSGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0gYXJjV2lkdGggLSBIb3Jpem9udGFsIGNvcm5lciByYWRpdXMgb2YgdGhlIHJlY3RhbmdsZVxyXG4gICAqIEBwYXJhbSBhcmNIZWlnaHQgLSBWZXJ0aWNhbCBjb3JuZXIgcmFkaXVzIG9mIHRoZSByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0gcG9pbnQgLSBUaGUgcG9pbnQgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBpbiB0aGUgcm91bmRlZCByZWN0YW5nbGVcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGludGVyc2VjdHMoIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYXJjV2lkdGg6IG51bWJlciwgYXJjSGVpZ2h0OiBudW1iZXIsIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gcG9pbnQueCA+PSB4ICYmXHJcbiAgICAgICAgICAgICAgICAgICBwb2ludC54IDw9IHggKyB3aWR0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgcG9pbnQueSA+PSB5ICYmXHJcbiAgICAgICAgICAgICAgICAgICBwb2ludC55IDw9IHkgKyBoZWlnaHQ7XHJcblxyXG4gICAgaWYgKCAhcmVzdWx0IHx8IGFyY1dpZHRoIDw9IDAgfHwgYXJjSGVpZ2h0IDw9IDAgKSB7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29weSBib3JkZXItcmFkaXVzIENTUyBiZWhhdmlvciBpbiBDaHJvbWUsIHdoZXJlIHRoZSBhcmNzIHdvbid0IGludGVyc2VjdCwgaW4gY2FzZXMgd2hlcmUgdGhlIGFyYyBzZWdtZW50cyBhdCBmdWxsIHNpemUgd291bGQgaW50ZXJzZWN0IGVhY2ggb3RoZXJcclxuICAgIGNvbnN0IG1heGltdW1BcmNTaXplID0gTWF0aC5taW4oIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiApO1xyXG4gICAgYXJjV2lkdGggPSBNYXRoLm1pbiggbWF4aW11bUFyY1NpemUsIGFyY1dpZHRoICk7XHJcbiAgICBhcmNIZWlnaHQgPSBNYXRoLm1pbiggbWF4aW11bUFyY1NpemUsIGFyY0hlaWdodCApO1xyXG5cclxuICAgIC8vIHdlIGFyZSByb3VuZGVkIGFuZCBpbnNpZGUgdGhlIGxvZ2ljYWwgcmVjdGFuZ2xlIChpZiBpdCBkaWRuJ3QgaGF2ZSByb3VuZGVkIGNvcm5lcnMpXHJcblxyXG4gICAgLy8gY2xvc2VzdCBjb3JuZXIgYXJjJ3MgY2VudGVyICh3ZSBhc3N1bWUgdGhlIHJvdW5kZWQgcmVjdGFuZ2xlJ3MgYXJjcyBhcmUgOTAgZGVncmVlcyBmdWxseSwgYW5kIGRvbid0IGludGVyc2VjdClcclxuICAgIGxldCBjbG9zZXN0Q29ybmVyWDtcclxuICAgIGxldCBjbG9zZXN0Q29ybmVyWTtcclxuICAgIGxldCBndWFyYW50ZWVkSW5zaWRlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIHRvIHRoZSBpbnNpZGUgb2YgdGhlIGNsb3Nlc3QgY29ybmVyIGFyYydzIGNlbnRlciwgd2UgYXJlIGd1YXJhbnRlZWQgdG8gYmUgaW4gdGhlIHJvdW5kZWQgcmVjdGFuZ2xlIChndWFyYW50ZWVkSW5zaWRlKVxyXG4gICAgaWYgKCBwb2ludC54IDwgeCArIHdpZHRoIC8gMiApIHtcclxuICAgICAgY2xvc2VzdENvcm5lclggPSB4ICsgYXJjV2lkdGg7XHJcbiAgICAgIGd1YXJhbnRlZWRJbnNpZGUgPSBndWFyYW50ZWVkSW5zaWRlIHx8IHBvaW50LnggPj0gY2xvc2VzdENvcm5lclg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY2xvc2VzdENvcm5lclggPSB4ICsgd2lkdGggLSBhcmNXaWR0aDtcclxuICAgICAgZ3VhcmFudGVlZEluc2lkZSA9IGd1YXJhbnRlZWRJbnNpZGUgfHwgcG9pbnQueCA8PSBjbG9zZXN0Q29ybmVyWDtcclxuICAgIH1cclxuICAgIGlmICggZ3VhcmFudGVlZEluc2lkZSApIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgICBpZiAoIHBvaW50LnkgPCB5ICsgaGVpZ2h0IC8gMiApIHtcclxuICAgICAgY2xvc2VzdENvcm5lclkgPSB5ICsgYXJjSGVpZ2h0O1xyXG4gICAgICBndWFyYW50ZWVkSW5zaWRlID0gZ3VhcmFudGVlZEluc2lkZSB8fCBwb2ludC55ID49IGNsb3Nlc3RDb3JuZXJZO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNsb3Nlc3RDb3JuZXJZID0geSArIGhlaWdodCAtIGFyY0hlaWdodDtcclxuICAgICAgZ3VhcmFudGVlZEluc2lkZSA9IGd1YXJhbnRlZWRJbnNpZGUgfHwgcG9pbnQueSA8PSBjbG9zZXN0Q29ybmVyWTtcclxuICAgIH1cclxuICAgIGlmICggZ3VhcmFudGVlZEluc2lkZSApIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgICAvLyB3ZSBhcmUgbm93IGluIHRoZSByZWN0YW5ndWxhciByZWdpb24gYmV0d2VlbiB0aGUgbG9naWNhbCBjb3JuZXIgYW5kIHRoZSBjZW50ZXIgb2YgdGhlIGNsb3Nlc3QgY29ybmVyJ3MgYXJjLlxyXG5cclxuICAgIC8vIG9mZnNldCBmcm9tIHRoZSBjbG9zZXN0IGNvcm5lcidzIGFyYyBjZW50ZXJcclxuICAgIGxldCBvZmZzZXRYID0gcG9pbnQueCAtIGNsb3Nlc3RDb3JuZXJYO1xyXG4gICAgbGV0IG9mZnNldFkgPSBwb2ludC55IC0gY2xvc2VzdENvcm5lclk7XHJcblxyXG4gICAgLy8gbm9ybWFsaXplIHRoZSBjb29yZGluYXRlcyBzbyBub3cgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHVuaXQgY2lyY2xlXHJcbiAgICAvLyAodGVjaG5pY2FsbHkgYXJjLCBidXQgd2UgYXJlIGd1YXJhbnRlZWQgdG8gYmUgaW4gdGhlIGFyZWEgY292ZXJlZCBieSB0aGUgYXJjLCBzbyB3ZSBqdXN0IGNvbnNpZGVyIHRoZSBjaXJjbGUpXHJcbiAgICAvLyBOT1RFOiB3ZSBhcmUgcm91bmRlZCwgc28gYm90aCBhcmNXaWR0aCBhbmQgYXJjSGVpZ2h0IGFyZSBub24temVybyAodGhpcyBpcyB3ZWxsIGRlZmluZWQpXHJcbiAgICBvZmZzZXRYIC89IGFyY1dpZHRoO1xyXG4gICAgb2Zmc2V0WSAvPSBhcmNIZWlnaHQ7XHJcblxyXG4gICAgb2Zmc2V0WCAqPSBvZmZzZXRYO1xyXG4gICAgb2Zmc2V0WSAqPSBvZmZzZXRZO1xyXG4gICAgcmV0dXJuIG9mZnNldFggKyBvZmZzZXRZIDw9IDE7IC8vIHJldHVybiB3aGV0aGVyIHdlIGFyZSBpbiB0aGUgcm91bmRlZCBjb3JuZXIuIHNlZSB0aGUgZm9ybXVsYSBmb3IgYW4gZWxsaXBzZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHJlY3RhbmdsZSB3aXRoIHRoZSBzcGVjaWZpZWQgeC95L3dpZHRoL2hlaWdodC5cclxuICAgKlxyXG4gICAqIFNlZSBSZWN0YW5nbGUncyBjb25zdHJ1Y3RvciBmb3IgZGV0YWlsZWQgcGFyYW1ldGVyIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVjdCggeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApOiBSZWN0YW5nbGUge1xyXG4gICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIDAsIDAsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByb3VuZGVkIHJlY3RhbmdsZSB3aXRoIHRoZSBzcGVjaWZpZWQgeC95L3dpZHRoL2hlaWdodC9jb3JuZXJYUmFkaXVzL2Nvcm5lcllSYWRpdXMuXHJcbiAgICpcclxuICAgKiBTZWUgUmVjdGFuZ2xlJ3MgY29uc3RydWN0b3IgZm9yIGRldGFpbGVkIHBhcmFtZXRlciBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJvdW5kZWRSZWN0KCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNvcm5lclhSYWRpdXM6IG51bWJlciwgY29ybmVyWVJhZGl1czogbnVtYmVyLCBvcHRpb25zPzogUmVjdGFuZ2xlT3B0aW9ucyApOiBSZWN0YW5nbGUge1xyXG4gICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByZWN0YW5nbGUgeC95L3dpZHRoL2hlaWdodCBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIFNlZSBSZWN0YW5nbGUncyBjb25zdHJ1Y3RvciBmb3IgZGV0YWlsZWQgcGFyYW1ldGVyIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgYm91bmRzKCBib3VuZHM6IEJvdW5kczIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk6IFJlY3RhbmdsZSB7XHJcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByb3VuZGVkIHJlY3RhbmdsZSB4L3kvd2lkdGgvaGVpZ2h0IG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgYm91bmRzIChSZWN0YW5nbGUuYm91bmRzLCBidXQgd2l0aCBhZGRpdGlvbmFsXHJcbiAgICogY29ybmVyWFJhZGl1cyBhbmQgY29ybmVyWVJhZGl1cykuXHJcbiAgICpcclxuICAgKiBTZWUgUmVjdGFuZ2xlJ3MgY29uc3RydWN0b3IgZm9yIGRldGFpbGVkIHBhcmFtZXRlciBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJvdW5kZWRCb3VuZHMoIGJvdW5kczogQm91bmRzMiwgY29ybmVyWFJhZGl1czogbnVtYmVyLCBjb3JuZXJZUmFkaXVzOiBudW1iZXIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk6IFJlY3RhbmdsZSB7XHJcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGNvcm5lclhSYWRpdXMsIGNvcm5lcllSYWRpdXMsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSByZWN0YW5nbGUgd2l0aCB0b3AvbGVmdCBvZiAoMCwwKSB3aXRoIHRoZSBzcGVjaWZpZWQge0RpbWVuc2lvbjJ9J3Mgd2lkdGggYW5kIGhlaWdodC5cclxuICAgKlxyXG4gICAqIFNlZSBSZWN0YW5nbGUncyBjb25zdHJ1Y3RvciBmb3IgZGV0YWlsZWQgcGFyYW1ldGVyIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZGltZW5zaW9uKCBkaW1lbnNpb246IERpbWVuc2lvbjIsIG9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zICk6IFJlY3RhbmdsZSB7XHJcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggMCwgMCwgZGltZW5zaW9uLndpZHRoLCBkaW1lbnNpb24uaGVpZ2h0LCAwLCAwLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxyXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxyXG4gKlxyXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcclxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXHJcbiAqL1xyXG5SZWN0YW5nbGUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IFsgLi4uUkVDVEFOR0xFX09QVElPTl9LRVlTLCAuLi5TdXBlclR5cGUucHJvdG90eXBlLl9tdXRhdG9yS2V5cyBdO1xyXG5cclxuLyoqXHJcbiAqIHtBcnJheS48U3RyaW5nPn0gLSBMaXN0IG9mIGFsbCBkaXJ0eSBmbGFncyB0aGF0IHNob3VsZCBiZSBhdmFpbGFibGUgb24gZHJhd2FibGVzIGNyZWF0ZWQgZnJvbSB0aGlzIG5vZGUgKG9yXHJcbiAqICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlKS4gR2l2ZW4gYSBmbGFnIChlLmcuIHJhZGl1cyksIGl0IGluZGljYXRlcyB0aGUgZXhpc3RlbmNlIG9mIGEgZnVuY3Rpb25cclxuICogICAgICAgICAgICAgICAgICAgIGRyYXdhYmxlLm1hcmtEaXJ0eVJhZGl1cygpIHRoYXQgd2lsbCBpbmRpY2F0ZSB0byB0aGUgZHJhd2FibGUgdGhhdCB0aGUgcmFkaXVzIGhhcyBjaGFuZ2VkLlxyXG4gKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICogQG92ZXJyaWRlXHJcbiAqL1xyXG5SZWN0YW5nbGUucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzID0gUGF0aC5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MuY29uY2F0KCBbICd4JywgJ3knLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2Nvcm5lclhSYWRpdXMnLCAnY29ybmVyWVJhZGl1cycgXSApLmZpbHRlciggZmxhZyA9PiBmbGFnICE9PSAnc2hhcGUnICk7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVjdGFuZ2xlJywgUmVjdGFuZ2xlICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBRWhELE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUVuRCxTQUFvRUMsUUFBUSxFQUFFQyxRQUFRLEVBQWdDQyxJQUFJLEVBQWVDLE9BQU8sRUFBRUMsdUJBQXVCLEVBQUVDLG9CQUFvQixFQUFFQyxvQkFBb0IsRUFBRUMsc0JBQXNCLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxPQUFPLFFBQTRELGVBQWU7QUFFcFYsU0FBU0MsY0FBYyxRQUFRLG9DQUFvQztBQUVuRSxNQUFNQyxxQkFBcUIsR0FBRyxDQUM1QixZQUFZO0FBQUU7QUFDZCxVQUFVO0FBQUU7QUFDWixPQUFPO0FBQUU7QUFDVCxPQUFPO0FBQUU7QUFDVCxXQUFXO0FBQUU7QUFDYixZQUFZO0FBQUU7QUFDZCxjQUFjO0FBQUU7QUFDaEIsZUFBZTtBQUFFO0FBQ2pCLGVBQWUsQ0FBQztBQUFBLENBQ2pCOztBQWdCRCxNQUFNQyxTQUFTLEdBQUdILE9BQU8sQ0FBRVIsSUFBSyxDQUFDO0FBRWpDLGVBQWUsTUFBTVksU0FBUyxTQUFTRCxTQUFTLENBQUM7RUFDL0M7RUFDQTs7RUFHQTtFQUNBO0VBR0E7RUFDQTtFQUdBO0VBQ0E7RUFHQTtFQUNBO0VBR0E7RUFDQTtFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTVNFLFdBQVdBLENBQUVDLENBQXVDLEVBQUVDLENBQTZCLEVBQUVDLEtBQWMsRUFBRUMsTUFBa0MsRUFBRUMsYUFBeUMsRUFBRUMsYUFBc0IsRUFBRUMsZUFBa0MsRUFBRztJQUV0UDtJQUNBO0lBQ0EsTUFBTUMsY0FBZ0MsR0FBRztNQUN2Q0MsT0FBTyxFQUFFO0lBQ1gsQ0FBQztJQUNELEtBQUssQ0FBRSxJQUFJLEVBQUVELGNBQWUsQ0FBQztJQUU3QixJQUFJRSxPQUF5QixHQUFHLENBQUMsQ0FBQztJQUVsQyxJQUFJLENBQUNDLE1BQU0sR0FBRyxDQUFDO0lBQ2YsSUFBSSxDQUFDQyxNQUFNLEdBQUcsQ0FBQztJQUNmLElBQUksQ0FBQ0MsVUFBVSxHQUFHLENBQUM7SUFDbkIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsQ0FBQztJQUNwQixJQUFJLENBQUNDLGNBQWMsR0FBRyxDQUFDO0lBQ3ZCLElBQUksQ0FBQ0MsY0FBYyxHQUFHLENBQUM7SUFFdkIsSUFBSyxPQUFPZixDQUFDLEtBQUssUUFBUSxFQUFHO01BQzNCO01BQ0EsSUFBS0EsQ0FBQyxZQUFZbkIsT0FBTyxFQUFHO1FBQzFCO1FBQ0EsSUFBSyxPQUFPb0IsQ0FBQyxLQUFLLFFBQVEsRUFBRztVQUMzQmUsTUFBTSxJQUFJQSxNQUFNLENBQUVDLFNBQVMsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsSUFBSUQsU0FBUyxDQUFDQyxNQUFNLEtBQUssQ0FBQyxFQUNoRSx3RUFBeUUsQ0FBQztVQUM1RUYsTUFBTSxJQUFJQSxNQUFNLENBQUVmLENBQUMsS0FBS2tCLFNBQVMsSUFBSSxPQUFPbEIsQ0FBQyxLQUFLLFFBQVEsRUFDeEQseUZBQTBGLENBQUM7VUFDN0ZlLE1BQU0sSUFBSUEsTUFBTSxDQUFFZixDQUFDLEtBQUtrQixTQUFTLElBQUlDLE1BQU0sQ0FBQ0MsY0FBYyxDQUFFcEIsQ0FBRSxDQUFDLEtBQUttQixNQUFNLENBQUNFLFNBQVMsRUFDbEYsd0RBQXlELENBQUM7VUFFNURiLE9BQU8sR0FBR2QsY0FBYyxDQUFvQmMsT0FBTyxFQUFFO1lBQ25EYyxVQUFVLEVBQUV2QjtVQUNkLENBQUMsRUFBRUMsQ0FBRSxDQUFDLENBQUMsQ0FBQztRQUNWO1FBQ0E7UUFBQSxLQUNLO1VBQ0hlLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxTQUFTLENBQUNDLE1BQU0sS0FBSyxDQUFDLElBQUlELFNBQVMsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFDaEUseUdBQTBHLENBQUM7VUFDN0dGLE1BQU0sSUFBSUEsTUFBTSxDQUFFYixNQUFNLEtBQUtnQixTQUFTLElBQUksT0FBT2hCLE1BQU0sS0FBSyxRQUFRLEVBQ2xFLHVIQUF3SCxDQUFDO1VBQzNIYSxNQUFNLElBQUlBLE1BQU0sQ0FBRWIsTUFBTSxLQUFLZ0IsU0FBUyxJQUFJQyxNQUFNLENBQUNDLGNBQWMsQ0FBRWxCLE1BQU8sQ0FBQyxLQUFLaUIsTUFBTSxDQUFDRSxTQUFTLEVBQzVGLHdEQUF5RCxDQUFDO1VBRTVEYixPQUFPLEdBQUdkLGNBQWMsQ0FBb0JjLE9BQU8sRUFBRTtZQUNuRGMsVUFBVSxFQUFFdkIsQ0FBQztZQUNiSSxhQUFhLEVBQUVILENBQUM7WUFBRTtZQUNsQkksYUFBYSxFQUFFSCxLQUFLLENBQUM7VUFDdkIsQ0FBQyxFQUFFQyxNQUF1QyxDQUFDLENBQUMsQ0FBQztRQUMvQztNQUNGO01BQ0E7TUFBQSxLQUNLO1FBQ0hNLE9BQU8sR0FBR2QsY0FBYyxDQUFvQmMsT0FBTyxFQUFFVCxDQUFFLENBQUM7TUFDMUQ7SUFDRjtJQUNBO0lBQUEsS0FDSyxJQUFLSyxhQUFhLEtBQUtjLFNBQVMsRUFBRztNQUN0Q0gsTUFBTSxJQUFJQSxNQUFNLENBQUVDLFNBQVMsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsSUFBSUQsU0FBUyxDQUFDQyxNQUFNLEtBQUssQ0FBQyxFQUNoRSx1RkFBd0YsQ0FBQztNQUMzRkYsTUFBTSxJQUFJQSxNQUFNLENBQUVaLGFBQWEsS0FBS2UsU0FBUyxJQUFJLE9BQU9mLGFBQWEsS0FBSyxRQUFRLEVBQ2hGLHFHQUFzRyxDQUFDO01BQ3pHWSxNQUFNLElBQUlBLE1BQU0sQ0FBRVosYUFBYSxLQUFLZSxTQUFTLElBQUlDLE1BQU0sQ0FBQ0MsY0FBYyxDQUFFakIsYUFBYyxDQUFDLEtBQUtnQixNQUFNLENBQUNFLFNBQVMsRUFDMUcsd0RBQXlELENBQUM7TUFFNURiLE9BQU8sR0FBR2QsY0FBYyxDQUFvQmMsT0FBTyxFQUFFO1FBQ25EZSxLQUFLLEVBQUV4QixDQUFDO1FBQ1J5QixLQUFLLEVBQUV4QixDQUFXO1FBQ2xCeUIsU0FBUyxFQUFFeEIsS0FBSztRQUNoQnlCLFVBQVUsRUFBRXhCO01BQ2QsQ0FBQyxFQUFFQyxhQUFrQyxDQUFDO0lBQ3hDO0lBQ0E7SUFBQSxLQUNLO01BQ0hZLE1BQU0sSUFBSUEsTUFBTSxDQUFFQyxTQUFTLENBQUNDLE1BQU0sS0FBSyxDQUFDLElBQUlELFNBQVMsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFDaEUsbUhBQW9ILENBQUM7TUFDdkhGLE1BQU0sSUFBSUEsTUFBTSxDQUFFUCxPQUFPLEtBQUtVLFNBQVMsSUFBSSxPQUFPVixPQUFPLEtBQUssUUFBUSxFQUNwRSxtSUFBb0ksQ0FBQztNQUN2SU8sTUFBTSxJQUFJQSxNQUFNLENBQUVQLE9BQU8sS0FBS1UsU0FBUyxJQUFJQyxNQUFNLENBQUNDLGNBQWMsQ0FBRVosT0FBUSxDQUFDLEtBQUtXLE1BQU0sQ0FBQ0UsU0FBUyxFQUM5Rix3REFBeUQsQ0FBQztNQUU1RGIsT0FBTyxHQUFHZCxjQUFjLENBQW9CYyxPQUFPLEVBQUU7UUFDbkRlLEtBQUssRUFBRXhCLENBQUM7UUFDUnlCLEtBQUssRUFBRXhCLENBQVc7UUFDbEJ5QixTQUFTLEVBQUV4QixLQUFLO1FBQ2hCeUIsVUFBVSxFQUFFeEIsTUFBZ0I7UUFDNUJDLGFBQWEsRUFBRUEsYUFBdUI7UUFDdENDLGFBQWEsRUFBRUE7TUFDakIsQ0FBQyxFQUFFQyxlQUFnQixDQUFDO0lBQ3RCO0lBRUEsSUFBSSxDQUFDc0IsMkJBQTJCLENBQUNDLFFBQVEsQ0FBRSxJQUFJLENBQUNDLG9CQUFvQixDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFFLENBQUM7SUFDbkYsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQ0gsUUFBUSxDQUFFLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUUsQ0FBQztJQUVwRixJQUFJLENBQUNFLE1BQU0sQ0FBRXhCLE9BQVEsQ0FBQztFQUN4Qjs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNVeUIsaUJBQWlCQSxDQUFBLEVBQVc7SUFDbEMsT0FBT0MsSUFBSSxDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDeEIsVUFBVSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUNDLFdBQVcsR0FBRyxDQUFFLENBQUM7RUFDOUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ2tCd0Isd0JBQXdCQSxDQUFBLEVBQVc7SUFDakQsSUFBSUMsT0FBTyxHQUFHLEtBQUssQ0FBQ0Qsd0JBQXdCLENBQUMsQ0FBQztJQUM5QyxNQUFNRSxNQUFNLEdBQUcsSUFBSSxDQUFDQyxTQUFTLENBQUMsQ0FBQztJQUMvQjtJQUNBLElBQUtELE1BQU0sSUFBSSxFQUFHQSxNQUFNLFlBQVl0RCxRQUFRLENBQUUsSUFBSSxFQUFHc0QsTUFBTSxZQUFZcEQsT0FBTyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUNzRCxXQUFXLENBQUMsQ0FBQyxFQUFHO01BQ3hHO01BQ0EsSUFBSyxJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFDLEtBQUssT0FBTyxJQUFNLElBQUksQ0FBQ0EsV0FBVyxDQUFDLENBQUMsS0FBSyxPQUFPLElBQUkxRCxRQUFRLENBQUMyRCxZQUFjLEVBQUc7UUFDbkdMLE9BQU8sSUFBSTlDLFFBQVEsQ0FBQ29ELFVBQVU7TUFDaEM7SUFDRjtJQUVBLElBQUssQ0FBQyxJQUFJLENBQUNDLFNBQVMsQ0FBQyxDQUFDLEVBQUc7TUFDdkJQLE9BQU8sSUFBSTlDLFFBQVEsQ0FBQ3NELFlBQVk7SUFDbEM7SUFFQSxPQUFPUixPQUFPO0VBQ2hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDa0JTLHNCQUFzQkEsQ0FBQSxFQUFXO0lBQy9DLElBQUlULE9BQU8sR0FBRzlDLFFBQVEsQ0FBQ3dELGFBQWEsR0FBR3hELFFBQVEsQ0FBQ3lELFVBQVU7SUFFMUQsTUFBTUMsY0FBYyxHQUFHLElBQUksQ0FBQ2hCLGlCQUFpQixDQUFDLENBQUM7O0lBRS9DO0lBQ0E7SUFDQTtJQUNBLElBQUssQ0FBRSxDQUFDLElBQUksQ0FBQ1csU0FBUyxDQUFDLENBQUMsSUFBTSxJQUFJLENBQUNNLFlBQVksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDdEMsV0FBVyxJQUFJLElBQUksQ0FBQ3NDLFlBQVksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDdkMsVUFBWSxNQUMxRyxDQUFDLElBQUksQ0FBQ3dDLFNBQVMsQ0FBQyxDQUFDLElBQU1wRSxRQUFRLENBQUMyRCxZQUFZLElBQUksSUFBSSxDQUFDN0IsY0FBYyxLQUFLLElBQUksQ0FBQ0MsY0FBZ0IsQ0FBRSxJQUNqRyxJQUFJLENBQUNBLGNBQWMsSUFBSW1DLGNBQWMsSUFBSSxJQUFJLENBQUNwQyxjQUFjLElBQUlvQyxjQUFjLEVBQUc7TUFDcEZaLE9BQU8sSUFBSTlDLFFBQVEsQ0FBQ29ELFVBQVU7SUFDaEM7O0lBRUE7SUFDQSxJQUFLLENBQUMsSUFBSSxDQUFDQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDTyxTQUFTLENBQUMsQ0FBQyxFQUFHO01BQzVDZCxPQUFPLElBQUk5QyxRQUFRLENBQUNzRCxZQUFZO0lBQ2xDO0lBRUEsT0FBT1IsT0FBTztFQUNoQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTZSxPQUFPQSxDQUFFckQsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLEtBQWEsRUFBRUMsTUFBYyxFQUFFQyxhQUFzQixFQUFFQyxhQUFzQixFQUFTO0lBQzFILE1BQU1pRCxVQUFVLEdBQUdsRCxhQUFhLEtBQUtlLFNBQVM7SUFDOUMsTUFBTW9DLFVBQVUsR0FBR2xELGFBQWEsS0FBS2MsU0FBUztJQUU5Q0gsTUFBTSxJQUFJQSxNQUFNLENBQUV3QyxRQUFRLENBQUV4RCxDQUFFLENBQUMsSUFBSXdELFFBQVEsQ0FBRXZELENBQUUsQ0FBQyxJQUNoRHVELFFBQVEsQ0FBRXRELEtBQU0sQ0FBQyxJQUFJc0QsUUFBUSxDQUFFckQsTUFBTyxDQUFDLEVBQUUsMkNBQTRDLENBQUM7SUFDdEZhLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNzQyxVQUFVLElBQUlFLFFBQVEsQ0FBRXBELGFBQWMsQ0FBQyxLQUN0QyxDQUFDbUQsVUFBVSxJQUFJQyxRQUFRLENBQUVuRCxhQUFjLENBQUMsQ0FBRSxFQUM1RCxxREFBc0QsQ0FBQzs7SUFFekQ7SUFDQSxJQUFLLElBQUksQ0FBQ0ssTUFBTSxLQUFLVixDQUFDLElBQ2pCLElBQUksQ0FBQ1csTUFBTSxLQUFLVixDQUFDLElBQ2pCLElBQUksQ0FBQ1csVUFBVSxLQUFLVixLQUFLLElBQ3pCLElBQUksQ0FBQ1csV0FBVyxLQUFLVixNQUFNLEtBQ3pCLENBQUNtRCxVQUFVLElBQUksSUFBSSxDQUFDeEMsY0FBYyxLQUFLVixhQUFhLENBQUUsS0FDdEQsQ0FBQ21ELFVBQVUsSUFBSSxJQUFJLENBQUN4QyxjQUFjLEtBQUtWLGFBQWEsQ0FBRSxFQUFHO01BQzlELE9BQU8sSUFBSTtJQUNiO0lBRUEsSUFBSSxDQUFDSyxNQUFNLEdBQUdWLENBQUM7SUFDZixJQUFJLENBQUNXLE1BQU0sR0FBR1YsQ0FBQztJQUNmLElBQUksQ0FBQ1csVUFBVSxHQUFHVixLQUFLO0lBQ3ZCLElBQUksQ0FBQ1csV0FBVyxHQUFHVixNQUFNO0lBQ3pCLElBQUksQ0FBQ1csY0FBYyxHQUFHd0MsVUFBVSxHQUFHbEQsYUFBYSxHQUFHLElBQUksQ0FBQ1UsY0FBYztJQUN0RSxJQUFJLENBQUNDLGNBQWMsR0FBR3dDLFVBQVUsR0FBR2xELGFBQWEsR0FBRyxJQUFJLENBQUNVLGNBQWM7SUFFdEUsTUFBTTBDLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsQ0FBQ3hDLE1BQU07SUFDdkMsS0FBTSxJQUFJeUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixRQUFRLEVBQUVFLENBQUMsRUFBRSxFQUFHO01BQ2pDLElBQUksQ0FBQ0QsVUFBVSxDQUFFQyxDQUFDLENBQUUsQ0FBb0NDLGtCQUFrQixDQUFDLENBQUM7SUFDaEY7SUFDQSxJQUFJLENBQUNDLG1CQUFtQixDQUFDLENBQUM7SUFFMUIsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0VBQ1NDLFFBQVFBLENBQUU5RCxDQUFTLEVBQVM7SUFDakNnQixNQUFNLElBQUlBLE1BQU0sQ0FBRXdDLFFBQVEsQ0FBRXhELENBQUUsQ0FBQyxFQUFFLGlDQUFrQyxDQUFDO0lBRXBFLElBQUssSUFBSSxDQUFDVSxNQUFNLEtBQUtWLENBQUMsRUFBRztNQUN2QixJQUFJLENBQUNVLE1BQU0sR0FBR1YsQ0FBQztNQUVmLE1BQU15RCxRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLENBQUN4QyxNQUFNO01BQ3ZDLEtBQU0sSUFBSXlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsUUFBUSxFQUFFRSxDQUFDLEVBQUUsRUFBRztRQUNqQyxJQUFJLENBQUNELFVBQVUsQ0FBRUMsQ0FBQyxDQUFFLENBQW9DSSxVQUFVLENBQUMsQ0FBQztNQUN4RTtNQUVBLElBQUksQ0FBQ0YsbUJBQW1CLENBQUMsQ0FBQztJQUM1QjtJQUNBLE9BQU8sSUFBSTtFQUNiO0VBRUEsSUFBV3JDLEtBQUtBLENBQUV3QyxLQUFhLEVBQUc7SUFBRSxJQUFJLENBQUNGLFFBQVEsQ0FBRUUsS0FBTSxDQUFDO0VBQUU7RUFFNUQsSUFBV3hDLEtBQUtBLENBQUEsRUFBVztJQUFFLE9BQU8sSUFBSSxDQUFDeUMsUUFBUSxDQUFDLENBQUM7RUFBRTs7RUFFckQ7QUFDRjtBQUNBO0VBQ1NBLFFBQVFBLENBQUEsRUFBVztJQUN4QixPQUFPLElBQUksQ0FBQ3ZELE1BQU07RUFDcEI7O0VBRUE7QUFDRjtBQUNBO0VBQ1N3RCxRQUFRQSxDQUFFakUsQ0FBUyxFQUFTO0lBQ2pDZSxNQUFNLElBQUlBLE1BQU0sQ0FBRXdDLFFBQVEsQ0FBRXZELENBQUUsQ0FBQyxFQUFFLGlDQUFrQyxDQUFDO0lBRXBFLElBQUssSUFBSSxDQUFDVSxNQUFNLEtBQUtWLENBQUMsRUFBRztNQUN2QixJQUFJLENBQUNVLE1BQU0sR0FBR1YsQ0FBQztNQUVmLE1BQU13RCxRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLENBQUN4QyxNQUFNO01BQ3ZDLEtBQU0sSUFBSXlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsUUFBUSxFQUFFRSxDQUFDLEVBQUUsRUFBRztRQUNqQyxJQUFJLENBQUNELFVBQVUsQ0FBRUMsQ0FBQyxDQUFFLENBQW9DUSxVQUFVLENBQUMsQ0FBQztNQUN4RTtNQUVBLElBQUksQ0FBQ04sbUJBQW1CLENBQUMsQ0FBQztJQUM1QjtJQUNBLE9BQU8sSUFBSTtFQUNiO0VBRUEsSUFBV3BDLEtBQUtBLENBQUV1QyxLQUFhLEVBQUc7SUFBRSxJQUFJLENBQUNFLFFBQVEsQ0FBRUYsS0FBTSxDQUFDO0VBQUU7RUFFNUQsSUFBV3ZDLEtBQUtBLENBQUEsRUFBVztJQUFFLE9BQU8sSUFBSSxDQUFDMkMsUUFBUSxDQUFDLENBQUM7RUFBRTs7RUFFckQ7QUFDRjtBQUNBO0VBQ1NBLFFBQVFBLENBQUEsRUFBVztJQUN4QixPQUFPLElBQUksQ0FBQ3pELE1BQU07RUFDcEI7O0VBRUE7QUFDRjtBQUNBO0VBQ1MwRCxZQUFZQSxDQUFFbkUsS0FBYSxFQUFTO0lBQ3pDYyxNQUFNLElBQUlBLE1BQU0sQ0FBRXdDLFFBQVEsQ0FBRXRELEtBQU0sQ0FBQyxFQUFFLHFDQUFzQyxDQUFDO0lBRTVFLElBQUssSUFBSSxDQUFDVSxVQUFVLEtBQUtWLEtBQUssRUFBRztNQUMvQixJQUFJLENBQUNVLFVBQVUsR0FBR1YsS0FBSztNQUV2QixNQUFNdUQsUUFBUSxHQUFHLElBQUksQ0FBQ0MsVUFBVSxDQUFDeEMsTUFBTTtNQUN2QyxLQUFNLElBQUl5QyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLFFBQVEsRUFBRUUsQ0FBQyxFQUFFLEVBQUc7UUFDakMsSUFBSSxDQUFDRCxVQUFVLENBQUVDLENBQUMsQ0FBRSxDQUFvQ1csY0FBYyxDQUFDLENBQUM7TUFDNUU7TUFFQSxJQUFJLENBQUNULG1CQUFtQixDQUFDLENBQUM7SUFDNUI7SUFDQSxPQUFPLElBQUk7RUFDYjtFQUVBLElBQVduQyxTQUFTQSxDQUFFc0MsS0FBYSxFQUFHO0lBQUUsSUFBSSxDQUFDSyxZQUFZLENBQUVMLEtBQU0sQ0FBQztFQUFFO0VBRXBFLElBQVd0QyxTQUFTQSxDQUFBLEVBQVc7SUFBRSxPQUFPLElBQUksQ0FBQzZDLFlBQVksQ0FBQyxDQUFDO0VBQUU7O0VBRTdEO0FBQ0Y7QUFDQTtFQUNTQSxZQUFZQSxDQUFBLEVBQVc7SUFDNUIsT0FBTyxJQUFJLENBQUMzRCxVQUFVO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTNEQsYUFBYUEsQ0FBRXJFLE1BQWMsRUFBUztJQUMzQ2EsTUFBTSxJQUFJQSxNQUFNLENBQUV3QyxRQUFRLENBQUVyRCxNQUFPLENBQUMsRUFBRSxzQ0FBdUMsQ0FBQztJQUU5RSxJQUFLLElBQUksQ0FBQ1UsV0FBVyxLQUFLVixNQUFNLEVBQUc7TUFDakMsSUFBSSxDQUFDVSxXQUFXLEdBQUdWLE1BQU07TUFFekIsTUFBTXNELFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsQ0FBQ3hDLE1BQU07TUFDdkMsS0FBTSxJQUFJeUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixRQUFRLEVBQUVFLENBQUMsRUFBRSxFQUFHO1FBQ2pDLElBQUksQ0FBQ0QsVUFBVSxDQUFFQyxDQUFDLENBQUUsQ0FBb0NjLGVBQWUsQ0FBQyxDQUFDO01BQzdFO01BRUEsSUFBSSxDQUFDWixtQkFBbUIsQ0FBQyxDQUFDO0lBQzVCO0lBQ0EsT0FBTyxJQUFJO0VBQ2I7RUFFQSxJQUFXbEMsVUFBVUEsQ0FBRXFDLEtBQWEsRUFBRztJQUFFLElBQUksQ0FBQ1EsYUFBYSxDQUFFUixLQUFNLENBQUM7RUFBRTtFQUV0RSxJQUFXckMsVUFBVUEsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUMrQyxhQUFhLENBQUMsQ0FBQztFQUFFOztFQUUvRDtBQUNGO0FBQ0E7RUFDU0EsYUFBYUEsQ0FBQSxFQUFXO0lBQzdCLE9BQU8sSUFBSSxDQUFDN0QsV0FBVztFQUN6Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDUzhELGdCQUFnQkEsQ0FBRUMsTUFBYyxFQUFTO0lBQzlDNUQsTUFBTSxJQUFJQSxNQUFNLENBQUV3QyxRQUFRLENBQUVvQixNQUFPLENBQUMsRUFBRSx5Q0FBMEMsQ0FBQztJQUVqRixJQUFLLElBQUksQ0FBQzlELGNBQWMsS0FBSzhELE1BQU0sRUFBRztNQUNwQyxJQUFJLENBQUM5RCxjQUFjLEdBQUc4RCxNQUFNO01BRTVCLE1BQU1uQixRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLENBQUN4QyxNQUFNO01BQ3ZDLEtBQU0sSUFBSXlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsUUFBUSxFQUFFRSxDQUFDLEVBQUUsRUFBRztRQUNqQyxJQUFJLENBQUNELFVBQVUsQ0FBRUMsQ0FBQyxDQUFFLENBQW9Da0Isc0JBQXNCLENBQUMsQ0FBQztNQUNwRjtNQUVBLElBQUksQ0FBQ2hCLG1CQUFtQixDQUFDLENBQUM7SUFDNUI7SUFDQSxPQUFPLElBQUk7RUFDYjtFQUVBLElBQVd6RCxhQUFhQSxDQUFFNEQsS0FBYSxFQUFHO0lBQUUsSUFBSSxDQUFDVyxnQkFBZ0IsQ0FBRVgsS0FBTSxDQUFDO0VBQUU7RUFFNUUsSUFBVzVELGFBQWFBLENBQUEsRUFBVztJQUFFLE9BQU8sSUFBSSxDQUFDMEUsZ0JBQWdCLENBQUMsQ0FBQztFQUFFOztFQUVyRTtBQUNGO0FBQ0E7RUFDU0EsZ0JBQWdCQSxDQUFBLEVBQVc7SUFDaEMsT0FBTyxJQUFJLENBQUNoRSxjQUFjO0VBQzVCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTaUUsZ0JBQWdCQSxDQUFFSCxNQUFjLEVBQVM7SUFDOUM1RCxNQUFNLElBQUlBLE1BQU0sQ0FBRXdDLFFBQVEsQ0FBRW9CLE1BQU8sQ0FBQyxFQUFFLHlDQUEwQyxDQUFDO0lBRWpGLElBQUssSUFBSSxDQUFDN0QsY0FBYyxLQUFLNkQsTUFBTSxFQUFHO01BQ3BDLElBQUksQ0FBQzdELGNBQWMsR0FBRzZELE1BQU07TUFFNUIsTUFBTW5CLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsQ0FBQ3hDLE1BQU07TUFDdkMsS0FBTSxJQUFJeUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixRQUFRLEVBQUVFLENBQUMsRUFBRSxFQUFHO1FBQ2pDLElBQUksQ0FBQ0QsVUFBVSxDQUFFQyxDQUFDLENBQUUsQ0FBb0NxQixzQkFBc0IsQ0FBQyxDQUFDO01BQ3BGO01BRUEsSUFBSSxDQUFDbkIsbUJBQW1CLENBQUMsQ0FBQztJQUM1QjtJQUNBLE9BQU8sSUFBSTtFQUNiO0VBRUEsSUFBV3hELGFBQWFBLENBQUUyRCxLQUFhLEVBQUc7SUFBRSxJQUFJLENBQUNlLGdCQUFnQixDQUFFZixLQUFNLENBQUM7RUFBRTtFQUU1RSxJQUFXM0QsYUFBYUEsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUM0RSxnQkFBZ0IsQ0FBQyxDQUFDO0VBQUU7O0VBRXJFO0FBQ0Y7QUFDQTtFQUNTQSxnQkFBZ0JBLENBQUEsRUFBVztJQUNoQyxPQUFPLElBQUksQ0FBQ2xFLGNBQWM7RUFDNUI7O0VBRUE7QUFDRjtBQUNBO0VBQ1NtRSxhQUFhQSxDQUFFQyxNQUFlLEVBQVM7SUFDNUMsSUFBSSxDQUFDOUIsT0FBTyxDQUFFOEIsTUFBTSxDQUFDbkYsQ0FBQyxFQUFFbUYsTUFBTSxDQUFDbEYsQ0FBQyxFQUFFa0YsTUFBTSxDQUFDakYsS0FBSyxFQUFFaUYsTUFBTSxDQUFDaEYsTUFBTyxDQUFDO0lBRS9ELE9BQU8sSUFBSTtFQUNiO0VBRUEsSUFBV29CLFVBQVVBLENBQUV5QyxLQUFjLEVBQUc7SUFBRSxJQUFJLENBQUNrQixhQUFhLENBQUVsQixLQUFNLENBQUM7RUFBRTtFQUV2RSxJQUFXekMsVUFBVUEsQ0FBQSxFQUFZO0lBQUUsT0FBTyxJQUFJLENBQUM2RCxhQUFhLENBQUMsQ0FBQztFQUFFOztFQUVoRTtBQUNGO0FBQ0E7RUFDU0EsYUFBYUEsQ0FBQSxFQUFZO0lBQzlCLE9BQU92RyxPQUFPLENBQUN3RyxJQUFJLENBQUUsSUFBSSxDQUFDM0UsTUFBTSxFQUFFLElBQUksQ0FBQ0MsTUFBTSxFQUFFLElBQUksQ0FBQ0MsVUFBVSxFQUFFLElBQUksQ0FBQ0MsV0FBWSxDQUFDO0VBQ3BGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTeUUsV0FBV0EsQ0FBRUMsSUFBZ0IsRUFBUztJQUMzQyxJQUFJLENBQUNsQixZQUFZLENBQUVrQixJQUFJLENBQUNyRixLQUFNLENBQUM7SUFDL0IsSUFBSSxDQUFDc0UsYUFBYSxDQUFFZSxJQUFJLENBQUNwRixNQUFPLENBQUM7SUFFakMsT0FBTyxJQUFJO0VBQ2I7RUFFQSxJQUFXcUYsUUFBUUEsQ0FBRXhCLEtBQWlCLEVBQUc7SUFBRSxJQUFJLENBQUNzQixXQUFXLENBQUV0QixLQUFNLENBQUM7RUFBRTtFQUV0RSxJQUFXd0IsUUFBUUEsQ0FBQSxFQUFlO0lBQUUsT0FBTyxJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFDO0VBQUU7O0VBRS9EO0FBQ0Y7QUFDQTtFQUNTQSxXQUFXQSxDQUFBLEVBQWU7SUFDL0IsT0FBTyxJQUFJM0csVUFBVSxDQUFFLElBQUksQ0FBQzhCLFVBQVUsRUFBRSxJQUFJLENBQUNDLFdBQVksQ0FBQztFQUM1RDs7RUFFQTtBQUNGO0FBQ0E7RUFDUzZFLHFCQUFxQkEsQ0FBRXhGLEtBQWEsRUFBUztJQUNsRCxJQUFLLElBQUksQ0FBQ1UsVUFBVSxLQUFLVixLQUFLLEVBQUc7TUFDL0IsTUFBTXlGLEtBQUssR0FBRyxJQUFJLENBQUNqRixNQUFNLEdBQUcsSUFBSSxDQUFDRSxVQUFVO01BQzNDLElBQUksQ0FBQ3lELFlBQVksQ0FBRW5FLEtBQU0sQ0FBQztNQUMxQixJQUFJLENBQUM0RCxRQUFRLENBQUU2QixLQUFLLEdBQUd6RixLQUFNLENBQUM7SUFDaEM7SUFFQSxPQUFPLElBQUk7RUFDYjtFQUVBLElBQVcwRixrQkFBa0JBLENBQUU1QixLQUFhLEVBQUc7SUFBRSxJQUFJLENBQUMwQixxQkFBcUIsQ0FBRTFCLEtBQU0sQ0FBQztFQUFFO0VBRXRGLElBQVc0QixrQkFBa0JBLENBQUEsRUFBVztJQUFFLE9BQU8sSUFBSSxDQUFDckIsWUFBWSxDQUFDLENBQUM7RUFBRSxDQUFDLENBQUM7O0VBRXhFO0FBQ0Y7QUFDQTtFQUNTc0IsdUJBQXVCQSxDQUFFMUYsTUFBYyxFQUFTO0lBQ3JELElBQUssSUFBSSxDQUFDVSxXQUFXLEtBQUtWLE1BQU0sRUFBRztNQUNqQyxNQUFNMkYsTUFBTSxHQUFHLElBQUksQ0FBQ25GLE1BQU0sR0FBRyxJQUFJLENBQUNFLFdBQVc7TUFDN0MsSUFBSSxDQUFDMkQsYUFBYSxDQUFFckUsTUFBTyxDQUFDO01BQzVCLElBQUksQ0FBQytELFFBQVEsQ0FBRTRCLE1BQU0sR0FBRzNGLE1BQU8sQ0FBQztJQUNsQztJQUVBLE9BQU8sSUFBSTtFQUNiO0VBRUEsSUFBVzRGLG9CQUFvQkEsQ0FBRS9CLEtBQWEsRUFBRztJQUFFLElBQUksQ0FBQzZCLHVCQUF1QixDQUFFN0IsS0FBTSxDQUFDO0VBQUU7RUFFMUYsSUFBVytCLG9CQUFvQkEsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUNyQixhQUFhLENBQUMsQ0FBQztFQUFFLENBQUMsQ0FBQzs7RUFFM0U7QUFDRjtBQUNBO0FBQ0E7RUFDU3RCLFNBQVNBLENBQUEsRUFBWTtJQUMxQixPQUFPLElBQUksQ0FBQ3RDLGNBQWMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDQyxjQUFjLEtBQUssQ0FBQztFQUMvRDs7RUFFQTtBQUNGO0FBQ0E7RUFDa0JpRixrQkFBa0JBLENBQUEsRUFBWTtJQUM1QyxJQUFJYixNQUFNLEdBQUcsSUFBSXRHLE9BQU8sQ0FBRSxJQUFJLENBQUM2QixNQUFNLEVBQUUsSUFBSSxDQUFDQyxNQUFNLEVBQUUsSUFBSSxDQUFDRCxNQUFNLEdBQUcsSUFBSSxDQUFDRSxVQUFVLEVBQUUsSUFBSSxDQUFDRCxNQUFNLEdBQUcsSUFBSSxDQUFDRSxXQUFZLENBQUM7SUFDbkgsSUFBSyxJQUFJLENBQUNvRixPQUFPLEVBQUc7TUFDbEI7TUFDQWQsTUFBTSxHQUFHQSxNQUFNLENBQUNlLE9BQU8sQ0FBRSxJQUFJLENBQUMvQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUUsQ0FBQztJQUNwRDtJQUNBLE9BQU9nQyxNQUFNO0VBQ2Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDVWdCLG9CQUFvQkEsQ0FBQSxFQUFVO0lBQ3BDLElBQUssSUFBSSxDQUFDL0MsU0FBUyxDQUFDLENBQUMsRUFBRztNQUN0QjtNQUNBLE1BQU1GLGNBQWMsR0FBR2YsSUFBSSxDQUFDQyxHQUFHLENBQUUsSUFBSSxDQUFDeEIsVUFBVSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUNDLFdBQVcsR0FBRyxDQUFFLENBQUM7TUFDNUUsT0FBTzlCLEtBQUssQ0FBQ3FILGNBQWMsQ0FBRSxJQUFJLENBQUMxRixNQUFNLEVBQUUsSUFBSSxDQUFDQyxNQUFNLEVBQUUsSUFBSSxDQUFDQyxVQUFVLEVBQUUsSUFBSSxDQUFDQyxXQUFXLEVBQ3RGc0IsSUFBSSxDQUFDQyxHQUFHLENBQUVjLGNBQWMsRUFBRSxJQUFJLENBQUNwQyxjQUFlLENBQUMsRUFBRXFCLElBQUksQ0FBQ0MsR0FBRyxDQUFFYyxjQUFjLEVBQUUsSUFBSSxDQUFDbkMsY0FBZSxDQUFFLENBQUMsQ0FBQ3NGLGFBQWEsQ0FBQyxDQUFDO0lBQ3RILENBQUMsTUFDSTtNQUNILE9BQU90SCxLQUFLLENBQUN1SCxTQUFTLENBQUUsSUFBSSxDQUFDNUYsTUFBTSxFQUFFLElBQUksQ0FBQ0MsTUFBTSxFQUFFLElBQUksQ0FBQ0MsVUFBVSxFQUFFLElBQUksQ0FBQ0MsV0FBWSxDQUFDLENBQUN3RixhQUFhLENBQUMsQ0FBQztJQUN2RztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNZeEMsbUJBQW1CQSxDQUFBLEVBQVM7SUFDcEM3QyxNQUFNLElBQUlBLE1BQU0sQ0FBRXdDLFFBQVEsQ0FBRSxJQUFJLENBQUM5QyxNQUFPLENBQUMsRUFBRyx5Q0FBd0MsSUFBSSxDQUFDQSxNQUFPLEdBQUcsQ0FBQztJQUNwR00sTUFBTSxJQUFJQSxNQUFNLENBQUV3QyxRQUFRLENBQUUsSUFBSSxDQUFDN0MsTUFBTyxDQUFDLEVBQUcseUNBQXdDLElBQUksQ0FBQ0EsTUFBTyxHQUFHLENBQUM7SUFDcEdLLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ0osVUFBVSxJQUFJLENBQUMsSUFBSTRDLFFBQVEsQ0FBRSxJQUFJLENBQUM1QyxVQUFXLENBQUMsRUFDbEUsMERBQXlELElBQUksQ0FBQ0EsVUFBVyxHQUFHLENBQUM7SUFDaEZJLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ0gsV0FBVyxJQUFJLENBQUMsSUFBSTJDLFFBQVEsQ0FBRSxJQUFJLENBQUMzQyxXQUFZLENBQUMsRUFDcEUsMkRBQTBELElBQUksQ0FBQ0EsV0FBWSxHQUFHLENBQUM7SUFDbEZHLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ0YsY0FBYyxJQUFJLENBQUMsSUFBSTBDLFFBQVEsQ0FBRSxJQUFJLENBQUMxQyxjQUFlLENBQUMsRUFDMUUsNkRBQTRELElBQUksQ0FBQ0EsY0FBZSxHQUFHLENBQUM7SUFDdkZFLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ0QsY0FBYyxJQUFJLENBQUMsSUFBSXlDLFFBQVEsQ0FBRSxJQUFJLENBQUN6QyxjQUFlLENBQUMsRUFDMUUsOERBQTZELElBQUksQ0FBQ0EsY0FBZSxHQUFHLENBQUM7O0lBRXhGO0lBQ0EsSUFBSSxDQUFDd0YsTUFBTSxHQUFHLElBQUk7O0lBRWxCO0lBQ0EsSUFBSSxDQUFDQyxjQUFjLENBQUMsQ0FBQzs7SUFFckI7SUFDQSxJQUFJLENBQUNDLDRCQUE0QixDQUFDLENBQUM7RUFDckM7RUFFUTNFLG9CQUFvQkEsQ0FBQSxFQUFTO0lBQ25DLE1BQU01QixLQUFLLEdBQUcsSUFBSSxDQUFDd0csbUJBQW1CO0lBQ3RDLE1BQU12RyxNQUFNLEdBQUcsSUFBSSxDQUFDd0csb0JBQW9CO0lBRXhDLElBQUt6RyxLQUFLLEtBQUssSUFBSSxFQUFHO01BQ3BCLElBQUksQ0FBQ3dCLFNBQVMsR0FBRyxJQUFJLENBQUNtQixTQUFTLENBQUMsQ0FBQyxHQUFHM0MsS0FBSyxHQUFHLElBQUksQ0FBQzBHLFNBQVMsR0FBRzFHLEtBQUs7SUFDcEU7SUFDQSxJQUFLQyxNQUFNLEtBQUssSUFBSSxFQUFHO01BQ3JCLElBQUksQ0FBQ3dCLFVBQVUsR0FBRyxJQUFJLENBQUNrQixTQUFTLENBQUMsQ0FBQyxHQUFHMUMsTUFBTSxHQUFHLElBQUksQ0FBQ3lHLFNBQVMsR0FBR3pHLE1BQU07SUFDdkU7RUFDRjs7RUFFQTtFQUNnQjBHLGdCQUFnQkEsQ0FBQSxFQUFTO0lBQ3ZDLEtBQUssQ0FBQ0EsZ0JBQWdCLENBQUMsQ0FBQztJQUV4QixJQUFJLENBQUMvRSxvQkFBb0IsQ0FBQyxDQUFDO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNrQmdGLGlCQUFpQkEsQ0FBRUMsS0FBYyxFQUFZO0lBQzNELE1BQU0vRyxDQUFDLEdBQUcsSUFBSSxDQUFDVSxNQUFNO0lBQ3JCLE1BQU1ULENBQUMsR0FBRyxJQUFJLENBQUNVLE1BQU07SUFDckIsTUFBTVQsS0FBSyxHQUFHLElBQUksQ0FBQ1UsVUFBVTtJQUM3QixNQUFNVCxNQUFNLEdBQUcsSUFBSSxDQUFDVSxXQUFXO0lBQy9CLE1BQU1tRyxRQUFRLEdBQUcsSUFBSSxDQUFDbEcsY0FBYztJQUNwQyxNQUFNbUcsU0FBUyxHQUFHLElBQUksQ0FBQ2xHLGNBQWM7SUFDckMsTUFBTW1HLFFBQVEsR0FBRyxJQUFJLENBQUMvRCxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFeEMsSUFBSWdFLE1BQU0sR0FBRyxJQUFJO0lBQ2pCLElBQUssSUFBSSxDQUFDQyxlQUFlLEVBQUc7TUFDMUI7TUFDQSxNQUFNQyxPQUFPLEdBQUcsSUFBSSxDQUFDakUsU0FBUyxDQUFDLENBQUM7TUFDaEMsSUFBSyxDQUFDaUUsT0FBTyxJQUFJLElBQUksQ0FBQzNFLFdBQVcsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFHO1FBQ2hEO1FBQ0EsT0FBTyxLQUFLLENBQUNvRSxpQkFBaUIsQ0FBRUMsS0FBTSxDQUFDO01BQ3pDO01BQ0EsTUFBTU8sS0FBSyxHQUFHLElBQUksQ0FBQzVFLFdBQVcsQ0FBQyxDQUFDLEtBQUssT0FBTyxJQUFJLENBQUMyRSxPQUFPO01BQ3hERixNQUFNLEdBQUdBLE1BQU0sSUFBSXJILFNBQVMsQ0FBQ3lILFVBQVUsQ0FBRXZILENBQUMsR0FBR2tILFFBQVEsRUFBRWpILENBQUMsR0FBR2lILFFBQVEsRUFDakVoSCxLQUFLLEdBQUcsQ0FBQyxHQUFHZ0gsUUFBUSxFQUFFL0csTUFBTSxHQUFHLENBQUMsR0FBRytHLFFBQVEsRUFDM0NJLEtBQUssR0FBRyxDQUFDLEdBQUtOLFFBQVEsR0FBR0UsUUFBVSxFQUFFSSxLQUFLLEdBQUcsQ0FBQyxHQUFLTCxTQUFTLEdBQUdDLFFBQVUsRUFDekVILEtBQU0sQ0FBQztJQUNYO0lBRUEsSUFBSyxJQUFJLENBQUNTLGFBQWEsRUFBRztNQUN4QixJQUFLLElBQUksQ0FBQ0osZUFBZSxFQUFHO1FBQzFCLE9BQU9ELE1BQU07TUFDZixDQUFDLE1BQ0k7UUFDSCxPQUFPckgsU0FBUyxDQUFDeUgsVUFBVSxDQUFFdkgsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFNkcsUUFBUSxFQUFFQyxTQUFTLEVBQUVGLEtBQU0sQ0FBQztNQUNoRjtJQUNGLENBQUMsTUFDSSxJQUFLLElBQUksQ0FBQ0ssZUFBZSxFQUFHO01BQy9CLE9BQU9ELE1BQU0sSUFBSSxDQUFDckgsU0FBUyxDQUFDeUgsVUFBVSxDQUFFdkgsQ0FBQyxHQUFHa0gsUUFBUSxFQUFFakgsQ0FBQyxHQUFHaUgsUUFBUSxFQUNoRWhILEtBQUssR0FBRyxDQUFDLEdBQUdnSCxRQUFRLEVBQUUvRyxNQUFNLEdBQUcsQ0FBQyxHQUFHK0csUUFBUSxFQUMzQ0YsUUFBUSxHQUFHRSxRQUFRLEVBQUVELFNBQVMsR0FBR0MsUUFBUSxFQUN6Q0gsS0FBTSxDQUFDO0lBQ1gsQ0FBQyxNQUNJO01BQ0gsT0FBTyxLQUFLLENBQUMsQ0FBQztJQUNoQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDa0JVLG9CQUFvQkEsQ0FBRXRDLE1BQWUsRUFBWTtJQUMvRCxPQUFPLENBQUMsSUFBSSxDQUFDYSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMwQixZQUFZLENBQUV2QyxNQUFPLENBQUMsQ0FBQ3dDLE9BQU8sQ0FBQyxDQUFDO0VBQ3BFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ3FCQyxlQUFlQSxDQUFFQyxPQUE2QixFQUFFQyxNQUFlLEVBQVM7SUFDekY7SUFDQTFJLHVCQUF1QixDQUFDa0MsU0FBUyxDQUFDeUcsV0FBVyxDQUFFRixPQUFPLEVBQUUsSUFBSSxFQUFFQyxNQUFPLENBQUM7RUFDeEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ2tCRSxpQkFBaUJBLENBQUVDLFFBQWdCLEVBQUVDLFFBQWtCLEVBQW9CO0lBQ3pGO0lBQ0EsT0FBTzdJLG9CQUFvQixDQUFDOEksY0FBYyxDQUFFRixRQUFRLEVBQUVDLFFBQVMsQ0FBQztFQUNsRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDa0JFLGlCQUFpQkEsQ0FBRUgsUUFBZ0IsRUFBRUMsUUFBa0IsRUFBb0I7SUFDekY7SUFDQSxPQUFPNUksb0JBQW9CLENBQUM2SSxjQUFjLENBQUVGLFFBQVEsRUFBRUMsUUFBUyxDQUFDO0VBQ2xFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNrQkcsb0JBQW9CQSxDQUFFSixRQUFnQixFQUFFQyxRQUFrQixFQUF1QjtJQUMvRjtJQUNBLE9BQU85SSx1QkFBdUIsQ0FBQytJLGNBQWMsQ0FBRUYsUUFBUSxFQUFFQyxRQUFTLENBQUM7RUFDckU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ2tCSSxtQkFBbUJBLENBQUVMLFFBQWdCLEVBQUVDLFFBQWtCLEVBQXNCO0lBQzdGO0lBQ0EsT0FBTzNJLHNCQUFzQixDQUFDNEksY0FBYyxDQUFFRixRQUFRLEVBQUVDLFFBQVMsQ0FBQztFQUNwRTs7RUFFQTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ2tCSyxRQUFRQSxDQUFFQyxLQUE0QixFQUFTO0lBQzdELElBQUtBLEtBQUssS0FBSyxJQUFJLEVBQUc7TUFDcEIsTUFBTSxJQUFJQyxLQUFLLENBQUUsMkRBQTRELENBQUM7SUFDaEYsQ0FBQyxNQUNJO01BQ0g7TUFDQSxJQUFJLENBQUNqQyxjQUFjLENBQUMsQ0FBQztJQUN2QjtJQUNBLE9BQU8sSUFBSTtFQUNiOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDa0JrQyxRQUFRQSxDQUFBLEVBQVU7SUFDaEMsSUFBSyxDQUFDLElBQUksQ0FBQ25DLE1BQU0sRUFBRztNQUNsQixJQUFJLENBQUNBLE1BQU0sR0FBRyxJQUFJLENBQUNKLG9CQUFvQixDQUFDLENBQUM7SUFDM0M7SUFDQSxPQUFPLElBQUksQ0FBQ0ksTUFBTTtFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7RUFDa0JvQyxRQUFRQSxDQUFBLEVBQVk7SUFDbEMsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0VBQ1NDLGVBQWVBLENBQUVDLFlBQW9CLEVBQVM7SUFDbkQsSUFBSSxDQUFDbEUsZ0JBQWdCLENBQUVrRSxZQUFhLENBQUM7SUFDckMsSUFBSSxDQUFDOUQsZ0JBQWdCLENBQUU4RCxZQUFhLENBQUM7SUFDckMsT0FBTyxJQUFJO0VBQ2I7RUFFQSxJQUFXQSxZQUFZQSxDQUFFN0UsS0FBYSxFQUFHO0lBQUUsSUFBSSxDQUFDNEUsZUFBZSxDQUFFNUUsS0FBTSxDQUFDO0VBQUU7RUFFMUUsSUFBVzZFLFlBQVlBLENBQUEsRUFBVztJQUFFLE9BQU8sSUFBSSxDQUFDQyxlQUFlLENBQUMsQ0FBQztFQUFFOztFQUVuRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NBLGVBQWVBLENBQUEsRUFBVztJQUMvQjlILE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ0YsY0FBYyxLQUFLLElBQUksQ0FBQ0MsY0FBYyxFQUMzRCxzREFBdUQsQ0FBQztJQUUxRCxPQUFPLElBQUksQ0FBQ0QsY0FBYztFQUM1QjtFQUVnQm1CLE1BQU1BLENBQUV4QixPQUEwQixFQUFTO0lBQ3pELE9BQU8sS0FBSyxDQUFDd0IsTUFBTSxDQUFFeEIsT0FBUSxDQUFDO0VBQ2hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjOEcsVUFBVUEsQ0FBRXZILENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxLQUFhLEVBQUVDLE1BQWMsRUFBRTZHLFFBQWdCLEVBQUVDLFNBQWlCLEVBQUVGLEtBQWMsRUFBWTtJQUM1SSxNQUFNSSxNQUFNLEdBQUdKLEtBQUssQ0FBQy9HLENBQUMsSUFBSUEsQ0FBQyxJQUNaK0csS0FBSyxDQUFDL0csQ0FBQyxJQUFJQSxDQUFDLEdBQUdFLEtBQUssSUFDcEI2RyxLQUFLLENBQUM5RyxDQUFDLElBQUlBLENBQUMsSUFDWjhHLEtBQUssQ0FBQzlHLENBQUMsSUFBSUEsQ0FBQyxHQUFHRSxNQUFNO0lBRXBDLElBQUssQ0FBQ2dILE1BQU0sSUFBSUgsUUFBUSxJQUFJLENBQUMsSUFBSUMsU0FBUyxJQUFJLENBQUMsRUFBRztNQUNoRCxPQUFPRSxNQUFNO0lBQ2Y7O0lBRUE7SUFDQSxNQUFNakUsY0FBYyxHQUFHZixJQUFJLENBQUNDLEdBQUcsQ0FBRWxDLEtBQUssR0FBRyxDQUFDLEVBQUVDLE1BQU0sR0FBRyxDQUFFLENBQUM7SUFDeEQ2RyxRQUFRLEdBQUc3RSxJQUFJLENBQUNDLEdBQUcsQ0FBRWMsY0FBYyxFQUFFOEQsUUFBUyxDQUFDO0lBQy9DQyxTQUFTLEdBQUc5RSxJQUFJLENBQUNDLEdBQUcsQ0FBRWMsY0FBYyxFQUFFK0QsU0FBVSxDQUFDOztJQUVqRDs7SUFFQTtJQUNBLElBQUk4QixjQUFjO0lBQ2xCLElBQUlDLGNBQWM7SUFDbEIsSUFBSUMsZ0JBQWdCLEdBQUcsS0FBSzs7SUFFNUI7SUFDQSxJQUFLbEMsS0FBSyxDQUFDL0csQ0FBQyxHQUFHQSxDQUFDLEdBQUdFLEtBQUssR0FBRyxDQUFDLEVBQUc7TUFDN0I2SSxjQUFjLEdBQUcvSSxDQUFDLEdBQUdnSCxRQUFRO01BQzdCaUMsZ0JBQWdCLEdBQUdBLGdCQUFnQixJQUFJbEMsS0FBSyxDQUFDL0csQ0FBQyxJQUFJK0ksY0FBYztJQUNsRSxDQUFDLE1BQ0k7TUFDSEEsY0FBYyxHQUFHL0ksQ0FBQyxHQUFHRSxLQUFLLEdBQUc4RyxRQUFRO01BQ3JDaUMsZ0JBQWdCLEdBQUdBLGdCQUFnQixJQUFJbEMsS0FBSyxDQUFDL0csQ0FBQyxJQUFJK0ksY0FBYztJQUNsRTtJQUNBLElBQUtFLGdCQUFnQixFQUFHO01BQUUsT0FBTyxJQUFJO0lBQUU7SUFFdkMsSUFBS2xDLEtBQUssQ0FBQzlHLENBQUMsR0FBR0EsQ0FBQyxHQUFHRSxNQUFNLEdBQUcsQ0FBQyxFQUFHO01BQzlCNkksY0FBYyxHQUFHL0ksQ0FBQyxHQUFHZ0gsU0FBUztNQUM5QmdDLGdCQUFnQixHQUFHQSxnQkFBZ0IsSUFBSWxDLEtBQUssQ0FBQzlHLENBQUMsSUFBSStJLGNBQWM7SUFDbEUsQ0FBQyxNQUNJO01BQ0hBLGNBQWMsR0FBRy9JLENBQUMsR0FBR0UsTUFBTSxHQUFHOEcsU0FBUztNQUN2Q2dDLGdCQUFnQixHQUFHQSxnQkFBZ0IsSUFBSWxDLEtBQUssQ0FBQzlHLENBQUMsSUFBSStJLGNBQWM7SUFDbEU7SUFDQSxJQUFLQyxnQkFBZ0IsRUFBRztNQUFFLE9BQU8sSUFBSTtJQUFFOztJQUV2Qzs7SUFFQTtJQUNBLElBQUlDLE9BQU8sR0FBR25DLEtBQUssQ0FBQy9HLENBQUMsR0FBRytJLGNBQWM7SUFDdEMsSUFBSUksT0FBTyxHQUFHcEMsS0FBSyxDQUFDOUcsQ0FBQyxHQUFHK0ksY0FBYzs7SUFFdEM7SUFDQTtJQUNBO0lBQ0FFLE9BQU8sSUFBSWxDLFFBQVE7SUFDbkJtQyxPQUFPLElBQUlsQyxTQUFTO0lBRXBCaUMsT0FBTyxJQUFJQSxPQUFPO0lBQ2xCQyxPQUFPLElBQUlBLE9BQU87SUFDbEIsT0FBT0QsT0FBTyxHQUFHQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDakM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWM5RCxJQUFJQSxDQUFFckYsQ0FBUyxFQUFFQyxDQUFTLEVBQUVDLEtBQWEsRUFBRUMsTUFBYyxFQUFFTSxPQUEwQixFQUFjO0lBQy9HLE9BQU8sSUFBSVgsU0FBUyxDQUFFRSxDQUFDLEVBQUVDLENBQUMsRUFBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRU0sT0FBUSxDQUFDO0VBQzVEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjMkksV0FBV0EsQ0FBRXBKLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxLQUFhLEVBQUVDLE1BQWMsRUFBRUMsYUFBcUIsRUFBRUMsYUFBcUIsRUFBRUksT0FBMEIsRUFBYztJQUNwSyxPQUFPLElBQUlYLFNBQVMsQ0FBRUUsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxhQUFhLEVBQUVDLGFBQWEsRUFBRUksT0FBUSxDQUFDO0VBQ3BGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjMEUsTUFBTUEsQ0FBRUEsTUFBZSxFQUFFMUUsT0FBMEIsRUFBYztJQUM3RSxPQUFPLElBQUlYLFNBQVMsQ0FBRXFGLE1BQU0sQ0FBQ2tFLElBQUksRUFBRWxFLE1BQU0sQ0FBQ21FLElBQUksRUFBRW5FLE1BQU0sQ0FBQ2pGLEtBQUssRUFBRWlGLE1BQU0sQ0FBQ2hGLE1BQU0sRUFBRU0sT0FBUSxDQUFDO0VBQ3hGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWM4SSxhQUFhQSxDQUFFcEUsTUFBZSxFQUFFL0UsYUFBcUIsRUFBRUMsYUFBcUIsRUFBRUksT0FBMEIsRUFBYztJQUNsSSxPQUFPLElBQUlYLFNBQVMsQ0FBRXFGLE1BQU0sQ0FBQ2tFLElBQUksRUFBRWxFLE1BQU0sQ0FBQ21FLElBQUksRUFBRW5FLE1BQU0sQ0FBQ2pGLEtBQUssRUFBRWlGLE1BQU0sQ0FBQ2hGLE1BQU0sRUFBRUMsYUFBYSxFQUFFQyxhQUFhLEVBQUVJLE9BQVEsQ0FBQztFQUN0SDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBYytJLFNBQVNBLENBQUVBLFNBQXFCLEVBQUUvSSxPQUEwQixFQUFjO0lBQ3RGLE9BQU8sSUFBSVgsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUwSixTQUFTLENBQUN0SixLQUFLLEVBQUVzSixTQUFTLENBQUNySixNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRU0sT0FBUSxDQUFDO0VBQ2hGO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQVgsU0FBUyxDQUFDd0IsU0FBUyxDQUFDbUksWUFBWSxHQUFHLENBQUUsR0FBRzdKLHFCQUFxQixFQUFFLEdBQUdDLFNBQVMsQ0FBQ3lCLFNBQVMsQ0FBQ21JLFlBQVksQ0FBRTs7QUFFcEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTNKLFNBQVMsQ0FBQ3dCLFNBQVMsQ0FBQ29JLGlCQUFpQixHQUFHeEssSUFBSSxDQUFDb0MsU0FBUyxDQUFDb0ksaUJBQWlCLENBQUNDLE1BQU0sQ0FBRSxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFHLENBQUMsQ0FBQ0MsTUFBTSxDQUFFQyxJQUFJLElBQUlBLElBQUksS0FBSyxPQUFRLENBQUM7QUFFdkxwSyxPQUFPLENBQUNxSyxRQUFRLENBQUUsV0FBVyxFQUFFaEssU0FBVSxDQUFDIn0=