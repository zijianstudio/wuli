// Copyright 2013-2023, University of Colorado Boulder

/**
 * ShakerParticles manages the lifetime of solute particles, from creation when they exit the shaker,
 * to deletion when they are delivered to the solution.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import beersLawLab from '../../beersLawLab.js';
import BLLConstants from '../../common/BLLConstants.js';
import SoluteParticles from './SoluteParticles.js';
// Units for speed and acceleration are not meaningful here, adjust these so that it looks good.
const INITIAL_SPEED = 100;
const GRAVITATIONAL_ACCELERATION_MAGNITUDE = 150;

// These offsets determine where a salt particle originates, relative to the shaker's position.
const MAX_X_OFFSET = 20;
const MAX_Y_OFFSET = 5;
export default class ShakerParticles extends SoluteParticles {
  // emits on step if one or more particles has moved

  constructor(solution, beaker, shaker, providedOptions) {
    const options = optionize()({
      // SoluteParticlesOptions
      particleGroupDocumentation: 'Dynamically creates solute particles for the shaker'
    }, providedOptions);
    super(solution.soluteProperty, options);
    this.solution = solution;
    this.beaker = beaker;
    this.shaker = shaker;
    this.particlesMovedEmitter = new Emitter();

    // when the solute changes, remove all particles
    solution.soluteProperty.link(() => {
      // Remove all particles, unless solute was being restored by PhET-iO. Particles will be restored by particleGroup.
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.removeAllParticles();
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.removeAllParticles();
  }

  // Particle animation and delivery to the solution, called when the simulation clock ticks.
  step(dt) {
    const particles = this.getParticlesReference();
    const beaker = this.beaker;
    const shaker = this.shaker;
    const solution = this.solution;
    let someParticleMoved = false;

    // propagate existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      this.stepParticle(dt, particle);

      // If the particle hits the solution surface or bottom of the beaker, delete it, and add a corresponding amount of solute to the solution.
      const percentFull = solution.volumeProperty.value / beaker.volume;
      const solutionSurfaceY = beaker.position.y - percentFull * beaker.size.height - solution.soluteProperty.value.particleSize;
      if (particle.positionProperty.value.y > solutionSurfaceY) {
        this.disposeParticle(particle);
        solution.soluteMolesProperty.value = Math.min(BLLConstants.SOLUTE_AMOUNT_RANGE.max, solution.soluteMolesProperty.value + 1 / solution.soluteProperty.value.particlesPerMole);
      } else {
        someParticleMoved = true;
      }
    }

    // create new particles
    if (shaker.dispensingRateProperty.value > 0) {
      const numberOfParticles = Utils.roundSymmetric(Math.max(1, shaker.dispensingRateProperty.value * solution.soluteProperty.value.particlesPerMole * dt));
      for (let j = 0; j < numberOfParticles; j++) {
        this.createParticle(solution.soluteProperty.value, getRandomPosition(this.shaker.positionProperty.value), ShakerParticles.getRandomOrientation(), this.getInitialVelocity(), this.getGravitationalAcceleration());
      }
    }
    if (someParticleMoved) {
      this.particlesMovedEmitter.emit();
    }
  }

  /**
   * Propagates a particle to a new position.
   */
  stepParticle(deltaSeconds, particle) {
    // mutable calls added to remove the number of new objects we create
    particle.velocity = particle.acceleration.times(deltaSeconds).add(particle.velocity);
    const newPosition = particle.velocity.times(deltaSeconds).add(particle.positionProperty.value);

    /*
     * Did the particle hit the left wall of the beaker? If so, change direction.
     * Note that this is a very simplified model, and only deals with the left wall of the beaker,
     * which is the only wall that the particles can hit in practice.
     */
    const minX = this.beaker.left + particle.solute.particleSize;
    if (newPosition.x <= minX) {
      newPosition.setX(minX);
      particle.velocity.setX(Math.abs(particle.velocity.x));
    }
    particle.positionProperty.value = newPosition;
  }

  // Computes an initial velocity for the particle.
  getInitialVelocity() {
    return Vector2.createPolar(INITIAL_SPEED, this.shaker.orientation); // in the direction the shaker is pointing
  }

  // Gravitational acceleration is in the downward direction.
  getGravitationalAcceleration() {
    return new Vector2(0, GRAVITATIONAL_ACCELERATION_MAGNITUDE);
  }
}

