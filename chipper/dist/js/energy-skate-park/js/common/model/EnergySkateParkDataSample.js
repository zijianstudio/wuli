// Copyright 2018-2020, University of Colorado Boulder

/**
 * A collection of physical values and data about the Skater at a particular time. This data can be plotted visually
 * or individually inspected by the user.
 *
 * Generally this information is static, but energy values for sample CAN change. For example, when the reference height
 * line moves, energy data updates according to this line.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import energySkatePark from '../../energySkatePark.js';

// constants
// samples will fade out to this opacity before being fully removed from the model
const MIN_OPACITY = 0.05;
class EnergySkateParkDataSample {
  /**
   * @param {SkaterState} skaterState
   * @param {number} friction - to be restored when scrubbing through data
   * @param {number} time - in seconds
   * @param {boolean} stickingToTrack
   * @param {number} fadeDecay - samples being removed retain this percent of opacity (opacity = opacity * fadeDecay)
   */
  constructor(skaterState, friction, time, stickingToTrack, fadeDecay) {
    assert && assert(fadeDecay < 1, 'samples which have initiated removal need to fade away');

    // @public (read-only) - values copied to avoid re-calculating when inspected
    this.speed = skaterState.getSpeed();
    this.referenceHeight = skaterState.referenceHeight;
    this.position = new Vector2(skaterState.positionX, skaterState.positionY);
    this.time = time;
    this.stickingToTrack = stickingToTrack;

    // @public (read-only) {Track} - Skater's track at time of save
    this.track = skaterState.track;

    // @private {Vector2[]} - positions of the control points for the saved track, if there is one
    this.trackControlPointPositions = [];
    if (this.track) {
      this.track.controlPoints.forEach(controlPoint => {
        this.trackControlPointPositions.push(controlPoint.positionProperty.get());
      });
    }

    // @public (read-only) {number} - values copied from SkaterState, but these may change with the reference height
    // and become out of sync with SkaterState
    this.kineticEnergy = skaterState.getKineticEnergy();
    this.potentialEnergy = skaterState.getPotentialEnergy();
    this.thermalEnergy = skaterState.thermalEnergy;
    this.totalEnergy = skaterState.getTotalEnergy();

    // @public (read-only)
    this.skaterState = skaterState;

    // @public (read-only) {number}
    this.friction = friction;

    // @public - in seconds, time since this sample was added to the model
    this.timeSinceAdded = 0;

    // @public - whether or not this sample is being inspected by the probe
    this.inspectedProperty = new BooleanProperty(false);

    // @public - the opacity of this skater sample, tied to visual representation
    this.opacityProperty = new NumberProperty(1);

    // @public - emits an event when this EnergySkateParkDataSample has updated in some way, like when energies change
    // due to a change in reference height
    this.updatedEmitter = new Emitter();

    // @private {number} - EnergySkateParkDataSamples which have initiated removal will retain this percentage of opacity
    // every animation frame. opacity = opacity * fadeDecay
    this.fadeDecay = fadeDecay;

    // @private {boolean} - indicates that this sample should begin removal, and will fade out
    this._initiateRemove = false;
  }

  /**
   * Calculate new energies for this EnergySkateParkDataSample with the new reference height. Potential energy will be recalculated
   * and total energy will be adjusted accordingly to conserve energy. Thermal and kinetic energies should not change.
   * @public
   *
   * @param {number} referenceHeight
   */
  setNewReferenceHeight(referenceHeight) {
    this.referenceHeight = referenceHeight;
    const oldPotentialEnergy = this.potentialEnergy;
    this.potentialEnergy = this.getPotentialEnergyAtReferenceHeight(referenceHeight);
    const energyChange = this.potentialEnergy - oldPotentialEnergy;
    this.totalEnergy = this.totalEnergy + energyChange;
    this.updatedEmitter.emit();
    if (assert) {
      const totalEnergy = this.potentialEnergy + this.kineticEnergy + this.thermalEnergy;
      assert(Utils.equalsEpsilon(totalEnergy, this.totalEnergy, 1E-10), 'energy should be conserved');
    }
  }

  /**
   * Get the potential energy a particular reference height, using the other physical properties of the SkaterState
   * unchanged.
   * @public
   *
   * @param {number} referenceHeight
   * @returns {number}
   */
  getPotentialEnergyAtReferenceHeight(referenceHeight) {
    return -this.skaterState.mass * this.skaterState.gravity * (this.skaterState.positionY - referenceHeight);
  }

  /**
   * @public
   * @param {number} dt - in seconds
   */
  step(dt) {
    if (this._initiateRemove) {
      this.opacityProperty.set(this.opacityProperty.get() * this.fadeDecay);
    }
    this.timeSinceAdded += dt;
  }

  /**
   * Indicate that this skater sample is about to be removed. Opacity immediately is reduced, and after a short time
   * this sample will be completely removed.
   * @public
   */
  initiateRemove() {
    this._initiateRemove = true;
  }
}

