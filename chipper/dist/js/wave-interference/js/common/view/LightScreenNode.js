// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * Renders the screen at right hand side of the wave area, showing the time-averaged intensity (for the light scene).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import PiecewiseLinearFunction from '../../../../dot/js/PiecewiseLinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import { CanvasNode, Color } from '../../../../scenery/js/imports.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import WaveInterferenceUtils from '../WaveInterferenceUtils.js';
import ImageDataRenderer from '../../../../scenery-phet/js/ImageDataRenderer.js';

// constants
const CANVAS_WIDTH = 100;

// This chooses the saturation point for the screen, as well as the "thinness" of the minima
const BRIGHTNESS_SCALE_FACTOR = 5;

// Piecewise linear function optimized for a wide range of brightness, used in Waves Intro sim and Waves screen
const piecewiseBrightnessFunction = intensity => {
  const brightness = PiecewiseLinearFunction.evaluate([0, 0, 0.002237089269640335, 0.4, 0.008937089269640335, 0.5, 0.05372277438413573, 0.64, 0.13422634397144692, 0.74, 0.2096934692889395, 0.8, 1, 1], intensity);
  return Utils.clamp(brightness, 0, 1);
};

// Linear brightness function optimized for showing interference patterns in the Interference and Slits screens
const linearBrightnessFunction = intensity => {
  const brightness = Utils.linear(0, WaveInterferenceConstants.MAX_AMPLITUDE_TO_PLOT_ON_RIGHT, 0, 1, intensity);
  return Utils.clamp(brightness * BRIGHTNESS_SCALE_FACTOR, 0, 1);
};
class LightScreenNode extends CanvasNode {
  constructor(lattice, intensitySample, options) {
    const latticeCanvasBounds = WaveInterferenceUtils.getCanvasBounds(lattice);
    options = merge({
      // only use the visible part for the bounds (not the damping regions)
      canvasBounds: new Bounds2(0, 0, CANVAS_WIDTH, latticeCanvasBounds.height),
      layerSplit: true,
      // ensure we're on our own layer
      piecewiseLinearBrightness: false,
      // Use a small window for interference and slits screens, to accentuate the patterns
      // Use a large window for waves-intro and waves screen, to smooth out noise
      lightScreenAveragingWindowSize: 3
    }, options);
    super(options);

    // @private - for the vertical scale factor
    this.latticeCanvasBounds = latticeCanvasBounds;

    // @private
    this.lattice = lattice;

    // @private
    this.piecewiseLinearBrightness = options.piecewiseLinearBrightness;

    // @private
    this.lightScreenAveragingWindowSize = options.lightScreenAveragingWindowSize;

    // @private
    this.intensitySample = intensitySample;

    // @private {Color} required because we'll be operating on a Color
    this.baseColor = new Color('blue');

    // Render into a sub-canvas which will be drawn into the rendering context at the right scale.
    // Use a single column of pixels, then stretch them to the right (since that is a constant)
    const width = 1;

    // @private - for rendering via image data
    this.imageDataRenderer = new ImageDataRenderer(width, lattice.visibleBounds.height);

    // Invalidate paint when model indicates changes
    lattice.changedEmitter.addListener(this.invalidatePaint.bind(this));

    // Show it at a 3d perspective, as if orthogonal to the wave view
    const shear = Matrix3.pool.fetch().setToAffine(1, 0, 0, -0.3, 1, 0);
    this.appendMatrix(shear);

    // After shearing, center on the LatticeNode.  Vertical offset determined empirically.
    this.translate(-CANVAS_WIDTH / 2, 0);
  }

  /**
   * Sets the color of the peaks of the wave.
   */
  setBaseColor(color) {
    this.baseColor = color;
    this.invalidatePaint();
  }