// Gets a random position relative to some origin
function getRandomPosition(origin) {
  const xOffset = dotRandom.nextIntBetween(-MAX_X_OFFSET, MAX_X_OFFSET); // positive or negative
  const yOffset = dotRandom.nextIntBetween(0, MAX_Y_OFFSET); // positive only
  return new Vector2(origin.x + xOffset, origin.y + yOffset);
}
beersLawLab.register('ShakerParticles', ShakerParticles);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiZG90UmFuZG9tIiwiVXRpbHMiLCJWZWN0b3IyIiwib3B0aW9uaXplIiwiYmVlcnNMYXdMYWIiLCJCTExDb25zdGFudHMiLCJTb2x1dGVQYXJ0aWNsZXMiLCJJTklUSUFMX1NQRUVEIiwiR1JBVklUQVRJT05BTF9BQ0NFTEVSQVRJT05fTUFHTklUVURFIiwiTUFYX1hfT0ZGU0VUIiwiTUFYX1lfT0ZGU0VUIiwiU2hha2VyUGFydGljbGVzIiwiY29uc3RydWN0b3IiLCJzb2x1dGlvbiIsImJlYWtlciIsInNoYWtlciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwYXJ0aWNsZUdyb3VwRG9jdW1lbnRhdGlvbiIsInNvbHV0ZVByb3BlcnR5IiwicGFydGljbGVzTW92ZWRFbWl0dGVyIiwibGluayIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJ2YWx1ZSIsInJlbW92ZUFsbFBhcnRpY2xlcyIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZXNldCIsInN0ZXAiLCJkdCIsInBhcnRpY2xlcyIsImdldFBhcnRpY2xlc1JlZmVyZW5jZSIsInNvbWVQYXJ0aWNsZU1vdmVkIiwiaSIsImxlbmd0aCIsInBhcnRpY2xlIiwic3RlcFBhcnRpY2xlIiwicGVyY2VudEZ1bGwiLCJ2b2x1bWVQcm9wZXJ0eSIsInZvbHVtZSIsInNvbHV0aW9uU3VyZmFjZVkiLCJwb3NpdGlvbiIsInkiLCJzaXplIiwiaGVpZ2h0IiwicGFydGljbGVTaXplIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRpc3Bvc2VQYXJ0aWNsZSIsInNvbHV0ZU1vbGVzUHJvcGVydHkiLCJNYXRoIiwibWluIiwiU09MVVRFX0FNT1VOVF9SQU5HRSIsIm1heCIsInBhcnRpY2xlc1Blck1vbGUiLCJkaXNwZW5zaW5nUmF0ZVByb3BlcnR5IiwibnVtYmVyT2ZQYXJ0aWNsZXMiLCJyb3VuZFN5bW1ldHJpYyIsImoiLCJjcmVhdGVQYXJ0aWNsZSIsImdldFJhbmRvbVBvc2l0aW9uIiwiZ2V0UmFuZG9tT3JpZW50YXRpb24iLCJnZXRJbml0aWFsVmVsb2NpdHkiLCJnZXRHcmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uIiwiZW1pdCIsImRlbHRhU2Vjb25kcyIsInZlbG9jaXR5IiwiYWNjZWxlcmF0aW9uIiwidGltZXMiLCJhZGQiLCJuZXdQb3NpdGlvbiIsIm1pblgiLCJsZWZ0Iiwic29sdXRlIiwieCIsInNldFgiLCJhYnMiLCJjcmVhdGVQb2xhciIsIm9yaWVudGF0aW9uIiwib3JpZ2luIiwieE9mZnNldCIsIm5leHRJbnRCZXR3ZWVuIiwieU9mZnNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2hha2VyUGFydGljbGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNoYWtlclBhcnRpY2xlcyBtYW5hZ2VzIHRoZSBsaWZldGltZSBvZiBzb2x1dGUgcGFydGljbGVzLCBmcm9tIGNyZWF0aW9uIHdoZW4gdGhleSBleGl0IHRoZSBzaGFrZXIsXHJcbiAqIHRvIGRlbGV0aW9uIHdoZW4gdGhleSBhcmUgZGVsaXZlcmVkIHRvIHRoZSBzb2x1dGlvbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5pbXBvcnQgQkxMQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CTExDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmVha2VyIGZyb20gJy4vQmVha2VyLmpzJztcclxuaW1wb3J0IENvbmNlbnRyYXRpb25Tb2x1dGlvbiBmcm9tICcuL0NvbmNlbnRyYXRpb25Tb2x1dGlvbi5qcyc7XHJcbmltcG9ydCBTb2x1dGVQYXJ0aWNsZXMsIHsgU29sdXRlUGFydGljbGVzT3B0aW9ucyB9IGZyb20gJy4vU29sdXRlUGFydGljbGVzLmpzJztcclxuaW1wb3J0IFNoYWtlciBmcm9tICcuL1NoYWtlci5qcyc7XHJcbmltcG9ydCBTb2x1dGVQYXJ0aWNsZSBmcm9tICcuL1NvbHV0ZVBhcnRpY2xlLmpzJztcclxuXHJcbi8vIFVuaXRzIGZvciBzcGVlZCBhbmQgYWNjZWxlcmF0aW9uIGFyZSBub3QgbWVhbmluZ2Z1bCBoZXJlLCBhZGp1c3QgdGhlc2Ugc28gdGhhdCBpdCBsb29rcyBnb29kLlxyXG5jb25zdCBJTklUSUFMX1NQRUVEID0gMTAwO1xyXG5jb25zdCBHUkFWSVRBVElPTkFMX0FDQ0VMRVJBVElPTl9NQUdOSVRVREUgPSAxNTA7XHJcblxyXG4vLyBUaGVzZSBvZmZzZXRzIGRldGVybWluZSB3aGVyZSBhIHNhbHQgcGFydGljbGUgb3JpZ2luYXRlcywgcmVsYXRpdmUgdG8gdGhlIHNoYWtlcidzIHBvc2l0aW9uLlxyXG5jb25zdCBNQVhfWF9PRkZTRVQgPSAyMDtcclxuY29uc3QgTUFYX1lfT0ZGU0VUID0gNTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTaGFrZXJQYXJ0aWNsZXNPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hha2VyUGFydGljbGVzIGV4dGVuZHMgU29sdXRlUGFydGljbGVzIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzb2x1dGlvbjogQ29uY2VudHJhdGlvblNvbHV0aW9uO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmVha2VyOiBCZWFrZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzaGFrZXI6IFNoYWtlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcGFydGljbGVzTW92ZWRFbWl0dGVyOiBFbWl0dGVyOyAvLyBlbWl0cyBvbiBzdGVwIGlmIG9uZSBvciBtb3JlIHBhcnRpY2xlcyBoYXMgbW92ZWRcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzb2x1dGlvbjogQ29uY2VudHJhdGlvblNvbHV0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYmVha2VyOiBCZWFrZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzaGFrZXI6IFNoYWtlcixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogU2hha2VyUGFydGljbGVzT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNoYWtlclBhcnRpY2xlc09wdGlvbnMsIFNlbGZPcHRpb25zLCBTb2x1dGVQYXJ0aWNsZXNPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTb2x1dGVQYXJ0aWNsZXNPcHRpb25zXHJcbiAgICAgIHBhcnRpY2xlR3JvdXBEb2N1bWVudGF0aW9uOiAnRHluYW1pY2FsbHkgY3JlYXRlcyBzb2x1dGUgcGFydGljbGVzIGZvciB0aGUgc2hha2VyJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHNvbHV0aW9uLnNvbHV0ZVByb3BlcnR5LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zb2x1dGlvbiA9IHNvbHV0aW9uO1xyXG4gICAgdGhpcy5iZWFrZXIgPSBiZWFrZXI7XHJcbiAgICB0aGlzLnNoYWtlciA9IHNoYWtlcjtcclxuICAgIHRoaXMucGFydGljbGVzTW92ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyB3aGVuIHRoZSBzb2x1dGUgY2hhbmdlcywgcmVtb3ZlIGFsbCBwYXJ0aWNsZXNcclxuICAgIHNvbHV0aW9uLnNvbHV0ZVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBhbGwgcGFydGljbGVzLCB1bmxlc3Mgc29sdXRlIHdhcyBiZWluZyByZXN0b3JlZCBieSBQaEVULWlPLiBQYXJ0aWNsZXMgd2lsbCBiZSByZXN0b3JlZCBieSBwYXJ0aWNsZUdyb3VwLlxyXG4gICAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsUGFydGljbGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlbW92ZUFsbFBhcnRpY2xlcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gUGFydGljbGUgYW5pbWF0aW9uIGFuZCBkZWxpdmVyeSB0byB0aGUgc29sdXRpb24sIGNhbGxlZCB3aGVuIHRoZSBzaW11bGF0aW9uIGNsb2NrIHRpY2tzLlxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IHBhcnRpY2xlcyA9IHRoaXMuZ2V0UGFydGljbGVzUmVmZXJlbmNlKCk7XHJcbiAgICBjb25zdCBiZWFrZXIgPSB0aGlzLmJlYWtlcjtcclxuICAgIGNvbnN0IHNoYWtlciA9IHRoaXMuc2hha2VyO1xyXG4gICAgY29uc3Qgc29sdXRpb24gPSB0aGlzLnNvbHV0aW9uO1xyXG4gICAgbGV0IHNvbWVQYXJ0aWNsZU1vdmVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcHJvcGFnYXRlIGV4aXN0aW5nIHBhcnRpY2xlc1xyXG4gICAgZm9yICggbGV0IGkgPSBwYXJ0aWNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcblxyXG4gICAgICBjb25zdCBwYXJ0aWNsZSA9IHBhcnRpY2xlc1sgaSBdO1xyXG4gICAgICB0aGlzLnN0ZXBQYXJ0aWNsZSggZHQsIHBhcnRpY2xlICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgcGFydGljbGUgaGl0cyB0aGUgc29sdXRpb24gc3VyZmFjZSBvciBib3R0b20gb2YgdGhlIGJlYWtlciwgZGVsZXRlIGl0LCBhbmQgYWRkIGEgY29ycmVzcG9uZGluZyBhbW91bnQgb2Ygc29sdXRlIHRvIHRoZSBzb2x1dGlvbi5cclxuICAgICAgY29uc3QgcGVyY2VudEZ1bGwgPSBzb2x1dGlvbi52b2x1bWVQcm9wZXJ0eS52YWx1ZSAvIGJlYWtlci52b2x1bWU7XHJcbiAgICAgIGNvbnN0IHNvbHV0aW9uU3VyZmFjZVkgPSBiZWFrZXIucG9zaXRpb24ueSAtICggcGVyY2VudEZ1bGwgKiBiZWFrZXIuc2l6ZS5oZWlnaHQgKSAtIHNvbHV0aW9uLnNvbHV0ZVByb3BlcnR5LnZhbHVlLnBhcnRpY2xlU2l6ZTtcclxuICAgICAgaWYgKCBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPiBzb2x1dGlvblN1cmZhY2VZICkge1xyXG4gICAgICAgIHRoaXMuZGlzcG9zZVBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gICAgICAgIHNvbHV0aW9uLnNvbHV0ZU1vbGVzUHJvcGVydHkudmFsdWUgPSBNYXRoLm1pbihcclxuICAgICAgICAgIEJMTENvbnN0YW50cy5TT0xVVEVfQU1PVU5UX1JBTkdFLm1heCxcclxuICAgICAgICAgIHNvbHV0aW9uLnNvbHV0ZU1vbGVzUHJvcGVydHkudmFsdWUgKyAoIDEgLyBzb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eS52YWx1ZS5wYXJ0aWNsZXNQZXJNb2xlIClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHNvbWVQYXJ0aWNsZU1vdmVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSBuZXcgcGFydGljbGVzXHJcbiAgICBpZiAoIHNoYWtlci5kaXNwZW5zaW5nUmF0ZVByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuXHJcbiAgICAgIGNvbnN0IG51bWJlck9mUGFydGljbGVzID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIE1hdGgubWF4KCAxLFxyXG4gICAgICAgIHNoYWtlci5kaXNwZW5zaW5nUmF0ZVByb3BlcnR5LnZhbHVlICogc29sdXRpb24uc29sdXRlUHJvcGVydHkudmFsdWUucGFydGljbGVzUGVyTW9sZSAqIGR0ICkgKTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IG51bWJlck9mUGFydGljbGVzOyBqKysgKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQYXJ0aWNsZSggc29sdXRpb24uc29sdXRlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICBnZXRSYW5kb21Qb3NpdGlvbiggdGhpcy5zaGFrZXIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICAgICAgU2hha2VyUGFydGljbGVzLmdldFJhbmRvbU9yaWVudGF0aW9uKCksXHJcbiAgICAgICAgICB0aGlzLmdldEluaXRpYWxWZWxvY2l0eSgpLFxyXG4gICAgICAgICAgdGhpcy5nZXRHcmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uKClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBzb21lUGFydGljbGVNb3ZlZCApIHtcclxuICAgICAgdGhpcy5wYXJ0aWNsZXNNb3ZlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvcGFnYXRlcyBhIHBhcnRpY2xlIHRvIGEgbmV3IHBvc2l0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RlcFBhcnRpY2xlKCBkZWx0YVNlY29uZHM6IG51bWJlciwgcGFydGljbGU6IFNvbHV0ZVBhcnRpY2xlICk6IHZvaWQge1xyXG5cclxuICAgIC8vIG11dGFibGUgY2FsbHMgYWRkZWQgdG8gcmVtb3ZlIHRoZSBudW1iZXIgb2YgbmV3IG9iamVjdHMgd2UgY3JlYXRlXHJcbiAgICBwYXJ0aWNsZS52ZWxvY2l0eSA9IHBhcnRpY2xlLmFjY2VsZXJhdGlvbi50aW1lcyggZGVsdGFTZWNvbmRzICkuYWRkKCBwYXJ0aWNsZS52ZWxvY2l0eSApO1xyXG4gICAgY29uc3QgbmV3UG9zaXRpb24gPSBwYXJ0aWNsZS52ZWxvY2l0eS50aW1lcyggZGVsdGFTZWNvbmRzICkuYWRkKCBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIERpZCB0aGUgcGFydGljbGUgaGl0IHRoZSBsZWZ0IHdhbGwgb2YgdGhlIGJlYWtlcj8gSWYgc28sIGNoYW5nZSBkaXJlY3Rpb24uXHJcbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBpcyBhIHZlcnkgc2ltcGxpZmllZCBtb2RlbCwgYW5kIG9ubHkgZGVhbHMgd2l0aCB0aGUgbGVmdCB3YWxsIG9mIHRoZSBiZWFrZXIsXHJcbiAgICAgKiB3aGljaCBpcyB0aGUgb25seSB3YWxsIHRoYXQgdGhlIHBhcnRpY2xlcyBjYW4gaGl0IGluIHByYWN0aWNlLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBtaW5YID0gdGhpcy5iZWFrZXIubGVmdCArIHBhcnRpY2xlLnNvbHV0ZS5wYXJ0aWNsZVNpemU7XHJcbiAgICBpZiAoIG5ld1Bvc2l0aW9uLnggPD0gbWluWCApIHtcclxuICAgICAgbmV3UG9zaXRpb24uc2V0WCggbWluWCApO1xyXG4gICAgICBwYXJ0aWNsZS52ZWxvY2l0eS5zZXRYKCBNYXRoLmFicyggcGFydGljbGUudmVsb2NpdHkueCApICk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ld1Bvc2l0aW9uO1xyXG4gIH1cclxuXHJcbiAgLy8gQ29tcHV0ZXMgYW4gaW5pdGlhbCB2ZWxvY2l0eSBmb3IgdGhlIHBhcnRpY2xlLlxyXG4gIHByaXZhdGUgZ2V0SW5pdGlhbFZlbG9jaXR5KCk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIFZlY3RvcjIuY3JlYXRlUG9sYXIoIElOSVRJQUxfU1BFRUQsIHRoaXMuc2hha2VyLm9yaWVudGF0aW9uICk7IC8vIGluIHRoZSBkaXJlY3Rpb24gdGhlIHNoYWtlciBpcyBwb2ludGluZ1xyXG4gIH1cclxuXHJcbiAgLy8gR3Jhdml0YXRpb25hbCBhY2NlbGVyYXRpb24gaXMgaW4gdGhlIGRvd253YXJkIGRpcmVjdGlvbi5cclxuICBwcml2YXRlIGdldEdyYXZpdGF0aW9uYWxBY2NlbGVyYXRpb24oKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIDAsIEdSQVZJVEFUSU9OQUxfQUNDRUxFUkFUSU9OX01BR05JVFVERSApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gR2V0cyBhIHJhbmRvbSBwb3NpdGlvbiByZWxhdGl2ZSB0byBzb21lIG9yaWdpblxyXG5mdW5jdGlvbiBnZXRSYW5kb21Qb3NpdGlvbiggb3JpZ2luOiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gIGNvbnN0IHhPZmZzZXQgPSBkb3RSYW5kb20ubmV4dEludEJldHdlZW4oIC1NQVhfWF9PRkZTRVQsIE1BWF9YX09GRlNFVCApOyAvLyBwb3NpdGl2ZSBvciBuZWdhdGl2ZVxyXG4gIGNvbnN0IHlPZmZzZXQgPSBkb3RSYW5kb20ubmV4dEludEJldHdlZW4oIDAsIE1BWF9ZX09GRlNFVCApOyAvLyBwb3NpdGl2ZSBvbmx5XHJcbiAgcmV0dXJuIG5ldyBWZWN0b3IyKCBvcmlnaW4ueCArIHhPZmZzZXQsIG9yaWdpbi55ICsgeU9mZnNldCApO1xyXG59XHJcblxyXG5iZWVyc0xhd0xhYi5yZWdpc3RlciggJ1NoYWtlclBhcnRpY2xlcycsIFNoYWtlclBhcnRpY2xlcyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFHbkYsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBR3ZELE9BQU9DLGVBQWUsTUFBa0Msc0JBQXNCO0FBSTlFO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLEdBQUc7QUFDekIsTUFBTUMsb0NBQW9DLEdBQUcsR0FBRzs7QUFFaEQ7QUFDQSxNQUFNQyxZQUFZLEdBQUcsRUFBRTtBQUN2QixNQUFNQyxZQUFZLEdBQUcsQ0FBQztBQU10QixlQUFlLE1BQU1DLGVBQWUsU0FBU0wsZUFBZSxDQUFDO0VBS1g7O0VBRXpDTSxXQUFXQSxDQUFFQyxRQUErQixFQUMvQkMsTUFBYyxFQUNkQyxNQUFjLEVBQ2RDLGVBQXVDLEVBQUc7SUFFNUQsTUFBTUMsT0FBTyxHQUFHZCxTQUFTLENBQThELENBQUMsQ0FBRTtNQUV4RjtNQUNBZSwwQkFBMEIsRUFBRTtJQUM5QixD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