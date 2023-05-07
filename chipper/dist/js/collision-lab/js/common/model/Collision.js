// Copyright 2020-2021, University of Colorado Boulder

/**
 * An immutable data structure that contains information about a potential collision, including the two colliding bodies
 * involved in the collision and at what time the collision will occur, if it does at all. Doesn't hold onto any
 * listeners or Properties, so no dispose method is needed.
 *
 * The Collision data structure is used to encapsulate the necessary information of a potential collision that may
 * happen in the future. CollisionEngine will create Collision instances for every combination of physical bodies
 * upfront, along with an associated "time" of when the collision will occur. If a Collision doesn't have an associated
 * "time", it means that the stored bodies will not collide. These Collision instances are saved to reduce redundant
 * detection checks and are unreferenced once the Collision is handled or when one of the stored bodies is involved in
 * another collision.
 *
 * @author Brandon Li
 */

import Poolable from '../../../../phet-core/js/Poolable.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import PlayArea from './PlayArea.js';
class Collision {
  /**
   * @param {Object} body1 - the first physical object involved in the collision.
   * @param {Object} body2 - the second physical object involved in the collision.
   * @param {number|null} time - the elapsed time of when the collision will occur. Null indicates that the bodies will
   *                             not collide.
   */
  constructor(body1, body2, time) {
    this.initialize(body1, body2, time);
  }

  /**
   * Initializes based on the poolable pattern
   * @public
   *
   * @param {Object} body1 - the first physical object involved in the collision.
   * @param {Object} body2 - the second physical object involved in the collision.
   * @param {number|null} time - the elapsed time of when the collision will occur. Null indicates that the bodies will
   *                             not collide.
   */
  initialize(body1, body2, time) {
    assert && assert(body1 instanceof Object, `invalid body1: ${body1}`);
    assert && assert(body2 instanceof Object, `invalid body2: ${body2}`);
    assert && assert(time === null || typeof time === 'number', `invalid time: ${time}`);

    // @public {Object|null} - reference to the passed-in bodies, null when disposed
    this.body1 = body1;
    this.body2 = body2;

    // @public {number|null} - reference to the passed-in time.
    this.time = time;
  }

  /**
   * Releases references, and puts it back into the pool.
   * @public
   */
  dispose() {
    this.body1 = null;
    this.body2 = null;
    this.freeToPool();
  }

  /**
   * Determines if a passed-in Object is stored as a one of the bodies of this Collision instance.
   * @public
   *
   * @param {Object} body
   * @returns {boolean}
   */
  includes(body) {
    assert && assert(body instanceof Object, `invalid body: ${body}`);
    return this.body1 === body || this.body2 === body;
  }

  /**
   * Determines if this Collision instance stores both of the passed-in bodies. The order in which bodies are passed-in
   * doesn't matter.
   * @public
   *
   * @param {Object} body1
   * @param {Object} body2
   * @returns {boolean}
   */
  includesBodies(body1, body2) {
    assert && assert(body1 instanceof Object, `invalid body1: ${body1}`);
    assert && assert(body2 instanceof Object, `invalid body2: ${body2}`);
    return this.includes(body1) && this.includes(body2);
  }

  /**
   * Returns a boolean that indicates if the stored 'time' of this Collision will occur in between two given times.
   * The order in which the times are given doesn't matter. For instance, if this.time = 2, inRange( 1, 3 ) and
   * inRange( 3, 1 ) would return true.
   * @public
   *
   * @param {number} time1
   * @param {number} time2
   * @returns {boolean}
   */
  inRange(time1, time2) {
    assert && assert(typeof time1 === 'number', `invalid time1: ${time1}`);
    assert && assert(typeof time2 === 'number', `invalid time2: ${time2}`);
    return Number.isFinite(this.time) && (time2 >= time1 ? this.time >= time1 && this.time <= time2 : this.time >= time2 && this.time <= time1);
  }

