// Copyright 2013-2022, University of Colorado Boulder

/**
 * A 3D cuboid-shaped bounded area (bounding box).
 *
 * There are a number of convenience functions to get locations and points on the Bounds. Currently we do not
 * store these with the Bounds3 instance, since we want to lower the memory footprint.
 *
 * minX, minY, minZ, maxX, maxY, and maxZ are actually stored. We don't do x,y,z,width,height,depth because this can't properly express
 * semi-infinite bounds (like a half-plane), or easily handle what Bounds3.NOTHING and Bounds3.EVERYTHING do with
 * the constructive solid areas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../phet-core/js/Poolable.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Vector3 from './Vector3.js';
class Bounds3 {
  /**
   * Creates a 3-dimensional bounds (bounding box).
   * @public
   *
   * @param {number} minX - The initial minimum X coordinate of the bounds.
   * @param {number} minY - The initial minimum Y coordinate of the bounds.
   * @param {number} minZ - The initial minimum Z coordinate of the bounds.
   * @param {number} maxX - The initial maximum X coordinate of the bounds.
   * @param {number} maxY - The initial maximum Y coordinate of the bounds.
   * @param {number} maxZ - The initial maximum Z coordinate of the bounds.
   */
  constructor(minX, minY, minZ, maxX, maxY, maxZ) {
    assert && assert(maxY !== undefined, 'Bounds3 requires 4 parameters');

    // @public {number} - The minimum X coordinate of the bounds.
    this.minX = minX;

    // @public {number} - The minimum Y coordinate of the bounds.
    this.minY = minY;

    // @public {number} - The minimum Z coordinate of the bounds.
    this.minZ = minZ;

    // @public {number} - The maximum X coordinate of the bounds.
    this.maxX = maxX;

    // @public {number} - The maximum Y coordinate of the bounds.
    this.maxY = maxY;

    // @public {number} - The maximum Z coordinate of the bounds.
    this.maxZ = maxZ;
  }

  /*---------------------------------------------------------------------------*
   * Properties
   *---------------------------------------------------------------------------*/

  /**
   * The width of the bounds, defined as maxX - minX.
   * @public
   *
   * @returns {number}
   */
  getWidth() {
    return this.maxX - this.minX;
  }
  get width() {
    return this.getWidth();
  }

  /**
   * The height of the bounds, defined as maxY - minY.
   * @public
   *
   * @returns {number}
   */
  getHeight() {
    return this.maxY - this.minY;
  }
  get height() {
    return this.getHeight();
  }

  /**
   * The depth of the bounds, defined as maxZ - minZ.
   * @public
   *
   * @returns {number}
   */
  getDepth() {
    return this.maxZ - this.minZ;
  }
  get depth() {
    return this.getDepth();
  }

  /*
   * Convenience locations
   * upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
   *
   *             minX (x)     centerX        maxX
   *          ---------------------------------------
   * minY (y) | upperLeft   upperCenter   upperRight
   * centerY  | centerLeft    center      centerRight
   * maxY     | lowerLeft   lowerCenter   lowerRight
   */

  /**
   * Alias for minX, when thinking of the bounds as an (x,y,z,width,height,depth) cuboid.
   * @public
   *
   * @returns {number}
   */
  getX() {
    return this.minX;
  }
  get x() {
    return this.getX();
  }

  /**
   * Alias for minY, when thinking of the bounds as an (x,y,z,width,height,depth) cuboid.
   * @public
   *
   * @returns {number}
   */
  getY() {
    return this.minY;
  }
  get y() {
    return this.getY();
  }

  /**
   * Alias for minZ, when thinking of the bounds as an (x,y,z,width,height,depth) cuboid.
   * @public
   *
   * @returns {number}
   */
  getZ() {
    return this.minZ;
  }
  get z() {
    return this.getZ();
  }

  /**
   * Alias for minX, supporting the explicit getter function style.
   * @public
   *
   * @returns {number}
   */
  getMinX() {
    return this.minX;
  }

  /**
   * Alias for minY, supporting the explicit getter function style.
   * @public
   *
   * @returns {number}
   */
  getMinY() {
    return this.minY;
  }

  /**
   * Alias for minZ, supporting the explicit getter function style.
   * @public
   *
   * @returns {number}
   */
  getMinZ() {
    return this.minZ;
  }

  /**
   * Alias for maxX, supporting the explicit getter function style.
   * @public
   *
   * @returns {number}
   */
  getMaxX() {
    return this.maxX;
  }

  /**
   * Alias for maxY, supporting the explicit getter function style.
   * @public
   *
   * @returns {number}
   */
  getMaxY() {
    return this.maxY;
  }

  /**
   * Alias for maxZ, supporting the explicit getter function style.
   * @public
   *
   * @returns {number}
   */
  getMaxZ() {
    return this.maxZ;
  }

  /**
   * Alias for minX, when thinking in the UI-layout manner.
   * @public
   *
   * @returns {number}
   */
  getLeft() {
    return this.minX;
  }
  get left() {
    return this.minX;
  }

  /**
   * Alias for minY, when thinking in the UI-layout manner.
   * @public
   *
   * @returns {number}
   */
  getTop() {
    return this.minY;
  }
  get top() {
    return this.minY;
  }

  /**
   * Alias for minZ, when thinking in the UI-layout manner.
   * @public
   *
   * @returns {number}
   */
  getBack() {
    return this.minZ;
  }
  get back() {
    return this.minZ;
  }

  /**
   * Alias for maxX, when thinking in the UI-layout manner.
   * @public
   *
   * @returns {number}
   */
  getRight() {
    return this.maxX;
  }
  get right() {
    return this.maxX;
  }

  /**
   * Alias for maxY, when thinking in the UI-layout manner.
   * @public
   *
   * @returns {number}
   */
  getBottom() {
    return this.maxY;
  }
  get bottom() {
    return this.maxY;
  }

  /**
   * Alias for maxZ, when thinking in the UI-layout manner.
   * @public
   *
   * @returns {number}
   */
  getFront() {
    return this.maxZ;
  }
  get front() {
    return this.maxZ;
  }

  /**
   * The horizontal (X-coordinate) center of the bounds, averaging the minX and maxX.
   * @public
   *
   * @returns {number}
   */
  getCenterX() {
    return (this.maxX + this.minX) / 2;
  }
  get centerX() {
    return this.getCenterX();
  }

  /**
   * The vertical (Y-coordinate) center of the bounds, averaging the minY and maxY.
   * @public
   *
   * @returns {number}
   */
  getCenterY() {
    return (this.maxY + this.minY) / 2;
  }
  get centerY() {
    return this.getCenterY();
  }

  /**
   * The depthwise (Z-coordinate) center of the bounds, averaging the minZ and maxZ.
   * @public
   *
   * @returns {number}
   */
  getCenterZ() {
    return (this.maxZ + this.minZ) / 2;
  }
  get centerZ() {
    return this.getCenterZ();
  }

  /**
   * The point (centerX, centerY, centerZ), in the center of the bounds.
   * @public
   *
   * @returns {Vector3}
   */
  getCenter() {
    return new Vector3(this.getCenterX(), this.getCenterY(), this.getCenterZ());
  }
  get center() {
    return this.getCenter();
  }

  /**
   * Whether we have negative width, height or depth. Bounds3.NOTHING is a prime example of an empty Bounds3.
   * Bounds with width = height = depth = 0 are considered not empty, since they include the single (0,0,0) point.
   * @public
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.getWidth() < 0 || this.getHeight() < 0 || this.getDepth() < 0;
  }

  /**
   * Whether our minimums and maximums are all finite numbers. This will exclude Bounds3.NOTHING and Bounds3.EVERYTHING.
   * @public
   *
   * @returns {boolean}
   */
  isFinite() {
    return isFinite(this.minX) && isFinite(this.minY) && isFinite(this.minZ) && isFinite(this.maxX) && isFinite(this.maxY) && isFinite(this.maxZ);
  }

  /**
   * Whether this bounds has a non-zero area (non-zero positive width, height and depth).
   * @public
   *
   * @returns {boolean}
   */
  hasNonzeroArea() {
    return this.getWidth() > 0 && this.getHeight() > 0 && this.getDepth() > 0;
  }

  /**
   * Whether this bounds has a finite and non-negative width, height and depth.
   * @public
   *
   * @returns {boolean}
   */
  isValid() {
    return !this.isEmpty() && this.isFinite();
  }

  /**
   * Whether the coordinates are contained inside the bounding box, or are on the boundary.
   * @public
   *
   * @param {number} x - X coordinate of the point to check
   * @param {number} y - Y coordinate of the point to check
   * @param {number} z - Z coordinate of the point to check
   * @returns {boolean}
   */
  containsCoordinates(x, y, z) {
    return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY && this.minZ <= z && z <= this.maxZ;
  }

  /**
   * Whether the point is contained inside the bounding box, or is on the boundary.
   * @public
   *
   * @param {Vector3} point
   * @returns {boolean}
   */
  containsPoint(point) {
    return this.containsCoordinates(point.x, point.y, point.z);
  }

  /**
   * Whether this bounding box completely contains the bounding box passed as a parameter. The boundary of a box is
   * considered to be "contained".
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {boolean}
   */
  containsBounds(bounds) {
    return this.minX <= bounds.minX && this.maxX >= bounds.maxX && this.minY <= bounds.minY && this.maxY >= bounds.maxY && this.minZ <= bounds.minZ && this.maxZ >= bounds.maxZ;
  }

  /**
   * Whether this and another bounding box have any points of intersection (including touching boundaries).
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {boolean}
   */
  intersectsBounds(bounds) {
    // TODO: more efficient way of doing this?
    return !this.intersection(bounds).isEmpty();
  }

  /**
   * Debugging string for the bounds.
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `[x:(${this.minX},${this.maxX}),y:(${this.minY},${this.maxY}),z:(${this.minZ},${this.maxZ})]`;
  }

  /**
   * Exact equality comparison between this bounds and another bounds.
   * @public
   *
   * @param {Bounds3} other
   * @returns {boolean} - Whether the two bounds are equal
   */
  equals(other) {
    return this.minX === other.minX && this.minY === other.minY && this.minZ === other.minZ && this.maxX === other.maxX && this.maxY === other.maxY && this.maxZ === other.maxZ;
  }

  /**
   * Approximate equality comparison between this bounds and another bounds.
   * @public
   *
   * @param {Bounds3} other
   * @param {number} epsilon
   * @returns {boolean} - Whether difference between the two bounds has no min/max with an absolute value greater
   *                      than epsilon.
   */
  equalsEpsilon(other, epsilon) {
    epsilon = epsilon !== undefined ? epsilon : 0;
    const thisFinite = this.isFinite();
    const otherFinite = other.isFinite();
    if (thisFinite && otherFinite) {
      // both are finite, so we can use Math.abs() - it would fail with non-finite values like Infinity
      return Math.abs(this.minX - other.minX) < epsilon && Math.abs(this.minY - other.minY) < epsilon && Math.abs(this.minZ - other.minZ) < epsilon && Math.abs(this.maxX - other.maxX) < epsilon && Math.abs(this.maxY - other.maxY) < epsilon && Math.abs(this.maxZ - other.maxZ) < epsilon;
    } else if (thisFinite !== otherFinite) {
      return false; // one is finite, the other is not. definitely not equal
    } else if (this === other) {
      return true; // exact same instance, must be equal
    } else {
      // epsilon only applies on finite dimensions. due to JS's handling of isFinite(), it's faster to check the sum of both
      return (isFinite(this.minX + other.minX) ? Math.abs(this.minX - other.minX) < epsilon : this.minX === other.minX) && (isFinite(this.minY + other.minY) ? Math.abs(this.minY - other.minY) < epsilon : this.minY === other.minY) && (isFinite(this.minZ + other.minZ) ? Math.abs(this.minZ - other.minZ) < epsilon : this.minZ === other.minZ) && (isFinite(this.maxX + other.maxX) ? Math.abs(this.maxX - other.maxX) < epsilon : this.maxX === other.maxX) && (isFinite(this.maxY + other.maxY) ? Math.abs(this.maxY - other.maxY) < epsilon : this.maxY === other.maxY) && (isFinite(this.maxZ + other.maxZ) ? Math.abs(this.maxZ - other.maxZ) < epsilon : this.maxZ === other.maxZ);
    }
  }

  /*---------------------------------------------------------------------------*
   * Immutable operations
   *---------------------------------------------------------------------------*/

  /**
   * Creates a copy of this bounds, or if a bounds is passed in, set that bounds's values to ours.
   * @public
   *
   * This is the immutable form of the function set(), if a bounds is provided. This will return a new bounds, and
   * will not modify this bounds.
   *
   * @param {Bounds3} [bounds] - If not provided, creates a new Bounds3 with filled in values. Otherwise, fills in the
   *                             values of the provided bounds so that it equals this bounds.
   * @returns {Bounds3}
   */
  copy(bounds) {
    if (bounds) {
      return bounds.set(this);
    } else {
      return new Bounds3(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ);
    }
  }

  /**
   * The smallest bounds that contains both this bounds and the input bounds, returned as a copy.
   * @public
   *
   * This is the immutable form of the function includeBounds(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {Bounds3} bounds
   * @returns {Bounds3}
   */
  union(bounds) {
    return new Bounds3(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.min(this.minZ, bounds.minZ), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY), Math.max(this.maxZ, bounds.maxZ));
  }

  /**
   * The smallest bounds that is contained by both this bounds and the input bounds, returned as a copy.
   * @public
   *
   * This is the immutable form of the function constrainBounds(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {Bounds3} bounds
   * @returns {Bounds3}
   */
  intersection(bounds) {
    return new Bounds3(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.max(this.minZ, bounds.minZ), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY), Math.min(this.maxZ, bounds.maxZ));
  }

  // TODO: difference should be well-defined, but more logic is needed to compute

  /**
   * The smallest bounds that contains this bounds and the point (x,y,z), returned as a copy.
   * @public
   *
   * This is the immutable form of the function addCoordinates(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  withCoordinates(x, y, z) {
    return new Bounds3(Math.min(this.minX, x), Math.min(this.minY, y), Math.min(this.minZ, z), Math.max(this.maxX, x), Math.max(this.maxY, y), Math.max(this.maxZ, z));
  }

  /**
   * The smallest bounds that contains this bounds and the input point, returned as a copy.
   * @public
   *
   * This is the immutable form of the function addPoint(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {Vector3} point
   * @returns {Bounds3}
   */
  withPoint(point) {
    return this.withCoordinates(point.x, point.y, point.z);
  }

  /**
   * A copy of this bounds, with minX replaced with the input.
   * @public
   *
   * This is the immutable form of the function setMinX(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} minX
   * @returns {Bounds3}
   */
  withMinX(minX) {
    return new Bounds3(minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ);
  }

  /**
   * A copy of this bounds, with minY replaced with the input.
   * @public
   *
   * This is the immutable form of the function setMinY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} minY
   * @returns {Bounds3}
   */
  withMinY(minY) {
    return new Bounds3(this.minX, minY, this.minZ, this.maxX, this.maxY, this.maxZ);
  }

  /**
   * A copy of this bounds, with minZ replaced with the input.
   * @public
   *
   * This is the immutable form of the function setMinZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} minZ
   * @returns {Bounds3}
   */
  withMinZ(minZ) {
    return new Bounds3(this.minX, this.minY, minZ, this.maxX, this.maxY, this.maxZ);
  }

  /**
   * A copy of this bounds, with maxX replaced with the input.
   * @public
   *
   * This is the immutable form of the function setMaxX(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} maxX
   * @returns {Bounds3}
   */
  withMaxX(maxX) {
    return new Bounds3(this.minX, this.minY, this.minZ, maxX, this.maxY, this.maxZ);
  }

  /**
   * A copy of this bounds, with maxY replaced with the input.
   * @public
   *
   * This is the immutable form of the function setMaxY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} maxY
   * @returns {Bounds3}
   */
  withMaxY(maxY) {
    return new Bounds3(this.minX, this.minY, this.minZ, this.maxX, maxY, this.maxZ);
  }

  /**
   * A copy of this bounds, with maxZ replaced with the input.
   * @public
   *
   * This is the immutable form of the function setMaxZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} maxZ
   * @returns {Bounds3}
   */
  withMaxZ(maxZ) {
    return new Bounds3(this.minX, this.minY, this.minZ, this.maxX, this.maxY, maxZ);
  }

  /**
   * A copy of this bounds, with the minimum values rounded down to the nearest integer, and the maximum values
   * rounded up to the nearest integer. This causes the bounds to expand as necessary so that its boundaries
   * are integer-aligned.
   * @public
   *
   * This is the immutable form of the function roundOut(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @returns {Bounds3}
   */
  roundedOut() {
    return new Bounds3(Math.floor(this.minX), Math.floor(this.minY), Math.floor(this.minZ), Math.ceil(this.maxX), Math.ceil(this.maxY), Math.ceil(this.maxZ));
  }

  /**
   * A copy of this bounds, with the minimum values rounded up to the nearest integer, and the maximum values
   * rounded down to the nearest integer. This causes the bounds to contract as necessary so that its boundaries
   * are integer-aligned.
   * @public
   *
   * This is the immutable form of the function roundIn(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @returns {Bounds3}
   */
  roundedIn() {
    return new Bounds3(Math.ceil(this.minX), Math.ceil(this.minY), Math.ceil(this.minZ), Math.floor(this.maxX), Math.floor(this.maxY), Math.floor(this.maxZ));
  }

  /**
   * A bounding box (still axis-aligned) that contains the transformed shape of this bounds, applying the matrix as
   * an affine transformation.
   * @public
   *
   * NOTE: bounds.transformed( matrix ).transformed( inverse ) may be larger than the original box, if it includes
   * a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in area to cover
   * ALL of the corners of the transformed bounding box.
   *
   * This is the immutable form of the function transform(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {Matrix4} matrix
   * @returns {Bounds3}
   */
  transformed(matrix) {
    return this.copy().transform(matrix);
  }

  /**
   * A bounding box that is expanded on all sides by the specified amount.)
   * @public
   *
   * This is the immutable form of the function dilate(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} d
   * @returns {Bounds3}
   */
  dilated(d) {
    return this.dilatedXYZ(d, d, d);
  }

  /**
   * A bounding box that is expanded horizontally (on the left and right) by the specified amount.
   * @public
   *
   * This is the immutable form of the function dilateX(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x
   * @returns {Bounds3}
   */
  dilatedX(x) {
    return new Bounds3(this.minX - x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
  }

  /**
   * A bounding box that is expanded vertically (on the top and bottom) by the specified amount.
   * @public
   *
   * This is the immutable form of the function dilateY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} y
   * @returns {Bounds3}
   */
  dilatedY(y) {
    return new Bounds3(this.minX, this.minY - y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
  }

  /**
   * A bounding box that is expanded depth-wise (on the front and back) by the specified amount.
   * @public
   *
   * This is the immutable form of the function dilateZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} z
   * @returns {Bounds3}
   */
  dilatedZ(z) {
    return new Bounds3(this.minX, this.minY, this.minZ - z, this.maxX, this.maxY, this.maxZ + z);
  }

  /**
   * A bounding box that is expanded on all sides, with different amounts of expansion along each axis.
   * Will be identical to the bounds returned by calling bounds.dilatedX( x ).dilatedY( y ).dilatedZ( z ).
   * @public
   *
   * This is the immutable form of the function dilateXYZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x - Amount to dilate horizontally (for each side)
   * @param {number} y - Amount to dilate vertically (for each side)
   * @param {number} z - Amount to dilate depth-wise (for each side)
   * @returns {Bounds3}
   */
  dilatedXYZ(x, y, z) {
    return new Bounds3(this.minX - x, this.minY - y, this.minZ - z, this.maxX + x, this.maxY + y, this.maxZ + z);
  }

  /**
   * A bounding box that is contracted on all sides by the specified amount.
   * @public
   *
   * This is the immutable form of the function erode(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} amount
   * @returns {Bounds3}
   */
  eroded(amount) {
    return this.dilated(-amount);
  }

  /**
   * A bounding box that is contracted horizontally (on the left and right) by the specified amount.
   * @public
   *
   * This is the immutable form of the function erodeX(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x
   * @returns {Bounds3}
   */
  erodedX(x) {
    return this.dilatedX(-x);
  }

  /**
   * A bounding box that is contracted vertically (on the top and bottom) by the specified amount.
   * @public
   *
   * This is the immutable form of the function erodeY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} y
   * @returns {Bounds3}
   */
  erodedY(y) {
    return this.dilatedY(-y);
  }

  /**
   * A bounding box that is contracted depth-wise (on the front and back) by the specified amount.
   * @public
   *
   * This is the immutable form of the function erodeZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} z
   * @returns {Bounds3}
   */
  erodedZ(z) {
    return this.dilatedZ(-z);
  }

  /**
   * A bounding box that is contracted on all sides, with different amounts of contraction along each axis.
   * @public
   *
   * This is the immutable form of the function erodeXYZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x - Amount to erode horizontally (for each side)
   * @param {number} y - Amount to erode vertically (for each side)
   * @param {number} z - Amount to erode depth-wise (for each side)
   * @returns {Bounds3}
   */
  erodedXYZ(x, y, z) {
    return this.dilatedXYZ(-x, -y, -z);
  }

  /**
   * Our bounds, translated horizontally by x, returned as a copy.
   * @public
   *
   * This is the immutable form of the function shiftX(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x
   * @returns {Bounds3}
   */
  shiftedX(x) {
    return new Bounds3(this.minX + x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
  }

  /**
   * Our bounds, translated vertically by y, returned as a copy.
   * @public
   *
   * This is the immutable form of the function shiftY(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} y
   * @returns {Bounds3}
   */
  shiftedY(y) {
    return new Bounds3(this.minX, this.minY + y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
  }

  /**
   * Our bounds, translated depth-wise by z, returned as a copy.
   * @public
   *
   * This is the immutable form of the function shiftZ(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} z
   * @returns {Bounds3}
   */
  shiftedZ(z) {
    return new Bounds3(this.minX, this.minY, this.minZ + z, this.maxX, this.maxY, this.maxZ + z);
  }

  /**
   * Our bounds, translated by (x,y,z), returned as a copy.
   * @public
   *
   * This is the immutable form of the function shift(). This will return a new bounds, and will not modify
   * this bounds.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  shiftedXYZ(x, y, z) {
    return new Bounds3(this.minX + x, this.minY + y, this.minZ + z, this.maxX + x, this.maxY + y, this.maxZ + z);
  }

  /**
   * Returns our bounds, translated by a vector, returned as a copy.
   * @public
   *
   * @param {Vector3} v
   * @returns {Bounds3}
   */
  shifted(v) {
    return this.shiftedXYZ(v.x, v.y, v.z);
  }

  /*---------------------------------------------------------------------------*
   * Mutable operations
   *
   * All mutable operations should call one of the following:
   *   setMinMax, setMinX, setMinY, setMinZ, setMaxX, setMaxY, setMaxZ
   *---------------------------------------------------------------------------*/

  /**
   * Sets each value for this bounds, and returns itself.
   * @public
   *
   * @param {number} minX
   * @param {number} minY
   * @param {number} minZ
   * @param {number} maxX
   * @param {number} maxY
   * @param {number} maxZ
   * @returns {Bounds3}
   */
  setMinMax(minX, minY, minZ, maxX, maxY, maxZ) {
    this.minX = minX;
    this.minY = minY;
    this.minZ = minZ;
    this.maxX = maxX;
    this.maxY = maxY;
    this.maxZ = maxZ;
    return this;
  }

  /**
   * Sets the value of minX.
   * @public
   *
   * This is the mutable form of the function withMinX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} minX
   * @returns {Bounds3}
   */
  setMinX(minX) {
    this.minX = minX;
    return this;
  }

  /**
   * Sets the value of minY.
   * @public
   *
   * This is the mutable form of the function withMinY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} minY
   * @returns {Bounds3}
   */
  setMinY(minY) {
    this.minY = minY;
    return this;
  }

  /**
   * Sets the value of minZ.
   * @public
   *
   * This is the mutable form of the function withMinZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} minZ
   * @returns {Bounds3}
   */
  setMinZ(minZ) {
    this.minZ = minZ;
    return this;
  }

  /**
   * Sets the value of maxX.
   * @public
   *
   * This is the mutable form of the function withMaxX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} maxX
   * @returns {Bounds3}
   */
  setMaxX(maxX) {
    this.maxX = maxX;
    return this;
  }

  /**
   * Sets the value of maxY.
   * @public
   *
   * This is the mutable form of the function withMaxY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} maxY
   * @returns {Bounds3}
   */
  setMaxY(maxY) {
    this.maxY = maxY;
    return this;
  }

  /**
   * Sets the value of maxZ.
   * @public
   *
   * This is the mutable form of the function withMaxZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} maxZ
   * @returns {Bounds3}
   */
  setMaxZ(maxZ) {
    this.maxZ = maxZ;
    return this;
  }

  /**
   * Sets the values of this bounds to be equal to the input bounds.
   * @public
   *
   * This is the mutable form of the function copy(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {Bounds3} bounds
   * @returns {Bounds3}
   */
  set(bounds) {
    return this.setMinMax(bounds.minX, bounds.minY, bounds.minZ, bounds.maxX, bounds.maxY, bounds.maxZ);
  }

  /**
   * Modifies this bounds so that it contains both its original bounds and the input bounds.
   * @public
   *
   * This is the mutable form of the function union(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {Bounds3} bounds
   * @returns {Bounds3}
   */
  includeBounds(bounds) {
    return this.setMinMax(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.min(this.minZ, bounds.minZ), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY), Math.max(this.maxZ, bounds.maxZ));
  }

  /**
   * Modifies this bounds so that it is the largest bounds contained both in its original bounds and in the input bounds.
   * @public
   *
   * This is the mutable form of the function intersection(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {Bounds3} bounds
   * @returns {Bounds3}
   */
  constrainBounds(bounds) {
    return this.setMinMax(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.max(this.minZ, bounds.minZ), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY), Math.min(this.maxZ, bounds.maxZ));
  }

  /**
   * Modifies this bounds so that it contains both its original bounds and the input point (x,y,z).
   * @public
   *
   * This is the mutable form of the function withCoordinates(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  addCoordinates(x, y, z) {
    return this.setMinMax(Math.min(this.minX, x), Math.min(this.minY, y), Math.min(this.minZ, z), Math.max(this.maxX, x), Math.max(this.maxY, y), Math.max(this.maxZ, z));
  }

  /**
   * Modifies this bounds so that it contains both its original bounds and the input point.
   * @public
   *
   * This is the mutable form of the function withPoint(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {Vector3} point
   * @returns {Bounds3}
   */
  addPoint(point) {
    return this.addCoordinates(point.x, point.y, point.z);
  }

  /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries down and the
   * maximum boundaries up (expanding as necessary).
   * @public
   *
   * This is the mutable form of the function roundedOut(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @returns {Bounds3}
   */
  roundOut() {
    return this.setMinMax(Math.floor(this.minX), Math.floor(this.minY), Math.floor(this.minZ), Math.ceil(this.maxX), Math.ceil(this.maxY), Math.ceil(this.maxZ));
  }

  /**
   * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries up and the
   * maximum boundaries down (contracting as necessary).
   * @public
   *
   * This is the mutable form of the function roundedIn(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @returns {Bounds3}
   */
  roundIn() {
    return this.setMinMax(Math.ceil(this.minX), Math.ceil(this.minY), Math.ceil(this.minZ), Math.floor(this.maxX), Math.floor(this.maxY), Math.floor(this.maxZ));
  }

  /**
   * Modifies this bounds so that it would fully contain a transformed version if its previous value, applying the
   * matrix as an affine transformation.
   * @public
   *
   * NOTE: bounds.transform( matrix ).transform( inverse ) may be larger than the original box, if it includes
   * a rotation that isn't a multiple of $\pi/2$. This is because the bounds may expand in area to cover
   * ALL of the corners of the transformed bounding box.
   *
   * This is the mutable form of the function transformed(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {Matrix4} matrix
   * @returns {Bounds3}
   */
  transform(matrix) {
    // do nothing
    if (this.isEmpty()) {
      return this;
    }

    // optimization to bail for identity matrices
    if (matrix.isIdentity()) {
      return this;
    }
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    // using mutable vector so we don't create excessive instances of Vector2 during this
    // make sure all 4 corners are inside this transformed bounding box
    const vector = new Vector3(0, 0, 0);
    function withIt(vector) {
      minX = Math.min(minX, vector.x);
      minY = Math.min(minY, vector.y);
      minZ = Math.min(minZ, vector.z);
      maxX = Math.max(maxX, vector.x);
      maxY = Math.max(maxY, vector.y);
      maxZ = Math.max(maxZ, vector.z);
    }
    withIt(matrix.multiplyVector3(vector.setXYZ(this.minX, this.minY, this.minZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.minX, this.maxY, this.minZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.maxX, this.minY, this.minZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.maxX, this.maxY, this.minZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.minX, this.minY, this.maxZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.minX, this.maxY, this.maxZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.maxX, this.minY, this.maxZ)));
    withIt(matrix.multiplyVector3(vector.setXYZ(this.maxX, this.maxY, this.maxZ)));
    return this.setMinMax(minX, minY, minZ, maxX, maxY, maxZ);
  }

  /**
   * Expands this bounds on all sides by the specified amount.
   * @public
   *
   * This is the mutable form of the function dilated(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} d
   * @returns {Bounds3}
   */
  dilate(d) {
    return this.dilateXYZ(d, d, d);
  }

  /**
   * Expands this bounds horizontally (left and right) by the specified amount.
   * @public
   *
   * This is the mutable form of the function dilatedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @returns {Bounds3}
   */
  dilateX(x) {
    return this.setMinMax(this.minX - x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
  }

  /**
   * Expands this bounds vertically (top and bottom) by the specified amount.
   * @public
   *
   * This is the mutable form of the function dilatedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} y
   * @returns {Bounds3}
   */
  dilateY(y) {
    return this.setMinMax(this.minX, this.minY - y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
  }

  /**
   * Expands this bounds depth-wise (front and back) by the specified amount.
   * @public
   *
   * This is the mutable form of the function dilatedZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} z
   * @returns {Bounds3}
   */
  dilateZ(z) {
    return this.setMinMax(this.minX, this.minY, this.minZ - z, this.maxX, this.maxY, this.maxZ + z);
  }

  /**
   * Expands this bounds independently along each axis. Will be equal to calling
   * bounds.dilateX( x ).dilateY( y ).dilateZ( z ).
   * @public
   *
   * This is the mutable form of the function dilatedXYZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  dilateXYZ(x, y, z) {
    return this.setMinMax(this.minX - x, this.minY - y, this.minZ - z, this.maxX + x, this.maxY + y, this.maxZ + z);
  }

  /**
   * Contracts this bounds on all sides by the specified amount.
   * @public
   *
   * This is the mutable form of the function eroded(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} d
   * @returns {Bounds3}
   */
  erode(d) {
    return this.dilate(-d);
  }

  /**
   * Contracts this bounds horizontally (left and right) by the specified amount.
   * @public
   *
   * This is the mutable form of the function erodedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @returns {Bounds3}
   */
  erodeX(x) {
    return this.dilateX(-x);
  }

  /**
   * Contracts this bounds vertically (top and bottom) by the specified amount.
   * @public
   *
   * This is the mutable form of the function erodedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} y
   * @returns {Bounds3}
   */
  erodeY(y) {
    return this.dilateY(-y);
  }

  /**
   * Contracts this bounds depth-wise (front and back) by the specified amount.
   * @public
   *
   * This is the mutable form of the function erodedZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} z
   * @returns {Bounds3}
   */
  erodeZ(z) {
    return this.dilateZ(-z);
  }

  /**
   * Contracts this bounds independently along each axis. Will be equal to calling
   * bounds.erodeX( x ).erodeY( y ).erodeZ( z ).
   * @public
   *
   * This is the mutable form of the function erodedXYZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  erodeXYZ(x, y, z) {
    return this.dilateXYZ(-x, -y, -z);
  }

  /**
   * Translates our bounds horizontally by x.
   * @public
   *
   * This is the mutable form of the function shiftedX(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @returns {Bounds3}
   */
  shiftX(x) {
    return this.setMinMax(this.minX + x, this.minY, this.minZ, this.maxX + x, this.maxY, this.maxZ);
  }

  /**
   * Translates our bounds vertically by y.
   * @public
   *
   * This is the mutable form of the function shiftedY(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} y
   * @returns {Bounds3}
   */
  shiftY(y) {
    return this.setMinMax(this.minX, this.minY + y, this.minZ, this.maxX, this.maxY + y, this.maxZ);
  }

  /**
   * Translates our bounds depth-wise by z.
   * @public
   *
   * This is the mutable form of the function shiftedZ(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} z
   * @returns {Bounds3}
   */
  shiftZ(z) {
    return this.setMinMax(this.minX, this.minY, this.minZ + z, this.maxX, this.maxY, this.maxZ + z);
  }

  /**
   * Translates our bounds by (x,y,z).
   * @public
   *
   * This is the mutable form of the function shifted(). This will mutate (change) this bounds, in addition to returning
   * this bounds itself.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  shiftXYZ(x, y, z) {
    return this.setMinMax(this.minX + x, this.minY + y, this.minZ + z, this.maxX + x, this.maxY + y, this.maxZ + z);
  }

  /**
   * Translates our bounds by the given vector.
   * @public
   *
   * @param {Vector3} v
   * @returns {Bounds3}
   */
  shift(v) {
    return this.shiftXYZ(v.x, v.y, v.z);
  }

  /**
   * Returns a new Bounds3 object, with the cuboid (3d rectangle) construction with x, y, z, width, height and depth.
   * @public
   *
   * @param {number} x - The minimum value of X for the bounds.
   * @param {number} y - The minimum value of Y for the bounds.
   * @param {number} z - The minimum value of Z for the bounds.
   * @param {number} width - The width (maxX - minX) of the bounds.
   * @param {number} height - The height (maxY - minY) of the bounds.
   * @param {number} depth - The depth (maxZ - minZ) of the bounds.
   * @returns {Bounds3}
   */
  static cuboid(x, y, z, width, height, depth) {
    return new Bounds3(x, y, z, x + width, y + height, z + depth);
  }

  /**
   * Returns a new Bounds3 object that only contains the specified point (x,y,z). Useful for being dilated to form a
   * bounding box around a point. Note that the bounds will not be "empty" as it contains (x,y,z), but it will have
   * zero area.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Bounds3}
   */
  static point(x, y, z) {
    return new Bounds3(x, y, z, x, y, z);
  }
}

// @public (read-only) - Helps to identify the dimension of the bounds
Bounds3.prototype.isBounds = true;
Bounds3.prototype.dimension = 3;
dot.register('Bounds3', Bounds3);
Poolable.mixInto(Bounds3, {
  initialize: Bounds3.prototype.setMinMax
});

/**
 * A constant Bounds3 with minimums = $\infty$, maximums = $-\infty$, so that it represents "no bounds whatsoever".
 * @public
 *
 * This allows us to take the union (union/includeBounds) of this and any other Bounds3 to get the other bounds back,
 * e.g. Bounds3.NOTHING.union( bounds ).equals( bounds ). This object naturally serves as the base case as a union of
 * zero bounds objects.
 *
 * Additionally, intersections with NOTHING will always return a Bounds3 equivalent to NOTHING.
 *
 * @constant {Bounds3} NOTHING
 */
Bounds3.NOTHING = new Bounds3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

/**
 * A constant Bounds3 with minimums = $-\infty$, maximums = $\infty$, so that it represents "all bounds".
 * @public
 *
 * This allows us to take the intersection (intersection/constrainBounds) of this and any other Bounds3 to get the
 * other bounds back, e.g. Bounds3.EVERYTHING.intersection( bounds ).equals( bounds ). This object naturally serves as
 * the base case as an intersection of zero bounds objects.
 *
 * Additionally, unions with EVERYTHING will always return a Bounds3 equivalent to EVERYTHING.
 *
 * @constant {Bounds3} EVERYTHING
 */
Bounds3.EVERYTHING = new Bounds3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
Bounds3.Bounds3IO = new IOType('Bounds3IO', {
  valueType: Bounds3,
  documentation: 'a 3-dimensional bounds (bounding box)',
  stateSchema: {
    minX: NumberIO,
    minY: NumberIO,
    minZ: NumberIO,
    maxX: NumberIO,
    maxY: NumberIO,
    maxZ: NumberIO
  },
  toStateObject: bounds3 => ({
    minX: bounds3.minX,
    minY: bounds3.minY,
    minZ: bounds3.minZ,
    maxX: bounds3.maxX,
    maxY: bounds3.maxY,
    maxZ: bounds3.maxZ
  }),
  fromStateObject: stateObject => new Bounds3(stateObject.minX, stateObject.minY, stateObject.minZ, stateObject.maxX, stateObject.maxY, stateObject.maxZ)
});
export default Bounds3;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsIklPVHlwZSIsIk51bWJlcklPIiwiZG90IiwiVmVjdG9yMyIsIkJvdW5kczMiLCJjb25zdHJ1Y3RvciIsIm1pblgiLCJtaW5ZIiwibWluWiIsIm1heFgiLCJtYXhZIiwibWF4WiIsImFzc2VydCIsInVuZGVmaW5lZCIsImdldFdpZHRoIiwid2lkdGgiLCJnZXRIZWlnaHQiLCJoZWlnaHQiLCJnZXREZXB0aCIsImRlcHRoIiwiZ2V0WCIsIngiLCJnZXRZIiwieSIsImdldFoiLCJ6IiwiZ2V0TWluWCIsImdldE1pblkiLCJnZXRNaW5aIiwiZ2V0TWF4WCIsImdldE1heFkiLCJnZXRNYXhaIiwiZ2V0TGVmdCIsImxlZnQiLCJnZXRUb3AiLCJ0b3AiLCJnZXRCYWNrIiwiYmFjayIsImdldFJpZ2h0IiwicmlnaHQiLCJnZXRCb3R0b20iLCJib3R0b20iLCJnZXRGcm9udCIsImZyb250IiwiZ2V0Q2VudGVyWCIsImNlbnRlclgiLCJnZXRDZW50ZXJZIiwiY2VudGVyWSIsImdldENlbnRlcloiLCJjZW50ZXJaIiwiZ2V0Q2VudGVyIiwiY2VudGVyIiwiaXNFbXB0eSIsImlzRmluaXRlIiwiaGFzTm9uemVyb0FyZWEiLCJpc1ZhbGlkIiwiY29udGFpbnNDb29yZGluYXRlcyIsImNvbnRhaW5zUG9pbnQiLCJwb2ludCIsImNvbnRhaW5zQm91bmRzIiwiYm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsImludGVyc2VjdGlvbiIsInRvU3RyaW5nIiwiZXF1YWxzIiwib3RoZXIiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsInRoaXNGaW5pdGUiLCJvdGhlckZpbml0ZSIsIk1hdGgiLCJhYnMiLCJjb3B5Iiwic2V0IiwidW5pb24iLCJtaW4iLCJtYXgiLCJ3aXRoQ29vcmRpbmF0ZXMiLCJ3aXRoUG9pbnQiLCJ3aXRoTWluWCIsIndpdGhNaW5ZIiwid2l0aE1pbloiLCJ3aXRoTWF4WCIsIndpdGhNYXhZIiwid2l0aE1heFoiLCJyb3VuZGVkT3V0IiwiZmxvb3IiLCJjZWlsIiwicm91bmRlZEluIiwidHJhbnNmb3JtZWQiLCJtYXRyaXgiLCJ0cmFuc2Zvcm0iLCJkaWxhdGVkIiwiZCIsImRpbGF0ZWRYWVoiLCJkaWxhdGVkWCIsImRpbGF0ZWRZIiwiZGlsYXRlZFoiLCJlcm9kZWQiLCJhbW91bnQiLCJlcm9kZWRYIiwiZXJvZGVkWSIsImVyb2RlZFoiLCJlcm9kZWRYWVoiLCJzaGlmdGVkWCIsInNoaWZ0ZWRZIiwic2hpZnRlZFoiLCJzaGlmdGVkWFlaIiwic2hpZnRlZCIsInYiLCJzZXRNaW5NYXgiLCJzZXRNaW5YIiwic2V0TWluWSIsInNldE1pbloiLCJzZXRNYXhYIiwic2V0TWF4WSIsInNldE1heFoiLCJpbmNsdWRlQm91bmRzIiwiY29uc3RyYWluQm91bmRzIiwiYWRkQ29vcmRpbmF0ZXMiLCJhZGRQb2ludCIsInJvdW5kT3V0Iiwicm91bmRJbiIsImlzSWRlbnRpdHkiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwidmVjdG9yIiwid2l0aEl0IiwibXVsdGlwbHlWZWN0b3IzIiwic2V0WFlaIiwiZGlsYXRlIiwiZGlsYXRlWFlaIiwiZGlsYXRlWCIsImRpbGF0ZVkiLCJkaWxhdGVaIiwiZXJvZGUiLCJlcm9kZVgiLCJlcm9kZVkiLCJlcm9kZVoiLCJlcm9kZVhZWiIsInNoaWZ0WCIsInNoaWZ0WSIsInNoaWZ0WiIsInNoaWZ0WFlaIiwic2hpZnQiLCJjdWJvaWQiLCJwcm90b3R5cGUiLCJpc0JvdW5kcyIsImRpbWVuc2lvbiIsInJlZ2lzdGVyIiwibWl4SW50byIsImluaXRpYWxpemUiLCJOT1RISU5HIiwiRVZFUllUSElORyIsIkJvdW5kczNJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSIsInRvU3RhdGVPYmplY3QiLCJib3VuZHMzIiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiXSwic291cmNlcyI6WyJCb3VuZHMzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgM0QgY3Vib2lkLXNoYXBlZCBib3VuZGVkIGFyZWEgKGJvdW5kaW5nIGJveCkuXHJcbiAqXHJcbiAqIFRoZXJlIGFyZSBhIG51bWJlciBvZiBjb252ZW5pZW5jZSBmdW5jdGlvbnMgdG8gZ2V0IGxvY2F0aW9ucyBhbmQgcG9pbnRzIG9uIHRoZSBCb3VuZHMuIEN1cnJlbnRseSB3ZSBkbyBub3RcclxuICogc3RvcmUgdGhlc2Ugd2l0aCB0aGUgQm91bmRzMyBpbnN0YW5jZSwgc2luY2Ugd2Ugd2FudCB0byBsb3dlciB0aGUgbWVtb3J5IGZvb3RwcmludC5cclxuICpcclxuICogbWluWCwgbWluWSwgbWluWiwgbWF4WCwgbWF4WSwgYW5kIG1heFogYXJlIGFjdHVhbGx5IHN0b3JlZC4gV2UgZG9uJ3QgZG8geCx5LHosd2lkdGgsaGVpZ2h0LGRlcHRoIGJlY2F1c2UgdGhpcyBjYW4ndCBwcm9wZXJseSBleHByZXNzXHJcbiAqIHNlbWktaW5maW5pdGUgYm91bmRzIChsaWtlIGEgaGFsZi1wbGFuZSksIG9yIGVhc2lseSBoYW5kbGUgd2hhdCBCb3VuZHMzLk5PVEhJTkcgYW5kIEJvdW5kczMuRVZFUllUSElORyBkbyB3aXRoXHJcbiAqIHRoZSBjb25zdHJ1Y3RpdmUgc29saWQgYXJlYXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL1ZlY3RvcjMuanMnO1xyXG5cclxuY2xhc3MgQm91bmRzMyB7XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIDMtZGltZW5zaW9uYWwgYm91bmRzIChib3VuZGluZyBib3gpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5YIC0gVGhlIGluaXRpYWwgbWluaW11bSBYIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluWSAtIFRoZSBpbml0aWFsIG1pbmltdW0gWSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblogLSBUaGUgaW5pdGlhbCBtaW5pbXVtIFogY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhYIC0gVGhlIGluaXRpYWwgbWF4aW11bSBYIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4WSAtIFRoZSBpbml0aWFsIG1heGltdW0gWSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFogLSBUaGUgaW5pdGlhbCBtYXhpbXVtIFogY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBtYXhaICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4WSAhPT0gdW5kZWZpbmVkLCAnQm91bmRzMyByZXF1aXJlcyA0IHBhcmFtZXRlcnMnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFRoZSBtaW5pbXVtIFggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxyXG4gICAgdGhpcy5taW5YID0gbWluWDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gVGhlIG1pbmltdW0gWSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgICB0aGlzLm1pblkgPSBtaW5ZO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBUaGUgbWluaW11bSBaIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cclxuICAgIHRoaXMubWluWiA9IG1pblo7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFRoZSBtYXhpbXVtIFggY29vcmRpbmF0ZSBvZiB0aGUgYm91bmRzLlxyXG4gICAgdGhpcy5tYXhYID0gbWF4WDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gVGhlIG1heGltdW0gWSBjb29yZGluYXRlIG9mIHRoZSBib3VuZHMuXHJcbiAgICB0aGlzLm1heFkgPSBtYXhZO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBUaGUgbWF4aW11bSBaIGNvb3JkaW5hdGUgb2YgdGhlIGJvdW5kcy5cclxuICAgIHRoaXMubWF4WiA9IG1heFo7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogUHJvcGVydGllc1xyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHdpZHRoIG9mIHRoZSBib3VuZHMsIGRlZmluZWQgYXMgbWF4WCAtIG1pblguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMubWF4WCAtIHRoaXMubWluWDsgfVxyXG5cclxuICBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLmdldFdpZHRoKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGhlaWdodCBvZiB0aGUgYm91bmRzLCBkZWZpbmVkIGFzIG1heFkgLSBtaW5ZLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5tYXhZIC0gdGhpcy5taW5ZOyB9XHJcblxyXG4gIGdldCBoZWlnaHQoKSB7IHJldHVybiB0aGlzLmdldEhlaWdodCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZXB0aCBvZiB0aGUgYm91bmRzLCBkZWZpbmVkIGFzIG1heFogLSBtaW5aLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0RGVwdGgoKSB7IHJldHVybiB0aGlzLm1heFogLSB0aGlzLm1pblo7IH1cclxuXHJcbiAgZ2V0IGRlcHRoKCkgeyByZXR1cm4gdGhpcy5nZXREZXB0aCgpOyB9XHJcblxyXG4gIC8qXHJcbiAgICogQ29udmVuaWVuY2UgbG9jYXRpb25zXHJcbiAgICogdXBwZXIgaXMgaW4gdGVybXMgb2YgdGhlIHZpc3VhbCBsYXlvdXQgaW4gU2NlbmVyeSBhbmQgb3RoZXIgcHJvZ3JhbXMsIHNvIHRoZSBtaW5ZIGlzIHRoZSBcInVwcGVyXCIsIGFuZCBtaW5ZIGlzIHRoZSBcImxvd2VyXCJcclxuICAgKlxyXG4gICAqICAgICAgICAgICAgIG1pblggKHgpICAgICBjZW50ZXJYICAgICAgICBtYXhYXHJcbiAgICogICAgICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICogbWluWSAoeSkgfCB1cHBlckxlZnQgICB1cHBlckNlbnRlciAgIHVwcGVyUmlnaHRcclxuICAgKiBjZW50ZXJZICB8IGNlbnRlckxlZnQgICAgY2VudGVyICAgICAgY2VudGVyUmlnaHRcclxuICAgKiBtYXhZICAgICB8IGxvd2VyTGVmdCAgIGxvd2VyQ2VudGVyICAgbG93ZXJSaWdodFxyXG4gICAqL1xyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWCwgd2hlbiB0aGlua2luZyBvZiB0aGUgYm91bmRzIGFzIGFuICh4LHkseix3aWR0aCxoZWlnaHQsZGVwdGgpIGN1Ym9pZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLm1pblg7IH1cclxuXHJcbiAgZ2V0IHgoKSB7IHJldHVybiB0aGlzLmdldFgoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWSwgd2hlbiB0aGlua2luZyBvZiB0aGUgYm91bmRzIGFzIGFuICh4LHkseix3aWR0aCxoZWlnaHQsZGVwdGgpIGN1Ym9pZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLm1pblk7IH1cclxuXHJcbiAgZ2V0IHkoKSB7IHJldHVybiB0aGlzLmdldFkoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWiwgd2hlbiB0aGlua2luZyBvZiB0aGUgYm91bmRzIGFzIGFuICh4LHkseix3aWR0aCxoZWlnaHQsZGVwdGgpIGN1Ym9pZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFooKSB7IHJldHVybiB0aGlzLm1pblo7IH1cclxuXHJcbiAgZ2V0IHooKSB7IHJldHVybiB0aGlzLmdldFooKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWCwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWluWCgpIHsgcmV0dXJuIHRoaXMubWluWDsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWSwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWluWSgpIHsgcmV0dXJuIHRoaXMubWluWTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWiwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWluWigpIHsgcmV0dXJuIHRoaXMubWluWjsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWF4WCwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWF4WCgpIHsgcmV0dXJuIHRoaXMubWF4WDsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWF4WSwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWF4WSgpIHsgcmV0dXJuIHRoaXMubWF4WTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWF4Wiwgc3VwcG9ydGluZyB0aGUgZXhwbGljaXQgZ2V0dGVyIGZ1bmN0aW9uIHN0eWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TWF4WigpIHsgcmV0dXJuIHRoaXMubWF4WjsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWCwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldExlZnQoKSB7IHJldHVybiB0aGlzLm1pblg7IH1cclxuXHJcbiAgZ2V0IGxlZnQoKSB7IHJldHVybiB0aGlzLm1pblg7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1pblksIHdoZW4gdGhpbmtpbmcgaW4gdGhlIFVJLWxheW91dCBtYW5uZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRUb3AoKSB7IHJldHVybiB0aGlzLm1pblk7IH1cclxuXHJcbiAgZ2V0IHRvcCgpIHsgcmV0dXJuIHRoaXMubWluWTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWluWiwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEJhY2soKSB7IHJldHVybiB0aGlzLm1pblo7IH1cclxuXHJcbiAgZ2V0IGJhY2soKSB7IHJldHVybiB0aGlzLm1pblo7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1heFgsIHdoZW4gdGhpbmtpbmcgaW4gdGhlIFVJLWxheW91dCBtYW5uZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRSaWdodCgpIHsgcmV0dXJuIHRoaXMubWF4WDsgfVxyXG5cclxuICBnZXQgcmlnaHQoKSB7IHJldHVybiB0aGlzLm1heFg7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxpYXMgZm9yIG1heFksIHdoZW4gdGhpbmtpbmcgaW4gdGhlIFVJLWxheW91dCBtYW5uZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRCb3R0b20oKSB7IHJldHVybiB0aGlzLm1heFk7IH1cclxuXHJcbiAgZ2V0IGJvdHRvbSgpIHsgcmV0dXJuIHRoaXMubWF4WTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3IgbWF4Wiwgd2hlbiB0aGlua2luZyBpbiB0aGUgVUktbGF5b3V0IG1hbm5lci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEZyb250KCkgeyByZXR1cm4gdGhpcy5tYXhaOyB9XHJcblxyXG4gIGdldCBmcm9udCgpIHsgcmV0dXJuIHRoaXMubWF4WjsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgaG9yaXpvbnRhbCAoWC1jb29yZGluYXRlKSBjZW50ZXIgb2YgdGhlIGJvdW5kcywgYXZlcmFnaW5nIHRoZSBtaW5YIGFuZCBtYXhYLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0Q2VudGVyWCgpIHsgcmV0dXJuICggdGhpcy5tYXhYICsgdGhpcy5taW5YICkgLyAyOyB9XHJcblxyXG4gIGdldCBjZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDZW50ZXJYKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHZlcnRpY2FsIChZLWNvb3JkaW5hdGUpIGNlbnRlciBvZiB0aGUgYm91bmRzLCBhdmVyYWdpbmcgdGhlIG1pblkgYW5kIG1heFkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gKCB0aGlzLm1heFkgKyB0aGlzLm1pblkgKSAvIDI7IH1cclxuXHJcbiAgZ2V0IGNlbnRlclkoKSB7IHJldHVybiB0aGlzLmdldENlbnRlclkoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgZGVwdGh3aXNlIChaLWNvb3JkaW5hdGUpIGNlbnRlciBvZiB0aGUgYm91bmRzLCBhdmVyYWdpbmcgdGhlIG1pblogYW5kIG1heFouXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRDZW50ZXJaKCkgeyByZXR1cm4gKCB0aGlzLm1heFogKyB0aGlzLm1pblogKSAvIDI7IH1cclxuXHJcbiAgZ2V0IGNlbnRlclooKSB7IHJldHVybiB0aGlzLmdldENlbnRlclooKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgcG9pbnQgKGNlbnRlclgsIGNlbnRlclksIGNlbnRlclopLCBpbiB0aGUgY2VudGVyIG9mIHRoZSBib3VuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgZ2V0Q2VudGVyKCkgeyByZXR1cm4gbmV3IFZlY3RvcjMoIHRoaXMuZ2V0Q2VudGVyWCgpLCB0aGlzLmdldENlbnRlclkoKSwgdGhpcy5nZXRDZW50ZXJaKCkgKTsgfVxyXG5cclxuICBnZXQgY2VudGVyKCkgeyByZXR1cm4gdGhpcy5nZXRDZW50ZXIoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHdlIGhhdmUgbmVnYXRpdmUgd2lkdGgsIGhlaWdodCBvciBkZXB0aC4gQm91bmRzMy5OT1RISU5HIGlzIGEgcHJpbWUgZXhhbXBsZSBvZiBhbiBlbXB0eSBCb3VuZHMzLlxyXG4gICAqIEJvdW5kcyB3aXRoIHdpZHRoID0gaGVpZ2h0ID0gZGVwdGggPSAwIGFyZSBjb25zaWRlcmVkIG5vdCBlbXB0eSwgc2luY2UgdGhleSBpbmNsdWRlIHRoZSBzaW5nbGUgKDAsMCwwKSBwb2ludC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0VtcHR5KCkgeyByZXR1cm4gdGhpcy5nZXRXaWR0aCgpIDwgMCB8fCB0aGlzLmdldEhlaWdodCgpIDwgMCB8fCB0aGlzLmdldERlcHRoKCkgPCAwOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgb3VyIG1pbmltdW1zIGFuZCBtYXhpbXVtcyBhcmUgYWxsIGZpbml0ZSBudW1iZXJzLiBUaGlzIHdpbGwgZXhjbHVkZSBCb3VuZHMzLk5PVEhJTkcgYW5kIEJvdW5kczMuRVZFUllUSElORy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0Zpbml0ZSgpIHtcclxuICAgIHJldHVybiBpc0Zpbml0ZSggdGhpcy5taW5YICkgJiYgaXNGaW5pdGUoIHRoaXMubWluWSApICYmIGlzRmluaXRlKCB0aGlzLm1pblogKSAmJiBpc0Zpbml0ZSggdGhpcy5tYXhYICkgJiYgaXNGaW5pdGUoIHRoaXMubWF4WSApICYmIGlzRmluaXRlKCB0aGlzLm1heFogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBib3VuZHMgaGFzIGEgbm9uLXplcm8gYXJlYSAobm9uLXplcm8gcG9zaXRpdmUgd2lkdGgsIGhlaWdodCBhbmQgZGVwdGgpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGhhc05vbnplcm9BcmVhKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKSA+IDAgJiYgdGhpcy5nZXRIZWlnaHQoKSA+IDAgJiYgdGhpcy5nZXREZXB0aCgpID4gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBib3VuZHMgaGFzIGEgZmluaXRlIGFuZCBub24tbmVnYXRpdmUgd2lkdGgsIGhlaWdodCBhbmQgZGVwdGguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNWYWxpZCgpIHtcclxuICAgIHJldHVybiAhdGhpcy5pc0VtcHR5KCkgJiYgdGhpcy5pc0Zpbml0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgY29vcmRpbmF0ZXMgYXJlIGNvbnRhaW5lZCBpbnNpZGUgdGhlIGJvdW5kaW5nIGJveCwgb3IgYXJlIG9uIHRoZSBib3VuZGFyeS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gY2hlY2tcclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gY2hlY2tcclxuICAgKiBAcGFyYW0ge251bWJlcn0geiAtIFogY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gY2hlY2tcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb250YWluc0Nvb3JkaW5hdGVzKCB4LCB5LCB6ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubWluWCA8PSB4ICYmIHggPD0gdGhpcy5tYXhYICYmIHRoaXMubWluWSA8PSB5ICYmIHkgPD0gdGhpcy5tYXhZICYmIHRoaXMubWluWiA8PSB6ICYmIHogPD0gdGhpcy5tYXhaO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgcG9pbnQgaXMgY29udGFpbmVkIGluc2lkZSB0aGUgYm91bmRpbmcgYm94LCBvciBpcyBvbiB0aGUgYm91bmRhcnkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNvbnRhaW5zUG9pbnQoIHBvaW50ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29udGFpbnNDb29yZGluYXRlcyggcG9pbnQueCwgcG9pbnQueSwgcG9pbnQueiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIGJvdW5kaW5nIGJveCBjb21wbGV0ZWx5IGNvbnRhaW5zIHRoZSBib3VuZGluZyBib3ggcGFzc2VkIGFzIGEgcGFyYW1ldGVyLiBUaGUgYm91bmRhcnkgb2YgYSBib3ggaXNcclxuICAgKiBjb25zaWRlcmVkIHRvIGJlIFwiY29udGFpbmVkXCIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb250YWluc0JvdW5kcyggYm91bmRzICkge1xyXG4gICAgcmV0dXJuIHRoaXMubWluWCA8PSBib3VuZHMubWluWCAmJiB0aGlzLm1heFggPj0gYm91bmRzLm1heFggJiYgdGhpcy5taW5ZIDw9IGJvdW5kcy5taW5ZICYmIHRoaXMubWF4WSA+PSBib3VuZHMubWF4WSAmJiB0aGlzLm1pblogPD0gYm91bmRzLm1pblogJiYgdGhpcy5tYXhaID49IGJvdW5kcy5tYXhaO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGlzIGFuZCBhbm90aGVyIGJvdW5kaW5nIGJveCBoYXZlIGFueSBwb2ludHMgb2YgaW50ZXJzZWN0aW9uIChpbmNsdWRpbmcgdG91Y2hpbmcgYm91bmRhcmllcykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpbnRlcnNlY3RzQm91bmRzKCBib3VuZHMgKSB7XHJcbiAgICAvLyBUT0RPOiBtb3JlIGVmZmljaWVudCB3YXkgb2YgZG9pbmcgdGhpcz9cclxuICAgIHJldHVybiAhdGhpcy5pbnRlcnNlY3Rpb24oIGJvdW5kcyApLmlzRW1wdHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSBib3VuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgW3g6KCR7dGhpcy5taW5YfSwke3RoaXMubWF4WH0pLHk6KCR7dGhpcy5taW5ZfSwke3RoaXMubWF4WX0pLHo6KCR7dGhpcy5taW5afSwke3RoaXMubWF4Wn0pXWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeGFjdCBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyBib3VuZHMgYW5kIGFub3RoZXIgYm91bmRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Qm91bmRzM30gb3RoZXJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB0d28gYm91bmRzIGFyZSBlcXVhbFxyXG4gICAqL1xyXG4gIGVxdWFscyggb3RoZXIgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5taW5YID09PSBvdGhlci5taW5YICYmXHJcbiAgICAgICAgICAgdGhpcy5taW5ZID09PSBvdGhlci5taW5ZICYmXHJcbiAgICAgICAgICAgdGhpcy5taW5aID09PSBvdGhlci5taW5aICYmXHJcbiAgICAgICAgICAgdGhpcy5tYXhYID09PSBvdGhlci5tYXhYICYmXHJcbiAgICAgICAgICAgdGhpcy5tYXhZID09PSBvdGhlci5tYXhZICYmXHJcbiAgICAgICAgICAgdGhpcy5tYXhaID09PSBvdGhlci5tYXhaO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwcm94aW1hdGUgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgYm91bmRzIGFuZCBhbm90aGVyIGJvdW5kcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczN9IG90aGVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb25cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGJvdW5kcyBoYXMgbm8gbWluL21heCB3aXRoIGFuIGFic29sdXRlIHZhbHVlIGdyZWF0ZXJcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICB0aGFuIGVwc2lsb24uXHJcbiAgICovXHJcbiAgZXF1YWxzRXBzaWxvbiggb3RoZXIsIGVwc2lsb24gKSB7XHJcbiAgICBlcHNpbG9uID0gZXBzaWxvbiAhPT0gdW5kZWZpbmVkID8gZXBzaWxvbiA6IDA7XHJcbiAgICBjb25zdCB0aGlzRmluaXRlID0gdGhpcy5pc0Zpbml0ZSgpO1xyXG4gICAgY29uc3Qgb3RoZXJGaW5pdGUgPSBvdGhlci5pc0Zpbml0ZSgpO1xyXG4gICAgaWYgKCB0aGlzRmluaXRlICYmIG90aGVyRmluaXRlICkge1xyXG4gICAgICAvLyBib3RoIGFyZSBmaW5pdGUsIHNvIHdlIGNhbiB1c2UgTWF0aC5hYnMoKSAtIGl0IHdvdWxkIGZhaWwgd2l0aCBub24tZmluaXRlIHZhbHVlcyBsaWtlIEluZmluaXR5XHJcbiAgICAgIHJldHVybiBNYXRoLmFicyggdGhpcy5taW5YIC0gb3RoZXIubWluWCApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubWluWSAtIG90aGVyLm1pblkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm1pblogLSBvdGhlci5taW5aICkgPCBlcHNpbG9uICYmXHJcbiAgICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tYXhYIC0gb3RoZXIubWF4WCApIDwgZXBzaWxvbiAmJlxyXG4gICAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubWF4WSAtIG90aGVyLm1heFkgKSA8IGVwc2lsb24gJiZcclxuICAgICAgICAgICAgIE1hdGguYWJzKCB0aGlzLm1heFogLSBvdGhlci5tYXhaICkgPCBlcHNpbG9uO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXNGaW5pdGUgIT09IG90aGVyRmluaXRlICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG9uZSBpcyBmaW5pdGUsIHRoZSBvdGhlciBpcyBub3QuIGRlZmluaXRlbHkgbm90IGVxdWFsXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcyA9PT0gb3RoZXIgKSB7XHJcbiAgICAgIHJldHVybiB0cnVlOyAvLyBleGFjdCBzYW1lIGluc3RhbmNlLCBtdXN0IGJlIGVxdWFsXHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gZXBzaWxvbiBvbmx5IGFwcGxpZXMgb24gZmluaXRlIGRpbWVuc2lvbnMuIGR1ZSB0byBKUydzIGhhbmRsaW5nIG9mIGlzRmluaXRlKCksIGl0J3MgZmFzdGVyIHRvIGNoZWNrIHRoZSBzdW0gb2YgYm90aFxyXG4gICAgICByZXR1cm4gKCBpc0Zpbml0ZSggdGhpcy5taW5YICsgb3RoZXIubWluWCApID8gKCBNYXRoLmFicyggdGhpcy5taW5YIC0gb3RoZXIubWluWCApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1pblggPT09IG90aGVyLm1pblggKSApICYmXHJcbiAgICAgICAgICAgICAoIGlzRmluaXRlKCB0aGlzLm1pblkgKyBvdGhlci5taW5ZICkgPyAoIE1hdGguYWJzKCB0aGlzLm1pblkgLSBvdGhlci5taW5ZICkgPCBlcHNpbG9uICkgOiAoIHRoaXMubWluWSA9PT0gb3RoZXIubWluWSApICkgJiZcclxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWluWiArIG90aGVyLm1pblogKSA/ICggTWF0aC5hYnMoIHRoaXMubWluWiAtIG90aGVyLm1pblogKSA8IGVwc2lsb24gKSA6ICggdGhpcy5taW5aID09PSBvdGhlci5taW5aICkgKSAmJlxyXG4gICAgICAgICAgICAgKCBpc0Zpbml0ZSggdGhpcy5tYXhYICsgb3RoZXIubWF4WCApID8gKCBNYXRoLmFicyggdGhpcy5tYXhYIC0gb3RoZXIubWF4WCApIDwgZXBzaWxvbiApIDogKCB0aGlzLm1heFggPT09IG90aGVyLm1heFggKSApICYmXHJcbiAgICAgICAgICAgICAoIGlzRmluaXRlKCB0aGlzLm1heFkgKyBvdGhlci5tYXhZICkgPyAoIE1hdGguYWJzKCB0aGlzLm1heFkgLSBvdGhlci5tYXhZICkgPCBlcHNpbG9uICkgOiAoIHRoaXMubWF4WSA9PT0gb3RoZXIubWF4WSApICkgJiZcclxuICAgICAgICAgICAgICggaXNGaW5pdGUoIHRoaXMubWF4WiArIG90aGVyLm1heFogKSA/ICggTWF0aC5hYnMoIHRoaXMubWF4WiAtIG90aGVyLm1heFogKSA8IGVwc2lsb24gKSA6ICggdGhpcy5tYXhaID09PSBvdGhlci5tYXhaICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIEltbXV0YWJsZSBvcGVyYXRpb25zXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIGJvdW5kcywgb3IgaWYgYSBib3VuZHMgaXMgcGFzc2VkIGluLCBzZXQgdGhhdCBib3VuZHMncyB2YWx1ZXMgdG8gb3Vycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0KCksIGlmIGEgYm91bmRzIGlzIHByb3ZpZGVkLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kXHJcbiAgICogd2lsbCBub3QgbW9kaWZ5IHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBbYm91bmRzXSAtIElmIG5vdCBwcm92aWRlZCwgY3JlYXRlcyBhIG5ldyBCb3VuZHMzIHdpdGggZmlsbGVkIGluIHZhbHVlcy4gT3RoZXJ3aXNlLCBmaWxscyBpbiB0aGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBib3VuZHMgc28gdGhhdCBpdCBlcXVhbHMgdGhpcyBib3VuZHMuXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgY29weSggYm91bmRzICkge1xyXG4gICAgaWYgKCBib3VuZHMgKSB7XHJcbiAgICAgIHJldHVybiBib3VuZHMuc2V0KCB0aGlzICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5taW5aLCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgY29udGFpbnMgYm90aCB0aGlzIGJvdW5kcyBhbmQgdGhlIGlucHV0IGJvdW5kcywgcmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBpbmNsdWRlQm91bmRzKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczN9IGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHVuaW9uKCBib3VuZHMgKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblgsIGJvdW5kcy5taW5YICksXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblksIGJvdW5kcy5taW5ZICksXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblosIGJvdW5kcy5taW5aICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFgsIGJvdW5kcy5tYXhYICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFksIGJvdW5kcy5tYXhZICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFosIGJvdW5kcy5tYXhaIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgaXMgY29udGFpbmVkIGJ5IGJvdGggdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBib3VuZHMsIHJldHVybmVkIGFzIGEgY29weS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29uc3RyYWluQm91bmRzKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczN9IGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGludGVyc2VjdGlvbiggYm91bmRzICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5YLCBib3VuZHMubWluWCApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5ZLCBib3VuZHMubWluWSApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5taW5aLCBib3VuZHMubWluWiApLFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5tYXhYLCBib3VuZHMubWF4WCApLFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5tYXhZLCBib3VuZHMubWF4WSApLFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5tYXhaLCBib3VuZHMubWF4WiApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETzogZGlmZmVyZW5jZSBzaG91bGQgYmUgd2VsbC1kZWZpbmVkLCBidXQgbW9yZSBsb2dpYyBpcyBuZWVkZWQgdG8gY29tcHV0ZVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgY29udGFpbnMgdGhpcyBib3VuZHMgYW5kIHRoZSBwb2ludCAoeCx5LHopLCByZXR1cm5lZCBhcyBhIGNvcHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZENvb3JkaW5hdGVzKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICB3aXRoQ29vcmRpbmF0ZXMoIHgsIHksIHogKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblgsIHggKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgeSApLFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5aLCB6ICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFgsIHggKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgeSApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhaLCB6IClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc21hbGxlc3QgYm91bmRzIHRoYXQgY29udGFpbnMgdGhpcyBib3VuZHMgYW5kIHRoZSBpbnB1dCBwb2ludCwgcmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGRQb2ludCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHdpdGhQb2ludCggcG9pbnQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy53aXRoQ29vcmRpbmF0ZXMoIHBvaW50LngsIHBvaW50LnksIHBvaW50LnogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCBtaW5YIHJlcGxhY2VkIHdpdGggdGhlIGlucHV0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNaW5YKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluWFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHdpdGhNaW5YKCBtaW5YICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCBtaW5YLCB0aGlzLm1pblksIHRoaXMubWluWiwgdGhpcy5tYXhYLCB0aGlzLm1heFksIHRoaXMubWF4WiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1pblkgcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1pblkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5ZXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgd2l0aE1pblkoIG1pblkgKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgbWluWSwgdGhpcy5taW5aLCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggbWluWiByZXBsYWNlZCB3aXRoIHRoZSBpbnB1dC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWluWigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICB3aXRoTWluWiggbWluWiApIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMyggdGhpcy5taW5YLCB0aGlzLm1pblksIG1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCBtYXhYIHJlcGxhY2VkIHdpdGggdGhlIGlucHV0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNYXhYKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4WFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHdpdGhNYXhYKCBtYXhYICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5taW5aLCBtYXhYLCB0aGlzLm1heFksIHRoaXMubWF4WiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb3B5IG9mIHRoaXMgYm91bmRzLCB3aXRoIG1heFkgcmVwbGFjZWQgd2l0aCB0aGUgaW5wdXQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1heFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhZXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgd2l0aE1heFkoIG1heFkgKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCwgbWF4WSwgdGhpcy5tYXhaICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggbWF4WiByZXBsYWNlZCB3aXRoIHRoZSBpbnB1dC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWF4WigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICB3aXRoTWF4WiggbWF4WiApIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMyggdGhpcy5taW5YLCB0aGlzLm1pblksIHRoaXMubWluWiwgdGhpcy5tYXhYLCB0aGlzLm1heFksIG1heFogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgY29weSBvZiB0aGlzIGJvdW5kcywgd2l0aCB0aGUgbWluaW11bSB2YWx1ZXMgcm91bmRlZCBkb3duIHRvIHRoZSBuZWFyZXN0IGludGVnZXIsIGFuZCB0aGUgbWF4aW11bSB2YWx1ZXNcclxuICAgKiByb3VuZGVkIHVwIHRvIHRoZSBuZWFyZXN0IGludGVnZXIuIFRoaXMgY2F1c2VzIHRoZSBib3VuZHMgdG8gZXhwYW5kIGFzIG5lY2Vzc2FyeSBzbyB0aGF0IGl0cyBib3VuZGFyaWVzXHJcbiAgICogYXJlIGludGVnZXItYWxpZ25lZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRPdXQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHJvdW5kZWRPdXQoKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWCApLFxyXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1pblkgKSxcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5aICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhYICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhZICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhaIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGNvcHkgb2YgdGhpcyBib3VuZHMsIHdpdGggdGhlIG1pbmltdW0gdmFsdWVzIHJvdW5kZWQgdXAgdG8gdGhlIG5lYXJlc3QgaW50ZWdlciwgYW5kIHRoZSBtYXhpbXVtIHZhbHVlc1xyXG4gICAqIHJvdW5kZWQgZG93biB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLiBUaGlzIGNhdXNlcyB0aGUgYm91bmRzIHRvIGNvbnRyYWN0IGFzIG5lY2Vzc2FyeSBzbyB0aGF0IGl0cyBib3VuZGFyaWVzXHJcbiAgICogYXJlIGludGVnZXItYWxpZ25lZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRJbigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgcm91bmRlZEluKCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWCApLFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWSApLFxyXG4gICAgICBNYXRoLmNlaWwoIHRoaXMubWluWiApLFxyXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1heFggKSxcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhZICksXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WiApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggKHN0aWxsIGF4aXMtYWxpZ25lZCkgdGhhdCBjb250YWlucyB0aGUgdHJhbnNmb3JtZWQgc2hhcGUgb2YgdGhpcyBib3VuZHMsIGFwcGx5aW5nIHRoZSBtYXRyaXggYXNcclxuICAgKiBhbiBhZmZpbmUgdHJhbnNmb3JtYXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogTk9URTogYm91bmRzLnRyYW5zZm9ybWVkKCBtYXRyaXggKS50cmFuc2Zvcm1lZCggaW52ZXJzZSApIG1heSBiZSBsYXJnZXIgdGhhbiB0aGUgb3JpZ2luYWwgYm94LCBpZiBpdCBpbmNsdWRlc1xyXG4gICAqIGEgcm90YXRpb24gdGhhdCBpc24ndCBhIG11bHRpcGxlIG9mICRcXHBpLzIkLiBUaGlzIGlzIGJlY2F1c2UgdGhlIHJldHVybmVkIGJvdW5kcyBtYXkgZXhwYW5kIGluIGFyZWEgdG8gY292ZXJcclxuICAgKiBBTEwgb2YgdGhlIGNvcm5lcnMgb2YgdGhlIHRyYW5zZm9ybWVkIGJvdW5kaW5nIGJveC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0cmFuc2Zvcm0oKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtZWQoIG1hdHJpeCApIHtcclxuICAgIHJldHVybiB0aGlzLmNvcHkoKS50cmFuc2Zvcm0oIG1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBvbiBhbGwgc2lkZXMgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgZGlsYXRlZCggZCApIHtcclxuICAgIHJldHVybiB0aGlzLmRpbGF0ZWRYWVooIGQsIGQsIGQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgZXhwYW5kZWQgaG9yaXpvbnRhbGx5IChvbiB0aGUgbGVmdCBhbmQgcmlnaHQpIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVYKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGRpbGF0ZWRYKCB4ICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblggLSB4LCB0aGlzLm1pblksIHRoaXMubWluWiwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgZXhwYW5kZWQgdmVydGljYWxseSAob24gdGhlIHRvcCBhbmQgYm90dG9tKSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlWSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBkaWxhdGVkWSggeSApIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMyggdGhpcy5taW5YLCB0aGlzLm1pblkgLSB5LCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSwgdGhpcy5tYXhaICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGV4cGFuZGVkIGRlcHRoLXdpc2UgKG9uIHRoZSBmcm9udCBhbmQgYmFjaykgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZVooKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgZGlsYXRlZFooIHogKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogLSB6LCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICsgeiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBleHBhbmRlZCBvbiBhbGwgc2lkZXMsIHdpdGggZGlmZmVyZW50IGFtb3VudHMgb2YgZXhwYW5zaW9uIGFsb25nIGVhY2ggYXhpcy5cclxuICAgKiBXaWxsIGJlIGlkZW50aWNhbCB0byB0aGUgYm91bmRzIHJldHVybmVkIGJ5IGNhbGxpbmcgYm91bmRzLmRpbGF0ZWRYKCB4ICkuZGlsYXRlZFkoIHkgKS5kaWxhdGVkWiggeiApLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVYWVooKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gQW1vdW50IHRvIGRpbGF0ZSBob3Jpem9udGFsbHkgKGZvciBlYWNoIHNpZGUpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBBbW91bnQgdG8gZGlsYXRlIHZlcnRpY2FsbHkgKGZvciBlYWNoIHNpZGUpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHogLSBBbW91bnQgdG8gZGlsYXRlIGRlcHRoLXdpc2UgKGZvciBlYWNoIHNpZGUpXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgZGlsYXRlZFhZWiggeCwgeSwgeiApIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMyggdGhpcy5taW5YIC0geCwgdGhpcy5taW5ZIC0geSwgdGhpcy5taW5aIC0geiwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZICsgeSwgdGhpcy5tYXhaICsgeiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBjb250cmFjdGVkIG9uIGFsbCBzaWRlcyBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbW91bnRcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBlcm9kZWQoIGFtb3VudCApIHsgcmV0dXJuIHRoaXMuZGlsYXRlZCggLWFtb3VudCApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgY29udHJhY3RlZCBob3Jpem9udGFsbHkgKG9uIHRoZSBsZWZ0IGFuZCByaWdodCkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBlcm9kZWRYKCB4ICkgeyByZXR1cm4gdGhpcy5kaWxhdGVkWCggLXggKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGJvdW5kaW5nIGJveCB0aGF0IGlzIGNvbnRyYWN0ZWQgdmVydGljYWxseSAob24gdGhlIHRvcCBhbmQgYm90dG9tKSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZXJvZGVZKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGVyb2RlZFkoIHkgKSB7IHJldHVybiB0aGlzLmRpbGF0ZWRZKCAteSApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgYm91bmRpbmcgYm94IHRoYXQgaXMgY29udHJhY3RlZCBkZXB0aC13aXNlIChvbiB0aGUgZnJvbnQgYW5kIGJhY2spIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZVooKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgZXJvZGVkWiggeiApIHsgcmV0dXJuIHRoaXMuZGlsYXRlZFooIC16ICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBib3VuZGluZyBib3ggdGhhdCBpcyBjb250cmFjdGVkIG9uIGFsbCBzaWRlcywgd2l0aCBkaWZmZXJlbnQgYW1vdW50cyBvZiBjb250cmFjdGlvbiBhbG9uZyBlYWNoIGF4aXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlWFlaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIEFtb3VudCB0byBlcm9kZSBob3Jpem9udGFsbHkgKGZvciBlYWNoIHNpZGUpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBBbW91bnQgdG8gZXJvZGUgdmVydGljYWxseSAoZm9yIGVhY2ggc2lkZSlcclxuICAgKiBAcGFyYW0ge251bWJlcn0geiAtIEFtb3VudCB0byBlcm9kZSBkZXB0aC13aXNlIChmb3IgZWFjaCBzaWRlKVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGVyb2RlZFhZWiggeCwgeSwgeiApIHsgcmV0dXJuIHRoaXMuZGlsYXRlZFhZWiggLXgsIC15LCAteiApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgaG9yaXpvbnRhbGx5IGJ5IHgsIHJldHVybmVkIGFzIGEgY29weS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2hpZnRYKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHNoaWZ0ZWRYKCB4ICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblggKyB4LCB0aGlzLm1pblksIHRoaXMubWluWiwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE91ciBib3VuZHMsIHRyYW5zbGF0ZWQgdmVydGljYWxseSBieSB5LCByZXR1cm5lZCBhcyBhIGNvcHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNoaWZ0WSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IGJvdW5kcywgYW5kIHdpbGwgbm90IG1vZGlmeVxyXG4gICAqIHRoaXMgYm91bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzaGlmdGVkWSggeSApIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMyggdGhpcy5taW5YLCB0aGlzLm1pblkgKyB5LCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSwgdGhpcy5tYXhaICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdXIgYm91bmRzLCB0cmFuc2xhdGVkIGRlcHRoLXdpc2UgYnkgeiwgcmV0dXJuZWQgYXMgYSBjb3B5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdFooKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBib3VuZHMsIGFuZCB3aWxsIG5vdCBtb2RpZnlcclxuICAgKiB0aGlzIGJvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgc2hpZnRlZFooIHogKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogKyB6LCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICsgeiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3VyIGJvdW5kcywgdHJhbnNsYXRlZCBieSAoeCx5LHopLCByZXR1cm5lZCBhcyBhIGNvcHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNoaWZ0KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgYm91bmRzLCBhbmQgd2lsbCBub3QgbW9kaWZ5XHJcbiAgICogdGhpcyBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzaGlmdGVkWFlaKCB4LCB5LCB6ICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB0aGlzLm1pblggKyB4LCB0aGlzLm1pblkgKyB5LCB0aGlzLm1pblogKyB6LCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKyB5LCB0aGlzLm1heFogKyB6ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIG91ciBib3VuZHMsIHRyYW5zbGF0ZWQgYnkgYSB2ZWN0b3IsIHJldHVybmVkIGFzIGEgY29weS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzaGlmdGVkKCB2ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2hpZnRlZFhZWiggdi54LCB2LnksIHYueiApO1xyXG4gIH1cclxuXHJcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICogTXV0YWJsZSBvcGVyYXRpb25zXHJcbiAgICpcclxuICAgKiBBbGwgbXV0YWJsZSBvcGVyYXRpb25zIHNob3VsZCBjYWxsIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxyXG4gICAqICAgc2V0TWluTWF4LCBzZXRNaW5YLCBzZXRNaW5ZLCBzZXRNaW5aLCBzZXRNYXhYLCBzZXRNYXhZLCBzZXRNYXhaXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGVhY2ggdmFsdWUgZm9yIHRoaXMgYm91bmRzLCBhbmQgcmV0dXJucyBpdHNlbGYuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluWVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5aXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4WVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhaXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgc2V0TWluTWF4KCBtaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBtYXhaICkge1xyXG4gICAgdGhpcy5taW5YID0gbWluWDtcclxuICAgIHRoaXMubWluWSA9IG1pblk7XHJcbiAgICB0aGlzLm1pblogPSBtaW5aO1xyXG4gICAgdGhpcy5tYXhYID0gbWF4WDtcclxuICAgIHRoaXMubWF4WSA9IG1heFk7XHJcbiAgICB0aGlzLm1heFogPSBtYXhaO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtaW5YLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aE1pblgoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblhcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzZXRNaW5YKCBtaW5YICkge1xyXG4gICAgdGhpcy5taW5YID0gbWluWDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgbWluWS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNaW5ZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5ZXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgc2V0TWluWSggbWluWSApIHtcclxuICAgIHRoaXMubWluWSA9IG1pblk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIG1pblouXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWluWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluWlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHNldE1pblooIG1pblogKSB7XHJcbiAgICB0aGlzLm1pblogPSBtaW5aO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBtYXhYLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gd2l0aE1heFgoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFhcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzZXRNYXhYKCBtYXhYICkge1xyXG4gICAgdGhpcy5tYXhYID0gbWF4WDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgbWF4WS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhNYXhZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhZXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgc2V0TWF4WSggbWF4WSApIHtcclxuICAgIHRoaXMubWF4WSA9IG1heFk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIG1heFouXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWF4WigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4WlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHNldE1heFooIG1heFogKSB7XHJcbiAgICB0aGlzLm1heFogPSBtYXhaO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZXMgb2YgdGhpcyBib3VuZHMgdG8gYmUgZXF1YWwgdG8gdGhlIGlucHV0IGJvdW5kcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzZXQoIGJvdW5kcyApIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMubWluWiwgYm91bmRzLm1heFgsIGJvdW5kcy5tYXhZLCBib3VuZHMubWF4WiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgdGhpcyBib3VuZHMgc28gdGhhdCBpdCBjb250YWlucyBib3RoIGl0cyBvcmlnaW5hbCBib3VuZHMgYW5kIHRoZSBpbnB1dCBib3VuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB1bmlvbigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczN9IGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGluY2x1ZGVCb3VuZHMoIGJvdW5kcyApIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWCwgYm91bmRzLm1pblggKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWiwgYm91bmRzLm1pblogKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WCwgYm91bmRzLm1heFggKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WSwgYm91bmRzLm1heFkgKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WiwgYm91bmRzLm1heFogKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgaXMgdGhlIGxhcmdlc3QgYm91bmRzIGNvbnRhaW5lZCBib3RoIGluIGl0cyBvcmlnaW5hbCBib3VuZHMgYW5kIGluIHRoZSBpbnB1dCBib3VuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBpbnRlcnNlY3Rpb24oKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBjb25zdHJhaW5Cb3VuZHMoIGJvdW5kcyApIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWCwgYm91bmRzLm1pblggKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWSwgYm91bmRzLm1pblkgKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluWiwgYm91bmRzLm1pblogKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WCwgYm91bmRzLm1heFggKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WSwgYm91bmRzLm1heFkgKSxcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4WiwgYm91bmRzLm1heFogKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgY29udGFpbnMgYm90aCBpdHMgb3JpZ2luYWwgYm91bmRzIGFuZCB0aGUgaW5wdXQgcG9pbnQgKHgseSx6KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHdpdGhDb29yZGluYXRlcygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBhZGRDb29yZGluYXRlcyggeCwgeSwgeiApIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heChcclxuICAgICAgTWF0aC5taW4oIHRoaXMubWluWCwgeCApLFxyXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW5ZLCB5ICksXHJcbiAgICAgIE1hdGgubWluKCB0aGlzLm1pblosIHogKSxcclxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4WCwgeCApLFxyXG4gICAgICBNYXRoLm1heCggdGhpcy5tYXhZLCB5ICksXHJcbiAgICAgIE1hdGgubWF4KCB0aGlzLm1heFosIHogKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGlmaWVzIHRoaXMgYm91bmRzIHNvIHRoYXQgaXQgY29udGFpbnMgYm90aCBpdHMgb3JpZ2luYWwgYm91bmRzIGFuZCB0aGUgaW5wdXQgcG9pbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoUG9pbnQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSBwb2ludFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGFkZFBvaW50KCBwb2ludCApIHtcclxuICAgIHJldHVybiB0aGlzLmFkZENvb3JkaW5hdGVzKCBwb2ludC54LCBwb2ludC55LCBwb2ludC56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0cyBib3VuZGFyaWVzIGFyZSBpbnRlZ2VyLWFsaWduZWQsIHJvdW5kaW5nIHRoZSBtaW5pbXVtIGJvdW5kYXJpZXMgZG93biBhbmQgdGhlXHJcbiAgICogbWF4aW11bSBib3VuZGFyaWVzIHVwIChleHBhbmRpbmcgYXMgbmVjZXNzYXJ5KS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdW5kZWRPdXQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgcm91bmRPdXQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWluWCApLFxyXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1pblkgKSxcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5taW5aICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhYICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhZICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5tYXhaIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0cyBib3VuZGFyaWVzIGFyZSBpbnRlZ2VyLWFsaWduZWQsIHJvdW5kaW5nIHRoZSBtaW5pbXVtIGJvdW5kYXJpZXMgdXAgYW5kIHRoZVxyXG4gICAqIG1heGltdW0gYm91bmRhcmllcyBkb3duIChjb250cmFjdGluZyBhcyBuZWNlc3NhcnkpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZEluKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHJvdW5kSW4oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5YICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5ZICksXHJcbiAgICAgIE1hdGguY2VpbCggdGhpcy5taW5aICksXHJcbiAgICAgIE1hdGguZmxvb3IoIHRoaXMubWF4WCApLFxyXG4gICAgICBNYXRoLmZsb29yKCB0aGlzLm1heFkgKSxcclxuICAgICAgTWF0aC5mbG9vciggdGhpcy5tYXhaIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RpZmllcyB0aGlzIGJvdW5kcyBzbyB0aGF0IGl0IHdvdWxkIGZ1bGx5IGNvbnRhaW4gYSB0cmFuc2Zvcm1lZCB2ZXJzaW9uIGlmIGl0cyBwcmV2aW91cyB2YWx1ZSwgYXBwbHlpbmcgdGhlXHJcbiAgICogbWF0cml4IGFzIGFuIGFmZmluZSB0cmFuc2Zvcm1hdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBOT1RFOiBib3VuZHMudHJhbnNmb3JtKCBtYXRyaXggKS50cmFuc2Zvcm0oIGludmVyc2UgKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIG9yaWdpbmFsIGJveCwgaWYgaXQgaW5jbHVkZXNcclxuICAgKiBhIHJvdGF0aW9uIHRoYXQgaXNuJ3QgYSBtdWx0aXBsZSBvZiAkXFxwaS8yJC4gVGhpcyBpcyBiZWNhdXNlIHRoZSBib3VuZHMgbWF5IGV4cGFuZCBpbiBhcmVhIHRvIGNvdmVyXHJcbiAgICogQUxMIG9mIHRoZSBjb3JuZXJzIG9mIHRoZSB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3guXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHRyYW5zZm9ybWVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgdHJhbnNmb3JtKCBtYXRyaXggKSB7XHJcbiAgICAvLyBkbyBub3RoaW5nXHJcbiAgICBpZiAoIHRoaXMuaXNFbXB0eSgpICkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBvcHRpbWl6YXRpb24gdG8gYmFpbCBmb3IgaWRlbnRpdHkgbWF0cmljZXNcclxuICAgIGlmICggbWF0cml4LmlzSWRlbnRpdHkoKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG1pblggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBtaW5aID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgbGV0IG1heFggPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgbWF4WSA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBtYXhaID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG5cclxuICAgIC8vIHVzaW5nIG11dGFibGUgdmVjdG9yIHNvIHdlIGRvbid0IGNyZWF0ZSBleGNlc3NpdmUgaW5zdGFuY2VzIG9mIFZlY3RvcjIgZHVyaW5nIHRoaXNcclxuICAgIC8vIG1ha2Ugc3VyZSBhbGwgNCBjb3JuZXJzIGFyZSBpbnNpZGUgdGhpcyB0cmFuc2Zvcm1lZCBib3VuZGluZyBib3hcclxuICAgIGNvbnN0IHZlY3RvciA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XHJcblxyXG4gICAgZnVuY3Rpb24gd2l0aEl0KCB2ZWN0b3IgKSB7XHJcbiAgICAgIG1pblggPSBNYXRoLm1pbiggbWluWCwgdmVjdG9yLnggKTtcclxuICAgICAgbWluWSA9IE1hdGgubWluKCBtaW5ZLCB2ZWN0b3IueSApO1xyXG4gICAgICBtaW5aID0gTWF0aC5taW4oIG1pblosIHZlY3Rvci56ICk7XHJcbiAgICAgIG1heFggPSBNYXRoLm1heCggbWF4WCwgdmVjdG9yLnggKTtcclxuICAgICAgbWF4WSA9IE1hdGgubWF4KCBtYXhZLCB2ZWN0b3IueSApO1xyXG4gICAgICBtYXhaID0gTWF0aC5tYXgoIG1heFosIHZlY3Rvci56ICk7XHJcbiAgICB9XHJcblxyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5taW5aICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1pblgsIHRoaXMubWF4WSwgdGhpcy5taW5aICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1heFgsIHRoaXMubWluWSwgdGhpcy5taW5aICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5taW5aICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1pblgsIHRoaXMubWluWSwgdGhpcy5tYXhaICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1pblgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1heFgsIHRoaXMubWluWSwgdGhpcy5tYXhaICkgKSApO1xyXG4gICAgd2l0aEl0KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IzKCB2ZWN0b3Iuc2V0WFlaKCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICkgKSApO1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCBtaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBtYXhaICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeHBhbmRzIHRoaXMgYm91bmRzIG9uIGFsbCBzaWRlcyBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpbGF0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBkaWxhdGUoIGQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kaWxhdGVYWVooIGQsIGQsIGQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4cGFuZHMgdGhpcyBib3VuZHMgaG9yaXpvbnRhbGx5IChsZWZ0IGFuZCByaWdodCkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGRpbGF0ZVgoIHggKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCAtIHgsIHRoaXMubWluWSwgdGhpcy5taW5aLCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFksIHRoaXMubWF4WiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyB2ZXJ0aWNhbGx5ICh0b3AgYW5kIGJvdHRvbSkgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGRpbGF0ZVkoIHkgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCwgdGhpcy5taW5ZIC0geSwgdGhpcy5taW5aLCB0aGlzLm1heFgsIHRoaXMubWF4WSArIHksIHRoaXMubWF4WiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyBkZXB0aC13aXNlIChmcm9udCBhbmQgYmFjaykgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaWxhdGVkWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gelxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIGRpbGF0ZVooIHogKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogLSB6LCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICsgeiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyB0aGlzIGJvdW5kcyBpbmRlcGVuZGVudGx5IGFsb25nIGVhY2ggYXhpcy4gV2lsbCBiZSBlcXVhbCB0byBjYWxsaW5nXHJcbiAgICogYm91bmRzLmRpbGF0ZVgoIHggKS5kaWxhdGVZKCB5ICkuZGlsYXRlWiggeiApLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGlsYXRlZFhZWigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBkaWxhdGVYWVooIHgsIHksIHogKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCAtIHgsIHRoaXMubWluWSAtIHksIHRoaXMubWluWiAtIHosIHRoaXMubWF4WCArIHgsIHRoaXMubWF4WSArIHksIHRoaXMubWF4WiArIHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyBvbiBhbGwgc2lkZXMgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBlcm9kZSggZCApIHsgcmV0dXJuIHRoaXMuZGlsYXRlKCAtZCApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnRyYWN0cyB0aGlzIGJvdW5kcyBob3Jpem9udGFsbHkgKGxlZnQgYW5kIHJpZ2h0KSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFgoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBlcm9kZVgoIHggKSB7IHJldHVybiB0aGlzLmRpbGF0ZVgoIC14ICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udHJhY3RzIHRoaXMgYm91bmRzIHZlcnRpY2FsbHkgKHRvcCBhbmQgYm90dG9tKSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBlcm9kZVkoIHkgKSB7IHJldHVybiB0aGlzLmRpbGF0ZVkoIC15ICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udHJhY3RzIHRoaXMgYm91bmRzIGRlcHRoLXdpc2UgKGZyb250IGFuZCBiYWNrKSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGVyb2RlZFooKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBlcm9kZVooIHogKSB7IHJldHVybiB0aGlzLmRpbGF0ZVooIC16ICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udHJhY3RzIHRoaXMgYm91bmRzIGluZGVwZW5kZW50bHkgYWxvbmcgZWFjaCBheGlzLiBXaWxsIGJlIGVxdWFsIHRvIGNhbGxpbmdcclxuICAgKiBib3VuZHMuZXJvZGVYKCB4ICkuZXJvZGVZKCB5ICkuZXJvZGVaKCB6ICkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBlcm9kZWRYWVooKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgZXJvZGVYWVooIHgsIHksIHogKSB7IHJldHVybiB0aGlzLmRpbGF0ZVhZWiggLXgsIC15LCAteiApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyBob3Jpem9udGFsbHkgYnkgeC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNoaWZ0ZWRYKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgc2hpZnRYKCB4ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblggKyB4LCB0aGlzLm1pblksIHRoaXMubWluWiwgdGhpcy5tYXhYICsgeCwgdGhpcy5tYXhZLCB0aGlzLm1heFogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zbGF0ZXMgb3VyIGJvdW5kcyB2ZXJ0aWNhbGx5IGJ5IHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkWSgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgYm91bmRzLCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcclxuICAgKiB0aGlzIGJvdW5kcyBpdHNlbGYuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHNoaWZ0WSggeSApIHtcclxuICAgIHJldHVybiB0aGlzLnNldE1pbk1heCggdGhpcy5taW5YLCB0aGlzLm1pblkgKyB5LCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZICsgeSwgdGhpcy5tYXhaICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2xhdGVzIG91ciBib3VuZHMgZGVwdGgtd2lzZSBieSB6LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2hpZnRlZFooKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIGJvdW5kcywgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXHJcbiAgICogdGhpcyBib3VuZHMgaXRzZWxmLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzaGlmdFooIHogKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoIHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblogKyB6LCB0aGlzLm1heFgsIHRoaXMubWF4WSwgdGhpcy5tYXhaICsgeiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNsYXRlcyBvdXIgYm91bmRzIGJ5ICh4LHkseikuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzaGlmdGVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBib3VuZHMsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xyXG4gICAqIHRoaXMgYm91bmRzIGl0c2VsZi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gelxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMzfVxyXG4gICAqL1xyXG4gIHNoaWZ0WFlaKCB4LCB5LCB6ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0TWluTWF4KCB0aGlzLm1pblggKyB4LCB0aGlzLm1pblkgKyB5LCB0aGlzLm1pblogKyB6LCB0aGlzLm1heFggKyB4LCB0aGlzLm1heFkgKyB5LCB0aGlzLm1heFogKyB6ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2xhdGVzIG91ciBib3VuZHMgYnkgdGhlIGdpdmVuIHZlY3Rvci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzaGlmdCggdiApIHtcclxuICAgIHJldHVybiB0aGlzLnNoaWZ0WFlaKCB2LngsIHYueSwgdi56ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczMgb2JqZWN0LCB3aXRoIHRoZSBjdWJvaWQgKDNkIHJlY3RhbmdsZSkgY29uc3RydWN0aW9uIHdpdGggeCwgeSwgeiwgd2lkdGgsIGhlaWdodCBhbmQgZGVwdGguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBUaGUgbWluaW11bSB2YWx1ZSBvZiBYIGZvciB0aGUgYm91bmRzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gVGhlIG1pbmltdW0gdmFsdWUgb2YgWSBmb3IgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0geiAtIFRoZSBtaW5pbXVtIHZhbHVlIG9mIFogZm9yIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gVGhlIHdpZHRoIChtYXhYIC0gbWluWCkgb2YgdGhlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gVGhlIGhlaWdodCAobWF4WSAtIG1pblkpIG9mIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoIC0gVGhlIGRlcHRoIChtYXhaIC0gbWluWikgb2YgdGhlIGJvdW5kcy5cclxuICAgKiBAcmV0dXJucyB7Qm91bmRzM31cclxuICAgKi9cclxuICBzdGF0aWMgY3Vib2lkKCB4LCB5LCB6LCB3aWR0aCwgaGVpZ2h0LCBkZXB0aCApIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMyggeCwgeSwgeiwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB6ICsgZGVwdGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMyBvYmplY3QgdGhhdCBvbmx5IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgcG9pbnQgKHgseSx6KS4gVXNlZnVsIGZvciBiZWluZyBkaWxhdGVkIHRvIGZvcm0gYVxyXG4gICAqIGJvdW5kaW5nIGJveCBhcm91bmQgYSBwb2ludC4gTm90ZSB0aGF0IHRoZSBib3VuZHMgd2lsbCBub3QgYmUgXCJlbXB0eVwiIGFzIGl0IGNvbnRhaW5zICh4LHkseiksIGJ1dCBpdCB3aWxsIGhhdmVcclxuICAgKiB6ZXJvIGFyZWEuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XHJcbiAgICogQHJldHVybnMge0JvdW5kczN9XHJcbiAgICovXHJcbiAgc3RhdGljIHBvaW50KCB4LCB5LCB6ICkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3VuZHMzKCB4LCB5LCB6LCB4LCB5LCB6ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAcHVibGljIChyZWFkLW9ubHkpIC0gSGVscHMgdG8gaWRlbnRpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgYm91bmRzXHJcbkJvdW5kczMucHJvdG90eXBlLmlzQm91bmRzID0gdHJ1ZTtcclxuQm91bmRzMy5wcm90b3R5cGUuZGltZW5zaW9uID0gMztcclxuXHJcbmRvdC5yZWdpc3RlciggJ0JvdW5kczMnLCBCb3VuZHMzICk7XHJcblxyXG5Qb29sYWJsZS5taXhJbnRvKCBCb3VuZHMzLCB7XHJcbiAgaW5pdGlhbGl6ZTogQm91bmRzMy5wcm90b3R5cGUuc2V0TWluTWF4XHJcbn0gKTtcclxuXHJcbi8qKlxyXG4gKiBBIGNvbnN0YW50IEJvdW5kczMgd2l0aCBtaW5pbXVtcyA9ICRcXGluZnR5JCwgbWF4aW11bXMgPSAkLVxcaW5mdHkkLCBzbyB0aGF0IGl0IHJlcHJlc2VudHMgXCJubyBib3VuZHMgd2hhdHNvZXZlclwiLlxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIFRoaXMgYWxsb3dzIHVzIHRvIHRha2UgdGhlIHVuaW9uICh1bmlvbi9pbmNsdWRlQm91bmRzKSBvZiB0aGlzIGFuZCBhbnkgb3RoZXIgQm91bmRzMyB0byBnZXQgdGhlIG90aGVyIGJvdW5kcyBiYWNrLFxyXG4gKiBlLmcuIEJvdW5kczMuTk9USElORy51bmlvbiggYm91bmRzICkuZXF1YWxzKCBib3VuZHMgKS4gVGhpcyBvYmplY3QgbmF0dXJhbGx5IHNlcnZlcyBhcyB0aGUgYmFzZSBjYXNlIGFzIGEgdW5pb24gb2ZcclxuICogemVybyBib3VuZHMgb2JqZWN0cy5cclxuICpcclxuICogQWRkaXRpb25hbGx5LCBpbnRlcnNlY3Rpb25zIHdpdGggTk9USElORyB3aWxsIGFsd2F5cyByZXR1cm4gYSBCb3VuZHMzIGVxdWl2YWxlbnQgdG8gTk9USElORy5cclxuICpcclxuICogQGNvbnN0YW50IHtCb3VuZHMzfSBOT1RISU5HXHJcbiAqL1xyXG5Cb3VuZHMzLk5PVEhJTkcgPSBuZXcgQm91bmRzMyggTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSApO1xyXG5cclxuLyoqXHJcbiAqIEEgY29uc3RhbnQgQm91bmRzMyB3aXRoIG1pbmltdW1zID0gJC1cXGluZnR5JCwgbWF4aW11bXMgPSAkXFxpbmZ0eSQsIHNvIHRoYXQgaXQgcmVwcmVzZW50cyBcImFsbCBib3VuZHNcIi5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBUaGlzIGFsbG93cyB1cyB0byB0YWtlIHRoZSBpbnRlcnNlY3Rpb24gKGludGVyc2VjdGlvbi9jb25zdHJhaW5Cb3VuZHMpIG9mIHRoaXMgYW5kIGFueSBvdGhlciBCb3VuZHMzIHRvIGdldCB0aGVcclxuICogb3RoZXIgYm91bmRzIGJhY2ssIGUuZy4gQm91bmRzMy5FVkVSWVRISU5HLmludGVyc2VjdGlvbiggYm91bmRzICkuZXF1YWxzKCBib3VuZHMgKS4gVGhpcyBvYmplY3QgbmF0dXJhbGx5IHNlcnZlcyBhc1xyXG4gKiB0aGUgYmFzZSBjYXNlIGFzIGFuIGludGVyc2VjdGlvbiBvZiB6ZXJvIGJvdW5kcyBvYmplY3RzLlxyXG4gKlxyXG4gKiBBZGRpdGlvbmFsbHksIHVuaW9ucyB3aXRoIEVWRVJZVEhJTkcgd2lsbCBhbHdheXMgcmV0dXJuIGEgQm91bmRzMyBlcXVpdmFsZW50IHRvIEVWRVJZVEhJTkcuXHJcbiAqXHJcbiAqIEBjb25zdGFudCB7Qm91bmRzM30gRVZFUllUSElOR1xyXG4gKi9cclxuQm91bmRzMy5FVkVSWVRISU5HID0gbmV3IEJvdW5kczMoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKTtcclxuXHJcbkJvdW5kczMuQm91bmRzM0lPID0gbmV3IElPVHlwZSggJ0JvdW5kczNJTycsIHtcclxuICB2YWx1ZVR5cGU6IEJvdW5kczMsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ2EgMy1kaW1lbnNpb25hbCBib3VuZHMgKGJvdW5kaW5nIGJveCknLFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICBtaW5YOiBOdW1iZXJJTywgbWluWTogTnVtYmVySU8sIG1pblo6IE51bWJlcklPLFxyXG4gICAgbWF4WDogTnVtYmVySU8sIG1heFk6IE51bWJlcklPLCBtYXhaOiBOdW1iZXJJT1xyXG4gIH0sXHJcbiAgdG9TdGF0ZU9iamVjdDogYm91bmRzMyA9PiAoIHtcclxuICAgIG1pblg6IGJvdW5kczMubWluWCwgbWluWTogYm91bmRzMy5taW5ZLCBtaW5aOiBib3VuZHMzLm1pblosXHJcbiAgICBtYXhYOiBib3VuZHMzLm1heFgsIG1heFk6IGJvdW5kczMubWF4WSwgbWF4WjogYm91bmRzMy5tYXhaXHJcbiAgfSApLFxyXG4gIGZyb21TdGF0ZU9iamVjdDogc3RhdGVPYmplY3QgPT4gbmV3IEJvdW5kczMoXHJcbiAgICBzdGF0ZU9iamVjdC5taW5YLCBzdGF0ZU9iamVjdC5taW5ZLCBzdGF0ZU9iamVjdC5taW5aLFxyXG4gICAgc3RhdGVPYmplY3QubWF4WCwgc3RhdGVPYmplY3QubWF4WSwgc3RhdGVPYmplY3QubWF4WlxyXG4gIClcclxufSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQm91bmRzMztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFDMUIsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFFbEMsTUFBTUMsT0FBTyxDQUFDO0VBQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFHO0lBQ2hEQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsSUFBSSxLQUFLRyxTQUFTLEVBQUUsK0JBQWdDLENBQUM7O0lBRXZFO0lBQ0EsSUFBSSxDQUFDUCxJQUFJLEdBQUdBLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7RUFDbEI7O0VBR0E7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxRQUFRQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ0wsSUFBSSxHQUFHLElBQUksQ0FBQ0gsSUFBSTtFQUFFO0VBRTNDLElBQUlTLEtBQUtBLENBQUEsRUFBRztJQUFFLE9BQU8sSUFBSSxDQUFDRCxRQUFRLENBQUMsQ0FBQztFQUFFOztFQUV0QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsU0FBU0EsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNOLElBQUksR0FBRyxJQUFJLENBQUNILElBQUk7RUFBRTtFQUU1QyxJQUFJVSxNQUFNQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ0QsU0FBUyxDQUFDLENBQUM7RUFBRTs7RUFFeEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFFBQVFBLENBQUEsRUFBRztJQUFFLE9BQU8sSUFBSSxDQUFDUCxJQUFJLEdBQUcsSUFBSSxDQUFDSCxJQUFJO0VBQUU7RUFFM0MsSUFBSVcsS0FBS0EsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNELFFBQVEsQ0FBQyxDQUFDO0VBQUU7O0VBRXRDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxJQUFJQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ2QsSUFBSTtFQUFFO0VBRTNCLElBQUllLENBQUNBLENBQUEsRUFBRztJQUFFLE9BQU8sSUFBSSxDQUFDRCxJQUFJLENBQUMsQ0FBQztFQUFFOztFQUU5QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsSUFBSUEsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNmLElBQUk7RUFBRTtFQUUzQixJQUFJZ0IsQ0FBQ0EsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNELElBQUksQ0FBQyxDQUFDO0VBQUU7O0VBRTlCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxJQUFJQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ2hCLElBQUk7RUFBRTtFQUUzQixJQUFJaUIsQ0FBQ0EsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUNELElBQUksQ0FBQyxDQUFDO0VBQUU7O0VBRTlCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLElBQUk7RUFBRTs7RUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLElBQUk7RUFBRTs7RUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLElBQUk7RUFBRTs7RUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLElBQUk7RUFBRTs7RUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLElBQUk7RUFBRTs7RUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLElBQUk7RUFBRTs7RUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VxQixPQUFPQSxDQUFBLEVBQUc7SUFBRSxPQUFPLElBQUksQ0FBQzFCLElBQUk7RUFBRTtFQUU5QixJQUFJMkIsSUFBSUEsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUMzQixJQUFJO0VBQUU7O0VBRS9CO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFNEIsTUFBTUEsQ0FBQSxFQUFHO0lBQUUsT0FBTyxJQUFJLENBQUMzQixJQUFJO0VBQUU7RUFFN0IsSUFBSTRCLEdBQUdBLENBQUEsRUFBRztJQUFFLE9BQU8sSUFBSSxDQUFDNUIsSUFBSTtFQUFFOztFQUU5QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRTZCLE9BQU9BLENBQUEsRUFBRztJQUFFLE9BQU8sSUFBSSxDQUFDNUIsSUFBSTtF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LENBQUVsRSxJQUFJLEVBQUVxSCxNQUFNLENBQUN4RyxDQUFFLENBQUM7TUFDakNaLElBQUksR0FBRzJELElBQUksQ0FBQ00sR0FBRyxDQUFFakUsSUFBSSxFQUFFb0gsTUFBTSxDQUFDdEcsQ0FBRSxDQUFDO0lBQ25DO0lBRUF1RyxNQUFNLENBQUV0QyxNQUFNLENBQUN1QyxlQUFlLENBQUVGLE1BQU0sQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQzVILElBQUksRUFBRSxJQUFJLENBQUNDLElBQUksRUFBRSxJQUFJLENBQUNDLElBQUssQ0FBRSxDQUFFLENBQUM7SUFDcEZ3SCxNQUFNLENBQUV0QyxNQUFNLENBQUN1QyxlQUFlLENBQUVGLE1BQU0sQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQzVILElBQUksRUFBRSxJQUFJLENBQUNJLElBQUksRUFBRSxJQUFJLENBQUNGLElBQUssQ0FBRSxDQUFFLENBQUM7SUFDcEZ3SCxNQUFNLENBQUV0QyxNQUFNLENBQUN1QyxlQUFlLENBQUVGLE1BQU0sQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQ3pILElBQUksRUFBRSxJQUFJLENBQUNGLElBQUksRUFBRSxJQUFJLENBQUNDLElBQUssQ0FBRSxDQUFFLENBQUM7SUFDcEZ3SCxNQUFNLENBQUV0QyxNQUFNLENBQUN1QyxlQUFlLENBQUVGLE1BQU0sQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQ3pILElBQUksRUFBRSxJQUFJLENBQUNDLElBQUksRUFBRSxJQUFJLENBQUNGLElBQUssQ0FBRSxDQUFFLENBQUM7SUFDcEZ3SCxNQUFNLENBQUV0QyxNQUFNLENBQUN1QyxlQUFlLENBQUVGLE1BQU0sQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQzVILElBQUksRUFBRSxJQUFJLENBQUNDLElBQUksRUFBRSxJQUFJLENBQUNJLElBQUssQ0FBRSxDQUFFLENBQUM7SUFDcEZxSCxNQUFNLENBQUV0QyxNQUFNLENBQUN1QyxlQUFlLENBQUVGLE1BQU0sQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQzVILElBQUksRUFBRSxJ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