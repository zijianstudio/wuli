// Copyright 2020-2022, University of Colorado Boulder

/**
 * ParticlesNode draws the particles that appear in the magnifying glass.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import createParticleNode from './createParticleNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
// constants
const BASE_CONCENTRATION = 1E-7; // [H3O+] and [OH-] in pure water, value chosen so that pure water shows some particles
const BASE_DOTS = 2;
const MAX_PARTICLES = 200;
const IMAGE_SCALE = 2; // stored images are scaled this much to improve quality

// Data structure used to store information for each unique type of particle
export default class ParticlesNode extends CanvasNode {
  // radius for computing random positions

  constructor(magnifyingGlass, lensBounds, lensLineWidth, tandem) {
    super({
      canvasBounds: lensBounds,
      tandem: tandem,
      phetioVisiblePropertyInstrumented: false
    });
    this.magnifyingGlass = magnifyingGlass;
    this.positionRadius = IMAGE_SCALE * (this.magnifyingGlass.radius - lensLineWidth / 2);
    this.particlesDataMap = new Map();

    // Generate images, to populate ParticlesData.canvas. This happens asynchronously.
    const createCanvas = key => {
      const particleNode = createParticleNode(key);

      // Scale up to increase quality. Remember to scale down when drawing to canvas.
      particleNode.setScaleMagnitude(IMAGE_SCALE, IMAGE_SCALE);
      particleNode.toCanvas((canvas, x, y, width, height) => {
        const particlesData = this.particlesDataMap.get(key);
        assert && assert(particlesData);
        particlesData.canvas = canvas;
      });
    };

    // use typed array if available, it will use less memory and be faster
    const ArrayConstructor = window.Float32Array || window.Array;

    // Iterate over all solutions, and create a ParticlesData structure for each unique particle.
    magnifyingGlass.solutionsMap.forEach((solution, solutionType) => {
      solution.particles.forEach(particle => {
        const key = particle.key;

        // Skip water because it's displayed elsewhere as a static image file.
        // And since different solutions have the same particles, skip creation of duplicates.
        if (key !== 'H2O' && !this.particlesDataMap.get(key)) {
          this.particlesDataMap.set(key, {
            canvas: null,
            countProperty: new NumberProperty(0, {
              isValidValue: value => Number.isInteger(value) && value >= 0,
              tandem: tandem.createTandem(`count${key}Property`),
              phetioReadOnly: true
            }),
            xCoordinates: new ArrayConstructor(MAX_PARTICLES),
            // pre-allocate to improve performance
            yCoordinates: new ArrayConstructor(MAX_PARTICLES) // pre-allocate to improve performance
          });

          createCanvas(key); // populate the canvas field asynchronously
        }
      });
    });
  }

  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    // Reset all particle counts to zero.
    this.particlesDataMap.forEach((particlesData, key) => {
      particlesData.countProperty.value = 0;
    });
  }

  // Updates the particles data structure and triggers a paintCanvas.
  update() {
    const solutionType = this.magnifyingGlass.solutionTypeProperty.value;
    const solution = this.magnifyingGlass.solutionsMap.get(solutionType);
    assert && assert(solution);

    // Update the data structure for each particle that is in the current solution.
    solution.particles.forEach(particle => {
      const key = particle.key;

      // Skip water because it's displayed elsewhere as a static image file.
      if (key !== 'H2O') {
        const particlesData = this.particlesDataMap.get(key);
        assert && assert(particlesData, `no particleData for key=${key}`);

        // map concentration to number of particles
        const concentration = particle.getConcentration();
        const newCount = getParticleCount(concentration);

        // add additional particles as needed
        const oldCount = particlesData.countProperty.value;
        for (let i = oldCount; i < newCount; i++) {
          // random distance from the center of the lens
          const distance = this.positionRadius * Math.sqrt(dotRandom.nextDouble());
          const angle = dotRandom.nextDouble() * 2 * Math.PI;
          particlesData.xCoordinates[i] = distance * Math.cos(angle);
          particlesData.yCoordinates[i] = distance * Math.sin(angle);
        }
        particlesData.countProperty.value = newCount;
      }
    });

    // This results in paintCanvas being called.
    this.invalidatePaint();
  }

  /*
   * Iterates over each of the current solution's particles and draws the particles directly to Canvas.
   */
  paintCanvas(context) {
    const solutionType = this.magnifyingGlass.solutionTypeProperty.value;
    const solution = this.magnifyingGlass.solutionsMap.get(solutionType);
    assert && assert(solution);

    // createCanvas created HTMLCanvasElement at a higher resolution to improve quality.
    // So apply the inverse scale factor, and adjust the radius.
    context.scale(1 / IMAGE_SCALE, 1 / IMAGE_SCALE);

    // Draw each type of particle that is in the current solution.
    solution.particles.forEach(particle => {
      const key = particle.key;

      // Skip water because it's displayed elsewhere as a static image file.
      if (key !== 'H2O') {
        const particlesData = this.particlesDataMap.get(key);
        assert && assert(particlesData);

        // Images are generated asynchronously, so test in case they aren't available when this is first called.
        if (particlesData.canvas) {
          for (let i = 0; i < particlesData.countProperty.value; i++) {
            // Use integer coordinates with drawImage to improve performance.
            const x = Math.floor(particlesData.xCoordinates[i] - particlesData.canvas.width / 2);
            const y = Math.floor(particlesData.yCoordinates[i] - particlesData.canvas.height / 2);
            context.drawImage(particlesData.canvas, x, y);
          }
        }
      }
    });
  }
}

