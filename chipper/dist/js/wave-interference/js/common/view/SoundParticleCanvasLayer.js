// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * When selected, shows discrete and moving particles for the sound view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import SoundParticleNode from './SoundParticleNode.js';
// constants
// Render at increased resolution so particles don't appear pixellated on a large screen.  See Node.rasterized's
// resolution option for details about this value.
const RESOLUTION = 2;
class SoundParticleCanvasLayer extends CanvasNode {
  constructor(model, waveAreaNodeBounds, options) {
    options = merge({
      // only use the visible part for the bounds (not the damping regions).  Additionally erode so the particles
      // don't leak over the edge of the wave area
      canvasBounds: waveAreaNodeBounds.eroded(5),
      layerSplit: true // ensure we're on our own layer
    }, options);
    super(options);

    // @private
    this.model = model;
    SoundParticleNode.createForCanvas(WaveInterferenceConstants.SOUND_PARTICLE_GRAY_COLOR, canvas => {
      // @private {HTMLCanvasElement} - assigned synchronously and is guaranteed to exist after createSphereImage
      this.whiteSphereImage = canvas;
    });
    SoundParticleNode.createForCanvas(WaveInterferenceConstants.SOUND_PARTICLE_RED_COLOR, canvas => {
      // @private {HTMLCanvasElement} - assigned synchronously and is guaranteed to exist after createSphereImage
      this.redSphereImage = canvas;
    });

    // At the end of each model step, update all of the particles as a batch.
    const update = () => {
      if (model.sceneProperty.value === model.soundScene) {
        this.invalidatePaint();
      }
    };
    model.stepEmitter.addListener(update);
    model.sceneProperty.link(update);
  }

