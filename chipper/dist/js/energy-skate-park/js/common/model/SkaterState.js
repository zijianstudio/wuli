// Copyright 2013-2021, University of Colorado Boulder

/**
 * Immutable snapshot of skater state for updating the physics. To improve performance, operate solely on a skaterState
 * instance without updating the real skater, so that the skater model itself can be set only once, and trigger
 * callbacks only once (no matter how many subdivisions). This can also facilitate debugging and ensuring energy is
 * conserved from one step to another. Another reason this class is valuable is to create and evaluate proposed states
 * before applying them to the live model. Finally, this class is used to support simulation playback or inspection as
 * many states can be stored, inspected, or replayed in time.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import energySkatePark from '../../energySkatePark.js';
class SkaterState {
  /**
   * Create a SkaterSate from a SkaterState or Skater
   * @param {Skater|SkaterState} source
   */
  constructor(source) {
    this.setState(source);
  }

  /**
   * Create a new SkaterState.
   * @param {Skater|SkaterState} source the initial values to use
   * @returns {SkaterState} the new SkaterState
   *
   * @private
   */
  setState(source) {
    // Handle the case of a skater passed in (which has a position vector) or a SkaterState passed in, which has a number
    if (source.positionProperty) {
      this.positionX = source.positionProperty.value.x;
      this.positionY = source.positionProperty.value.y;
      this.velocityX = source.velocityProperty.value.x;
      this.velocityY = source.velocityProperty.value.y;
    } else {
      this.positionX = source.positionX;
      this.positionY = source.positionY;
      this.velocityX = source.velocityX;
      this.velocityY = source.velocityY;
    }

    // This code is called many times from the physics loop, so must be optimized for speed and memory
    // Special handling for values that can be null, false or zero
    this.gravity = getValue('gravity', source);
    this.referenceHeight = getValue('referenceHeight', source);
    this.mass = getValue('mass', source);
    this.track = getValue('track', source);
    this.angle = getValue('angle', source);
    this.onTopSideOfTrack = getValue('onTopSideOfTrack', source);
    this.parametricPosition = getValue('parametricPosition', source);
    this.parametricSpeed = getValue('parametricSpeed', source);
    this.dragging = getValue('dragging', source);
    this.thermalEnergy = getValue('thermalEnergy', source);

    // Some sanity tests
    assert && assert(isFinite(this.thermalEnergy));
    assert && assert(isFinite(this.velocityX));
    assert && assert(isFinite(this.velocityY));
    assert && assert(isFinite(this.parametricSpeed));
    assert && assert(this.thermalEnergy >= 0);
    return this;
  }

  /**
   * Get the total energy in this state. Computed directly instead of using other methods to (hopefully) improve
   * performance.
   * @public
   *
   * @returns {number}
   */
  getTotalEnergy() {
    return 0.5 * this.mass * (this.velocityX * this.velocityX + this.velocityY * this.velocityY) - this.mass * this.gravity * (this.positionY - this.referenceHeight) + this.thermalEnergy;
  }

  /**
   * Get the kinetic energy with KE = 1/2 * m * v^2
   * @public
   *
   * @returns {number}
   */
  getKineticEnergy() {
    return 0.5 * this.mass * (this.velocityX * this.velocityX + this.velocityY * this.velocityY);
  }

  /**
   * Get the potential energy with PE = mgh.
   * @public
   *
   * @returns {number}
   */
  getPotentialEnergy() {
    return -this.mass * this.gravity * (this.positionY - this.referenceHeight);
  }

  /**
   * Get the curvature at the skater's point on the track, by setting it to the pass-by-reference argument.
   *
   * @public
   * @param {Object} curvature - description of curvature at a point, looks like
   *                             {r: {number}, x: {number}, y: {number} }
   */
  getCurvature(curvature) {
    this.track.getCurvature(this.parametricPosition, curvature);
  }

  /**
   * Apply skate to skater. Only set values that have changed.
   * @public
   *
   * @param {Skater} skater
   */
  setToSkater(skater) {
    skater.trackProperty.value = this.track;

    // Set property values manually to avoid allocations, see #50
    skater.positionProperty.value.x = this.positionX;
    skater.positionProperty.value.y = this.positionY;
    skater.positionProperty.notifyListenersStatic();
    skater.velocityProperty.value.x = this.velocityX;
    skater.velocityProperty.value.y = this.velocityY;
    skater.velocityProperty.notifyListenersStatic();
    skater.parametricPositionProperty.value = this.parametricPosition;
    skater.parametricSpeedProperty.value = this.parametricSpeed;
    skater.thermalEnergyProperty.value = this.thermalEnergy;
    skater.onTopSideOfTrackProperty.value = this.onTopSideOfTrack;
    skater.massProperty.value = this.mass;
    skater.gravityMagnitudeProperty.value = Math.abs(this.gravity);
    skater.referenceHeightProperty.value = this.referenceHeight;

    // only an angle to restore if skater is attached to a track and skater is not being dragged
    skater.angleProperty.value = skater.trackProperty.value && !this.dragging ? skater.trackProperty.value.getViewAngleAt(this.parametricPosition) + (this.onTopSideOfTrack ? 0 : Math.PI) : this.angle;
    skater.updateEnergy();
  }

  /**
   * Create a new SkaterState with the new values. Provided as a convenience to avoid allocating options argument
   * (as in update).
   * @public
   *
   * @param {Track} track
   * @param {number} parametricSpeed
   * @returns {SkaterState}
   */
  updateTrackUD(track, parametricSpeed) {
    const state = new SkaterState(this);
    state.track = track;
    state.parametricSpeed = parametricSpeed;
    return state;
  }

  /**
   * Create a new SkaterState with the new values. Provided as a convenience to avoid allocating options argument
   * (as in update).
   * @public
   *
   * @param {number} parametricPosition
   * @param {number} parametricSpeed
   * @param {number} velocityX
   * @param {number} velocityY
   * @param {number} positionX
   * @param {number} positionY
   * @returns {SkaterState}
   */
  updateUUDVelocityPosition(parametricPosition, parametricSpeed, velocityX, velocityY, positionX, positionY) {
    const state = new SkaterState(this);
    state.parametricPosition = parametricPosition;
    state.parametricSpeed = parametricSpeed;
    state.velocityX = velocityX;
    state.velocityY = velocityY;
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Update the position, angle, skater side of track, and velocity of the skater state.
   * @public
   *
   * @param {number} positionX
   * @param {number} positionY
   * @param {number} angle
   * @param {number} onTopSideOfTrack
   * @param {number} velocityX
   * @param {number} velocityY
   * @returns {SkaterState}
   */
  updatePositionAngleUpVelocity(positionX, positionY, angle, onTopSideOfTrack, velocityX, velocityY) {
    const state = new SkaterState(this);
    state.angle = angle;
    state.onTopSideOfTrack = onTopSideOfTrack;
    state.velocityX = velocityX;
    state.velocityY = velocityY;
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Update the thermal energy.
   * @public
   *
   * @param {number} thermalEnergy
   * @returns {SkaterState}
   */
  updateThermalEnergy(thermalEnergy) {
    assert && assert(thermalEnergy >= 0);
    const state = new SkaterState(this);
    state.thermalEnergy = thermalEnergy;
    return state;
  }

  /**
   * Update the parametric position and position.
   * @public
   *
   * @param {Vector2} parametricPosition
   * @param {number} positionX
   * @param {number} positionY
   * @returns {SkaterState}
   */
  updateUPosition(parametricPosition, positionX, positionY) {
    const state = new SkaterState(this);
    state.parametricPosition = parametricPosition;
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Transition the SkaterState to the ground, updating thermal energy, angle, and velocity components
   * accordingly.
   * @public
   *
   * @param {number} thermalEnergy
   * @param {number} velocityX
   * @param {number} velocityY
   * @param {number} positionX
   * @param {number} positionY
   * @returns {SkaterState}
   */
  switchToGround(thermalEnergy, velocityX, velocityY, positionX, positionY) {
    assert && assert(thermalEnergy >= 0);
    const state = new SkaterState(this);
    state.thermalEnergy = thermalEnergy;
    state.track = null;
    state.onTopSideOfTrack = true;
    state.angle = 0;
    state.velocityX = velocityX;
    state.velocityY = velocityY;
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Strike the ground (usually through falling). Velocity is zeroed as the skater hits the ground.
   * @public
   *
   * @param {number} thermalEnergy
   * @param {number} positionX
   * @returns {SkaterState}
   */
  strikeGround(thermalEnergy, positionX) {
    assert && assert(thermalEnergy >= 0);
    const state = new SkaterState(this);
    state.thermalEnergy = thermalEnergy;
    state.positionX = positionX;
    state.positionY = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    state.angle = 0;
    state.onTopSideOfTrack = true;
    return state;
  }

  /**
   * Create an exact copy of this SkaterState.
   * @public
   *
   * @returns {SkaterState}
   */
  copy() {
    return new SkaterState(this);
  }

  /**
   * Leave the track by zeroing the parametric speed and setting track to null.
   * @public
   *
   * @returns {SkaterState}
   */
  leaveTrack() {
    const state = new SkaterState(this);
    state.parametricSpeed = 0;
    state.track = null;
    return state;
  }

  /**
   * Create a new SkaterState copied from this SkaterState, updating position.
   * @public
   *
   * @param {number} positionX
   * @param {number} positionY
   * @returns {SkaterState}
   */
  updatePosition(positionX, positionY) {
    const state = new SkaterState(this);
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Update velocity. Provided as a convenience method to avoid allocating objects with options (as in update).
   * @public
   *
   * @param {number} parametricSpeed
   * @param {number} velocityX
   * @param {number} velocityY
   *
   * @returns {SkaterState}
   */
  updateUDVelocity(parametricSpeed, velocityX, velocityY) {
    const state = new SkaterState(this);
    state.parametricSpeed = parametricSpeed;
    state.velocityX = velocityX;
    state.velocityY = velocityY;
    return state;
  }

  /**
   * Return a new skater state. New state is a copy of this SkaterState, with velocity and position updated to
   * reflect free fall.
   * @public
   *
   * @param {number} velocityX
   * @param {number} velocityY
   * @param {number} positionX
   * @param {number} positionY
   *
   * @returns {SkaterState}
   */
  continueFreeFall(velocityX, velocityY, positionX, positionY) {
    const state = new SkaterState(this);
    state.velocityX = velocityX;
    state.velocityY = velocityY;
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Return SkaterState to track, creating and returning a new SkaterState.
   * @public
   *
   * @param {number} thermalEnergy
   * @param {Track} track
   * @param {boolean} onTopSideOfTrack
   * @param {Vector2} parametricPosition
   * @param {number} parametricSpeed
   * @param {number} velocityX
   * @param {number} velocityY
   * @param {number} positionX
   * @param {number} positionY
   * @returns {SkaterState}
   */
  attachToTrack(thermalEnergy, track, onTopSideOfTrack, parametricPosition, parametricSpeed, velocityX, velocityY, positionX, positionY) {
    assert && assert(thermalEnergy >= 0);
    const state = new SkaterState(this);
    state.thermalEnergy = thermalEnergy;
    state.track = track;
    state.onTopSideOfTrack = onTopSideOfTrack;
    state.parametricPosition = parametricPosition;
    state.parametricSpeed = parametricSpeed;
    state.velocityX = velocityX;
    state.velocityY = velocityY;
    state.positionX = positionX;
    state.positionY = positionY;
    return state;
  }

  /**
   * Get the speed of this SkaterState, the magnitude of velocity.
   * @public
   *
   * @returns {number}
   */
  getSpeed() {
    return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
  }

  /**
   * Return a new Vector2 of this SkaterState's that does not reference this SkaterState's velocity.
   * @public
   *
   * @returns {Vector2}
   */
  getVelocity() {
    return new Vector2(this.velocityX, this.velocityY);
  }

  /**
   * Get the speed of this SkaterState from kinetic energy, using KE = 1/2 * m * v^2.
   * @public
   *
   * @param {number} kineticEnergy
   * @returns {number}
   */
  getSpeedFromEnergy(kineticEnergy) {
    return Math.sqrt(2 * Math.abs(kineticEnergy) / this.mass);
  }

  /**
   * Create a new Vector2 that contains the positionX/positionY of this SkaterState.
   * @public
   *
   *
   * @returns {Vector2}
   */
  getPosition() {
    return new Vector2(this.positionX, this.positionY);
  }
}

/**
 * @private
 *
 * @param{string} key
 * @param {Object} source
 * @returns {*}
 */
const getValue = (key, source) => {
  return typeof source[`${key}Property`] === 'object' ? source[`${key}Property`].value : source[key];
};
energySkatePark.register('SkaterState', SkaterState);
export default SkaterState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiZW5lcmd5U2thdGVQYXJrIiwiU2thdGVyU3RhdGUiLCJjb25zdHJ1Y3RvciIsInNvdXJjZSIsInNldFN0YXRlIiwicG9zaXRpb25Qcm9wZXJ0eSIsInBvc2l0aW9uWCIsInZhbHVlIiwieCIsInBvc2l0aW9uWSIsInkiLCJ2ZWxvY2l0eVgiLCJ2ZWxvY2l0eVByb3BlcnR5IiwidmVsb2NpdHlZIiwiZ3Jhdml0eSIsImdldFZhbHVlIiwicmVmZXJlbmNlSGVpZ2h0IiwibWFzcyIsInRyYWNrIiwiYW5nbGUiLCJvblRvcFNpZGVPZlRyYWNrIiwicGFyYW1ldHJpY1Bvc2l0aW9uIiwicGFyYW1ldHJpY1NwZWVkIiwiZHJhZ2dpbmciLCJ0aGVybWFsRW5lcmd5IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJnZXRUb3RhbEVuZXJneSIsImdldEtpbmV0aWNFbmVyZ3kiLCJnZXRQb3RlbnRpYWxFbmVyZ3kiLCJnZXRDdXJ2YXR1cmUiLCJjdXJ2YXR1cmUiLCJzZXRUb1NrYXRlciIsInNrYXRlciIsInRyYWNrUHJvcGVydHkiLCJub3RpZnlMaXN0ZW5lcnNTdGF0aWMiLCJwYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eSIsInBhcmFtZXRyaWNTcGVlZFByb3BlcnR5IiwidGhlcm1hbEVuZXJneVByb3BlcnR5Iiwib25Ub3BTaWRlT2ZUcmFja1Byb3BlcnR5IiwibWFzc1Byb3BlcnR5IiwiZ3Jhdml0eU1hZ25pdHVkZVByb3BlcnR5IiwiTWF0aCIsImFicyIsInJlZmVyZW5jZUhlaWdodFByb3BlcnR5IiwiYW5nbGVQcm9wZXJ0eSIsImdldFZpZXdBbmdsZUF0IiwiUEkiLCJ1cGRhdGVFbmVyZ3kiLCJ1cGRhdGVUcmFja1VEIiwic3RhdGUiLCJ1cGRhdGVVVURWZWxvY2l0eVBvc2l0aW9uIiwidXBkYXRlUG9zaXRpb25BbmdsZVVwVmVsb2NpdHkiLCJ1cGRhdGVUaGVybWFsRW5lcmd5IiwidXBkYXRlVVBvc2l0aW9uIiwic3dpdGNoVG9Hcm91bmQiLCJzdHJpa2VHcm91bmQiLCJjb3B5IiwibGVhdmVUcmFjayIsInVwZGF0ZVBvc2l0aW9uIiwidXBkYXRlVURWZWxvY2l0eSIsImNvbnRpbnVlRnJlZUZhbGwiLCJhdHRhY2hUb1RyYWNrIiwiZ2V0U3BlZWQiLCJzcXJ0IiwiZ2V0VmVsb2NpdHkiLCJnZXRTcGVlZEZyb21FbmVyZ3kiLCJraW5ldGljRW5lcmd5IiwiZ2V0UG9zaXRpb24iLCJrZXkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNrYXRlclN0YXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEltbXV0YWJsZSBzbmFwc2hvdCBvZiBza2F0ZXIgc3RhdGUgZm9yIHVwZGF0aW5nIHRoZSBwaHlzaWNzLiBUbyBpbXByb3ZlIHBlcmZvcm1hbmNlLCBvcGVyYXRlIHNvbGVseSBvbiBhIHNrYXRlclN0YXRlXHJcbiAqIGluc3RhbmNlIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHJlYWwgc2thdGVyLCBzbyB0aGF0IHRoZSBza2F0ZXIgbW9kZWwgaXRzZWxmIGNhbiBiZSBzZXQgb25seSBvbmNlLCBhbmQgdHJpZ2dlclxyXG4gKiBjYWxsYmFja3Mgb25seSBvbmNlIChubyBtYXR0ZXIgaG93IG1hbnkgc3ViZGl2aXNpb25zKS4gVGhpcyBjYW4gYWxzbyBmYWNpbGl0YXRlIGRlYnVnZ2luZyBhbmQgZW5zdXJpbmcgZW5lcmd5IGlzXHJcbiAqIGNvbnNlcnZlZCBmcm9tIG9uZSBzdGVwIHRvIGFub3RoZXIuIEFub3RoZXIgcmVhc29uIHRoaXMgY2xhc3MgaXMgdmFsdWFibGUgaXMgdG8gY3JlYXRlIGFuZCBldmFsdWF0ZSBwcm9wb3NlZCBzdGF0ZXNcclxuICogYmVmb3JlIGFwcGx5aW5nIHRoZW0gdG8gdGhlIGxpdmUgbW9kZWwuIEZpbmFsbHksIHRoaXMgY2xhc3MgaXMgdXNlZCB0byBzdXBwb3J0IHNpbXVsYXRpb24gcGxheWJhY2sgb3IgaW5zcGVjdGlvbiBhc1xyXG4gKiBtYW55IHN0YXRlcyBjYW4gYmUgc3RvcmVkLCBpbnNwZWN0ZWQsIG9yIHJlcGxheWVkIGluIHRpbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcblxyXG5jbGFzcyBTa2F0ZXJTdGF0ZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIFNrYXRlclNhdGUgZnJvbSBhIFNrYXRlclN0YXRlIG9yIFNrYXRlclxyXG4gICAqIEBwYXJhbSB7U2thdGVyfFNrYXRlclN0YXRlfSBzb3VyY2VcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc291cmNlICkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSggc291cmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgU2thdGVyU3RhdGUuXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJ8U2thdGVyU3RhdGV9IHNvdXJjZSB0aGUgaW5pdGlhbCB2YWx1ZXMgdG8gdXNlXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfSB0aGUgbmV3IFNrYXRlclN0YXRlXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHNldFN0YXRlKCBzb3VyY2UgKSB7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBjYXNlIG9mIGEgc2thdGVyIHBhc3NlZCBpbiAod2hpY2ggaGFzIGEgcG9zaXRpb24gdmVjdG9yKSBvciBhIFNrYXRlclN0YXRlIHBhc3NlZCBpbiwgd2hpY2ggaGFzIGEgbnVtYmVyXHJcbiAgICBpZiAoIHNvdXJjZS5wb3NpdGlvblByb3BlcnR5ICkge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uWCA9IHNvdXJjZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICAgIHRoaXMucG9zaXRpb25ZID0gc291cmNlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueTtcclxuXHJcbiAgICAgIHRoaXMudmVsb2NpdHlYID0gc291cmNlLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueDtcclxuICAgICAgdGhpcy52ZWxvY2l0eVkgPSBzb3VyY2UudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25YID0gc291cmNlLnBvc2l0aW9uWDtcclxuICAgICAgdGhpcy5wb3NpdGlvblkgPSBzb3VyY2UucG9zaXRpb25ZO1xyXG5cclxuICAgICAgdGhpcy52ZWxvY2l0eVggPSBzb3VyY2UudmVsb2NpdHlYO1xyXG4gICAgICB0aGlzLnZlbG9jaXR5WSA9IHNvdXJjZS52ZWxvY2l0eVk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBjb2RlIGlzIGNhbGxlZCBtYW55IHRpbWVzIGZyb20gdGhlIHBoeXNpY3MgbG9vcCwgc28gbXVzdCBiZSBvcHRpbWl6ZWQgZm9yIHNwZWVkIGFuZCBtZW1vcnlcclxuICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHZhbHVlcyB0aGF0IGNhbiBiZSBudWxsLCBmYWxzZSBvciB6ZXJvXHJcbiAgICB0aGlzLmdyYXZpdHkgPSBnZXRWYWx1ZSggJ2dyYXZpdHknLCBzb3VyY2UgKTtcclxuICAgIHRoaXMucmVmZXJlbmNlSGVpZ2h0ID0gZ2V0VmFsdWUoICdyZWZlcmVuY2VIZWlnaHQnLCBzb3VyY2UgKTtcclxuICAgIHRoaXMubWFzcyA9IGdldFZhbHVlKCAnbWFzcycsIHNvdXJjZSApO1xyXG4gICAgdGhpcy50cmFjayA9IGdldFZhbHVlKCAndHJhY2snLCBzb3VyY2UgKTtcclxuICAgIHRoaXMuYW5nbGUgPSBnZXRWYWx1ZSggJ2FuZ2xlJywgc291cmNlICk7XHJcbiAgICB0aGlzLm9uVG9wU2lkZU9mVHJhY2sgPSBnZXRWYWx1ZSggJ29uVG9wU2lkZU9mVHJhY2snLCBzb3VyY2UgKTtcclxuICAgIHRoaXMucGFyYW1ldHJpY1Bvc2l0aW9uID0gZ2V0VmFsdWUoICdwYXJhbWV0cmljUG9zaXRpb24nLCBzb3VyY2UgKTtcclxuICAgIHRoaXMucGFyYW1ldHJpY1NwZWVkID0gZ2V0VmFsdWUoICdwYXJhbWV0cmljU3BlZWQnLCBzb3VyY2UgKTtcclxuICAgIHRoaXMuZHJhZ2dpbmcgPSBnZXRWYWx1ZSggJ2RyYWdnaW5nJywgc291cmNlICk7XHJcbiAgICB0aGlzLnRoZXJtYWxFbmVyZ3kgPSBnZXRWYWx1ZSggJ3RoZXJtYWxFbmVyZ3knLCBzb3VyY2UgKTtcclxuXHJcbiAgICAvLyBTb21lIHNhbml0eSB0ZXN0c1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMudGhlcm1hbEVuZXJneSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy52ZWxvY2l0eVggKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMudmVsb2NpdHlZICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLnBhcmFtZXRyaWNTcGVlZCApICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50aGVybWFsRW5lcmd5ID49IDAgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgdG90YWwgZW5lcmd5IGluIHRoaXMgc3RhdGUuIENvbXB1dGVkIGRpcmVjdGx5IGluc3RlYWQgb2YgdXNpbmcgb3RoZXIgbWV0aG9kcyB0byAoaG9wZWZ1bGx5KSBpbXByb3ZlXHJcbiAgICogcGVyZm9ybWFuY2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRUb3RhbEVuZXJneSgpIHtcclxuICAgIHJldHVybiAwLjUgKiB0aGlzLm1hc3MgKiAoIHRoaXMudmVsb2NpdHlYICogdGhpcy52ZWxvY2l0eVggKyB0aGlzLnZlbG9jaXR5WSAqIHRoaXMudmVsb2NpdHlZICkgLSB0aGlzLm1hc3MgKiB0aGlzLmdyYXZpdHkgKiAoIHRoaXMucG9zaXRpb25ZIC0gdGhpcy5yZWZlcmVuY2VIZWlnaHQgKSArIHRoaXMudGhlcm1hbEVuZXJneTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUga2luZXRpYyBlbmVyZ3kgd2l0aCBLRSA9IDEvMiAqIG0gKiB2XjJcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEtpbmV0aWNFbmVyZ3koKSB7XHJcbiAgICByZXR1cm4gMC41ICogdGhpcy5tYXNzICogKCB0aGlzLnZlbG9jaXR5WCAqIHRoaXMudmVsb2NpdHlYICsgdGhpcy52ZWxvY2l0eVkgKiB0aGlzLnZlbG9jaXR5WSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwb3RlbnRpYWwgZW5lcmd5IHdpdGggUEUgPSBtZ2guXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRQb3RlbnRpYWxFbmVyZ3koKSB7XHJcbiAgICByZXR1cm4gLXRoaXMubWFzcyAqIHRoaXMuZ3Jhdml0eSAqICggdGhpcy5wb3NpdGlvblkgLSB0aGlzLnJlZmVyZW5jZUhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjdXJ2YXR1cmUgYXQgdGhlIHNrYXRlcidzIHBvaW50IG9uIHRoZSB0cmFjaywgYnkgc2V0dGluZyBpdCB0byB0aGUgcGFzcy1ieS1yZWZlcmVuY2UgYXJndW1lbnQuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGN1cnZhdHVyZSAtIGRlc2NyaXB0aW9uIG9mIGN1cnZhdHVyZSBhdCBhIHBvaW50LCBsb29rcyBsaWtlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyOiB7bnVtYmVyfSwgeDoge251bWJlcn0sIHk6IHtudW1iZXJ9IH1cclxuICAgKi9cclxuICBnZXRDdXJ2YXR1cmUoIGN1cnZhdHVyZSApIHtcclxuICAgIHRoaXMudHJhY2suZ2V0Q3VydmF0dXJlKCB0aGlzLnBhcmFtZXRyaWNQb3NpdGlvbiwgY3VydmF0dXJlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBseSBza2F0ZSB0byBza2F0ZXIuIE9ubHkgc2V0IHZhbHVlcyB0aGF0IGhhdmUgY2hhbmdlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NrYXRlcn0gc2thdGVyXHJcbiAgICovXHJcbiAgc2V0VG9Ta2F0ZXIoIHNrYXRlciApIHtcclxuICAgIHNrYXRlci50cmFja1Byb3BlcnR5LnZhbHVlID0gdGhpcy50cmFjaztcclxuXHJcbiAgICAvLyBTZXQgcHJvcGVydHkgdmFsdWVzIG1hbnVhbGx5IHRvIGF2b2lkIGFsbG9jYXRpb25zLCBzZWUgIzUwXHJcbiAgICBza2F0ZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ID0gdGhpcy5wb3NpdGlvblg7XHJcbiAgICBza2F0ZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ID0gdGhpcy5wb3NpdGlvblk7XHJcbiAgICBza2F0ZXIucG9zaXRpb25Qcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTtcclxuXHJcbiAgICBza2F0ZXIudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS54ID0gdGhpcy52ZWxvY2l0eVg7XHJcbiAgICBza2F0ZXIudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS55ID0gdGhpcy52ZWxvY2l0eVk7XHJcbiAgICBza2F0ZXIudmVsb2NpdHlQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTtcclxuXHJcbiAgICBza2F0ZXIucGFyYW1ldHJpY1Bvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLnBhcmFtZXRyaWNQb3NpdGlvbjtcclxuICAgIHNrYXRlci5wYXJhbWV0cmljU3BlZWRQcm9wZXJ0eS52YWx1ZSA9IHRoaXMucGFyYW1ldHJpY1NwZWVkO1xyXG4gICAgc2thdGVyLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudGhlcm1hbEVuZXJneTtcclxuICAgIHNrYXRlci5vblRvcFNpZGVPZlRyYWNrUHJvcGVydHkudmFsdWUgPSB0aGlzLm9uVG9wU2lkZU9mVHJhY2s7XHJcblxyXG4gICAgc2thdGVyLm1hc3NQcm9wZXJ0eS52YWx1ZSA9IHRoaXMubWFzcztcclxuICAgIHNrYXRlci5ncmF2aXR5TWFnbml0dWRlUHJvcGVydHkudmFsdWUgPSBNYXRoLmFicyggdGhpcy5ncmF2aXR5ICk7XHJcblxyXG4gICAgc2thdGVyLnJlZmVyZW5jZUhlaWdodFByb3BlcnR5LnZhbHVlID0gdGhpcy5yZWZlcmVuY2VIZWlnaHQ7XHJcblxyXG4gICAgLy8gb25seSBhbiBhbmdsZSB0byByZXN0b3JlIGlmIHNrYXRlciBpcyBhdHRhY2hlZCB0byBhIHRyYWNrIGFuZCBza2F0ZXIgaXMgbm90IGJlaW5nIGRyYWdnZWRcclxuICAgIHNrYXRlci5hbmdsZVByb3BlcnR5LnZhbHVlID0gKCBza2F0ZXIudHJhY2tQcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy5kcmFnZ2luZyApID8gc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUuZ2V0Vmlld0FuZ2xlQXQoIHRoaXMucGFyYW1ldHJpY1Bvc2l0aW9uICkgKyAoIHRoaXMub25Ub3BTaWRlT2ZUcmFjayA/IDAgOiBNYXRoLlBJICkgOiB0aGlzLmFuZ2xlO1xyXG4gICAgc2thdGVyLnVwZGF0ZUVuZXJneSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IFNrYXRlclN0YXRlIHdpdGggdGhlIG5ldyB2YWx1ZXMuIFByb3ZpZGVkIGFzIGEgY29udmVuaWVuY2UgdG8gYXZvaWQgYWxsb2NhdGluZyBvcHRpb25zIGFyZ3VtZW50XHJcbiAgICogKGFzIGluIHVwZGF0ZSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmFja30gdHJhY2tcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1ldHJpY1NwZWVkXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIHVwZGF0ZVRyYWNrVUQoIHRyYWNrLCBwYXJhbWV0cmljU3BlZWQgKSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTa2F0ZXJTdGF0ZSggdGhpcyApO1xyXG4gICAgc3RhdGUudHJhY2sgPSB0cmFjaztcclxuICAgIHN0YXRlLnBhcmFtZXRyaWNTcGVlZCA9IHBhcmFtZXRyaWNTcGVlZDtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBTa2F0ZXJTdGF0ZSB3aXRoIHRoZSBuZXcgdmFsdWVzLiBQcm92aWRlZCBhcyBhIGNvbnZlbmllbmNlIHRvIGF2b2lkIGFsbG9jYXRpbmcgb3B0aW9ucyBhcmd1bWVudFxyXG4gICAqIChhcyBpbiB1cGRhdGUpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbWV0cmljUG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1ldHJpY1NwZWVkXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlbG9jaXR5WFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvY2l0eVlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb25YXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWVxyXG4gICAqIEByZXR1cm5zIHtTa2F0ZXJTdGF0ZX1cclxuICAgKi9cclxuICB1cGRhdGVVVURWZWxvY2l0eVBvc2l0aW9uKCBwYXJhbWV0cmljUG9zaXRpb24sIHBhcmFtZXRyaWNTcGVlZCwgdmVsb2NpdHlYLCB2ZWxvY2l0eVksIHBvc2l0aW9uWCwgcG9zaXRpb25ZICkge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBuZXcgU2thdGVyU3RhdGUoIHRoaXMgKTtcclxuICAgIHN0YXRlLnBhcmFtZXRyaWNQb3NpdGlvbiA9IHBhcmFtZXRyaWNQb3NpdGlvbjtcclxuICAgIHN0YXRlLnBhcmFtZXRyaWNTcGVlZCA9IHBhcmFtZXRyaWNTcGVlZDtcclxuICAgIHN0YXRlLnZlbG9jaXR5WCA9IHZlbG9jaXR5WDtcclxuICAgIHN0YXRlLnZlbG9jaXR5WSA9IHZlbG9jaXR5WTtcclxuICAgIHN0YXRlLnBvc2l0aW9uWCA9IHBvc2l0aW9uWDtcclxuICAgIHN0YXRlLnBvc2l0aW9uWSA9IHBvc2l0aW9uWTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgcG9zaXRpb24sIGFuZ2xlLCBza2F0ZXIgc2lkZSBvZiB0cmFjaywgYW5kIHZlbG9jaXR5IG9mIHRoZSBza2F0ZXIgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NpdGlvbllcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb25Ub3BTaWRlT2ZUcmFja1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvY2l0eVhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVsb2NpdHlZXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIHVwZGF0ZVBvc2l0aW9uQW5nbGVVcFZlbG9jaXR5KCBwb3NpdGlvblgsIHBvc2l0aW9uWSwgYW5nbGUsIG9uVG9wU2lkZU9mVHJhY2ssIHZlbG9jaXR5WCwgdmVsb2NpdHlZICkge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBuZXcgU2thdGVyU3RhdGUoIHRoaXMgKTtcclxuICAgIHN0YXRlLmFuZ2xlID0gYW5nbGU7XHJcbiAgICBzdGF0ZS5vblRvcFNpZGVPZlRyYWNrID0gb25Ub3BTaWRlT2ZUcmFjaztcclxuICAgIHN0YXRlLnZlbG9jaXR5WCA9IHZlbG9jaXR5WDtcclxuICAgIHN0YXRlLnZlbG9jaXR5WSA9IHZlbG9jaXR5WTtcclxuICAgIHN0YXRlLnBvc2l0aW9uWCA9IHBvc2l0aW9uWDtcclxuICAgIHN0YXRlLnBvc2l0aW9uWSA9IHBvc2l0aW9uWTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgdGhlcm1hbCBlbmVyZ3kuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoZXJtYWxFbmVyZ3lcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgdXBkYXRlVGhlcm1hbEVuZXJneSggdGhlcm1hbEVuZXJneSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoZXJtYWxFbmVyZ3kgPj0gMCApO1xyXG5cclxuICAgIGNvbnN0IHN0YXRlID0gbmV3IFNrYXRlclN0YXRlKCB0aGlzICk7XHJcblxyXG4gICAgc3RhdGUudGhlcm1hbEVuZXJneSA9IHRoZXJtYWxFbmVyZ3k7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHBhcmFtZXRyaWMgcG9zaXRpb24gYW5kIHBvc2l0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NpdGlvbllcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgdXBkYXRlVVBvc2l0aW9uKCBwYXJhbWV0cmljUG9zaXRpb24sIHBvc2l0aW9uWCwgcG9zaXRpb25ZICkge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBuZXcgU2thdGVyU3RhdGUoIHRoaXMgKTtcclxuICAgIHN0YXRlLnBhcmFtZXRyaWNQb3NpdGlvbiA9IHBhcmFtZXRyaWNQb3NpdGlvbjtcclxuICAgIHN0YXRlLnBvc2l0aW9uWCA9IHBvc2l0aW9uWDtcclxuICAgIHN0YXRlLnBvc2l0aW9uWSA9IHBvc2l0aW9uWTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zaXRpb24gdGhlIFNrYXRlclN0YXRlIHRvIHRoZSBncm91bmQsIHVwZGF0aW5nIHRoZXJtYWwgZW5lcmd5LCBhbmdsZSwgYW5kIHZlbG9jaXR5IGNvbXBvbmVudHNcclxuICAgKiBhY2NvcmRpbmdseS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdGhlcm1hbEVuZXJneVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvY2l0eVhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVsb2NpdHlZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NpdGlvbllcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgc3dpdGNoVG9Hcm91bmQoIHRoZXJtYWxFbmVyZ3ksIHZlbG9jaXR5WCwgdmVsb2NpdHlZLCBwb3NpdGlvblgsIHBvc2l0aW9uWSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoZXJtYWxFbmVyZ3kgPj0gMCApO1xyXG5cclxuICAgIGNvbnN0IHN0YXRlID0gbmV3IFNrYXRlclN0YXRlKCB0aGlzICk7XHJcbiAgICBzdGF0ZS50aGVybWFsRW5lcmd5ID0gdGhlcm1hbEVuZXJneTtcclxuICAgIHN0YXRlLnRyYWNrID0gbnVsbDtcclxuICAgIHN0YXRlLm9uVG9wU2lkZU9mVHJhY2sgPSB0cnVlO1xyXG4gICAgc3RhdGUuYW5nbGUgPSAwO1xyXG4gICAgc3RhdGUudmVsb2NpdHlYID0gdmVsb2NpdHlYO1xyXG4gICAgc3RhdGUudmVsb2NpdHlZID0gdmVsb2NpdHlZO1xyXG4gICAgc3RhdGUucG9zaXRpb25YID0gcG9zaXRpb25YO1xyXG4gICAgc3RhdGUucG9zaXRpb25ZID0gcG9zaXRpb25ZO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RyaWtlIHRoZSBncm91bmQgKHVzdWFsbHkgdGhyb3VnaCBmYWxsaW5nKS4gVmVsb2NpdHkgaXMgemVyb2VkIGFzIHRoZSBza2F0ZXIgaGl0cyB0aGUgZ3JvdW5kLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGVybWFsRW5lcmd5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWFxyXG4gICAqIEByZXR1cm5zIHtTa2F0ZXJTdGF0ZX1cclxuICAgKi9cclxuICBzdHJpa2VHcm91bmQoIHRoZXJtYWxFbmVyZ3ksIHBvc2l0aW9uWCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoZXJtYWxFbmVyZ3kgPj0gMCApO1xyXG5cclxuICAgIGNvbnN0IHN0YXRlID0gbmV3IFNrYXRlclN0YXRlKCB0aGlzICk7XHJcbiAgICBzdGF0ZS50aGVybWFsRW5lcmd5ID0gdGhlcm1hbEVuZXJneTtcclxuICAgIHN0YXRlLnBvc2l0aW9uWCA9IHBvc2l0aW9uWDtcclxuICAgIHN0YXRlLnBvc2l0aW9uWSA9IDA7XHJcbiAgICBzdGF0ZS52ZWxvY2l0eVggPSAwO1xyXG4gICAgc3RhdGUudmVsb2NpdHlZID0gMDtcclxuICAgIHN0YXRlLmFuZ2xlID0gMDtcclxuICAgIHN0YXRlLm9uVG9wU2lkZU9mVHJhY2sgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuIGV4YWN0IGNvcHkgb2YgdGhpcyBTa2F0ZXJTdGF0ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgY29weSgpIHtcclxuICAgIHJldHVybiBuZXcgU2thdGVyU3RhdGUoIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExlYXZlIHRoZSB0cmFjayBieSB6ZXJvaW5nIHRoZSBwYXJhbWV0cmljIHNwZWVkIGFuZCBzZXR0aW5nIHRyYWNrIHRvIG51bGwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIGxlYXZlVHJhY2soKSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTa2F0ZXJTdGF0ZSggdGhpcyApO1xyXG4gICAgc3RhdGUucGFyYW1ldHJpY1NwZWVkID0gMDtcclxuICAgIHN0YXRlLnRyYWNrID0gbnVsbDtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBTa2F0ZXJTdGF0ZSBjb3BpZWQgZnJvbSB0aGlzIFNrYXRlclN0YXRlLCB1cGRhdGluZyBwb3NpdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb25YXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWVxyXG4gICAqIEByZXR1cm5zIHtTa2F0ZXJTdGF0ZX1cclxuICAgKi9cclxuICB1cGRhdGVQb3NpdGlvbiggcG9zaXRpb25YLCBwb3NpdGlvblkgKSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTa2F0ZXJTdGF0ZSggdGhpcyApO1xyXG4gICAgc3RhdGUucG9zaXRpb25YID0gcG9zaXRpb25YO1xyXG4gICAgc3RhdGUucG9zaXRpb25ZID0gcG9zaXRpb25ZO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHZlbG9jaXR5LiBQcm92aWRlZCBhcyBhIGNvbnZlbmllbmNlIG1ldGhvZCB0byBhdm9pZCBhbGxvY2F0aW5nIG9iamVjdHMgd2l0aCBvcHRpb25zIChhcyBpbiB1cGRhdGUpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbWV0cmljU3BlZWRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVsb2NpdHlYXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlbG9jaXR5WVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIHVwZGF0ZVVEVmVsb2NpdHkoIHBhcmFtZXRyaWNTcGVlZCwgdmVsb2NpdHlYLCB2ZWxvY2l0eVkgKSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTa2F0ZXJTdGF0ZSggdGhpcyApO1xyXG4gICAgc3RhdGUucGFyYW1ldHJpY1NwZWVkID0gcGFyYW1ldHJpY1NwZWVkO1xyXG4gICAgc3RhdGUudmVsb2NpdHlYID0gdmVsb2NpdHlYO1xyXG4gICAgc3RhdGUudmVsb2NpdHlZID0gdmVsb2NpdHlZO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGEgbmV3IHNrYXRlciBzdGF0ZS4gTmV3IHN0YXRlIGlzIGEgY29weSBvZiB0aGlzIFNrYXRlclN0YXRlLCB3aXRoIHZlbG9jaXR5IGFuZCBwb3NpdGlvbiB1cGRhdGVkIHRvXHJcbiAgICogcmVmbGVjdCBmcmVlIGZhbGwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlbG9jaXR5WFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvY2l0eVlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb25YXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIGNvbnRpbnVlRnJlZUZhbGwoIHZlbG9jaXR5WCwgdmVsb2NpdHlZLCBwb3NpdGlvblgsIHBvc2l0aW9uWSApIHtcclxuICAgIGNvbnN0IHN0YXRlID0gbmV3IFNrYXRlclN0YXRlKCB0aGlzICk7XHJcbiAgICBzdGF0ZS52ZWxvY2l0eVggPSB2ZWxvY2l0eVg7XHJcbiAgICBzdGF0ZS52ZWxvY2l0eVkgPSB2ZWxvY2l0eVk7XHJcbiAgICBzdGF0ZS5wb3NpdGlvblggPSBwb3NpdGlvblg7XHJcbiAgICBzdGF0ZS5wb3NpdGlvblkgPSBwb3NpdGlvblk7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gU2thdGVyU3RhdGUgdG8gdHJhY2ssIGNyZWF0aW5nIGFuZCByZXR1cm5pbmcgYSBuZXcgU2thdGVyU3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoZXJtYWxFbmVyZ3lcclxuICAgKiBAcGFyYW0ge1RyYWNrfSB0cmFja1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gb25Ub3BTaWRlT2ZUcmFja1xyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBhcmFtZXRyaWNTcGVlZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZWxvY2l0eVhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVsb2NpdHlZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NpdGlvbllcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgYXR0YWNoVG9UcmFjayggdGhlcm1hbEVuZXJneSwgdHJhY2ssIG9uVG9wU2lkZU9mVHJhY2ssIHBhcmFtZXRyaWNQb3NpdGlvbiwgcGFyYW1ldHJpY1NwZWVkLCB2ZWxvY2l0eVgsIHZlbG9jaXR5WSwgcG9zaXRpb25YLCBwb3NpdGlvblkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGVybWFsRW5lcmd5ID49IDAgKTtcclxuXHJcbiAgICBjb25zdCBzdGF0ZSA9IG5ldyBTa2F0ZXJTdGF0ZSggdGhpcyApO1xyXG4gICAgc3RhdGUudGhlcm1hbEVuZXJneSA9IHRoZXJtYWxFbmVyZ3k7XHJcbiAgICBzdGF0ZS50cmFjayA9IHRyYWNrO1xyXG4gICAgc3RhdGUub25Ub3BTaWRlT2ZUcmFjayA9IG9uVG9wU2lkZU9mVHJhY2s7XHJcbiAgICBzdGF0ZS5wYXJhbWV0cmljUG9zaXRpb24gPSBwYXJhbWV0cmljUG9zaXRpb247XHJcbiAgICBzdGF0ZS5wYXJhbWV0cmljU3BlZWQgPSBwYXJhbWV0cmljU3BlZWQ7XHJcbiAgICBzdGF0ZS52ZWxvY2l0eVggPSB2ZWxvY2l0eVg7XHJcbiAgICBzdGF0ZS52ZWxvY2l0eVkgPSB2ZWxvY2l0eVk7XHJcbiAgICBzdGF0ZS5wb3NpdGlvblggPSBwb3NpdGlvblg7XHJcbiAgICBzdGF0ZS5wb3NpdGlvblkgPSBwb3NpdGlvblk7XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHNwZWVkIG9mIHRoaXMgU2thdGVyU3RhdGUsIHRoZSBtYWduaXR1ZGUgb2YgdmVsb2NpdHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRTcGVlZCgpIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIHRoaXMudmVsb2NpdHlYICogdGhpcy52ZWxvY2l0eVggKyB0aGlzLnZlbG9jaXR5WSAqIHRoaXMudmVsb2NpdHlZICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gYSBuZXcgVmVjdG9yMiBvZiB0aGlzIFNrYXRlclN0YXRlJ3MgdGhhdCBkb2VzIG5vdCByZWZlcmVuY2UgdGhpcyBTa2F0ZXJTdGF0ZSdzIHZlbG9jaXR5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldFZlbG9jaXR5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLnZlbG9jaXR5WCwgdGhpcy52ZWxvY2l0eVkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc3BlZWQgb2YgdGhpcyBTa2F0ZXJTdGF0ZSBmcm9tIGtpbmV0aWMgZW5lcmd5LCB1c2luZyBLRSA9IDEvMiAqIG0gKiB2XjIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGtpbmV0aWNFbmVyZ3lcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFNwZWVkRnJvbUVuZXJneSgga2luZXRpY0VuZXJneSApIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoIDIgKiBNYXRoLmFicygga2luZXRpY0VuZXJneSApIC8gdGhpcy5tYXNzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgVmVjdG9yMiB0aGF0IGNvbnRhaW5zIHRoZSBwb3NpdGlvblgvcG9zaXRpb25ZIG9mIHRoaXMgU2thdGVyU3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXRQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5wb3NpdGlvblgsIHRoaXMucG9zaXRpb25ZICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQHByaXZhdGVcclxuICpcclxuICogQHBhcmFte3N0cmluZ30ga2V5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VcclxuICogQHJldHVybnMgeyp9XHJcbiAqL1xyXG5jb25zdCBnZXRWYWx1ZSA9ICgga2V5LCBzb3VyY2UgKSA9PiB7XHJcbiAgcmV0dXJuIHR5cGVvZiBzb3VyY2VbIGAke2tleX1Qcm9wZXJ0eWAgXSA9PT0gJ29iamVjdCcgPyBzb3VyY2VbIGAke2tleX1Qcm9wZXJ0eWAgXS52YWx1ZSA6XHJcbiAgICAgICAgIHNvdXJjZVsga2V5IF07XHJcbn07XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdTa2F0ZXJTdGF0ZScsIFNrYXRlclN0YXRlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNrYXRlclN0YXRlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLFdBQVcsQ0FBQztFQUVoQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFDcEIsSUFBSSxDQUFDQyxRQUFRLENBQUVELE1BQU8sQ0FBQztFQUN6Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxRQUFRQSxDQUFFRCxNQUFNLEVBQUc7SUFFakI7SUFDQSxJQUFLQSxNQUFNLENBQUNFLGdCQUFnQixFQUFHO01BQzdCLElBQUksQ0FBQ0MsU0FBUyxHQUFHSCxNQUFNLENBQUNFLGdCQUFnQixDQUFDRSxLQUFLLENBQUNDLENBQUM7TUFDaEQsSUFBSSxDQUFDQyxTQUFTLEdBQUdOLE1BQU0sQ0FBQ0UsZ0JBQWdCLENBQUNFLEtBQUssQ0FBQ0csQ0FBQztNQUVoRCxJQUFJLENBQUNDLFNBQVMsR0FBR1IsTUFBTSxDQUFDUyxnQkFBZ0IsQ0FBQ0wsS0FBSyxDQUFDQyxDQUFDO01BQ2hELElBQUksQ0FBQ0ssU0FBUyxHQUFHVixNQUFNLENBQUNTLGdCQUFnQixDQUFDTCxLQUFLLENBQUNHLENBQUM7SUFDbEQsQ0FBQyxNQUNJO01BQ0gsSUFBSSxDQUFDSixTQUFTLEdBQUdILE1BQU0sQ0FBQ0csU0FBUztNQUNqQyxJQUFJLENBQUNHLFNBQVMsR0FBR04sTUFBTSxDQUFDTSxTQUFTO01BRWpDLElBQUks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