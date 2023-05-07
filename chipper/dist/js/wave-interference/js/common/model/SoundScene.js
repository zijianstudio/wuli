// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * The model for the Sound scene, which adds SoundParticle instances.  See the following pages for visualizations
 * and physics of wave transmission
 * http://homepage.physics.uiowa.edu/~fskiff/Physics_044/Some%20more%20details%20on%20Sound.pdf
 * https://www.npr.org/2014/04/09/300563606/what-does-sound-look-like
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import Scene from './Scene.js';
import SoundParticle from './SoundParticle.js';

// constants
const SOUND_PARTICLE_GRADIENT_FORCE_SCALE = 0.67; // Additional scaling for the gradient force

class SoundScene extends Scene {
  /**
   * @param showSoundParticles - true if SoundParticles should be created and displayed
   * @param config - see Scene for required properties
   */
  constructor(showSoundParticles, config) {
    super(config);

    // @public (read-only) {boolean} - true if SoundParticles should be created and displayed.  They are not displayed
    // on the Slits screen, see https://github.com/phetsims/wave-interference/issues/109
    this.showSoundParticles = showSoundParticles;

    // @public - indicates the selected view for sound
    this.soundViewTypeProperty = new Property(SoundScene.SoundViewType.WAVES, {
      validValues: SoundScene.SoundViewType.VALUES
    });

    // @public (read-only) {SoundParticle[]} particles for the sound scene.
    this.soundParticles = [];

    // @public - indicates whether the user has selected to hear the sine wave
    this.isTonePlayingProperty = new BooleanProperty(false);
    if (this.showSoundParticles) {
      const SOUND_PARTICLE_ROWS = 20;
      const SOUND_PARTICLE_COLUMNS = 20;
      const RANDOM_RADIUS = 2;
      for (let i = 0; i <= SOUND_PARTICLE_ROWS; i++) {
        for (let k = 0; k <= SOUND_PARTICLE_COLUMNS; k++) {
          this.soundParticles.push(new SoundParticle(i, k, i * this.waveAreaWidth / SOUND_PARTICLE_ROWS + dotRandom.nextGaussian() * RANDOM_RADIUS, k * this.waveAreaWidth / SOUND_PARTICLE_COLUMNS + dotRandom.nextGaussian() * RANDOM_RADIUS));
        }
      }
    }
  }

  /**
   * The SoundScene always generates the speaker membrane sound, so no sound should be played when the wave generator
   * button is pressed.
   */
  waveGeneratorButtonSound(pressed) {

    // no-op
  }

  /**
   * Move forward in time by the specified amount, updating velocity and position of the SoundParticle instances
   * @param dt - amount of time to move forward, in the units of the scene
   */
  step(dt) {
    super.step(dt);
    if (this.showSoundParticles) {
      const lattice = this.lattice;

      // Increase the gradient force at low frequencies so we can still see the waves clearly.
      const k = Utils.linear(this.frequencyProperty.range.min, this.frequencyProperty.range.max, 130, 76, this.frequencyProperty.value) * SOUND_PARTICLE_GRADIENT_FORCE_SCALE;
      for (let i = 0; i < this.soundParticles.length; i++) {
        const soundParticle = this.soundParticles[i];

        // Find the lattice coordinate of the current position of the particle.  Use rounding for consistency with
        // other quantization
        const latticeCoordinate = this.modelToLatticeTransform.modelToViewXY(soundParticle.x, soundParticle.y);
        const latticeX = Utils.roundSymmetric(latticeCoordinate.x);
        const latticeY = Utils.roundSymmetric(latticeCoordinate.y);

        // Estimate the numerical gradient in the neighborhood of the particle
        // https://en.wikipedia.org/wiki/Pressure-gradient_force
        // https://en.wikipedia.org/wiki/Gradient
        // https://en.wikipedia.org/wiki/Numerical_differentiation

        // estimate the spatial derivative in the x-direction
        const fx2 = lattice.getCurrentValue(latticeX + 1, latticeY);
        const fx1 = lattice.getCurrentValue(latticeX - 1, latticeY);
        const gradientX = (fx2 - fx1) / 2;

        // estimate the spatial derivative in the y-direction
        const fy2 = lattice.getCurrentValue(latticeX, latticeY + 1);
        const fy1 = lattice.getCurrentValue(latticeX, latticeY - 1);
        const gradientY = (fy2 - fy1) / 2;
        const fx = gradientX * k;
        const fy = gradientY * k;
        if (!isNaN(fx) && !isNaN(fy)) {
          soundParticle.applyForce(fx * WaveInterferenceConstants.CALIBRATION_SCALE, fy * WaveInterferenceConstants.CALIBRATION_SCALE, dt, this);
        }
      }
    }
  }

