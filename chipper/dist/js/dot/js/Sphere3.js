// Copyright 2014-2020, University of Colorado Boulder

/**
 * A sphere in 3 dimensions (NOT a 3-sphere).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';
class Sphere3 {
  /**
   *
   * @param {Vector3} center  - The center of the sphere
   * @param {number} radius - The radius of the sphere
   */
  constructor(center, radius) {
    // @public {Vector3} - The location of the center of the sphere
    this.center = center;

    // @public {number} -  the radius of the sphere
    this.radius = radius;
    assert && assert(radius >= 0, 'the radius of a sphere should be positive');
  }

  /**
   * Determines if a ray (a half-line) intersects this sphere.
   * A successful intersection returns the result the closest intersection in the form { distance, hitPoint, normal, fromOutside },
   * distance: {number} distance to the intersection point
   * hitPoint: {Vector3} the intersection point
   * normal: {Vector3} the normal vector on the sphere at the point of intersection. (the normal vector points outwards the sphere by convention)
   * fromOutside: {boolean} is the ray half-line intersecting the sphere from the outside of a sphere or from the inside.
   *
   * Returns null if the ray misses the sphere
   *
   * @public
   * @param {Ray3} ray - The ray to intersect with the sphere
   * @param {number} epsilon - A small varying-point value to be used to handle intersections tangent to the sphere
   * @returns {{ distance: number, hitPoint: Vector3, normal, fromOutside: boolean }| null}
   */
  intersect(ray, epsilon) {
    const raydir = ray.direction;
    const pos = ray.position;
    const centerToRay = pos.minus(this.center);

    // basically, we can use the quadratic equation to solve for both possible hit points (both +- roots are the hit points)
    const tmp = raydir.dot(centerToRay);
    const centerToRayDistSq = centerToRay.magnitudeSquared;
    const det = 4 * tmp * tmp - 4 * (centerToRayDistSq - this.radius * this.radius);
    if (det < epsilon) {
      // ray misses sphere entirely
      return null;
    }
    const base = raydir.dot(this.center) - raydir.dot(pos);
    const sqt = Math.sqrt(det) / 2;

    // the "first" entry point distance into the sphere. if we are inside the sphere, it is behind us
    const ta = base - sqt;

    // the "second" entry point distance
    const tb = base + sqt;
    if (tb < epsilon) {
      // sphere is behind ray, so don't return an intersection
      return null;
    }
    const hitPositionB = ray.pointAtDistance(tb);
    const normalB = hitPositionB.minus(this.center).normalized();
    if (ta < epsilon) {
      // we are inside the sphere
      // in => out
      return {
        distance: tb,
        hitPoint: hitPositionB,
        normal: normalB.negated(),
        fromOutside: false
      };
    } else {
      // two possible hits
      const hitPositionA = ray.pointAtDistance(ta);
      const normalA = hitPositionA.minus(this.center).normalized();

      // close hit, we have out => in
      return {
        distance: ta,
        hitPoint: hitPositionA,
        normal: normalA,
        fromOutside: true
      };
    }
  }

  /**
   *
   * Returns the intersections of a ray with a sphere. There will be 0 or 2 intersections, with
   * the "proper" intersection first, if applicable (closest in front of the ray).
   * Note that this method makes the implicit assumptions that the ray's origin does not lie inside the sphere.
   *
   * @public
   * @param {Ray3} ray - The ray to intersect with the sphere
   * @param {number} epsilon - A small varying-point value to be used to handle intersections tangent to the sphere
   * @returns {Array.<{distance:number, hitPoint:Vector3, normal:Vector3, fromOutside:boolean }>| null} -  An array of intersection
   *                                                                         results like { distance, hitPoint, normal, fromOutside }.
   */
  intersections(ray, epsilon) {
    const raydir = ray.direction;
    const pos = ray.position;
    const centerToRay = pos.minus(this.center);

    // basically, we can use the quadratic equation to solve for both possible hit points (both +- roots are the hit points)
    const tmp = raydir.dot(centerToRay);
    const centerToRayDistSq = centerToRay.magnitudeSquared;
    const det = 4 * tmp * tmp - 4 * (centerToRayDistSq - this.radius * this.radius);
    if (det < epsilon) {
      // ray misses sphere entirely
      return [];
    }
    const base = raydir.dot(this.center) - raydir.dot(pos);
    const sqt = Math.sqrt(det) / 2;

    // the "first" entry point distance into the sphere. if we are inside the sphere, it is behind us
    const ta = base - sqt;

    // the "second" entry point distance
    const tb = base + sqt;
    if (tb < epsilon) {
      // sphere is behind ray, so don't return an intersection
      return [];
    }
    const hitPositionB = ray.pointAtDistance(tb);
    const normalB = hitPositionB.minus(this.center).normalized();
    const hitPositionA = ray.pointAtDistance(ta);
    const normalA = hitPositionA.minus(this.center).normalized();
    const resultB = {
      distance: tb,
      hitPoint: hitPositionB,
      normal: normalB.negated(),
      fromOutside: false
    };
    const resultA = {
      distance: ta,
      hitPoint: hitPositionA,
      normal: normalA,
      fromOutside: true
    };
    if (ta < epsilon) {
      // we are inside the sphere
      // in => out

      return [resultB, resultA];
    } else {
      // two possible hits

      // close hit, we have out => in
      return [resultA, resultB];
    }
  }
}
dot.register('Sphere3', Sphere3);
export default Sphere3;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJTcGhlcmUzIiwiY29uc3RydWN0b3IiLCJjZW50ZXIiLCJyYWRpdXMiLCJhc3NlcnQiLCJpbnRlcnNlY3QiLCJyYXkiLCJlcHNpbG9uIiwicmF5ZGlyIiwiZGlyZWN0aW9uIiwicG9zIiwicG9zaXRpb24iLCJjZW50ZXJUb1JheSIsIm1pbnVzIiwidG1wIiwiY2VudGVyVG9SYXlEaXN0U3EiLCJtYWduaXR1ZGVTcXVhcmVkIiwiZGV0IiwiYmFzZSIsInNxdCIsIk1hdGgiLCJzcXJ0IiwidGEiLCJ0YiIsImhpdFBvc2l0aW9uQiIsInBvaW50QXREaXN0YW5jZSIsIm5vcm1hbEIiLCJub3JtYWxpemVkIiwiZGlzdGFuY2UiLCJoaXRQb2ludCIsIm5vcm1hbCIsIm5lZ2F0ZWQiLCJmcm9tT3V0c2lkZSIsImhpdFBvc2l0aW9uQSIsIm5vcm1hbEEiLCJpbnRlcnNlY3Rpb25zIiwicmVzdWx0QiIsInJlc3VsdEEiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNwaGVyZTMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzcGhlcmUgaW4gMyBkaW1lbnNpb25zIChOT1QgYSAzLXNwaGVyZSkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcclxuXHJcbmNsYXNzIFNwaGVyZTMge1xyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSBjZW50ZXIgIC0gVGhlIGNlbnRlciBvZiB0aGUgc3BoZXJlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyAtIFRoZSByYWRpdXMgb2YgdGhlIHNwaGVyZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjZW50ZXIsIHJhZGl1cyApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZWN0b3IzfSAtIFRoZSBsb2NhdGlvbiBvZiB0aGUgY2VudGVyIG9mIHRoZSBzcGhlcmVcclxuICAgIHRoaXMuY2VudGVyID0gY2VudGVyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSAgdGhlIHJhZGl1cyBvZiB0aGUgc3BoZXJlXHJcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByYWRpdXMgPj0gMCwgJ3RoZSByYWRpdXMgb2YgYSBzcGhlcmUgc2hvdWxkIGJlIHBvc2l0aXZlJyApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgYSByYXkgKGEgaGFsZi1saW5lKSBpbnRlcnNlY3RzIHRoaXMgc3BoZXJlLlxyXG4gICAqIEEgc3VjY2Vzc2Z1bCBpbnRlcnNlY3Rpb24gcmV0dXJucyB0aGUgcmVzdWx0IHRoZSBjbG9zZXN0IGludGVyc2VjdGlvbiBpbiB0aGUgZm9ybSB7IGRpc3RhbmNlLCBoaXRQb2ludCwgbm9ybWFsLCBmcm9tT3V0c2lkZSB9LFxyXG4gICAqIGRpc3RhbmNlOiB7bnVtYmVyfSBkaXN0YW5jZSB0byB0aGUgaW50ZXJzZWN0aW9uIHBvaW50XHJcbiAgICogaGl0UG9pbnQ6IHtWZWN0b3IzfSB0aGUgaW50ZXJzZWN0aW9uIHBvaW50XHJcbiAgICogbm9ybWFsOiB7VmVjdG9yM30gdGhlIG5vcm1hbCB2ZWN0b3Igb24gdGhlIHNwaGVyZSBhdCB0aGUgcG9pbnQgb2YgaW50ZXJzZWN0aW9uLiAodGhlIG5vcm1hbCB2ZWN0b3IgcG9pbnRzIG91dHdhcmRzIHRoZSBzcGhlcmUgYnkgY29udmVudGlvbilcclxuICAgKiBmcm9tT3V0c2lkZToge2Jvb2xlYW59IGlzIHRoZSByYXkgaGFsZi1saW5lIGludGVyc2VjdGluZyB0aGUgc3BoZXJlIGZyb20gdGhlIG91dHNpZGUgb2YgYSBzcGhlcmUgb3IgZnJvbSB0aGUgaW5zaWRlLlxyXG4gICAqXHJcbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSByYXkgbWlzc2VzIHRoZSBzcGhlcmVcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1JheTN9IHJheSAtIFRoZSByYXkgdG8gaW50ZXJzZWN0IHdpdGggdGhlIHNwaGVyZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uIC0gQSBzbWFsbCB2YXJ5aW5nLXBvaW50IHZhbHVlIHRvIGJlIHVzZWQgdG8gaGFuZGxlIGludGVyc2VjdGlvbnMgdGFuZ2VudCB0byB0aGUgc3BoZXJlXHJcbiAgICogQHJldHVybnMge3sgZGlzdGFuY2U6IG51bWJlciwgaGl0UG9pbnQ6IFZlY3RvcjMsIG5vcm1hbCwgZnJvbU91dHNpZGU6IGJvb2xlYW4gfXwgbnVsbH1cclxuICAgKi9cclxuICBpbnRlcnNlY3QoIHJheSwgZXBzaWxvbiApIHtcclxuICAgIGNvbnN0IHJheWRpciA9IHJheS5kaXJlY3Rpb247XHJcbiAgICBjb25zdCBwb3MgPSByYXkucG9zaXRpb247XHJcbiAgICBjb25zdCBjZW50ZXJUb1JheSA9IHBvcy5taW51cyggdGhpcy5jZW50ZXIgKTtcclxuXHJcbiAgICAvLyBiYXNpY2FsbHksIHdlIGNhbiB1c2UgdGhlIHF1YWRyYXRpYyBlcXVhdGlvbiB0byBzb2x2ZSBmb3IgYm90aCBwb3NzaWJsZSBoaXQgcG9pbnRzIChib3RoICstIHJvb3RzIGFyZSB0aGUgaGl0IHBvaW50cylcclxuICAgIGNvbnN0IHRtcCA9IHJheWRpci5kb3QoIGNlbnRlclRvUmF5ICk7XHJcbiAgICBjb25zdCBjZW50ZXJUb1JheURpc3RTcSA9IGNlbnRlclRvUmF5Lm1hZ25pdHVkZVNxdWFyZWQ7XHJcbiAgICBjb25zdCBkZXQgPSA0ICogdG1wICogdG1wIC0gNCAqICggY2VudGVyVG9SYXlEaXN0U3EgLSB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICk7XHJcbiAgICBpZiAoIGRldCA8IGVwc2lsb24gKSB7XHJcbiAgICAgIC8vIHJheSBtaXNzZXMgc3BoZXJlIGVudGlyZWx5XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJhc2UgPSByYXlkaXIuZG90KCB0aGlzLmNlbnRlciApIC0gcmF5ZGlyLmRvdCggcG9zICk7XHJcbiAgICBjb25zdCBzcXQgPSBNYXRoLnNxcnQoIGRldCApIC8gMjtcclxuXHJcbiAgICAvLyB0aGUgXCJmaXJzdFwiIGVudHJ5IHBvaW50IGRpc3RhbmNlIGludG8gdGhlIHNwaGVyZS4gaWYgd2UgYXJlIGluc2lkZSB0aGUgc3BoZXJlLCBpdCBpcyBiZWhpbmQgdXNcclxuICAgIGNvbnN0IHRhID0gYmFzZSAtIHNxdDtcclxuXHJcbiAgICAvLyB0aGUgXCJzZWNvbmRcIiBlbnRyeSBwb2ludCBkaXN0YW5jZVxyXG4gICAgY29uc3QgdGIgPSBiYXNlICsgc3F0O1xyXG5cclxuICAgIGlmICggdGIgPCBlcHNpbG9uICkge1xyXG4gICAgICAvLyBzcGhlcmUgaXMgYmVoaW5kIHJheSwgc28gZG9uJ3QgcmV0dXJuIGFuIGludGVyc2VjdGlvblxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoaXRQb3NpdGlvbkIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xyXG4gICAgY29uc3Qgbm9ybWFsQiA9IGhpdFBvc2l0aW9uQi5taW51cyggdGhpcy5jZW50ZXIgKS5ub3JtYWxpemVkKCk7XHJcblxyXG4gICAgaWYgKCB0YSA8IGVwc2lsb24gKSB7XHJcbiAgICAgIC8vIHdlIGFyZSBpbnNpZGUgdGhlIHNwaGVyZVxyXG4gICAgICAvLyBpbiA9PiBvdXRcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBkaXN0YW5jZTogdGIsXHJcbiAgICAgICAgaGl0UG9pbnQ6IGhpdFBvc2l0aW9uQixcclxuICAgICAgICBub3JtYWw6IG5vcm1hbEIubmVnYXRlZCgpLFxyXG4gICAgICAgIGZyb21PdXRzaWRlOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHR3byBwb3NzaWJsZSBoaXRzXHJcbiAgICAgIGNvbnN0IGhpdFBvc2l0aW9uQSA9IHJheS5wb2ludEF0RGlzdGFuY2UoIHRhICk7XHJcbiAgICAgIGNvbnN0IG5vcm1hbEEgPSBoaXRQb3NpdGlvbkEubWludXMoIHRoaXMuY2VudGVyICkubm9ybWFsaXplZCgpO1xyXG5cclxuICAgICAgLy8gY2xvc2UgaGl0LCB3ZSBoYXZlIG91dCA9PiBpblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGRpc3RhbmNlOiB0YSxcclxuICAgICAgICBoaXRQb2ludDogaGl0UG9zaXRpb25BLFxyXG4gICAgICAgIG5vcm1hbDogbm9ybWFsQSxcclxuICAgICAgICBmcm9tT3V0c2lkZTogdHJ1ZVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBSZXR1cm5zIHRoZSBpbnRlcnNlY3Rpb25zIG9mIGEgcmF5IHdpdGggYSBzcGhlcmUuIFRoZXJlIHdpbGwgYmUgMCBvciAyIGludGVyc2VjdGlvbnMsIHdpdGhcclxuICAgKiB0aGUgXCJwcm9wZXJcIiBpbnRlcnNlY3Rpb24gZmlyc3QsIGlmIGFwcGxpY2FibGUgKGNsb3Nlc3QgaW4gZnJvbnQgb2YgdGhlIHJheSkuXHJcbiAgICogTm90ZSB0aGF0IHRoaXMgbWV0aG9kIG1ha2VzIHRoZSBpbXBsaWNpdCBhc3N1bXB0aW9ucyB0aGF0IHRoZSByYXkncyBvcmlnaW4gZG9lcyBub3QgbGllIGluc2lkZSB0aGUgc3BoZXJlLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7UmF5M30gcmF5IC0gVGhlIHJheSB0byBpbnRlcnNlY3Qgd2l0aCB0aGUgc3BoZXJlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBBIHNtYWxsIHZhcnlpbmctcG9pbnQgdmFsdWUgdG8gYmUgdXNlZCB0byBoYW5kbGUgaW50ZXJzZWN0aW9ucyB0YW5nZW50IHRvIHRoZSBzcGhlcmVcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPHtkaXN0YW5jZTpudW1iZXIsIGhpdFBvaW50OlZlY3RvcjMsIG5vcm1hbDpWZWN0b3IzLCBmcm9tT3V0c2lkZTpib29sZWFuIH0+fCBudWxsfSAtICBBbiBhcnJheSBvZiBpbnRlcnNlY3Rpb25cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzIGxpa2UgeyBkaXN0YW5jZSwgaGl0UG9pbnQsIG5vcm1hbCwgZnJvbU91dHNpZGUgfS5cclxuICAgKi9cclxuICBpbnRlcnNlY3Rpb25zKCByYXksIGVwc2lsb24gKSB7XHJcbiAgICBjb25zdCByYXlkaXIgPSByYXkuZGlyZWN0aW9uO1xyXG4gICAgY29uc3QgcG9zID0gcmF5LnBvc2l0aW9uO1xyXG4gICAgY29uc3QgY2VudGVyVG9SYXkgPSBwb3MubWludXMoIHRoaXMuY2VudGVyICk7XHJcblxyXG4gICAgLy8gYmFzaWNhbGx5LCB3ZSBjYW4gdXNlIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gdG8gc29sdmUgZm9yIGJvdGggcG9zc2libGUgaGl0IHBvaW50cyAoYm90aCArLSByb290cyBhcmUgdGhlIGhpdCBwb2ludHMpXHJcbiAgICBjb25zdCB0bXAgPSByYXlkaXIuZG90KCBjZW50ZXJUb1JheSApO1xyXG4gICAgY29uc3QgY2VudGVyVG9SYXlEaXN0U3EgPSBjZW50ZXJUb1JheS5tYWduaXR1ZGVTcXVhcmVkO1xyXG4gICAgY29uc3QgZGV0ID0gNCAqIHRtcCAqIHRtcCAtIDQgKiAoIGNlbnRlclRvUmF5RGlzdFNxIC0gdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyApO1xyXG4gICAgaWYgKCBkZXQgPCBlcHNpbG9uICkge1xyXG4gICAgICAvLyByYXkgbWlzc2VzIHNwaGVyZSBlbnRpcmVseVxyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYmFzZSA9IHJheWRpci5kb3QoIHRoaXMuY2VudGVyICkgLSByYXlkaXIuZG90KCBwb3MgKTtcclxuICAgIGNvbnN0IHNxdCA9IE1hdGguc3FydCggZGV0ICkgLyAyO1xyXG5cclxuICAgIC8vIHRoZSBcImZpcnN0XCIgZW50cnkgcG9pbnQgZGlzdGFuY2UgaW50byB0aGUgc3BoZXJlLiBpZiB3ZSBhcmUgaW5zaWRlIHRoZSBzcGhlcmUsIGl0IGlzIGJlaGluZCB1c1xyXG4gICAgY29uc3QgdGEgPSBiYXNlIC0gc3F0O1xyXG5cclxuICAgIC8vIHRoZSBcInNlY29uZFwiIGVudHJ5IHBvaW50IGRpc3RhbmNlXHJcbiAgICBjb25zdCB0YiA9IGJhc2UgKyBzcXQ7XHJcblxyXG4gICAgaWYgKCB0YiA8IGVwc2lsb24gKSB7XHJcbiAgICAgIC8vIHNwaGVyZSBpcyBiZWhpbmQgcmF5LCBzbyBkb24ndCByZXR1cm4gYW4gaW50ZXJzZWN0aW9uXHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoaXRQb3NpdGlvbkIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xyXG4gICAgY29uc3Qgbm9ybWFsQiA9IGhpdFBvc2l0aW9uQi5taW51cyggdGhpcy5jZW50ZXIgKS5ub3JtYWxpemVkKCk7XHJcblxyXG4gICAgY29uc3QgaGl0UG9zaXRpb25BID0gcmF5LnBvaW50QXREaXN0YW5jZSggdGEgKTtcclxuICAgIGNvbnN0IG5vcm1hbEEgPSBoaXRQb3NpdGlvbkEubWludXMoIHRoaXMuY2VudGVyICkubm9ybWFsaXplZCgpO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdEIgPSB7XHJcbiAgICAgIGRpc3RhbmNlOiB0YixcclxuICAgICAgaGl0UG9pbnQ6IGhpdFBvc2l0aW9uQixcclxuICAgICAgbm9ybWFsOiBub3JtYWxCLm5lZ2F0ZWQoKSxcclxuICAgICAgZnJvbU91dHNpZGU6IGZhbHNlXHJcbiAgICB9O1xyXG4gICAgY29uc3QgcmVzdWx0QSA9IHtcclxuICAgICAgZGlzdGFuY2U6IHRhLFxyXG4gICAgICBoaXRQb2ludDogaGl0UG9zaXRpb25BLFxyXG4gICAgICBub3JtYWw6IG5vcm1hbEEsXHJcbiAgICAgIGZyb21PdXRzaWRlOiB0cnVlXHJcbiAgICB9O1xyXG4gICAgaWYgKCB0YSA8IGVwc2lsb24gKSB7XHJcbiAgICAgIC8vIHdlIGFyZSBpbnNpZGUgdGhlIHNwaGVyZVxyXG4gICAgICAvLyBpbiA9PiBvdXRcclxuXHJcbiAgICAgIHJldHVybiBbIHJlc3VsdEIsIHJlc3VsdEEgXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyB0d28gcG9zc2libGUgaGl0c1xyXG5cclxuICAgICAgLy8gY2xvc2UgaGl0LCB3ZSBoYXZlIG91dCA9PiBpblxyXG4gICAgICByZXR1cm4gWyByZXN1bHRBLCByZXN1bHRCIF07XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5kb3QucmVnaXN0ZXIoICdTcGhlcmUzJywgU3BoZXJlMyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU3BoZXJlMzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLFVBQVU7QUFFMUIsTUFBTUMsT0FBTyxDQUFDO0VBQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUVDLE1BQU0sRUFBRztJQUU1QjtJQUNBLElBQUksQ0FBQ0QsTUFBTSxHQUFHQSxNQUFNOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHQSxNQUFNO0lBRXBCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsTUFBTSxJQUFJLENBQUMsRUFBRSwyQ0FBNEMsQ0FBQztFQUM5RTs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsU0FBU0EsQ0FBRUMsR0FBRyxFQUFFQyxPQUFPLEVBQUc7SUFD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