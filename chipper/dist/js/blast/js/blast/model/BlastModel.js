// Copyright 2013-2021, University of Colorado Boulder
/**
 * Model for the 'Blast' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import blast from '../../blast.js';
import Particle from './Particle.js';
class BlastModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    // @public
    this.particle = new Particle(tandem);
  }

  /**
   * Reset the model.
   * @public
   */
  reset() {
    this.particle.reset();
  }

  /**
   * Move forward in time by the specified amount.
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.particle.step(dt);
  }
}
blast.register('BlastModel', BlastModel);
export default BlastModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJibGFzdCIsIlBhcnRpY2xlIiwiQmxhc3RNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwicGFydGljbGUiLCJyZXNldCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmxhc3RNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgJ0JsYXN0JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGJsYXN0IGZyb20gJy4uLy4uL2JsYXN0LmpzJztcclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4vUGFydGljbGUuanMnO1xyXG5cclxuY2xhc3MgQmxhc3RNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMucGFydGljbGUgPSBuZXcgUGFydGljbGUoIHRhbmRlbSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucGFydGljbGUucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgZm9yd2FyZCBpbiB0aW1lIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMucGFydGljbGUuc3RlcCggZHQgKTtcclxuICB9XHJcbn1cclxuXHJcbmJsYXN0LnJlZ2lzdGVyKCAnQmxhc3RNb2RlbCcsIEJsYXN0TW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmxhc3RNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sZ0JBQWdCO0FBQ2xDLE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBRXBDLE1BQU1DLFVBQVUsQ0FBQztFQUVmO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEI7SUFDQSxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJSixRQUFRLENBQUVHLE1BQU8sQ0FBQztFQUN4Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFRSxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNELFFBQVEsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7RUFDdkI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFDVCxJQUFJLENBQUNILFFBQVEsQ0FBQ0UsSUFBSSxDQUFFQyxFQUFHLENBQUM7RUFDMUI7QUFDRjtBQUVBUixLQUFLLENBQUNTLFFBQVEsQ0FBRSxZQUFZLEVBQUVQLFVBQVcsQ0FBQztBQUMxQyxlQUFlQSxVQUFVIn0=