  /**
   * Restores the initial conditions of this scene.
   */
  reset() {
    super.reset();
    this.soundViewTypeProperty.reset();
    this.isTonePlayingProperty.reset();
  }
}

/**
 * @public
 */
SoundScene.SoundViewType = EnumerationDeprecated.byKeys(['WAVES', 'PARTICLES', 'BOTH']);
waveInterference.register('SoundScene', SoundScene);
export default SoundScene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlV0aWxzIiwiRW51bWVyYXRpb25EZXByZWNhdGVkIiwid2F2ZUludGVyZmVyZW5jZSIsIldhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMiLCJTY2VuZSIsIlNvdW5kUGFydGljbGUiLCJTT1VORF9QQVJUSUNMRV9HUkFESUVOVF9GT1JDRV9TQ0FMRSIsIlNvdW5kU2NlbmUiLCJjb25zdHJ1Y3RvciIsInNob3dTb3VuZFBhcnRpY2xlcyIsImNvbmZpZyIsInNvdW5kVmlld1R5cGVQcm9wZXJ0eSIsIlNvdW5kVmlld1R5cGUiLCJXQVZFUyIsInZhbGlkVmFsdWVzIiwiVkFMVUVTIiwic291bmRQYXJ0aWNsZXMiLCJpc1RvbmVQbGF5aW5nUHJvcGVydHkiLCJTT1VORF9QQVJUSUNMRV9ST1dTIiwiU09VTkRfUEFSVElDTEVfQ09MVU1OUyIsIlJBTkRPTV9SQURJVVMiLCJpIiwiayIsInB1c2giLCJ3YXZlQXJlYVdpZHRoIiwibmV4dEdhdXNzaWFuIiwid2F2ZUdlbmVyYXRvckJ1dHRvblNvdW5kIiwicHJlc3NlZCIsInN0ZXAiLCJkdCIsImxhdHRpY2UiLCJsaW5lYXIiLCJmcmVxdWVuY3lQcm9wZXJ0eSIsInJhbmdlIiwibWluIiwibWF4IiwidmFsdWUiLCJsZW5ndGgiLCJzb3VuZFBhcnRpY2xlIiwibGF0dGljZUNvb3JkaW5hdGUiLCJtb2RlbFRvTGF0dGljZVRyYW5zZm9ybSIsIm1vZGVsVG9WaWV3WFkiLCJ4IiwieSIsImxhdHRpY2VYIiwicm91bmRTeW1tZXRyaWMiLCJsYXR0aWNlWSIsImZ4MiIsImdldEN1cnJlbnRWYWx1ZSIsImZ4MSIsImdyYWRpZW50WCIsImZ5MiIsImZ5MSIsImdyYWRpZW50WSIsImZ4IiwiZnkiLCJpc05hTiIsImFwcGx5Rm9yY2UiLCJDQUxJQlJBVElPTl9TQ0FMRSIsInJlc2V0IiwiYnlLZXlzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTb3VuZFNjZW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBAdHMtbm9jaGVja1xyXG4vKipcclxuICogVGhlIG1vZGVsIGZvciB0aGUgU291bmQgc2NlbmUsIHdoaWNoIGFkZHMgU291bmRQYXJ0aWNsZSBpbnN0YW5jZXMuICBTZWUgdGhlIGZvbGxvd2luZyBwYWdlcyBmb3IgdmlzdWFsaXphdGlvbnNcclxuICogYW5kIHBoeXNpY3Mgb2Ygd2F2ZSB0cmFuc21pc3Npb25cclxuICogaHR0cDovL2hvbWVwYWdlLnBoeXNpY3MudWlvd2EuZWR1L35mc2tpZmYvUGh5c2ljc18wNDQvU29tZSUyMG1vcmUlMjBkZXRhaWxzJTIwb24lMjBTb3VuZC5wZGZcclxuICogaHR0cHM6Ly93d3cubnByLm9yZy8yMDE0LzA0LzA5LzMwMDU2MzYwNi93aGF0LWRvZXMtc291bmQtbG9vay1saWtlXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNjZW5lLCB7IFNjZW5lT3B0aW9ucyB9IGZyb20gJy4vU2NlbmUuanMnO1xyXG5pbXBvcnQgU291bmRQYXJ0aWNsZSBmcm9tICcuL1NvdW5kUGFydGljbGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNPVU5EX1BBUlRJQ0xFX0dSQURJRU5UX0ZPUkNFX1NDQUxFID0gMC42NzsgLy8gQWRkaXRpb25hbCBzY2FsaW5nIGZvciB0aGUgZ3JhZGllbnQgZm9yY2VcclxuXHJcbmNsYXNzIFNvdW5kU2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzaG93U291bmRQYXJ0aWNsZXMgLSB0cnVlIGlmIFNvdW5kUGFydGljbGVzIHNob3VsZCBiZSBjcmVhdGVkIGFuZCBkaXNwbGF5ZWRcclxuICAgKiBAcGFyYW0gY29uZmlnIC0gc2VlIFNjZW5lIGZvciByZXF1aXJlZCBwcm9wZXJ0aWVzXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaG93U291bmRQYXJ0aWNsZXM6IGJvb2xlYW4sIGNvbmZpZzogU2NlbmVPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIGNvbmZpZyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge2Jvb2xlYW59IC0gdHJ1ZSBpZiBTb3VuZFBhcnRpY2xlcyBzaG91bGQgYmUgY3JlYXRlZCBhbmQgZGlzcGxheWVkLiAgVGhleSBhcmUgbm90IGRpc3BsYXllZFxyXG4gICAgLy8gb24gdGhlIFNsaXRzIHNjcmVlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMTA5XHJcbiAgICB0aGlzLnNob3dTb3VuZFBhcnRpY2xlcyA9IHNob3dTb3VuZFBhcnRpY2xlcztcclxuXHJcbiAgICAvLyBAcHVibGljIC0gaW5kaWNhdGVzIHRoZSBzZWxlY3RlZCB2aWV3IGZvciBzb3VuZFxyXG4gICAgdGhpcy5zb3VuZFZpZXdUeXBlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFNvdW5kU2NlbmUuU291bmRWaWV3VHlwZS5XQVZFUywge1xyXG4gICAgICB2YWxpZFZhbHVlczogU291bmRTY2VuZS5Tb3VuZFZpZXdUeXBlLlZBTFVFU1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1NvdW5kUGFydGljbGVbXX0gcGFydGljbGVzIGZvciB0aGUgc291bmQgc2NlbmUuXHJcbiAgICB0aGlzLnNvdW5kUGFydGljbGVzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGluZGljYXRlcyB3aGV0aGVyIHRoZSB1c2VyIGhhcyBzZWxlY3RlZCB0byBoZWFyIHRoZSBzaW5lIHdhdmVcclxuICAgIHRoaXMuaXNUb25lUGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuc2hvd1NvdW5kUGFydGljbGVzICkge1xyXG5cclxuICAgICAgY29uc3QgU09VTkRfUEFSVElDTEVfUk9XUyA9IDIwO1xyXG4gICAgICBjb25zdCBTT1VORF9QQVJUSUNMRV9DT0xVTU5TID0gMjA7XHJcbiAgICAgIGNvbnN0IFJBTkRPTV9SQURJVVMgPSAyO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPD0gU09VTkRfUEFSVElDTEVfUk9XUzsgaSsrICkge1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8PSBTT1VORF9QQVJUSUNMRV9DT0xVTU5TOyBrKysgKSB7XHJcbiAgICAgICAgICB0aGlzLnNvdW5kUGFydGljbGVzLnB1c2goIG5ldyBTb3VuZFBhcnRpY2xlKFxyXG4gICAgICAgICAgICBpLCBrLFxyXG4gICAgICAgICAgICBpICogdGhpcy53YXZlQXJlYVdpZHRoIC8gU09VTkRfUEFSVElDTEVfUk9XUyArIGRvdFJhbmRvbS5uZXh0R2F1c3NpYW4oKSAqIFJBTkRPTV9SQURJVVMsXHJcbiAgICAgICAgICAgIGsgKiB0aGlzLndhdmVBcmVhV2lkdGggLyBTT1VORF9QQVJUSUNMRV9DT0xVTU5TICsgZG90UmFuZG9tLm5leHRHYXVzc2lhbigpICogUkFORE9NX1JBRElVU1xyXG4gICAgICAgICAgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIFNvdW5kU2NlbmUgYWx3YXlzIGdlbmVyYXRlcyB0aGUgc3BlYWtlciBtZW1icmFuZSBzb3VuZCwgc28gbm8gc291bmQgc2hvdWxkIGJlIHBsYXllZCB3aGVuIHRoZSB3YXZlIGdlbmVyYXRvclxyXG4gICAqIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSB3YXZlR2VuZXJhdG9yQnV0dG9uU291bmQoIHByZXNzZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gbm8tb3BcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgZm9yd2FyZCBpbiB0aW1lIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LCB1cGRhdGluZyB2ZWxvY2l0eSBhbmQgcG9zaXRpb24gb2YgdGhlIFNvdW5kUGFydGljbGUgaW5zdGFuY2VzXHJcbiAgICogQHBhcmFtIGR0IC0gYW1vdW50IG9mIHRpbWUgdG8gbW92ZSBmb3J3YXJkLCBpbiB0aGUgdW5pdHMgb2YgdGhlIHNjZW5lXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgc3VwZXIuc3RlcCggZHQgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuc2hvd1NvdW5kUGFydGljbGVzICkge1xyXG4gICAgICBjb25zdCBsYXR0aWNlID0gdGhpcy5sYXR0aWNlO1xyXG5cclxuICAgICAgLy8gSW5jcmVhc2UgdGhlIGdyYWRpZW50IGZvcmNlIGF0IGxvdyBmcmVxdWVuY2llcyBzbyB3ZSBjYW4gc3RpbGwgc2VlIHRoZSB3YXZlcyBjbGVhcmx5LlxyXG4gICAgICBjb25zdCBrID0gVXRpbHMubGluZWFyKFxyXG4gICAgICAgIHRoaXMuZnJlcXVlbmN5UHJvcGVydHkucmFuZ2UubWluLFxyXG4gICAgICAgIHRoaXMuZnJlcXVlbmN5UHJvcGVydHkucmFuZ2UubWF4LFxyXG4gICAgICAgIDEzMCxcclxuICAgICAgICA3NixcclxuICAgICAgICB0aGlzLmZyZXF1ZW5jeVByb3BlcnR5LnZhbHVlXHJcbiAgICAgICkgKiBTT1VORF9QQVJUSUNMRV9HUkFESUVOVF9GT1JDRV9TQ0FMRTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc291bmRQYXJ0aWNsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgc291bmRQYXJ0aWNsZSA9IHRoaXMuc291bmRQYXJ0aWNsZXNbIGkgXTtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgbGF0dGljZSBjb29yZGluYXRlIG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBwYXJ0aWNsZS4gIFVzZSByb3VuZGluZyBmb3IgY29uc2lzdGVuY3kgd2l0aFxyXG4gICAgICAgIC8vIG90aGVyIHF1YW50aXphdGlvblxyXG4gICAgICAgIGNvbnN0IGxhdHRpY2VDb29yZGluYXRlID0gdGhpcy5tb2RlbFRvTGF0dGljZVRyYW5zZm9ybS5tb2RlbFRvVmlld1hZKCBzb3VuZFBhcnRpY2xlLngsIHNvdW5kUGFydGljbGUueSApO1xyXG4gICAgICAgIGNvbnN0IGxhdHRpY2VYID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIGxhdHRpY2VDb29yZGluYXRlLnggKTtcclxuICAgICAgICBjb25zdCBsYXR0aWNlWSA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBsYXR0aWNlQ29vcmRpbmF0ZS55ICk7XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlIHRoZSBudW1lcmljYWwgZ3JhZGllbnQgaW4gdGhlIG5laWdoYm9yaG9vZCBvZiB0aGUgcGFydGljbGVcclxuICAgICAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9QcmVzc3VyZS1ncmFkaWVudF9mb3JjZVxyXG4gICAgICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYWRpZW50XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTnVtZXJpY2FsX2RpZmZlcmVudGlhdGlvblxyXG5cclxuICAgICAgICAvLyBlc3RpbWF0ZSB0aGUgc3BhdGlhbCBkZXJpdmF0aXZlIGluIHRoZSB4LWRpcmVjdGlvblxyXG4gICAgICAgIGNvbnN0IGZ4MiA9IGxhdHRpY2UuZ2V0Q3VycmVudFZhbHVlKCBsYXR0aWNlWCArIDEsIGxhdHRpY2VZICk7XHJcbiAgICAgICAgY29uc3QgZngxID0gbGF0dGljZS5nZXRDdXJyZW50VmFsdWUoIGxhdHRpY2VYIC0gMSwgbGF0dGljZVkgKTtcclxuICAgICAgICBjb25zdCBncmFkaWVudFggPSAoIGZ4MiAtIGZ4MSApIC8gMjtcclxuXHJcbiAgICAgICAgLy8gZXN0aW1hdGUgdGhlIHNwYXRpYWwgZGVyaXZhdGl2ZSBpbiB0aGUgeS1kaXJlY3Rpb25cclxuICAgICAgICBjb25zdCBmeTIgPSBsYXR0aWNlLmdldEN1cnJlbnRWYWx1ZSggbGF0dGljZVgsIGxhdHRpY2VZICsgMSApO1xyXG4gICAgICAgIGNvbnN0IGZ5MSA9IGxhdHRpY2UuZ2V0Q3VycmVudFZhbHVlKCBsYXR0aWNlWCwgbGF0dGljZVkgLSAxICk7XHJcbiAgICAgICAgY29uc3QgZ3JhZGllbnRZID0gKCBmeTIgLSBmeTEgKSAvIDI7XHJcblxyXG4gICAgICAgIGNvbnN0IGZ4ID0gZ3JhZGllbnRYICogaztcclxuICAgICAgICBjb25zdCBmeSA9IGdyYWRpZW50WSAqIGs7XHJcbiAgICAgICAgaWYgKCAhaXNOYU4oIGZ4ICkgJiYgIWlzTmFOKCBmeSApICkge1xyXG4gICAgICAgICAgc291bmRQYXJ0aWNsZS5hcHBseUZvcmNlKFxyXG4gICAgICAgICAgICBmeCAqIFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuQ0FMSUJSQVRJT05fU0NBTEUsXHJcbiAgICAgICAgICAgIGZ5ICogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5DQUxJQlJBVElPTl9TQ0FMRSxcclxuICAgICAgICAgICAgZHQsIHRoaXNcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlcyB0aGUgaW5pdGlhbCBjb25kaXRpb25zIG9mIHRoaXMgc2NlbmUuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuc291bmRWaWV3VHlwZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzVG9uZVBsYXlpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBwdWJsaWNcclxuICovXHJcblNvdW5kU2NlbmUuU291bmRWaWV3VHlwZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1dBVkVTJywgJ1BBUlRJQ0xFUycsICdCT1RIJyBdICk7XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnU291bmRTY2VuZScsIFNvdW5kU2NlbmUgKTtcclxuZXhwb3J0IGRlZmF1bHQgU291bmRTY2VuZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLHFCQUFxQixNQUFNLG1EQUFtRDtBQUNyRixPQUFPQyxnQkFB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