// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model container for the coil in 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import faradaysLaw from '../../faradaysLaw.js';
import OrientationEnum from './OrientationEnum.js';

// constants
// in pixels, set size for transition from B=constant to B=power law
const NEAR_FIELD_RADIUS = 50;
class Coil {
  /**
   * @param {Vector2} position - center of the coil
   * @param {number} numberOfSpirals - number of spirals
   * @param {Magnet} magnet - model of the magnet
   */
  constructor(position, numberOfSpirals, magnet) {
    // @private
    this.sense = 1; // sense of magnet = +1 or -1, simulates flipping of magnet. Magnetic field sign

    // @public (read-only)
    this.position = position;

    // @private - current value of magnetic field
    this.magneticFieldProperty = new Property(0);

    // @private - previous value of magnetic field
    this.previousMagneticFieldProperty = new Property(0);

    // @public - signal strength in coil = 'electromotive force'
    this.emfProperty = new Property(0);

    // @private
    this.magnet = magnet;

    // @private
    this.numberOfSpirals = numberOfSpirals;

    // set up initial conditions
    this.updateMagneticField();

    // Must be called after updateMagneticField to store the initial value
    this.previousMagneticFieldProperty.set(this.magneticFieldProperty.get());
  }

  /**
   * Restore initial conditions
   * @public
   */
  reset() {
    this.magneticFieldProperty.reset();
    this.previousMagneticFieldProperty.reset();
    this.emfProperty.reset();
    this.updateMagneticField();
    this.previousMagneticFieldProperty.set(this.magneticFieldProperty.get());
  }

  /**
   * Calculate magnetic field with current magnet position
   * @private
   */
  updateMagneticField() {
    const sign = this.magnet.orientationProperty.value === OrientationEnum.NS ? -1 : 1;
    const rSquared = this.position.distanceSquared(this.magnet.positionProperty.get()) / (NEAR_FIELD_RADIUS * NEAR_FIELD_RADIUS); // normalized squared distance from coil to magnet

    // if magnet is very close to coil, then B field is at max value;
    if (rSquared < 1) {
      this.magneticFieldProperty.set(sign * 2);
    } else {
      // modified dipole field --  power law of 2 gives better feel than cubic power law (original comment)
      // formula: B = s *(3 * dx^2 -r^2) / r^4, where
      // s - +-1 - sign for position of magnet
      // r - normalized distance between magnet and coil

      // normalized x-displacement from coil to magnet
      const dx = (this.magnet.positionProperty.get().x - this.position.x) / NEAR_FIELD_RADIUS;
      this.magneticFieldProperty.set(sign * (3 * dx * dx - rSquared) / (rSquared * rSquared));
    }
  }

