// Copyright 2018-2022, University of Colorado Boulder

/**
 * The model for the Light scene, which adds the intensity sampling for the screen at the right hand side.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import waveInterference from '../../waveInterference.js';
import IntensitySample from './IntensitySample.js';
import Scene from './Scene.js';
class LightScene extends Scene {
  // reads out the intensity on the right hand side of the lattice
  // While this is annotated as 'read-only' for assignment, it can be mutated by clients.

  soundEffectEnabledProperty = new BooleanProperty(false);

  /**
   * @param config - see Scene for required properties
   */
  constructor(config) {
    super(config);
    this.intensitySample = new IntensitySample(this.lattice);
  }

  /**
   * Don't play the wave generator button sound if another sound would be generated, or if another sound is ending due
   * to the button press.
   */
  waveGeneratorButtonSound(pressed) {
    if (!this.soundEffectEnabledProperty.value) {
      super.waveGeneratorButtonSound(this.button1PressedProperty.value);
    }
  }

  /**
   * The wave area resets when the wavelength changes in the light scene
   */
  handlePhaseChanged() {
    this.clear();
  }

  /**
   * Clears the scene.
   */
  clear() {
    super.clear();

    // Permit calls to clear before subclass is initialized
    this.intensitySample && this.intensitySample.clear();
  }
  advanceTime(wallDT, manualStep) {
    super.advanceTime(wallDT, manualStep);
    this.intensitySample.step();
  }
  reset() {
    super.reset();
    this.soundEffectEnabledProperty.reset();
  }
}
waveInterference.register('LightScene', LightScene);
export default LightScene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiSW50ZW5zaXR5U2FtcGxlIiwiU2NlbmUiLCJMaWdodFNjZW5lIiwic291bmRFZmZlY3RFbmFibGVkUHJvcGVydHkiLCJjb25zdHJ1Y3RvciIsImNvbmZpZyIsImludGVuc2l0eVNhbXBsZSIsImxhdHRpY2UiLCJ3YXZlR2VuZXJhdG9yQnV0dG9uU291bmQiLCJwcmVzc2VkIiwidmFsdWUiLCJidXR0b24xUHJlc3NlZFByb3BlcnR5IiwiaGFuZGxlUGhhc2VDaGFuZ2VkIiwiY2xlYXIiLCJhZHZhbmNlVGltZSIsIndhbGxEVCIsIm1hbnVhbFN0ZXAiLCJzdGVwIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxpZ2h0U2NlbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1vZGVsIGZvciB0aGUgTGlnaHQgc2NlbmUsIHdoaWNoIGFkZHMgdGhlIGludGVuc2l0eSBzYW1wbGluZyBmb3IgdGhlIHNjcmVlbiBhdCB0aGUgcmlnaHQgaGFuZCBzaWRlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgd2F2ZUludGVyZmVyZW5jZSBmcm9tICcuLi8uLi93YXZlSW50ZXJmZXJlbmNlLmpzJztcclxuaW1wb3J0IEludGVuc2l0eVNhbXBsZSBmcm9tICcuL0ludGVuc2l0eVNhbXBsZS5qcyc7XHJcbmltcG9ydCBTY2VuZSwgeyBTY2VuZU9wdGlvbnMgfSBmcm9tICcuL1NjZW5lLmpzJztcclxuXHJcbmNsYXNzIExpZ2h0U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcblxyXG4gIC8vIHJlYWRzIG91dCB0aGUgaW50ZW5zaXR5IG9uIHRoZSByaWdodCBoYW5kIHNpZGUgb2YgdGhlIGxhdHRpY2VcclxuICAvLyBXaGlsZSB0aGlzIGlzIGFubm90YXRlZCBhcyAncmVhZC1vbmx5JyBmb3IgYXNzaWdubWVudCwgaXQgY2FuIGJlIG11dGF0ZWQgYnkgY2xpZW50cy5cclxuICBwdWJsaWMgcmVhZG9ubHkgaW50ZW5zaXR5U2FtcGxlOiBJbnRlbnNpdHlTYW1wbGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNvdW5kRWZmZWN0RW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNvbmZpZyAtIHNlZSBTY2VuZSBmb3IgcmVxdWlyZWQgcHJvcGVydGllc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29uZmlnOiBTY2VuZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggY29uZmlnICk7XHJcblxyXG4gICAgdGhpcy5pbnRlbnNpdHlTYW1wbGUgPSBuZXcgSW50ZW5zaXR5U2FtcGxlKCB0aGlzLmxhdHRpY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvbid0IHBsYXkgdGhlIHdhdmUgZ2VuZXJhdG9yIGJ1dHRvbiBzb3VuZCBpZiBhbm90aGVyIHNvdW5kIHdvdWxkIGJlIGdlbmVyYXRlZCwgb3IgaWYgYW5vdGhlciBzb3VuZCBpcyBlbmRpbmcgZHVlXHJcbiAgICogdG8gdGhlIGJ1dHRvbiBwcmVzcy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgd2F2ZUdlbmVyYXRvckJ1dHRvblNvdW5kKCBwcmVzc2VkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgaWYgKCAhdGhpcy5zb3VuZEVmZmVjdEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgc3VwZXIud2F2ZUdlbmVyYXRvckJ1dHRvblNvdW5kKCB0aGlzLmJ1dHRvbjFQcmVzc2VkUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB3YXZlIGFyZWEgcmVzZXRzIHdoZW4gdGhlIHdhdmVsZW5ndGggY2hhbmdlcyBpbiB0aGUgbGlnaHQgc2NlbmVcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaGFuZGxlUGhhc2VDaGFuZ2VkKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIHRoZSBzY2VuZS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY2xlYXIoKTogdm9pZCB7XHJcbiAgICBzdXBlci5jbGVhcigpO1xyXG5cclxuICAgIC8vIFBlcm1pdCBjYWxscyB0byBjbGVhciBiZWZvcmUgc3ViY2xhc3MgaXMgaW5pdGlhbGl6ZWRcclxuICAgIHRoaXMuaW50ZW5zaXR5U2FtcGxlICYmIHRoaXMuaW50ZW5zaXR5U2FtcGxlLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgYWR2YW5jZVRpbWUoIHdhbGxEVDogbnVtYmVyLCBtYW51YWxTdGVwOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgc3VwZXIuYWR2YW5jZVRpbWUoIHdhbGxEVCwgbWFudWFsU3RlcCApO1xyXG4gICAgdGhpcy5pbnRlbnNpdHlTYW1wbGUuc3RlcCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuc291bmRFZmZlY3RFbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVJbnRlcmZlcmVuY2UucmVnaXN0ZXIoICdMaWdodFNjZW5lJywgTGlnaHRTY2VuZSApO1xyXG5leHBvcnQgZGVmYXVsdCBMaWdodFNjZW5lOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLEtBQUssTUFBd0IsWUFBWTtBQUVoRCxNQUFNQyxVQUFVLFNBQVNELEtBQUssQ0FBQztFQUU3QjtFQUNBOztFQUVnQkUsMEJBQTBCLEdBQUcsSUFBSUwsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7RUFFekU7QUFDRjtBQUNBO0VBQ1NNLFdBQVdBLENBQUVDLE1BQW9CLEVBQUc7SUFDekMsS0FBSyxDQUFFQSxNQUFPLENBQUM7SUFFZixJQUFJLENBQUNDLGVBQWUsR0FBRyxJQUFJTixlQUFlLENBQUUsSUFBSSxDQUFDTyxPQUFRLENBQUM7RUFDNUQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDa0JDLHdCQUF3QkEsQ0FBRUMsT0FBZ0IsRUFBUztJQUNqRSxJQUFLLENBQUMsSUFBSSxDQUFDTiwwQkFBMEIsQ0FBQ08sS0FBSyxFQUFHO01BQzVDLEtBQUssQ0FBQ0Ysd0JBQXdCLENBQUUsSUFBSSxDQUFDRyxzQkFBc0IsQ0FBQ0QsS0FBTSxDQUFDO0lBQ3JFO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ3FCRSxrQkFBa0JBLENBQUEsRUFBUztJQUM1QyxJQUFJLENBQUNDLEtBQUssQ0FBQyxDQUFDO0VBQ2Q7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQSxLQUFLQSxDQUFBLEVBQVM7SUFDNUIsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQzs7SUFFYjtJQUNBLElBQUksQ0FBQ1AsZUFBZSxJQUFJLElBQUksQ0FBQ0EsZUFBZSxDQUFDTyxLQUFLLENBQUMsQ0FBQztFQUN0RDtFQUVnQkMsV0FBV0EsQ0FBRUMsTUFBYyxFQUFFQyxVQUFtQixFQUFTO0lBQ3ZFLEtBQUssQ0FBQ0YsV0FBVyxDQUFFQyxNQUFNLEVBQUVDLFVBQVcsQ0FBQztJQUN2QyxJQUFJLENBQUNWLGVBQWUsQ0FBQ1csSUFBSSxDQUFDLENBQUM7RUFDN0I7RUFFZ0JDLEtBQUtBLENBQUEsRUFBUztJQUM1QixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDZiwwQkFBMEIsQ0FBQ2UsS0FBSyxDQUFDLENBQUM7RUFDekM7QUFDRjtBQUVBbkIsZ0JBQWdCLENBQUNvQixRQUFRLENBQUUsWUFBWSxFQUFFakIsVUFBVyxDQUFDO0FBQ3JELGVBQWVBLFVBQVUifQ==