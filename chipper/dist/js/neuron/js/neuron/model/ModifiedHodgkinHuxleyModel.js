// Copyright 2014-2020, University of Colorado Boulder
/**
 * This class is an implementation of the Hodgkin-Huxley model that started from an example taken from the web (see
 * Unfuddle #2121 for more info on this) but that was modified significantly to fit the needs of this simulation.  The
 * main change is that the way that the conductance values are calculated is different, and much simpler.
 * <p/>
 * This was used with permission from the original author of the example.
 *
 * @author Anthony Fodor
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import DelayBuffer from './DelayBuffer.js';

/**
 * Amount of time used for each iteration of the model.  This is fixed, and when the model is stepped it breaks
 * whether time step is presented into units of this duration.  This is needed because below a certain time value the
 * model doesn't work - it becomes unstable.
 */
const INTERNAL_TIME_STEP = 0.005; // In milliseconds, not seconds.
const MAX_DELAY = 0.001; // In seconds of simulation time.
class ModifiedHodgkinHuxleyModel {
  constructor() {
    this.perNaChannels = 100; // @private
    this.perKChannels = 100; // @private
    this.elapsedTime = 0; // @private
    this.timeSinceActionPotential = Number.POSITIVE_INFINITY; // @private
    this.m3hDelayBuffer = new DelayBuffer(MAX_DELAY, NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT); // @private
    this.n4DelayBuffer = new DelayBuffer(MAX_DELAY, NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT); // @private

    this.resting_v = 65; // @private, final doesn't change

    // deltas of voltage-dependent gating parameters
    this.dn = 0; // @private
    this.dm = 0; // @private
    this.dh = 0; // @private

    this.timeRemainder = 0; // @private

    // Ek-Er, Ena - Er, Eleak - Er
    this.vk = 0; // @private
    this.vna = 0; // @private
    this.vl = 0; // @private

    this.n4 = 0; // @private
    this.m3h = 0; // @private
    this.na_current = 0; // @private
    this.k_current = 0; // @private
    this.l_current = 0; // @private

    this.vClampOn = false; // @private

    this.vClampValue = this.convertV(0); // @private

    this.reset(); // reset and initialize
  }

  // @public
  reset() {
    this.n4DelayBuffer.clear();
    this.m3hDelayBuffer.clear();
    this.cm = 1; // membrane capacitance
    this.v = 0; // membrane voltage
    this.vna = -115;
    this.vk = 12;
    this.vl = 0; // NOTE: Modified from -10.613 by jblanco on 3/12/2010 in order to make potential stay steady
    // at the desired resting potential.

    //constant leak permeabilities
    this.gna = this.perNaChannels * 120 / 100;
    this.gk = this.perKChannels * 36 / 100;
    this.gl = 0.3;

    // rate constants
    this.bh = 1 / (Math.exp((this.v + 30) / 10) + 1);
    this.ah = 0.07 * Math.exp(this.v / 20);
    this.bm = 4 * Math.exp(this.v / 18);
    this.am = 0.1 * (this.v + 25) / (Math.exp((this.v + 25) / 10) - 1);
    this.bn = 0.125 * Math.exp(this.v / 80);
    this.an = 0.01 * (this.v + 10) / (Math.exp((this.v + 10) / 10) - 1);

    // voltage-dependent gating parameters - start these parameters in steady state
    this.n = this.an / (this.an + this.bn);
    this.m = this.am / (this.am + this.bm);
    this.h = this.ah / (this.ah + this.bh);

    // Time values.
    this.timeSinceActionPotential = Number.POSITIVE_INFINITY;
  }

  // @public
  stepInTime(dt) {
    let modelIterationsToRun = Math.floor(dt * 1000 / INTERNAL_TIME_STEP);
    this.timeRemainder += dt * 1000 % INTERNAL_TIME_STEP;
    if (this.timeRemainder >= INTERNAL_TIME_STEP) {
      // Add an additional iteration and reset the time remainder accumulation.  This is kind of like a leap year.
      modelIterationsToRun += 1;
      this.timeRemainder -= INTERNAL_TIME_STEP;
    }

    // Step the model the appropriate number of times.
    for (let i = 0; i < modelIterationsToRun; i++) {
      this.dh = (this.ah * (1 - this.h) - this.bh * this.h) * INTERNAL_TIME_STEP;
      this.dm = (this.am * (1 - this.m) - this.bm * this.m) * INTERNAL_TIME_STEP;
      this.dn = (this.an * (1 - this.n) - this.bn * this.n) * INTERNAL_TIME_STEP;
      this.bh = 1 / (Math.exp((this.v + 30) / 10) + 1);
      this.ah = 0.07 * Math.exp(this.v / 20);
      this.dh = (this.ah * (1 - this.h) - this.bh * this.h) * INTERNAL_TIME_STEP;
      this.bm = 4 * Math.exp(this.v / 18);
      this.am = 0.1 * (this.v + 25) / (Math.exp((this.v + 25) / 10) - 1);
      this.bn = 0.125 * Math.exp(this.v / 80);
      this.an = 0.01 * (this.v + 10) / (Math.exp((this.v + 10) / 10) - 1);
      this.dm = (this.am * (1 - this.m) - this.bm * this.m) * INTERNAL_TIME_STEP;
      this.dn = (this.an * (1 - this.n) - this.bn * this.n) * INTERNAL_TIME_STEP;

      // Here is where the main change is that makes this a "modified" version of Hodgkin-Huxley.  Note that the
      // multiplier values were determined empirically from running the more standard HH model.

      // Below, commented out, is the code that a real HH model would use.
      // n4 = n*n*n*n;
      // m3h = m*m*m*h;

      // New values tried by Noah P on 3/10/10
      this.n4 = 0.55 * Math.exp(-1 / 0.55 * Math.pow(this.timeSinceActionPotential - 1.75, 2));
      this.m3h = 0.3 * Math.exp(-1 / 0.2 * Math.pow(this.timeSinceActionPotential - 1.0, 2));

      // If the n4 and m3h values are below a certain level, go ahead and set them to zero.  This helps other parts of
      // the simulation determine when an action potential has ended.  The thresholds were empirically determined.
      if (this.n4 < 1E-5) {
        this.n4 = 0;
      }
      if (this.m3h < 1E-5) {
        this.m3h = 0;
      }

      // Calculate the currents based on the conductance values.
      this.na_current = this.gna * this.m3h * (this.v - this.vna);
      this.k_current = this.gk * this.n4 * (this.v - this.vk);
      this.l_current = this.gl * (this.v - this.vl);
      this.dv = -1 * INTERNAL_TIME_STEP * (this.k_current + this.na_current + this.l_current) / this.cm;
      this.v += this.dv;
      this.h += this.dh;
      this.m += this.dm;
      this.n += this.dn;
      this.elapsedTime += INTERNAL_TIME_STEP;
      if (this.timeSinceActionPotential < Number.POSITIVE_INFINITY) {
        this.timeSinceActionPotential += INTERNAL_TIME_STEP;
      }
    }
    this.m3hDelayBuffer.addValue(this.m3h, dt);
    this.n4DelayBuffer.addValue(this.n4, dt);
    if (this.vClampOn) {
      this.v = this.vClampValue;
    }
  }