  /**
   * Evolution of emf in coil over time
   * @param {number} dt - time in seconds
   * @public
   */
  step(dt) {
    this.updateMagneticField();

    // number of turns in coil (equal to half the number of turns in the graphic image)
    const numberOfCoils = this.numberOfSpirals / 2;

    // emf = (nbr coils)*(change in B)/(change in t)
    const changeInMagneticField = this.magneticFieldProperty.get() - this.previousMagneticFieldProperty.get();
    this.emfProperty.set(numberOfCoils * changeInMagneticField / dt);
    this.previousMagneticFieldProperty.set(this.magneticFieldProperty.get());
  }
}
faradaysLaw.register('Coil', Coil);
export default Coil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImZhcmFkYXlzTGF3IiwiT3JpZW50YXRpb25FbnVtIiwiTkVBUl9GSUVMRF9SQURJVVMiLCJDb2lsIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvbiIsIm51bWJlck9mU3BpcmFscyIsIm1hZ25ldCIsInNlbnNlIiwibWFnbmV0aWNGaWVsZFByb3BlcnR5IiwicHJldmlvdXNNYWduZXRpY0ZpZWxkUHJvcGVydHkiLCJlbWZQcm9wZXJ0eSIsInVwZGF0ZU1hZ25ldGljRmllbGQiLCJzZXQiLCJnZXQiLCJyZXNldCIsInNpZ24iLCJvcmllbnRhdGlvblByb3BlcnR5IiwidmFsdWUiLCJOUyIsInJTcXVhcmVkIiwiZGlzdGFuY2VTcXVhcmVkIiwicG9zaXRpb25Qcm9wZXJ0eSIsImR4IiwieCIsInN0ZXAiLCJkdCIsIm51bWJlck9mQ29pbHMiLCJjaGFuZ2VJbk1hZ25ldGljRmllbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvaWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgY29udGFpbmVyIGZvciB0aGUgY29pbCBpbiAnRmFyYWRheXMgTGF3JyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNTGVhcm5lcilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBmYXJhZGF5c0xhdyBmcm9tICcuLi8uLi9mYXJhZGF5c0xhdy5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbkVudW0gZnJvbSAnLi9PcmllbnRhdGlvbkVudW0uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIGluIHBpeGVscywgc2V0IHNpemUgZm9yIHRyYW5zaXRpb24gZnJvbSBCPWNvbnN0YW50IHRvIEI9cG93ZXIgbGF3XHJcbmNvbnN0IE5FQVJfRklFTERfUkFESVVTID0gNTA7XHJcblxyXG5jbGFzcyBDb2lsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvbiAtIGNlbnRlciBvZiB0aGUgY29pbFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZlNwaXJhbHMgLSBudW1iZXIgb2Ygc3BpcmFsc1xyXG4gICAqIEBwYXJhbSB7TWFnbmV0fSBtYWduZXQgLSBtb2RlbCBvZiB0aGUgbWFnbmV0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBvc2l0aW9uLCBudW1iZXJPZlNwaXJhbHMsIG1hZ25ldCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zZW5zZSA9IDE7IC8vIHNlbnNlIG9mIG1hZ25ldCA9ICsxIG9yIC0xLCBzaW11bGF0ZXMgZmxpcHBpbmcgb2YgbWFnbmV0LiBNYWduZXRpYyBmaWVsZCBzaWduXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gY3VycmVudCB2YWx1ZSBvZiBtYWduZXRpYyBmaWVsZFxyXG4gICAgdGhpcy5tYWduZXRpY0ZpZWxkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHByZXZpb3VzIHZhbHVlIG9mIG1hZ25ldGljIGZpZWxkXHJcbiAgICB0aGlzLnByZXZpb3VzTWFnbmV0aWNGaWVsZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHNpZ25hbCBzdHJlbmd0aCBpbiBjb2lsID0gJ2VsZWN0cm9tb3RpdmUgZm9yY2UnXHJcbiAgICB0aGlzLmVtZlByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubWFnbmV0ID0gbWFnbmV0O1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm51bWJlck9mU3BpcmFscyA9IG51bWJlck9mU3BpcmFscztcclxuXHJcbiAgICAvLyBzZXQgdXAgaW5pdGlhbCBjb25kaXRpb25zXHJcbiAgICB0aGlzLnVwZGF0ZU1hZ25ldGljRmllbGQoKTtcclxuXHJcbiAgICAvLyBNdXN0IGJlIGNhbGxlZCBhZnRlciB1cGRhdGVNYWduZXRpY0ZpZWxkIHRvIHN0b3JlIHRoZSBpbml0aWFsIHZhbHVlXHJcbiAgICB0aGlzLnByZXZpb3VzTWFnbmV0aWNGaWVsZFByb3BlcnR5LnNldCggdGhpcy5tYWduZXRpY0ZpZWxkUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgaW5pdGlhbCBjb25kaXRpb25zXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5tYWduZXRpY0ZpZWxkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHJldmlvdXNNYWduZXRpY0ZpZWxkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZW1mUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudXBkYXRlTWFnbmV0aWNGaWVsZCgpO1xyXG4gICAgdGhpcy5wcmV2aW91c01hZ25ldGljRmllbGRQcm9wZXJ0eS5zZXQoIHRoaXMubWFnbmV0aWNGaWVsZFByb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxjdWxhdGUgbWFnbmV0aWMgZmllbGQgd2l0aCBjdXJyZW50IG1hZ25ldCBwb3NpdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlTWFnbmV0aWNGaWVsZCgpIHtcclxuXHJcbiAgICBjb25zdCBzaWduID0gdGhpcy5tYWduZXQub3JpZW50YXRpb25Qcm9wZXJ0eS52YWx1ZSA9PT0gT3JpZW50YXRpb25FbnVtLk5TID8gLTEgOiAxO1xyXG5cclxuICAgIGNvbnN0IHJTcXVhcmVkID0gdGhpcy5wb3NpdGlvbi5kaXN0YW5jZVNxdWFyZWQoIHRoaXMubWFnbmV0LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICggTkVBUl9GSUVMRF9SQURJVVMgKiBORUFSX0ZJRUxEX1JBRElVUyApOyAgLy8gbm9ybWFsaXplZCBzcXVhcmVkIGRpc3RhbmNlIGZyb20gY29pbCB0byBtYWduZXRcclxuXHJcbiAgICAvLyBpZiBtYWduZXQgaXMgdmVyeSBjbG9zZSB0byBjb2lsLCB0aGVuIEIgZmllbGQgaXMgYXQgbWF4IHZhbHVlO1xyXG4gICAgaWYgKCByU3F1YXJlZCA8IDEgKSB7XHJcbiAgICAgIHRoaXMubWFnbmV0aWNGaWVsZFByb3BlcnR5LnNldCggc2lnbiAqIDIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gbW9kaWZpZWQgZGlwb2xlIGZpZWxkIC0tICBwb3dlciBsYXcgb2YgMiBnaXZlcyBiZXR0ZXIgZmVlbCB0aGFuIGN1YmljIHBvd2VyIGxhdyAob3JpZ2luYWwgY29tbWVudClcclxuICAgICAgLy8gZm9ybXVsYTogQiA9IHMgKigzICogZHheMiAtcl4yKSAvIHJeNCwgd2hlcmVcclxuICAgICAgLy8gcyAtICstMSAtIHNpZ24gZm9yIHBvc2l0aW9uIG9mIG1hZ25ldFxyXG4gICAgICAvLyByIC0gbm9ybWFsaXplZCBkaXN0YW5jZSBiZXR3ZWVuIG1hZ25ldCBhbmQgY29pbFxyXG5cclxuICAgICAgLy8gbm9ybWFsaXplZCB4LWRpc3BsYWNlbWVudCBmcm9tIGNvaWwgdG8gbWFnbmV0XHJcbiAgICAgIGNvbnN0IGR4ID0gKCB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggLSB0aGlzLnBvc2l0aW9uLnggKSAvIE5FQVJfRklFTERfUkFESVVTO1xyXG4gICAgICB0aGlzLm1hZ25ldGljRmllbGRQcm9wZXJ0eS5zZXQoIHNpZ24gKiAoIDMgKiBkeCAqIGR4IC0gclNxdWFyZWQgKSAvICggclNxdWFyZWQgKiByU3F1YXJlZCApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFdm9sdXRpb24gb2YgZW1mIGluIGNvaWwgb3ZlciB0aW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gdGltZSBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy51cGRhdGVNYWduZXRpY0ZpZWxkKCk7XHJcblxyXG4gICAgLy8gbnVtYmVyIG9mIHR1cm5zIGluIGNvaWwgKGVxdWFsIHRvIGhhbGYgdGhlIG51bWJlciBvZiB0dXJucyBpbiB0aGUgZ3JhcGhpYyBpbWFnZSlcclxuICAgIGNvbnN0IG51bWJlck9mQ29pbHMgPSB0aGlzLm51bWJlck9mU3BpcmFscyAvIDI7XHJcblxyXG4gICAgLy8gZW1mID0gKG5iciBjb2lscykqKGNoYW5nZSBpbiBCKS8oY2hhbmdlIGluIHQpXHJcbiAgICBjb25zdCBjaGFuZ2VJbk1hZ25ldGljRmllbGQgPSB0aGlzLm1hZ25ldGljRmllbGRQcm9wZXJ0eS5nZXQoKSAtIHRoaXMucHJldmlvdXNNYWduZXRpY0ZpZWxkUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmVtZlByb3BlcnR5LnNldCggbnVtYmVyT2ZDb2lscyAqIGNoYW5nZUluTWFnbmV0aWNGaWVsZCAvIGR0ICk7XHJcbiAgICB0aGlzLnByZXZpb3VzTWFnbmV0aWNGaWVsZFByb3BlcnR5LnNldCggdGhpcy5tYWduZXRpY0ZpZWxkUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnQ29pbCcsIENvaWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ29pbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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