// Copyright 2021-2022, University of Colorado Boulder

/**
 * BalloonVelocitySoundGenerator is used to produce a sound that corresponds to the drifting velocity of the balloon.
 * It does NOT produce sound when the balloon is being dragged by the user.
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import merge from '../../../../phet-core/js/merge.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import carrier000_wav from '../../../sounds/carrier000_wav.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';

// constants
const MIN_PLAYBACK_RATE_CHANGE = 0.03;
const MIN_OUTPUT_LEVEL_CHANGE = 0.05;
class BalloonVelocitySoundGenerator extends SoundClip {
  /**
   * {Property.<number>} balloonVelocityProperty - velocity of the balloon when drifting (i.e. when it is not being
   *                                               dragged by a user).
   * {Property.<boolean>} touchingWallProperty - whether the balloon is touching the wall
   * {Object} [options]
   */
  constructor(balloonVelocityProperty, touchingWallProperty, options) {
    options = merge({
      loop: true,
      // {WrappedAudioBuffer} - sound to use as the basis for the drifting velocity
      basisSound: carrier000_wav,
      // {number) The output level is set as a function of the speed at which the balloon is moving.  This value
      // specifies the maximum value.  It will generally be between 0 and 1.
      maxOutputLevel: 0.5
    }, options);

    // options checking
    assert && assert(!options.initialOutputLevel, 'initialOutputLevel should not be specified for this sound generator, use maxOutputLevel instead');

    // Start the initial output level at zero so that the sound will fade in smoothly the first time it is played.
    options.initialOutputLevel = 0;
    super(options.basisSound, options);

    // Monitor the balloon velocity and modify the output sound as changes occur.  If the balloon is on the sweater or
    // the wall, no sound should be produced.
    const outputUpdaterMultilink = Multilink.multilink([balloonVelocityProperty, touchingWallProperty], (balloonVelocity, onSweater, touchingWall) => {
      const speed = balloonVelocity.magnitude;
      if (speed > 0 && !touchingWall) {
        const targetPlaybackRate = mapSpeedToPlaybackRate.evaluate(speed);
        const targetOutputLevel = mapSpeedToOutputLevel.evaluate(speed, 0.1) * options.maxOutputLevel;
        if (!this.isPlaying) {
          // Before starting playback, set the playback rate immediately, otherwise a sort of "chirp" sound can occur.
          this.setPlaybackRate(targetPlaybackRate, 0);

          // Also set the output level immediately.
          this.setOutputLevel(targetOutputLevel, 0);

          // Start the sound playing.
          this.play();
        } else {
          // Set the playback rate if the difference is above the threshold.  The thresholding is done because setting
          // it too frequently can cause performance issues that result in crackling sounds, see
          // https://github.com/phetsims/balloons-and-static-electricity/issues/527.
          if (Math.abs(targetPlaybackRate - this.playbackRate) >= MIN_PLAYBACK_RATE_CHANGE) {
            // Set the playback rate.  This uses a relatively long time constant to make the changes sound smooth.
            this.setPlaybackRate(targetPlaybackRate, 0.5);
          }

          // Same story as above for the output level, i.e. don't change it too frequently.
          if (Math.abs(targetOutputLevel - this.outputLevel) >= MIN_OUTPUT_LEVEL_CHANGE) {
            this.setOutputLevel(targetOutputLevel);
          }
        }
      } else if ((speed === 0 || touchingWall) && this.isPlaying) {
        this.stop();
        this.setOutputLevel(0);
      }
    });
    this.disposeBalloonVelocitySoundGenerator = () => {
      outputUpdaterMultilink.dispose();
    };
  }

  /**
   * release memory references
   * @public
   */
  dispose() {
    this.disposeBalloonVelocitySoundGenerator();
    super.dispose();
  }
}

// function for mapping the speed of the balloon to the playback rate of the carrier sound, empirically determined
const mapSpeedToPlaybackRate = new LinearFunction(0, 3, 0.5, 2, true);