/**
 * Compute the number of particles that corresponds to some concentration.
 * This algorithm was ported from the Java implementation, and is documented in
 * https://github.com/phetsims/acid-base-solutions/blob/master/doc/HA_A-_ratio_model.pdf
 */
function getParticleCount(concentration) {
  const raiseFactor = Utils.log10(concentration / BASE_CONCENTRATION);
  const baseFactor = Math.pow(MAX_PARTICLES / BASE_DOTS, 1 / Utils.log10(1 / BASE_CONCENTRATION));
  return Utils.roundSymmetric(BASE_DOTS * Math.pow(baseFactor, raiseFactor));
}
acidBaseSolutions.register('ParticlesNode', ParticlesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJVdGlscyIsIkNhbnZhc05vZGUiLCJhY2lkQmFzZVNvbHV0aW9ucyIsImNyZWF0ZVBhcnRpY2xlTm9kZSIsIk51bWJlclByb3BlcnR5IiwiQkFTRV9DT05DRU5UUkFUSU9OIiwiQkFTRV9ET1RTIiwiTUFYX1BBUlRJQ0xFUyIsIklNQUdFX1NDQUxFIiwiUGFydGljbGVzTm9kZSIsImNvbnN0cnVjdG9yIiwibWFnbmlmeWluZ0dsYXNzIiwibGVuc0JvdW5kcyIsImxlbnNMaW5lV2lkdGgiLCJ0YW5kZW0iLCJjYW52YXNCb3VuZHMiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwb3NpdGlvblJhZGl1cyIsInJhZGl1cyIsInBhcnRpY2xlc0RhdGFNYXAiLCJNYXAiLCJjcmVhdGVDYW52YXMiLCJrZXkiLCJwYXJ0aWNsZU5vZGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsInRvQ2FudmFzIiwiY2FudmFzIiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsInBhcnRpY2xlc0RhdGEiLCJnZXQiLCJhc3NlcnQiLCJBcnJheUNvbnN0cnVjdG9yIiwid2luZG93IiwiRmxvYXQzMkFycmF5IiwiQXJyYXkiLCJzb2x1dGlvbnNNYXAiLCJmb3JFYWNoIiwic29sdXRpb24iLCJzb2x1dGlvblR5cGUiLCJwYXJ0aWNsZXMiLCJwYXJ0aWNsZSIsInNldCIsImNvdW50UHJvcGVydHkiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsIk51bWJlciIsImlzSW50ZWdlciIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwieENvb3JkaW5hdGVzIiwieUNvb3JkaW5hdGVzIiwiZGlzcG9zZSIsInJlc2V0IiwidXBkYXRlIiwic29sdXRpb25UeXBlUHJvcGVydHkiLCJjb25jZW50cmF0aW9uIiwiZ2V0Q29uY2VudHJhdGlvbiIsIm5ld0NvdW50IiwiZ2V0UGFydGljbGVDb3VudCIsIm9sZENvdW50IiwiaSIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiLCJuZXh0RG91YmxlIiwiYW5nbGUiLCJQSSIsImNvcyIsInNpbiIsImludmFsaWRhdGVQYWludCIsInBhaW50Q2FudmFzIiwiY29udGV4dCIsInNjYWxlIiwiZmxvb3IiLCJkcmF3SW1hZ2UiLCJyYWlzZUZhY3RvciIsImxvZzEwIiwiYmFzZUZhY3RvciIsInBvdyIsInJvdW5kU3ltbWV0cmljIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQYXJ0aWNsZXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhcnRpY2xlc05vZGUgZHJhd3MgdGhlIHBhcnRpY2xlcyB0aGF0IGFwcGVhciBpbiB0aGUgbWFnbmlmeWluZyBnbGFzcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBhY2lkQmFzZVNvbHV0aW9ucyBmcm9tICcuLi8uLi9hY2lkQmFzZVNvbHV0aW9ucy5qcyc7XHJcbmltcG9ydCBjcmVhdGVQYXJ0aWNsZU5vZGUgZnJvbSAnLi9jcmVhdGVQYXJ0aWNsZU5vZGUuanMnO1xyXG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzIGZyb20gJy4uL21vZGVsL01hZ25pZnlpbmdHbGFzcy5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IHsgUGFydGljbGVLZXkgfSBmcm9tICcuLi9tb2RlbC9zb2x1dGlvbnMvUGFydGljbGUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCQVNFX0NPTkNFTlRSQVRJT04gPSAxRS03OyAvLyBbSDNPK10gYW5kIFtPSC1dIGluIHB1cmUgd2F0ZXIsIHZhbHVlIGNob3NlbiBzbyB0aGF0IHB1cmUgd2F0ZXIgc2hvd3Mgc29tZSBwYXJ0aWNsZXNcclxuY29uc3QgQkFTRV9ET1RTID0gMjtcclxuY29uc3QgTUFYX1BBUlRJQ0xFUyA9IDIwMDtcclxuY29uc3QgSU1BR0VfU0NBTEUgPSAyOyAvLyBzdG9yZWQgaW1hZ2VzIGFyZSBzY2FsZWQgdGhpcyBtdWNoIHRvIGltcHJvdmUgcXVhbGl0eVxyXG5cclxuLy8gRGF0YSBzdHJ1Y3R1cmUgdXNlZCB0byBzdG9yZSBpbmZvcm1hdGlvbiBmb3IgZWFjaCB1bmlxdWUgdHlwZSBvZiBwYXJ0aWNsZVxyXG50eXBlIFBhcnRpY2xlc0RhdGEgPSB7XHJcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGw7XHJcbiAgY291bnRQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjsgLy8gdGhpcyBpcyBhIFByb3BlcnR5IGZvciBQaEVULWlPXHJcbiAgeENvb3JkaW5hdGVzOiBGbG9hdDMyQXJyYXk7XHJcbiAgeUNvb3JkaW5hdGVzOiBGbG9hdDMyQXJyYXk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJ0aWNsZXNOb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWFnbmlmeWluZ0dsYXNzOiBNYWduaWZ5aW5nR2xhc3M7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwb3NpdGlvblJhZGl1czogbnVtYmVyOyAvLyByYWRpdXMgZm9yIGNvbXB1dGluZyByYW5kb20gcG9zaXRpb25zXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwYXJ0aWNsZXNEYXRhTWFwOiBNYXA8UGFydGljbGVLZXksIFBhcnRpY2xlc0RhdGE+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1hZ25pZnlpbmdHbGFzczogTWFnbmlmeWluZ0dsYXNzLCBsZW5zQm91bmRzOiBCb3VuZHMyLCBsZW5zTGluZVdpZHRoOiBudW1iZXIsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNhbnZhc0JvdW5kczogbGVuc0JvdW5kcyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1hZ25pZnlpbmdHbGFzcyA9IG1hZ25pZnlpbmdHbGFzcztcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uUmFkaXVzID0gSU1BR0VfU0NBTEUgKiAoIHRoaXMubWFnbmlmeWluZ0dsYXNzLnJhZGl1cyAtICggbGVuc0xpbmVXaWR0aCAvIDIgKSApO1xyXG5cclxuICAgIHRoaXMucGFydGljbGVzRGF0YU1hcCA9IG5ldyBNYXA8UGFydGljbGVLZXksIFBhcnRpY2xlc0RhdGE+KCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgaW1hZ2VzLCB0byBwb3B1bGF0ZSBQYXJ0aWNsZXNEYXRhLmNhbnZhcy4gVGhpcyBoYXBwZW5zIGFzeW5jaHJvbm91c2x5LlxyXG4gICAgY29uc3QgY3JlYXRlQ2FudmFzID0gKCBrZXk6IFBhcnRpY2xlS2V5ICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgcGFydGljbGVOb2RlID0gY3JlYXRlUGFydGljbGVOb2RlKCBrZXkgKTtcclxuXHJcbiAgICAgIC8vIFNjYWxlIHVwIHRvIGluY3JlYXNlIHF1YWxpdHkuIFJlbWVtYmVyIHRvIHNjYWxlIGRvd24gd2hlbiBkcmF3aW5nIHRvIGNhbnZhcy5cclxuICAgICAgcGFydGljbGVOb2RlLnNldFNjYWxlTWFnbml0dWRlKCBJTUFHRV9TQ0FMRSwgSU1BR0VfU0NBTEUgKTtcclxuXHJcbiAgICAgIHBhcnRpY2xlTm9kZS50b0NhbnZhcyggKCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGFydGljbGVzRGF0YSA9IHRoaXMucGFydGljbGVzRGF0YU1hcC5nZXQoIGtleSApITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJ0aWNsZXNEYXRhICk7XHJcbiAgICAgICAgcGFydGljbGVzRGF0YS5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gdXNlIHR5cGVkIGFycmF5IGlmIGF2YWlsYWJsZSwgaXQgd2lsbCB1c2UgbGVzcyBtZW1vcnkgYW5kIGJlIGZhc3RlclxyXG4gICAgY29uc3QgQXJyYXlDb25zdHJ1Y3RvciA9IHdpbmRvdy5GbG9hdDMyQXJyYXkgfHwgd2luZG93LkFycmF5O1xyXG5cclxuICAgIC8vIEl0ZXJhdGUgb3ZlciBhbGwgc29sdXRpb25zLCBhbmQgY3JlYXRlIGEgUGFydGljbGVzRGF0YSBzdHJ1Y3R1cmUgZm9yIGVhY2ggdW5pcXVlIHBhcnRpY2xlLlxyXG4gICAgbWFnbmlmeWluZ0dsYXNzLnNvbHV0aW9uc01hcC5mb3JFYWNoKCAoIHNvbHV0aW9uLCBzb2x1dGlvblR5cGUgKSA9PiB7XHJcbiAgICAgIHNvbHV0aW9uLnBhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gcGFydGljbGUua2V5O1xyXG5cclxuICAgICAgICAvLyBTa2lwIHdhdGVyIGJlY2F1c2UgaXQncyBkaXNwbGF5ZWQgZWxzZXdoZXJlIGFzIGEgc3RhdGljIGltYWdlIGZpbGUuXHJcbiAgICAgICAgLy8gQW5kIHNpbmNlIGRpZmZlcmVudCBzb2x1dGlvbnMgaGF2ZSB0aGUgc2FtZSBwYXJ0aWNsZXMsIHNraXAgY3JlYXRpb24gb2YgZHVwbGljYXRlcy5cclxuICAgICAgICBpZiAoIGtleSAhPT0gJ0gyTycgJiYgIXRoaXMucGFydGljbGVzRGF0YU1hcC5nZXQoIGtleSApICkge1xyXG4gICAgICAgICAgdGhpcy5wYXJ0aWNsZXNEYXRhTWFwLnNldCgga2V5LCB7XHJcbiAgICAgICAgICAgIGNhbnZhczogbnVsbCxcclxuICAgICAgICAgICAgY291bnRQcm9wZXJ0eTogbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgICAgICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApICYmICggdmFsdWUgPj0gMCApLFxyXG4gICAgICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggYGNvdW50JHtrZXl9UHJvcGVydHlgICksXHJcbiAgICAgICAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICAgIHhDb29yZGluYXRlczogbmV3IEFycmF5Q29uc3RydWN0b3IoIE1BWF9QQVJUSUNMRVMgKSwgLy8gcHJlLWFsbG9jYXRlIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgeUNvb3JkaW5hdGVzOiBuZXcgQXJyYXlDb25zdHJ1Y3RvciggTUFYX1BBUlRJQ0xFUyApICAvLyBwcmUtYWxsb2NhdGUgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgY3JlYXRlQ2FudmFzKCBrZXkgKTsgLy8gcG9wdWxhdGUgdGhlIGNhbnZhcyBmaWVsZCBhc3luY2hyb25vdXNseVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBSZXNldCBhbGwgcGFydGljbGUgY291bnRzIHRvIHplcm8uXHJcbiAgICB0aGlzLnBhcnRpY2xlc0RhdGFNYXAuZm9yRWFjaCggKCBwYXJ0aWNsZXNEYXRhLCBrZXkgKSA9PiB7XHJcbiAgICAgIHBhcnRpY2xlc0RhdGEuY291bnRQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGVzIHRoZSBwYXJ0aWNsZXMgZGF0YSBzdHJ1Y3R1cmUgYW5kIHRyaWdnZXJzIGEgcGFpbnRDYW52YXMuXHJcbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBzb2x1dGlvblR5cGUgPSB0aGlzLm1hZ25pZnlpbmdHbGFzcy5zb2x1dGlvblR5cGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHNvbHV0aW9uID0gdGhpcy5tYWduaWZ5aW5nR2xhc3Muc29sdXRpb25zTWFwLmdldCggc29sdXRpb25UeXBlICkhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc29sdXRpb24gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGRhdGEgc3RydWN0dXJlIGZvciBlYWNoIHBhcnRpY2xlIHRoYXQgaXMgaW4gdGhlIGN1cnJlbnQgc29sdXRpb24uXHJcbiAgICBzb2x1dGlvbi5wYXJ0aWNsZXMuZm9yRWFjaCggcGFydGljbGUgPT4ge1xyXG5cclxuICAgICAgY29uc3Qga2V5ID0gcGFydGljbGUua2V5O1xyXG5cclxuICAgICAgLy8gU2tpcCB3YXRlciBiZWNhdXNlIGl0J3MgZGlzcGxheWVkIGVsc2V3aGVyZSBhcyBhIHN0YXRpYyBpbWFnZSBmaWxlLlxyXG4gICAgICBpZiAoIGtleSAhPT0gJ0gyTycgKSB7XHJcbiAgICAgICAgY29uc3QgcGFydGljbGVzRGF0YSA9IHRoaXMucGFydGljbGVzRGF0YU1hcC5nZXQoIGtleSApITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJ0aWNsZXNEYXRhLCBgbm8gcGFydGljbGVEYXRhIGZvciBrZXk9JHtrZXl9YCApO1xyXG5cclxuICAgICAgICAvLyBtYXAgY29uY2VudHJhdGlvbiB0byBudW1iZXIgb2YgcGFydGljbGVzXHJcbiAgICAgICAgY29uc3QgY29uY2VudHJhdGlvbiA9IHBhcnRpY2xlLmdldENvbmNlbnRyYXRpb24oKTtcclxuICAgICAgICBjb25zdCBuZXdDb3VudCA9IGdldFBhcnRpY2xlQ291bnQoIGNvbmNlbnRyYXRpb24gKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGFkZGl0aW9uYWwgcGFydGljbGVzIGFzIG5lZWRlZFxyXG4gICAgICAgIGNvbnN0IG9sZENvdW50ID0gcGFydGljbGVzRGF0YS5jb3VudFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gb2xkQ291bnQ7IGkgPCBuZXdDb3VudDsgaSsrICkge1xyXG5cclxuICAgICAgICAgIC8vIHJhbmRvbSBkaXN0YW5jZSBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGxlbnNcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5wb3NpdGlvblJhZGl1cyAqIE1hdGguc3FydCggZG90UmFuZG9tLm5leHREb3VibGUoKSApO1xyXG4gICAgICAgICAgY29uc3QgYW5nbGUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMiAqIE1hdGguUEk7XHJcbiAgICAgICAgICBwYXJ0aWNsZXNEYXRhLnhDb29yZGluYXRlc1sgaSBdID0gZGlzdGFuY2UgKiBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgICAgICAgIHBhcnRpY2xlc0RhdGEueUNvb3JkaW5hdGVzWyBpIF0gPSBkaXN0YW5jZSAqIE1hdGguc2luKCBhbmdsZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFydGljbGVzRGF0YS5jb3VudFByb3BlcnR5LnZhbHVlID0gbmV3Q291bnQ7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGlzIHJlc3VsdHMgaW4gcGFpbnRDYW52YXMgYmVpbmcgY2FsbGVkLlxyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogSXRlcmF0ZXMgb3ZlciBlYWNoIG9mIHRoZSBjdXJyZW50IHNvbHV0aW9uJ3MgcGFydGljbGVzIGFuZCBkcmF3cyB0aGUgcGFydGljbGVzIGRpcmVjdGx5IHRvIENhbnZhcy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgcGFpbnRDYW52YXMoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBzb2x1dGlvblR5cGUgPSB0aGlzLm1hZ25pZnlpbmdHbGFzcy5zb2x1dGlvblR5cGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHNvbHV0aW9uID0gdGhpcy5tYWduaWZ5aW5nR2xhc3Muc29sdXRpb25zTWFwLmdldCggc29sdXRpb25UeXBlICkhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc29sdXRpb24gKTtcclxuXHJcbiAgICAvLyBjcmVhdGVDYW52YXMgY3JlYXRlZCBIVE1MQ2FudmFzRWxlbWVudCBhdCBhIGhpZ2hlciByZXNvbHV0aW9uIHRvIGltcHJvdmUgcXVhbGl0eS5cclxuICAgIC8vIFNvIGFwcGx5IHRoZSBpbnZlcnNlIHNjYWxlIGZhY3RvciwgYW5kIGFkanVzdCB0aGUgcmFkaXVzLlxyXG4gICAgY29udGV4dC5zY2FsZSggMSAvIElNQUdFX1NDQUxFLCAxIC8gSU1BR0VfU0NBTEUgKTtcclxuXHJcbiAgICAvLyBEcmF3IGVhY2ggdHlwZSBvZiBwYXJ0aWNsZSB0aGF0IGlzIGluIHRoZSBjdXJyZW50IHNvbHV0aW9uLlxyXG4gICAgc29sdXRpb24ucGFydGljbGVzLmZvckVhY2goIHBhcnRpY2xlID0+IHtcclxuICAgICAgY29uc3Qga2V5ID0gcGFydGljbGUua2V5O1xyXG5cclxuICAgICAgLy8gU2tpcCB3YXRlciBiZWNhdXNlIGl0J3MgZGlzcGxheWVkIGVsc2V3aGVyZSBhcyBhIHN0YXRpYyBpbWFnZSBmaWxlLlxyXG4gICAgICBpZiAoIGtleSAhPT0gJ0gyTycgKSB7XHJcbiAgICAgICAgY29uc3QgcGFydGljbGVzRGF0YSA9IHRoaXMucGFydGljbGVzRGF0YU1hcC5nZXQoIGtleSApITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJ0aWNsZXNEYXRhICk7XHJcblxyXG4gICAgICAgIC8vIEltYWdlcyBhcmUgZ2VuZXJhdGVkIGFzeW5jaHJvbm91c2x5LCBzbyB0ZXN0IGluIGNhc2UgdGhleSBhcmVuJ3QgYXZhaWxhYmxlIHdoZW4gdGhpcyBpcyBmaXJzdCBjYWxsZWQuXHJcbiAgICAgICAgaWYgKCBwYXJ0aWNsZXNEYXRhLmNhbnZhcyApIHtcclxuICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcnRpY2xlc0RhdGEuY291bnRQcm9wZXJ0eS52YWx1ZTsgaSsrICkge1xyXG5cclxuICAgICAgICAgICAgLy8gVXNlIGludGVnZXIgY29vcmRpbmF0ZXMgd2l0aCBkcmF3SW1hZ2UgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS5cclxuICAgICAgICAgICAgY29uc3QgeCA9IE1hdGguZmxvb3IoIHBhcnRpY2xlc0RhdGEueENvb3JkaW5hdGVzWyBpIF0gLSBwYXJ0aWNsZXNEYXRhLmNhbnZhcy53aWR0aCAvIDIgKTtcclxuICAgICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoIHBhcnRpY2xlc0RhdGEueUNvb3JkaW5hdGVzWyBpIF0gLSBwYXJ0aWNsZXNEYXRhLmNhbnZhcy5oZWlnaHQgLyAyICk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCBwYXJ0aWNsZXNEYXRhLmNhbnZhcywgeCwgeSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbXB1dGUgdGhlIG51bWJlciBvZiBwYXJ0aWNsZXMgdGhhdCBjb3JyZXNwb25kcyB0byBzb21lIGNvbmNlbnRyYXRpb24uXHJcbiAqIFRoaXMgYWxnb3JpdGhtIHdhcyBwb3J0ZWQgZnJvbSB0aGUgSmF2YSBpbXBsZW1lbnRhdGlvbiwgYW5kIGlzIGRvY3VtZW50ZWQgaW5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FjaWQtYmFzZS1zb2x1dGlvbnMvYmxvYi9tYXN0ZXIvZG9jL0hBX0EtX3JhdGlvX21vZGVsLnBkZlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0UGFydGljbGVDb3VudCggY29uY2VudHJhdGlvbjogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgY29uc3QgcmFpc2VGYWN0b3IgPSBVdGlscy5sb2cxMCggY29uY2VudHJhdGlvbiAvIEJBU0VfQ09OQ0VOVFJBVElPTiApO1xyXG4gIGNvbnN0IGJhc2VGYWN0b3IgPSBNYXRoLnBvdyggKCBNQVhfUEFSVElDTEVTIC8gQkFTRV9ET1RTICksICggMSAvIFV0aWxzLmxvZzEwKCAxIC8gQkFTRV9DT05DRU5UUkFUSU9OICkgKSApO1xyXG4gIHJldHVybiBVdGlscy5yb3VuZFN5bW1ldHJpYyggQkFTRV9ET1RTICogTWF0aC5wb3coIGJhc2VGYWN0b3IsIHJhaXNlRmFjdG9yICkgKTtcclxufVxyXG5cclxuYWNpZEJhc2VTb2x1dGlvbnMucmVnaXN0ZXIoICdQYXJ0aWNsZXNOb2RlJywgUGFydGljbGVzTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNB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