// Copyright 2016-2022, University of Colorado Boulder

/**
 * Model for the 'Rutherford Atom', responsible for moving alpha particles within its bounds.  For
 * additional information concerning the trajectory algorithm, see trajectories.pdf located in docs
 * (document may be out of date).
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Atom from '../../common/model/Atom.js';
import RSConstants from '../../common/RSConstants.js';
import rutherfordScattering from '../../rutherfordScattering.js';
class RutherfordAtom extends Atom {
  /**
   * @param {Emitter} particleRemovedEmitter
   * @param {Property.<number>} protonCountProperty
   * @param {Vector2} position
   * @param {number} boundingWidth
   * @param {Object} [options]
   */
  constructor(particleRemovedEmitter, protonCountProperty, position, boundingWidth, options) {
    super(position, boundingWidth, options);

    // @private
    this.protonCountProperty = protonCountProperty;
    this.particleRemovedemitter = particleRemovedEmitter;
  }

  /**
   * Remove a particle.  Most of the time, a particle needs to be removed from this atom but kept in
   * the space so that a new atom can pick it up if necessary.  On error, notify the space so that
   * the particle can be removed entirely from the model.
   * @param  {AlphaParticle}  particle
   * @param  {boolean} isError
   * @public
   */
  removeParticle(particle, isError, line) {
    super.removeParticle(particle);
    if (isError) {
      this.particleRemovedemitter.emit(particle);
    }
  }

  /**
   * ASSUMPTIONS MADE IN THIS ALGORITHM:
   * (1) The atom is located at (0,0).
   * This is not the case in our model. So coordindates are adjusted
   * as described in the comments.
   * (2) +y is up.
   * Our model has +y down. So we'll be adjusting the sign on y
   * coordinates, as described in the comments.
   * (3) alpha particles are moving from bottom to top
   * (4) x values are positive.
   * The algoritm fails for negative values of x. This is not
   * mentioned in the specification document. So we have to convert
   * to positive values of x, then convert back.
   * (5) Using "phi=arctan(-x,y)" as described in the spec causes
   * particles to jump discontinuously when they go above the y axis.
   * This is fixed by using Math.atan2 instead.
   * (6) Depending on the parameters supplied, the algorithm will tend
   * to fail as the alpha particle's horizontal position (x) gets closer
   * to zero. So the Gun model is calibrated to fire alpha particles
   * with some min initial x value.
   *
   * @param {AlphaParticle} alphaParticle
   * @param {number} dt
   * @override
   * @protected
   */
  moveParticle(alphaParticle, dt) {
    // apply a rotation to the particle coordinate frame if nececssary so that
    // the trajectory algorithm can proceed as if the particle were moving straight
    // up the space - this is required by the trajectory model, see trajectories.pdf
    const rotationAngle = alphaParticle.rotationAngle;
    const correctedInitialPosition = this.rotatePointAround(alphaParticle.initialPosition, this.position, -rotationAngle);
    const correctedPosition = this.rotatePointAround(alphaParticle.positionProperty.get(), this.position, -rotationAngle);

    // algorithm fails for x=0, so use this min value
    const X0_MIN = 0.00001;

    // Divisor for L used in the calculation of D.
    const L_DIVISOR = 8;

    //-------------------------------------------------------------------------------
    // misc constants that we'll need
    //-------------------------------------------------------------------------------

    const L = this.boundingRect.bounds.getWidth();
    const p = this.protonCountProperty.get(); // protons in the atom's nucleus
    const pd = RSConstants.DEFAULT_PROTON_COUNT; // default setting for the sim

    const s = alphaParticle.speedProperty.get(); // particle's current speed
    const s0 = alphaParticle.speedProperty.initialValue; // speed when it left the gun
    const sd = RSConstants.DEFAULT_ALPHA_ENERGY; // default setting for the sim

    //-------------------------------------------------------------------------------
    // (x0,y0) : the alpha particle's initial position, relative to the atom's center.
    //-------------------------------------------------------------------------------

    // const initialPosition = alphaParticle.initialPosition;
    const relativeInitialPosition = correctedInitialPosition.minus(this.position);
    let x0 = Math.abs(relativeInitialPosition.x);
    if (x0 < X0_MIN) {
      x0 = X0_MIN; // algorithm fails for x0 < X0_MIN
    }

    const y0 = relativeInitialPosition.y;

    //-------------------------------------------------------------------------------
    // (x,y) : the alpha particle's current position, relative to the atom's center
    //-------------------------------------------------------------------------------

    // const position = alphaParticle.positionProperty.get();
    const relativePosition = correctedPosition.minus(this.position);
    let x = relativePosition.x;
    const y = relativePosition.y;
    let xWasNegative = false;
    if (x < 0) {
      // This algorithm fails for x < 0, so adjust accordingly.
      x *= -1;
      xWasNegative = true;
    }

    //-------------------------------------------------------------------------------
    // calculate D -
    //-------------------------------------------------------------------------------

    // handle potential algorithm failures
    if (pd <= 0 || s0 === 0) {
      this.removeParticle(alphaParticle, true, '149');
      return;
    }
    const D = L / L_DIVISOR * (p / pd) * (sd * sd / (s0 * s0));

    //-------------------------------------------------------------------------------
    // calculate new alpha particle position, in Polar coordinates
    //-------------------------------------------------------------------------------

    // check intermediate values to handle potential algorithm failures
    const i0 = x0 * x0 + y0 * y0;
    if (i0 < 0) {
      this.removeParticle(alphaParticle, true, '162');
      return;
    }

    // b, horizontal distance to atom's center at y == negative infinity
    const b1 = Math.sqrt(i0);

    // check intermediate values to handle potential algorithm failures
    const i1 = -2 * D * b1 - 2 * D * y0 + x0 * x0;
    if (i1 < 0) {
      this.removeParticle(alphaParticle, true, '172');
      return;
    }
    const b = 0.5 * (x0 + Math.sqrt(i1));

    // convert current position to Polar coordinates, measured counterclockwise from the -y axis

    // check intermediate values to handle potential algorithm failures
    const i2 = x * x + y * y;
    if (i2 < 0) {
      this.removeParticle(alphaParticle, true, '183');
      return;
    }
    const r = Math.sqrt(i2);
    const phi = Math.atan2(x, -y);

    // new position (in Polar coordinates) and speed
    const t1 = b * Math.cos(phi) - D / 2 * Math.sin(phi);

    // check intermediate values to handle potential algorithm failures
    const i3 = Math.pow(b, 4) + r * r * t1 * t1;
    if (i3 < 0) {
      this.removeParticle(alphaParticle, true, '196');
      return;
    }
    const phiNew = phi + b * b * s * dt / (r * Math.sqrt(i3));

    // check intermediate values to handle potential algorithm failures
    const i4 = b * Math.sin(phiNew) + D / 2 * (Math.cos(phiNew) - 1);
    if (i4 < 0) {
      this.removeParticle(alphaParticle, true, '204');
      return;
    }
    const rNew = Math.abs(b * b / i4);

    // handle potential algorithm failures
    if (rNew === 0) {
      this.removeParticle(alphaParticle, true, '211');
      return;
    }
    const sNew = s0 * Math.sqrt(1 - D / rNew);

    //-------------------------------------------------------------------------------
    // convert to Cartesian coordinates
    //-------------------------------------------------------------------------------

    let xNew = rNew * Math.sin(phiNew);
    if (xWasNegative) {
      xNew *= -1; // restore the sign
    }

    const yNew = -rNew * Math.cos(phiNew);

    //-------------------------------------------------------------------------------
    // handle potential algorithm failures
    //-------------------------------------------------------------------------------

    if (!(b > 0) || !(sNew > 0)) {
      this.removeParticle(alphaParticle, true, '232');
      return;
    }

    //-------------------------------------------------------------------------------
    // set the alpha particle's new properties
    //-------------------------------------------------------------------------------

    // get the change in position relative to the atom's center, and rotate back to space coordinates
    const delta = new Vector2(xNew, yNew).minus(relativePosition);
    delta.rotate(alphaParticle.rotationAngle);

    // update the position of the particle in its space coordinates
    alphaParticle.positionProperty.set(alphaParticle.positionProperty.get().plus(delta));
    alphaParticle.speedProperty.set(sNew);
    alphaParticle.orientationProperty.set(phiNew);
  }

  /**
   * Rotate the point around another origin point, returning a new Vector2.
   * Vector2 does not support RotateAround, should this be moved there?
   * @private
   *
   * @param  {Vector2} point - the point to rotate
   * @param  {Vector2} rotatePoint - the point to rotate around
   * @param  {number} angle
   * @returns {Vector2}
   */
  rotatePointAround(point, rotatePoint, angle) {
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    // translate the point back to the origin by subtracting the pivot point
    const translatedPosition = point.minus(rotatePoint);

    // rotate the point with the equivalent rotation matrix
    const xNew = translatedPosition.x * cosAngle - translatedPosition.y * sinAngle;
    const yNew = translatedPosition.x * sinAngle + translatedPosition.y * cosAngle;

    // translate the point back
    return new Vector2(xNew, yNew).plus(rotatePoint);
  }
}
rutherfordScattering.register('RutherfordAtom', RutherfordAtom);
export default RutherfordAtom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiQXRvbSIsIlJTQ29uc3RhbnRzIiwicnV0aGVyZm9yZFNjYXR0ZXJpbmciLCJSdXRoZXJmb3JkQXRvbSIsImNvbnN0cnVjdG9yIiwicGFydGljbGVSZW1vdmVkRW1pdHRlciIsInByb3RvbkNvdW50UHJvcGVydHkiLCJwb3NpdGlvbiIsImJvdW5kaW5nV2lkdGgiLCJvcHRpb25zIiwicGFydGljbGVSZW1vdmVkZW1pdHRlciIsInJlbW92ZVBhcnRpY2xlIiwicGFydGljbGUiLCJpc0Vycm9yIiwibGluZSIsImVtaXQiLCJtb3ZlUGFydGljbGUiLCJhbHBoYVBhcnRpY2xlIiwiZHQiLCJyb3RhdGlvbkFuZ2xlIiwiY29ycmVjdGVkSW5pdGlhbFBvc2l0aW9uIiwicm90YXRlUG9pbnRBcm91bmQiLCJpbml0aWFsUG9zaXRpb24iLCJjb3JyZWN0ZWRQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJYMF9NSU4iLCJMX0RJVklTT1IiLCJMIiwiYm91bmRpbmdSZWN0IiwiYm91bmRzIiwiZ2V0V2lkdGgiLCJwIiwicGQiLCJERUZBVUxUX1BST1RPTl9DT1VOVCIsInMiLCJzcGVlZFByb3BlcnR5IiwiczAiLCJpbml0aWFsVmFsdWUiLCJzZCIsIkRFRkFVTFRfQUxQSEFfRU5FUkdZIiwicmVsYXRpdmVJbml0aWFsUG9zaXRpb24iLCJtaW51cyIsIngwIiwiTWF0aCIsImFicyIsIngiLCJ5MCIsInkiLCJyZWxhdGl2ZVBvc2l0aW9uIiwieFdhc05lZ2F0aXZlIiwiRCIsImkwIiwiYjEiLCJzcXJ0IiwiaTEiLCJiIiwiaTIiLCJyIiwicGhpIiwiYXRhbjIiLCJ0MSIsImNvcyIsInNpbiIsImkzIiwicG93IiwicGhpTmV3IiwiaTQiLCJyTmV3Iiwic05ldyIsInhOZXciLCJ5TmV3IiwiZGVsdGEiLCJyb3RhdGUiLCJzZXQiLCJwbHVzIiwib3JpZW50YXRpb25Qcm9wZXJ0eSIsInBvaW50Iiwicm90YXRlUG9pbnQiLCJhbmdsZSIsInNpbkFuZ2xlIiwiY29zQW5nbGUiLCJ0cmFuc2xhdGVkUG9zaXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJ1dGhlcmZvcmRBdG9tLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgJ1J1dGhlcmZvcmQgQXRvbScsIHJlc3BvbnNpYmxlIGZvciBtb3ZpbmcgYWxwaGEgcGFydGljbGVzIHdpdGhpbiBpdHMgYm91bmRzLiAgRm9yXHJcbiAqIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gY29uY2VybmluZyB0aGUgdHJhamVjdG9yeSBhbGdvcml0aG0sIHNlZSB0cmFqZWN0b3JpZXMucGRmIGxvY2F0ZWQgaW4gZG9jc1xyXG4gKiAoZG9jdW1lbnQgbWF5IGJlIG91dCBvZiBkYXRlKS5cclxuICpcclxuICogQGF1dGhvciBEYXZlIFNjaG1pdHogKFNjaG1pdHp3YXJlKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEF0b20gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0F0b20uanMnO1xyXG5pbXBvcnQgUlNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1JTQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHJ1dGhlcmZvcmRTY2F0dGVyaW5nIGZyb20gJy4uLy4uL3J1dGhlcmZvcmRTY2F0dGVyaW5nLmpzJztcclxuXHJcbmNsYXNzIFJ1dGhlcmZvcmRBdG9tIGV4dGVuZHMgQXRvbSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW1pdHRlcn0gcGFydGljbGVSZW1vdmVkRW1pdHRlclxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHByb3RvbkNvdW50UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvdW5kaW5nV2lkdGhcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBhcnRpY2xlUmVtb3ZlZEVtaXR0ZXIsIHByb3RvbkNvdW50UHJvcGVydHksIHBvc2l0aW9uLCBib3VuZGluZ1dpZHRoLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBwb3NpdGlvbiwgYm91bmRpbmdXaWR0aCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnByb3RvbkNvdW50UHJvcGVydHkgPSBwcm90b25Db3VudFByb3BlcnR5O1xyXG4gICAgdGhpcy5wYXJ0aWNsZVJlbW92ZWRlbWl0dGVyID0gcGFydGljbGVSZW1vdmVkRW1pdHRlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhIHBhcnRpY2xlLiAgTW9zdCBvZiB0aGUgdGltZSwgYSBwYXJ0aWNsZSBuZWVkcyB0byBiZSByZW1vdmVkIGZyb20gdGhpcyBhdG9tIGJ1dCBrZXB0IGluXHJcbiAgICogdGhlIHNwYWNlIHNvIHRoYXQgYSBuZXcgYXRvbSBjYW4gcGljayBpdCB1cCBpZiBuZWNlc3NhcnkuICBPbiBlcnJvciwgbm90aWZ5IHRoZSBzcGFjZSBzbyB0aGF0XHJcbiAgICogdGhlIHBhcnRpY2xlIGNhbiBiZSByZW1vdmVkIGVudGlyZWx5IGZyb20gdGhlIG1vZGVsLlxyXG4gICAqIEBwYXJhbSAge0FscGhhUGFydGljbGV9ICBwYXJ0aWNsZVxyXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzRXJyb3JcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlLCBpc0Vycm9yLCBsaW5lICkge1xyXG4gICAgc3VwZXIucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7XHJcblxyXG4gICAgaWYgKCBpc0Vycm9yICkge1xyXG4gICAgICB0aGlzLnBhcnRpY2xlUmVtb3ZlZGVtaXR0ZXIuZW1pdCggcGFydGljbGUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFTU1VNUFRJT05TIE1BREUgSU4gVEhJUyBBTEdPUklUSE06XHJcbiAgICogKDEpIFRoZSBhdG9tIGlzIGxvY2F0ZWQgYXQgKDAsMCkuXHJcbiAgICogVGhpcyBpcyBub3QgdGhlIGNhc2UgaW4gb3VyIG1vZGVsLiBTbyBjb29yZGluZGF0ZXMgYXJlIGFkanVzdGVkXHJcbiAgICogYXMgZGVzY3JpYmVkIGluIHRoZSBjb21tZW50cy5cclxuICAgKiAoMikgK3kgaXMgdXAuXHJcbiAgICogT3VyIG1vZGVsIGhhcyAreSBkb3duLiBTbyB3ZSdsbCBiZSBhZGp1c3RpbmcgdGhlIHNpZ24gb24geVxyXG4gICAqIGNvb3JkaW5hdGVzLCBhcyBkZXNjcmliZWQgaW4gdGhlIGNvbW1lbnRzLlxyXG4gICAqICgzKSBhbHBoYSBwYXJ0aWNsZXMgYXJlIG1vdmluZyBmcm9tIGJvdHRvbSB0byB0b3BcclxuICAgKiAoNCkgeCB2YWx1ZXMgYXJlIHBvc2l0aXZlLlxyXG4gICAqIFRoZSBhbGdvcml0bSBmYWlscyBmb3IgbmVnYXRpdmUgdmFsdWVzIG9mIHguIFRoaXMgaXMgbm90XHJcbiAgICogbWVudGlvbmVkIGluIHRoZSBzcGVjaWZpY2F0aW9uIGRvY3VtZW50LiBTbyB3ZSBoYXZlIHRvIGNvbnZlcnRcclxuICAgKiB0byBwb3NpdGl2ZSB2YWx1ZXMgb2YgeCwgdGhlbiBjb252ZXJ0IGJhY2suXHJcbiAgICogKDUpIFVzaW5nIFwicGhpPWFyY3RhbigteCx5KVwiIGFzIGRlc2NyaWJlZCBpbiB0aGUgc3BlYyBjYXVzZXNcclxuICAgKiBwYXJ0aWNsZXMgdG8ganVtcCBkaXNjb250aW51b3VzbHkgd2hlbiB0aGV5IGdvIGFib3ZlIHRoZSB5IGF4aXMuXHJcbiAgICogVGhpcyBpcyBmaXhlZCBieSB1c2luZyBNYXRoLmF0YW4yIGluc3RlYWQuXHJcbiAgICogKDYpIERlcGVuZGluZyBvbiB0aGUgcGFyYW1ldGVycyBzdXBwbGllZCwgdGhlIGFsZ29yaXRobSB3aWxsIHRlbmRcclxuICAgKiB0byBmYWlsIGFzIHRoZSBhbHBoYSBwYXJ0aWNsZSdzIGhvcml6b250YWwgcG9zaXRpb24gKHgpIGdldHMgY2xvc2VyXHJcbiAgICogdG8gemVyby4gU28gdGhlIEd1biBtb2RlbCBpcyBjYWxpYnJhdGVkIHRvIGZpcmUgYWxwaGEgcGFydGljbGVzXHJcbiAgICogd2l0aCBzb21lIG1pbiBpbml0aWFsIHggdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FscGhhUGFydGljbGV9IGFscGhhUGFydGljbGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgbW92ZVBhcnRpY2xlKCBhbHBoYVBhcnRpY2xlLCBkdCApIHtcclxuXHJcbiAgICAvLyBhcHBseSBhIHJvdGF0aW9uIHRvIHRoZSBwYXJ0aWNsZSBjb29yZGluYXRlIGZyYW1lIGlmIG5lY2Vjc3Nhcnkgc28gdGhhdFxyXG4gICAgLy8gdGhlIHRyYWplY3RvcnkgYWxnb3JpdGhtIGNhbiBwcm9jZWVkIGFzIGlmIHRoZSBwYXJ0aWNsZSB3ZXJlIG1vdmluZyBzdHJhaWdodFxyXG4gICAgLy8gdXAgdGhlIHNwYWNlIC0gdGhpcyBpcyByZXF1aXJlZCBieSB0aGUgdHJhamVjdG9yeSBtb2RlbCwgc2VlIHRyYWplY3Rvcmllcy5wZGZcclxuICAgIGNvbnN0IHJvdGF0aW9uQW5nbGUgPSBhbHBoYVBhcnRpY2xlLnJvdGF0aW9uQW5nbGU7XHJcbiAgICBjb25zdCBjb3JyZWN0ZWRJbml0aWFsUG9zaXRpb24gPSB0aGlzLnJvdGF0ZVBvaW50QXJvdW5kKCBhbHBoYVBhcnRpY2xlLmluaXRpYWxQb3NpdGlvbiwgdGhpcy5wb3NpdGlvbiwgLXJvdGF0aW9uQW5nbGUgKTtcclxuICAgIGNvbnN0IGNvcnJlY3RlZFBvc2l0aW9uID0gdGhpcy5yb3RhdGVQb2ludEFyb3VuZCggYWxwaGFQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLCB0aGlzLnBvc2l0aW9uLCAtcm90YXRpb25BbmdsZSApO1xyXG5cclxuICAgIC8vIGFsZ29yaXRobSBmYWlscyBmb3IgeD0wLCBzbyB1c2UgdGhpcyBtaW4gdmFsdWVcclxuICAgIGNvbnN0IFgwX01JTiA9IDAuMDAwMDE7XHJcblxyXG4gICAgLy8gRGl2aXNvciBmb3IgTCB1c2VkIGluIHRoZSBjYWxjdWxhdGlvbiBvZiBELlxyXG4gICAgY29uc3QgTF9ESVZJU09SID0gODtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG1pc2MgY29uc3RhbnRzIHRoYXQgd2UnbGwgbmVlZFxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3QgTCA9IHRoaXMuYm91bmRpbmdSZWN0LmJvdW5kcy5nZXRXaWR0aCgpO1xyXG5cclxuICAgIGNvbnN0IHAgPSB0aGlzLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCk7IC8vIHByb3RvbnMgaW4gdGhlIGF0b20ncyBudWNsZXVzXHJcbiAgICBjb25zdCBwZCA9IFJTQ29uc3RhbnRzLkRFRkFVTFRfUFJPVE9OX0NPVU5UOyAvLyBkZWZhdWx0IHNldHRpbmcgZm9yIHRoZSBzaW1cclxuXHJcbiAgICBjb25zdCBzID0gYWxwaGFQYXJ0aWNsZS5zcGVlZFByb3BlcnR5LmdldCgpOyAgLy8gcGFydGljbGUncyBjdXJyZW50IHNwZWVkXHJcbiAgICBjb25zdCBzMCA9IGFscGhhUGFydGljbGUuc3BlZWRQcm9wZXJ0eS5pbml0aWFsVmFsdWU7IC8vIHNwZWVkIHdoZW4gaXQgbGVmdCB0aGUgZ3VuXHJcbiAgICBjb25zdCBzZCA9IFJTQ29uc3RhbnRzLkRFRkFVTFRfQUxQSEFfRU5FUkdZOyAvLyBkZWZhdWx0IHNldHRpbmcgZm9yIHRoZSBzaW1cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICh4MCx5MCkgOiB0aGUgYWxwaGEgcGFydGljbGUncyBpbml0aWFsIHBvc2l0aW9uLCByZWxhdGl2ZSB0byB0aGUgYXRvbSdzIGNlbnRlci5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIGNvbnN0IGluaXRpYWxQb3NpdGlvbiA9IGFscGhhUGFydGljbGUuaW5pdGlhbFBvc2l0aW9uO1xyXG4gICAgY29uc3QgcmVsYXRpdmVJbml0aWFsUG9zaXRpb24gPSBjb3JyZWN0ZWRJbml0aWFsUG9zaXRpb24ubWludXMoIHRoaXMucG9zaXRpb24gKTtcclxuXHJcbiAgICBsZXQgeDAgPSBNYXRoLmFicyggcmVsYXRpdmVJbml0aWFsUG9zaXRpb24ueCApO1xyXG4gICAgaWYgKCB4MCA8IFgwX01JTiApIHtcclxuICAgICAgeDAgPSBYMF9NSU47IC8vIGFsZ29yaXRobSBmYWlscyBmb3IgeDAgPCBYMF9NSU5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB5MCA9IHJlbGF0aXZlSW5pdGlhbFBvc2l0aW9uLnk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAoeCx5KSA6IHRoZSBhbHBoYSBwYXJ0aWNsZSdzIGN1cnJlbnQgcG9zaXRpb24sIHJlbGF0aXZlIHRvIHRoZSBhdG9tJ3MgY2VudGVyXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBjb25zdCBwb3NpdGlvbiA9IGFscGhhUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IHJlbGF0aXZlUG9zaXRpb24gPSBjb3JyZWN0ZWRQb3NpdGlvbi5taW51cyggdGhpcy5wb3NpdGlvbiApO1xyXG5cclxuICAgIGxldCB4ID0gcmVsYXRpdmVQb3NpdGlvbi54O1xyXG4gICAgY29uc3QgeSA9IHJlbGF0aXZlUG9zaXRpb24ueTtcclxuICAgIGxldCB4V2FzTmVnYXRpdmUgPSBmYWxzZTtcclxuICAgIGlmICggeCA8IDAgKSB7XHJcbiAgICAgIC8vIFRoaXMgYWxnb3JpdGhtIGZhaWxzIGZvciB4IDwgMCwgc28gYWRqdXN0IGFjY29yZGluZ2x5LlxyXG4gICAgICB4ICo9IC0xO1xyXG4gICAgICB4V2FzTmVnYXRpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gY2FsY3VsYXRlIEQgLVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gaGFuZGxlIHBvdGVudGlhbCBhbGdvcml0aG0gZmFpbHVyZXNcclxuICAgIGlmICggKCBwZCA8PSAwICkgfHwgKCBzMCA9PT0gMCApICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlKCBhbHBoYVBhcnRpY2xlLCB0cnVlLCAnMTQ5JyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgRCA9ICggTCAvIExfRElWSVNPUiApICogKCBwIC8gcGQgKSAqICggKCBzZCAqIHNkICkgLyAoIHMwICogczAgKSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gY2FsY3VsYXRlIG5ldyBhbHBoYSBwYXJ0aWNsZSBwb3NpdGlvbiwgaW4gUG9sYXIgY29vcmRpbmF0ZXNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIGNoZWNrIGludGVybWVkaWF0ZSB2YWx1ZXMgdG8gaGFuZGxlIHBvdGVudGlhbCBhbGdvcml0aG0gZmFpbHVyZXNcclxuICAgIGNvbnN0IGkwID0gKCB4MCAqIHgwICkgKyAoIHkwICogeTAgKTtcclxuICAgIGlmICggaTAgPCAwICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlKCBhbHBoYVBhcnRpY2xlLCB0cnVlLCAnMTYyJyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYiwgaG9yaXpvbnRhbCBkaXN0YW5jZSB0byBhdG9tJ3MgY2VudGVyIGF0IHkgPT0gbmVnYXRpdmUgaW5maW5pdHlcclxuICAgIGNvbnN0IGIxID0gTWF0aC5zcXJ0KCBpMCApO1xyXG5cclxuICAgIC8vIGNoZWNrIGludGVybWVkaWF0ZSB2YWx1ZXMgdG8gaGFuZGxlIHBvdGVudGlhbCBhbGdvcml0aG0gZmFpbHVyZXNcclxuICAgIGNvbnN0IGkxID0gKCAtMiAqIEQgKiBiMSApIC0gKCAyICogRCAqIHkwICkgKyAoIHgwICogeDAgKTtcclxuICAgIGlmICggaTEgPCAwICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlKCBhbHBoYVBhcnRpY2xlLCB0cnVlLCAnMTcyJyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYiA9IDAuNSAqICggeDAgKyBNYXRoLnNxcnQoIGkxICkgKTtcclxuXHJcbiAgICAvLyBjb252ZXJ0IGN1cnJlbnQgcG9zaXRpb24gdG8gUG9sYXIgY29vcmRpbmF0ZXMsIG1lYXN1cmVkIGNvdW50ZXJjbG9ja3dpc2UgZnJvbSB0aGUgLXkgYXhpc1xyXG5cclxuICAgIC8vIGNoZWNrIGludGVybWVkaWF0ZSB2YWx1ZXMgdG8gaGFuZGxlIHBvdGVudGlhbCBhbGdvcml0aG0gZmFpbHVyZXNcclxuICAgIGNvbnN0IGkyID0gKCB4ICogeCApICsgKCB5ICogeSApO1xyXG4gICAgaWYgKCBpMiA8IDAgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlUGFydGljbGUoIGFscGhhUGFydGljbGUsIHRydWUsICcxODMnICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByID0gTWF0aC5zcXJ0KCBpMiApO1xyXG4gICAgY29uc3QgcGhpID0gTWF0aC5hdGFuMiggeCwgLXkgKTtcclxuXHJcbiAgICAvLyBuZXcgcG9zaXRpb24gKGluIFBvbGFyIGNvb3JkaW5hdGVzKSBhbmQgc3BlZWRcclxuICAgIGNvbnN0IHQxID0gKCAoIGIgKiBNYXRoLmNvcyggcGhpICkgKSAtICggKCBEIC8gMiApICogTWF0aC5zaW4oIHBoaSApICkgKTtcclxuXHJcbiAgICAvLyBjaGVjayBpbnRlcm1lZGlhdGUgdmFsdWVzIHRvIGhhbmRsZSBwb3RlbnRpYWwgYWxnb3JpdGhtIGZhaWx1cmVzXHJcbiAgICBjb25zdCBpMyA9IE1hdGgucG93KCBiLCA0ICkgKyAoIHIgKiByICogdDEgKiB0MSApO1xyXG4gICAgaWYgKCBpMyA8IDAgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlUGFydGljbGUoIGFscGhhUGFydGljbGUsIHRydWUsICcxOTYnICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHBoaU5ldyA9IHBoaSArICggKCBiICogYiAqIHMgKiBkdCApIC8gKCByICogTWF0aC5zcXJ0KCBpMyApICkgKTtcclxuXHJcbiAgICAvLyBjaGVjayBpbnRlcm1lZGlhdGUgdmFsdWVzIHRvIGhhbmRsZSBwb3RlbnRpYWwgYWxnb3JpdGhtIGZhaWx1cmVzXHJcbiAgICBjb25zdCBpNCA9ICggKCBiICogTWF0aC5zaW4oIHBoaU5ldyApICkgKyAoICggRCAvIDIgKSAqICggTWF0aC5jb3MoIHBoaU5ldyApIC0gMSApICkgKTtcclxuICAgIGlmICggaTQgPCAwICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlKCBhbHBoYVBhcnRpY2xlLCB0cnVlLCAnMjA0JyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCByTmV3ID0gTWF0aC5hYnMoICggYiAqIGIgKSAvIGk0ICk7XHJcblxyXG4gICAgLy8gaGFuZGxlIHBvdGVudGlhbCBhbGdvcml0aG0gZmFpbHVyZXNcclxuICAgIGlmICggck5ldyA9PT0gMCApIHtcclxuICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNsZSggYWxwaGFQYXJ0aWNsZSwgdHJ1ZSwgJzIxMScgKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgc05ldyA9IHMwICogTWF0aC5zcXJ0KCAxIC0gKCBEIC8gck5ldyApICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjb252ZXJ0IHRvIENhcnRlc2lhbiBjb29yZGluYXRlc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbGV0IHhOZXcgPSByTmV3ICogTWF0aC5zaW4oIHBoaU5ldyApO1xyXG4gICAgaWYgKCB4V2FzTmVnYXRpdmUgKSB7XHJcbiAgICAgIHhOZXcgKj0gLTE7IC8vIHJlc3RvcmUgdGhlIHNpZ25cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB5TmV3ID0gLXJOZXcgKiBNYXRoLmNvcyggcGhpTmV3ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBoYW5kbGUgcG90ZW50aWFsIGFsZ29yaXRobSBmYWlsdXJlc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaWYgKCAhKCBiID4gMCApIHx8ICEoIHNOZXcgPiAwICkgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlUGFydGljbGUoIGFscGhhUGFydGljbGUsIHRydWUsICcyMzInICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHNldCB0aGUgYWxwaGEgcGFydGljbGUncyBuZXcgcHJvcGVydGllc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gZ2V0IHRoZSBjaGFuZ2UgaW4gcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIGF0b20ncyBjZW50ZXIsIGFuZCByb3RhdGUgYmFjayB0byBzcGFjZSBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgZGVsdGEgPSBuZXcgVmVjdG9yMiggeE5ldywgeU5ldyApLm1pbnVzKCByZWxhdGl2ZVBvc2l0aW9uICk7XHJcbiAgICBkZWx0YS5yb3RhdGUoIGFscGhhUGFydGljbGUucm90YXRpb25BbmdsZSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBhcnRpY2xlIGluIGl0cyBzcGFjZSBjb29yZGluYXRlc1xyXG4gICAgYWxwaGFQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LnNldCggYWxwaGFQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXMoIGRlbHRhICkgKTtcclxuICAgIGFscGhhUGFydGljbGUuc3BlZWRQcm9wZXJ0eS5zZXQoIHNOZXcgKTtcclxuXHJcbiAgICBhbHBoYVBhcnRpY2xlLm9yaWVudGF0aW9uUHJvcGVydHkuc2V0KCBwaGlOZXcgKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3RhdGUgdGhlIHBvaW50IGFyb3VuZCBhbm90aGVyIG9yaWdpbiBwb2ludCwgcmV0dXJuaW5nIGEgbmV3IFZlY3RvcjIuXHJcbiAgICogVmVjdG9yMiBkb2VzIG5vdCBzdXBwb3J0IFJvdGF0ZUFyb3VuZCwgc2hvdWxkIHRoaXMgYmUgbW92ZWQgdGhlcmU/XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHBvaW50IC0gdGhlIHBvaW50IHRvIHJvdGF0ZVxyXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IHJvdGF0ZVBvaW50IC0gdGhlIHBvaW50IHRvIHJvdGF0ZSBhcm91bmRcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGFuZ2xlXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgcm90YXRlUG9pbnRBcm91bmQoIHBvaW50LCByb3RhdGVQb2ludCwgYW5nbGUgKSB7XHJcblxyXG4gICAgY29uc3Qgc2luQW5nbGUgPSBNYXRoLnNpbiggYW5nbGUgKTtcclxuICAgIGNvbnN0IGNvc0FuZ2xlID0gTWF0aC5jb3MoIGFuZ2xlICk7XHJcblxyXG4gICAgLy8gdHJhbnNsYXRlIHRoZSBwb2ludCBiYWNrIHRvIHRoZSBvcmlnaW4gYnkgc3VidHJhY3RpbmcgdGhlIHBpdm90IHBvaW50XHJcbiAgICBjb25zdCB0cmFuc2xhdGVkUG9zaXRpb24gPSBwb2ludC5taW51cyggcm90YXRlUG9pbnQgKTtcclxuXHJcbiAgICAvLyByb3RhdGUgdGhlIHBvaW50IHdpdGggdGhlIGVxdWl2YWxlbnQgcm90YXRpb24gbWF0cml4XHJcbiAgICBjb25zdCB4TmV3ID0gdHJhbnNsYXRlZFBvc2l0aW9uLnggKiBjb3NBbmdsZSAtIHRyYW5zbGF0ZWRQb3NpdGlvbi55ICogc2luQW5nbGU7XHJcbiAgICBjb25zdCB5TmV3ID0gdHJhbnNsYXRlZFBvc2l0aW9uLnggKiBzaW5BbmdsZSArIHRyYW5zbGF0ZWRQb3NpdGlvbi55ICogY29zQW5nbGU7XHJcblxyXG4gICAgLy8gdHJhbnNsYXRlIHRoZSBwb2ludCBiYWNrXHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHhOZXcsIHlOZXcgKS5wbHVzKCByb3RhdGVQb2ludCApO1xyXG4gIH1cclxufVxyXG5cclxucnV0aGVyZm9yZFNjYXR0ZXJpbmcucmVnaXN0ZXIoICdSdXRoZXJmb3JkQXRvbScsIFJ1dGhlcmZvcmRBdG9tICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSdXRoZXJmb3JkQXRvbTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxJQUFJLE1BQU0sNEJBQTRCO0FBQzdDLE9BQU9DLFdBQVcsTUFBTSw2QkFBNkI7QUFDckQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLGNBQWMsU0FBU0gsSUFBSSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLHNCQUFzQixFQUFFQyxtQkFBbUIsRUFBRUMsUUFBUSxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sRUFBRztJQUUzRixLQUFLLENBQUVGLFFBQVEsRUFBRUMs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