  /**
   * Draws into the canvas.
   */
  paintCanvas(context) {
    const intensityValues = this.intensitySample.getIntensityValues();
    let m = 0;
    const data = this.imageDataRenderer.data;
    const dampY = this.lattice.dampY;
    const height = this.lattice.height;

    // Smoothing for the screen node
    const windowRadius = this.lightScreenAveragingWindowSize;
    for (let k = dampY; k < height - dampY; k++) {
      let sum = intensityValues[k - this.lattice.dampY];
      let count = 1;

      // Average within the window, but don't go out of range
      for (let i = 1; i < windowRadius; i++) {
        if (k - this.lattice.dampY + i < intensityValues.length) {
          sum = sum + intensityValues[k - this.lattice.dampY + i];
          count++;
        }
        if (k - this.lattice.dampY - i >= 0) {
          sum = sum + intensityValues[k - this.lattice.dampY - i];
          count++;
        }
      }
      const intensity = sum / count;
      const brightness = this.piecewiseLinearBrightness ? piecewiseBrightnessFunction(intensity) : linearBrightnessFunction(intensity);

      // Note this interpolation doesn't include the gamma factor that Color.blend does
      const r = this.baseColor.red * brightness;
      const g = this.baseColor.green * brightness;
      const b = this.baseColor.blue * brightness;
      const offset = 4 * m;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = 255; // Fully opaque
      m++;
    }
    this.imageDataRenderer.putImageData();

    // draw the sub-canvas to the rendering context at the appropriate scale
    context.save();
    context.transform(100, 0, 0, this.latticeCanvasBounds.height / this.lattice.visibleBounds.height, 0, 0);
    context.drawImage(this.imageDataRenderer.canvas, 0, 0);
    context.restore();
  }
}
waveInterference.register('LightScreenNode', LightScreenNode);
export default LightScreenNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIiwiVXRpbHMiLCJtZXJnZSIsIkNhbnZhc05vZGUiLCJDb2xvciIsIndhdmVJbnRlcmZlcmVuY2UiLCJXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIiwiV2F2ZUludGVyZmVyZW5jZVV0aWxzIiwiSW1hZ2VEYXRhUmVuZGVyZXIiLCJDQU5WQVNfV0lEVEgiLCJCUklHSFRORVNTX1NDQUxFX0ZBQ1RPUiIsInBpZWNld2lzZUJyaWdodG5lc3NGdW5jdGlvbiIsImludGVuc2l0eSIsImJyaWdodG5lc3MiLCJldmFsdWF0ZSIsImNsYW1wIiwibGluZWFyQnJpZ2h0bmVzc0Z1bmN0aW9uIiwibGluZWFyIiwiTUFYX0FNUExJVFVERV9UT19QTE9UX09OX1JJR0hUIiwiTGlnaHRTY3JlZW5Ob2RlIiwiY29uc3RydWN0b3IiLCJsYXR0aWNlIiwiaW50ZW5zaXR5U2FtcGxlIiwib3B0aW9ucyIsImxhdHRpY2VDYW52YXNCb3VuZHMiLCJnZXRDYW52YXNCb3VuZHMiLCJjYW52YXNCb3VuZHMiLCJoZWlnaHQiLCJsYXllclNwbGl0IiwicGllY2V3aXNlTGluZWFyQnJpZ2h0bmVzcyIsImxpZ2h0U2NyZWVuQXZlcmFnaW5nV2luZG93U2l6ZSIsImJhc2VDb2xvciIsIndpZHRoIiwiaW1hZ2VEYXRhUmVuZGVyZXIiLCJ2aXNpYmxlQm91bmRzIiwiY2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImludmFsaWRhdGVQYWludCIsImJpbmQiLCJzaGVhciIsInBvb2wiLCJmZXRjaCIsInNldFRvQWZmaW5lIiwiYXBwZW5kTWF0cml4IiwidHJhbnNsYXRlIiwic2V0QmFzZUNvbG9yIiwiY29sb3IiLCJwYWludENhbnZhcyIsImNvbnRleHQiLCJpbnRlbnNpdHlWYWx1ZXMiLCJnZXRJbnRlbnNpdHlWYWx1ZXMiLCJtIiwiZGF0YSIsImRhbXBZIiwid2luZG93UmFkaXVzIiwiayIsInN1bSIsImNvdW50IiwiaSIsImxlbmd0aCIsInIiLCJyZWQiLCJnIiwiZ3JlZW4iLCJiIiwiYmx1ZSIsIm9mZnNldCIsInB1dEltYWdlRGF0YSIsInNhdmUiLCJ0cmFuc2Zvcm0iLCJkcmF3SW1hZ2UiLCJjYW52YXMiLCJyZXN0b3JlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaWdodFNjcmVlbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBSZW5kZXJzIHRoZSBzY3JlZW4gYXQgcmlnaHQgaGFuZCBzaWRlIG9mIHRoZSB3YXZlIGFyZWEsIHNob3dpbmcgdGhlIHRpbWUtYXZlcmFnZWQgaW50ZW5zaXR5IChmb3IgdGhlIGxpZ2h0IHNjZW5lKS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9QaWVjZXdpc2VMaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzTm9kZSwgQ2FudmFzTm9kZU9wdGlvbnMsIENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIGZyb20gJy4uL1dhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTGF0dGljZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTGF0dGljZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlVXRpbHMgZnJvbSAnLi4vV2F2ZUludGVyZmVyZW5jZVV0aWxzLmpzJztcclxuaW1wb3J0IEltYWdlRGF0YVJlbmRlcmVyIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9JbWFnZURhdGFSZW5kZXJlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ0FOVkFTX1dJRFRIID0gMTAwO1xyXG5cclxuLy8gVGhpcyBjaG9vc2VzIHRoZSBzYXR1cmF0aW9uIHBvaW50IGZvciB0aGUgc2NyZWVuLCBhcyB3ZWxsIGFzIHRoZSBcInRoaW5uZXNzXCIgb2YgdGhlIG1pbmltYVxyXG5jb25zdCBCUklHSFRORVNTX1NDQUxFX0ZBQ1RPUiA9IDU7XHJcblxyXG4vLyBQaWVjZXdpc2UgbGluZWFyIGZ1bmN0aW9uIG9wdGltaXplZCBmb3IgYSB3aWRlIHJhbmdlIG9mIGJyaWdodG5lc3MsIHVzZWQgaW4gV2F2ZXMgSW50cm8gc2ltIGFuZCBXYXZlcyBzY3JlZW5cclxuY29uc3QgcGllY2V3aXNlQnJpZ2h0bmVzc0Z1bmN0aW9uID0gaW50ZW5zaXR5ID0+IHtcclxuICBjb25zdCBicmlnaHRuZXNzID0gUGllY2V3aXNlTGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIFtcclxuICAgIDAsIDAsXHJcbiAgICAwLjAwMjIzNzA4OTI2OTY0MDMzNSwgMC40LFxyXG4gICAgMC4wMDg5MzcwODkyNjk2NDAzMzUsIDAuNSxcclxuICAgIDAuMDUzNzIyNzc0Mzg0MTM1NzMsIDAuNjQsXHJcbiAgICAwLjEzNDIyNjM0Mzk3MTQ0NjkyLCAwLjc0LFxyXG4gICAgMC4yMDk2OTM0NjkyODg5Mzk1LCAwLjgsXHJcbiAgICAxLCAxXHJcbiAgXSwgaW50ZW5zaXR5ICk7XHJcbiAgcmV0dXJuIFV0aWxzLmNsYW1wKCBicmlnaHRuZXNzLCAwLCAxICk7XHJcbn07XHJcblxyXG4vLyBMaW5lYXIgYnJpZ2h0bmVzcyBmdW5jdGlvbiBvcHRpbWl6ZWQgZm9yIHNob3dpbmcgaW50ZXJmZXJlbmNlIHBhdHRlcm5zIGluIHRoZSBJbnRlcmZlcmVuY2UgYW5kIFNsaXRzIHNjcmVlbnNcclxuY29uc3QgbGluZWFyQnJpZ2h0bmVzc0Z1bmN0aW9uID0gaW50ZW5zaXR5ID0+IHtcclxuICBjb25zdCBicmlnaHRuZXNzID0gVXRpbHMubGluZWFyKCAwLCBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLk1BWF9BTVBMSVRVREVfVE9fUExPVF9PTl9SSUdIVCwgMCwgMSwgaW50ZW5zaXR5ICk7XHJcbiAgcmV0dXJuIFV0aWxzLmNsYW1wKCBicmlnaHRuZXNzICogQlJJR0hUTkVTU19TQ0FMRV9GQUNUT1IsIDAsIDEgKTtcclxufTtcclxuXHJcbmNsYXNzIExpZ2h0U2NyZWVuTm9kZSBleHRlbmRzIENhbnZhc05vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxhdHRpY2U6IExhdHRpY2UsIGludGVuc2l0eVNhbXBsZTogbnVtYmVyW10sIG9wdGlvbnM/OiBDYW52YXNOb2RlT3B0aW9ucyApIHtcclxuICAgIGNvbnN0IGxhdHRpY2VDYW52YXNCb3VuZHMgPSBXYXZlSW50ZXJmZXJlbmNlVXRpbHMuZ2V0Q2FudmFzQm91bmRzKCBsYXR0aWNlICk7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIG9ubHkgdXNlIHRoZSB2aXNpYmxlIHBhcnQgZm9yIHRoZSBib3VuZHMgKG5vdCB0aGUgZGFtcGluZyByZWdpb25zKVxyXG4gICAgICBjYW52YXNCb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCBDQU5WQVNfV0lEVEgsIGxhdHRpY2VDYW52YXNCb3VuZHMuaGVpZ2h0ICksXHJcbiAgICAgIGxheWVyU3BsaXQ6IHRydWUsIC8vIGVuc3VyZSB3ZSdyZSBvbiBvdXIgb3duIGxheWVyXHJcbiAgICAgIHBpZWNld2lzZUxpbmVhckJyaWdodG5lc3M6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gVXNlIGEgc21hbGwgd2luZG93IGZvciBpbnRlcmZlcmVuY2UgYW5kIHNsaXRzIHNjcmVlbnMsIHRvIGFjY2VudHVhdGUgdGhlIHBhdHRlcm5zXHJcbiAgICAgIC8vIFVzZSBhIGxhcmdlIHdpbmRvdyBmb3Igd2F2ZXMtaW50cm8gYW5kIHdhdmVzIHNjcmVlbiwgdG8gc21vb3RoIG91dCBub2lzZVxyXG4gICAgICBsaWdodFNjcmVlbkF2ZXJhZ2luZ1dpbmRvd1NpemU6IDNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBmb3IgdGhlIHZlcnRpY2FsIHNjYWxlIGZhY3RvclxyXG4gICAgdGhpcy5sYXR0aWNlQ2FudmFzQm91bmRzID0gbGF0dGljZUNhbnZhc0JvdW5kcztcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5sYXR0aWNlID0gbGF0dGljZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5waWVjZXdpc2VMaW5lYXJCcmlnaHRuZXNzID0gb3B0aW9ucy5waWVjZXdpc2VMaW5lYXJCcmlnaHRuZXNzO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmxpZ2h0U2NyZWVuQXZlcmFnaW5nV2luZG93U2l6ZSA9IG9wdGlvbnMubGlnaHRTY3JlZW5BdmVyYWdpbmdXaW5kb3dTaXplO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmludGVuc2l0eVNhbXBsZSA9IGludGVuc2l0eVNhbXBsZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q29sb3J9IHJlcXVpcmVkIGJlY2F1c2Ugd2UnbGwgYmUgb3BlcmF0aW5nIG9uIGEgQ29sb3JcclxuICAgIHRoaXMuYmFzZUNvbG9yID0gbmV3IENvbG9yKCAnYmx1ZScgKTtcclxuXHJcbiAgICAvLyBSZW5kZXIgaW50byBhIHN1Yi1jYW52YXMgd2hpY2ggd2lsbCBiZSBkcmF3biBpbnRvIHRoZSByZW5kZXJpbmcgY29udGV4dCBhdCB0aGUgcmlnaHQgc2NhbGUuXHJcbiAgICAvLyBVc2UgYSBzaW5nbGUgY29sdW1uIG9mIHBpeGVscywgdGhlbiBzdHJldGNoIHRoZW0gdG8gdGhlIHJpZ2h0IChzaW5jZSB0aGF0IGlzIGEgY29uc3RhbnQpXHJcbiAgICBjb25zdCB3aWR0aCA9IDE7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBmb3IgcmVuZGVyaW5nIHZpYSBpbWFnZSBkYXRhXHJcbiAgICB0aGlzLmltYWdlRGF0YVJlbmRlcmVyID0gbmV3IEltYWdlRGF0YVJlbmRlcmVyKCB3aWR0aCwgbGF0dGljZS52aXNpYmxlQm91bmRzLmhlaWdodCApO1xyXG5cclxuICAgIC8vIEludmFsaWRhdGUgcGFpbnQgd2hlbiBtb2RlbCBpbmRpY2F0ZXMgY2hhbmdlc1xyXG4gICAgbGF0dGljZS5jaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5pbnZhbGlkYXRlUGFpbnQuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgLy8gU2hvdyBpdCBhdCBhIDNkIHBlcnNwZWN0aXZlLCBhcyBpZiBvcnRob2dvbmFsIHRvIHRoZSB3YXZlIHZpZXdcclxuICAgIGNvbnN0IHNoZWFyID0gTWF0cml4My5wb29sLmZldGNoKCkuc2V0VG9BZmZpbmUoIDEsIDAsIDAsIC0wLjMsIDEsIDAgKTtcclxuICAgIHRoaXMuYXBwZW5kTWF0cml4KCBzaGVhciApO1xyXG5cclxuICAgIC8vIEFmdGVyIHNoZWFyaW5nLCBjZW50ZXIgb24gdGhlIExhdHRpY2VOb2RlLiAgVmVydGljYWwgb2Zmc2V0IGRldGVybWluZWQgZW1waXJpY2FsbHkuXHJcbiAgICB0aGlzLnRyYW5zbGF0ZSggLUNBTlZBU19XSURUSCAvIDIsIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNvbG9yIG9mIHRoZSBwZWFrcyBvZiB0aGUgd2F2ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QmFzZUNvbG9yKCBjb2xvcjogQ29sb3IgKTogdm9pZCB7XHJcbiAgICB0aGlzLmJhc2VDb2xvciA9IGNvbG9yO1xyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXdzIGludG8gdGhlIGNhbnZhcy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgcGFpbnRDYW52YXMoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBpbnRlbnNpdHlWYWx1ZXMgPSB0aGlzLmludGVuc2l0eVNhbXBsZS5nZXRJbnRlbnNpdHlWYWx1ZXMoKTtcclxuXHJcbiAgICBsZXQgbSA9IDA7XHJcbiAgICBjb25zdCBkYXRhID0gdGhpcy5pbWFnZURhdGFSZW5kZXJlci5kYXRhO1xyXG4gICAgY29uc3QgZGFtcFkgPSB0aGlzLmxhdHRpY2UuZGFtcFk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmxhdHRpY2UuaGVpZ2h0O1xyXG5cclxuICAgIC8vIFNtb290aGluZyBmb3IgdGhlIHNjcmVlbiBub2RlXHJcbiAgICBjb25zdCB3aW5kb3dSYWRpdXMgPSB0aGlzLmxpZ2h0U2NyZWVuQXZlcmFnaW5nV2luZG93U2l6ZTtcclxuXHJcbiAgICBmb3IgKCBsZXQgayA9IGRhbXBZOyBrIDwgaGVpZ2h0IC0gZGFtcFk7IGsrKyApIHtcclxuXHJcbiAgICAgIGxldCBzdW0gPSBpbnRlbnNpdHlWYWx1ZXNbIGsgLSB0aGlzLmxhdHRpY2UuZGFtcFkgXTtcclxuICAgICAgbGV0IGNvdW50ID0gMTtcclxuXHJcbiAgICAgIC8vIEF2ZXJhZ2Ugd2l0aGluIHRoZSB3aW5kb3csIGJ1dCBkb24ndCBnbyBvdXQgb2YgcmFuZ2VcclxuICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDwgd2luZG93UmFkaXVzOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCBrIC0gdGhpcy5sYXR0aWNlLmRhbXBZICsgaSA8IGludGVuc2l0eVZhbHVlcy5sZW5ndGggKSB7XHJcbiAgICAgICAgICBzdW0gPSBzdW0gKyBpbnRlbnNpdHlWYWx1ZXNbIGsgLSB0aGlzLmxhdHRpY2UuZGFtcFkgKyBpIF07XHJcbiAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGsgLSB0aGlzLmxhdHRpY2UuZGFtcFkgLSBpID49IDAgKSB7XHJcbiAgICAgICAgICBzdW0gPSBzdW0gKyBpbnRlbnNpdHlWYWx1ZXNbIGsgLSB0aGlzLmxhdHRpY2UuZGFtcFkgLSBpIF07XHJcbiAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjb25zdCBpbnRlbnNpdHkgPSBzdW0gLyBjb3VudDtcclxuICAgICAgY29uc3QgYnJpZ2h0bmVzcyA9IHRoaXMucGllY2V3aXNlTGluZWFyQnJpZ2h0bmVzcyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwaWVjZXdpc2VCcmlnaHRuZXNzRnVuY3Rpb24oIGludGVuc2l0eSApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVhckJyaWdodG5lc3NGdW5jdGlvbiggaW50ZW5zaXR5ICk7XHJcblxyXG4gICAgICAvLyBOb3RlIHRoaXMgaW50ZXJwb2xhdGlvbiBkb2Vzbid0IGluY2x1ZGUgdGhlIGdhbW1hIGZhY3RvciB0aGF0IENvbG9yLmJsZW5kIGRvZXNcclxuICAgICAgY29uc3QgciA9IHRoaXMuYmFzZUNvbG9yLnJlZCAqIGJyaWdodG5lc3M7XHJcbiAgICAgIGNvbnN0IGcgPSB0aGlzLmJhc2VDb2xvci5ncmVlbiAqIGJyaWdodG5lc3M7XHJcbiAgICAgIGNvbnN0IGIgPSB0aGlzLmJhc2VDb2xvci5ibHVlICogYnJpZ2h0bmVzcztcclxuXHJcbiAgICAgIGNvbnN0IG9mZnNldCA9IDQgKiBtO1xyXG4gICAgICBkYXRhWyBvZmZzZXQgXSA9IHI7XHJcbiAgICAgIGRhdGFbIG9mZnNldCArIDEgXSA9IGc7XHJcbiAgICAgIGRhdGFbIG9mZnNldCArIDIgXSA9IGI7XHJcbiAgICAgIGRhdGFbIG9mZnNldCArIDMgXSA9IDI1NTsgLy8gRnVsbHkgb3BhcXVlXHJcbiAgICAgIG0rKztcclxuICAgIH1cclxuICAgIHRoaXMuaW1hZ2VEYXRhUmVuZGVyZXIucHV0SW1hZ2VEYXRhKCk7XHJcblxyXG4gICAgLy8gZHJhdyB0aGUgc3ViLWNhbnZhcyB0byB0aGUgcmVuZGVyaW5nIGNvbnRleHQgYXQgdGhlIGFwcHJvcHJpYXRlIHNjYWxlXHJcbiAgICBjb250ZXh0LnNhdmUoKTtcclxuICAgIGNvbnRleHQudHJhbnNmb3JtKCAxMDAsIDAsIDAsIHRoaXMubGF0dGljZUNhbnZhc0JvdW5kcy5oZWlnaHQgLyB0aGlzLmxhdHRpY2UudmlzaWJsZUJvdW5kcy5oZWlnaHQsIDAsIDAgKTtcclxuICAgIGNvbnRleHQuZHJhd0ltYWdlKCB0aGlzLmltYWdlRGF0YVJlbmRlcmVyLmNhbnZhcywgMCwgMCApO1xyXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnTGlnaHRTY3JlZW5Ob2RlJywgTGlnaHRTY3JlZW5Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IExpZ2h0U2NyZWVuTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyx1QkFBdUIsTUFBTSwrQ0FBK0M7QUFDbkYsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFVBQVUsRUFBcUJDLEtBQUssUUFBUSxtQ0FBbUM7QUFDeEYs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