  /**
   * @public
   *
   * @returns {string}
   */
  toString() {
    if (this.body2 instanceof PlayArea) {
      if (this.body1 instanceof Ball) {
        return `#${this.body1.index}-border`;
      } else {
        return 'cluster-border';
      }
    } else {
      return `#${this.body1.index}-#${this.body2.index}`;
    }
  }
}
Poolable.mixInto(Collision);
collisionLab.register('Collision', Collision);
export default Collision;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsImNvbGxpc2lvbkxhYiIsIkJhbGwiLCJQbGF5QXJlYSIsIkNvbGxpc2lvbiIsImNvbnN0cnVjdG9yIiwiYm9keTEiLCJib2R5MiIsInRpbWUiLCJpbml0aWFsaXplIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJpbmNsdWRlcyIsImJvZHkiLCJpbmNsdWRlc0JvZGllcyIsImluUmFuZ2UiLCJ0aW1lMSIsInRpbWUyIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ0b1N0cmluZyIsImluZGV4IiwibWl4SW50byIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29sbGlzaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIGltbXV0YWJsZSBkYXRhIHN0cnVjdHVyZSB0aGF0IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgcG90ZW50aWFsIGNvbGxpc2lvbiwgaW5jbHVkaW5nIHRoZSB0d28gY29sbGlkaW5nIGJvZGllc1xyXG4gKiBpbnZvbHZlZCBpbiB0aGUgY29sbGlzaW9uIGFuZCBhdCB3aGF0IHRpbWUgdGhlIGNvbGxpc2lvbiB3aWxsIG9jY3VyLCBpZiBpdCBkb2VzIGF0IGFsbC4gRG9lc24ndCBob2xkIG9udG8gYW55XHJcbiAqIGxpc3RlbmVycyBvciBQcm9wZXJ0aWVzLCBzbyBubyBkaXNwb3NlIG1ldGhvZCBpcyBuZWVkZWQuXHJcbiAqXHJcbiAqIFRoZSBDb2xsaXNpb24gZGF0YSBzdHJ1Y3R1cmUgaXMgdXNlZCB0byBlbmNhcHN1bGF0ZSB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIG9mIGEgcG90ZW50aWFsIGNvbGxpc2lvbiB0aGF0IG1heVxyXG4gKiBoYXBwZW4gaW4gdGhlIGZ1dHVyZS4gQ29sbGlzaW9uRW5naW5lIHdpbGwgY3JlYXRlIENvbGxpc2lvbiBpbnN0YW5jZXMgZm9yIGV2ZXJ5IGNvbWJpbmF0aW9uIG9mIHBoeXNpY2FsIGJvZGllc1xyXG4gKiB1cGZyb250LCBhbG9uZyB3aXRoIGFuIGFzc29jaWF0ZWQgXCJ0aW1lXCIgb2Ygd2hlbiB0aGUgY29sbGlzaW9uIHdpbGwgb2NjdXIuIElmIGEgQ29sbGlzaW9uIGRvZXNuJ3QgaGF2ZSBhbiBhc3NvY2lhdGVkXHJcbiAqIFwidGltZVwiLCBpdCBtZWFucyB0aGF0IHRoZSBzdG9yZWQgYm9kaWVzIHdpbGwgbm90IGNvbGxpZGUuIFRoZXNlIENvbGxpc2lvbiBpbnN0YW5jZXMgYXJlIHNhdmVkIHRvIHJlZHVjZSByZWR1bmRhbnRcclxuICogZGV0ZWN0aW9uIGNoZWNrcyBhbmQgYXJlIHVucmVmZXJlbmNlZCBvbmNlIHRoZSBDb2xsaXNpb24gaXMgaGFuZGxlZCBvciB3aGVuIG9uZSBvZiB0aGUgc3RvcmVkIGJvZGllcyBpcyBpbnZvbHZlZCBpblxyXG4gKiBhbm90aGVyIGNvbGxpc2lvbi5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IEJhbGwgZnJvbSAnLi9CYWxsLmpzJztcclxuaW1wb3J0IFBsYXlBcmVhIGZyb20gJy4vUGxheUFyZWEuanMnO1xyXG5cclxuY2xhc3MgQ29sbGlzaW9uIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGJvZHkxIC0gdGhlIGZpcnN0IHBoeXNpY2FsIG9iamVjdCBpbnZvbHZlZCBpbiB0aGUgY29sbGlzaW9uLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBib2R5MiAtIHRoZSBzZWNvbmQgcGh5c2ljYWwgb2JqZWN0IGludm9sdmVkIGluIHRoZSBjb2xsaXNpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ8bnVsbH0gdGltZSAtIHRoZSBlbGFwc2VkIHRpbWUgb2Ygd2hlbiB0aGUgY29sbGlzaW9uIHdpbGwgb2NjdXIuIE51bGwgaW5kaWNhdGVzIHRoYXQgdGhlIGJvZGllcyB3aWxsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdCBjb2xsaWRlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBib2R5MSwgYm9keTIsIHRpbWUgKSB7XHJcbiAgICB0aGlzLmluaXRpYWxpemUoIGJvZHkxLCBib2R5MiwgdGltZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgYmFzZWQgb24gdGhlIHBvb2xhYmxlIHBhdHRlcm5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYm9keTEgLSB0aGUgZmlyc3QgcGh5c2ljYWwgb2JqZWN0IGludm9sdmVkIGluIHRoZSBjb2xsaXNpb24uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGJvZHkyIC0gdGhlIHNlY29uZCBwaHlzaWNhbCBvYmplY3QgaW52b2x2ZWQgaW4gdGhlIGNvbGxpc2lvbi5cclxuICAgKiBAcGFyYW0ge251bWJlcnxudWxsfSB0aW1lIC0gdGhlIGVsYXBzZWQgdGltZSBvZiB3aGVuIHRoZSBjb2xsaXNpb24gd2lsbCBvY2N1ci4gTnVsbCBpbmRpY2F0ZXMgdGhhdCB0aGUgYm9kaWVzIHdpbGxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90IGNvbGxpZGUuXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggYm9keTEsIGJvZHkyLCB0aW1lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm9keTEgaW5zdGFuY2VvZiBPYmplY3QsIGBpbnZhbGlkIGJvZHkxOiAke2JvZHkxfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvZHkyIGluc3RhbmNlb2YgT2JqZWN0LCBgaW52YWxpZCBib2R5MjogJHtib2R5Mn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aW1lID09PSBudWxsIHx8IHR5cGVvZiB0aW1lID09PSAnbnVtYmVyJywgYGludmFsaWQgdGltZTogJHt0aW1lfWAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtPYmplY3R8bnVsbH0gLSByZWZlcmVuY2UgdG8gdGhlIHBhc3NlZC1pbiBib2RpZXMsIG51bGwgd2hlbiBkaXNwb3NlZFxyXG4gICAgdGhpcy5ib2R5MSA9IGJvZHkxO1xyXG4gICAgdGhpcy5ib2R5MiA9IGJvZHkyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcnxudWxsfSAtIHJlZmVyZW5jZSB0byB0aGUgcGFzc2VkLWluIHRpbWUuXHJcbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlcywgYW5kIHB1dHMgaXQgYmFjayBpbnRvIHRoZSBwb29sLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5ib2R5MSA9IG51bGw7XHJcbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaWYgYSBwYXNzZWQtaW4gT2JqZWN0IGlzIHN0b3JlZCBhcyBhIG9uZSBvZiB0aGUgYm9kaWVzIG9mIHRoaXMgQ29sbGlzaW9uIGluc3RhbmNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBib2R5XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaW5jbHVkZXMoIGJvZHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBib2R5IGluc3RhbmNlb2YgT2JqZWN0LCBgaW52YWxpZCBib2R5OiAke2JvZHl9YCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmJvZHkxID09PSBib2R5IHx8IHRoaXMuYm9keTIgPT09IGJvZHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIGlmIHRoaXMgQ29sbGlzaW9uIGluc3RhbmNlIHN0b3JlcyBib3RoIG9mIHRoZSBwYXNzZWQtaW4gYm9kaWVzLiBUaGUgb3JkZXIgaW4gd2hpY2ggYm9kaWVzIGFyZSBwYXNzZWQtaW5cclxuICAgKiBkb2Vzbid0IG1hdHRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYm9keTFcclxuICAgKiBAcGFyYW0ge09iamVjdH0gYm9keTJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpbmNsdWRlc0JvZGllcyggYm9keTEsIGJvZHkyICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm9keTEgaW5zdGFuY2VvZiBPYmplY3QsIGBpbnZhbGlkIGJvZHkxOiAke2JvZHkxfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvZHkyIGluc3RhbmNlb2YgT2JqZWN0LCBgaW52YWxpZCBib2R5MjogJHtib2R5Mn1gICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaW5jbHVkZXMoIGJvZHkxICkgJiYgdGhpcy5pbmNsdWRlcyggYm9keTIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBib29sZWFuIHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBzdG9yZWQgJ3RpbWUnIG9mIHRoaXMgQ29sbGlzaW9uIHdpbGwgb2NjdXIgaW4gYmV0d2VlbiB0d28gZ2l2ZW4gdGltZXMuXHJcbiAgICogVGhlIG9yZGVyIGluIHdoaWNoIHRoZSB0aW1lcyBhcmUgZ2l2ZW4gZG9lc24ndCBtYXR0ZXIuIEZvciBpbnN0YW5jZSwgaWYgdGhpcy50aW1lID0gMiwgaW5SYW5nZSggMSwgMyApIGFuZFxyXG4gICAqIGluUmFuZ2UoIDMsIDEgKSB3b3VsZCByZXR1cm4gdHJ1ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZTFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZTJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpblJhbmdlKCB0aW1lMSwgdGltZTIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGltZTEgPT09ICdudW1iZXInLCBgaW52YWxpZCB0aW1lMTogJHt0aW1lMX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGltZTIgPT09ICdudW1iZXInLCBgaW52YWxpZCB0aW1lMjogJHt0aW1lMn1gICk7XHJcblxyXG4gICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSggdGhpcy50aW1lICkgJiYgKCAoIHRpbWUyID49IHRpbWUxICkgPyAoIHRoaXMudGltZSA+PSB0aW1lMSAmJiB0aGlzLnRpbWUgPD0gdGltZTIgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy50aW1lID49IHRpbWUyICYmIHRoaXMudGltZSA8PSB0aW1lMSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgaWYgKCB0aGlzLmJvZHkyIGluc3RhbmNlb2YgUGxheUFyZWEgKSB7XHJcbiAgICAgIGlmICggdGhpcy5ib2R5MSBpbnN0YW5jZW9mIEJhbGwgKSB7XHJcbiAgICAgICAgcmV0dXJuIGAjJHt0aGlzLmJvZHkxLmluZGV4fS1ib3JkZXJgO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAnY2x1c3Rlci1ib3JkZXInO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGAjJHt0aGlzLmJvZHkxLmluZGV4fS0jJHt0aGlzLmJvZHkyLmluZGV4fWA7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5Qb29sYWJsZS5taXhJbnRvKCBDb2xsaXNpb24gKTtcclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0NvbGxpc2lvbicsIENvbGxpc2lvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBDb2xsaXNpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxJQUFJLE1BQU0sV0FBVztBQUM1QixPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUVwQyxNQUFNQyxTQUFTLENBQUM7RUFFZDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRztJQUNoQyxJQUFJLENBQUNDLFVBQVUsQ0FBRUgsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLElBQUssQ0FBQztFQUN2Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsVUFBVUEsQ0FBRUgsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRztJQUMvQkUsTUFBTSxJQUFJQSxNQUFNLENBQUVKLEtBQUssWUFBWUssTUFBTSxFQUFHLGtCQUFpQkwsS0FBTSxFQUFFLENBQUM7SUFDdEVJLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCxLQUFLLFlBQVlJLE1BQU0sRUFBRyxrQkFBaUJKLEtBQU0sRUFBRSxDQUFDO0lBQ3RFRyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPQSxJQUFJLEtBQUssUUFBUSxFQUFHLGlCQUFnQkEsSUFBSyxFQUFFLENBQUM7O0lBRXRGO0lBQ0EsSUFBSSxDQUFDRixLQUFLLEdBQUdBLEtBQUs7SUFDbEIsSUFBSSxDQUFDQyxLQUFLLEdB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