  // @public
  get_n4() {
    return this.n4;
  }

  /**
   * Get a delayed version of the n^4 amount, which is the variable factor that governs the potassium channel
   * conductance.
   *
   * @param {number} delayAmount - time delay in seconds
   * @returns {number}
   * @public
   */
  get_delayed_n4(delayAmount) {
    if (delayAmount <= 0) {
      return this.n4;
    } else {
      return this.n4DelayBuffer.getDelayedValue(delayAmount);
    }
  }

  // @public
  get_m3h() {
    return this.m3h;
  }

  /**
   * Get a delayed version of the m3h amount, which is the variable factor
   * that governs the sodium channel conductance.
   *
   * @param {number} delayAmount - time delay in seconds
   * @returns {number}
   * @public
   */
  get_delayed_m3h(delayAmount) {
    let delayedM3h = 0;
    if (delayAmount <= 0) {
      delayedM3h = this.m3h;
    } else {
      delayedM3h = this.m3hDelayBuffer.getDelayedValue(delayAmount);
    }
    return delayedM3h;
  }

  // @public
  getEna() {
    return -1 * (this.vna + this.resting_v);
  }

  // @public
  getEk() {
    return -1 * (this.vk + this.resting_v);
  }

  // NOTE: A number of unused setters were removed from this portion of the code because they were unused and I
  // (@jbphet) felt that if they weren't available via setters I could more safely assume that the didn't need to
  // be maintained as part of the object's serializable state.  See https://github.com/phetsims/neuron/issues/92
  // for more information.

  // @public
  get_na_current() {
    return -1 * this.na_current;
  }

  // @public
  get_k_current() {
    return -1 * this.k_current;
  }

  // @public
  get_l_current() {
    return -1 * this.l_current;
  }

  // @public
  getPerNaChannels() {
    return this.perNaChannels;
  }

  // @public
  getPerKChannels() {
    return this.perKChannels;
  }

  // @public
  get_gk() {
    return this.gk;
  }

  // @public
  get_gna() {
    return this.gna;
  }

  // @public
  get_gl() {
    return this.gl;
  }

  // remember that H&H voltages are -1 * present convention
  // should eventually calculate this instead of setting it
  // convert between internal use of V and the user's expectations
  // the V will be membrane voltage using present day conventions
  // see p. 505 of Hodgkin & Huxley, J Physiol. 1952, 117:500-544
  // @public
  setV(inV) {
    this.v = -1 * inV - this.resting_v;
  }

  // @public
  getV() {
    return -1 * (this.v + this.resting_v);
  }

  // @public
  getRestingV() {
    return -1 * this.resting_v;
  }

  // @public
  getCm() {
    return this.cm;
  }

  // @public
  getElapsedTime() {
    return this.elapsedTime;
  }

  // @public
  resetElapsedTime() {
    this.elapsedTime = 0.0;
  }

  // @public
  getN() {
    return this.n;
  }

  // @public
  getM() {
    return this.m;
  }

  // @public
  getH() {
    return this.h;
  }

  /**
   * Converts a voltage from the modern convention to the convention used by the program
   * @private
   */
  convertV(voltage) {
    return -1 * voltage - this.resting_v;
  }

  // @public
  getVClampOn() {
    return this.vClampOn;
  }

  // @public
  get_vClampValue() {
    return -1 * (this.vClampValue + this.resting_v);
  }

  // @public
  getMembraneVoltage() {
    // getV() converts the model's v to present day convention
    return this.getV() / 1000;
  }

  /**
   * Get the state of the model.  This is generally used in support of record and playback.
   * @public
   */
  getState() {
    return {
      ah: this.ah,
      h: this.h,
      bh: this.bh,
      am: this.am,
      m: this.m,
      bm: this.bm,
      an: this.an,
      n: this.n,
      bn: this.bn,
      v: this.v,
      timeSinceActionPotential: this.timeSinceActionPotential,
      m3hDelayBuffer: this.m3hDelayBuffer.getCopy(),
      n4DelayBuffer: this.n4DelayBuffer.getCopy()
    };
  }

  /**
   * Set the state of the model.  This is generally used in support of record and playback.
   * @public
   */
  setState(state) {
    this.ah = state.ah;
    this.h = state.h;
    this.bh = state.bh;
    this.am = state.am;
    this.m = state.m;
    this.bm = state.bm;
    this.an = state.an;
    this.n = state.n;
    this.bn = state.bn;
    this.v = state.v;
    this.timeSinceActionPotential = state.timeSinceActionPotential;

    // For performance reasons, use the actual delay buffer in the state, which should be safe since the states
    // should not have been altered anywhere.
    this.m3hDelayBuffer = state.m3hDelayBuffer;
    this.n4DelayBuffer = state.n4DelayBuffer;
  }

