// Copyright 2019-2022, University of Colorado Boulder

/**
 * ParticleUtils is a set of utility methods related to collections of Particles.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import gasProperties from '../../gasProperties.js';
import GasPropertiesQueryParameters from '../GasPropertiesQueryParameters.js';
const ParticleUtils = {
  /**
   * Steps a collection of particles.
   * @param particles
   * @param dt - time step in ps
   */
  stepParticles(particles, dt) {
    assert && assert(dt > 0, `invalid dt: ${dt}`);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].step(dt);
    }
  },
  /**
   * Removes a particle from an array and disposes it.
   */
  removeParticle: function (particle, particles) {
    const index = particles.indexOf(particle);
    assert && assert(index !== -1, 'particle not found');
    particles.splice(index, 1);
    particle.dispose();
  },
  /**
   * Removes the last n particles from an array and disposes them.
   */
  removeLastParticles: function (n, particles) {
    assert && assert(n <= particles.length, `attempted to remove ${n} particles, but we only have ${particles.length} particles`);
    for (let i = 0; i < n; i++) {
      ParticleUtils.removeParticle(particles[particles.length - 1], particles);
    }
  },
  /**
   * Removes and disposes an entire collection of particles.
   */
  removeAllParticles: function (particles) {
    ParticleUtils.removeLastParticles(particles.length, particles);
  },
  /**
   * Removes particles that are out of bounds and disposes them.
   */
  removeParticlesOutOfBounds: function (particles, bounds) {
    // Iterate backwards, since we're modifying the array, so we don't skip any particles.
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].intersectsBounds(bounds)) {
        ParticleUtils.removeParticle(particles[i], particles);
      }
    }
  },
  /**
   * Redistributes particles in the horizontal dimension.
   * @param particles
   * @param scaleX - amount to scale the position's x component
   */
  redistributeParticles: function (particles, scaleX) {
    assert && assert(scaleX > 0, `invalid scaleX: ${scaleX}`);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].position.setX(scaleX * particles[i].position.x);
    }
  },
  /**
   * Heats or cools a collection of particles.
   * @param particles
   * @param heatCoolFactor - (-1,1), heat=[0,1), cool=(-1,0]
   */
  heatCoolParticles: function (particles, heatCoolFactor) {
    assert && assert(heatCoolFactor >= -1 && heatCoolFactor <= 1, `invalid heatCoolFactor: ${heatCoolFactor}`);
    const velocityScale = 1 + heatCoolFactor / GasPropertiesQueryParameters.heatCool;
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].scaleVelocity(velocityScale);
    }
  },
  /**
   * Identifies particles that have escaped via the opening in the top of the container, and
   * moves them from insideParticles to outsideParticles.
   * @param container
   * @param numberOfParticlesProperty - number of particles inside the container
   * @param insideParticles - particles inside the container
   * @param outsideParticles - particles outside the container
   */
  escapeParticles: function (container, numberOfParticlesProperty, insideParticles, outsideParticles) {
    // Iterate backwards, since we're modifying the array, so we don't skip any particles.
    for (let i = insideParticles.length - 1; i >= 0; i--) {
      const particle = insideParticles[i];
      if (particle.top > container.top && particle.left > container.getOpeningLeft() && particle.right < container.getOpeningRight()) {
        insideParticles.splice(insideParticles.indexOf(particle), 1);
        numberOfParticlesProperty.value--;
        outsideParticles.push(particle);
      }
    }
  },
  /**
   * Gets the total kinetic energy of a collection of particles, in AMU * pm^2 / ps^2
   */
  getTotalKineticEnergy: function (particles) {
    let totalKineticEnergy = 0;
    for (let i = particles.length - 1; i >= 0; i--) {
      totalKineticEnergy += particles[i].getKineticEnergy();
    }
    return totalKineticEnergy;
  },
  /**
   * Gets the centerX of mass for a collection of particles.
   * null if there are no particles and therefore no center of mass
   */
  getCenterXOfMass: function (particles) {
    let centerXOfMass = null;
    if (particles.length > 0) {
      let numerator = 0;
      let totalMass = 0;
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        numerator += particle.mass * particle.position.x;
        totalMass += particle.mass;
      }
      centerXOfMass = numerator / totalMass;
    }
    return centerXOfMass;
  }
};
gasProperties.register('ParticleUtils', ParticleUtils);
export default ParticleUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1F1ZXJ5UGFyYW1ldGVycyIsIlBhcnRpY2xlVXRpbHMiLCJzdGVwUGFydGljbGVzIiwicGFydGljbGVzIiwiZHQiLCJhc3NlcnQiLCJpIiwibGVuZ3RoIiwic3RlcCIsInJlbW92ZVBhcnRpY2xlIiwicGFydGljbGUiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJkaXNwb3NlIiwicmVtb3ZlTGFzdFBhcnRpY2xlcyIsIm4iLCJyZW1vdmVBbGxQYXJ0aWNsZXMiLCJyZW1vdmVQYXJ0aWNsZXNPdXRPZkJvdW5kcyIsImJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJyZWRpc3RyaWJ1dGVQYXJ0aWNsZXMiLCJzY2FsZVgiLCJwb3NpdGlvbiIsInNldFgiLCJ4IiwiaGVhdENvb2xQYXJ0aWNsZXMiLCJoZWF0Q29vbEZhY3RvciIsInZlbG9jaXR5U2NhbGUiLCJoZWF0Q29vbCIsInNjYWxlVmVsb2NpdHkiLCJlc2NhcGVQYXJ0aWNsZXMiLCJjb250YWluZXIiLCJudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5IiwiaW5zaWRlUGFydGljbGVzIiwib3V0c2lkZVBhcnRpY2xlcyIsInRvcCIsImxlZnQiLCJnZXRPcGVuaW5nTGVmdCIsInJpZ2h0IiwiZ2V0T3BlbmluZ1JpZ2h0IiwidmFsdWUiLCJwdXNoIiwiZ2V0VG90YWxLaW5ldGljRW5lcmd5IiwidG90YWxLaW5ldGljRW5lcmd5IiwiZ2V0S2luZXRpY0VuZXJneSIsImdldENlbnRlclhPZk1hc3MiLCJjZW50ZXJYT2ZNYXNzIiwibnVtZXJhdG9yIiwidG90YWxNYXNzIiwibWFzcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQYXJ0aWNsZVV0aWxzIGlzIGEgc2V0IG9mIHV0aWxpdHkgbWV0aG9kcyByZWxhdGVkIHRvIGNvbGxlY3Rpb25zIG9mIFBhcnRpY2xlcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0dhc1Byb3BlcnRpZXNRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgSWRlYWxHYXNMYXdDb250YWluZXIgZnJvbSAnLi9JZGVhbEdhc0xhd0NvbnRhaW5lci5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tICcuL1BhcnRpY2xlLmpzJztcclxuXHJcbmNvbnN0IFBhcnRpY2xlVXRpbHMgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGEgY29sbGVjdGlvbiBvZiBwYXJ0aWNsZXMuXHJcbiAgICogQHBhcmFtIHBhcnRpY2xlc1xyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCBpbiBwc1xyXG4gICAqL1xyXG4gIHN0ZXBQYXJ0aWNsZXMoIHBhcnRpY2xlczogUGFydGljbGVbXSwgZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGR0ID4gMCwgYGludmFsaWQgZHQ6ICR7ZHR9YCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gcGFydGljbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBwYXJ0aWNsZXNbIGkgXS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBwYXJ0aWNsZSBmcm9tIGFuIGFycmF5IGFuZCBkaXNwb3NlcyBpdC5cclxuICAgKi9cclxuICByZW1vdmVQYXJ0aWNsZTogZnVuY3Rpb24oIHBhcnRpY2xlOiBQYXJ0aWNsZSwgcGFydGljbGVzOiBQYXJ0aWNsZVtdICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IGluZGV4ID0gcGFydGljbGVzLmluZGV4T2YoIHBhcnRpY2xlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCAhPT0gLTEsICdwYXJ0aWNsZSBub3QgZm91bmQnICk7XHJcblxyXG4gICAgcGFydGljbGVzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgIHBhcnRpY2xlLmRpc3Bvc2UoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBsYXN0IG4gcGFydGljbGVzIGZyb20gYW4gYXJyYXkgYW5kIGRpc3Bvc2VzIHRoZW0uXHJcbiAgICovXHJcbiAgcmVtb3ZlTGFzdFBhcnRpY2xlczogZnVuY3Rpb24oIG46IG51bWJlciwgcGFydGljbGVzOiBQYXJ0aWNsZVtdICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbiA8PSBwYXJ0aWNsZXMubGVuZ3RoLFxyXG4gICAgICBgYXR0ZW1wdGVkIHRvIHJlbW92ZSAke259IHBhcnRpY2xlcywgYnV0IHdlIG9ubHkgaGF2ZSAke3BhcnRpY2xlcy5sZW5ndGh9IHBhcnRpY2xlc2AgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XHJcbiAgICAgIFBhcnRpY2xlVXRpbHMucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlc1sgcGFydGljbGVzLmxlbmd0aCAtIDEgXSwgcGFydGljbGVzICk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbmQgZGlzcG9zZXMgYW4gZW50aXJlIGNvbGxlY3Rpb24gb2YgcGFydGljbGVzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUFsbFBhcnRpY2xlczogZnVuY3Rpb24oIHBhcnRpY2xlczogUGFydGljbGVbXSApOiB2b2lkIHtcclxuICAgIFBhcnRpY2xlVXRpbHMucmVtb3ZlTGFzdFBhcnRpY2xlcyggcGFydGljbGVzLmxlbmd0aCwgcGFydGljbGVzICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBwYXJ0aWNsZXMgdGhhdCBhcmUgb3V0IG9mIGJvdW5kcyBhbmQgZGlzcG9zZXMgdGhlbS5cclxuICAgKi9cclxuICByZW1vdmVQYXJ0aWNsZXNPdXRPZkJvdW5kczogZnVuY3Rpb24oIHBhcnRpY2xlczogUGFydGljbGVbXSwgYm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIEl0ZXJhdGUgYmFja3dhcmRzLCBzaW5jZSB3ZSdyZSBtb2RpZnlpbmcgdGhlIGFycmF5LCBzbyB3ZSBkb24ndCBza2lwIGFueSBwYXJ0aWNsZXMuXHJcbiAgICBmb3IgKCBsZXQgaSA9IHBhcnRpY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgaWYgKCAhcGFydGljbGVzWyBpIF0uaW50ZXJzZWN0c0JvdW5kcyggYm91bmRzICkgKSB7XHJcbiAgICAgICAgUGFydGljbGVVdGlscy5yZW1vdmVQYXJ0aWNsZSggcGFydGljbGVzWyBpIF0sIHBhcnRpY2xlcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVkaXN0cmlidXRlcyBwYXJ0aWNsZXMgaW4gdGhlIGhvcml6b250YWwgZGltZW5zaW9uLlxyXG4gICAqIEBwYXJhbSBwYXJ0aWNsZXNcclxuICAgKiBAcGFyYW0gc2NhbGVYIC0gYW1vdW50IHRvIHNjYWxlIHRoZSBwb3NpdGlvbidzIHggY29tcG9uZW50XHJcbiAgICovXHJcbiAgcmVkaXN0cmlidXRlUGFydGljbGVzOiBmdW5jdGlvbiggcGFydGljbGVzOiBQYXJ0aWNsZVtdLCBzY2FsZVg6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjYWxlWCA+IDAsIGBpbnZhbGlkIHNjYWxlWDogJHtzY2FsZVh9YCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gcGFydGljbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBwYXJ0aWNsZXNbIGkgXS5wb3NpdGlvbi5zZXRYKCBzY2FsZVggKiBwYXJ0aWNsZXNbIGkgXS5wb3NpdGlvbi54ICk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSGVhdHMgb3IgY29vbHMgYSBjb2xsZWN0aW9uIG9mIHBhcnRpY2xlcy5cclxuICAgKiBAcGFyYW0gcGFydGljbGVzXHJcbiAgICogQHBhcmFtIGhlYXRDb29sRmFjdG9yIC0gKC0xLDEpLCBoZWF0PVswLDEpLCBjb29sPSgtMSwwXVxyXG4gICAqL1xyXG4gIGhlYXRDb29sUGFydGljbGVzOiBmdW5jdGlvbiggcGFydGljbGVzOiBQYXJ0aWNsZVtdLCBoZWF0Q29vbEZhY3RvcjogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGVhdENvb2xGYWN0b3IgPj0gLTEgJiYgaGVhdENvb2xGYWN0b3IgPD0gMSwgYGludmFsaWQgaGVhdENvb2xGYWN0b3I6ICR7aGVhdENvb2xGYWN0b3J9YCApO1xyXG5cclxuICAgIGNvbnN0IHZlbG9jaXR5U2NhbGUgPSAxICsgaGVhdENvb2xGYWN0b3IgLyBHYXNQcm9wZXJ0aWVzUXVlcnlQYXJhbWV0ZXJzLmhlYXRDb29sO1xyXG4gICAgZm9yICggbGV0IGkgPSBwYXJ0aWNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIHBhcnRpY2xlc1sgaSBdLnNjYWxlVmVsb2NpdHkoIHZlbG9jaXR5U2NhbGUgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJZGVudGlmaWVzIHBhcnRpY2xlcyB0aGF0IGhhdmUgZXNjYXBlZCB2aWEgdGhlIG9wZW5pbmcgaW4gdGhlIHRvcCBvZiB0aGUgY29udGFpbmVyLCBhbmRcclxuICAgKiBtb3ZlcyB0aGVtIGZyb20gaW5zaWRlUGFydGljbGVzIHRvIG91dHNpZGVQYXJ0aWNsZXMuXHJcbiAgICogQHBhcmFtIGNvbnRhaW5lclxyXG4gICAqIEBwYXJhbSBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5IC0gbnVtYmVyIG9mIHBhcnRpY2xlcyBpbnNpZGUgdGhlIGNvbnRhaW5lclxyXG4gICAqIEBwYXJhbSBpbnNpZGVQYXJ0aWNsZXMgLSBwYXJ0aWNsZXMgaW5zaWRlIHRoZSBjb250YWluZXJcclxuICAgKiBAcGFyYW0gb3V0c2lkZVBhcnRpY2xlcyAtIHBhcnRpY2xlcyBvdXRzaWRlIHRoZSBjb250YWluZXJcclxuICAgKi9cclxuICBlc2NhcGVQYXJ0aWNsZXM6IGZ1bmN0aW9uKCBjb250YWluZXI6IElkZWFsR2FzTGF3Q29udGFpbmVyLCBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2lkZVBhcnRpY2xlczogUGFydGljbGVbXSwgb3V0c2lkZVBhcnRpY2xlczogUGFydGljbGVbXSApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBJdGVyYXRlIGJhY2t3YXJkcywgc2luY2Ugd2UncmUgbW9kaWZ5aW5nIHRoZSBhcnJheSwgc28gd2UgZG9uJ3Qgc2tpcCBhbnkgcGFydGljbGVzLlxyXG4gICAgZm9yICggbGV0IGkgPSBpbnNpZGVQYXJ0aWNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlID0gaW5zaWRlUGFydGljbGVzWyBpIF07XHJcbiAgICAgIGlmICggcGFydGljbGUudG9wID4gY29udGFpbmVyLnRvcCAmJlxyXG4gICAgICAgICAgIHBhcnRpY2xlLmxlZnQgPiBjb250YWluZXIuZ2V0T3BlbmluZ0xlZnQoKSAmJlxyXG4gICAgICAgICAgIHBhcnRpY2xlLnJpZ2h0IDwgY29udGFpbmVyLmdldE9wZW5pbmdSaWdodCgpICkge1xyXG4gICAgICAgIGluc2lkZVBhcnRpY2xlcy5zcGxpY2UoIGluc2lkZVBhcnRpY2xlcy5pbmRleE9mKCBwYXJ0aWNsZSApLCAxICk7XHJcbiAgICAgICAgbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eS52YWx1ZS0tO1xyXG4gICAgICAgIG91dHNpZGVQYXJ0aWNsZXMucHVzaCggcGFydGljbGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRvdGFsIGtpbmV0aWMgZW5lcmd5IG9mIGEgY29sbGVjdGlvbiBvZiBwYXJ0aWNsZXMsIGluIEFNVSAqIHBtXjIgLyBwc14yXHJcbiAgICovXHJcbiAgZ2V0VG90YWxLaW5ldGljRW5lcmd5OiBmdW5jdGlvbiggcGFydGljbGVzOiBQYXJ0aWNsZVtdICk6IG51bWJlciB7XHJcblxyXG4gICAgbGV0IHRvdGFsS2luZXRpY0VuZXJneSA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IHBhcnRpY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgdG90YWxLaW5ldGljRW5lcmd5ICs9IHBhcnRpY2xlc1sgaSBdLmdldEtpbmV0aWNFbmVyZ3koKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0b3RhbEtpbmV0aWNFbmVyZ3k7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY2VudGVyWCBvZiBtYXNzIGZvciBhIGNvbGxlY3Rpb24gb2YgcGFydGljbGVzLlxyXG4gICAqIG51bGwgaWYgdGhlcmUgYXJlIG5vIHBhcnRpY2xlcyBhbmQgdGhlcmVmb3JlIG5vIGNlbnRlciBvZiBtYXNzXHJcbiAgICovXHJcbiAgZ2V0Q2VudGVyWE9mTWFzczogZnVuY3Rpb24oIHBhcnRpY2xlczogUGFydGljbGVbXSApOiBudW1iZXIgfCBudWxsIHtcclxuXHJcbiAgICBsZXQgY2VudGVyWE9mTWFzcyA9IG51bGw7XHJcbiAgICBpZiAoIHBhcnRpY2xlcy5sZW5ndGggPiAwICkge1xyXG4gICAgICBsZXQgbnVtZXJhdG9yID0gMDtcclxuICAgICAgbGV0IHRvdGFsTWFzcyA9IDA7XHJcbiAgICAgIGZvciAoIGxldCBpID0gcGFydGljbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlID0gcGFydGljbGVzWyBpIF07XHJcbiAgICAgICAgbnVtZXJhdG9yICs9ICggcGFydGljbGUubWFzcyAqIHBhcnRpY2xlLnBvc2l0aW9uLnggKTtcclxuICAgICAgICB0b3RhbE1hc3MgKz0gcGFydGljbGUubWFzcztcclxuICAgICAgfVxyXG4gICAgICBjZW50ZXJYT2ZNYXNzID0gbnVtZXJhdG9yIC8gdG90YWxNYXNzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNlbnRlclhPZk1hc3M7XHJcbiAgfVxyXG59O1xyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ1BhcnRpY2xlVXRpbHMnLCBQYXJ0aWNsZVV0aWxzICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBhcnRpY2xlVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBSTdFLE1BQU1DLGFBQWEsR0FBRztFQUVwQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGFBQWFBLENBQUVDLFNBQXFCLEVBQUVDLEVBQVUsRUFBUztJQUN2REMsTUFBTSxJQUFJQSxNQUFNLENBQUVELEVBQUUsR0FBRyxDQUFDLEVBQUcsZUFBY0EsRUFBRyxFQUFFLENBQUM7SUFFL0MsS0FBTSxJQUFJRSxDQUFDLEdBQUdILFNBQVMsQ0FBQ0ksTUFBTSxHQUFHLENBQUMsRUFBRUQsQ0FBQyxJQUFJLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUc7TUFDaERILFNBQVMsQ0FBRUcsQ0FBQyxDQUFFLENBQUNFLElBQUksQ0FBRUosRUFBRyxDQUFDO0lB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