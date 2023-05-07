// Copyright 2019-2022, University of Colorado Boulder

/**
 * Particle is the model for all types of particles. A particle is a perfect rigid sphere.
 *
 * Since there can be a large number of particles, properties of particles are not implemented as observable
 * Properties.  Instead, the entire particle system is inspected to derive the current state of the system.
 * To optimize performance, all Vector2 fields herein are mutated.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
export default class Particle {
  // these are mutated in the Diffusion screen
  // AMU
  // pm

  // center of the particle, pm, MUTATED!
  // position on previous time step, MUTATED!
  // pm/ps, initially at rest, MUTATED!

  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      mass: GasPropertiesConstants.MASS_RANGE.defaultValue,
      radius: GasPropertiesConstants.RADIUS_RANGE.defaultValue
    }, providedOptions);
    this.mass = options.mass;
    this.radius = options.radius;
    this.colorProperty = options.colorProperty || new Property('white');
    this.highlightColorProperty = options.highlightColorProperty || new Property('white');
    this.position = new Vector2(0, 0);
    this.previousPosition = this.position.copy();
    this.velocity = new Vector2(0, 0);
    this._isDisposed = false;
  }
  dispose() {
    assert && assert(!this._isDisposed, 'attempted to dispose again');
    this._isDisposed = true;
  }
  get isDisposed() {
    return this._isDisposed;
  }

  /**
   * ES5 getters and setters for particle position.
   */
  get left() {
    return this.position.x - this.radius;
  }
  set left(value) {
    this.setPositionXY(value + this.radius, this.position.y);
  }
  get right() {
    return this.position.x + this.radius;
  }
  set right(value) {
    this.setPositionXY(value - this.radius, this.position.y);
  }
  get top() {
    return this.position.y + this.radius;
  }
  set top(value) {
    this.setPositionXY(this.position.x, value - this.radius);
  }
  get bottom() {
    return this.position.y - this.radius;
  }
  set bottom(value) {
    this.setPositionXY(this.position.x, value + this.radius);
  }

  /**
   * Gets the kinetic energy of this particle.
   * @returns AMU * pm^2 / ps^2
   */
  getKineticEnergy() {
    return 0.5 * this.mass * this.velocity.magnitudeSquared; // KE = (1/2) * m * |v|^2
  }

  /**
   * Moves this particle by one time step.
   * @param dt - time delta, in ps
   */
  step(dt) {
    assert && assert(dt > 0, `invalid dt: ${dt}`);
    assert && assert(!this._isDisposed, 'attempted to step a disposed Particle');
    this.setPositionXY(this.position.x + dt * this.velocity.x, this.position.y + dt * this.velocity.y);
  }

  /**
   * Sets this particle's position and remembers the previous position.
   */
  setPositionXY(x, y) {
    this.previousPosition.setXY(this.position.x, this.position.y);
    this.position.setXY(x, y);
  }

  /**
   * Sets this particle's velocity in Cartesian coordinates.
   */
  setVelocityXY(x, y) {
    this.velocity.setXY(x, y);
  }

  /**
   * Sets this particle's velocity in polar coordinates.
   * @param magnitude - pm / ps
   * @param angle - in radians
   */
  setVelocityPolar(magnitude, angle) {
    assert && assert(magnitude >= 0, `invalid magnitude: ${magnitude}`);
    this.setVelocityXY(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  }

  /**
   * Sets this particle's velocity magnitude (speed).
   * @param magnitude - pm/ps
   */
  setVelocityMagnitude(magnitude) {
    assert && assert(magnitude >= 0, `invalid magnitude: ${magnitude}`);
    this.velocity.setMagnitude(magnitude);
  }

  /**
   * Scales this particle's velocity. Used when heat/cool is applied.
   */
  scaleVelocity(scale) {
    assert && assert(scale > 0, `invalid scale: ${scale}`);
    this.velocity.multiply(scale);
  }

  /**
   * Does this particle contact another particle now?
   */
  contactsParticle(particle) {
    return this.position.distance(particle.position) <= this.radius + particle.radius;
  }

  /**
   * Did this particle contact another particle on the previous time step? Prevents collections of particles
   * that are emitted from the pump from colliding until they spread out.  This was borrowed from the Java
   * implementation, and makes the collision behavior more natural looking.
   */
  contactedParticle(particle) {
    return this.previousPosition.distance(particle.previousPosition) <= this.radius + particle.radius;
  }

  /**
   * Does this particle intersect the specified bounds, including edges? This implementation was adapted
   * from Bounds2.intersectsBounds, removed Math.max and Math.min calls because this will be called thousands
   * of times per step.
   */
  intersectsBounds(bounds) {
    const minX = this.left > bounds.minX ? this.left : bounds.minX;
    const minY = this.bottom > bounds.minY ? this.bottom : bounds.minY;
    const maxX = this.right < bounds.maxX ? this.right : bounds.maxX;
    const maxY = this.top < bounds.maxY ? this.top : bounds.maxY;
    return maxX - minX >= 0 && maxY - minY >= 0;
  }

  /**
   * String representation of this particle. For debugging only, do not rely on format.
   */
  toString() {
    return `Particle[position:(${this.position.x},${this.position.y}) mass:${this.mass} radius:${this.radius}]`;
  }
}
gasProperties.register('Particle', Particle);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc0NvbnN0YW50cyIsIlBhcnRpY2xlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibWFzcyIsIk1BU1NfUkFOR0UiLCJkZWZhdWx0VmFsdWUiLCJyYWRpdXMiLCJSQURJVVNfUkFOR0UiLCJjb2xvclByb3BlcnR5IiwiaGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eSIsInBvc2l0aW9uIiwicHJldmlvdXNQb3NpdGlvbiIsImNvcHkiLCJ2ZWxvY2l0eSIsIl9pc0Rpc3Bvc2VkIiwiZGlzcG9zZSIsImFzc2VydCIsImlzRGlzcG9zZWQiLCJsZWZ0IiwieCIsInZhbHVlIiwic2V0UG9zaXRpb25YWSIsInkiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsImdldEtpbmV0aWNFbmVyZ3kiLCJtYWduaXR1ZGVTcXVhcmVkIiwic3RlcCIsImR0Iiwic2V0WFkiLCJzZXRWZWxvY2l0eVhZIiwic2V0VmVsb2NpdHlQb2xhciIsIm1hZ25pdHVkZSIsImFuZ2xlIiwiTWF0aCIsImNvcyIsInNpbiIsInNldFZlbG9jaXR5TWFnbml0dWRlIiwic2V0TWFnbml0dWRlIiwic2NhbGVWZWxvY2l0eSIsInNjYWxlIiwibXVsdGlwbHkiLCJjb250YWN0c1BhcnRpY2xlIiwicGFydGljbGUiLCJkaXN0YW5jZSIsImNvbnRhY3RlZFBhcnRpY2xlIiwiaW50ZXJzZWN0c0JvdW5kcyIsImJvdW5kcyIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJ0b1N0cmluZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFydGljbGUgaXMgdGhlIG1vZGVsIGZvciBhbGwgdHlwZXMgb2YgcGFydGljbGVzLiBBIHBhcnRpY2xlIGlzIGEgcGVyZmVjdCByaWdpZCBzcGhlcmUuXHJcbiAqXHJcbiAqIFNpbmNlIHRoZXJlIGNhbiBiZSBhIGxhcmdlIG51bWJlciBvZiBwYXJ0aWNsZXMsIHByb3BlcnRpZXMgb2YgcGFydGljbGVzIGFyZSBub3QgaW1wbGVtZW50ZWQgYXMgb2JzZXJ2YWJsZVxyXG4gKiBQcm9wZXJ0aWVzLiAgSW5zdGVhZCwgdGhlIGVudGlyZSBwYXJ0aWNsZSBzeXN0ZW0gaXMgaW5zcGVjdGVkIHRvIGRlcml2ZSB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgc3lzdGVtLlxyXG4gKiBUbyBvcHRpbWl6ZSBwZXJmb3JtYW5jZSwgYWxsIFZlY3RvcjIgZmllbGRzIGhlcmVpbiBhcmUgbXV0YXRlZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBQcm9maWxlQ29sb3JQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbnN0YW50cyBmcm9tICcuLi9HYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgbWFzcz86IG51bWJlcjsgLy8gQU1VXHJcbiAgcmFkaXVzPzogbnVtYmVyOyAvLyBwbVxyXG4gIGNvbG9yUHJvcGVydHk6IFByb2ZpbGVDb2xvclByb3BlcnR5O1xyXG4gIGhpZ2hsaWdodENvbG9yUHJvcGVydHk6IFByb2ZpbGVDb2xvclByb3BlcnR5OyAvLyBjb2xvciBmb3Igc3BlY3VsYXIgaGlnaGxpZ2h0XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBQYXJ0aWNsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnRpY2xlIHtcclxuXHJcbiAgLy8gdGhlc2UgYXJlIG11dGF0ZWQgaW4gdGhlIERpZmZ1c2lvbiBzY3JlZW5cclxuICBwdWJsaWMgbWFzczogbnVtYmVyOyAvLyBBTVVcclxuICBwdWJsaWMgcmFkaXVzOiBudW1iZXI7IC8vIHBtXHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBjb2xvclByb3BlcnR5OiBQcm9maWxlQ29sb3JQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgaGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eTogUHJvZmlsZUNvbG9yUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBwb3NpdGlvbjogVmVjdG9yMjsgLy8gY2VudGVyIG9mIHRoZSBwYXJ0aWNsZSwgcG0sIE1VVEFURUQhXHJcbiAgcHVibGljIHJlYWRvbmx5IHByZXZpb3VzUG9zaXRpb246IFZlY3RvcjI7IC8vIHBvc2l0aW9uIG9uIHByZXZpb3VzIHRpbWUgc3RlcCwgTVVUQVRFRCFcclxuICBwdWJsaWMgcmVhZG9ubHkgdmVsb2NpdHk6IFZlY3RvcjI7IC8vIHBtL3BzLCBpbml0aWFsbHkgYXQgcmVzdCwgTVVUQVRFRCFcclxuXHJcbiAgcHJpdmF0ZSBfaXNEaXNwb3NlZDogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBQYXJ0aWNsZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQYXJ0aWNsZU9wdGlvbnMsIFNlbGZPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBtYXNzOiBHYXNQcm9wZXJ0aWVzQ29uc3RhbnRzLk1BU1NfUkFOR0UuZGVmYXVsdFZhbHVlLFxyXG4gICAgICByYWRpdXM6IEdhc1Byb3BlcnRpZXNDb25zdGFudHMuUkFESVVTX1JBTkdFLmRlZmF1bHRWYWx1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5tYXNzID0gb3B0aW9ucy5tYXNzO1xyXG4gICAgdGhpcy5yYWRpdXMgPSBvcHRpb25zLnJhZGl1cztcclxuICAgIHRoaXMuY29sb3JQcm9wZXJ0eSA9IG9wdGlvbnMuY29sb3JQcm9wZXJ0eSB8fCBuZXcgUHJvcGVydHkoICd3aGl0ZScgKTtcclxuICAgIHRoaXMuaGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eSA9IG9wdGlvbnMuaGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eSB8fCBuZXcgUHJvcGVydHkoICd3aGl0ZScgKTtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IHRoaXMucG9zaXRpb24uY29weSgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5faXNEaXNwb3NlZCwgJ2F0dGVtcHRlZCB0byBkaXNwb3NlIGFnYWluJyApO1xyXG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGlzRGlzcG9zZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVTNSBnZXR0ZXJzIGFuZCBzZXR0ZXJzIGZvciBwYXJ0aWNsZSBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxlZnQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMucG9zaXRpb24ueCAtIHRoaXMucmFkaXVzOyB9XHJcblxyXG4gIHB1YmxpYyBzZXQgbGVmdCggdmFsdWU6IG51bWJlciApIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb25YWSggdmFsdWUgKyB0aGlzLnJhZGl1cywgdGhpcy5wb3NpdGlvbi55ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHJpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnJhZGl1czsgfVxyXG5cclxuICBwdWJsaWMgc2V0IHJpZ2h0KCB2YWx1ZTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblhZKCB2YWx1ZSAtIHRoaXMucmFkaXVzLCB0aGlzLnBvc2l0aW9uLnkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdG9wKCk6IG51bWJlciB7IHJldHVybiB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnJhZGl1czsgfVxyXG5cclxuICBwdWJsaWMgc2V0IHRvcCggdmFsdWU6IG51bWJlciApIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb25YWSggdGhpcy5wb3NpdGlvbi54LCB2YWx1ZSAtIHRoaXMucmFkaXVzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGJvdHRvbSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5yYWRpdXM7IH1cclxuXHJcbiAgcHVibGljIHNldCBib3R0b20oIHZhbHVlOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uWFkoIHRoaXMucG9zaXRpb24ueCwgdmFsdWUgKyB0aGlzLnJhZGl1cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUga2luZXRpYyBlbmVyZ3kgb2YgdGhpcyBwYXJ0aWNsZS5cclxuICAgKiBAcmV0dXJucyBBTVUgKiBwbV4yIC8gcHNeMlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRLaW5ldGljRW5lcmd5KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gMC41ICogdGhpcy5tYXNzICogdGhpcy52ZWxvY2l0eS5tYWduaXR1ZGVTcXVhcmVkOyAvLyBLRSA9ICgxLzIpICogbSAqIHx2fF4yXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0aGlzIHBhcnRpY2xlIGJ5IG9uZSB0aW1lIHN0ZXAuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBkZWx0YSwgaW4gcHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGR0ID4gMCwgYGludmFsaWQgZHQ6ICR7ZHR9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX2lzRGlzcG9zZWQsICdhdHRlbXB0ZWQgdG8gc3RlcCBhIGRpc3Bvc2VkIFBhcnRpY2xlJyApO1xyXG5cclxuICAgIHRoaXMuc2V0UG9zaXRpb25YWSggdGhpcy5wb3NpdGlvbi54ICsgZHQgKiB0aGlzLnZlbG9jaXR5LngsIHRoaXMucG9zaXRpb24ueSArIGR0ICogdGhpcy52ZWxvY2l0eS55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgcGFydGljbGUncyBwb3NpdGlvbiBhbmQgcmVtZW1iZXJzIHRoZSBwcmV2aW91cyBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UG9zaXRpb25YWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24uc2V0WFkoIHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55ICk7XHJcbiAgICB0aGlzLnBvc2l0aW9uLnNldFhZKCB4LCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoaXMgcGFydGljbGUncyB2ZWxvY2l0eSBpbiBDYXJ0ZXNpYW4gY29vcmRpbmF0ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFZlbG9jaXR5WFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy52ZWxvY2l0eS5zZXRYWSggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIHBhcnRpY2xlJ3MgdmVsb2NpdHkgaW4gcG9sYXIgY29vcmRpbmF0ZXMuXHJcbiAgICogQHBhcmFtIG1hZ25pdHVkZSAtIHBtIC8gcHNcclxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXHJcbiAgICovXHJcbiAgcHVibGljIHNldFZlbG9jaXR5UG9sYXIoIG1hZ25pdHVkZTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWFnbml0dWRlID49IDAsIGBpbnZhbGlkIG1hZ25pdHVkZTogJHttYWduaXR1ZGV9YCApO1xyXG4gICAgdGhpcy5zZXRWZWxvY2l0eVhZKCBtYWduaXR1ZGUgKiBNYXRoLmNvcyggYW5nbGUgKSwgbWFnbml0dWRlICogTWF0aC5zaW4oIGFuZ2xlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhpcyBwYXJ0aWNsZSdzIHZlbG9jaXR5IG1hZ25pdHVkZSAoc3BlZWQpLlxyXG4gICAqIEBwYXJhbSBtYWduaXR1ZGUgLSBwbS9wc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRWZWxvY2l0eU1hZ25pdHVkZSggbWFnbml0dWRlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYWduaXR1ZGUgPj0gMCwgYGludmFsaWQgbWFnbml0dWRlOiAke21hZ25pdHVkZX1gICk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LnNldE1hZ25pdHVkZSggbWFnbml0dWRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTY2FsZXMgdGhpcyBwYXJ0aWNsZSdzIHZlbG9jaXR5LiBVc2VkIHdoZW4gaGVhdC9jb29sIGlzIGFwcGxpZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHNjYWxlVmVsb2NpdHkoIHNjYWxlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzY2FsZSA+IDAsIGBpbnZhbGlkIHNjYWxlOiAke3NjYWxlfWAgKTtcclxuICAgIHRoaXMudmVsb2NpdHkubXVsdGlwbHkoIHNjYWxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoaXMgcGFydGljbGUgY29udGFjdCBhbm90aGVyIHBhcnRpY2xlIG5vdz9cclxuICAgKi9cclxuICBwdWJsaWMgY29udGFjdHNQYXJ0aWNsZSggcGFydGljbGU6IFBhcnRpY2xlICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uZGlzdGFuY2UoIHBhcnRpY2xlLnBvc2l0aW9uICkgPD0gKCB0aGlzLnJhZGl1cyArIHBhcnRpY2xlLnJhZGl1cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlkIHRoaXMgcGFydGljbGUgY29udGFjdCBhbm90aGVyIHBhcnRpY2xlIG9uIHRoZSBwcmV2aW91cyB0aW1lIHN0ZXA/IFByZXZlbnRzIGNvbGxlY3Rpb25zIG9mIHBhcnRpY2xlc1xyXG4gICAqIHRoYXQgYXJlIGVtaXR0ZWQgZnJvbSB0aGUgcHVtcCBmcm9tIGNvbGxpZGluZyB1bnRpbCB0aGV5IHNwcmVhZCBvdXQuICBUaGlzIHdhcyBib3Jyb3dlZCBmcm9tIHRoZSBKYXZhXHJcbiAgICogaW1wbGVtZW50YXRpb24sIGFuZCBtYWtlcyB0aGUgY29sbGlzaW9uIGJlaGF2aW9yIG1vcmUgbmF0dXJhbCBsb29raW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb250YWN0ZWRQYXJ0aWNsZSggcGFydGljbGU6IFBhcnRpY2xlICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMucHJldmlvdXNQb3NpdGlvbi5kaXN0YW5jZSggcGFydGljbGUucHJldmlvdXNQb3NpdGlvbiApIDw9ICggdGhpcy5yYWRpdXMgKyBwYXJ0aWNsZS5yYWRpdXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhpcyBwYXJ0aWNsZSBpbnRlcnNlY3QgdGhlIHNwZWNpZmllZCBib3VuZHMsIGluY2x1ZGluZyBlZGdlcz8gVGhpcyBpbXBsZW1lbnRhdGlvbiB3YXMgYWRhcHRlZFxyXG4gICAqIGZyb20gQm91bmRzMi5pbnRlcnNlY3RzQm91bmRzLCByZW1vdmVkIE1hdGgubWF4IGFuZCBNYXRoLm1pbiBjYWxscyBiZWNhdXNlIHRoaXMgd2lsbCBiZSBjYWxsZWQgdGhvdXNhbmRzXHJcbiAgICogb2YgdGltZXMgcGVyIHN0ZXAuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVyc2VjdHNCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG1pblggPSAoIHRoaXMubGVmdCA+IGJvdW5kcy5taW5YICkgPyB0aGlzLmxlZnQgOiBib3VuZHMubWluWDtcclxuICAgIGNvbnN0IG1pblkgPSAoIHRoaXMuYm90dG9tID4gYm91bmRzLm1pblkgKSA/IHRoaXMuYm90dG9tIDogYm91bmRzLm1pblk7XHJcbiAgICBjb25zdCBtYXhYID0gKCB0aGlzLnJpZ2h0IDwgYm91bmRzLm1heFggKSA/IHRoaXMucmlnaHQgOiBib3VuZHMubWF4WDtcclxuICAgIGNvbnN0IG1heFkgPSAoIHRoaXMudG9wIDwgYm91bmRzLm1heFkgKSA/IHRoaXMudG9wIDogYm91bmRzLm1heFk7XHJcbiAgICByZXR1cm4gKCBtYXhYIC0gbWluWCApID49IDAgJiYgKCBtYXhZIC0gbWluWSA+PSAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBwYXJ0aWNsZS4gRm9yIGRlYnVnZ2luZyBvbmx5LCBkbyBub3QgcmVseSBvbiBmb3JtYXQuXHJcbiAgICovXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYFBhcnRpY2xlW3Bvc2l0aW9uOigke3RoaXMucG9zaXRpb24ueH0sJHt0aGlzLnBvc2l0aW9uLnl9KSBtYXNzOiR7dGhpcy5tYXNzfSByYWRpdXM6JHt0aGlzLnJhZGl1c31dYDtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdQYXJ0aWNsZScsIFBhcnRpY2xlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUV0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFFN0QsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFXakUsZUFBZSxNQUFNQyxRQUFRLENBQUM7RUFFNUI7RUFDcUI7RUFDRTs7RUFLWTtFQUNRO0VBQ1I7O0VBSTVCQyxXQUFXQSxDQUFFQyxlQUFpQyxFQUFHO0lBRXRELE1BQU1DLE9BQU8sR0FBR04sU0FBUyxDQUErQixDQUFDLENBQUU7TUFFekQ7TUFDQU8sSUFBSSxFQUFFTCxzQkFBc0IsQ0FBQ00sVUFBVSxDQUFDQyxZQUFZO01BQ3BEQyxNQUFNLEVBQUVSLHNCQUFzQixDQUFDUyxZQUFZLENBQUNGO0lBQzlDLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixJQUFJLENBQUNFLElBQUksR0FBR0QsT0FBTyxDQUFDQyxJQUFJO0lBQ3hCLElBQUksQ0FBQ0csTUFBTSxHQUFHSixPQUFPLENBQUNJLE1BQU07SUFDNUIsSUFBSSxDQUFDRSxhQUFhLEdBQUdOLE9BQU8sQ0FBQ00sYUFBYSxJQUFJLElBQUlkLFFBQVEsQ0FBRSxPQUFRLENBQUM7SUFDckUsSUFBSSxDQUFDZSxzQkFBc0IsR0FBR1AsT0FBTyxDQUFDTyxzQkFBc0IsSUFBSSxJQUFJZixRQUFRLENBQUUsT0FBUSxDQUFDO0lBRXZGLElBQUksQ0FBQ2dCLFFBQVEsR0FBRyxJQUFJZixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztJQUNuQyxJQUFJLENBQUNnQixnQkFBZ0IsR0FBRyxJQUFJLENBQUNELFFBQVEsQ0FBQ0UsSUFBSSxDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSWxCLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBRW5DLElBQUksQ0FBQ21CLFdBQVcsR0FBRyxLQUFLO0VBQzFCO0VBRU9DLE9BQU9BLENBQUEsRUFBUztJQUNyQkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNGLFdBQVcsRUFBRSw0QkFBNkIsQ0FBQztJQUNuRSxJQUFJLENBQUNBLFdBQVcsR0FBRyxJQUFJO0VBQ3pCO0VBRUEsSUFBV0csVUFBVUEsQ0FBQSxFQUFZO0lBQy9CLE9BQU8sSUFBSSxDQUFDSCxXQUFXO0VBQ3pCOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLElBQVdJLElBQUlBLENBQUEsRUFBVztJQUFFLE9BQU8sSUFBSSxDQUFDUixRQUFRLENBQUNTLENBQUMsR0FBRyxJQUFJLENBQUNiLE1BQU07RUFBRTtFQUVsRSxJQUFXWSxJQUFJQSxDQUFFRSxLQUFhLEVBQUc7SUFDL0IsSUFBSSxDQUFDQyxhQUFhLENBQUVELEtBQUssR0FBRyxJQUFJLENBQUNkLE1BQU0sRUFBRSxJQUFJLENBQUNJLFFBQVEsQ0FBQ1ksQ0FBRSxDQUFDO0VBQzVEO0VBRUEsSUFBV0MsS0FBS0EsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUNiLFFBQVEsQ0FBQ1MsQ0FBQyxHQUFHLElBQUksQ0FBQ2IsTUFBTTtFQUFFO0VBRW5FLElBQVdpQixLQUFLQSxDQUFFSCxLQUFhLEVBQUc7SUFDaEMsSUFBSSxDQUFDQyxhQUFhLENBQUVELEtBQUssR0FBRyxJQUFJLENBQUNkLE1BQU0sRUFBRSxJQUFJLENBQUNJLFFBQVEsQ0FBQ1ksQ0FBRSxDQUFDO0VBQzVEO0VBRUEsSUFBV0UsR0FBR0EsQ0FBQSxFQUFXO0lBQUUsT0FBTyxJQUFJLENBQUNkLFFBQVEsQ0FBQ1ksQ0FBQyxHQUFHLElBQUksQ0FBQ2hCLE1BQU07RUFBRTtFQUVqRSxJQUFXa0IsR0FBR0EsQ0FBRUosS0FBYSxFQUFHO0lBQzlCLElBQUksQ0FBQ0MsYUFBYSxDQUFFLElBQUksQ0FBQ1gsUUFBUSxDQUFDUyxDQUFDLEVBQUVDLEtBQUssR0FBRyxJQUFJLENBQUNkLE1BQU8sQ0FBQztFQUM1RDtFQUVBLElBQVdtQixNQUFNQSxDQUFBLEVBQVc7SUFBRSxPQUFPLElBQUksQ0FBQ2YsUUFBUSxDQUFDWSxDQUFDLEdBQUcsSUFBSSxDQUFDaEIsTUFBTTtFQUFFO0VBRXBFLElBQVdtQixNQUFNQSxDQUFFTCxLQUFhLEVBQUc7SUFDakMsSUFBSSxDQUFDQyxhQUFhLENBQUUsSUFBSSxDQUFDWCxRQUFRLENBQUNTLENBQUMsRUFBRUMsS0FBSyxHQUFHLElBQUksQ0FBQ2QsTUFBTyxDQUFDO0VBQzVEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NvQixnQkFBZ0JBLENBQUEsRUFBVztJQUNoQyxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUN2QixJQUFJLEdBQUcsSUFBSSxDQUFDVSxRQUFRLENBQUNjLGdCQUFnQixDQUFDLENBQUM7RUFDM0Q7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0MsSUFBSUEsQ0FBRUMsRUFBVSxFQUFTO0lBQzlCYixNQUFNLElBQUlBLE1BQU0sQ0FBRWEsRUFBRSxHQUFHLENBQUMsRUFBRyxlQUFjQSxFQUFHLEVBQUUsQ0FBQztJQUMvQ2IsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNGLFdBQVcsRUFBRSx1Q0FBd0MsQ0FBQztJQUU5RSxJQUFJLENBQUNPLGFBQWEsQ0FBRSxJQUFJLENBQUNYLFFBQVEsQ0FBQ1MsQ0FBQyxHQUFHVSxFQUFFLEdBQUcsSUFBSSxDQUFDaEIsUUFBUSxDQUFDTSxDQUFDLEVBQUUsSUFBSSxDQUFDVCxRQUFRLENBQUNZLENBQUMsR0FBR08sRUFBRSxHQUFHLElBQUksQ0FBQ2hCLFFBQVEsQ0FBQ1MsQ0FBRSxDQUFDO0VBQ3RHOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRCxhQUFhQSxDQUFFRixDQUFTLEVBQUVHLENBQVMsRUFBUztJQUNqRCxJQUFJLENBQUNYLGdCQUFnQixDQUFDbUIsS0FBSyxDQUFFLElBQUksQ0FBQ3BCLFFBQVEsQ0FBQ1MsQ0FBQyxFQUFFLElBQUksQ0FBQ1QsUUFBUSxDQUFDWSxDQUFFLENBQUM7SUFDL0QsSUFBSSxDQUFDWixRQUFRLENBQUNvQixLQUFLLENBQUVYLENBQUMsRUFBRUcsQ0FBRSxDQUFDO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTUyxhQUFhQSxDQUFFWixDQUFTLEVBQUVHLENBQVMsRUFBUztJQUNqRCxJQUFJLENBQUNULFFBQVEsQ0FBQ2lCLEtBQUssQ0FBRVgsQ0FBQyxFQUFFRyxDQUFFLENBQUM7RUFDN0I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTVSxnQkFBZ0JBLENBQUVDLFNBQWlCLEVBQUVDLEtBQWEsRUFBUztJQUNoRWxCLE1BQU0sSUFBSUEsTUFBTSxDQUFFaUIsU0FBUyxJQUFJLENBQUMsRUFBRyxzQkFBcUJBLFNBQVUsRUFBRSxDQUFDO0lBQ3JFLElBQUksQ0FBQ0YsYUFBYSxDQUFFRSxTQUFTLEdBQUdFLElBQUksQ0FBQ0MsR0FBRyxDQUFFRixLQUFNLENBQUMsRUFBRUQsU0FBUyxHQUFHRSxJQUFJLENBQUNFLEdBQUcsQ0FBRUgsS0FBTSxDQUFFLENBQUM7RUFDcEY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0ksb0JBQW9CQSxDQUFFTCxTQUFpQixFQUFTO0lBQ3JEakIsTUFBTSxJQUFJQSxNQUFNLENBQUVpQixTQUFTLElBQUksQ0FBQyxFQUFHLHNCQUFxQkEsU0FBVSxFQUFFLENBQUM7SUFDckUsSUFBSSxDQUFDcEIsUUFBUSxDQUFDMEIsWUFBWSxDQUFFTixTQUFVLENBQUM7RUFDekM7O0VBRUE7QUFDRjtBQUNBO0VBQ1NPLGFBQWFBLENBQUVDLEtBQWEsRUFBUztJQUMxQ3pCLE1BQU0sSUFBSUEsTUFBTSxDQUFFeUIsS0FBSyxHQUFHLENBQUMsRUFBRyxrQkFBaUJBLEtBQU0sRUFBRSxDQUFDO0lBQ3hELElBQUksQ0FBQzVCLFFBQVEsQ0FBQzZCLFFBQVEsQ0FBRUQsS0FBTSxDQUFDO0VBQ2pDOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRSxnQkFBZ0JBLENBQUVDLFFBQWtCLEVBQVk7SUFDckQsT0FBTyxJQUFJLENBQUNsQyxRQUFRLENBQUNtQyxRQUFRLENBQUVELFFBQVEsQ0FBQ2xDLFFBQVMsQ0FBQyxJQUFNLElBQUksQ0FBQ0osTUFBTSxHQUFHc0MsUUFBUSxDQUFDdEMsTUFBUTtFQUN6Rjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1N3QyxpQkFBaUJBLENBQUVGLFFBQWtCLEVBQVk7SUFDdEQsT0FBTyxJQUFJLENBQUNqQyxnQkFBZ0IsQ0FBQ2tDLFFBQVEsQ0FBRUQsUUFBUSxDQUFDakMsZ0JBQWlCLENBQUMsSUFBTSxJQUFJLENBQUNMLE1BQU0sR0FBR3NDLFFBQVEsQ0FBQ3RDLE1BQVE7RUFDekc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTeUMsZ0JBQWdCQSxDQUFFQyxNQUFlLEVBQVk7SUFDbEQsTUFBTUMsSUFBSSxHQUFLLElBQUksQ0FBQy9CLElBQUksR0FBRzhCLE1BQU0sQ0FBQ0MsSUFBSSxHQUFLLElBQUksQ0FBQy9CLElBQUksR0FBRzhCLE1BQU0sQ0FBQ0MsSUFBSTtJQUNsRSxNQUFNQyxJQUFJLEdBQUssSUFBSSxDQUFDekIsTUFBTSxHQUFHdUIsTUFBTSxDQUFDRSxJQUFJLEdBQUssSUFBSSxDQUFDekIsTUFBTSxHQUFHdUIsTUFBTSxDQUFDRSxJQUFJO0lBQ3RFLE1BQU1DLElBQUksR0FBSyxJQUFJLENBQUM1QixLQUFLLEdBQUd5QixNQUFNLENBQUNHLElBQUksR0FBSyxJQUFJLENBQUM1QixLQUFLLEdBQUd5QixNQUFNLENBQUNHLElBQUk7SUFDcEUsTUFBTUMsSUFBSSxHQUFLLElBQUksQ0FBQzVCLEdBQUcsR0FBR3dCLE1BQU0sQ0FBQ0ksSUFBSSxHQUFLLElBQUksQ0FBQzVCLEdBQUcsR0FBR3dCLE1BQU0sQ0FBQ0ksSUFBSTtJQUNoRSxPQUFTRCxJQUFJLEdBQUdGLElBQUksSUFBTSxDQUFDLElBQU1HLElBQUksR0FBR0YsSUFBSSxJQUFJLENBQUc7RUFDckQ7O0VBRUE7QUFDRjtBQUNBO0VBQ1NHLFFBQVFBLENBQUEsRUFBVztJQUN4QixPQUFRLHNCQUFxQixJQUFJLENBQUMzQyxRQUFRLENBQUNTLENBQUUsSUFBRyxJQUFJLENBQUNULFFBQVEsQ0FBQ1ksQ0FBRSxVQUFTLElBQUksQ0FBQ25CLElBQUssV0FBVSxJQUFJLENBQUNHLE1BQU8sR0FBRTtFQUM3RztBQUNGO0FBRUFULGFBQWEsQ0FBQ3lELFFBQVEsQ0FBRSxVQUFVLEVBQUV2RCxRQUFTLENBQUMifQ==