  /**
   * Draws into the canvas.
   */
  paintCanvas(context) {
    context.transform(1 / RESOLUTION, 0, 0, 1 / RESOLUTION, 0, 0);
    for (let i = 0; i < this.model.soundScene.soundParticles.length; i++) {
      const soundParticle = this.model.soundScene.soundParticles[i];

      // Red particles are shown on a grid
      const isRed = soundParticle.i % 4 === 2 && soundParticle.j % 4 === 2;
      const sphereImage = isRed ? this.redSphereImage : this.whiteSphereImage;
      context.drawImage(sphereImage, RESOLUTION * this.model.soundScene.modelViewTransform.modelToViewX(soundParticle.x) - sphereImage.width / 2, RESOLUTION * this.model.soundScene.modelViewTransform.modelToViewY(soundParticle.y) - sphereImage.height / 2);
    }
  }
}
waveInterference.register('SoundParticleCanvasLayer', SoundParticleCanvasLayer);
export default SoundParticleCanvasLayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkNhbnZhc05vZGUiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIlNvdW5kUGFydGljbGVOb2RlIiwiUkVTT0xVVElPTiIsIlNvdW5kUGFydGljbGVDYW52YXNMYXllciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ3YXZlQXJlYU5vZGVCb3VuZHMiLCJvcHRpb25zIiwiY2FudmFzQm91bmRzIiwiZXJvZGVkIiwibGF5ZXJTcGxpdCIsImNyZWF0ZUZvckNhbnZhcyIsIlNPVU5EX1BBUlRJQ0xFX0dSQVlfQ09MT1IiLCJjYW52YXMiLCJ3aGl0ZVNwaGVyZUltYWdlIiwiU09VTkRfUEFSVElDTEVfUkVEX0NPTE9SIiwicmVkU3BoZXJlSW1hZ2UiLCJ1cGRhdGUiLCJzY2VuZVByb3BlcnR5IiwidmFsdWUiLCJzb3VuZFNjZW5lIiwiaW52YWxpZGF0ZVBhaW50Iiwic3RlcEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxpbmsiLCJwYWludENhbnZhcyIsImNvbnRleHQiLCJ0cmFuc2Zvcm0iLCJpIiwic291bmRQYXJ0aWNsZXMiLCJsZW5ndGgiLCJzb3VuZFBhcnRpY2xlIiwiaXNSZWQiLCJqIiwic3BoZXJlSW1hZ2UiLCJkcmF3SW1hZ2UiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJtb2RlbFRvVmlld1giLCJ4Iiwid2lkdGgiLCJtb2RlbFRvVmlld1kiLCJ5IiwiaGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTb3VuZFBhcnRpY2xlQ2FudmFzTGF5ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBXaGVuIHNlbGVjdGVkLCBzaG93cyBkaXNjcmV0ZSBhbmQgbW92aW5nIHBhcnRpY2xlcyBmb3IgdGhlIHNvdW5kIHZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IENhbnZhc05vZGUsIENhbnZhc05vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQm91bmRzMiB9IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIGZyb20gJy4uL1dhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgU291bmRQYXJ0aWNsZU5vZGUgZnJvbSAnLi9Tb3VuZFBhcnRpY2xlTm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlc01vZGVsIGZyb20gJy4uLy4uL3dhdmVzL21vZGVsL1dhdmVzTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIFJlbmRlciBhdCBpbmNyZWFzZWQgcmVzb2x1dGlvbiBzbyBwYXJ0aWNsZXMgZG9uJ3QgYXBwZWFyIHBpeGVsbGF0ZWQgb24gYSBsYXJnZSBzY3JlZW4uICBTZWUgTm9kZS5yYXN0ZXJpemVkJ3NcclxuLy8gcmVzb2x1dGlvbiBvcHRpb24gZm9yIGRldGFpbHMgYWJvdXQgdGhpcyB2YWx1ZS5cclxuY29uc3QgUkVTT0xVVElPTiA9IDI7XHJcblxyXG5jbGFzcyBTb3VuZFBhcnRpY2xlQ2FudmFzTGF5ZXIgZXh0ZW5kcyBDYW52YXNOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogV2F2ZXNNb2RlbCwgd2F2ZUFyZWFOb2RlQm91bmRzOiBCb3VuZHMyLCBvcHRpb25zOiBDYW52YXNOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIG9ubHkgdXNlIHRoZSB2aXNpYmxlIHBhcnQgZm9yIHRoZSBib3VuZHMgKG5vdCB0aGUgZGFtcGluZyByZWdpb25zKS4gIEFkZGl0aW9uYWxseSBlcm9kZSBzbyB0aGUgcGFydGljbGVzXHJcbiAgICAgIC8vIGRvbid0IGxlYWsgb3ZlciB0aGUgZWRnZSBvZiB0aGUgd2F2ZSBhcmVhXHJcbiAgICAgIGNhbnZhc0JvdW5kczogd2F2ZUFyZWFOb2RlQm91bmRzLmVyb2RlZCggNSApLFxyXG4gICAgICBsYXllclNwbGl0OiB0cnVlIC8vIGVuc3VyZSB3ZSdyZSBvbiBvdXIgb3duIGxheWVyXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIFNvdW5kUGFydGljbGVOb2RlLmNyZWF0ZUZvckNhbnZhcyggV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5TT1VORF9QQVJUSUNMRV9HUkFZX0NPTE9SLCBjYW52YXMgPT4ge1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge0hUTUxDYW52YXNFbGVtZW50fSAtIGFzc2lnbmVkIHN5bmNocm9ub3VzbHkgYW5kIGlzIGd1YXJhbnRlZWQgdG8gZXhpc3QgYWZ0ZXIgY3JlYXRlU3BoZXJlSW1hZ2VcclxuICAgICAgdGhpcy53aGl0ZVNwaGVyZUltYWdlID0gY2FudmFzO1xyXG4gICAgfSApO1xyXG5cclxuICAgIFNvdW5kUGFydGljbGVOb2RlLmNyZWF0ZUZvckNhbnZhcyggV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5TT1VORF9QQVJUSUNMRV9SRURfQ09MT1IsIGNhbnZhcyA9PiB7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZSB7SFRNTENhbnZhc0VsZW1lbnR9IC0gYXNzaWduZWQgc3luY2hyb25vdXNseSBhbmQgaXMgZ3VhcmFudGVlZCB0byBleGlzdCBhZnRlciBjcmVhdGVTcGhlcmVJbWFnZVxyXG4gICAgICB0aGlzLnJlZFNwaGVyZUltYWdlID0gY2FudmFzO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEF0IHRoZSBlbmQgb2YgZWFjaCBtb2RlbCBzdGVwLCB1cGRhdGUgYWxsIG9mIHRoZSBwYXJ0aWNsZXMgYXMgYSBiYXRjaC5cclxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5zY2VuZVByb3BlcnR5LnZhbHVlID09PSBtb2RlbC5zb3VuZFNjZW5lICkge1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBtb2RlbC5zdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlICk7XHJcbiAgICBtb2RlbC5zY2VuZVByb3BlcnR5LmxpbmsoIHVwZGF0ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJhd3MgaW50byB0aGUgY2FudmFzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBwYWludENhbnZhcyggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQge1xyXG4gICAgY29udGV4dC50cmFuc2Zvcm0oIDEgLyBSRVNPTFVUSU9OLCAwLCAwLCAxIC8gUkVTT0xVVElPTiwgMCwgMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tb2RlbC5zb3VuZFNjZW5lLnNvdW5kUGFydGljbGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBzb3VuZFBhcnRpY2xlID0gdGhpcy5tb2RlbC5zb3VuZFNjZW5lLnNvdW5kUGFydGljbGVzWyBpIF07XHJcblxyXG4gICAgICAvLyBSZWQgcGFydGljbGVzIGFyZSBzaG93biBvbiBhIGdyaWRcclxuICAgICAgY29uc3QgaXNSZWQgPSAoIHNvdW5kUGFydGljbGUuaSAlIDQgPT09IDIgJiYgc291bmRQYXJ0aWNsZS5qICUgNCA9PT0gMiApO1xyXG4gICAgICBjb25zdCBzcGhlcmVJbWFnZSA9IGlzUmVkID8gdGhpcy5yZWRTcGhlcmVJbWFnZSA6IHRoaXMud2hpdGVTcGhlcmVJbWFnZTtcclxuXHJcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKFxyXG4gICAgICAgIHNwaGVyZUltYWdlLFxyXG4gICAgICAgIFJFU09MVVRJT04gKiAoIHRoaXMubW9kZWwuc291bmRTY2VuZS5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBzb3VuZFBhcnRpY2xlLnggKSApIC0gc3BoZXJlSW1hZ2Uud2lkdGggLyAyLFxyXG4gICAgICAgIFJFU09MVVRJT04gKiAoIHRoaXMubW9kZWwuc291bmRTY2VuZS5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBzb3VuZFBhcnRpY2xlLnkgKSApIC0gc3BoZXJlSW1hZ2UuaGVpZ2h0IC8gMlxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ1NvdW5kUGFydGljbGVDYW52YXNMYXllcicsIFNvdW5kUGFydGljbGVDYW52YXNMYXllciApO1xyXG5leHBvcnQgZGVmYXVsdCBTb3VuZFBhcnRpY2xlQ2FudmFzTGF5ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFVBQVUsUUFBMkIsbUNBQW1DO0FBRWpGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBR3REO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLFVBQVUsR0FBRyxDQUFDO0FBRXBCLE1BQU1DLHdCQUF3QixTQUFTTCxVQUFVLENBQUM7RUFFekNNLFdBQVdBLENBQUVDLEtBQWlCLEVBQUVDLGtCQUEyQixFQUFFQyxPQUEwQixFQUFHO0lB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