// Copyright 2013-2023, University of Colorado Boulder

/**
 * A 2D rectangle-shaped bounded area (bounding box).
 *
 * There are a number of convenience functions to get positions and points on the Bounds. Currently we do not
 * store these with the Bounds2 instance, since we want to lower the memory footprint.
 *
 * minX, minY, maxX, and maxY are actually stored. We don't do x,y,width,height because this can't properly express
 * semi-infinite bounds (like a half-plane), or easily handle what Bounds2.NOTHING and Bounds2.EVERYTHING do with
 * the constructive solid areas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IOType from '../../tandem/js/types/IOType.js';
import InfiniteNumberIO from '../../tandem/js/types/InfiniteNumberIO.js';
import Vector2 from './Vector2.js';
import dot from './dot.js';
import Range from './Range.js';
import Pool from '../../phet-core/js/Pool.js';
import Orientation from '../../phet-core/js/Orientation.js';

// Temporary instances to be used in the transform method.
const scratchVector2 = new Vector2(0, 0);
// TODO: Why does freeToPool get promoted, but nothing else? https://github.com/phetsims/phet-core/issues/103
// TODO: Do we need TPoolable? Can classes just have a static pool method? https://github.com/phetsims/phet-core/issues/103
export default class Bounds2 {
  // The minimum X coordinate of the bounds.

  // The minimum Y coordinate of the bounds.

  // The maximum X coordinate of the bounds.

  // The maximum Y coordinate of the bounds.

  /**
   * Creates a 2-dimensional bounds (bounding box).
   *
   * @param minX - The initial minimum X coordinate of the bounds.
   * @param minY - The initial minimum Y coordinate of the bounds.
   * @param maxX - The initial maximum X coordinate of the bounds.
   * @param maxY - The initial maximum Y coordinate of the bounds.
   */
  constructor(minX, minY, maxX, maxY) {
    assert && assert(maxY !== undefined, 'Bounds2 requires 4 parameters');
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  /*---------------------------------------------------------------------------*
   * Properties
   *---------------------------------------------------------------------------*/

  /**
   * The width of the bounds, defined as maxX - minX.
   */
  getWidth() {
    return this.maxX - this.minX;
  }
  get width() {
    return this.getWidth();
  }

  /**
   * The height of the bounds, defined as maxY - minY.
   */
  getHeight() {
    return this.maxY - this.minY;
  }
  get height() {
    return this.getHeight();
  }

  /*
   * Convenience positions
   * upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
   *
   *             minX (x)     centerX        maxX
   *          ---------------------------------------
   * minY (y) | leftTop     centerTop     rightTop
   * centerY  | leftCenter  center        rightCenter
   * maxY     | leftBottom  centerBottom  rightBottom
   */

  /**
   * Alias for minX, when thinking of the bounds as an (x,y,width,height) rectangle.
   */
  getX() {
    return this.minX;
  }
  get x() {
    return this.getX();
  }

  /**
   * Alias for minY, when thinking of the bounds as an (x,y,width,height) rectangle.
   */
  getY() {
    return this.minY;
  }
  get y() {
    return this.getY();
  }

  /**
   * Alias for minX, supporting the explicit getter function style.
   */
  getMinX() {
    return this.minX;
  }

  /**
   * Alias for minY, supporting the explicit getter function style.
   */
  getMinY() {
    return this.minY;
  }

  /**
   * Alias for maxX, supporting the explicit getter function style.
   */
  getMaxX() {
    return this.maxX;
  }

  /**
   * Alias for maxY, supporting the explicit getter function style.
   */
  getMaxY() {
    return this.maxY;
  }

  /**
   * Alias for minX, when thinking in the UI-layout manner.
   */
  getLeft() {
    return this.minX;
  }
  get left() {
    return this.minX;
  }

  /**
   * Alias for minY, when thinking in the UI-layout manner.
   */
  getTop() {
    return this.minY;
  }
  get top() {
    return this.minY;
  }

  /**
   * Alias for maxX, when thinking in the UI-layout manner.
   */
  getRight() {
    return this.maxX;
  }
  get right() {
    return this.maxX;
  }

  /**
   * Alias for maxY, when thinking in the UI-layout manner.
   */
  getBottom() {
    return this.maxY;
  }
  get bottom() {
    return this.maxY;
  }

  /**
   * The horizontal (X-coordinate) center of the bounds, averaging the minX and maxX.
   */
  getCenterX() {
    return (this.maxX + this.minX) / 2;
  }
  get centerX() {
    return this.getCenterX();
  }

  /**
   * The vertical (Y-coordinate) center of the bounds, averaging the minY and maxY.
   */
  getCenterY() {
    return (this.maxY + this.minY) / 2;
  }
  get centerY() {
    return this.getCenterY();
  }

  /**
   * The point (minX, minY), in the UI-coordinate upper-left.
   */
  getLeftTop() {
    return new Vector2(this.minX, this.minY);
  }
  get leftTop() {
    return this.getLeftTop();
  }

  /**
   * The point (centerX, minY), in the UI-coordinate upper-center.
   */
  getCenterTop() {
    return new Vector2(this.getCenterX(), this.minY);
  }
  get centerTop() {
    return this.getCenterTop();
  }

  /**
   * The point (right, minY), in the UI-coordinate upper-right.
   */
  getRightTop() {
    return new Vector2(this.maxX, this.minY);
  }
  get rightTop() {
    return this.getRightTop();
  }

  /**
   * The point (left, centerY), in the UI-coordinate center-left.
   */
  getLeftCenter() {
    return new Vector2(this.minX, this.getCenterY());
  }
  get leftCenter() {
    return this.getLeftCenter();
  }

  /**
   * The point (centerX, centerY), in the center of the bounds.
   */
  getCenter() {
    return new Vector2(this.getCenterX(), this.getCenterY());
  }
  get center() {
    return this.getCenter();
  }

  /**
   * The point (maxX, centerY), in the UI-coordinate center-right
   */
  getRightCenter() {
    return new Vector2(this.maxX, this.getCenterY());
  }
  get rightCenter() {
    return this.getRightCenter();
  }

  /**
   * The point (minX, maxY), in the UI-coordinate lower-left
   */
  getLeftBottom() {
    return new Vector2(this.minX, this.maxY);
  }
  get leftBottom() {
    return this.getLeftBottom();
  }

  /**
   * The point (centerX, maxY), in the UI-coordinate lower-center
   */
  getCenterBottom() {
    return new Vector2(this.getCenterX(), this.maxY);
  }
  get centerBottom() {
    return this.getCenterBottom();
  }

  /**
   * The point (maxX, maxY), in the UI-coordinate lower-right
   */
  getRightBottom() {
    return new Vector2(this.maxX, this.maxY);
  }
  get rightBottom() {
    return this.getRightBottom();
  }

  /**
   * Whether we have negative width or height. Bounds2.NOTHING is a prime example of an empty Bounds2.
   * Bounds with width = height = 0 are considered not empty, since they include the single (0,0) point.
   */
  isEmpty() {
    return this.getWidth() < 0 || this.getHeight() < 0;
  }

  /**
   * Whether our minimums and maximums are all finite numbers. This will exclude Bounds2.NOTHING and Bounds2.EVERYTHING.
   */
  isFinite() {
    return isFinite(this.minX) && isFinite(this.minY) && isFinite(this.maxX) && isFinite(this.maxY);
  }

  /**
   * Whether this bounds has a non-zero area (non-zero positive width and height).
   */
  hasNonzeroArea() {
    return this.getWidth() > 0 && this.getHeight() > 0;
  }

  /**
   * Whether this bounds has a finite and non-negative width and height.
   */
  isValid() {
    return !this.isEmpty() && this.isFinite();
  }

  /**
   * If the point is inside the bounds, the point will be returned. Otherwise, this will return a new point
   * on the edge of the bounds that is the closest to the provided point.
   */
  closestPointTo(point) {
    if (this.containsCoordinates(point.x, point.y)) {
      return point;
    } else {
      return this.getConstrainedPoint(point);
    }
  }

  /**
   * Find the point on the boundary of the Bounds2 that is closest to the provided point.
   */
  closestBoundaryPointTo(point) {
    if (this.containsCoordinates(point.x, point.y)) {
      const closestXEdge = point.x < this.centerX ? this.minX : this.maxX;
      const closestYEdge = point.y < this.centerY ? this.minY : this.maxY;

      // Decide which cardinal direction to go based on simple distance.
      if (Math.abs(closestXEdge - point.x) < Math.abs(closestYEdge - point.y)) {
        return new Vector2(closestXEdge, point.y);
      } else {
        return new Vector2(point.x, closestYEdge);
      }
    } else {
      return this.getConstrainedPoint(point);
    }
  }

  /**
   * Give a point outside of this Bounds2, constrain it to a point on the boundary of this Bounds2.
   */
  getConstrainedPoint(point) {
    const xConstrained = Math.max(Math.min(point.x, this.maxX), this.x);
    const yConstrained = Math.max(Math.min(point.y, this.maxY), this.y);
    return new Vector2(xConstrained, yConstrained);
  }

  /**
   * Whether the coordinates are contained inside the bounding box, or are on the boundary.
   *
   * @param x - X coordinate of the point to check
   * @param y - Y coordinate of the point to check
   */
  containsCoordinates(x, y) {
    return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
  }

  /**
   * Whether the point is contained inside the bounding box, or is on the boundary.
   */
  containsPoint(point) {
    return this.containsCoordinates(point.x, point.y);
  }

  /**
   * Whether this bounding box completely contains the bounding box passed as a parameter. The boundary of a box is
   * considered to be "contained".
   */
  containsBounds(bounds) {
    return this.minX <= bounds.minX && this.maxX >= bounds.maxX && this.minY <= bounds.minY && this.maxY >= bounds.maxY;
  }

  /**
   * Whether this and another bounding box have any points of intersection (including touching boundaries).
   */
  intersectsBounds(bounds) {
    const minX = Math.max(this.minX, bounds.minX);
    const minY = Math.max(this.minY, bounds.minY);
    const maxX = Math.min(this.maxX, bounds.maxX);
    const maxY = Math.min(this.maxY, bounds.maxY);
    return maxX - minX >= 0 && maxY - minY >= 0;
  }

  /**
   * The squared distance from the input point to the point closest to it inside the bounding box.
   */
  minimumDistanceToPointSquared(point) {
    const closeX = point.x < this.minX ? this.minX : point.x > this.maxX ? this.maxX : null;
    const closeY = point.y < this.minY ? this.minY : point.y > this.maxY ? this.maxY : null;
    let d;
    if (closeX === null && closeY === null) {
      // inside, or on the boundary
      return 0;
    } else if (closeX === null) {
      // vertically directly above/below
      d = closeY - point.y;
      return d * d;
    } else if (closeY === null) {
      // horizontally directly to the left/right
      d = closeX - point.x;
      return d * d;
    } else {
      // corner case
      const dx = closeX - point.x;
      const dy = closeY - point.y;
      return dx * dx + dy * dy;
    }
  }

  /**
   * The squared distance from the input point to the point furthest from it inside the bounding box.
   */
  maximumDistanceToPointSquared(point) {
    let x = point.x > this.getCenterX() ? this.minX : this.maxX;
    let y = point.y > this.getCenterY() ? this.minY : this.maxY;
    x -= point.x;
    y -= point.y;
    return x * x + y * y;
  }

  /**
   * Debugging string for the bounds.
   */
  toString() {
    return `[x:(${this.minX},${this.maxX}),y:(${this.minY},${this.maxY})]`;
  }

  /**
   * Exact equality comparison between this bounds and another bounds.
   *
   * @returns - Whether the two bounds are equal
   */
  equals(other) {
    return this.minX === other.minX && this.minY === other.minY && this.maxX === other.maxX && this.maxY === other.maxY;
  }

  /**
   * Approximate equality comparison between this bounds and another bounds.
   *
   * @returns - Whether difference between the two bounds has no min/max with an absolute value greater
   *            than epsilon.
   */
  equalsEpsilon(other, epsilon) {
    epsilon = epsilon !== undefined ? epsilon : 0;
    const thisFinite = this.isFinite();
    const otherFinite = other.isFinite();
    if (thisFinite && otherFinite) {
      // both are finite, so we can use Math.abs() - it would fail with non-finite values like Infinity
      return Math.abs(this.minX - other.minX) < epsilon && Math.abs(this.minY - other.minY) < epsilon && Math.abs(this.maxX - other.maxX) < epsilon && Math.abs(this.maxY - other.maxY) < epsilon;
    } else if (thisFinite !== otherFinite) {
      return false; // one is finite, the other is not. definitely not equal
    } else if (this === other) {
      return true; // exact same instance, must be equal
    } else {
      // epsilon only applies on finite dimensions. due to JS's handling of isFinite(), it's faster to check the sum of both
      return (isFinite(this.minX + other.minX) ? Math.abs(this.minX - other.minX) < epsilon : this.minX === other.minX) && (isFinite(this.minY + other.minY) ? Math.abs(this.minY - other.minY) < epsilon : this.minY === other.minY) && (isFinite(this.maxX + other.maxX) ? Math.abs(this.maxX - other.maxX) < epsilon : this.maxX === other.maxX) && (isFinite(this.maxY + other.maxY) ? Math.abs(this.maxY - other.maxY) < epsilon : this.maxY === other.maxY);
    }
  }

  /*---------------------------------------------------------------------------*
   * Immutable operations
   *---------------------------------------------------------------------------*/

  /**
   * Creates a copy of this bounds, or if a bounds is passed in, set that bounds's values to ours.
   *
   * This is the immutable form of the function set(), if a bounds is provided. This will return a new bounds, and
   * will not modify this bounds.
   *
   * @param [bounds] - If not provided, creates a new Bounds2 with filled in values. Otherwise, fills in the
   *                   values of the provided bounds so that it equals this bounds.
   */
  copy(bounds) {
    if (bounds) {
      return bounds.set(this);
    } else {
      return b2(this.minX, this.minY, this.maxX, this.maxY);
    }
  }

  /**
   * The smallest bounds that contains both this bounds and the input bounds, returned as a copy.
   *
   * This is the immutable form of the function includeBounds(). This will return a new bounds, and will not modify
   * this bounds.
   */
  union(bounds) {
    return b2(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY));
  }

  /**
   * The smallest bounds that is contained by both this bounds and the input bounds, returned as a copy.
   *
   * This is the immutable form of the function constrainBounds(). This will return a new bounds, and will not modify
   * this bounds.
   */
  intersection(bounds) {
    return b2(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY));
  }

  // TODO: difference should be well-defined, but more logic is needed to compute

  /**
   * The smallest bounds that contains this bounds and the point (x,y), returned as a copy.
   *
   * This is the immutable form of the function addCoordinates(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withCoordinates(x, y) {
    return b2(Math.min(this.minX, x), Math.min(this.minY, y), Math.max(this.maxX, x), Math.max(this.maxY, y));
  }

  /**
   * The smallest bounds that contains this bounds and the input point, returned as a copy.
   *
   * This is the immutable form of the function addPoint(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withPoint(point) {
    return this.withCoordinates(point.x, point.y);
  }

  /**
   * Returns the smallest bounds that contains both this bounds and the x value provided.
   *
   * This is the immutable form of the function addX(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withX(x) {
    return this.copy().addX(x);
  }

  /**
   * Returns the smallest bounds that contains both this bounds and the y value provided.
   *
   * This is the immutable form of the function addY(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withY(y) {
    return this.copy().addY(y);
  }

  /**
   * A copy of this bounds, with minX replaced with the input.
   *
   * This is the immutable form of the function setMinX(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withMinX(minX) {
    return b2(minX, this.minY, this.maxX, this.maxY);
  }

  /**
   * A copy of this bounds, with minY replaced with the input.
   *
   * This is the immutable form of the function setMinY(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withMinY(minY) {
    return b2(this.minX, minY, this.maxX, this.maxY);
  }

  /**
   * A copy of this bounds, with maxX replaced with the input.
   *
   * This is the immutable form of the function setMaxX(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withMaxX(maxX) {
    return b2(this.minX, this.minY, maxX, this.maxY);
  }

  /**
   * A copy of this bounds, with maxY replaced with the input.
   *
   * This is the immutable form of the function setMaxY(). This will return a new bounds, and will not modify
   * this bounds.
   */
  withMaxY(maxY) {
    return b2(this.minX, this.minY, this.maxX, maxY);
  }

  /**
   * A copy of this bounds, with the minimum values rounded down to the nearest integer, and the maximum values
   * rounded up to the nearest integer. This causes the bounds to expand as necessary so that its boundaries
   * are integer-aligned.
   *
   * This is the immutable form of the function roundOut(). This will return a new bounds, and will not modify
   * this bounds.
   */
  roundedOut() {
    return b2(Math.floor(this.minX), Math.floor(this.minY), Math.ceil(this.maxX), Math.ceil(this.maxY));
  }

  /**
   * A copy of this bounds, with the minimum values rounded up to the nearest integer, and the maximum values
   * rounded down to the nearest integer. This causes the bounds to contract as necessary so that its boundaries
   * are integer-aligned.
   *
   * This is the immutable form of the function roundIn(). This will return a new bounds, and will not modify
   * this bounds.
   */
  roundedIn() {
    return b2(Math.ceil(this.minX), Math.ceil(this.minY), Math.floor(this.maxX), Math.floor(this.maxY));
  }

  /**
   * A bounding box (still axis-aligned) that contains the transformed shape of this bounds, applying the matrix as
   * an affine transformation.
   *
   * NOTE: bounds.transformed( matrix ).transformed( inverse ) may be larger than the original box, if it includes
   * a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in area to cover
   * ALL of the corners of the transformed bounding box.
   *
   * This is the immutable form of the function transform(). This will return a new bounds, and will not modify
   * this bounds.
   */
  transformed(matrix) {
    return this.copy().transform(matrix);
  }

  /**
   * A bounding box that is expanded on all sides by the specified amount.)
   *
   * This is the immutable form of the function dilate(). This will return a new bounds, and will not modify
   * this bounds.
   */
  dilated(d) {
    return this.dilatedXY(d, d);
  }

  /**
   * A bounding box that is expanded horizontally (on the left and right) by the specified amount.
   *
   * This is the immutable form of the function dilateX(). This will return a new bounds, and will not modify
   * this bounds.
   */
  dilatedX(x) {
    return b2(this.minX - x, this.minY, this.maxX + x, this.maxY);
  }

  /**
   * A bounding box that is expanded vertically (on the top and bottom) by the specified amount.
   *
   * This is the immutable form of the function dilateY(). This will return a new bounds, and will not modify
   * this bounds.
   */
  dilatedY(y) {
    return b2(this.minX, this.minY - y, this.maxX, this.maxY + y);
  }

  /**
   * A bounding box that is expanded on all sides, with different amounts of expansion horizontally and vertically.
   * Will be identical to the bounds returned by calling bounds.dilatedX( x ).dilatedY( y ).
   *
   * This is the immutable form of the function dilateXY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param x - Amount to dilate horizontally (for each side)
   * @param y - Amount to dilate vertically (for each side)
   */
  dilatedXY(x, y) {
    return b2(this.minX - x, this.minY - y, this.maxX + x, this.maxY + y);
  }

  /**
   * A bounding box that is contracted on all sides by the specified amount.
   *
   * This is the immutable form of the function erode(). This will return a new bounds, and will not modify
   * this bounds.
   */
  eroded(amount) {
    return this.dilated(-amount);
  }

  /**
   * A bounding box that is contracted horizontally (on the left and right) by the specified amount.
   *
   * This is the immutable form of the function erodeX(). This will return a new bounds, and will not modify
   * this bounds.
   */
  erodedX(x) {
    return this.dilatedX(-x);
  }

  /**
   * A bounding box that is contracted vertically (on the top and bottom) by the specified amount.
   *
   * This is the immutable form of the function erodeY(). This will return a new bounds, and will not modify
   * this bounds.
   */
  erodedY(y) {
    return this.dilatedY(-y);
  }

  /**
   * A bounding box that is contracted on all sides, with different amounts of contraction horizontally and vertically.
   *
   * This is the immutable form of the function erodeXY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param x - Amount to erode horizontally (for each side)
   * @param y - Amount to erode vertically (for each side)
   */
  erodedXY(x, y) {
    return this.dilatedXY(-x, -y);
  }

  /**
   * A bounding box that is expanded by a specific amount on all sides (or if some offsets are negative, will contract
   * those sides).
   *
   * This is the immutable form of the function offset(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param left - Amount to expand to the left (subtracts from minX)
   * @param top - Amount to expand to the top (subtracts from minY)
   * @param right - Amount to expand to the right (adds to maxX)
   * @param bottom - Amount to expand to the bottom (adds to maxY)
   */
  withOffsets(left, top, right, bottom) {
    return b2(this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom);
  }

  /**
   * Our bounds, translated horizontally by x, returned as a copy.
   *
   * This is the immutable form of the function shiftX(). This will return a new bounds, and will not modify
   * this bounds.
   */
  shiftedX(x) {
    return b2(this.minX + x, this.minY, this.maxX + x, this.maxY);
  }

  /**
   * Our bounds, translated vertically by y, returned as a copy.
   *
   * This is the immutable form of the function shiftY(). This will return a new bounds, and will not modify
   * this bounds.
   */
  shiftedY(y) {
    return b2(this.minX, this.minY + y, this.maxX, this.maxY + y);
  }

  /**
   * Our bounds, translated by (x,y), returned as a copy.
   *
   * This is the immutable form of the function shift(). This will return a new bounds, and will not modify
   * this bounds.
   */
  shiftedXY(x, y) {
    return b2(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
  }

  /**
   * Returns our bounds, translated by a vector, returned as a copy.
   */
  shifted(v) {
    return this.shiftedXY(v.x, v.y);
  }

  /**
   * Returns an interpolated value of this bounds and the argument.
   *
   * @param bounds
   * @param ratio - 0 will result in a copy of `this`, 1 will result in bounds, and in-between controls the
   *                         amount of each.
   */
  blend(bounds, ratio) {
    const t = 1 - ratio;
    return b2(t * this.minX + ratio * bounds.minX, t * this.minY + ratio * bounds.minY, t * this.maxX + ratio * bounds.maxX, t * this.maxY + ratio * bounds.maxY);
  }

  /*---------------------------------------------------------------------------*
   * Mutable operations
   *
   * All mutable operations should call one of the following:
   *   setMinMax, setMinX, setMinY, setMaxX, setMaxY
   *---------------------------------------------------------------------------*/

  /**
   * Sets each value for this bounds, and returns itself.
   */
  setMinMax(minX, minY, maxX, maxY) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    return this;
  }

  /**
   * Sets the value of minX.
   *
   * This is the mutable form of the function withMinX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  setMinX(minX) {
    this.minX = minX;
    return this;
  }

  /**
   * Sets the value of minY.
   *
   * This is the mutable form of the function withMinY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  setMinY(minY) {
    this.minY = minY;
    return this;
  }

  /**
   * Sets the value of maxX.
   *
   * This is the mutable form of the function withMaxX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  setMaxX(maxX) {
    this.maxX = maxX;
    return this;
  }

  /**
   * Sets the value of maxY.
   *
   * This is the mutable form of the function withMaxY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  setMaxY(maxY) {
    this.maxY = maxY;
    return this;
  }

  /**
   * Sets the values of this bounds to be equal to the input bounds.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  set(bounds) {
    return this.setMinMax(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  }

  /**
   * Modifies this bounds so that it contains both its original bounds and the input bounds.
   *
   * This is the mutable form of the function union(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  includeBounds(bounds) {
    return this.setMinMax(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY));
  }

  /**
   * Modifies this bounds so that it is the largest bounds contained both in its original bounds and in the input bounds.
   *
   * This is the mutable form of the function intersection(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  constrainBounds(bounds) {
    return this.setMinMax(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY));
  }

  /**
   * Modifies this bounds so that it contains both its original bounds and the input point (x,y).
   *
   * This is the mutable form of the function withCoordinates(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  addCoordinates(x, y) {
    return this.setMinMax(Math.min(this.minX, x), Math.min(this.minY, y), Math.max(this.maxX, x), Math.max(this.maxY, y));
  }

  /**
   * Modifies this bounds so that it contains both its original bounds and the input point.
   *
   * This is the mutable form of the function withPoint(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  addPoint(point) {
    return this.addCoordinates(point.x, point.y);
  }

  /**
   * Modifies this bounds so that it is guaranteed to include the given x value (if it didn't already). If the x value
   * was already contained, nothing will be done.
   *
   * This is the mutable form of the function withX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  addX(x) {
    this.minX = Math.min(x, this.minX);
    this.maxX = Math.max(x, this.maxX);
    return this;
  }

  /**
   * Modifies this bounds so that it is guaranteed to include the given y value (if it didn't already). If the y value
   * was already contained, nothing will be done.
   *
   * This is the mutable form of the function withY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  addY(y) {
    this.minY = Math.min(y, this.minY);
    this.maxY = Math.max(y, this.maxY);
    return this;
  }

  /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries down and the
   * maximum boundaries up (expanding as necessary).
   *
   * This is the mutable form of the function roundedOut(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  roundOut() {
    return this.setMinMax(Math.floor(this.minX), Math.floor(this.minY), Math.ceil(this.maxX), Math.ceil(this.maxY));
  }

  /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries up and the
   * maximum boundaries down (contracting as necessary).
   *
   * This is the mutable form of the function roundedIn(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  roundIn() {
    return this.setMinMax(Math.ceil(this.minX), Math.ceil(this.minY), Math.floor(this.maxX), Math.floor(this.maxY));
  }

  /**
   * Modifies this bounds so that it would fully contain a transformed version if its previous value, applying the
   * matrix as an affine transformation.
   *
   * NOTE: bounds.transform( matrix ).transform( inverse ) may be larger than the original box, if it includes
   * a rotation that isn't a multiple of $\pi/2$. This is because the bounds may expand in area to cover
   * ALL of the corners of the transformed bounding box.
   *
   * This is the mutable form of the function transformed(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  transform(matrix) {
    // if we contain no area, no change is needed
    if (this.isEmpty()) {
      return this;
    }

    // optimization to bail for identity matrices
    if (matrix.isIdentity()) {
      return this;
    }
    const minX = this.minX;
    const minY = this.minY;
    const maxX = this.maxX;
    const maxY = this.maxY;
    this.set(Bounds2.NOTHING);

    // using mutable vector so we don't create excessive instances of Vector2 during this
    // make sure all 4 corners are inside this transformed bounding box

    this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(minX, minY)));
    this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(minX, maxY)));
    this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(maxX, minY)));
    this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(maxX, maxY)));
    return this;
  }

  /**
   * Expands this bounds on all sides by the specified amount.
   *
   * This is the mutable form of the function dilated(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  dilate(d) {
    return this.dilateXY(d, d);
  }

  /**
   * Expands this bounds horizontally (left and right) by the specified amount.
   *
   * This is the mutable form of the function dilatedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  dilateX(x) {
    return this.setMinMax(this.minX - x, this.minY, this.maxX + x, this.maxY);
  }

  /**
   * Expands this bounds vertically (top and bottom) by the specified amount.
   *
   * This is the mutable form of the function dilatedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  dilateY(y) {
    return this.setMinMax(this.minX, this.minY - y, this.maxX, this.maxY + y);
  }

  /**
   * Expands this bounds independently in the horizontal and vertical directions. Will be equal to calling
   * bounds.dilateX( x ).dilateY( y ).
   *
   * This is the mutable form of the function dilatedXY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  dilateXY(x, y) {
    return this.setMinMax(this.minX - x, this.minY - y, this.maxX + x, this.maxY + y);
  }

  /**
   * Contracts this bounds on all sides by the specified amount.
   *
   * This is the mutable form of the function eroded(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  erode(d) {
    return this.dilate(-d);
  }

  /**
   * Contracts this bounds horizontally (left and right) by the specified amount.
   *
   * This is the mutable form of the function erodedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  erodeX(x) {
    return this.dilateX(-x);
  }

  /**
   * Contracts this bounds vertically (top and bottom) by the specified amount.
   *
   * This is the mutable form of the function erodedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  erodeY(y) {
    return this.dilateY(-y);
  }

  /**
   * Contracts this bounds independently in the horizontal and vertical directions. Will be equal to calling
   * bounds.erodeX( x ).erodeY( y ).
   *
   * This is the mutable form of the function erodedXY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  erodeXY(x, y) {
    return this.dilateXY(-x, -y);
  }

  /**
   * Expands this bounds independently for each side (or if some offsets are negative, will contract those sides).
   *
   * This is the mutable form of the function withOffsets(). This will mutate (change) this bounds, in addition to
   * returning this bounds itself.
   *
   * @param left - Amount to expand to the left (subtracts from minX)
   * @param top - Amount to expand to the top (subtracts from minY)
   * @param right - Amount to expand to the right (adds to maxX)
   * @param bottom - Amount to expand to the bottom (adds to maxY)
   */
  offset(left, top, right, bottom) {
    return b2(this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom);
  }

  /**
   * Translates our bounds horizontally by x.
   *
   * This is the mutable form of the function shiftedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  shiftX(x) {
    return this.setMinMax(this.minX + x, this.minY, this.maxX + x, this.maxY);
  }

  /**
   * Translates our bounds vertically by y.
   *
   * This is the mutable form of the function shiftedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  shiftY(y) {
    return this.setMinMax(this.minX, this.minY + y, this.maxX, this.maxY + y);
  }

  /**
   * Translates our bounds by (x,y).
   *
   * This is the mutable form of the function shifted(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   */
  shiftXY(x, y) {
    return this.setMinMax(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
  }

  /**
   * Translates our bounds by the given vector.
   */
  shift(v) {
    return this.shiftXY(v.x, v.y);
  }

  /**
   * Returns the range of the x-values of this bounds.
   */
  getXRange() {
    return new Range(this.minX, this.maxX);
  }

  /**
   * Sets the x-range of this bounds.
   */
  setXRange(range) {
    return this.setMinMax(range.min, this.minY, range.max, this.maxY);
  }
  get xRange() {
    return this.getXRange();
  }
  set xRange(range) {
    this.setXRange(range);
  }

  /**
   * Returns the range of the y-values of this bounds.
   */
  getYRange() {
    return new Range(this.minY, this.maxY);
  }

  /**
   * Sets the y-range of this bounds.
   */
  setYRange(range) {
    return this.setMinMax(this.minX, range.min, this.maxX, range.max);
  }
  get yRange() {
    return this.getYRange();
  }
  set yRange(range) {
    this.setYRange(range);
  }

  /**
   * Find a point in the bounds closest to the specified point.
   *
   * @param x - X coordinate of the point to test.
   * @param y - Y coordinate of the point to test.
   * @param [result] - Vector2 that can store the return value to avoid allocations.
   */
  getClosestPoint(x, y, result) {
    if (result) {
      result.setXY(x, y);
    } else {
      result = new Vector2(x, y);
    }
    if (result.x < this.minX) {
      result.x = this.minX;
    }
    if (result.x > this.maxX) {
      result.x = this.maxX;
    }
    if (result.y < this.minY) {
      result.y = this.minY;
    }
    if (result.y > this.maxY) {
      result.y = this.maxY;
    }
    return result;
  }
  freeToPool() {
    Bounds2.pool.freeToPool(this);
  }
  static pool = new Pool(Bounds2, {
    initialize: Bounds2.prototype.setMinMax,
    defaultArguments: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
  });

  /**
   * Returns a new Bounds2 object, with the familiar rectangle construction with x, y, width, and height.
   *
   * @param x - The minimum value of X for the bounds.
   * @param y - The minimum value of Y for the bounds.
   * @param width - The width (maxX - minX) of the bounds.
   * @param height - The height (maxY - minY) of the bounds.
   */
  static rect(x, y, width, height) {
    return b2(x, y, x + width, y + height);
  }

  /**
   * Returns a new Bounds2 object with a given orientation (min/max specified for both the given (primary) orientation,
   * and also the secondary orientation).
   */
  static oriented(orientation, minPrimary, minSecondary, maxPrimary, maxSecondary) {
    return orientation === Orientation.HORIZONTAL ? new Bounds2(minPrimary, minSecondary, maxPrimary, maxSecondary) : new Bounds2(minSecondary, minPrimary, maxSecondary, maxPrimary);
  }

  /**
   * Returns a new Bounds2 object that only contains the specified point (x,y). Useful for being dilated to form a
   * bounding box around a point. Note that the bounds will not be "empty" as it contains (x,y), but it will have
   * zero area. The x and y coordinates can be specified by numbers or with at Vector2
   *
   * @param x
   * @param y
   */

  // eslint-disable-line @typescript-eslint/explicit-member-accessibility
  static point(x, y) {
    // eslint-disable-line @typescript-eslint/explicit-member-accessibility
    if (x instanceof Vector2) {
      const p = x;
      return b2(p.x, p.y, p.x, p.y);
    } else {
      return b2(x, y, x, y);
    }
  }

  // Helps to identify the dimension of the bounds

  /**
   * A constant Bounds2 with minimums = $\infty$, maximums = $-\infty$, so that it represents "no bounds whatsoever".
   *
   * This allows us to take the union (union/includeBounds) of this and any other Bounds2 to get the other bounds back,
   * e.g. Bounds2.NOTHING.union( bounds ).equals( bounds ). This object naturally serves as the base case as a union of
   * zero bounds objects.
   *
   * Additionally, intersections with NOTHING will always return a Bounds2 equivalent to NOTHING.
   */
  static NOTHING = new Bounds2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

  /**
   * A constant Bounds2 with minimums = $-\infty$, maximums = $\infty$, so that it represents "all bounds".
   *
   * This allows us to take the intersection (intersection/constrainBounds) of this and any other Bounds2 to get the
   * other bounds back, e.g. Bounds2.EVERYTHING.intersection( bounds ).equals( bounds ). This object naturally serves as
   * the base case as an intersection of zero bounds objects.
   *
   * Additionally, unions with EVERYTHING will always return a Bounds2 equivalent to EVERYTHING.
   */
  static EVERYTHING = new Bounds2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  static Bounds2IO = new IOType('Bounds2IO', {
    valueType: Bounds2,
    documentation: 'a 2-dimensional bounds rectangle',
    toStateObject: bounds2 => ({
      minX: bounds2.minX,
      minY: bounds2.minY,
      maxX: bounds2.maxX,
      maxY: bounds2.maxY
    }),
    fromStateObject: stateObject => {
      return new Bounds2(InfiniteNumberIO.fromStateObject(stateObject.minX), InfiniteNumberIO.fromStateObject(stateObject.minY), InfiniteNumberIO.fromStateObject(stateObject.maxX), InfiniteNumberIO.fromStateObject(stateObject.maxY));
    },
    stateSchema: {
      minX: InfiniteNumberIO,
      maxX: InfiniteNumberIO,
      minY: InfiniteNumberIO,
      maxY: InfiniteNumberIO
    }
  });
}
dot.register('Bounds2', Bounds2);
const b2 = Bounds2.pool.create.bind(Bounds2.pool);
dot.register('b2', b2);
Bounds2.prototype.isBounds = true;
Bounds2.prototype.dimension = 2;
function catchImmutableSetterLowHangingFruit(bounds) {
  bounds.setMinMax = () => {
    throw new Error('Attempt to set "setMinMax" of an immutable Bounds2 object');
  };
  bounds.set = () => {
    throw new Error('Attempt to set "set" of an immutable Bounds2 object');
  };
  bounds.includeBounds = () => {
    throw new Error('Attempt to set "includeBounds" of an immutable Bounds2 object');
  };
  bounds.constrainBounds = () => {
    throw new Error('Attempt to set "constrainBounds" of an immutable Bounds2 object');
  };
  bounds.addCoordinates = () => {
    throw new Error('Attempt to set "addCoordinates" of an immutable Bounds2 object');
  };
  bounds.transform = () => {
    throw new Error('Attempt to set "transform" of an immutable Bounds2 object');
  };
}
if (assert) {
  catchImmutableSetterLowHangingFruit(Bounds2.EVERYTHING);
  catchImmutableSetterLowHangingFruit(Bounds2.NOTHING);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJT1R5cGUiLCJJbmZpbml0ZU51bWJlcklPIiwiVmVjdG9yMiIsImRvdCIsIlJhbmdlIiwiUG9vbCIsIk9yaWVudGF0aW9uIiwic2NyYXRjaFZlY3RvcjIiLCJCb3VuZHMyIiwiY29uc3RydWN0b3IiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwiYXNzZXJ0IiwidW5kZWZpbmVkIiwiZ2V0V2lkdGgiLCJ3aWR0aCIsImdldEhlaWdodCIsImhlaWdodCIsImdldFgiLCJ4IiwiZ2V0WSIsInkiLCJnZXRNaW5YIiwiZ2V0TWluWSIsImdldE1heFgiLCJnZXRNYXhZIiwiZ2V0TGVmdCIsImxlZnQiLCJnZXRUb3AiLCJ0b3AiLCJnZXRSaWdodCIsInJpZ2h0IiwiZ2V0Qm90dG9tIiwiYm90dG9tIiwiZ2V0Q2VudGVyWCIsImNlbnRlclgiLCJnZXRDZW50ZXJZIiwiY2VudGVyWSIsImdldExlZnRUb3AiLCJsZWZ0VG9wIiwiZ2V0Q2VudGVyVG9wIiwiY2VudGVyVG9wIiwiZ2V0UmlnaHRUb3AiLCJyaWdodFRvcCIsImdldExlZnRDZW50ZXIiLCJsZWZ0Q2VudGVyIiwiZ2V0Q2VudGVyIiwiY2VudGVyIiwiZ2V0UmlnaHRDZW50ZXIiLCJyaWdodENlbnRlciIsImdldExlZnRCb3R0b20iLCJsZWZ0Qm90dG9tIiwiZ2V0Q2VudGVyQm90dG9tIiwiY2VudGVyQm90dG9tIiwiZ2V0UmlnaHRCb3R0b20iLCJyaWdodEJvdHRvbSIsImlzRW1wdHkiLCJpc0Zpbml0ZSIsImhhc05vbnplcm9BcmVhIiwiaXNWYWxpZCIsImNsb3Nlc3RQb2ludFRvIiwicG9pbnQiLCJjb250YWluc0Nvb3JkaW5hdGVzIiwiZ2V0Q29uc3RyYWluZWRQb2ludCIsImNsb3Nlc3RCb3VuZGFyeVBvaW50VG8iLCJjbG9zZXN0WEVkZ2UiLCJjbG9zZXN0WUVkZ2UiLCJNYXRoIiwiYWJzIiwieENvbnN0cmFpbmVkIiwibWF4IiwibWluIiwieUNvbnN0cmFpbmVkIiwiY29udGFpbnNQb2ludCIsImNvbnRhaW5zQm91bmRzIiwiYm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwiY2xvc2VYIiwiY2xvc2VZIiwiZCIsImR4IiwiZHkiLCJtYXhpbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCIsInRvU3RyaW5nIiwiZXF1YWxzIiwib3RoZXIiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsInRoaXNGaW5pdGUiLCJvdGhlckZpbml0ZSIsImNvcHkiLCJzZXQiLCJiMiIsInVuaW9uIiwiaW50ZXJzZWN0aW9uIiwid2l0aENvb3JkaW5hdGVzIiwid2l0aFBvaW50Iiwid2l0aFgiLCJhZGRYIiwid2l0aFkiLCJhZGRZIiwid2l0aE1pblgiLCJ3aXRoTWluWSIsIndpdGhNYXhYIiwid2l0aE1heFkiLCJyb3VuZGVkT3V0IiwiZmxvb3IiLCJjZWlsIiwicm91bmRlZEluIiwidHJhbnNmb3JtZWQiLCJtYXRyaXgiLCJ0cmFuc2Zvcm0iLCJkaWxhdGVkIiwiZGlsYXRlZFhZIiwiZGlsYXRlZFgiLCJkaWxhdGVkWSIsImVyb2RlZCIsImFtb3VudCIsImVyb2RlZFgiLCJlcm9kZWRZIiwiZXJvZGVkWFkiLCJ3aXRoT2Zmc2V0cyIsInNoaWZ0ZWRYIiwic2hpZnRlZFkiLCJzaGlmdGVkWFkiLCJzaGlmdGVkIiwidiIsImJsZW5kIiwicmF0aW8iLCJ0Iiwic2V0TWluTWF4Iiwic2V0TWluWCIsInNldE1pblkiLCJzZXRNYXhYIiwic2V0TWF4WSIsImluY2x1ZGVCb3VuZHMiLCJjb25zdHJhaW5Cb3VuZHMiLCJhZGRDb29yZGluYXRlcyIsImFkZFBvaW50Iiwicm91bmRPdXQiLCJyb3VuZEluIiwiaXNJZGVudGl0eSIsIk5PVEhJTkciLCJtdWx0aXBseVZlY3RvcjIiLCJzZXRYWSIsImRpbGF0ZSIsImRpbGF0ZVhZIiwiZGlsYXRlWCIsImRpbGF0ZVkiLCJlcm9kZSIsImVyb2RlWCIsImVyb2RlWSIsImVyb2RlWFkiLCJvZmZzZXQiLCJzaGlmdFgiLCJzaGlmdFkiLCJzaGlmdFhZIiwic2hpZnQiLCJnZXRYUmFuZ2UiLCJzZXRYUmFuZ2UiLCJyYW5nZSIsInhSYW5nZSIsImdldFlSYW5nZSIsInNldFlSYW5nZSIsInlSYW5nZSIsImdldENsb3Nlc3RQb2ludCIsInJlc3VsdCIsImZyZWVUb1Bvb2wiLCJwb29sIiwiaW5pdGlhbGl6ZSIsInByb3RvdHlwZSIsImRlZmF1bHRBcmd1bWVudHMiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwicmVjdCIsIm9yaWVudGVkIiwib3JpZW50YXRpb24iLCJtaW5QcmltYXJ5IiwibWluU2Vjb25kYXJ5IiwibWF4UHJpbWFyeSIsIm1heFNlY29uZGFyeSIsIkhPUklaT05UQUwiLCJwIiwiRVZFUllUSElORyIsIkJvdW5kczJJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwiYm91bmRzMiIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0Iiwic3RhdGVTY2hlbWEiLCJyZWdpc3RlciIsImNyZWF0ZSIsImJpbmQiLCJpc0JvdW5kcyIsImRpbWVuc2lvbiIsImNhdGNoSW1tdXRhYmxlU2V0dGVyTG93SGFuZ2luZ0ZydWl0IiwiRXJyb3IiXSwic291cmNlcyI6WyJCb3VuZHMyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgMkQgcmVjdGFuZ2xlLXNoYXBlZCBib3VuZGVkIGFyZWEgKGJvdW5kaW5nIGJveCkuXHJcbiAqXHJcbiAqIFRoZXJlIGFyZSBhIG51bWJlciBvZiBjb252ZW5pZW5jZSBmdW5jdGlvbnMgdG8gZ2V0IHBvc2l0aW9ucyBhbmQgcG9pbnRzIG9uIHRoZSBCb3VuZHMuIEN1cnJlbnRseSB3ZSBkbyBub3RcclxuICogc3RvcmUgdGhlc2Ugd2l0aCB0aGUgQm91bmRzMiBpbnN0YW5jZSwgc2luY2Ugd2Ugd2FudCB0byBsb3dlciB0aGUgbWVtb3J5IGZvb3RwcmludC5cclxuICpcclxuICogbWluWCwgbWluWSwgbWF4WCwgYW5kIG1heFkgYXJlIGFjdHVhbGx5IHN0b3JlZC4gV2UgZG9uJ3QgZG8geCx5LHdpZHRoLGhlaWdodCBiZWNhdXNlIHRoaXMgY2FuJ3QgcHJvcGVybHkgZXhwcmVzc1xyXG4gKiBzZW1pLWluZmluaXRlIGJvdW5kcyAobGlrZSBhIGhhbGYtcGxhbmUpLCBvciBlYXNpbHkgaGFuZGxlIHdoYXQgQm91bmRzMi5OT1RISU5HIGFuZCBCb3VuZHMyLkVWRVJZVEhJTkcgZG8gd2l0aFxyXG4gKiB0aGUgY29uc3RydWN0aXZlIHNvbGlkIGFyZWFzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IEluZmluaXRlTnVtYmVySU8sIHsgSW5maW5pdGVOdW1iZXJTdGF0ZU9iamVjdCB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JbmZpbml0ZU51bWJlcklPLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4vTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuL1JhbmdlLmpzJztcclxuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuXHJcbi8vIFRlbXBvcmFyeSBpbnN0YW5jZXMgdG8gYmUgdXNlZCBpbiB0aGUgdHJhbnNmb3JtIG1ldGhvZC5cclxuY29uc3Qgc2NyYXRjaFZlY3RvcjIgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuZXhwb3J0IHR5cGUgQm91bmRzMlN0YXRlT2JqZWN0ID0ge1xyXG4gIG1pblg6IEluZmluaXRlTnVtYmVyU3RhdGVPYmplY3Q7XHJcbiAgbWluWTogSW5maW5pdGVOdW1iZXJTdGF0ZU9iamVjdDtcclxuICBtYXhYOiBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0O1xyXG4gIG1heFk6IEluZmluaXRlTnVtYmVyU3RhdGVPYmplY3Q7XHJcbn07XHJcblxyXG4vLyBUT0RPOiBXaHkgZG9lcyBmcmVlVG9Qb29sIGdldCBwcm9tb3RlZCwgYnV0IG5vdGhpbmcgZWxzZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTAzXHJcbi8vIFRPRE86IERvIHdlIG5lZWQgVFBvb2xhYmxlPyBDYW4gY2xhc3NlcyBqdXN0IGhhdmUgYSBzdGF0aWMgcG9vbCBtZXRob2Q/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzEwM1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3VuZHMyIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcclxuXHJcbiAgLy8gVGhlIG1pbmltdW0gWCBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgcHVibGljIG1pblg6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIG1pbmltdW0gWSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgcHVibGljIG1pblk6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIG1heGltdW0gWCBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgcHVibGljIG1heFg6IG51bWJlcjtcclxuXHJcbiAgLy8gVGhlIG1heGltdW0gWSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgcHVibGljIG1heFk6IG51bWJlcjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIDItZGltZW5zaW9uYWwgYm91bmRzIChib3VuZGluZyBib3gpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG1pblggLSBUaGUgaW5pdGlhbCBtaW5pbXVtIFggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxyXG4gICAqIEBwYXJhbSBtaW5ZIC0gVGhlIGluaXRpYWwgbWluaW11bSBZIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0gbWF4WCAtIFRoZSBpbml0aWFsIG1heGltdW0gWCBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIG1heFkgLSBUaGUgaW5pdGlhbCBtYXhpbXVtIFkgY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWluWDogbnVtYmVyLCBtaW5ZOiBudW1iZXIsIG1heFg6IG51bWJlciwgbWF4WTogbnVtYmVyICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4WSAhPT0gdW5kZWZpbmVkLCAnQm91bmRzMiByZXF1aXJlcyA0IHBhcmFtZXRlcnMnICk7XHJcblxyXG4gICAgdGhpcy5taW5YID0gbWluWDtcclxuICAgIHRoaXMubWluWSA9IG1pblk7XHJcbiAgICB0aGlzLm1heFggPSBtYXhYO1xyXG4gICAgdGhpcy5tYXhZID0gbWF4WTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIFByb3BlcnRpZXNcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB3aWR0aCBvZiB0aGUgYm91bmRzLCBkZWZpbmVkIGFzIG1heFggLSBtaW5YLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRXaWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhYIC0gdGhpcy5taW5YOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBib3VuZHMsIGRlZmluZWQgYXMgbWF4WSAtIG1pblkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEhlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhZIC0gdGhpcy5taW5ZOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEhlaWdodCgpOyB9XHJcblxyXG4gIC8qXHJcbiAgICogQ29udmVuaWVuY2UgcG9zaXRpb25zXHJcbiAgICogdXBwZXIgaXMgaW4gdGVybXMgb2YgdGhlIHZpc3VhbCBsYXlvdXQgaW4gU2NlbmVyeSBhbmQgb3RoZXIgcHJvZ3JhbXMsIHNvIHRoZSBtaW5ZIGlzIHRoZSBcInVwcGVyXCIsIGFuZCBtaW5ZIGlzIHRoZSBcImxvd2VyXCJcclxuICAgKlxyXG4gICAqICAgICAgICAgICAgIG1pblggKHgpICAgICBjZW50ZXJYICAgICAgICBtYXhYXHJcbiAgICogICAgICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICogbWluWSAoeSkgfCBsZWZ0VG9wICAgICBjZW50ZXJUb3AgICAgIHJpZ2h0VG9wXHJcbiAgICogY2VudGVyWSAgfCBsZWZ0Q2VudGVyICBjZW50ZXIgICAgICAgIHJpZ2h0Q2VudGVyXHJcbiAgICogbWF4WSAgICAgfCBsZWZ0Qm90dG9tICBjZW50ZXJCb3R0b20gIHJpZ2h0Qm90dG9tXHJcbiAgICovXHJcblxyXG4gIC8qKlxyXG4gICAqIEFsaWFzIGZvciBtaW5YLCB3aGVuIHRoaW5raW5nIG9mIHRoZSBib3VuZHMgYXMgYW4gKHgseSx3aWR0aCxoZWlnaHQpIHJlY3RhbmdsZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0WCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5YOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRYKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1pblksIHdoZW4gdGhpbmtpbmcgb2YgdGhlIGJvdW5kcyBhcyBhbiAoeCx5LHdpZHRoLGhlaWdodCkgcmVjdGFuZ2xlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblk7IH1cclxuXHJcbiAgcHVibGljIGdldCB5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFkoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWCwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNaW5YKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblg7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1pblksIHN1cHBvcnRpbmcgdGhlIGV4cGxpY2l0IGdldHRlciBmdW5jdGlvbiBzdHlsZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWluWSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5taW5ZOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsaWFzIGZvciBtYXhYLCBzdXBwb3J0aW5nIHRoZSBleHBsaWNpdCBnZXR0ZXIgZnVuY3Rpb24gc3R5bGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE1heFgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4WDsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWF4WSwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNYXhZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heFk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1pblgsIHdoZW4gdGhpbmtpbmcgaW4gdGhlIFVJLWxheW91dCBtYW5uZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExlZnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWDsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxlZnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWDsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWSwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VG9wKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1pblk7IH1cclxuXHJcbiAgcHVibGljIGdldCB0b3AoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWluWTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWF4WCwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4WDsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHJpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heFg7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1heFksIHdoZW4gdGhpbmtpbmcgaW4gdGhlIFVJLWxheW91dCBtYW5uZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJvdHRvbSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5tYXhZOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYm90dG9tKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heFk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGhvcml6b250YWwgKFgtY29vcmRpbmF0ZSkgY2VudGVyIG9mIHRoZSBib3VuZHMsIGF2ZXJhZ2luZyB0aGUgbWluWCBhbmQgbWF4WC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2VudGVyWCgpOiBudW1iZXIgeyByZXR1cm4gKCB0aGlzLm1heFggKyB0aGlzLm1pblggKSAvIDI7IH1cclxuXHJcbiAgcHVibGljIGdldCBjZW50ZXJYKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENlbnRlclgoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgdmVydGljYWwgKFktY29vcmRpbmF0ZSkgY2VudGVyIG9mIHRoZSBib3VuZHMsIGF2ZXJhZ2luZyB0aGUgbWluWSBhbmQgbWF4WS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2VudGVyWSgpOiBudW1iZXIgeyByZXR1cm4gKCB0aGlzLm1heFkgKyB0aGlzLm1pblkgKSAvIDI7IH1cclxuXHJcbiAgcHVibGljIGdldCBjZW50ZXJZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldENlbnRlclkoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcG9pbnQgKG1pblgsIG1pblkpLCBpbiB0aGUgVUktY29vcmRpbmF0ZSB1cHBlci1sZWZ0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMZWZ0VG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubWluWCwgdGhpcy5taW5ZICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBsZWZ0VG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRMZWZ0VG9wKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHBvaW50IChjZW50ZXJYLCBtaW5ZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgdXBwZXItY2VudGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDZW50ZXJUb3AoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5nZXRDZW50ZXJYKCksIHRoaXMubWluWSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY2VudGVyVG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRDZW50ZXJUb3AoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcG9pbnQgKHJpZ2h0LCBtaW5ZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgdXBwZXItcmlnaHQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJpZ2h0VG9wKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubWF4WCwgdGhpcy5taW5ZICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByaWdodFRvcCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0UmlnaHRUb3AoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcG9pbnQgKGxlZnQsIGNlbnRlclkpLCBpbiB0aGUgVUktY29vcmRpbmF0ZSBjZW50ZXItbGVmdC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGVmdENlbnRlcigpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLm1pblgsIHRoaXMuZ2V0Q2VudGVyWSgpICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBsZWZ0Q2VudGVyKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRMZWZ0Q2VudGVyKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHBvaW50IChjZW50ZXJYLCBjZW50ZXJZKSwgaW4gdGhlIGNlbnRlciBvZiB0aGUgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5nZXRDZW50ZXJYKCksIHRoaXMuZ2V0Q2VudGVyWSgpICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldENlbnRlcigpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBwb2ludCAobWF4WCwgY2VudGVyWSksIGluIHRoZSBVSS1jb29yZGluYXRlIGNlbnRlci1yaWdodFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSaWdodENlbnRlcigpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLm1heFgsIHRoaXMuZ2V0Q2VudGVyWSgpICk7IH1cclxuXHJcbiAgcHVibGljIGdldCByaWdodENlbnRlcigpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0UmlnaHRDZW50ZXIoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcG9pbnQgKG1pblgsIG1heFkpLCBpbiB0aGUgVUktY29vcmRpbmF0ZSBsb3dlci1sZWZ0XHJcbiAgICovXHJcbiAgcHVibGljIGdldExlZnRCb3R0b20oKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5taW5YLCB0aGlzLm1heFkgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxlZnRCb3R0b20oKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldExlZnRCb3R0b20oKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcG9pbnQgKGNlbnRlclgsIG1heFkpLCBpbiB0aGUgVUktY29vcmRpbmF0ZSBsb3dlci1jZW50ZXJcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2VudGVyQm90dG9tKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMuZ2V0Q2VudGVyWCgpLCB0aGlzLm1heFkgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyQm90dG9tKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHBvaW50IChtYXhYLCBtYXhZKSwgaW4gdGhlIFVJLWNvb3JkaW5hdGUgbG93ZXItcmlnaHRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmlnaHRCb3R0b20oKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5tYXhYLCB0aGlzLm1heFkgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHJpZ2h0Qm90dG9tKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRSaWdodEJvdHRvbSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgd2UgaGF2ZSBuZWdhdGl2ZSB3aWR0aCBvciBoZWlnaHQuIEJvdW5kczIuTk9USElORyBpcyBhIHByaW1lIGV4YW1wbGUgb2YgYW4gZW1wdHkgQm91bmRzMi5cclxuICAgKiBCb3VuZHMgd2l0aCB3aWR0aCA9IGhlaWdodCA9IDAgYXJlIGNvbnNpZGVyZWQgbm90IGVtcHR5LCBzaW5jZSB0aGV5IGluY2x1ZGUgdGhlIHNpbmdsZSAoMCwwKSBwb2ludC5cclxuICAgKi9cclxuICBwdWJsaWMgaXNFbXB0eSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKSA8IDAgfHwgdGhpcy5nZXRIZWlnaHQoKSA8IDA7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciBvdXIgbWluaW11bXMgYW5kIG1heGltdW1zIGFyZSBhbGwgZmluaXRlIG51bWJlcnMuIFRoaXMgd2lsbCBleGNsdWRlIEJvdW5kczIuTk9USElORyBhbmQgQm91bmRzMi5FVkVSWVRISU5HLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0Zpbml0ZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBpc0Zpbml0ZSggdGhpcy5taW5YICkgJiYgaXNGaW5pdGUoIHRoaXMubWluWSApICYmIGlzRmluaXRlKCB0aGlzLm1heFggKSAmJiBpc0Zpbml0ZSggdGhpcy5tYXhZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgYm91bmRzIGhhcyBhIG5vbi16ZXJvIGFyZWEgKG5vbi16ZXJvIHBvc2l0aXZlIHdpZHRoIGFuZCBoZWlnaHQpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNOb256ZXJvQXJlYSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmdldFdpZHRoKCkgPiAwICYmIHRoaXMuZ2V0SGVpZ2h0KCkgPiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIGJvdW5kcyBoYXMgYSBmaW5pdGUgYW5kIG5vbi1uZWdhdGl2ZSB3aWR0aCBhbmQgaGVpZ2h0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLmlzRW1wdHkoKSAmJiB0aGlzLmlzRmluaXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBib3VuZHMsIHRoZSBwb2ludCB3aWxsIGJlIHJldHVybmVkLiBPdGhlcndpc2UsIHRoaXMgd2lsbCByZXR1cm4gYSBuZXcgcG9pbnRcclxuICAgKiBvbiB0aGUgZWRnZSBvZiB0aGUgYm91bmRzIHRoYXQgaXMgdGhlIGNsb3Nlc3QgdG8gdGhlIHByb3ZpZGVkIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbG9zZXN0UG9pbnRUbyggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHRoaXMuY29udGFpbnNDb29yZGluYXRlcyggcG9pbnQueCwgcG9pbnQueSApICkge1xyXG4gICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29uc3RyYWluZWRQb2ludCggcG9pbnQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgdGhlIHBvaW50IG9uIHRoZSBib3VuZGFyeSBvZiB0aGUgQm91bmRzMiB0aGF0IGlzIGNsb3Nlc3QgdG8gdGhlIHByb3ZpZGVkIHBvaW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbG9zZXN0Qm91bmRhcnlQb2ludFRvKCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGlmICggdGhpcy5jb250YWluc0Nvb3JkaW5hdGVzKCBwb2ludC54LCBwb2ludC55ICkgKSB7XHJcbiAgICAgIGNvbnN0IGNsb3Nlc3RYRWRnZSA9IHBvaW50LnggPCB0aGlzLmNlbnRlclggPyB0aGlzLm1pblggOiB0aGlzLm1heFg7XHJcbiAgICAgIGNvbnN0IGNsb3Nlc3RZRWRnZSA9IHBvaW50LnkgPCB0aGlzLmNlbnRlclkgPyB0aGlzLm1pblkgOiB0aGlzLm1heFk7XHJcblxyXG4gICAgICAvLyBEZWNpZGUgd2hpY2ggY2FyZGluYWwgZGlyZWN0aW9uIHRvIGdvIGJhc2VkIG9uIHNpbXBsZSBkaXN0YW5jZS5cclxuICAgICAgaWYgKCBNYXRoLmFicyggY2xvc2VzdFhFZGdlIC0gcG9pbnQueCApIDwgTWF0aC5hYnMoIGNsb3Nlc3RZRWRnZSAtIHBvaW50LnkgKSApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIoIGNsb3Nlc3RYRWRnZSwgcG9pbnQueSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMiggcG9pbnQueCwgY2xvc2VzdFlFZGdlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRDb25zdHJhaW5lZFBvaW50KCBwb2ludCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZSBhIHBvaW50IG91dHNpZGUgb2YgdGhpcyBCb3VuZHMyLCBjb25zdHJhaW4gaXQgdG8gYSBwb2ludCBvbiB0aGUgYm91bmRhcnkgb2YgdGhpcyBCb3VuZHMyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb25zdHJhaW5lZFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IHhDb25zdHJhaW5lZCA9IE1hdGgubWF4KCBNYXRoLm1pbiggcG9pbnQueCwgdGhpcy5tYXhYICksIHRoaXMueCApO1xyXG4gICAgY29uc3QgeUNvbnN0cmFpbmVkID0gTWF0aC5tYXgoIE1hdGgubWluKCBwb2ludC55LCB0aGlzLm1heFkgKSwgdGhpcy55ICk7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHhDb25zdHJhaW5lZCwgeUNvbnN0cmFpbmVkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBjb29yZGluYXRlcyBhcmUgY29udGFpbmVkIGluc2lkZSB0aGUgYm91bmRpbmcgYm94LCBvciBhcmUgb24gdGhlIGJvdW5kYXJ5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIGNoZWNrXHJcbiAgICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IHRvIGNoZWNrXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRhaW5zQ29vcmRpbmF0ZXMoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubWluWCA8PSB4ICYmIHggPD0gdGhpcy5tYXhYICYmIHRoaXMubWluWSA8PSB5ICYmIHkgPD0gdGhpcy5tYXhZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgcG9pbnQgaXMgY29udGFpbmVkIGluc2lkZSB0aGUgYm91bmRpbmcgYm94LCBvciBpcyBvbiB0aGUgYm91bmRhcnkuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRhaW5zUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY29udGFpbnNDb29yZGluYXRlcyggcG9pbnQueCwgcG9pbnQueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIGJvdW5kaW5nIGJveCBjb21wbGV0ZWx5IGNvbnRhaW5zIHRoZSBib3VuZGluZyBib3ggcGFzc2VkIGFzIGEgcGFyYW1ldGVyLiBUaGUgYm91bmRhcnkgb2YgYSBib3ggaXNcclxuICAgKiBjb25zaWRlcmVkIHRvIGJlIFwiY29udGFpbmVkXCIuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRhaW5zQm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5taW5YIDw9IGJvdW5kcy5taW5YICYmIHRoaXMubWF4WCA+PSBib3VuZHMubWF4WCAmJiB0aGlzLm1pblkgPD0gYm91bmRzLm1pblkgJiYgdGhpcy5tYXhZID49IGJvdW5kcy5tYXhZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIGFuZCBhbm90aGVyIGJvdW5kaW5nIGJveCBoYXZlIGFueSBwb2ludHMgb2YgaW50ZXJzZWN0aW9uIChpbmNsdWRpbmcgdG91Y2hpbmcgYm91bmRhcmllcykuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVyc2VjdHNCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG1pblggPSBNYXRoLm1heCggdGhpcy5taW5YLCBib3VuZHMubWluWCApO1xyXG4gICAgY29uc3QgbWluWSA9IE1hdGgubWF4KCB0aGlzLm1pblksIGJvdW5kcy5taW5ZICk7XHJcbiAgICBjb25zdCBtYXhYID0gTWF0aC5taW4oIHRoaXMubWF4WCwgYm91bmRzLm1heFggKTtcclxuICAgIGNvbnN0IG1heFkgPSBNYXRoLm1pbiggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApO1xyXG4gICAgcmV0dXJuICggbWF4WCAtIG1pblggKSA+PSAwICYmICggbWF4WSAtIG1pblkgPj0gMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNxdWFyZWQgZGlzdGFuY2UgZnJvbSB0aGUgaW5wdXQgcG9pbnQgdG8gdGhlIHBvaW50IGNsb3Nlc3QgdG8gaXQgaW5zaWRlIHRoZSBib3VuZGluZyBib3guXHJcbiAgICovXHJcbiAgcHVibGljIG1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkKCBwb2ludDogVmVjdG9yMiApOiBudW1iZXIge1xyXG4gICAgY29uc3QgY2xvc2VYID0gcG9pbnQueCA8IHRoaXMubWluWCA/IHRoaXMubWluWCA6ICggcG9pbnQueCA+IHRoaXMubWF4WCA/IHRoaXMubWF4WCA6IG51bGwgKTtcclxuICAgIGNvbnN0IGNsb3NlWSA9IHBvaW50LnkgPCB0aGlzLm1pblkgPyB0aGlzLm1pblkgOiAoIHBvaW50LnkgPiB0aGlzLm1heFkgPyB0aGlzLm1heFkgOiBudWxsICk7XHJcbiAgICBsZXQgZDtcclxuICAgIGlmICggY2xvc2VYID09PSBudWxsICYmIGNsb3NlWSA9PT0gbnVsbCApIHtcclxuICAgICAgLy8gaW5zaWRlLCBvciBvbiB0aGUgYm91bmRhcnlcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggY2xvc2VYID09PSBudWxsICkge1xyXG4gICAgICAvLyB2ZXJ0aWNhbGx5IGRpcmVjdGx5IGFib3ZlL2JlbG93XHJcbiAgICAgIGQgPSBjbG9zZVkhIC0gcG9pbnQueTtcclxuICAgICAgcmV0dXJuIGQgKiBkO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNsb3NlWSA9PT0gbnVsbCApIHtcclxuICAgICAgLy8gaG9yaXpvbnRhbGx5IGRpcmVjdGx5IHRvIHRoZSBsZWZ0L3JpZ2h0XHJcbiAgICAgIGQgPSBjbG9zZVggLSBwb2ludC54O1xyXG4gICAgICByZXR1cm4gZCAqIGQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gY29ybmVyIGNhc2VcclxuICAgICAgY29uc3QgZHggPSBjbG9zZVggLSBwb2ludC54O1xyXG4gICAgICBjb25zdCBkeSA9IGNsb3NlWSAtIHBvaW50Lnk7XHJcbiAgICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzcXVhcmVkIGRpc3RhbmNlIGZyb20gdGhlIGlucHV0IHBvaW50IHRvIHRoZSBwb2ludCBmdXJ0aGVzdCBmcm9tIGl0IGluc2lkZSB0aGUgYm91bmRpbmcgYm94LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtYXhpbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQ6IFZlY3RvcjIgKTogbnVtYmVyIHtcclxuICAgIGxldCB4ID0gcG9pbnQueCA+IHRoaXMuZ2V0Q2VudGVyWCgpID8gdGhpcy5taW5YIDogdGhpcy5tYXhYO1xyXG4gICAgbGV0IHkgPSBwb2ludC55ID4gdGhpcy5nZXRDZW50ZXJZKCkgPyB0aGlzLm1pblkgOiB0aGlzLm1heFk7XHJcbiAgICB4IC09IHBvaW50Lng7XHJcbiAgICB5IC09IHBvaW50Lnk7XHJcbiAgICByZXR1cm4geCAqIHggKyB5ICogeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYFt4Oigke3RoaXMubWluWH0sJHt0aGlzLm1heFh9KSx5Oigke3RoaXMubWluWX0sJHt0aGlzLm1heFl9KV1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhhY3QgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgYm91bmRzIGFuZCBhbm90aGVyIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgdHdvIGJvdW5kcyBhcmUgZXF1YWxcclxuICAgKi9cclxuICBwdWJsaWMgZXF1YWxzKCBvdGhlcjogQm91bmRzMiApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLm1pblggPT09IG90aGVyLm1pblggJiYgdGhpcy5taW5ZID09PSBvdGhlci5taW5ZICYmIHRoaXMubWF4WCA9PT0gb3RoZXIubWF4WCAmJiB0aGlzLm1heFkgPT09IG90aGVyLm1heFk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHByb3hpbWF0ZSBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyBib3VuZHMgYW5kIGFub3RoZXIgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGJvdW5kcyBoYXMgbm8gbWluL21heCB3aXRoIGFuIGFic29sdXRlIHZhbHVlIGdyZWF0ZXJcclxuICAgKiAgICAgICAgICAgIHRoYW4gZXBzaWxvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZXF1YWxzRXBzaWxvbiggb3RoZXI6IEJvdW5kczIsIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIGVwc2lsb24gPSBlcHNpbG9uICE9PSB1bmRlZmluZWQgPyBlcHNpbG9uIDogMDtcclxuICAgIGNvbnN0IHRoaXNGaW5pdGUgPSB0aGlzLmlzRmluaXRlKCk7XHJcbiAgICBjb25zdCBvdGhlckZpbml0ZSA9IG90aGVyLmlzRmluaXRlKCk7XHJcbiAgICBpZiAoIHRoaXNGaW5pdGUgJiYgb3RoZXJGaW5pdGUgKSB7XHJcbiAgICAgIC8vIGJvdGggYXJlIGZpbml0ZSwgc28gd2UgY2FuIHVzZSBNYXRoLmFicygpIC0gaXQgd291bGQgZmFpbCB3aXRoIG5vbi1maW5pdGUgdmFsdWVzIGxpa2UgSW5maW5pdHlcclxuICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLm1pblggLSBvdGhlci5taW5YICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgICBNYXRoLmFicyggdGhpcy5taW5ZIC0gb3RoZXIubWluWSApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubWF4WCAtIG90aGVyLm1heFggKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm1heFkgLSBvdGhlci5tYXhZICkgPCBlcHNpbG9uO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXNGaW5pdGUgIT09IG90aGVyRmluaXRlICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG9uZSBpcyBmaW5pdGUsIHRoZSBvdGhlciBpcyBub3QuIGRlZmluaXRlbHkgbm90IGVxdWFsXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggKCB0aGlzIGFzIHVua25vd24gYXMgQm91bmRzMiApID09PSBvdGhlciApIHtcclxuICAgICAgcmV0dXJuIHRydWU7IC8vIGV4YWN0IHNhbWUgaW5zdGFuY2UsIG11c3QgYmUgZXF1YWxcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBlcHNpbG9uIG9ubHkgYXBwbGllcyBvbiBmaW5pdGUgZGltZW5zaW9ucy4gZHVlIHRvIEpTJ3MgaGFuZGxpbmcgb2YgaXNGaW5pdGUoKSwgaXQncyBmYXN0ZXIgdG8gY2hlY2sgdGhlIHN1bSBvZiBib3RoXHJcbiAgICAgIHJldHVybiAoIGlzRmluaXRlKCB0aGlzLm1pblggKyBvdGhlci5taW5YICkgPyAoIE1hdGguYWJzKCB0aGlzLm1pblggLSBvdGhlci5taW5YICkgPCBlcHNpbG9uICkgOiAoIHRoaXMubWluWCA9PT0gb3RoZXIubWluWCApICkgJiZcclxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWluWSArIG90aGVyLm1pblkgKSA/ICggTWF0aC5hYnMoIHRoaXMubWluWSAtIG90aGVyLm1pblkgKSA8IGVwc2lsb24gKSA6ICggdGhpcy5taW5ZID09PSBvdGhlci5taW5ZICkgKSAmJlxyXG4gICAgICAgICAgICAgKCBpc0Zpbml0ZSggdGhpcy5tYXhYICsgb3RoZXIubWF4WCApID8gKCBNYXRoLmFicyggdGhpcy5tYXhYIC0gb3RoZXIubWF4WCApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1heFggPT09IG90aGVyLm1heFggKSApICYmXHJcbiAgICAgICAgICAgICAoIGlzRmluaXRlKCB0aGlzLm1heFkgKyBvdGhlci5tYXhZICkgPyAoIE1hdGguYWJzKCB0aGlzLm1heFkgLSBvdGhlci5tYXhZICkgPCBlcHNpbG9uICkgOiAoIHRoaXMubWF4WSA9PT0gb3RoZXIubWF4WSApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBJbW11dGFibGUgb3BlcmF0aW9uc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBib3VuZHMsIG9yIGlmIGEgYm91bmRzIGlzIHBhc3NlZCBpbiwgc2V0IHRoYXQgYm91bmRzJ3MgdmFsdWVzIHRvIG91cnMuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0KCksIGlmIGEgYm91bmRzIGlzIHByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kXHJcbiAgICogd2lsbCBub3QgbW9kaWZ5IHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFtib3VuZHNdIC0gSWYgbm90IHByb3ZpZGVkLCBjcmVhdGVzIGEgbmV3IEJvdW5kczIgd2l0aCBmaWxsZWQgaW4gdmFsdWVzLiBPdGhlcndpc2UsIGZpbGxzIGluIHRoZVxyXG4gICAqICAgICAgICAgICAgICAgICAgIHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgYm91bmRzIHNvIHRoYXQgaXQgZXF1YWxzIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb3B5KCBib3VuZHM/OiBCb3VuZHMyICk6IEJvdW5kczIge1xyXG4gICAgaWYgKCBib3VuZHMgKSB7XHJcbiAgICAgIHJldHVybiBib3VuZHMuc2V0KCB0aGlzIGFzIHVua25vd24gYXMgQm91bmRzMiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBiMiggdGhpcy5taW5YLCB0aGlzLm1pblksIHRoaXMubWF4WCwgdGhpcy5tYXhZICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgY29udGFpbnMgYm90aCB0aGlzIGJvdW5kcyBhbmQgdGhlIGlucHV0IGJvdW5kcywgcmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGluY2x1ZGVCb3VuZHMoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgdW5pb24oIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMihcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWCwgYm91bmRzLm1pblggKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WCwgYm91bmRzLm1heFggKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgYm91bmRzLm1heFkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBzbWFsbGVzdCBib3VuZHMgdGhhdCBpcyBjb250YWluZWQgYnkgYm90aCB0aGlzIGJvdW5kcyBhbmQgdGhlIGlucHV0IGJvdW5kcywgcmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbnN0cmFpbkJvdW5kcygpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpbnRlcnNlY3Rpb24oIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMihcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWCwgYm91bmRzLm1pblggKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WCwgYm91bmRzLm1heFggKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WSwgYm91bmRzLm1heFkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IGRpZmZlcmVuY2Ugc2hvdWxkIGJlIHdlbGwtZGVmaW5lZCwgYnV0IG1vcmUgbG9naWMgaXMgbmVlZGVkIHRvIGNvbXB1dGVcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNtYWxsZXN0IGJvdW5kcyB0aGF0IGNvbnRhaW5zIHRoaXMgYm91bmRzIGFuZCB0aGUgcG9pbnQgKHgseSksIHJldHVybmVkIGFzIGEgY29weS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGRDb29yZGluYXRlcygpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3aXRoQ29vcmRpbmF0ZXMoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIGIyKFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCB4ICksXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblksIHkgKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WCwgeCApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhZLCB5IClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgY29udGFpbnMgdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBwb2ludCwgcmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFBvaW50KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIHdpdGhQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy53aXRoQ29vcmRpbmF0ZXMoIHBvaW50LngsIHBvaW50LnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHNtYWxsZXN0IGJvdW5kcyB0aGF0IGNvbnRhaW5zIGJvdGggdGhpcyBib3VuZHMgYW5kIHRoZSB4IHZhbHVlIHByb3ZpZGVkLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgd2l0aFgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmNvcHkoKS5hZGRYKCB4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzbWFsbGVzdCBib3VuZHMgdGhhdCBjb250YWlucyBib3RoIHRoaXMgYm91bmRzIGFuZCB0aGUgeSB2YWx1ZSBwcm92aWRlZC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGRZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIHdpdGhZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkuYWRkWSggeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1pblggcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWluWCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3aXRoTWluWCggbWluWDogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIGIyKCBtaW5YLCB0aGlzLm1pblksIHRoaXMubWF4WCwgdGhpcy5tYXhZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggbWluWSByZXBsYWNlZCB3aXRoIHRoZSBpbnB1dC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNaW5ZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIHdpdGhNaW5ZKCBtaW5ZOiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gYjIoIHRoaXMubWluWCwgbWluWSwgdGhpcy5tYXhYLCB0aGlzLm1heFkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCBtYXhYIHJlcGxhY2VkIHdpdGggdGhlIGlucHV0LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1heFgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgd2l0aE1heFgoIG1heFg6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMiggdGhpcy5taW5YLCB0aGlzLm1pblksIG1heFgsIHRoaXMubWF4WSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1heFkgcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWF4WSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3aXRoTWF4WSggbWF4WTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5tYXhYLCBtYXhZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggdGhlIG1pbmltdW0gdmFsdWVzIHJvdW5kZWQgZG93biB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLCBhbmQgdGhlIG1heGltdW0gdmFsdWVzXHJcbiAgICogcm91bmRlZCB1cCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLiBUaGlzIGNhdXNlcyB0aGUgYm91bmRzIHRvIGV4cGFuZCBhcyBuZWNlc3Nhcnkgc28gdGhhdCBpdHMgYm91bmRhcmllc1xyXG4gICAqIGFyZSBpbnRlZ2VyLWFsaWduZWQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRPdXQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgcm91bmRlZE91dCgpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMihcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5YICksXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWSApLFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WCApLFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIHRoZSBtaW5pbXVtIHZhbHVlcyByb3VuZGVkIHVwIHRvIHRoZSBuZWFyZXN0IGludGVnZXIsIGFuZCB0aGUgbWF4aW11bSB2YWx1ZXNcclxuICAgKiByb3VuZGVkIGRvd24gdG8gdGhlIG5lYXJlc3QgaW50ZWdlci4gVGhpcyBjYXVzZXMgdGhlIGJvdW5kcyB0byBjb250cmFjdCBhcyBuZWNlc3Nhcnkgc28gdGhhdCBpdHMgYm91bmRhcmllc1xyXG4gICAqIGFyZSBpbnRlZ2VyLWFsaWduZWQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRJbigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByb3VuZGVkSW4oKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gYjIoXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5YICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5ZICksXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WCApLFxyXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1heFkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IChzdGlsbCBheGlzLWFsaWduZWQpIHRoYXQgY29udGFpbnMgdGhlIHRyYW5zZm9ybWVkIHNoYXBlIG9mIHRoaXMgYm91bmRzLCBhcHBseWluZyB0aGUgbWF0cml4IGFzXHJcbiAgICogYW4gYWZmaW5lIHRyYW5zZm9ybWF0aW9uLlxyXG4gICAqXHJcbiAgICogTk9URTogYm91bmRzLnRyYW5zZm9ybWVkKCBtYXRyaXggKS50cmFuc2Zvcm1lZCggaW52ZXJzZSApIG1heSBiZSBsYXJnZXIgdGhhbiB0aGUgb3JpZ2luYWwgYm94LCBpZiBpdCBpbmNsdWRlc1xyXG4gICAqIGEgcm90YXRpb24gdGhhdCBpc24ndCBhIG11bHRpcGxlIG9mICRcXHBpLzIkLiBUaGlzIGlzIGJlY2F1c2UgdGhlIHJldHVybmVkIGJvdW5kcyBtYXkgZXhwYW5kIGluIGFyZWEgdG8gY292ZXJcclxuICAgKiBBTEwgb2YgdGhlIGNvcm5lcnMgb2YgdGhlIHRyYW5zZm9ybWVkIGJvdW5kaW5nIGJveC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0cmFuc2Zvcm0oKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgdHJhbnNmb3JtZWQoIG1hdHJpeDogTWF0cml4MyApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmNvcHkoKS50cmFuc2Zvcm0oIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBvbiBhbGwgc2lkZXMgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuKVxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaWxhdGVkKCBkOiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVkWFkoIGQsIGQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgZXhwYW5kZWQgaG9yaXpvbnRhbGx5IChvbiB0aGUgbGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZVgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZGlsYXRlZFgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMiggdGhpcy5taW5YIC0geCwgdGhpcy5taW5ZLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgZXhwYW5kZWQgdmVydGljYWxseSAob24gdGhlIHRvcCBhbmQgYm90dG9tKSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGRpbGF0ZWRZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gYjIoIHRoaXMubWluWCwgdGhpcy5taW5ZIC0geSwgdGhpcy5tYXhYLCB0aGlzLm1heFkgKyB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIG9uIGFsbCBzaWRlcywgd2l0aCBkaWZmZXJlbnQgYW1vdW50cyBvZiBleHBhbnNpb24gaG9yaXpvbnRhbGx5IGFuZCB2ZXJ0aWNhbGx5LlxyXG4gICAqIFdpbGwgYmUgaWRlbnRpY2FsIHRvIHRoZSBib3VuZHMgcmV0dXJuZWQgYnkgY2FsbGluZyBib3VuZHMuZGlsYXRlZFgoIHggKS5kaWxhdGVkWSggeSApLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZVhZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geCAtIEFtb3VudCB0byBkaWxhdGUgaG9yaXpvbnRhbGx5IChmb3IgZWFjaCBzaWRlKVxyXG4gICAqIEBwYXJhbSB5IC0gQW1vdW50IHRvIGRpbGF0ZSB2ZXJ0aWNhbGx5IChmb3IgZWFjaCBzaWRlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaWxhdGVkWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblggLSB4LCB0aGlzLm1pblkgLSB5LCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKyB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgb24gYWxsIHNpZGVzIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGVyb2RlZCggYW1vdW50OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZWQoIC1hbW91bnQgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgaG9yaXpvbnRhbGx5IChvbiB0aGUgbGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBlcm9kZWRYKCB4OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZWRYKCAteCApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgY29udHJhY3RlZCB2ZXJ0aWNhbGx5IChvbiB0aGUgdG9wIGFuZCBib3R0b20pIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBlcm9kZWRZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZWRZKCAteSApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgY29udHJhY3RlZCBvbiBhbGwgc2lkZXMsIHdpdGggZGlmZmVyZW50IGFtb3VudHMgb2YgY29udHJhY3Rpb24gaG9yaXpvbnRhbGx5IGFuZCB2ZXJ0aWNhbGx5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB4IC0gQW1vdW50IHRvIGVyb2RlIGhvcml6b250YWxseSAoZm9yIGVhY2ggc2lkZSlcclxuICAgKiBAcGFyYW0geSAtIEFtb3VudCB0byBlcm9kZSB2ZXJ0aWNhbGx5IChmb3IgZWFjaCBzaWRlKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBlcm9kZWRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmRpbGF0ZWRYWSggLXgsIC15ICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBieSBhIHNwZWNpZmljIGFtb3VudCBvbiBhbGwgc2lkZXMgKG9yIGlmIHNvbWUgb2Zmc2V0cyBhcmUgbmVnYXRpdmUsIHdpbGwgY29udHJhY3RcclxuICAgKiB0aG9zZSBzaWRlcykuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gb2Zmc2V0KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGVmdCAtIEFtb3VudCB0byBleHBhbmQgdG8gdGhlIGxlZnQgKHN1YnRyYWN0cyBmcm9tIG1pblgpXHJcbiAgICogQHBhcmFtIHRvcCAtIEFtb3VudCB0byBleHBhbmQgdG8gdGhlIHRvcCAoc3VidHJhY3RzIGZyb20gbWluWSlcclxuICAgKiBAcGFyYW0gcmlnaHQgLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSByaWdodCAoYWRkcyB0byBtYXhYKVxyXG4gICAqIEBwYXJhbSBib3R0b20gLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSBib3R0b20gKGFkZHMgdG8gbWF4WSlcclxuICAgKi9cclxuICBwdWJsaWMgd2l0aE9mZnNldHMoIGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIGJvdHRvbTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIGIyKCB0aGlzLm1pblggLSBsZWZ0LCB0aGlzLm1pblkgLSB0b3AsIHRoaXMubWF4WCArIHJpZ2h0LCB0aGlzLm1heFkgKyBib3R0b20gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgaG9yaXpvbnRhbGx5IGJ5IHgsIHJldHVybmVkIGFzIGEgY29weS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdFgoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2hpZnRlZFgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMiggdGhpcy5taW5YICsgeCwgdGhpcy5taW5ZLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgdmVydGljYWxseSBieSB5LCByZXR1cm5lZCBhcyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2hpZnRZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIHNoaWZ0ZWRZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gYjIoIHRoaXMubWluWCwgdGhpcy5taW5ZICsgeSwgdGhpcy5tYXhYLCB0aGlzLm1heFkgKyB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdXIgYm91bmRzLCB0cmFuc2xhdGVkIGJ5ICh4LHkpLCByZXR1cm5lZCBhcyBhIGNvcHkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2hpZnQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2hpZnRlZFhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMiggdGhpcy5taW5YICsgeCwgdGhpcy5taW5ZICsgeSwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICsgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBvdXIgYm91bmRzLCB0cmFuc2xhdGVkIGJ5IGEgdmVjdG9yLCByZXR1cm5lZCBhcyBhIGNvcHkuXHJcbiAgICovXHJcbiAgcHVibGljIHNoaWZ0ZWQoIHY6IFZlY3RvcjIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zaGlmdGVkWFkoIHYueCwgdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGludGVycG9sYXRlZCB2YWx1ZSBvZiB0aGlzIGJvdW5kcyBhbmQgdGhlIGFyZ3VtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJvdW5kc1xyXG4gICAqIEBwYXJhbSByYXRpbyAtIDAgd2lsbCByZXN1bHQgaW4gYSBjb3B5IG9mIGB0aGlzYCwgMSB3aWxsIHJlc3VsdCBpbiBib3VuZHMsIGFuZCBpbi1iZXR3ZWVuIGNvbnRyb2xzIHRoZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudCBvZiBlYWNoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBibGVuZCggYm91bmRzOiBCb3VuZHMyLCByYXRpbzogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgY29uc3QgdCA9IDEgLSByYXRpbztcclxuICAgIHJldHVybiBiMihcclxuICAgICAgdCAqIHRoaXMubWluWCArIHJhdGlvICogYm91bmRzLm1pblgsXHJcbiAgICAgIHQgKiB0aGlzLm1pblkgKyByYXRpbyAqIGJvdW5kcy5taW5ZLFxyXG4gICAgICB0ICogdGhpcy5tYXhYICsgcmF0aW8gKiBib3VuZHMubWF4WCxcclxuICAgICAgdCAqIHRoaXMubWF4WSArIHJhdGlvICogYm91bmRzLm1heFlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBNdXRhYmxlIG9wZXJhdGlvbnNcclxuICAgKlxyXG4gICAqIEFsbCBtdXRhYmxlIG9wZXJhdGlvbnMgc2hvdWxkIGNhbGwgb25lIG9mIHRoZSBmb2xsb3dpbmc6XHJcbiAgICogICBzZXRNaW5NYXgsIHNldE1pblgsIHNldE1pblksIHNldE1heFgsIHNldE1heFlcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgZWFjaCB2YWx1ZSBmb3IgdGhpcyBib3VuZHMsIGFuZCByZXR1cm5zIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TWluTWF4KCBtaW5YOiBudW1iZXIsIG1pblk6IG51bWJlciwgbWF4WDogbnVtYmVyLCBtYXhZOiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICB0aGlzLm1pblggPSBtaW5YO1xyXG4gICAgdGhpcy5taW5ZID0gbWluWTtcclxuICAgIHRoaXMubWF4WCA9IG1heFg7XHJcbiAgICB0aGlzLm1heFkgPSBtYXhZO1xyXG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIG1pblguXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNaW5YKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TWluWCggbWluWDogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgdGhpcy5taW5YID0gbWluWDtcclxuICAgIHJldHVybiAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtaW5ZLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWluWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIHNldE1pblkoIG1pblk6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHRoaXMubWluWSA9IG1pblk7XHJcbiAgICByZXR1cm4gKCB0aGlzIGFzIHVua25vd24gYXMgQm91bmRzMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgbWF4WC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aE1heFgoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRNYXhYKCBtYXhYOiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICB0aGlzLm1heFggPSBtYXhYO1xyXG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIG1heFkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNYXhZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TWF4WSggbWF4WTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgdGhpcy5tYXhZID0gbWF4WTtcclxuICAgIHJldHVybiAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZXMgb2YgdGhpcyBib3VuZHMgdG8gYmUgZXF1YWwgdG8gdGhlIGlucHV0IGJvdW5kcy5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29weSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy5tYXhYLCBib3VuZHMubWF4WSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdCBjb250YWlucyBib3RoIGl0cyBvcmlnaW5hbCBib3VuZHMgYW5kIHRoZSBpbnB1dCBib3VuZHMuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHVuaW9uKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgaW5jbHVkZUJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5ZLCBib3VuZHMubWluWSApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhYLCBib3VuZHMubWF4WCApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdCBpcyB0aGUgbGFyZ2VzdCBib3VuZHMgY29udGFpbmVkIGJvdGggaW4gaXRzIG9yaWdpbmFsIGJvdW5kcyBhbmQgaW4gdGhlIGlucHV0IGJvdW5kcy5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gaW50ZXJzZWN0aW9uKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RyYWluQm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1pblgsIGJvdW5kcy5taW5YICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1pblksIGJvdW5kcy5taW5ZICksXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heFgsIGJvdW5kcy5tYXhYICksXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heFksIGJvdW5kcy5tYXhZIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGNvbnRhaW5zIGJvdGggaXRzIG9yaWdpbmFsIGJvdW5kcyBhbmQgdGhlIGlucHV0IHBvaW50ICh4LHkpLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoQ29vcmRpbmF0ZXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRDb29yZGluYXRlcyggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblgsIHggKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgeSApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhYLCB4ICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFksIHkgKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgY29udGFpbnMgYm90aCBpdHMgb3JpZ2luYWwgYm91bmRzIGFuZCB0aGUgaW5wdXQgcG9pbnQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhQb2ludCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmFkZENvb3JkaW5hdGVzKCBwb2ludC54LCBwb2ludC55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IGlzIGd1YXJhbnRlZWQgdG8gaW5jbHVkZSB0aGUgZ2l2ZW4geCB2YWx1ZSAoaWYgaXQgZGlkbid0IGFscmVhZHkpLiBJZiB0aGUgeCB2YWx1ZVxyXG4gICAqIHdhcyBhbHJlYWR5IGNvbnRhaW5lZCwgbm90aGluZyB3aWxsIGJlIGRvbmUuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkWCggeDogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgdGhpcy5taW5YID0gTWF0aC5taW4oIHgsIHRoaXMubWluWCApO1xyXG4gICAgdGhpcy5tYXhYID0gTWF0aC5tYXgoIHgsIHRoaXMubWF4WCApO1xyXG4gICAgcmV0dXJuICggdGhpcyBhcyB1bmtub3duIGFzIEJvdW5kczIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgaXMgZ3VhcmFudGVlZCB0byBpbmNsdWRlIHRoZSBnaXZlbiB5IHZhbHVlIChpZiBpdCBkaWRuJ3QgYWxyZWFkeSkuIElmIHRoZSB5IHZhbHVlXHJcbiAgICogd2FzIGFscmVhZHkgY29udGFpbmVkLCBub3RoaW5nIHdpbGwgYmUgZG9uZS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRZKCB5OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICB0aGlzLm1pblkgPSBNYXRoLm1pbiggeSwgdGhpcy5taW5ZICk7XHJcbiAgICB0aGlzLm1heFkgPSBNYXRoLm1heCggeSwgdGhpcy5tYXhZICk7XHJcbiAgICByZXR1cm4gKCB0aGlzIGFzIHVua25vd24gYXMgQm91bmRzMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdHMgYm91bmRhcmllcyBhcmUgaW50ZWdlci1hbGlnbmVkLCByb3VuZGluZyB0aGUgbWluaW11bSBib3VuZGFyaWVzIGRvd24gYW5kIHRoZVxyXG4gICAqIG1heGltdW0gYm91bmRhcmllcyB1cCAoZXhwYW5kaW5nIGFzIG5lY2Vzc2FyeSkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdW5kZWRPdXQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByb3VuZE91dCgpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5YICksXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWSApLFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WCApLFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWF4WSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdHMgYm91bmRhcmllcyBhcmUgaW50ZWdlci1hbGlnbmVkLCByb3VuZGluZyB0aGUgbWluaW11bSBib3VuZGFyaWVzIHVwIGFuZCB0aGVcclxuICAgKiBtYXhpbXVtIGJvdW5kYXJpZXMgZG93biAoY29udHJhY3RpbmcgYXMgbmVjZXNzYXJ5KS5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZEluKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgcm91bmRJbigpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcclxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1pblggKSxcclxuICAgICAgTWF0aC5jZWlsKCB0aGlzLm1pblkgKSxcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhYICksXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdCB3b3VsZCBmdWxseSBjb250YWluIGEgdHJhbnNmb3JtZWQgdmVyc2lvbiBpZiBpdHMgcHJldmlvdXMgdmFsdWUsIGFwcGx5aW5nIHRoZVxyXG4gICAqIG1hdHJpeCBhcyBhbiBhZmZpbmUgdHJhbnNmb3JtYXRpb24uXHJcbiAgICpcclxuICAgKiBOT1RFOiBib3VuZHMudHJhbnNmb3JtKCBtYXRyaXggKS50cmFuc2Zvcm0oIGludmVyc2UgKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIG9yaWdpbmFsIGJveCwgaWYgaXQgaW5jbHVkZXNcclxuICAgKiBhIHJvdGF0aW9uIHRoYXQgaXNuJ3QgYSBtdWx0aXBsZSBvZiAkXFxwaS8yJC4gVGhpcyBpcyBiZWNhdXNlIHRoZSBib3VuZHMgbWF5IGV4cGFuZCBpbiBhcmVhIHRvIGNvdmVyXHJcbiAgICogQUxMIG9mIHRoZSBjb3JuZXJzIG9mIHRoZSB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3guXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHRyYW5zZm9ybWVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgdHJhbnNmb3JtKCBtYXRyaXg6IE1hdHJpeDMgKTogQm91bmRzMiB7XHJcbiAgICAvLyBpZiB3ZSBjb250YWluIG5vIGFyZWEsIG5vIGNoYW5nZSBpcyBuZWVkZWRcclxuICAgIGlmICggdGhpcy5pc0VtcHR5KCkgKSB7XHJcbiAgICAgIHJldHVybiAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb3B0aW1pemF0aW9uIHRvIGJhaWwgZm9yIGlkZW50aXR5IG1hdHJpY2VzXHJcbiAgICBpZiAoIG1hdHJpeC5pc0lkZW50aXR5KCkgKSB7XHJcbiAgICAgIHJldHVybiAoIHRoaXMgYXMgdW5rbm93biBhcyBCb3VuZHMyICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWluWCA9IHRoaXMubWluWDtcclxuICAgIGNvbnN0IG1pblkgPSB0aGlzLm1pblk7XHJcbiAgICBjb25zdCBtYXhYID0gdGhpcy5tYXhYO1xyXG4gICAgY29uc3QgbWF4WSA9IHRoaXMubWF4WTtcclxuICAgIHRoaXMuc2V0KCBCb3VuZHMyLk5PVEhJTkcgKTtcclxuXHJcbiAgICAvLyB1c2luZyBtdXRhYmxlIHZlY3RvciBzbyB3ZSBkb24ndCBjcmVhdGUgZXhjZXNzaXZlIGluc3RhbmNlcyBvZiBWZWN0b3IyIGR1cmluZyB0aGlzXHJcbiAgICAvLyBtYWtlIHN1cmUgYWxsIDQgY29ybmVycyBhcmUgaW5zaWRlIHRoaXMgdHJhbnNmb3JtZWQgYm91bmRpbmcgYm94XHJcblxyXG4gICAgdGhpcy5hZGRQb2ludCggbWF0cml4Lm11bHRpcGx5VmVjdG9yMiggc2NyYXRjaFZlY3RvcjIuc2V0WFkoIG1pblgsIG1pblkgKSApICk7XHJcbiAgICB0aGlzLmFkZFBvaW50KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IyKCBzY3JhdGNoVmVjdG9yMi5zZXRYWSggbWluWCwgbWF4WSApICkgKTtcclxuICAgIHRoaXMuYWRkUG9pbnQoIG1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIHNjcmF0Y2hWZWN0b3IyLnNldFhZKCBtYXhYLCBtaW5ZICkgKSApO1xyXG4gICAgdGhpcy5hZGRQb2ludCggbWF0cml4Lm11bHRpcGx5VmVjdG9yMiggc2NyYXRjaFZlY3RvcjIuc2V0WFkoIG1heFgsIG1heFkgKSApICk7XHJcbiAgICByZXR1cm4gKCB0aGlzIGFzIHVua25vd24gYXMgQm91bmRzMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyBvbiBhbGwgc2lkZXMgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaWxhdGUoIGQ6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmRpbGF0ZVhZKCBkLCBkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeHBhbmRzIHRoaXMgYm91bmRzIGhvcml6b250YWxseSAobGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGRpbGF0ZVgoIHg6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YIC0geCwgdGhpcy5taW5ZLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4cGFuZHMgdGhpcyBib3VuZHMgdmVydGljYWxseSAodG9wIGFuZCBib3R0b20pIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGRpbGF0ZVkoIHk6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YLCB0aGlzLm1pblkgLSB5LCB0aGlzLm1heFgsIHRoaXMubWF4WSArIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4cGFuZHMgdGhpcyBib3VuZHMgaW5kZXBlbmRlbnRseSBpbiB0aGUgaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgZGlyZWN0aW9ucy4gV2lsbCBiZSBlcXVhbCB0byBjYWxsaW5nXHJcbiAgICogYm91bmRzLmRpbGF0ZVgoIHggKS5kaWxhdGVZKCB5ICkuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZWRYWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGRpbGF0ZVhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YIC0geCwgdGhpcy5taW5ZIC0geSwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICsgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udHJhY3RzIHRoaXMgYm91bmRzIG9uIGFsbCBzaWRlcyBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgZXJvZGUoIGQ6IG51bWJlciApOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZGlsYXRlKCAtZCApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQgYW5kIHJpZ2h0KSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGVyb2RlWCggeDogbnVtYmVyICk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5kaWxhdGVYKCAteCApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBlcm9kZVkoIHk6IG51bWJlciApOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZGlsYXRlWSggLXkgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBDb250cmFjdHMgdGhpcyBib3VuZHMgaW5kZXBlbmRlbnRseSBpbiB0aGUgaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgZGlyZWN0aW9ucy4gV2lsbCBiZSBlcXVhbCB0byBjYWxsaW5nXHJcbiAgICogYm91bmRzLmVyb2RlWCggeCApLmVyb2RlWSggeSApLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZWRYWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIGVyb2RlWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5kaWxhdGVYWSggLXgsIC15ICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyBpbmRlcGVuZGVudGx5IGZvciBlYWNoIHNpZGUgKG9yIGlmIHNvbWUgb2Zmc2V0cyBhcmUgbmVnYXRpdmUsIHdpbGwgY29udHJhY3QgdGhvc2Ugc2lkZXMpLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoT2Zmc2V0cygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0b1xyXG4gICAqIHJldHVybmluZyB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGVmdCAtIEFtb3VudCB0byBleHBhbmQgdG8gdGhlIGxlZnQgKHN1YnRyYWN0cyBmcm9tIG1pblgpXHJcbiAgICogQHBhcmFtIHRvcCAtIEFtb3VudCB0byBleHBhbmQgdG8gdGhlIHRvcCAoc3VidHJhY3RzIGZyb20gbWluWSlcclxuICAgKiBAcGFyYW0gcmlnaHQgLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSByaWdodCAoYWRkcyB0byBtYXhYKVxyXG4gICAqIEBwYXJhbSBib3R0b20gLSBBbW91bnQgdG8gZXhwYW5kIHRvIHRoZSBib3R0b20gKGFkZHMgdG8gbWF4WSlcclxuICAgKi9cclxuICBwdWJsaWMgb2Zmc2V0KCBsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCByaWdodDogbnVtYmVyLCBib3R0b206IG51bWJlciApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiBiMiggdGhpcy5taW5YIC0gbGVmdCwgdGhpcy5taW5ZIC0gdG9wLCB0aGlzLm1heFggKyByaWdodCwgdGhpcy5tYXhZICsgYm90dG9tICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2xhdGVzIG91ciBib3VuZHMgaG9yaXpvbnRhbGx5IGJ5IHguXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNoaWZ0ZWRYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2hpZnRYKCB4OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCArIHgsIHRoaXMubWluWSwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2xhdGVzIG91ciBib3VuZHMgdmVydGljYWxseSBieSB5LlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICovXHJcbiAgcHVibGljIHNoaWZ0WSggeTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblgsIHRoaXMubWluWSArIHksIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNsYXRlcyBvdXIgYm91bmRzIGJ5ICh4LHkpLlxyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgc2hpZnRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCArIHgsIHRoaXMubWluWSArIHksIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSArIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyBieSB0aGUgZ2l2ZW4gdmVjdG9yLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzaGlmdCggdjogVmVjdG9yMiApOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLnNoaWZ0WFkoIHYueCwgdi55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByYW5nZSBvZiB0aGUgeC12YWx1ZXMgb2YgdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFhSYW5nZSgpOiBSYW5nZSB7XHJcbiAgICByZXR1cm4gbmV3IFJhbmdlKCB0aGlzLm1pblgsIHRoaXMubWF4WCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgeC1yYW5nZSBvZiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0WFJhbmdlKCByYW5nZTogUmFuZ2UgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHJhbmdlLm1pbiwgdGhpcy5taW5ZLCByYW5nZS5tYXgsIHRoaXMubWF4WSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB4UmFuZ2UoKTogUmFuZ2UgeyByZXR1cm4gdGhpcy5nZXRYUmFuZ2UoKTsgfVxyXG5cclxuICBwdWJsaWMgc2V0IHhSYW5nZSggcmFuZ2U6IFJhbmdlICkgeyB0aGlzLnNldFhSYW5nZSggcmFuZ2UgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByYW5nZSBvZiB0aGUgeS12YWx1ZXMgb2YgdGhpcyBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFlSYW5nZSgpOiBSYW5nZSB7XHJcbiAgICByZXR1cm4gbmV3IFJhbmdlKCB0aGlzLm1pblksIHRoaXMubWF4WSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgeS1yYW5nZSBvZiB0aGlzIGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0WVJhbmdlKCByYW5nZTogUmFuZ2UgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCwgcmFuZ2UubWluLCB0aGlzLm1heFgsIHJhbmdlLm1heCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCB5UmFuZ2UoKTogUmFuZ2UgeyByZXR1cm4gdGhpcy5nZXRZUmFuZ2UoKTsgfVxyXG5cclxuICBwdWJsaWMgc2V0IHlSYW5nZSggcmFuZ2U6IFJhbmdlICkgeyB0aGlzLnNldFlSYW5nZSggcmFuZ2UgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIGEgcG9pbnQgaW4gdGhlIGJvdW5kcyBjbG9zZXN0IHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gdGVzdC5cclxuICAgKiBAcGFyYW0geSAtIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gdGVzdC5cclxuICAgKiBAcGFyYW0gW3Jlc3VsdF0gLSBWZWN0b3IyIHRoYXQgY2FuIHN0b3JlIHRoZSByZXR1cm4gdmFsdWUgdG8gYXZvaWQgYWxsb2NhdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENsb3Nlc3RQb2ludCggeDogbnVtYmVyLCB5OiBudW1iZXIsIHJlc3VsdD86IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBpZiAoIHJlc3VsdCApIHtcclxuICAgICAgcmVzdWx0LnNldFhZKCB4LCB5ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmVzdWx0ID0gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuICAgIH1cclxuICAgIGlmICggcmVzdWx0LnggPCB0aGlzLm1pblggKSB7IHJlc3VsdC54ID0gdGhpcy5taW5YOyB9XHJcbiAgICBpZiAoIHJlc3VsdC54ID4gdGhpcy5tYXhYICkgeyByZXN1bHQueCA9IHRoaXMubWF4WDsgfVxyXG4gICAgaWYgKCByZXN1bHQueSA8IHRoaXMubWluWSApIHsgcmVzdWx0LnkgPSB0aGlzLm1pblk7IH1cclxuICAgIGlmICggcmVzdWx0LnkgPiB0aGlzLm1heFkgKSB7IHJlc3VsdC55ID0gdGhpcy5tYXhZOyB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XHJcbiAgICBCb3VuZHMyLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIEJvdW5kczIsIHtcclxuICAgIGluaXRpYWxpemU6IEJvdW5kczIucHJvdG90eXBlLnNldE1pbk1heCxcclxuICAgIGRlZmF1bHRBcmd1bWVudHM6IFsgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIF1cclxuICB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiBvYmplY3QsIHdpdGggdGhlIGZhbWlsaWFyIHJlY3RhbmdsZSBjb25zdHJ1Y3Rpb24gd2l0aCB4LCB5LCB3aWR0aCwgYW5kIGhlaWdodC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB4IC0gVGhlIG1pbmltdW0gdmFsdWUgb2YgWCBmb3IgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0geSAtIFRoZSBtaW5pbXVtIHZhbHVlIG9mIFkgZm9yIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHdpZHRoIC0gVGhlIHdpZHRoIChtYXhYIC0gbWluWCkgb2YgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gVGhlIGhlaWdodCAobWF4WSAtIG1pblkpIG9mIHRoZSBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWN0KCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gYjIoIHgsIHksIHggKyB3aWR0aCwgeSArIGhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMyIG9iamVjdCB3aXRoIGEgZ2l2ZW4gb3JpZW50YXRpb24gKG1pbi9tYXggc3BlY2lmaWVkIGZvciBib3RoIHRoZSBnaXZlbiAocHJpbWFyeSkgb3JpZW50YXRpb24sXHJcbiAgICogYW5kIGFsc28gdGhlIHNlY29uZGFyeSBvcmllbnRhdGlvbikuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBvcmllbnRlZCggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCBtaW5QcmltYXJ5OiBudW1iZXIsIG1pblNlY29uZGFyeTogbnVtYmVyLCBtYXhQcmltYXJ5OiBudW1iZXIsIG1heFNlY29uZGFyeTogbnVtYmVyICk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gbmV3IEJvdW5kczIoXHJcbiAgICAgIG1pblByaW1hcnksXHJcbiAgICAgIG1pblNlY29uZGFyeSxcclxuICAgICAgbWF4UHJpbWFyeSxcclxuICAgICAgbWF4U2Vjb25kYXJ5XHJcbiAgICApIDogbmV3IEJvdW5kczIoXHJcbiAgICAgIG1pblNlY29uZGFyeSxcclxuICAgICAgbWluUHJpbWFyeSxcclxuICAgICAgbWF4U2Vjb25kYXJ5LFxyXG4gICAgICBtYXhQcmltYXJ5XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMyIG9iamVjdCB0aGF0IG9ubHkgY29udGFpbnMgdGhlIHNwZWNpZmllZCBwb2ludCAoeCx5KS4gVXNlZnVsIGZvciBiZWluZyBkaWxhdGVkIHRvIGZvcm0gYVxyXG4gICAqIGJvdW5kaW5nIGJveCBhcm91bmQgYSBwb2ludC4gTm90ZSB0aGF0IHRoZSBib3VuZHMgd2lsbCBub3QgYmUgXCJlbXB0eVwiIGFzIGl0IGNvbnRhaW5zICh4LHkpLCBidXQgaXQgd2lsbCBoYXZlXHJcbiAgICogemVybyBhcmVhLiBUaGUgeCBhbmQgeSBjb29yZGluYXRlcyBjYW4gYmUgc3BlY2lmaWVkIGJ5IG51bWJlcnMgb3Igd2l0aCBhdCBWZWN0b3IyXHJcbiAgICpcclxuICAgKiBAcGFyYW0geFxyXG4gICAqIEBwYXJhbSB5XHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwb2ludCggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogQm91bmRzMjtcclxuICBzdGF0aWMgcG9pbnQoIHY6IFZlY3RvcjIgKTogQm91bmRzMjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcclxuICBzdGF0aWMgcG9pbnQoIHg6IFZlY3RvcjIgfCBudW1iZXIsIHk/OiBudW1iZXIgKTogQm91bmRzMiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XHJcbiAgICBpZiAoIHggaW5zdGFuY2VvZiBWZWN0b3IyICkge1xyXG4gICAgICBjb25zdCBwID0geDtcclxuICAgICAgcmV0dXJuIGIyKCBwLngsIHAueSwgcC54LCBwLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gYjIoIHgsIHkhLCB4LCB5ISApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSGVscHMgdG8gaWRlbnRpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgYm91bmRzXHJcbiAgcHVibGljIGlzQm91bmRzITogYm9vbGVhbjtcclxuICBwdWJsaWMgZGltZW5zaW9uPzogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBBIGNvbnN0YW50IEJvdW5kczIgd2l0aCBtaW5pbXVtcyA9ICRcXGluZnR5JCwgbWF4aW11bXMgPSAkLVxcaW5mdHkkLCBzbyB0aGF0IGl0IHJlcHJlc2VudHMgXCJubyBib3VuZHMgd2hhdHNvZXZlclwiLlxyXG4gICAqXHJcbiAgICogVGhpcyBhbGxvd3MgdXMgdG8gdGFrZSB0aGUgdW5pb24gKHVuaW9uL2luY2x1ZGVCb3VuZHMpIG9mIHRoaXMgYW5kIGFueSBvdGhlciBCb3VuZHMyIHRvIGdldCB0aGUgb3RoZXIgYm91bmRzIGJhY2ssXHJcbiAgICogZS5nLiBCb3VuZHMyLk5PVEhJTkcudW5pb24oIGJvdW5kcyApLmVxdWFscyggYm91bmRzICkuIFRoaXMgb2JqZWN0IG5hdHVyYWxseSBzZXJ2ZXMgYXMgdGhlIGJhc2UgY2FzZSBhcyBhIHVuaW9uIG9mXHJcbiAgICogemVybyBib3VuZHMgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEFkZGl0aW9uYWxseSwgaW50ZXJzZWN0aW9ucyB3aXRoIE5PVEhJTkcgd2lsbCBhbHdheXMgcmV0dXJuIGEgQm91bmRzMiBlcXVpdmFsZW50IHRvIE5PVEhJTkcuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOT1RISU5HID0gbmV3IEJvdW5kczIoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSApO1xyXG5cclxuICAvKipcclxuICAgKiBBIGNvbnN0YW50IEJvdW5kczIgd2l0aCBtaW5pbXVtcyA9ICQtXFxpbmZ0eSQsIG1heGltdW1zID0gJFxcaW5mdHkkLCBzbyB0aGF0IGl0IHJlcHJlc2VudHMgXCJhbGwgYm91bmRzXCIuXHJcbiAgICpcclxuICAgKiBUaGlzIGFsbG93cyB1cyB0byB0YWtlIHRoZSBpbnRlcnNlY3Rpb24gKGludGVyc2VjdGlvbi9jb25zdHJhaW5Cb3VuZHMpIG9mIHRoaXMgYW5kIGFueSBvdGhlciBCb3VuZHMyIHRvIGdldCB0aGVcclxuICAgKiBvdGhlciBib3VuZHMgYmFjaywgZS5nLiBCb3VuZHMyLkVWRVJZVEhJTkcuaW50ZXJzZWN0aW9uKCBib3VuZHMgKS5lcXVhbHMoIGJvdW5kcyApLiBUaGlzIG9iamVjdCBuYXR1cmFsbHkgc2VydmVzIGFzXHJcbiAgICogdGhlIGJhc2UgY2FzZSBhcyBhbiBpbnRlcnNlY3Rpb24gb2YgemVybyBib3VuZHMgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEFkZGl0aW9uYWxseSwgdW5pb25zIHdpdGggRVZFUllUSElORyB3aWxsIGFsd2F5cyByZXR1cm4gYSBCb3VuZHMyIGVxdWl2YWxlbnQgdG8gRVZFUllUSElORy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVWRVJZVEhJTkcgPSBuZXcgQm91bmRzMiggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQm91bmRzMklPID0gbmV3IElPVHlwZSggJ0JvdW5kczJJTycsIHtcclxuICAgIHZhbHVlVHlwZTogQm91bmRzMixcclxuICAgIGRvY3VtZW50YXRpb246ICdhIDItZGltZW5zaW9uYWwgYm91bmRzIHJlY3RhbmdsZScsXHJcbiAgICB0b1N0YXRlT2JqZWN0OiAoIGJvdW5kczI6IEJvdW5kczIgKSA9PiAoIHsgbWluWDogYm91bmRzMi5taW5YLCBtaW5ZOiBib3VuZHMyLm1pblksIG1heFg6IGJvdW5kczIubWF4WCwgbWF4WTogYm91bmRzMi5tYXhZIH0gKSxcclxuICAgIGZyb21TdGF0ZU9iamVjdDogKCBzdGF0ZU9iamVjdDogQm91bmRzMlN0YXRlT2JqZWN0ICkgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IEJvdW5kczIoXHJcbiAgICAgICAgSW5maW5pdGVOdW1iZXJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1pblggKSxcclxuICAgICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWluWSApLFxyXG4gICAgICAgIEluZmluaXRlTnVtYmVySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5tYXhYICksXHJcbiAgICAgICAgSW5maW5pdGVOdW1iZXJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1heFkgKVxyXG4gICAgICApO1xyXG4gICAgfSxcclxuICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgIG1pblg6IEluZmluaXRlTnVtYmVySU8sXHJcbiAgICAgIG1heFg6IEluZmluaXRlTnVtYmVySU8sXHJcbiAgICAgIG1pblk6IEluZmluaXRlTnVtYmVySU8sXHJcbiAgICAgIG1heFk6IEluZmluaXRlTnVtYmVySU9cclxuICAgIH1cclxuICB9ICk7XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ0JvdW5kczInLCBCb3VuZHMyICk7XHJcblxyXG5jb25zdCBiMiA9IEJvdW5kczIucG9vbC5jcmVhdGUuYmluZCggQm91bmRzMi5wb29sICk7XHJcbmRvdC5yZWdpc3RlciggJ2IyJywgYjIgKTtcclxuXHJcbkJvdW5kczIucHJvdG90eXBlLmlzQm91bmRzID0gdHJ1ZTtcclxuQm91bmRzMi5wcm90b3R5cGUuZGltZW5zaW9uID0gMjtcclxuXHJcbmZ1bmN0aW9uIGNhdGNoSW1tdXRhYmxlU2V0dGVyTG93SGFuZ2luZ0ZydWl0KCBib3VuZHM6IEJvdW5kczIgKTogdm9pZCB7XHJcbiAgYm91bmRzLnNldE1pbk1heCA9ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKCAnQXR0ZW1wdCB0byBzZXQgXCJzZXRNaW5NYXhcIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XHJcbiAgYm91bmRzLnNldCA9ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKCAnQXR0ZW1wdCB0byBzZXQgXCJzZXRcIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XHJcbiAgYm91bmRzLmluY2x1ZGVCb3VuZHMgPSAoKSA9PiB7IHRocm93IG5ldyBFcnJvciggJ0F0dGVtcHQgdG8gc2V0IFwiaW5jbHVkZUJvdW5kc1wiIG9mIGFuIGltbXV0YWJsZSBCb3VuZHMyIG9iamVjdCcgKTsgfTtcclxuICBib3VuZHMuY29uc3RyYWluQm91bmRzID0gKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoICdBdHRlbXB0IHRvIHNldCBcImNvbnN0cmFpbkJvdW5kc1wiIG9mIGFuIGltbXV0YWJsZSBCb3VuZHMyIG9iamVjdCcgKTsgfTtcclxuICBib3VuZHMuYWRkQ29vcmRpbmF0ZXMgPSAoKSA9PiB7IHRocm93IG5ldyBFcnJvciggJ0F0dGVtcHQgdG8gc2V0IFwiYWRkQ29vcmRpbmF0ZXNcIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XHJcbiAgYm91bmRzLnRyYW5zZm9ybSA9ICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKCAnQXR0ZW1wdCB0byBzZXQgXCJ0cmFuc2Zvcm1cIiBvZiBhbiBpbW11dGFibGUgQm91bmRzMiBvYmplY3QnICk7IH07XHJcbn1cclxuXHJcbmlmICggYXNzZXJ0ICkge1xyXG4gIGNhdGNoSW1tdXRhYmxlU2V0dGVyTG93SGFuZ2luZ0ZydWl0KCBCb3VuZHMyLkVWRVJZVEhJTkcgKTtcclxuICBjYXRjaEltbXV0YWJsZVNldHRlckxvd0hhbmdpbmdGcnVpdCggQm91bmRzMi5OT1RISU5HICk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLGdCQUFnQixNQUFxQywyQ0FBMkM7QUFDdkcsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFFMUIsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsT0FBT0MsSUFBSSxNQUFxQiw0QkFBNEI7QUFDNUQsT0FB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