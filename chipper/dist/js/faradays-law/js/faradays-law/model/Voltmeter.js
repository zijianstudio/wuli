// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model for the voltmeter in the 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const ACTIVITY_THRESHOLD = 1E-3; // Used to prevent perpetual oscillation of the needle, value empirically determined.
const NEEDLE_RESPONSIVENESS = 50; // needle responsiveness
const NEEDLE_FRICTION = 10; // friction coefficient, so needle motion looks realistic

class Voltmeter {
  /**
   * @param {FaradaysLawModel} model - simulation model
   */
  constructor(model) {
    // @private
    this.model = model;

    // @private {number} - rad/sec
    this.needleAngularVelocity = 0;

    // @private {number} - rad/s^2
    this.needleAngularAcceleration = 0;

    // @private {NumberProperty} - converts emf from the magnets into a force on the needle (which is correlated with the displayed voltage)
    this.signalProperty = new NumberProperty(0);

    // @public {DerivedProperty.<number>}
    this.needleAngleProperty = new DerivedProperty([model.voltageProperty], voltage => voltage, {
      units: 'radians',
      phetioHighFrequency: true
    });
  }

  /**
   * voltmeter needle evolution over time
   * @param {number} dt - elapsed time in seconds
   * @public
   */
  step(dt) {
    // Calculate the signal, combining the EMF from both coils.  The multiplier (including the sign thereof) is
    // empirically determined to make the needle move the correct amount and direction.
    this.signalProperty.set(0.2 * (this.model.bottomCoil.emfProperty.get() + this.model.topCoil.emfProperty.get()));
    this.needleAngularAcceleration = NEEDLE_RESPONSIVENESS * (this.signalProperty.get() - this.model.voltageProperty.get()) - NEEDLE_FRICTION * this.needleAngularVelocity; // angular acceleration of needle
    this.model.voltageProperty.set(this.model.voltageProperty.get() + this.needleAngularVelocity * dt + 0.5 * this.needleAngularAcceleration * dt * dt); // angle of needle
    const angularVelocity = this.needleAngularVelocity + this.needleAngularAcceleration * dt;
    const angularAcceleration = NEEDLE_RESPONSIVENESS * (this.signalProperty.get() - this.model.voltageProperty.get()) - NEEDLE_FRICTION * angularVelocity;
    this.needleAngularVelocity = this.needleAngularVelocity + 0.5 * dt * (this.needleAngularAcceleration + angularAcceleration);

    // Clamp the needle angle when its position, velocity, and acceleration go below a threshold so that it doesn't
    // oscillate forever.
    if (this.needleAngularAcceleration !== 0 && Math.abs(this.needleAngularAcceleration) < ACTIVITY_THRESHOLD && this.needleAngularVelocity !== 0 && Math.abs(this.needleAngularVelocity) < ACTIVITY_THRESHOLD && this.model.voltageProperty.get() !== 0 && Math.abs(this.model.voltageProperty.get()) < ACTIVITY_THRESHOLD) {
      this.model.voltageProperty.set(0);
      this.needleAngularVelocity = 0;
      this.needleAngularAcceleration = 0;
    }
  }
}
faradaysLaw.register('Voltmeter', Voltmeter);
export default Voltmeter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsImZhcmFkYXlzTGF3IiwiQUNUSVZJVFlfVEhSRVNIT0xEIiwiTkVFRExFX1JFU1BPTlNJVkVORVNTIiwiTkVFRExFX0ZSSUNUSU9OIiwiVm9sdG1ldGVyIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm5lZWRsZUFuZ3VsYXJWZWxvY2l0eSIsIm5lZWRsZUFuZ3VsYXJBY2NlbGVyYXRpb24iLCJzaWduYWxQcm9wZXJ0eSIsIm5lZWRsZUFuZ2xlUHJvcGVydHkiLCJ2b2x0YWdlUHJvcGVydHkiLCJ2b2x0YWdlIiwidW5pdHMiLCJwaGV0aW9IaWdoRnJlcXVlbmN5Iiwic3RlcCIsImR0Iiwic2V0IiwiYm90dG9tQ29pbCIsImVtZlByb3BlcnR5IiwiZ2V0IiwidG9wQ29pbCIsImFuZ3VsYXJWZWxvY2l0eSIsImFuZ3VsYXJBY2NlbGVyYXRpb24iLCJNYXRoIiwiYWJzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWb2x0bWV0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSB2b2x0bWV0ZXIgaW4gdGhlICdGYXJhZGF5cyBMYXcnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBmYXJhZGF5c0xhdyBmcm9tICcuLi8uLi9mYXJhZGF5c0xhdy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQUNUSVZJVFlfVEhSRVNIT0xEID0gMUUtMzsgLy8gVXNlZCB0byBwcmV2ZW50IHBlcnBldHVhbCBvc2NpbGxhdGlvbiBvZiB0aGUgbmVlZGxlLCB2YWx1ZSBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5jb25zdCBORUVETEVfUkVTUE9OU0lWRU5FU1MgPSA1MDsgIC8vIG5lZWRsZSByZXNwb25zaXZlbmVzc1xyXG5jb25zdCBORUVETEVfRlJJQ1RJT04gPSAxMDsgLy8gZnJpY3Rpb24gY29lZmZpY2llbnQsIHNvIG5lZWRsZSBtb3Rpb24gbG9va3MgcmVhbGlzdGljXHJcblxyXG5jbGFzcyBWb2x0bWV0ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZhcmFkYXlzTGF3TW9kZWx9IG1vZGVsIC0gc2ltdWxhdGlvbiBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gcmFkL3NlY1xyXG4gICAgdGhpcy5uZWVkbGVBbmd1bGFyVmVsb2NpdHkgPSAwO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gcmFkL3NeMlxyXG4gICAgdGhpcy5uZWVkbGVBbmd1bGFyQWNjZWxlcmF0aW9uID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TnVtYmVyUHJvcGVydHl9IC0gY29udmVydHMgZW1mIGZyb20gdGhlIG1hZ25ldHMgaW50byBhIGZvcmNlIG9uIHRoZSBuZWVkbGUgKHdoaWNoIGlzIGNvcnJlbGF0ZWQgd2l0aCB0aGUgZGlzcGxheWVkIHZvbHRhZ2UpXHJcbiAgICB0aGlzLnNpZ25hbFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RGVyaXZlZFByb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5uZWVkbGVBbmdsZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC52b2x0YWdlUHJvcGVydHkgXSwgdm9sdGFnZSA9PiB2b2x0YWdlLCB7XHJcbiAgICAgIHVuaXRzOiAncmFkaWFucycsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHZvbHRtZXRlciBuZWVkbGUgZXZvbHV0aW9uIG92ZXIgdGltZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGVsYXBzZWQgdGltZSBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgc2lnbmFsLCBjb21iaW5pbmcgdGhlIEVNRiBmcm9tIGJvdGggY29pbHMuICBUaGUgbXVsdGlwbGllciAoaW5jbHVkaW5nIHRoZSBzaWduIHRoZXJlb2YpIGlzXHJcbiAgICAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIG1ha2UgdGhlIG5lZWRsZSBtb3ZlIHRoZSBjb3JyZWN0IGFtb3VudCBhbmQgZGlyZWN0aW9uLlxyXG4gICAgdGhpcy5zaWduYWxQcm9wZXJ0eS5zZXQoIDAuMiAqICggdGhpcy5tb2RlbC5ib3R0b21Db2lsLmVtZlByb3BlcnR5LmdldCgpICsgdGhpcy5tb2RlbC50b3BDb2lsLmVtZlByb3BlcnR5LmdldCgpICkgKTtcclxuXHJcbiAgICB0aGlzLm5lZWRsZUFuZ3VsYXJBY2NlbGVyYXRpb24gPSBORUVETEVfUkVTUE9OU0lWRU5FU1MgKiAoIHRoaXMuc2lnbmFsUHJvcGVydHkuZ2V0KCkgLSB0aGlzLm1vZGVsLnZvbHRhZ2VQcm9wZXJ0eS5nZXQoKSApIC0gTkVFRExFX0ZSSUNUSU9OICogdGhpcy5uZWVkbGVBbmd1bGFyVmVsb2NpdHk7IC8vIGFuZ3VsYXIgYWNjZWxlcmF0aW9uIG9mIG5lZWRsZVxyXG4gICAgdGhpcy5tb2RlbC52b2x0YWdlUHJvcGVydHkuc2V0KCB0aGlzLm1vZGVsLnZvbHRhZ2VQcm9wZXJ0eS5nZXQoKSArIHRoaXMubmVlZGxlQW5ndWxhclZlbG9jaXR5ICogZHQgKyAwLjUgKiB0aGlzLm5lZWRsZUFuZ3VsYXJBY2NlbGVyYXRpb24gKiBkdCAqIGR0ICk7IC8vIGFuZ2xlIG9mIG5lZWRsZVxyXG4gICAgY29uc3QgYW5ndWxhclZlbG9jaXR5ID0gdGhpcy5uZWVkbGVBbmd1bGFyVmVsb2NpdHkgKyB0aGlzLm5lZWRsZUFuZ3VsYXJBY2NlbGVyYXRpb24gKiBkdDtcclxuICAgIGNvbnN0IGFuZ3VsYXJBY2NlbGVyYXRpb24gPSBORUVETEVfUkVTUE9OU0lWRU5FU1MgKiAoIHRoaXMuc2lnbmFsUHJvcGVydHkuZ2V0KCkgLSB0aGlzLm1vZGVsLnZvbHRhZ2VQcm9wZXJ0eS5nZXQoKSApIC0gTkVFRExFX0ZSSUNUSU9OICogYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgdGhpcy5uZWVkbGVBbmd1bGFyVmVsb2NpdHkgPSB0aGlzLm5lZWRsZUFuZ3VsYXJWZWxvY2l0eSArIDAuNSAqIGR0ICogKCB0aGlzLm5lZWRsZUFuZ3VsYXJBY2NlbGVyYXRpb24gKyBhbmd1bGFyQWNjZWxlcmF0aW9uICk7XHJcblxyXG4gICAgLy8gQ2xhbXAgdGhlIG5lZWRsZSBhbmdsZSB3aGVuIGl0cyBwb3NpdGlvbiwgdmVsb2NpdHksIGFuZCBhY2NlbGVyYXRpb24gZ28gYmVsb3cgYSB0aHJlc2hvbGQgc28gdGhhdCBpdCBkb2Vzbid0XHJcbiAgICAvLyBvc2NpbGxhdGUgZm9yZXZlci5cclxuICAgIGlmICggdGhpcy5uZWVkbGVBbmd1bGFyQWNjZWxlcmF0aW9uICE9PSAwICYmIE1hdGguYWJzKCB0aGlzLm5lZWRsZUFuZ3VsYXJBY2NlbGVyYXRpb24gKSA8IEFDVElWSVRZX1RIUkVTSE9MRCAmJlxyXG4gICAgICAgICB0aGlzLm5lZWRsZUFuZ3VsYXJWZWxvY2l0eSAhPT0gMCAmJiBNYXRoLmFicyggdGhpcy5uZWVkbGVBbmd1bGFyVmVsb2NpdHkgKSA8IEFDVElWSVRZX1RIUkVTSE9MRCAmJlxyXG4gICAgICAgICB0aGlzLm1vZGVsLnZvbHRhZ2VQcm9wZXJ0eS5nZXQoKSAhPT0gMCAmJiBNYXRoLmFicyggdGhpcy5tb2RlbC52b2x0YWdlUHJvcGVydHkuZ2V0KCkgKSA8IEFDVElWSVRZX1RIUkVTSE9MRCApIHtcclxuICAgICAgdGhpcy5tb2RlbC52b2x0YWdlUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgIHRoaXMubmVlZGxlQW5ndWxhclZlbG9jaXR5ID0gMDtcclxuICAgICAgdGhpcy5uZWVkbGVBbmd1bGFyQWNjZWxlcmF0aW9uID0gMDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnVm9sdG1ldGVyJywgVm9sdG1ldGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFZvbHRtZXRlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjs7QUFFOUM7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqQyxNQUFNQyxxQkFBcUIsR0FBRyxFQUFFLENBQUMsQ0FBRTtBQUNuQyxNQUFNQyxlQUFlLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRTVCLE1BQU1DLFNBQVMsQ0FBQztFQUVkO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxLQUFLLEVBQUc7SUFFbkI7SUFDQSxJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSzs7SUFFbEI7SUFDQSxJQUFJLENBQUNDLHFCQUFxQixHQUFHLENBQUM7O0lBRTlCO0lBQ0EsSUFBSSxDQUFDQyx5QkFBeUIsR0FBRyxDQUFDOztJQUVsQztJQUNBLElBQUksQ0FBQ0MsY0FBYyxHQUFHLElBQUlW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