// @public
// @static
EnergySkateParkDataSample.MIN_OPACITY = MIN_OPACITY;
energySkatePark.register('EnergySkateParkDataSample', EnergySkateParkDataSample);
export default EnergySkateParkDataSample;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJVdGlscyIsIlZlY3RvcjIiLCJlbmVyZ3lTa2F0ZVBhcmsiLCJNSU5fT1BBQ0lUWSIsIkVuZXJneVNrYXRlUGFya0RhdGFTYW1wbGUiLCJjb25zdHJ1Y3RvciIsInNrYXRlclN0YXRlIiwiZnJpY3Rpb24iLCJ0aW1lIiwic3RpY2tpbmdUb1RyYWNrIiwiZmFkZURlY2F5IiwiYXNzZXJ0Iiwic3BlZWQiLCJnZXRTcGVlZCIsInJlZmVyZW5jZUhlaWdodCIsInBvc2l0aW9uIiwicG9zaXRpb25YIiwicG9zaXRpb25ZIiwidHJhY2siLCJ0cmFja0NvbnRyb2xQb2ludFBvc2l0aW9ucyIsImNvbnRyb2xQb2ludHMiLCJmb3JFYWNoIiwiY29udHJvbFBvaW50IiwicHVzaCIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJraW5ldGljRW5lcmd5IiwiZ2V0S2luZXRpY0VuZXJneSIsInBvdGVudGlhbEVuZXJneSIsImdldFBvdGVudGlhbEVuZXJneSIsInRoZXJtYWxFbmVyZ3kiLCJ0b3RhbEVuZXJneSIsImdldFRvdGFsRW5lcmd5IiwidGltZVNpbmNlQWRkZWQiLCJpbnNwZWN0ZWRQcm9wZXJ0eSIsIm9wYWNpdHlQcm9wZXJ0eSIsInVwZGF0ZWRFbWl0dGVyIiwiX2luaXRpYXRlUmVtb3ZlIiwic2V0TmV3UmVmZXJlbmNlSGVpZ2h0Iiwib2xkUG90ZW50aWFsRW5lcmd5IiwiZ2V0UG90ZW50aWFsRW5lcmd5QXRSZWZlcmVuY2VIZWlnaHQiLCJlbmVyZ3lDaGFuZ2UiLCJlbWl0IiwiZXF1YWxzRXBzaWxvbiIsIm1hc3MiLCJncmF2aXR5Iiwic3RlcCIsImR0Iiwic2V0IiwiaW5pdGlhdGVSZW1vdmUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneVNrYXRlUGFya0RhdGFTYW1wbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBjb2xsZWN0aW9uIG9mIHBoeXNpY2FsIHZhbHVlcyBhbmQgZGF0YSBhYm91dCB0aGUgU2thdGVyIGF0IGEgcGFydGljdWxhciB0aW1lLiBUaGlzIGRhdGEgY2FuIGJlIHBsb3R0ZWQgdmlzdWFsbHlcclxuICogb3IgaW5kaXZpZHVhbGx5IGluc3BlY3RlZCBieSB0aGUgdXNlci5cclxuICpcclxuICogR2VuZXJhbGx5IHRoaXMgaW5mb3JtYXRpb24gaXMgc3RhdGljLCBidXQgZW5lcmd5IHZhbHVlcyBmb3Igc2FtcGxlIENBTiBjaGFuZ2UuIEZvciBleGFtcGxlLCB3aGVuIHRoZSByZWZlcmVuY2UgaGVpZ2h0XHJcbiAqIGxpbmUgbW92ZXMsIGVuZXJneSBkYXRhIHVwZGF0ZXMgYWNjb3JkaW5nIHRvIHRoaXMgbGluZS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIHNhbXBsZXMgd2lsbCBmYWRlIG91dCB0byB0aGlzIG9wYWNpdHkgYmVmb3JlIGJlaW5nIGZ1bGx5IHJlbW92ZWQgZnJvbSB0aGUgbW9kZWxcclxuY29uc3QgTUlOX09QQUNJVFkgPSAwLjA1O1xyXG5cclxuY2xhc3MgRW5lcmd5U2thdGVQYXJrRGF0YVNhbXBsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyaWN0aW9uIC0gdG8gYmUgcmVzdG9yZWQgd2hlbiBzY3J1YmJpbmcgdGhyb3VnaCBkYXRhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSBpbiBzZWNvbmRzXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzdGlja2luZ1RvVHJhY2tcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZmFkZURlY2F5IC0gc2FtcGxlcyBiZWluZyByZW1vdmVkIHJldGFpbiB0aGlzIHBlcmNlbnQgb2Ygb3BhY2l0eSAob3BhY2l0eSA9IG9wYWNpdHkgKiBmYWRlRGVjYXkpXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNrYXRlclN0YXRlLCBmcmljdGlvbiwgdGltZSwgc3RpY2tpbmdUb1RyYWNrLCBmYWRlRGVjYXkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWRlRGVjYXkgPCAxLCAnc2FtcGxlcyB3aGljaCBoYXZlIGluaXRpYXRlZCByZW1vdmFsIG5lZWQgdG8gZmFkZSBhd2F5JyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSB2YWx1ZXMgY29waWVkIHRvIGF2b2lkIHJlLWNhbGN1bGF0aW5nIHdoZW4gaW5zcGVjdGVkXHJcbiAgICB0aGlzLnNwZWVkID0gc2thdGVyU3RhdGUuZ2V0U3BlZWQoKTtcclxuICAgIHRoaXMucmVmZXJlbmNlSGVpZ2h0ID0gc2thdGVyU3RhdGUucmVmZXJlbmNlSGVpZ2h0O1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCBza2F0ZXJTdGF0ZS5wb3NpdGlvblgsIHNrYXRlclN0YXRlLnBvc2l0aW9uWSApO1xyXG4gICAgdGhpcy50aW1lID0gdGltZTtcclxuICAgIHRoaXMuc3RpY2tpbmdUb1RyYWNrID0gc3RpY2tpbmdUb1RyYWNrO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1RyYWNrfSAtIFNrYXRlcidzIHRyYWNrIGF0IHRpbWUgb2Ygc2F2ZVxyXG4gICAgdGhpcy50cmFjayA9IHNrYXRlclN0YXRlLnRyYWNrO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtWZWN0b3IyW119IC0gcG9zaXRpb25zIG9mIHRoZSBjb250cm9sIHBvaW50cyBmb3IgdGhlIHNhdmVkIHRyYWNrLCBpZiB0aGVyZSBpcyBvbmVcclxuICAgIHRoaXMudHJhY2tDb250cm9sUG9pbnRQb3NpdGlvbnMgPSBbXTtcclxuICAgIGlmICggdGhpcy50cmFjayApIHtcclxuICAgICAgdGhpcy50cmFjay5jb250cm9sUG9pbnRzLmZvckVhY2goIGNvbnRyb2xQb2ludCA9PiB7XHJcbiAgICAgICAgdGhpcy50cmFja0NvbnRyb2xQb2ludFBvc2l0aW9ucy5wdXNoKCBjb250cm9sUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfSAtIHZhbHVlcyBjb3BpZWQgZnJvbSBTa2F0ZXJTdGF0ZSwgYnV0IHRoZXNlIG1heSBjaGFuZ2Ugd2l0aCB0aGUgcmVmZXJlbmNlIGhlaWdodFxyXG4gICAgLy8gYW5kIGJlY29tZSBvdXQgb2Ygc3luYyB3aXRoIFNrYXRlclN0YXRlXHJcbiAgICB0aGlzLmtpbmV0aWNFbmVyZ3kgPSBza2F0ZXJTdGF0ZS5nZXRLaW5ldGljRW5lcmd5KCk7XHJcbiAgICB0aGlzLnBvdGVudGlhbEVuZXJneSA9IHNrYXRlclN0YXRlLmdldFBvdGVudGlhbEVuZXJneSgpO1xyXG4gICAgdGhpcy50aGVybWFsRW5lcmd5ID0gc2thdGVyU3RhdGUudGhlcm1hbEVuZXJneTtcclxuICAgIHRoaXMudG90YWxFbmVyZ3kgPSBza2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuc2thdGVyU3RhdGUgPSBza2F0ZXJTdGF0ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtudW1iZXJ9XHJcbiAgICB0aGlzLmZyaWN0aW9uID0gZnJpY3Rpb247XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGluIHNlY29uZHMsIHRpbWUgc2luY2UgdGhpcyBzYW1wbGUgd2FzIGFkZGVkIHRvIHRoZSBtb2RlbFxyXG4gICAgdGhpcy50aW1lU2luY2VBZGRlZCA9IDA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHdoZXRoZXIgb3Igbm90IHRoaXMgc2FtcGxlIGlzIGJlaW5nIGluc3BlY3RlZCBieSB0aGUgcHJvYmVcclxuICAgIHRoaXMuaW5zcGVjdGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB0aGUgb3BhY2l0eSBvZiB0aGlzIHNrYXRlciBzYW1wbGUsIHRpZWQgdG8gdmlzdWFsIHJlcHJlc2VudGF0aW9uXHJcbiAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBlbWl0cyBhbiBldmVudCB3aGVuIHRoaXMgRW5lcmd5U2thdGVQYXJrRGF0YVNhbXBsZSBoYXMgdXBkYXRlZCBpbiBzb21lIHdheSwgbGlrZSB3aGVuIGVuZXJnaWVzIGNoYW5nZVxyXG4gICAgLy8gZHVlIHRvIGEgY2hhbmdlIGluIHJlZmVyZW5jZSBoZWlnaHRcclxuICAgIHRoaXMudXBkYXRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gRW5lcmd5U2thdGVQYXJrRGF0YVNhbXBsZXMgd2hpY2ggaGF2ZSBpbml0aWF0ZWQgcmVtb3ZhbCB3aWxsIHJldGFpbiB0aGlzIHBlcmNlbnRhZ2Ugb2Ygb3BhY2l0eVxyXG4gICAgLy8gZXZlcnkgYW5pbWF0aW9uIGZyYW1lLiBvcGFjaXR5ID0gb3BhY2l0eSAqIGZhZGVEZWNheVxyXG4gICAgdGhpcy5mYWRlRGVjYXkgPSBmYWRlRGVjYXk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gaW5kaWNhdGVzIHRoYXQgdGhpcyBzYW1wbGUgc2hvdWxkIGJlZ2luIHJlbW92YWwsIGFuZCB3aWxsIGZhZGUgb3V0XHJcbiAgICB0aGlzLl9pbml0aWF0ZVJlbW92ZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlIG5ldyBlbmVyZ2llcyBmb3IgdGhpcyBFbmVyZ3lTa2F0ZVBhcmtEYXRhU2FtcGxlIHdpdGggdGhlIG5ldyByZWZlcmVuY2UgaGVpZ2h0LiBQb3RlbnRpYWwgZW5lcmd5IHdpbGwgYmUgcmVjYWxjdWxhdGVkXHJcbiAgICogYW5kIHRvdGFsIGVuZXJneSB3aWxsIGJlIGFkanVzdGVkIGFjY29yZGluZ2x5IHRvIGNvbnNlcnZlIGVuZXJneS4gVGhlcm1hbCBhbmQga2luZXRpYyBlbmVyZ2llcyBzaG91bGQgbm90IGNoYW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVmZXJlbmNlSGVpZ2h0XHJcbiAgICovXHJcbiAgc2V0TmV3UmVmZXJlbmNlSGVpZ2h0KCByZWZlcmVuY2VIZWlnaHQgKSB7XHJcblxyXG4gICAgdGhpcy5yZWZlcmVuY2VIZWlnaHQgPSByZWZlcmVuY2VIZWlnaHQ7XHJcblxyXG4gICAgY29uc3Qgb2xkUG90ZW50aWFsRW5lcmd5ID0gdGhpcy5wb3RlbnRpYWxFbmVyZ3k7XHJcbiAgICB0aGlzLnBvdGVudGlhbEVuZXJneSA9IHRoaXMuZ2V0UG90ZW50aWFsRW5lcmd5QXRSZWZlcmVuY2VIZWlnaHQoIHJlZmVyZW5jZUhlaWdodCApO1xyXG5cclxuICAgIGNvbnN0IGVuZXJneUNoYW5nZSA9IHRoaXMucG90ZW50aWFsRW5lcmd5IC0gb2xkUG90ZW50aWFsRW5lcmd5O1xyXG4gICAgdGhpcy50b3RhbEVuZXJneSA9IHRoaXMudG90YWxFbmVyZ3kgKyBlbmVyZ3lDaGFuZ2U7XHJcblxyXG4gICAgdGhpcy51cGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGNvbnN0IHRvdGFsRW5lcmd5ID0gdGhpcy5wb3RlbnRpYWxFbmVyZ3kgKyB0aGlzLmtpbmV0aWNFbmVyZ3kgKyB0aGlzLnRoZXJtYWxFbmVyZ3k7XHJcbiAgICAgIGFzc2VydCggVXRpbHMuZXF1YWxzRXBzaWxvbiggdG90YWxFbmVyZ3ksIHRoaXMudG90YWxFbmVyZ3ksIDFFLTEwICksICdlbmVyZ3kgc2hvdWxkIGJlIGNvbnNlcnZlZCcgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcG90ZW50aWFsIGVuZXJneSBhIHBhcnRpY3VsYXIgcmVmZXJlbmNlIGhlaWdodCwgdXNpbmcgdGhlIG90aGVyIHBoeXNpY2FsIHByb3BlcnRpZXMgb2YgdGhlIFNrYXRlclN0YXRlXHJcbiAgICogdW5jaGFuZ2VkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZWZlcmVuY2VIZWlnaHRcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFBvdGVudGlhbEVuZXJneUF0UmVmZXJlbmNlSGVpZ2h0KCByZWZlcmVuY2VIZWlnaHQgKSB7XHJcbiAgICByZXR1cm4gLXRoaXMuc2thdGVyU3RhdGUubWFzcyAqIHRoaXMuc2thdGVyU3RhdGUuZ3Jhdml0eSAqICggdGhpcy5za2F0ZXJTdGF0ZS5wb3NpdGlvblkgLSByZWZlcmVuY2VIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICBpZiAoIHRoaXMuX2luaXRpYXRlUmVtb3ZlICkge1xyXG4gICAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eS5zZXQoIHRoaXMub3BhY2l0eVByb3BlcnR5LmdldCgpICogdGhpcy5mYWRlRGVjYXkgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRpbWVTaW5jZUFkZGVkICs9IGR0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5kaWNhdGUgdGhhdCB0aGlzIHNrYXRlciBzYW1wbGUgaXMgYWJvdXQgdG8gYmUgcmVtb3ZlZC4gT3BhY2l0eSBpbW1lZGlhdGVseSBpcyByZWR1Y2VkLCBhbmQgYWZ0ZXIgYSBzaG9ydCB0aW1lXHJcbiAgICogdGhpcyBzYW1wbGUgd2lsbCBiZSBjb21wbGV0ZWx5IHJlbW92ZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGluaXRpYXRlUmVtb3ZlKCkge1xyXG4gICAgdGhpcy5faW5pdGlhdGVSZW1vdmUgPSB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpY1xyXG4vLyBAc3RhdGljXHJcbkVuZXJneVNrYXRlUGFya0RhdGFTYW1wbGUuTUlOX09QQUNJVFkgPSBNSU5fT1BBQ0lUWTtcclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0VuZXJneVNrYXRlUGFya0RhdGFTYW1wbGUnLCBFbmVyZ3lTa2F0ZVBhcmtEYXRhU2FtcGxlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneVNrYXRlUGFya0RhdGFTYW1wbGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtB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