// function for mapping the speed of the balloon to the output level
const mapSpeedToOutputLevel = new LinearFunction(0, 3, 0.2, 1, false);
balloonsAndStaticElectricity.register('BalloonVelocitySoundGenerator', BalloonVelocitySoundGenerator);
export default BalloonVelocitySoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJMaW5lYXJGdW5jdGlvbiIsIm1lcmdlIiwiU291bmRDbGlwIiwiY2FycmllcjAwMF93YXYiLCJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiTUlOX1BMQVlCQUNLX1JBVEVfQ0hBTkdFIiwiTUlOX09VVFBVVF9MRVZFTF9DSEFOR0UiLCJCYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvciIsImNvbnN0cnVjdG9yIiwiYmFsbG9vblZlbG9jaXR5UHJvcGVydHkiLCJ0b3VjaGluZ1dhbGxQcm9wZXJ0eSIsIm9wdGlvbnMiLCJsb29wIiwiYmFzaXNTb3VuZCIsIm1heE91dHB1dExldmVsIiwiYXNzZXJ0IiwiaW5pdGlhbE91dHB1dExldmVsIiwib3V0cHV0VXBkYXRlck11bHRpbGluayIsIm11bHRpbGluayIsImJhbGxvb25WZWxvY2l0eSIsIm9uU3dlYXRlciIsInRvdWNoaW5nV2FsbCIsInNwZWVkIiwibWFnbml0dWRlIiwidGFyZ2V0UGxheWJhY2tSYXRlIiwibWFwU3BlZWRUb1BsYXliYWNrUmF0ZSIsImV2YWx1YXRlIiwidGFyZ2V0T3V0cHV0TGV2ZWwiLCJtYXBTcGVlZFRvT3V0cHV0TGV2ZWwiLCJpc1BsYXlpbmciLCJzZXRQbGF5YmFja1JhdGUiLCJzZXRPdXRwdXRMZXZlbCIsInBsYXkiLCJNYXRoIiwiYWJzIiwicGxheWJhY2tSYXRlIiwib3V0cHV0TGV2ZWwiLCJzdG9wIiwiZGlzcG9zZUJhbGxvb25WZWxvY2l0eVNvdW5kR2VuZXJhdG9yIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsbG9vblZlbG9jaXR5U291bmRHZW5lcmF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFsbG9vblZlbG9jaXR5U291bmRHZW5lcmF0b3IgaXMgdXNlZCB0byBwcm9kdWNlIGEgc291bmQgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgZHJpZnRpbmcgdmVsb2NpdHkgb2YgdGhlIGJhbGxvb24uXHJcbiAqIEl0IGRvZXMgTk9UIHByb2R1Y2Ugc291bmQgd2hlbiB0aGUgYmFsbG9vbiBpcyBiZWluZyBkcmFnZ2VkIGJ5IHRoZSB1c2VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBjYXJyaWVyMDAwX3dhdiBmcm9tICcuLi8uLi8uLi9zb3VuZHMvY2FycmllcjAwMF93YXYuanMnO1xyXG5pbXBvcnQgYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSBmcm9tICcuLi8uLi9iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNSU5fUExBWUJBQ0tfUkFURV9DSEFOR0UgPSAwLjAzO1xyXG5jb25zdCBNSU5fT1VUUFVUX0xFVkVMX0NIQU5HRSA9IDAuMDU7XHJcblxyXG5jbGFzcyBCYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvciBleHRlbmRzIFNvdW5kQ2xpcCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIHtQcm9wZXJ0eS48bnVtYmVyPn0gYmFsbG9vblZlbG9jaXR5UHJvcGVydHkgLSB2ZWxvY2l0eSBvZiB0aGUgYmFsbG9vbiB3aGVuIGRyaWZ0aW5nIChpLmUuIHdoZW4gaXQgaXMgbm90IGJlaW5nXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWQgYnkgYSB1c2VyKS5cclxuICAgKiB7UHJvcGVydHkuPGJvb2xlYW4+fSB0b3VjaGluZ1dhbGxQcm9wZXJ0eSAtIHdoZXRoZXIgdGhlIGJhbGxvb24gaXMgdG91Y2hpbmcgdGhlIHdhbGxcclxuICAgKiB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYmFsbG9vblZlbG9jaXR5UHJvcGVydHksIHRvdWNoaW5nV2FsbFByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZShcclxuICAgICAge1xyXG4gICAgICAgIGxvb3A6IHRydWUsXHJcblxyXG4gICAgICAgIC8vIHtXcmFwcGVkQXVkaW9CdWZmZXJ9IC0gc291bmQgdG8gdXNlIGFzIHRoZSBiYXNpcyBmb3IgdGhlIGRyaWZ0aW5nIHZlbG9jaXR5XHJcbiAgICAgICAgYmFzaXNTb3VuZDogY2FycmllcjAwMF93YXYsXHJcblxyXG4gICAgICAgIC8vIHtudW1iZXIpIFRoZSBvdXRwdXQgbGV2ZWwgaXMgc2V0IGFzIGEgZnVuY3Rpb24gb2YgdGhlIHNwZWVkIGF0IHdoaWNoIHRoZSBiYWxsb29uIGlzIG1vdmluZy4gIFRoaXMgdmFsdWVcclxuICAgICAgICAvLyBzcGVjaWZpZXMgdGhlIG1heGltdW0gdmFsdWUuICBJdCB3aWxsIGdlbmVyYWxseSBiZSBiZXR3ZWVuIDAgYW5kIDEuXHJcbiAgICAgICAgbWF4T3V0cHV0TGV2ZWw6IDAuNVxyXG4gICAgICB9LFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG5cclxuICAgIC8vIG9wdGlvbnMgY2hlY2tpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICFvcHRpb25zLmluaXRpYWxPdXRwdXRMZXZlbCxcclxuICAgICAgJ2luaXRpYWxPdXRwdXRMZXZlbCBzaG91bGQgbm90IGJlIHNwZWNpZmllZCBmb3IgdGhpcyBzb3VuZCBnZW5lcmF0b3IsIHVzZSBtYXhPdXRwdXRMZXZlbCBpbnN0ZWFkJ1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgaW5pdGlhbCBvdXRwdXQgbGV2ZWwgYXQgemVybyBzbyB0aGF0IHRoZSBzb3VuZCB3aWxsIGZhZGUgaW4gc21vb3RobHkgdGhlIGZpcnN0IHRpbWUgaXQgaXMgcGxheWVkLlxyXG4gICAgb3B0aW9ucy5pbml0aWFsT3V0cHV0TGV2ZWwgPSAwO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zLmJhc2lzU291bmQsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBNb25pdG9yIHRoZSBiYWxsb29uIHZlbG9jaXR5IGFuZCBtb2RpZnkgdGhlIG91dHB1dCBzb3VuZCBhcyBjaGFuZ2VzIG9jY3VyLiAgSWYgdGhlIGJhbGxvb24gaXMgb24gdGhlIHN3ZWF0ZXIgb3JcclxuICAgIC8vIHRoZSB3YWxsLCBubyBzb3VuZCBzaG91bGQgYmUgcHJvZHVjZWQuXHJcbiAgICBjb25zdCBvdXRwdXRVcGRhdGVyTXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBiYWxsb29uVmVsb2NpdHlQcm9wZXJ0eSwgdG91Y2hpbmdXYWxsUHJvcGVydHkgXSxcclxuICAgICAgKCBiYWxsb29uVmVsb2NpdHksIG9uU3dlYXRlciwgdG91Y2hpbmdXYWxsICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNwZWVkID0gYmFsbG9vblZlbG9jaXR5Lm1hZ25pdHVkZTtcclxuICAgICAgICBpZiAoIHNwZWVkID4gMCAmJiAhdG91Y2hpbmdXYWxsICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IHRhcmdldFBsYXliYWNrUmF0ZSA9IG1hcFNwZWVkVG9QbGF5YmFja1JhdGUuZXZhbHVhdGUoIHNwZWVkICk7XHJcbiAgICAgICAgICBjb25zdCB0YXJnZXRPdXRwdXRMZXZlbCA9IG1hcFNwZWVkVG9PdXRwdXRMZXZlbC5ldmFsdWF0ZSggc3BlZWQsIDAuMSApICogb3B0aW9ucy5tYXhPdXRwdXRMZXZlbDtcclxuXHJcbiAgICAgICAgICBpZiAoICF0aGlzLmlzUGxheWluZyApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEJlZm9yZSBzdGFydGluZyBwbGF5YmFjaywgc2V0IHRoZSBwbGF5YmFjayByYXRlIGltbWVkaWF0ZWx5LCBvdGhlcndpc2UgYSBzb3J0IG9mIFwiY2hpcnBcIiBzb3VuZCBjYW4gb2NjdXIuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0UGxheWJhY2tSYXRlKCB0YXJnZXRQbGF5YmFja1JhdGUsIDAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFsc28gc2V0IHRoZSBvdXRwdXQgbGV2ZWwgaW1tZWRpYXRlbHkuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0TGV2ZWwoIHRhcmdldE91dHB1dExldmVsLCAwICk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdGFydCB0aGUgc291bmQgcGxheWluZy5cclxuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgcGxheWJhY2sgcmF0ZSBpZiB0aGUgZGlmZmVyZW5jZSBpcyBhYm92ZSB0aGUgdGhyZXNob2xkLiAgVGhlIHRocmVzaG9sZGluZyBpcyBkb25lIGJlY2F1c2Ugc2V0dGluZ1xyXG4gICAgICAgICAgICAvLyBpdCB0b28gZnJlcXVlbnRseSBjYW4gY2F1c2UgcGVyZm9ybWFuY2UgaXNzdWVzIHRoYXQgcmVzdWx0IGluIGNyYWNrbGluZyBzb3VuZHMsIHNlZVxyXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmFsbG9vbnMtYW5kLXN0YXRpYy1lbGVjdHJpY2l0eS9pc3N1ZXMvNTI3LlxyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCB0YXJnZXRQbGF5YmFja1JhdGUgLSB0aGlzLnBsYXliYWNrUmF0ZSApID49IE1JTl9QTEFZQkFDS19SQVRFX0NIQU5HRSApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gU2V0IHRoZSBwbGF5YmFjayByYXRlLiAgVGhpcyB1c2VzIGEgcmVsYXRpdmVseSBsb25nIHRpbWUgY29uc3RhbnQgdG8gbWFrZSB0aGUgY2hhbmdlcyBzb3VuZCBzbW9vdGguXHJcbiAgICAgICAgICAgICAgdGhpcy5zZXRQbGF5YmFja1JhdGUoIHRhcmdldFBsYXliYWNrUmF0ZSwgMC41ICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNhbWUgc3RvcnkgYXMgYWJvdmUgZm9yIHRoZSBvdXRwdXQgbGV2ZWwsIGkuZS4gZG9uJ3QgY2hhbmdlIGl0IHRvbyBmcmVxdWVudGx5LlxyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCB0YXJnZXRPdXRwdXRMZXZlbCAtIHRoaXMub3V0cHV0TGV2ZWwgKSA+PSBNSU5fT1VUUFVUX0xFVkVMX0NIQU5HRSApIHtcclxuICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dExldmVsKCB0YXJnZXRPdXRwdXRMZXZlbCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCAoIHNwZWVkID09PSAwIHx8IHRvdWNoaW5nV2FsbCApICYmIHRoaXMuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICB0aGlzLnNldE91dHB1dExldmVsKCAwICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUJhbGxvb25WZWxvY2l0eVNvdW5kR2VuZXJhdG9yID0gKCkgPT4ge1xyXG4gICAgICBvdXRwdXRVcGRhdGVyTXVsdGlsaW5rLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZWxlYXNlIG1lbW9yeSByZWZlcmVuY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VCYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gZnVuY3Rpb24gZm9yIG1hcHBpbmcgdGhlIHNwZWVkIG9mIHRoZSBiYWxsb29uIHRvIHRoZSBwbGF5YmFjayByYXRlIG9mIHRoZSBjYXJyaWVyIHNvdW5kLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbmNvbnN0IG1hcFNwZWVkVG9QbGF5YmFja1JhdGUgPSBuZXcgTGluZWFyRnVuY3Rpb24oIDAsIDMsIDAuNSwgMiwgdHJ1ZSApO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIG1hcHBpbmcgdGhlIHNwZWVkIG9mIHRoZSBiYWxsb29uIHRvIHRoZSBvdXRwdXQgbGV2ZWxcclxuY29uc3QgbWFwU3BlZWRUb091dHB1dExldmVsID0gbmV3IExpbmVhckZ1bmN0aW9uKCAwLCAzLCAwLjIsIDEsIGZhbHNlICk7XHJcblxyXG5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LnJlZ2lzdGVyKCAnQmFsbG9vblZlbG9jaXR5U291bmRHZW5lcmF0b3InLCBCYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBCYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sb0RBQW9EO0FBQzFFLE9BQU9DLGNBQWMsTUFBTSxtQ0FBbUM7QUFDOUQsT0FBT0MsNEJBQTRCLE1BQU0sdUNBQXVDOztBQUVoRjtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLElBQUk7QUFDckMsTUFBTUMsdUJBQXVCLEdBQUcsSUFBSTtBQUVwQyxNQUFNQyw2QkFBNkIsU0FBU0wsU0FBUyxDQUFDO0VBRXBEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyx1QkFBdUIsRUFBRUMsb0JBQW9CLEVBQUVDLE9BQU8sRUFBRztJQUVwRUEsT0FBTyxHQUFHVixLQUFLLENBQ2I7TUFDRVcsSUFBSSxFQUFFLElBQUk7TUFFVjtNQUNBQyxVQUFVLEVBQUVWLGNBQWM7TUFFMUI7TUFDQTtNQUNBVyxjQUFjLEVBQUU7SUFDbEIsQ0FBQyxFQUNESCxPQUNGLENBQUM7O0lBRUQ7SUFDQUksTUFBTSxJQUFJQSxNQUFNLENBQ2QsQ0FBQ0osT0FBTyxDQUFDSyxrQkFBa0IsRUFDM0IsaUdBQ0YsQ0FBQzs7SUFFRDtJQUNBTCxPQUFPLENBQUNLLGtCQUFrQixHQUFHLENBQUM7SUFFOUIsS0FBSyxDQUFFTCxPQUFPLENBQUNFLFVBQVUsRUFBRUYsT0FBUSxDQUFDOztJQUVwQztJQUNBO0lBQ0EsTUFBTU0sc0JBQXNCLEdBQUdsQixTQUFTLENBQUNtQixTQUFTLENBQ2hELENBQUVULHVCQUF1QixFQUFFQyxvQkFBb0IsQ0FBRSxFQUNqRCxDQUFFUyxlQUFlLEVBQUVDLFNBQVMsRUFBRUMsWUFBWSxLQUFNO01BQzlDLE1BQU1DLEtBQUssR0FBR0gsZUFBZSxDQUFDSSxTQUFTO01BQ3ZDLElBQUtELEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQ0QsWUFBWSxFQUFHO1FBRWhDLE1BQU1HLGtCQUFrQixHQUFHQyxzQkFBc0IsQ0FBQ0MsUUFBUSxDQUFFSixLQUFNLENBQUM7UUFDbkUsTUFBTUssaUJBQWlCLEdBQUdDLHFCQUFxQixDQUFDRixRQUFRLENBQUVKLEtBQUssRUFBRSxHQUFJLENBQUMsR0FBR1gsT0FBTyxDQUFDRyxjQUFjO1FBRS9GLElBQUssQ0FBQyxJQUFJLENBQUNlLFNBQVMsRUFBRztVQUVyQjtVQUNBLElBQUksQ0FBQ0MsZUFBZSxDQUFFTixrQkFBa0IsRUFBRSxDQUFFLENBQUM7O1VBRTdDO1VBQ0EsSUFBSSxDQUFDTyxjQUFjLENBQUVKLGlCQUFpQixFQUFFLENBQUUsQ0FBQzs7VUFFM0M7VUFDQSxJQUFJLENBQUNLLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQyxNQUNJO1VBRUg7VUFDQTtVQUNBO1VBQ0EsSUFBS0MsSUFBSSxDQUFDQyxHQUFHLENBQUVWLGtCQUFrQixHQUFHLElBQUksQ0FBQ1csWUFBYSxDQUFDLElBQUk5Qix3QkFBd0IsRUFBRztZQUVwRjtZQUNBLElBQUksQ0FBQ3lCLGVBQWUsQ0FBRU4sa0JBQWtCLEVBQUUsR0FBSSxDQUFDO1VBQ2pEOztVQUVBO1VBQ0EsSUFBS1MsSUFBSSxDQUFDQyxHQUFHLENBQUVQLGlCQUFpQixHQUFHLElBQUksQ0FBQ1MsV0FBWSxDQUFDLElBQUk5Qix1QkFBdUIsRUFBRztZQUNqRixJQUFJLENBQUN5QixjQUFjLENBQUVKLGlCQUFrQixDQUFDO1VBQzFDO1FBQ0Y7TUFDRixDQUFDLE1BQ0ksSUFBSyxDQUFFTCxLQUFLLEtBQUssQ0FBQyxJQUFJRCxZQUFZLEtBQU0sSUFBSSxDQUFDUSxTQUFTLEVBQUc7UUFDNUQsSUFBSSxDQUFDUSxJQUFJLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQ04sY0FBYyxDQUFFLENBQUUsQ0FBQztNQUMxQjtJQUNGLENBQ0YsQ0FBQztJQUVELElBQUksQ0FBQ08sb0NBQW9DLEdBQUcsTUFBTTtNQUNoRHJCLHNCQUFzQixDQUFDc0IsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VBLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ0Qsb0NBQW9DLENBQUMsQ0FBQztJQUMzQyxLQUFLLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7O0FBRUE7QUFDQSxNQUFNZCxzQkFBc0IsR0FBRyxJQUFJekIsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFLLENBQUM7O0FBRXZFO0FBQ0EsTUFBTTRCLHFCQUFxQixHQUFHLElBQUk1QixjQUFjLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQU0sQ0FBQztBQUV2RUksNEJBQTRCLENBQUNvQyxRQUFRLENBQUUsK0JBQStCLEVBQUVqQyw2QkFBOEIsQ0FBQztBQUN2RyxlQUFlQSw2QkFBNkIifQ==