  /**
   * Stimulate the neuron in a way that simulates a depolarization signal
   * coming to this neuron.  If the neuron is in the correct state, this
   * will trigger an action potential.
   * @public
   */
  stimulate() {
    // Add a fixed amount to the voltage across the membrane.
    this.setV(this.getV() + 15);
    this.timeSinceActionPotential = 0;
  }
}
neuron.register('ModifiedHodgkinHuxleyModel', ModifiedHodgkinHuxleyModel);
export default ModifiedHodgkinHuxleyModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJOZXVyb25Db25zdGFudHMiLCJEZWxheUJ1ZmZlciIsIklOVEVSTkFMX1RJTUVfU1RFUCIsIk1BWF9ERUxBWSIsIk1vZGlmaWVkSG9kZ2tpbkh1eGxleU1vZGVsIiwiY29uc3RydWN0b3IiLCJwZXJOYUNoYW5uZWxzIiwicGVyS0NoYW5uZWxzIiwiZWxhcHNlZFRpbWUiLCJ0aW1lU2luY2VBY3Rpb25Qb3RlbnRpYWwiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIm0zaERlbGF5QnVmZmVyIiwiTUlOX0FDVElPTl9QT1RFTlRJQUxfQ0xPQ0tfRFQiLCJuNERlbGF5QnVmZmVyIiwicmVzdGluZ192IiwiZG4iLCJkbSIsImRoIiwidGltZVJlbWFpbmRlciIsInZrIiwidm5hIiwidmwiLCJuNCIsIm0zaCIsIm5hX2N1cnJlbnQiLCJrX2N1cnJlbnQiLCJsX2N1cnJlbnQiLCJ2Q2xhbXBPbiIsInZDbGFtcFZhbHVlIiwiY29udmVydFYiLCJyZXNldCIsImNsZWFyIiwiY20iLCJ2IiwiZ25hIiwiZ2siLCJnbCIsImJoIiwiTWF0aCIsImV4cCIsImFoIiwiYm0iLCJhbSIsImJuIiwiYW4iLCJuIiwibSIsImgiLCJzdGVwSW5UaW1lIiwiZHQiLCJtb2RlbEl0ZXJhdGlvbnNUb1J1biIsImZsb29yIiwiaSIsInBvdyIsImR2IiwiYWRkVmFsdWUiLCJnZXRfbjQiLCJnZXRfZGVsYXllZF9uNCIsImRlbGF5QW1vdW50IiwiZ2V0RGVsYXllZFZhbHVlIiwiZ2V0X20zaCIsImdldF9kZWxheWVkX20zaCIsImRlbGF5ZWRNM2giLCJnZXRFbmEiLCJnZXRFayIsImdldF9uYV9jdXJyZW50IiwiZ2V0X2tfY3VycmVudCIsImdldF9sX2N1cnJlbnQiLCJnZXRQZXJOYUNoYW5uZWxzIiwiZ2V0UGVyS0NoYW5uZWxzIiwiZ2V0X2drIiwiZ2V0X2duYSIsImdldF9nbCIsInNldFYiLCJpblYiLCJnZXRWIiwiZ2V0UmVzdGluZ1YiLCJnZXRDbSIsImdldEVsYXBzZWRUaW1lIiwicmVzZXRFbGFwc2VkVGltZSIsImdldE4iLCJnZXRNIiwiZ2V0SCIsInZvbHRhZ2UiLCJnZXRWQ2xhbXBPbiIsImdldF92Q2xhbXBWYWx1ZSIsImdldE1lbWJyYW5lVm9sdGFnZSIsImdldFN0YXRlIiwiZ2V0Q29weSIsInNldFN0YXRlIiwic3RhdGUiLCJzdGltdWxhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vZGlmaWVkSG9kZ2tpbkh1eGxleU1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogVGhpcyBjbGFzcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgSG9kZ2tpbi1IdXhsZXkgbW9kZWwgdGhhdCBzdGFydGVkIGZyb20gYW4gZXhhbXBsZSB0YWtlbiBmcm9tIHRoZSB3ZWIgKHNlZVxyXG4gKiBVbmZ1ZGRsZSAjMjEyMSBmb3IgbW9yZSBpbmZvIG9uIHRoaXMpIGJ1dCB0aGF0IHdhcyBtb2RpZmllZCBzaWduaWZpY2FudGx5IHRvIGZpdCB0aGUgbmVlZHMgb2YgdGhpcyBzaW11bGF0aW9uLiAgVGhlXHJcbiAqIG1haW4gY2hhbmdlIGlzIHRoYXQgdGhlIHdheSB0aGF0IHRoZSBjb25kdWN0YW5jZSB2YWx1ZXMgYXJlIGNhbGN1bGF0ZWQgaXMgZGlmZmVyZW50LCBhbmQgbXVjaCBzaW1wbGVyLlxyXG4gKiA8cC8+XHJcbiAqIFRoaXMgd2FzIHVzZWQgd2l0aCBwZXJtaXNzaW9uIGZyb20gdGhlIG9yaWdpbmFsIGF1dGhvciBvZiB0aGUgZXhhbXBsZS5cclxuICpcclxuICogQGF1dGhvciBBbnRob255IEZvZG9yXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoZm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG5ldXJvbiBmcm9tICcuLi8uLi9uZXVyb24uanMnO1xyXG5pbXBvcnQgTmV1cm9uQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9OZXVyb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRGVsYXlCdWZmZXIgZnJvbSAnLi9EZWxheUJ1ZmZlci5qcyc7XHJcblxyXG4vKipcclxuICogQW1vdW50IG9mIHRpbWUgdXNlZCBmb3IgZWFjaCBpdGVyYXRpb24gb2YgdGhlIG1vZGVsLiAgVGhpcyBpcyBmaXhlZCwgYW5kIHdoZW4gdGhlIG1vZGVsIGlzIHN0ZXBwZWQgaXQgYnJlYWtzXHJcbiAqIHdoZXRoZXIgdGltZSBzdGVwIGlzIHByZXNlbnRlZCBpbnRvIHVuaXRzIG9mIHRoaXMgZHVyYXRpb24uICBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIGJlbG93IGEgY2VydGFpbiB0aW1lIHZhbHVlIHRoZVxyXG4gKiBtb2RlbCBkb2Vzbid0IHdvcmsgLSBpdCBiZWNvbWVzIHVuc3RhYmxlLlxyXG4gKi9cclxuY29uc3QgSU5URVJOQUxfVElNRV9TVEVQID0gMC4wMDU7IC8vIEluIG1pbGxpc2Vjb25kcywgbm90IHNlY29uZHMuXHJcbmNvbnN0IE1BWF9ERUxBWSA9IDAuMDAxOyAvLyBJbiBzZWNvbmRzIG9mIHNpbXVsYXRpb24gdGltZS5cclxuY2xhc3MgTW9kaWZpZWRIb2Rna2luSHV4bGV5TW9kZWwge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICB0aGlzLnBlck5hQ2hhbm5lbHMgPSAxMDA7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnBlcktDaGFubmVscyA9IDEwMDsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZWxhcHNlZFRpbWUgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy50aW1lU2luY2VBY3Rpb25Qb3RlbnRpYWwgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm0zaERlbGF5QnVmZmVyID0gbmV3IERlbGF5QnVmZmVyKCBNQVhfREVMQVksIE5ldXJvbkNvbnN0YW50cy5NSU5fQUNUSU9OX1BPVEVOVElBTF9DTE9DS19EVCApOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5uNERlbGF5QnVmZmVyID0gbmV3IERlbGF5QnVmZmVyKCBNQVhfREVMQVksIE5ldXJvbkNvbnN0YW50cy5NSU5fQUNUSU9OX1BPVEVOVElBTF9DTE9DS19EVCApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIHRoaXMucmVzdGluZ192ID0gNjU7Ly8gQHByaXZhdGUsIGZpbmFsIGRvZXNuJ3QgY2hhbmdlXHJcblxyXG4gICAgLy8gZGVsdGFzIG9mIHZvbHRhZ2UtZGVwZW5kZW50IGdhdGluZyBwYXJhbWV0ZXJzXHJcbiAgICB0aGlzLmRuID0gMDsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZG0gPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5kaCA9IDA7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgdGhpcy50aW1lUmVtYWluZGVyID0gMDsgLy8gQHByaXZhdGVcclxuXHJcbiAgICAvLyBFay1FciwgRW5hIC0gRXIsIEVsZWFrIC0gRXJcclxuICAgIHRoaXMudmsgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy52bmEgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy52bCA9IDA7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgdGhpcy5uNCA9IDA7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm0zaCA9IDA7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm5hX2N1cnJlbnQgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5rX2N1cnJlbnQgPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5sX2N1cnJlbnQgPSAwOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIHRoaXMudkNsYW1wT24gPSBmYWxzZTsgLy8gQHByaXZhdGVcclxuXHJcbiAgICB0aGlzLnZDbGFtcFZhbHVlID0gdGhpcy5jb252ZXJ0ViggMCApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIHRoaXMucmVzZXQoKTsvLyByZXNldCBhbmQgaW5pdGlhbGl6ZVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5uNERlbGF5QnVmZmVyLmNsZWFyKCk7XHJcbiAgICB0aGlzLm0zaERlbGF5QnVmZmVyLmNsZWFyKCk7XHJcblxyXG4gICAgdGhpcy5jbSA9IDE7Ly8gbWVtYnJhbmUgY2FwYWNpdGFuY2VcclxuICAgIHRoaXMudiA9IDA7Ly8gbWVtYnJhbmUgdm9sdGFnZVxyXG4gICAgdGhpcy52bmEgPSAtMTE1O1xyXG4gICAgdGhpcy52ayA9IDEyO1xyXG4gICAgdGhpcy52bCA9IDA7IC8vIE5PVEU6IE1vZGlmaWVkIGZyb20gLTEwLjYxMyBieSBqYmxhbmNvIG9uIDMvMTIvMjAxMCBpbiBvcmRlciB0byBtYWtlIHBvdGVudGlhbCBzdGF5IHN0ZWFkeVxyXG4gICAgLy8gYXQgdGhlIGRlc2lyZWQgcmVzdGluZyBwb3RlbnRpYWwuXHJcblxyXG4gICAgLy9jb25zdGFudCBsZWFrIHBlcm1lYWJpbGl0aWVzXHJcbiAgICB0aGlzLmduYSA9IHRoaXMucGVyTmFDaGFubmVscyAqIDEyMCAvIDEwMDtcclxuICAgIHRoaXMuZ2sgPSB0aGlzLnBlcktDaGFubmVscyAqIDM2IC8gMTAwO1xyXG4gICAgdGhpcy5nbCA9IDAuMztcclxuXHJcbiAgICAvLyByYXRlIGNvbnN0YW50c1xyXG4gICAgdGhpcy5iaCA9IDEgLyAoIE1hdGguZXhwKCAoIHRoaXMudiArIDMwICkgLyAxMCApICsgMSApO1xyXG4gICAgdGhpcy5haCA9IDAuMDcgKiBNYXRoLmV4cCggdGhpcy52IC8gMjAgKTtcclxuICAgIHRoaXMuYm0gPSA0ICogTWF0aC5leHAoIHRoaXMudiAvIDE4ICk7XHJcbiAgICB0aGlzLmFtID0gMC4xICogKCB0aGlzLnYgKyAyNSApIC8gKCBNYXRoLmV4cCggKCB0aGlzLnYgKyAyNSApIC8gMTAgKSAtIDEgKTtcclxuICAgIHRoaXMuYm4gPSAwLjEyNSAqIE1hdGguZXhwKCB0aGlzLnYgLyA4MCApO1xyXG4gICAgdGhpcy5hbiA9IDAuMDEgKiAoIHRoaXMudiArIDEwICkgLyAoIE1hdGguZXhwKCAoIHRoaXMudiArIDEwICkgLyAxMCApIC0gMSApO1xyXG5cclxuICAgIC8vIHZvbHRhZ2UtZGVwZW5kZW50IGdhdGluZyBwYXJhbWV0ZXJzIC0gc3RhcnQgdGhlc2UgcGFyYW1ldGVycyBpbiBzdGVhZHkgc3RhdGVcclxuICAgIHRoaXMubiA9IHRoaXMuYW4gLyAoIHRoaXMuYW4gKyB0aGlzLmJuICk7XHJcbiAgICB0aGlzLm0gPSB0aGlzLmFtIC8gKCB0aGlzLmFtICsgdGhpcy5ibSApO1xyXG4gICAgdGhpcy5oID0gdGhpcy5haCAvICggdGhpcy5haCArIHRoaXMuYmggKTtcclxuXHJcbiAgICAvLyBUaW1lIHZhbHVlcy5cclxuICAgIHRoaXMudGltZVNpbmNlQWN0aW9uUG90ZW50aWFsID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0ZXBJblRpbWUoIGR0ICkge1xyXG4gICAgbGV0IG1vZGVsSXRlcmF0aW9uc1RvUnVuID0gTWF0aC5mbG9vciggKCBkdCAqIDEwMDAgKSAvIElOVEVSTkFMX1RJTUVfU1RFUCApO1xyXG4gICAgdGhpcy50aW1lUmVtYWluZGVyICs9ICggZHQgKiAxMDAwICkgJSBJTlRFUk5BTF9USU1FX1NURVA7XHJcbiAgICBpZiAoIHRoaXMudGltZVJlbWFpbmRlciA+PSBJTlRFUk5BTF9USU1FX1NURVAgKSB7XHJcbiAgICAgIC8vIEFkZCBhbiBhZGRpdGlvbmFsIGl0ZXJhdGlvbiBhbmQgcmVzZXQgdGhlIHRpbWUgcmVtYWluZGVyIGFjY3VtdWxhdGlvbi4gIFRoaXMgaXMga2luZCBvZiBsaWtlIGEgbGVhcCB5ZWFyLlxyXG4gICAgICBtb2RlbEl0ZXJhdGlvbnNUb1J1biArPSAxO1xyXG4gICAgICB0aGlzLnRpbWVSZW1haW5kZXIgLT0gSU5URVJOQUxfVElNRV9TVEVQO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0ZXAgdGhlIG1vZGVsIHRoZSBhcHByb3ByaWF0ZSBudW1iZXIgb2YgdGltZXMuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtb2RlbEl0ZXJhdGlvbnNUb1J1bjsgaSsrICkge1xyXG5cclxuICAgICAgdGhpcy5kaCA9ICggdGhpcy5haCAqICggMSAtIHRoaXMuaCApIC0gdGhpcy5iaCAqIHRoaXMuaCApICogSU5URVJOQUxfVElNRV9TVEVQO1xyXG4gICAgICB0aGlzLmRtID0gKCB0aGlzLmFtICogKCAxIC0gdGhpcy5tICkgLSB0aGlzLmJtICogdGhpcy5tICkgKiBJTlRFUk5BTF9USU1FX1NURVA7XHJcbiAgICAgIHRoaXMuZG4gPSAoIHRoaXMuYW4gKiAoIDEgLSB0aGlzLm4gKSAtIHRoaXMuYm4gKiB0aGlzLm4gKSAqIElOVEVSTkFMX1RJTUVfU1RFUDtcclxuXHJcbiAgICAgIHRoaXMuYmggPSAxIC8gKCBNYXRoLmV4cCggKCB0aGlzLnYgKyAzMCApIC8gMTAgKSArIDEgKTtcclxuICAgICAgdGhpcy5haCA9IDAuMDcgKiBNYXRoLmV4cCggdGhpcy52IC8gMjAgKTtcclxuICAgICAgdGhpcy5kaCA9ICggdGhpcy5haCAqICggMSAtIHRoaXMuaCApIC0gdGhpcy5iaCAqIHRoaXMuaCApICogSU5URVJOQUxfVElNRV9TVEVQO1xyXG4gICAgICB0aGlzLmJtID0gNCAqIE1hdGguZXhwKCB0aGlzLnYgLyAxOCApO1xyXG4gICAgICB0aGlzLmFtID0gMC4xICogKCB0aGlzLnYgKyAyNSApIC8gKCBNYXRoLmV4cCggKCB0aGlzLnYgKyAyNSApIC8gMTAgKSAtIDEgKTtcclxuICAgICAgdGhpcy5ibiA9IDAuMTI1ICogTWF0aC5leHAoIHRoaXMudiAvIDgwICk7XHJcbiAgICAgIHRoaXMuYW4gPSAwLjAxICogKCB0aGlzLnYgKyAxMCApIC8gKCBNYXRoLmV4cCggKCB0aGlzLnYgKyAxMCApIC8gMTAgKSAtIDEgKTtcclxuICAgICAgdGhpcy5kbSA9ICggdGhpcy5hbSAqICggMSAtIHRoaXMubSApIC0gdGhpcy5ibSAqIHRoaXMubSApICogSU5URVJOQUxfVElNRV9TVEVQO1xyXG4gICAgICB0aGlzLmRuID0gKCB0aGlzLmFuICogKCAxIC0gdGhpcy5uICkgLSB0aGlzLmJuICogdGhpcy5uICkgKiBJTlRFUk5BTF9USU1FX1NURVA7XHJcblxyXG4gICAgICAvLyBIZXJlIGlzIHdoZXJlIHRoZSBtYWluIGNoYW5nZSBpcyB0aGF0IG1ha2VzIHRoaXMgYSBcIm1vZGlmaWVkXCIgdmVyc2lvbiBvZiBIb2Rna2luLUh1eGxleS4gIE5vdGUgdGhhdCB0aGVcclxuICAgICAgLy8gbXVsdGlwbGllciB2YWx1ZXMgd2VyZSBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5IGZyb20gcnVubmluZyB0aGUgbW9yZSBzdGFuZGFyZCBISCBtb2RlbC5cclxuXHJcbiAgICAgIC8vIEJlbG93LCBjb21tZW50ZWQgb3V0LCBpcyB0aGUgY29kZSB0aGF0IGEgcmVhbCBISCBtb2RlbCB3b3VsZCB1c2UuXHJcbiAgICAgIC8vIG40ID0gbipuKm4qbjtcclxuICAgICAgLy8gbTNoID0gbSptKm0qaDtcclxuXHJcbiAgICAgIC8vIE5ldyB2YWx1ZXMgdHJpZWQgYnkgTm9haCBQIG9uIDMvMTAvMTBcclxuICAgICAgdGhpcy5uNCA9IDAuNTUgKiBNYXRoLmV4cCggLTEgLyAwLjU1ICogTWF0aC5wb3coIHRoaXMudGltZVNpbmNlQWN0aW9uUG90ZW50aWFsIC0gMS43NSwgMiApICk7XHJcbiAgICAgIHRoaXMubTNoID0gMC4zICogTWF0aC5leHAoIC0xIC8gMC4yICogTWF0aC5wb3coIHRoaXMudGltZVNpbmNlQWN0aW9uUG90ZW50aWFsIC0gMS4wLCAyICkgKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBuNCBhbmQgbTNoIHZhbHVlcyBhcmUgYmVsb3cgYSBjZXJ0YWluIGxldmVsLCBnbyBhaGVhZCBhbmQgc2V0IHRoZW0gdG8gemVyby4gIFRoaXMgaGVscHMgb3RoZXIgcGFydHMgb2ZcclxuICAgICAgLy8gdGhlIHNpbXVsYXRpb24gZGV0ZXJtaW5lIHdoZW4gYW4gYWN0aW9uIHBvdGVudGlhbCBoYXMgZW5kZWQuICBUaGUgdGhyZXNob2xkcyB3ZXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgICAgIGlmICggdGhpcy5uNCA8IDFFLTUgKSB7XHJcbiAgICAgICAgdGhpcy5uNCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLm0zaCA8IDFFLTUgKSB7XHJcbiAgICAgICAgdGhpcy5tM2ggPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGN1cnJlbnRzIGJhc2VkIG9uIHRoZSBjb25kdWN0YW5jZSB2YWx1ZXMuXHJcbiAgICAgIHRoaXMubmFfY3VycmVudCA9IHRoaXMuZ25hICogdGhpcy5tM2ggKiAoIHRoaXMudiAtIHRoaXMudm5hICk7XHJcbiAgICAgIHRoaXMua19jdXJyZW50ID0gdGhpcy5nayAqIHRoaXMubjQgKiAoIHRoaXMudiAtIHRoaXMudmsgKTtcclxuICAgICAgdGhpcy5sX2N1cnJlbnQgPSB0aGlzLmdsICogKCB0aGlzLnYgLSB0aGlzLnZsICk7XHJcblxyXG4gICAgICB0aGlzLmR2ID0gLTEgKiBJTlRFUk5BTF9USU1FX1NURVAgKiAoIHRoaXMua19jdXJyZW50ICsgdGhpcy5uYV9jdXJyZW50ICsgdGhpcy5sX2N1cnJlbnQgKSAvIHRoaXMuY207XHJcblxyXG4gICAgICB0aGlzLnYgKz0gdGhpcy5kdjtcclxuICAgICAgdGhpcy5oICs9IHRoaXMuZGg7XHJcbiAgICAgIHRoaXMubSArPSB0aGlzLmRtO1xyXG4gICAgICB0aGlzLm4gKz0gdGhpcy5kbjtcclxuXHJcbiAgICAgIHRoaXMuZWxhcHNlZFRpbWUgKz0gSU5URVJOQUxfVElNRV9TVEVQO1xyXG4gICAgICBpZiAoIHRoaXMudGltZVNpbmNlQWN0aW9uUG90ZW50aWFsIDwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICkge1xyXG4gICAgICAgIHRoaXMudGltZVNpbmNlQWN0aW9uUG90ZW50aWFsICs9IElOVEVSTkFMX1RJTUVfU1RFUDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubTNoRGVsYXlCdWZmZXIuYWRkVmFsdWUoIHRoaXMubTNoLCBkdCApO1xyXG4gICAgdGhpcy5uNERlbGF5QnVmZmVyLmFkZFZhbHVlKCB0aGlzLm40LCBkdCApO1xyXG5cclxuICAgIGlmICggdGhpcy52Q2xhbXBPbiApIHtcclxuICAgICAgdGhpcy52ID0gdGhpcy52Q2xhbXBWYWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRfbjQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5uNDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGRlbGF5ZWQgdmVyc2lvbiBvZiB0aGUgbl40IGFtb3VudCwgd2hpY2ggaXMgdGhlIHZhcmlhYmxlIGZhY3RvciB0aGF0IGdvdmVybnMgdGhlIHBvdGFzc2l1bSBjaGFubmVsXHJcbiAgICogY29uZHVjdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsYXlBbW91bnQgLSB0aW1lIGRlbGF5IGluIHNlY29uZHNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRfZGVsYXllZF9uNCggZGVsYXlBbW91bnQgKSB7XHJcbiAgICBpZiAoIGRlbGF5QW1vdW50IDw9IDAgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm40O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm40RGVsYXlCdWZmZXIuZ2V0RGVsYXllZFZhbHVlKCBkZWxheUFtb3VudCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldF9tM2goKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tM2g7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZWxheWVkIHZlcnNpb24gb2YgdGhlIG0zaCBhbW91bnQsIHdoaWNoIGlzIHRoZSB2YXJpYWJsZSBmYWN0b3JcclxuICAgKiB0aGF0IGdvdmVybnMgdGhlIHNvZGl1bSBjaGFubmVsIGNvbmR1Y3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbGF5QW1vdW50IC0gdGltZSBkZWxheSBpbiBzZWNvbmRzXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0X2RlbGF5ZWRfbTNoKCBkZWxheUFtb3VudCApIHtcclxuICAgIGxldCBkZWxheWVkTTNoID0gMDtcclxuXHJcbiAgICBpZiAoIGRlbGF5QW1vdW50IDw9IDAgKSB7XHJcbiAgICAgIGRlbGF5ZWRNM2ggPSB0aGlzLm0zaDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBkZWxheWVkTTNoID0gdGhpcy5tM2hEZWxheUJ1ZmZlci5nZXREZWxheWVkVmFsdWUoIGRlbGF5QW1vdW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlbGF5ZWRNM2g7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0RW5hKCkge1xyXG4gICAgcmV0dXJuICggLTEgKiAoIHRoaXMudm5hICsgdGhpcy5yZXN0aW5nX3YgKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldEVrKCkge1xyXG4gICAgcmV0dXJuICggLTEgKiAoIHRoaXMudmsgKyB0aGlzLnJlc3RpbmdfdiApICk7XHJcbiAgfVxyXG5cclxuICAvLyBOT1RFOiBBIG51bWJlciBvZiB1bnVzZWQgc2V0dGVycyB3ZXJlIHJlbW92ZWQgZnJvbSB0aGlzIHBvcnRpb24gb2YgdGhlIGNvZGUgYmVjYXVzZSB0aGV5IHdlcmUgdW51c2VkIGFuZCBJXHJcbiAgLy8gKEBqYnBoZXQpIGZlbHQgdGhhdCBpZiB0aGV5IHdlcmVuJ3QgYXZhaWxhYmxlIHZpYSBzZXR0ZXJzIEkgY291bGQgbW9yZSBzYWZlbHkgYXNzdW1lIHRoYXQgdGhlIGRpZG4ndCBuZWVkIHRvXHJcbiAgLy8gYmUgbWFpbnRhaW5lZCBhcyBwYXJ0IG9mIHRoZSBvYmplY3QncyBzZXJpYWxpemFibGUgc3RhdGUuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25ldXJvbi9pc3N1ZXMvOTJcclxuICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldF9uYV9jdXJyZW50KCkge1xyXG4gICAgcmV0dXJuIC0xICogdGhpcy5uYV9jdXJyZW50O1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldF9rX2N1cnJlbnQoKSB7XHJcbiAgICByZXR1cm4gLTEgKiB0aGlzLmtfY3VycmVudDtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRfbF9jdXJyZW50KCkge1xyXG4gICAgcmV0dXJuIC0xICogdGhpcy5sX2N1cnJlbnQ7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0UGVyTmFDaGFubmVscygpIHtcclxuICAgIHJldHVybiB0aGlzLnBlck5hQ2hhbm5lbHM7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0UGVyS0NoYW5uZWxzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucGVyS0NoYW5uZWxzO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldF9naygpIHtcclxuICAgIHJldHVybiB0aGlzLmdrO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldF9nbmEoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nbmE7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0X2dsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2w7XHJcbiAgfVxyXG5cclxuICAvLyByZW1lbWJlciB0aGF0IEgmSCB2b2x0YWdlcyBhcmUgLTEgKiBwcmVzZW50IGNvbnZlbnRpb25cclxuICAvLyBzaG91bGQgZXZlbnR1YWxseSBjYWxjdWxhdGUgdGhpcyBpbnN0ZWFkIG9mIHNldHRpbmcgaXRcclxuICAvLyBjb252ZXJ0IGJldHdlZW4gaW50ZXJuYWwgdXNlIG9mIFYgYW5kIHRoZSB1c2VyJ3MgZXhwZWN0YXRpb25zXHJcbiAgLy8gdGhlIFYgd2lsbCBiZSBtZW1icmFuZSB2b2x0YWdlIHVzaW5nIHByZXNlbnQgZGF5IGNvbnZlbnRpb25zXHJcbiAgLy8gc2VlIHAuIDUwNSBvZiBIb2Rna2luICYgSHV4bGV5LCBKIFBoeXNpb2wuIDE5NTIsIDExNzo1MDAtNTQ0XHJcbiAgLy8gQHB1YmxpY1xyXG4gIHNldFYoIGluViApIHtcclxuICAgIHRoaXMudiA9IC0xICogaW5WIC0gdGhpcy5yZXN0aW5nX3Y7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0VigpIHtcclxuICAgIHJldHVybiAtMSAqICggdGhpcy52ICsgdGhpcy5yZXN0aW5nX3YgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRSZXN0aW5nVigpIHtcclxuICAgIHJldHVybiAtMSAqIHRoaXMucmVzdGluZ192O1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldENtKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY207XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0RWxhcHNlZFRpbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGFwc2VkVGltZTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZXNldEVsYXBzZWRUaW1lKCkge1xyXG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDAuMDtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXROKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubjtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRNKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRIKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgdm9sdGFnZSBmcm9tIHRoZSBtb2Rlcm4gY29udmVudGlvbiB0byB0aGUgY29udmVudGlvbiB1c2VkIGJ5IHRoZSBwcm9ncmFtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjb252ZXJ0Viggdm9sdGFnZSApIHtcclxuICAgIHJldHVybiAoIC0xICogdm9sdGFnZSAtIHRoaXMucmVzdGluZ192ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0VkNsYW1wT24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy52Q2xhbXBPbjtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRfdkNsYW1wVmFsdWUoKSB7XHJcbiAgICByZXR1cm4gKCAtMSAqICggdGhpcy52Q2xhbXBWYWx1ZSArIHRoaXMucmVzdGluZ192ICkgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBnZXRNZW1icmFuZVZvbHRhZ2UoKSB7XHJcbiAgICAvLyBnZXRWKCkgY29udmVydHMgdGhlIG1vZGVsJ3MgdiB0byBwcmVzZW50IGRheSBjb252ZW50aW9uXHJcbiAgICByZXR1cm4gdGhpcy5nZXRWKCkgLyAxMDAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBzdGF0ZSBvZiB0aGUgbW9kZWwuICBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIGluIHN1cHBvcnQgb2YgcmVjb3JkIGFuZCBwbGF5YmFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0U3RhdGUoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhaDogdGhpcy5haCxcclxuICAgICAgaDogdGhpcy5oLFxyXG4gICAgICBiaDogdGhpcy5iaCxcclxuICAgICAgYW06IHRoaXMuYW0sXHJcbiAgICAgIG06IHRoaXMubSxcclxuICAgICAgYm06IHRoaXMuYm0sXHJcbiAgICAgIGFuOiB0aGlzLmFuLFxyXG4gICAgICBuOiB0aGlzLm4sXHJcbiAgICAgIGJuOiB0aGlzLmJuLFxyXG4gICAgICB2OiB0aGlzLnYsXHJcbiAgICAgIHRpbWVTaW5jZUFjdGlvblBvdGVudGlhbDogdGhpcy50aW1lU2luY2VBY3Rpb25Qb3RlbnRpYWwsXHJcbiAgICAgIG0zaERlbGF5QnVmZmVyOiB0aGlzLm0zaERlbGF5QnVmZmVyLmdldENvcHkoKSxcclxuICAgICAgbjREZWxheUJ1ZmZlcjogdGhpcy5uNERlbGF5QnVmZmVyLmdldENvcHkoKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgc3RhdGUgb2YgdGhlIG1vZGVsLiAgVGhpcyBpcyBnZW5lcmFsbHkgdXNlZCBpbiBzdXBwb3J0IG9mIHJlY29yZCBhbmQgcGxheWJhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFN0YXRlKCBzdGF0ZSApIHtcclxuICAgIHRoaXMuYWggPSBzdGF0ZS5haDtcclxuICAgIHRoaXMuaCA9IHN0YXRlLmg7XHJcbiAgICB0aGlzLmJoID0gc3RhdGUuYmg7XHJcbiAgICB0aGlzLmFtID0gc3RhdGUuYW07XHJcbiAgICB0aGlzLm0gPSBzdGF0ZS5tO1xyXG4gICAgdGhpcy5ibSA9IHN0YXRlLmJtO1xyXG4gICAgdGhpcy5hbiA9IHN0YXRlLmFuO1xyXG4gICAgdGhpcy5uID0gc3RhdGUubjtcclxuICAgIHRoaXMuYm4gPSBzdGF0ZS5ibjtcclxuICAgIHRoaXMudiA9IHN0YXRlLnY7XHJcbiAgICB0aGlzLnRpbWVTaW5jZUFjdGlvblBvdGVudGlhbCA9IHN0YXRlLnRpbWVTaW5jZUFjdGlvblBvdGVudGlhbDtcclxuXHJcbiAgICAvLyBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgdXNlIHRoZSBhY3R1YWwgZGVsYXkgYnVmZmVyIGluIHRoZSBzdGF0ZSwgd2hpY2ggc2hvdWxkIGJlIHNhZmUgc2luY2UgdGhlIHN0YXRlc1xyXG4gICAgLy8gc2hvdWxkIG5vdCBoYXZlIGJlZW4gYWx0ZXJlZCBhbnl3aGVyZS5cclxuICAgIHRoaXMubTNoRGVsYXlCdWZmZXIgPSBzdGF0ZS5tM2hEZWxheUJ1ZmZlcjtcclxuICAgIHRoaXMubjREZWxheUJ1ZmZlciA9IHN0YXRlLm40RGVsYXlCdWZmZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGltdWxhdGUgdGhlIG5ldXJvbiBpbiBhIHdheSB0aGF0IHNpbXVsYXRlcyBhIGRlcG9sYXJpemF0aW9uIHNpZ25hbFxyXG4gICAqIGNvbWluZyB0byB0aGlzIG5ldXJvbi4gIElmIHRoZSBuZXVyb24gaXMgaW4gdGhlIGNvcnJlY3Qgc3RhdGUsIHRoaXNcclxuICAgKiB3aWxsIHRyaWdnZXIgYW4gYWN0aW9uIHBvdGVudGlhbC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RpbXVsYXRlKCkge1xyXG4gICAgLy8gQWRkIGEgZml4ZWQgYW1vdW50IHRvIHRoZSB2b2x0YWdlIGFjcm9zcyB0aGUgbWVtYnJhbmUuXHJcbiAgICB0aGlzLnNldFYoIHRoaXMuZ2V0VigpICsgMTUgKTtcclxuICAgIHRoaXMudGltZVNpbmNlQWN0aW9uUG90ZW50aWFsID0gMDtcclxuICB9XHJcbn1cclxuXHJcbm5ldXJvbi5yZWdpc3RlciggJ01vZGlmaWVkSG9kZ2tpbkh1eGxleU1vZGVsJywgTW9kaWZpZWRIb2Rna2luSHV4bGV5TW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGlmaWVkSG9kZ2tpbkh1eGxleU1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSxpQkFBaUI7QUFDcEMsT0FBT0MsZUFBZSxNQUFNLDhCQUE4QjtBQUMxRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDbEMsTUFBTUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1D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