// Copyright 2018-2022, University of Colorado Boulder

/**
 * Keeps track of the history of wave values on the right edge of the visible wave area, for displaying intensity in
 * the LightScreenNode and IntensityGraphPanel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import waveInterference from '../../waveInterference.js';
// constants
// Number of samples to use for a temporal average.  Higher number means more latency and smoother. Lower number means
// lower latency, but more bouncy.
const HISTORY_LENGTH = 90;
class IntensitySample {
  // signifies when the intensitySample has changed values.
  changedEmitter = new Emitter();

  // each element is one output column
  history = [];
  constructor(lattice) {
    this.lattice = lattice;
    this.clear();
  }

  /**
   * Gets the intensity values of the rightmost column in the visible wave area.
   */
  getIntensityValues() {
    const intensities = [];
    for (let i = 0; i < this.history[0].length; i++) {
      let sum = 0;
      for (let k = 0; k < this.history.length; k++) {
        // squared for intensity, see https://physics.info/intensity/
        sum = sum + this.history[k][i] * this.history[k][i];
      }
      intensities.push(sum / this.history.length);
    }
    const averagedIntensities = [];
    averagedIntensities.length = intensities.length;

    // End points only have one neighbor, so they get a 2-point average
    averagedIntensities[0] = (intensities[0] + intensities[1]) / 2;
    averagedIntensities[averagedIntensities.length - 1] = (intensities[averagedIntensities.length - 1] + intensities[averagedIntensities.length - 2]) / 2;

    // Interior points average over self + both neighbors
    for (let i = 1; i < intensities.length - 1; i++) {
      averagedIntensities[i] = (intensities[i - 1] + intensities[i] + intensities[i + 1]) / 3;
    }
    return averagedIntensities;
  }

  /**
   * Removes all data, used when resetting or changing scenes.
   */
  clear() {
    this.history.length = 0;
    this.step(); // populate with one column
  }

  /**
   * Update the intensity samples when the lattice has updated.
   */
  step() {
    this.history.push(this.lattice.getOutputColumn());
    if (this.history.length > HISTORY_LENGTH) {
      this.history.shift();
    }
    this.changedEmitter.emit();
  }
}
waveInterference.register('IntensitySample', IntensitySample);
export default IntensitySample;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwid2F2ZUludGVyZmVyZW5jZSIsIkhJU1RPUllfTEVOR1RIIiwiSW50ZW5zaXR5U2FtcGxlIiwiY2hhbmdlZEVtaXR0ZXIiLCJoaXN0b3J5IiwiY29uc3RydWN0b3IiLCJsYXR0aWNlIiwiY2xlYXIiLCJnZXRJbnRlbnNpdHlWYWx1ZXMiLCJpbnRlbnNpdGllcyIsImkiLCJsZW5ndGgiLCJzdW0iLCJrIiwicHVzaCIsImF2ZXJhZ2VkSW50ZW5zaXRpZXMiLCJzdGVwIiwiZ2V0T3V0cHV0Q29sdW1uIiwic2hpZnQiLCJlbWl0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRlbnNpdHlTYW1wbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogS2VlcHMgdHJhY2sgb2YgdGhlIGhpc3Rvcnkgb2Ygd2F2ZSB2YWx1ZXMgb24gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHZpc2libGUgd2F2ZSBhcmVhLCBmb3IgZGlzcGxheWluZyBpbnRlbnNpdHkgaW5cclxuICogdGhlIExpZ2h0U2NyZWVuTm9kZSBhbmQgSW50ZW5zaXR5R3JhcGhQYW5lbC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgd2F2ZUludGVyZmVyZW5jZSBmcm9tICcuLi8uLi93YXZlSW50ZXJmZXJlbmNlLmpzJztcclxuaW1wb3J0IExhdHRpY2UgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0xhdHRpY2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIE51bWJlciBvZiBzYW1wbGVzIHRvIHVzZSBmb3IgYSB0ZW1wb3JhbCBhdmVyYWdlLiAgSGlnaGVyIG51bWJlciBtZWFucyBtb3JlIGxhdGVuY3kgYW5kIHNtb290aGVyLiBMb3dlciBudW1iZXIgbWVhbnNcclxuLy8gbG93ZXIgbGF0ZW5jeSwgYnV0IG1vcmUgYm91bmN5LlxyXG5jb25zdCBISVNUT1JZX0xFTkdUSCA9IDkwO1xyXG5cclxuY2xhc3MgSW50ZW5zaXR5U2FtcGxlIHtcclxuXHJcbiAgLy8gc2lnbmlmaWVzIHdoZW4gdGhlIGludGVuc2l0eVNhbXBsZSBoYXMgY2hhbmdlZCB2YWx1ZXMuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgLy8gZWFjaCBlbGVtZW50IGlzIG9uZSBvdXRwdXQgY29sdW1uXHJcbiAgcHVibGljIHJlYWRvbmx5IGhpc3Rvcnk6IG51bWJlcltdW10gPSBbXTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcml2YXRlIHJlYWRvbmx5IGxhdHRpY2U6IExhdHRpY2UgKSB7XHJcbiAgICB0aGlzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBpbnRlbnNpdHkgdmFsdWVzIG9mIHRoZSByaWdodG1vc3QgY29sdW1uIGluIHRoZSB2aXNpYmxlIHdhdmUgYXJlYS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0SW50ZW5zaXR5VmFsdWVzKCk6IG51bWJlcltdIHtcclxuICAgIGNvbnN0IGludGVuc2l0aWVzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmhpc3RvcnlbIDAgXS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgbGV0IHN1bSA9IDA7XHJcbiAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMuaGlzdG9yeS5sZW5ndGg7IGsrKyApIHtcclxuXHJcbiAgICAgICAgLy8gc3F1YXJlZCBmb3IgaW50ZW5zaXR5LCBzZWUgaHR0cHM6Ly9waHlzaWNzLmluZm8vaW50ZW5zaXR5L1xyXG4gICAgICAgIHN1bSA9IHN1bSArIHRoaXMuaGlzdG9yeVsgayBdWyBpIF0gKiB0aGlzLmhpc3RvcnlbIGsgXVsgaSBdO1xyXG4gICAgICB9XHJcbiAgICAgIGludGVuc2l0aWVzLnB1c2goIHN1bSAvIHRoaXMuaGlzdG9yeS5sZW5ndGggKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdmVyYWdlZEludGVuc2l0aWVzID0gW107XHJcbiAgICBhdmVyYWdlZEludGVuc2l0aWVzLmxlbmd0aCA9IGludGVuc2l0aWVzLmxlbmd0aDtcclxuXHJcbiAgICAvLyBFbmQgcG9pbnRzIG9ubHkgaGF2ZSBvbmUgbmVpZ2hib3IsIHNvIHRoZXkgZ2V0IGEgMi1wb2ludCBhdmVyYWdlXHJcbiAgICBhdmVyYWdlZEludGVuc2l0aWVzWyAwIF0gPSAoIGludGVuc2l0aWVzWyAwIF0gKyBpbnRlbnNpdGllc1sgMSBdICkgLyAyO1xyXG4gICAgYXZlcmFnZWRJbnRlbnNpdGllc1sgYXZlcmFnZWRJbnRlbnNpdGllcy5sZW5ndGggLSAxIF0gPVxyXG4gICAgICAoIGludGVuc2l0aWVzWyBhdmVyYWdlZEludGVuc2l0aWVzLmxlbmd0aCAtIDEgXSArIGludGVuc2l0aWVzWyBhdmVyYWdlZEludGVuc2l0aWVzLmxlbmd0aCAtIDIgXSApIC8gMjtcclxuXHJcbiAgICAvLyBJbnRlcmlvciBwb2ludHMgYXZlcmFnZSBvdmVyIHNlbGYgKyBib3RoIG5laWdoYm9yc1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgaW50ZW5zaXRpZXMubGVuZ3RoIC0gMTsgaSsrICkge1xyXG4gICAgICBhdmVyYWdlZEludGVuc2l0aWVzWyBpIF0gPSAoIGludGVuc2l0aWVzWyBpIC0gMSBdICsgaW50ZW5zaXRpZXNbIGkgXSArIGludGVuc2l0aWVzWyBpICsgMSBdICkgLyAzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF2ZXJhZ2VkSW50ZW5zaXRpZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFsbCBkYXRhLCB1c2VkIHdoZW4gcmVzZXR0aW5nIG9yIGNoYW5naW5nIHNjZW5lcy5cclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICB0aGlzLmhpc3RvcnkubGVuZ3RoID0gMDtcclxuICAgIHRoaXMuc3RlcCgpOyAvLyBwb3B1bGF0ZSB3aXRoIG9uZSBjb2x1bW5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgaW50ZW5zaXR5IHNhbXBsZXMgd2hlbiB0aGUgbGF0dGljZSBoYXMgdXBkYXRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaGlzdG9yeS5wdXNoKCB0aGlzLmxhdHRpY2UuZ2V0T3V0cHV0Q29sdW1uKCkgKTtcclxuICAgIGlmICggdGhpcy5oaXN0b3J5Lmxlbmd0aCA+IEhJU1RPUllfTEVOR1RIICkge1xyXG4gICAgICB0aGlzLmhpc3Rvcnkuc2hpZnQoKTtcclxuICAgIH1cclxuICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ0ludGVuc2l0eVNhbXBsZScsIEludGVuc2l0eVNhbXBsZSApO1xyXG5leHBvcnQgZGVmYXVsdCBJbnRlbnNpdHlTYW1wbGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFHeEQ7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsY0FBYyxHQUFHLEVBQUU7QUFFekIsTUFBTUMsZUFBZSxDQUFDO0VBRXBCO0VBQ2dCQyxjQUFjLEdBQUcsSUFBSUosT0FBTyxDQUFDLENBQUM7O0VBRTlDO0VBQ2dCSyxPQUFPLEdBQWUsRUFBRTtFQUVqQ0MsV0FBV0EsQ0FBbUJDLE9BQWdCLEVBQUc7SUFBQSxLQUFuQkEsT0FBZ0IsR0FBaEJBLE9BQWdCO0lBQ25ELElBQUksQ0FBQ0MsS0FBSyxD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