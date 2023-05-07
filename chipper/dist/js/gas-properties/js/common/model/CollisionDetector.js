// Copyright 2019-2022, University of Colorado Boulder

/**
 * CollisionDetector handles collision detection and response for all screens. Our collision model involves
 * rigid bodies. It is a perfectly-elastic collision model, where there is no net loss of kinetic energy.
 *
 * The algorithms for particle-particle collisions and particle-container collisions were adapted from the Java
 * implementation of Gas Properties. They differ from the standard rigid-body collision model as described in (e.g.)
 * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 * For historical background on how the Java implementation informed this implementation, see:
 * https://github.com/phetsims/gas-properties/issues/37
 * https://github.com/phetsims/gas-properties/issues/40
 *
 * While code comments attempt to describe this implementation clearly, fully understanding the implementation may
 * require some general background in collisions detection and response. Some useful references include:
 * https://en.wikipedia.org/wiki/Collision_detection
 * https://en.wikipedia.org/wiki/Collision_response
 * https://en.wikipedia.org/wiki/Elastic_collision
 * https://en.wikipedia.org/wiki/Collision_response#Impulse-based_contact_model
 * https://en.wikipedia.org/wiki/Coefficient_of_restitution
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesUtils from '../GasPropertiesUtils.js';
import Region from './Region.js';

// Coefficient of restitution (e) is the ratio of the final to initial relative velocity between two objects
// after they collide. It normally ranges from 0 to 1, where 1 is a perfectly elastic collision.
// See https://en.wikipedia.org/wiki/Coefficient_of_restitution
const e = 1;
export default class CollisionDetector {
  // 2D grid of Regions

  // number of wall collisions on the most recent call to update

  // mutable vectors, reused in critical code

  /**
   * @param container - the container inside which collision occur
   * @param particleArrays - collections of particles inside the container
   * @param particleParticleCollisionsEnabledProperty - whether particle-particle collisions occur
   */
  constructor(container, particleArrays, particleParticleCollisionsEnabledProperty) {
    assert && assert(particleArrays.length > 0, `invalid particleArrays: ${particleArrays}`);
    this.container = container;
    this.particleArrays = particleArrays;
    this.particleParticleCollisionsEnabledProperty = particleParticleCollisionsEnabledProperty;

    // Regions are square So this is the length of one side, pm.
    const regionLength = container.height / 4;
    assert && assert(regionLength > 0, `invalid regionLength: ${regionLength}`);
    this.regions = createRegions(container, regionLength);
    this._numberOfParticleContainerCollisions = 0;
    this.mutableVectors = {
      normal: new Vector2(0, 0),
      tangent: new Vector2(0, 0),
      relativeVelocity: new Vector2(0, 0),
      pointOnLine: new Vector2(0, 0),
      reflectedPoint: new Vector2(0, 0)
    };
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  get numberOfParticleContainerCollisions() {
    return this._numberOfParticleContainerCollisions;
  }

  /**
   * Clears all regions.
   */
  clearRegions() {
    for (let i = this.regions.length - 1; i >= 0; i--) {
      this.regions[i].clear();
    }
  }

  /**
   * Performs collision detection and response for the current state of the particle system.
   */
  update() {
    this.clearRegions();

    // Use regions that intersect the container, since collisions only occur inside the container.
    const containerRegions = _.filter(this.regions, region => this.container.bounds.intersectsBounds(region.bounds));

    // put particles in regions
    assignParticlesToRegions(this.particleArrays, containerRegions);

    // particle-particle collisions, within each region
    if (this.particleParticleCollisionsEnabledProperty.value) {
      for (let i = containerRegions.length - 1; i >= 0; i--) {
        doParticleParticleCollisions(containerRegions[i].particles, this.mutableVectors);
      }
    }

    // particle-container collisions
    this._numberOfParticleContainerCollisions = this.updateParticleContainerCollisions();

    // Verify that all particles are fully inside the container.
    assert && assert(this.container.containsParticles(this.particleArrays), 'particles have leaked out of the container');
  }

  /**
   * Detects and handles particle-container collisions for the system.
   * This is overridden by subclass DiffusionCollisionDetector to implement collision detection with the divider
   * that appears in the container in the 'Diffusion' screen.
   * @returns the number of collisions
   */
  updateParticleContainerCollisions() {
    let numberOfParticleContainerCollisions = 0;
    for (let i = this.particleArrays.length - 1; i >= 0; i--) {
      numberOfParticleContainerCollisions += CollisionDetector.doParticleContainerCollisions(this.particleArrays[i], this.container.bounds, this.container.leftWallVelocity);
    }
    return numberOfParticleContainerCollisions;
  }

  /**
   * Detects and handles particle-container collisions. These collisions occur if a particle contacted a wall on
   * its way to its current position.
   * @param particles
   * @param containerBounds
   * @param leftWallVelocity - velocity of the container's left (movable) wall
   * @returns number of collisions
   */
  static doParticleContainerCollisions(particles, containerBounds, leftWallVelocity) {
    let numberOfCollisions = 0;
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      let collided = false;

      // adjust x
      if (particle.left <= containerBounds.minX) {
        particle.left = containerBounds.minX;

        // If the left wall is moving, it will do work.
        particle.setVelocityXY(-(particle.velocity.x - leftWallVelocity.x), particle.velocity.y);
        collided = true;
      } else if (particle.right >= containerBounds.maxX) {
        particle.right = containerBounds.maxX;
        particle.setVelocityXY(-particle.velocity.x, particle.velocity.y);
        collided = true;
      }

      // adjust y
      if (particle.top >= containerBounds.maxY) {
        particle.top = containerBounds.maxY;
        particle.setVelocityXY(particle.velocity.x, -particle.velocity.y);
        collided = true;
      } else if (particle.bottom <= containerBounds.minY) {
        particle.bottom = containerBounds.minY;
        particle.setVelocityXY(particle.velocity.x, -particle.velocity.y);
        collided = true;
      }
      if (collided) {
        numberOfCollisions++;
      }
    }
    return numberOfCollisions;
  }
}

/**
 * Partitions the collision detection bounds into Regions.  Since collisions only occur inside the container,
 * the maximum collision detection bounds is the container at its max width.  This algorithm builds the grid
 * right-to-left, bottom-to-top, so that the grid is aligned with the right and bottom edges of the container.
 * Regions along the top and left edges may be outside the container, and that's OK.  Regions outside the
 * container will be excluded from collision detection.
 * @param container
 * @param regionLength - regions are square, length of one side, in pm
 */
function createRegions(container, regionLength) {
  assert && assert(regionLength > 0, `invalid regionLength: ${regionLength}`);
  const regions = [];
  let maxX = container.right;
  while (maxX > container.right - container.widthRange.max) {
    const minX = maxX - regionLength;
    let minY = container.bottom;
    while (minY < container.top) {
      const maxY = minY + regionLength;
      const regionBounds = new Bounds2(minX, minY, maxX, maxY);
      regions.push(new Region(regionBounds));
      minY = minY + regionLength;
    }
    maxX = maxX - regionLength;
  }
  phet.log && phet.log(`created ${regions.length} regions of ${regionLength} pm each`);
  return regions;
}

/**
 * Assigns each particle to the Regions that it intersects, accounting for particle radius.
 */
function assignParticlesToRegions(particleArrays, regions) {
  assert && assert(regions.length > 0, `invalid regions: ${regions}`);
  for (let i = particleArrays.length - 1; i >= 0; i--) {
    const particles = particleArrays[i];
    for (let j = particles.length - 1; j >= 0; j--) {
      const particle = particles[j];
      for (let k = regions.length - 1; k >= 0; k--) {
        const region = regions[k];
        if (particle.intersectsBounds(region.bounds)) {
          region.addParticle(particle);
        }
      }
    }
  }
}

/**
 * Detects and handles particle-particle collisions. Particle-particle collision are based solely whether they
 * intersect at their current positions. It is possible (and acceptable) for two particles to pass through the
 * same point on the way to those position and not collide.
 */
function doParticleParticleCollisions(particles, mutableVectors) {
  for (let i = particles.length - 1; i >= 1; i--) {
    const particle1 = particles[i];
    for (let j = i - 1; j >= 0; j--) {
      const particle2 = particles[j];
      assert && assert(particle1 !== particle2, 'particle cannot collide with itself');

      // Ignore collisions if the particles were in contact on the previous step. This results in more
      // natural behavior where the particles enter the container, and was adapted from the Java version.
      if (!particle1.contactedParticle(particle2) && particle1.contactsParticle(particle2)) {
        //-----------------------------------------------------------------------------------------
        // Determine where the particles made contact.
        //-----------------------------------------------------------------------------------------

        const dx = particle1.position.x - particle2.position.x;
        const dy = particle1.position.y - particle2.position.y;
        const contactRatio = particle1.radius / particle1.position.distance(particle2.position);
        const contactPointX = particle1.position.x - dx * contactRatio;
        const contactPointY = particle1.position.y - dy * contactRatio;

        //-----------------------------------------------------------------------------------------
        // Adjust particle positions by reflecting across the line of impact.
        //-----------------------------------------------------------------------------------------

        // Normal vector, aka 'line of impact'
        mutableVectors.normal.setXY(dx, dy).normalize();

        // Tangent vector, perpendicular to the line of impact, aka 'plane of contact'
        mutableVectors.tangent.setXY(dy, -dx);

        // Angle of the plane of contact
        const lineAngle = Math.atan2(mutableVectors.tangent.y, mutableVectors.tangent.x);

        // Adjust positions
        adjustParticlePosition(particle1, contactPointX, contactPointY, lineAngle, mutableVectors.pointOnLine, mutableVectors.reflectedPoint);
        adjustParticlePosition(particle2, contactPointX, contactPointY, lineAngle, mutableVectors.pointOnLine, mutableVectors.reflectedPoint);

        //-----------------------------------------------------------------------------------------
        // Adjust particle velocities using impulse-based contact model.
        // See https://en.wikipedia.org/wiki/Collision_response#Impulse-based_contact_model
        //-----------------------------------------------------------------------------------------

        // Compute the impulse, j.
        // There is no angular velocity in our model, so the denominator involves only mass.
        mutableVectors.relativeVelocity.set(particle1.velocity).subtract(particle2.velocity);
        const vr = mutableVectors.relativeVelocity.dot(mutableVectors.normal);
        const numerator = -vr * (1 + e);
        const denominator = 1 / particle1.mass + 1 / particle2.mass;
        const j = numerator / denominator;
        adjustParticleSpeed(particle1, j / particle1.mass, mutableVectors.normal);
        adjustParticleSpeed(particle2, -j / particle2.mass, mutableVectors.normal);
      }
    }
  }
}

/**
 * Adjusts the position of a particle in response to a collision with another particle.
 * @param particle
 * @param contactPointX - x coordinate where collision occurred
 * @param contactPointY - y coordinate where collision occurred
 * @param lineAngle - angle of the plane of contact, in radians
 * @param pointOnLine - used to compute a point of line of contact, will be mutated!
 * @param reflectedPoint - used to compute reflected point, will be mutated!
 */
function adjustParticlePosition(particle, contactPointX, contactPointY, lineAngle, pointOnLine, reflectedPoint) {
  const previousDistance = particle.previousPosition.distanceXY(contactPointX, contactPointY);
  const positionRatio = particle.radius / previousDistance;
  pointOnLine.setXY(contactPointX - (contactPointX - particle.previousPosition.x) * positionRatio, contactPointY - (contactPointY - particle.previousPosition.y) * positionRatio);
  GasPropertiesUtils.reflectPointAcrossLine(particle.position, pointOnLine, lineAngle, reflectedPoint);
  particle.setPositionXY(reflectedPoint.x, reflectedPoint.y);
}

/**
 * Adjusts the speed of a particle in response to a collision with another particle.
 */
function adjustParticleSpeed(particle, scale, normalVector) {
  const vx = normalVector.x * scale;
  const vy = normalVector.y * scale;
  particle.setVelocityXY(particle.velocity.x + vx, particle.velocity.y + vy);
}
gasProperties.register('CollisionDetector', CollisionDetector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsImdhc1Byb3BlcnRpZXMiLCJHYXNQcm9wZXJ0aWVzVXRpbHMiLCJSZWdpb24iLCJlIiwiQ29sbGlzaW9uRGV0ZWN0b3IiLCJjb25zdHJ1Y3RvciIsImNvbnRhaW5lciIsInBhcnRpY2xlQXJyYXlzIiwicGFydGljbGVQYXJ0aWNsZUNvbGxpc2lvbnNFbmFibGVkUHJvcGVydHkiLCJhc3NlcnQiLCJsZW5ndGgiLCJyZWdpb25MZW5ndGgiLCJoZWlnaHQiLCJyZWdpb25zIiwiY3JlYXRlUmVnaW9ucyIsIl9udW1iZXJPZlBhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyIsIm11dGFibGVWZWN0b3JzIiwibm9ybWFsIiwidGFuZ2VudCIsInJlbGF0aXZlVmVsb2NpdHkiLCJwb2ludE9uTGluZSIsInJlZmxlY3RlZFBvaW50IiwiZGlzcG9zZSIsIm51bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zIiwiY2xlYXJSZWdpb25zIiwiaSIsImNsZWFyIiwidXBkYXRlIiwiY29udGFpbmVyUmVnaW9ucyIsIl8iLCJmaWx0ZXIiLCJyZWdpb24iLCJib3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwiYXNzaWduUGFydGljbGVzVG9SZWdpb25zIiwidmFsdWUiLCJkb1BhcnRpY2xlUGFydGljbGVDb2xsaXNpb25zIiwicGFydGljbGVzIiwidXBkYXRlUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zIiwiY29udGFpbnNQYXJ0aWNsZXMiLCJkb1BhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyIsImxlZnRXYWxsVmVsb2NpdHkiLCJjb250YWluZXJCb3VuZHMiLCJudW1iZXJPZkNvbGxpc2lvbnMiLCJwYXJ0aWNsZSIsImNvbGxpZGVkIiwibGVmdCIsIm1pblgiLCJzZXRWZWxvY2l0eVhZIiwidmVsb2NpdHkiLCJ4IiwieSIsInJpZ2h0IiwibWF4WCIsInRvcCIsIm1heFkiLCJib3R0b20iLCJtaW5ZIiwid2lkdGhSYW5nZSIsIm1heCIsInJlZ2lvbkJvdW5kcyIsInB1c2giLCJwaGV0IiwibG9nIiwiaiIsImsiLCJhZGRQYXJ0aWNsZSIsInBhcnRpY2xlMSIsInBhcnRpY2xlMiIsImNvbnRhY3RlZFBhcnRpY2xlIiwiY29udGFjdHNQYXJ0aWNsZSIsImR4IiwicG9zaXRpb24iLCJkeSIsImNvbnRhY3RSYXRpbyIsInJhZGl1cyIsImRpc3RhbmNlIiwiY29udGFjdFBvaW50WCIsImNvbnRhY3RQb2ludFkiLCJzZXRYWSIsIm5vcm1hbGl6ZSIsImxpbmVBbmdsZSIsIk1hdGgiLCJhdGFuMiIsImFkanVzdFBhcnRpY2xlUG9zaXRpb24iLCJzZXQiLCJzdWJ0cmFjdCIsInZyIiwiZG90IiwibnVtZXJhdG9yIiwiZGVub21pbmF0b3IiLCJtYXNzIiwiYWRqdXN0UGFydGljbGVTcGVlZCIsInByZXZpb3VzRGlzdGFuY2UiLCJwcmV2aW91c1Bvc2l0aW9uIiwiZGlzdGFuY2VYWSIsInBvc2l0aW9uUmF0aW8iLCJyZWZsZWN0UG9pbnRBY3Jvc3NMaW5lIiwic2V0UG9zaXRpb25YWSIsInNjYWxlIiwibm9ybWFsVmVjdG9yIiwidngiLCJ2eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29sbGlzaW9uRGV0ZWN0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29sbGlzaW9uRGV0ZWN0b3IgaGFuZGxlcyBjb2xsaXNpb24gZGV0ZWN0aW9uIGFuZCByZXNwb25zZSBmb3IgYWxsIHNjcmVlbnMuIE91ciBjb2xsaXNpb24gbW9kZWwgaW52b2x2ZXNcclxuICogcmlnaWQgYm9kaWVzLiBJdCBpcyBhIHBlcmZlY3RseS1lbGFzdGljIGNvbGxpc2lvbiBtb2RlbCwgd2hlcmUgdGhlcmUgaXMgbm8gbmV0IGxvc3Mgb2Yga2luZXRpYyBlbmVyZ3kuXHJcbiAqXHJcbiAqIFRoZSBhbGdvcml0aG1zIGZvciBwYXJ0aWNsZS1wYXJ0aWNsZSBjb2xsaXNpb25zIGFuZCBwYXJ0aWNsZS1jb250YWluZXIgY29sbGlzaW9ucyB3ZXJlIGFkYXB0ZWQgZnJvbSB0aGUgSmF2YVxyXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBHYXMgUHJvcGVydGllcy4gVGhleSBkaWZmZXIgZnJvbSB0aGUgc3RhbmRhcmQgcmlnaWQtYm9keSBjb2xsaXNpb24gbW9kZWwgYXMgZGVzY3JpYmVkIGluIChlLmcuKVxyXG4gKiBodHRwOi8vd2ViLm1zdC5lZHUvfnJlZmxvcmkvYmUxNTAvRHluJTIwTGVjdHVyZSUyMFZpZGVvcy9JbXBhY3QlMjBQYXJ0aWNsZXMlMjAxL0ltcGFjdCUyMFBhcnRpY2xlcyUyMDEucGRmLlxyXG4gKiBGb3IgaGlzdG9yaWNhbCBiYWNrZ3JvdW5kIG9uIGhvdyB0aGUgSmF2YSBpbXBsZW1lbnRhdGlvbiBpbmZvcm1lZCB0aGlzIGltcGxlbWVudGF0aW9uLCBzZWU6XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nYXMtcHJvcGVydGllcy9pc3N1ZXMvMzdcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dhcy1wcm9wZXJ0aWVzL2lzc3Vlcy80MFxyXG4gKlxyXG4gKiBXaGlsZSBjb2RlIGNvbW1lbnRzIGF0dGVtcHQgdG8gZGVzY3JpYmUgdGhpcyBpbXBsZW1lbnRhdGlvbiBjbGVhcmx5LCBmdWxseSB1bmRlcnN0YW5kaW5nIHRoZSBpbXBsZW1lbnRhdGlvbiBtYXlcclxuICogcmVxdWlyZSBzb21lIGdlbmVyYWwgYmFja2dyb3VuZCBpbiBjb2xsaXNpb25zIGRldGVjdGlvbiBhbmQgcmVzcG9uc2UuIFNvbWUgdXNlZnVsIHJlZmVyZW5jZXMgaW5jbHVkZTpcclxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29sbGlzaW9uX2RldGVjdGlvblxyXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db2xsaXNpb25fcmVzcG9uc2VcclxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRWxhc3RpY19jb2xsaXNpb25cclxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29sbGlzaW9uX3Jlc3BvbnNlI0ltcHVsc2UtYmFzZWRfY29udGFjdF9tb2RlbFxyXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db2VmZmljaWVudF9vZl9yZXN0aXR1dGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc1V0aWxzIGZyb20gJy4uL0dhc1Byb3BlcnRpZXNVdGlscy5qcyc7XHJcbmltcG9ydCBCYXNlQ29udGFpbmVyIGZyb20gJy4vQmFzZUNvbnRhaW5lci5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tICcuL1BhcnRpY2xlLmpzJztcclxuaW1wb3J0IFJlZ2lvbiBmcm9tICcuL1JlZ2lvbi5qcyc7XHJcblxyXG4vLyBDb2VmZmljaWVudCBvZiByZXN0aXR1dGlvbiAoZSkgaXMgdGhlIHJhdGlvIG9mIHRoZSBmaW5hbCB0byBpbml0aWFsIHJlbGF0aXZlIHZlbG9jaXR5IGJldHdlZW4gdHdvIG9iamVjdHNcclxuLy8gYWZ0ZXIgdGhleSBjb2xsaWRlLiBJdCBub3JtYWxseSByYW5nZXMgZnJvbSAwIHRvIDEsIHdoZXJlIDEgaXMgYSBwZXJmZWN0bHkgZWxhc3RpYyBjb2xsaXNpb24uXHJcbi8vIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db2VmZmljaWVudF9vZl9yZXN0aXR1dGlvblxyXG5jb25zdCBlID0gMTtcclxuXHJcbnR5cGUgTXV0YWJsZVZlY3RvcnMgPSB7XHJcbiAgbm9ybWFsOiBWZWN0b3IyO1xyXG4gIHRhbmdlbnQ6IFZlY3RvcjI7XHJcbiAgcmVsYXRpdmVWZWxvY2l0eTogVmVjdG9yMjtcclxuICBwb2ludE9uTGluZTogVmVjdG9yMjtcclxuICByZWZsZWN0ZWRQb2ludDogVmVjdG9yMjtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbGxpc2lvbkRldGVjdG9yIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb250YWluZXI6IEJhc2VDb250YWluZXI7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHBhcnRpY2xlQXJyYXlzOiBQYXJ0aWNsZVtdW107XHJcbiAgcHVibGljIHJlYWRvbmx5IHBhcnRpY2xlUGFydGljbGVDb2xsaXNpb25zRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gMkQgZ3JpZCBvZiBSZWdpb25zXHJcbiAgcHVibGljIHJlYWRvbmx5IHJlZ2lvbnM6IFJlZ2lvbltdO1xyXG5cclxuICAvLyBudW1iZXIgb2Ygd2FsbCBjb2xsaXNpb25zIG9uIHRoZSBtb3N0IHJlY2VudCBjYWxsIHRvIHVwZGF0ZVxyXG4gIHByaXZhdGUgX251bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zOiBudW1iZXI7XHJcblxyXG4gIC8vIG11dGFibGUgdmVjdG9ycywgcmV1c2VkIGluIGNyaXRpY2FsIGNvZGVcclxuICBwcml2YXRlIHJlYWRvbmx5IG11dGFibGVWZWN0b3JzOiBNdXRhYmxlVmVjdG9ycztcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNvbnRhaW5lciAtIHRoZSBjb250YWluZXIgaW5zaWRlIHdoaWNoIGNvbGxpc2lvbiBvY2N1clxyXG4gICAqIEBwYXJhbSBwYXJ0aWNsZUFycmF5cyAtIGNvbGxlY3Rpb25zIG9mIHBhcnRpY2xlcyBpbnNpZGUgdGhlIGNvbnRhaW5lclxyXG4gICAqIEBwYXJhbSBwYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9uc0VuYWJsZWRQcm9wZXJ0eSAtIHdoZXRoZXIgcGFydGljbGUtcGFydGljbGUgY29sbGlzaW9ucyBvY2N1clxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29udGFpbmVyOiBCYXNlQ29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFydGljbGVBcnJheXM6IFBhcnRpY2xlW11bXSxcclxuICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlUGFydGljbGVDb2xsaXNpb25zRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcnRpY2xlQXJyYXlzLmxlbmd0aCA+IDAsIGBpbnZhbGlkIHBhcnRpY2xlQXJyYXlzOiAke3BhcnRpY2xlQXJyYXlzfWAgKTtcclxuXHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIHRoaXMucGFydGljbGVBcnJheXMgPSBwYXJ0aWNsZUFycmF5cztcclxuICAgIHRoaXMucGFydGljbGVQYXJ0aWNsZUNvbGxpc2lvbnNFbmFibGVkUHJvcGVydHkgPSBwYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9uc0VuYWJsZWRQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBSZWdpb25zIGFyZSBzcXVhcmUgU28gdGhpcyBpcyB0aGUgbGVuZ3RoIG9mIG9uZSBzaWRlLCBwbS5cclxuICAgIGNvbnN0IHJlZ2lvbkxlbmd0aCA9IGNvbnRhaW5lci5oZWlnaHQgLyA0O1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVnaW9uTGVuZ3RoID4gMCwgYGludmFsaWQgcmVnaW9uTGVuZ3RoOiAke3JlZ2lvbkxlbmd0aH1gICk7XHJcbiAgICB0aGlzLnJlZ2lvbnMgPSBjcmVhdGVSZWdpb25zKCBjb250YWluZXIsIHJlZ2lvbkxlbmd0aCApO1xyXG5cclxuICAgIHRoaXMuX251bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zID0gMDtcclxuXHJcbiAgICB0aGlzLm11dGFibGVWZWN0b3JzID0ge1xyXG4gICAgICBub3JtYWw6IG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgIHRhbmdlbnQ6IG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgIHJlbGF0aXZlVmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgIHBvaW50T25MaW5lOiBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gICAgICByZWZsZWN0ZWRQb2ludDogbmV3IFZlY3RvcjIoIDAsIDAgKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG51bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fbnVtYmVyT2ZQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgYWxsIHJlZ2lvbnMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjbGVhclJlZ2lvbnMoKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMucmVnaW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgdGhpcy5yZWdpb25zWyBpIF0uY2xlYXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm1zIGNvbGxpc2lvbiBkZXRlY3Rpb24gYW5kIHJlc3BvbnNlIGZvciB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgcGFydGljbGUgc3lzdGVtLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcblxyXG4gICAgdGhpcy5jbGVhclJlZ2lvbnMoKTtcclxuXHJcbiAgICAvLyBVc2UgcmVnaW9ucyB0aGF0IGludGVyc2VjdCB0aGUgY29udGFpbmVyLCBzaW5jZSBjb2xsaXNpb25zIG9ubHkgb2NjdXIgaW5zaWRlIHRoZSBjb250YWluZXIuXHJcbiAgICBjb25zdCBjb250YWluZXJSZWdpb25zID0gXy5maWx0ZXIoIHRoaXMucmVnaW9ucyxcclxuICAgICAgcmVnaW9uID0+IHRoaXMuY29udGFpbmVyLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCByZWdpb24uYm91bmRzICkgKTtcclxuXHJcbiAgICAvLyBwdXQgcGFydGljbGVzIGluIHJlZ2lvbnNcclxuICAgIGFzc2lnblBhcnRpY2xlc1RvUmVnaW9ucyggdGhpcy5wYXJ0aWNsZUFycmF5cywgY29udGFpbmVyUmVnaW9ucyApO1xyXG5cclxuICAgIC8vIHBhcnRpY2xlLXBhcnRpY2xlIGNvbGxpc2lvbnMsIHdpdGhpbiBlYWNoIHJlZ2lvblxyXG4gICAgaWYgKCB0aGlzLnBhcnRpY2xlUGFydGljbGVDb2xsaXNpb25zRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IGNvbnRhaW5lclJlZ2lvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgZG9QYXJ0aWNsZVBhcnRpY2xlQ29sbGlzaW9ucyggY29udGFpbmVyUmVnaW9uc1sgaSBdLnBhcnRpY2xlcywgdGhpcy5tdXRhYmxlVmVjdG9ycyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcGFydGljbGUtY29udGFpbmVyIGNvbGxpc2lvbnNcclxuICAgIHRoaXMuX251bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zID0gdGhpcy51cGRhdGVQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMoKTtcclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCBhbGwgcGFydGljbGVzIGFyZSBmdWxseSBpbnNpZGUgdGhlIGNvbnRhaW5lci5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29udGFpbmVyLmNvbnRhaW5zUGFydGljbGVzKCB0aGlzLnBhcnRpY2xlQXJyYXlzICksXHJcbiAgICAgICdwYXJ0aWNsZXMgaGF2ZSBsZWFrZWQgb3V0IG9mIHRoZSBjb250YWluZXInICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlY3RzIGFuZCBoYW5kbGVzIHBhcnRpY2xlLWNvbnRhaW5lciBjb2xsaXNpb25zIGZvciB0aGUgc3lzdGVtLlxyXG4gICAqIFRoaXMgaXMgb3ZlcnJpZGRlbiBieSBzdWJjbGFzcyBEaWZmdXNpb25Db2xsaXNpb25EZXRlY3RvciB0byBpbXBsZW1lbnQgY29sbGlzaW9uIGRldGVjdGlvbiB3aXRoIHRoZSBkaXZpZGVyXHJcbiAgICogdGhhdCBhcHBlYXJzIGluIHRoZSBjb250YWluZXIgaW4gdGhlICdEaWZmdXNpb24nIHNjcmVlbi5cclxuICAgKiBAcmV0dXJucyB0aGUgbnVtYmVyIG9mIGNvbGxpc2lvbnNcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgdXBkYXRlUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zKCk6IG51bWJlciB7XHJcbiAgICBsZXQgbnVtYmVyT2ZQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMgPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLnBhcnRpY2xlQXJyYXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBudW1iZXJPZlBhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyArPSBDb2xsaXNpb25EZXRlY3Rvci5kb1BhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyggdGhpcy5wYXJ0aWNsZUFycmF5c1sgaSBdLFxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmJvdW5kcywgdGhpcy5jb250YWluZXIubGVmdFdhbGxWZWxvY2l0eSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZWN0cyBhbmQgaGFuZGxlcyBwYXJ0aWNsZS1jb250YWluZXIgY29sbGlzaW9ucy4gVGhlc2UgY29sbGlzaW9ucyBvY2N1ciBpZiBhIHBhcnRpY2xlIGNvbnRhY3RlZCBhIHdhbGwgb25cclxuICAgKiBpdHMgd2F5IHRvIGl0cyBjdXJyZW50IHBvc2l0aW9uLlxyXG4gICAqIEBwYXJhbSBwYXJ0aWNsZXNcclxuICAgKiBAcGFyYW0gY29udGFpbmVyQm91bmRzXHJcbiAgICogQHBhcmFtIGxlZnRXYWxsVmVsb2NpdHkgLSB2ZWxvY2l0eSBvZiB0aGUgY29udGFpbmVyJ3MgbGVmdCAobW92YWJsZSkgd2FsbFxyXG4gICAqIEByZXR1cm5zIG51bWJlciBvZiBjb2xsaXNpb25zXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIHN0YXRpYyBkb1BhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyggcGFydGljbGVzOiBQYXJ0aWNsZVtdLCBjb250YWluZXJCb3VuZHM6IEJvdW5kczIsIGxlZnRXYWxsVmVsb2NpdHk6IFZlY3RvcjIgKTogbnVtYmVyIHtcclxuXHJcbiAgICBsZXQgbnVtYmVyT2ZDb2xsaXNpb25zID0gMDtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IHBhcnRpY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlID0gcGFydGljbGVzWyBpIF07XHJcbiAgICAgIGxldCBjb2xsaWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gYWRqdXN0IHhcclxuICAgICAgaWYgKCBwYXJ0aWNsZS5sZWZ0IDw9IGNvbnRhaW5lckJvdW5kcy5taW5YICkge1xyXG4gICAgICAgIHBhcnRpY2xlLmxlZnQgPSBjb250YWluZXJCb3VuZHMubWluWDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGxlZnQgd2FsbCBpcyBtb3ZpbmcsIGl0IHdpbGwgZG8gd29yay5cclxuICAgICAgICBwYXJ0aWNsZS5zZXRWZWxvY2l0eVhZKCAtKCBwYXJ0aWNsZS52ZWxvY2l0eS54IC0gbGVmdFdhbGxWZWxvY2l0eS54ICksIHBhcnRpY2xlLnZlbG9jaXR5LnkgKTtcclxuICAgICAgICBjb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHBhcnRpY2xlLnJpZ2h0ID49IGNvbnRhaW5lckJvdW5kcy5tYXhYICkge1xyXG4gICAgICAgIHBhcnRpY2xlLnJpZ2h0ID0gY29udGFpbmVyQm91bmRzLm1heFg7XHJcbiAgICAgICAgcGFydGljbGUuc2V0VmVsb2NpdHlYWSggLXBhcnRpY2xlLnZlbG9jaXR5LngsIHBhcnRpY2xlLnZlbG9jaXR5LnkgKTtcclxuICAgICAgICBjb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFkanVzdCB5XHJcbiAgICAgIGlmICggcGFydGljbGUudG9wID49IGNvbnRhaW5lckJvdW5kcy5tYXhZICkge1xyXG4gICAgICAgIHBhcnRpY2xlLnRvcCA9IGNvbnRhaW5lckJvdW5kcy5tYXhZO1xyXG4gICAgICAgIHBhcnRpY2xlLnNldFZlbG9jaXR5WFkoIHBhcnRpY2xlLnZlbG9jaXR5LngsIC1wYXJ0aWNsZS52ZWxvY2l0eS55ICk7XHJcbiAgICAgICAgY29sbGlkZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwYXJ0aWNsZS5ib3R0b20gPD0gY29udGFpbmVyQm91bmRzLm1pblkgKSB7XHJcbiAgICAgICAgcGFydGljbGUuYm90dG9tID0gY29udGFpbmVyQm91bmRzLm1pblk7XHJcbiAgICAgICAgcGFydGljbGUuc2V0VmVsb2NpdHlYWSggcGFydGljbGUudmVsb2NpdHkueCwgLXBhcnRpY2xlLnZlbG9jaXR5LnkgKTtcclxuICAgICAgICBjb2xsaWRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggY29sbGlkZWQgKSB7XHJcbiAgICAgICAgbnVtYmVyT2ZDb2xsaXNpb25zKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVtYmVyT2ZDb2xsaXNpb25zO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnRpdGlvbnMgdGhlIGNvbGxpc2lvbiBkZXRlY3Rpb24gYm91bmRzIGludG8gUmVnaW9ucy4gIFNpbmNlIGNvbGxpc2lvbnMgb25seSBvY2N1ciBpbnNpZGUgdGhlIGNvbnRhaW5lcixcclxuICogdGhlIG1heGltdW0gY29sbGlzaW9uIGRldGVjdGlvbiBib3VuZHMgaXMgdGhlIGNvbnRhaW5lciBhdCBpdHMgbWF4IHdpZHRoLiAgVGhpcyBhbGdvcml0aG0gYnVpbGRzIHRoZSBncmlkXHJcbiAqIHJpZ2h0LXRvLWxlZnQsIGJvdHRvbS10by10b3AsIHNvIHRoYXQgdGhlIGdyaWQgaXMgYWxpZ25lZCB3aXRoIHRoZSByaWdodCBhbmQgYm90dG9tIGVkZ2VzIG9mIHRoZSBjb250YWluZXIuXHJcbiAqIFJlZ2lvbnMgYWxvbmcgdGhlIHRvcCBhbmQgbGVmdCBlZGdlcyBtYXkgYmUgb3V0c2lkZSB0aGUgY29udGFpbmVyLCBhbmQgdGhhdCdzIE9LLiAgUmVnaW9ucyBvdXRzaWRlIHRoZVxyXG4gKiBjb250YWluZXIgd2lsbCBiZSBleGNsdWRlZCBmcm9tIGNvbGxpc2lvbiBkZXRlY3Rpb24uXHJcbiAqIEBwYXJhbSBjb250YWluZXJcclxuICogQHBhcmFtIHJlZ2lvbkxlbmd0aCAtIHJlZ2lvbnMgYXJlIHNxdWFyZSwgbGVuZ3RoIG9mIG9uZSBzaWRlLCBpbiBwbVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlUmVnaW9ucyggY29udGFpbmVyOiBCYXNlQ29udGFpbmVyLCByZWdpb25MZW5ndGg6IG51bWJlciApOiBSZWdpb25bXSB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggcmVnaW9uTGVuZ3RoID4gMCwgYGludmFsaWQgcmVnaW9uTGVuZ3RoOiAke3JlZ2lvbkxlbmd0aH1gICk7XHJcblxyXG4gIGNvbnN0IHJlZ2lvbnMgPSBbXTtcclxuICBsZXQgbWF4WCA9IGNvbnRhaW5lci5yaWdodDtcclxuICB3aGlsZSAoIG1heFggPiBjb250YWluZXIucmlnaHQgLSBjb250YWluZXIud2lkdGhSYW5nZS5tYXggKSB7XHJcbiAgICBjb25zdCBtaW5YID0gbWF4WCAtIHJlZ2lvbkxlbmd0aDtcclxuICAgIGxldCBtaW5ZID0gY29udGFpbmVyLmJvdHRvbTtcclxuICAgIHdoaWxlICggbWluWSA8IGNvbnRhaW5lci50b3AgKSB7XHJcbiAgICAgIGNvbnN0IG1heFkgPSBtaW5ZICsgcmVnaW9uTGVuZ3RoO1xyXG4gICAgICBjb25zdCByZWdpb25Cb3VuZHMgPSBuZXcgQm91bmRzMiggbWluWCwgbWluWSwgbWF4WCwgbWF4WSApO1xyXG4gICAgICByZWdpb25zLnB1c2goIG5ldyBSZWdpb24oIHJlZ2lvbkJvdW5kcyApICk7XHJcbiAgICAgIG1pblkgPSBtaW5ZICsgcmVnaW9uTGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgbWF4WCA9IG1heFggLSByZWdpb25MZW5ndGg7XHJcbiAgfVxyXG4gIHBoZXQubG9nICYmIHBoZXQubG9nKCBgY3JlYXRlZCAke3JlZ2lvbnMubGVuZ3RofSByZWdpb25zIG9mICR7cmVnaW9uTGVuZ3RofSBwbSBlYWNoYCApO1xyXG4gIHJldHVybiByZWdpb25zO1xyXG59XHJcblxyXG4vKipcclxuICogQXNzaWducyBlYWNoIHBhcnRpY2xlIHRvIHRoZSBSZWdpb25zIHRoYXQgaXQgaW50ZXJzZWN0cywgYWNjb3VudGluZyBmb3IgcGFydGljbGUgcmFkaXVzLlxyXG4gKi9cclxuZnVuY3Rpb24gYXNzaWduUGFydGljbGVzVG9SZWdpb25zKCBwYXJ0aWNsZUFycmF5czogUGFydGljbGVbXVtdLCByZWdpb25zOiBSZWdpb25bXSApOiB2b2lkIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCByZWdpb25zLmxlbmd0aCA+IDAsIGBpbnZhbGlkIHJlZ2lvbnM6ICR7cmVnaW9uc31gICk7XHJcblxyXG4gIGZvciAoIGxldCBpID0gcGFydGljbGVBcnJheXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICBjb25zdCBwYXJ0aWNsZXMgPSBwYXJ0aWNsZUFycmF5c1sgaSBdO1xyXG4gICAgZm9yICggbGV0IGogPSBwYXJ0aWNsZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0gKSB7XHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlID0gcGFydGljbGVzWyBqIF07XHJcbiAgICAgIGZvciAoIGxldCBrID0gcmVnaW9ucy5sZW5ndGggLSAxOyBrID49IDA7IGstLSApIHtcclxuICAgICAgICBjb25zdCByZWdpb24gPSByZWdpb25zWyBrIF07XHJcbiAgICAgICAgaWYgKCBwYXJ0aWNsZS5pbnRlcnNlY3RzQm91bmRzKCByZWdpb24uYm91bmRzICkgKSB7XHJcbiAgICAgICAgICByZWdpb24uYWRkUGFydGljbGUoIHBhcnRpY2xlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGV0ZWN0cyBhbmQgaGFuZGxlcyBwYXJ0aWNsZS1wYXJ0aWNsZSBjb2xsaXNpb25zLiBQYXJ0aWNsZS1wYXJ0aWNsZSBjb2xsaXNpb24gYXJlIGJhc2VkIHNvbGVseSB3aGV0aGVyIHRoZXlcclxuICogaW50ZXJzZWN0IGF0IHRoZWlyIGN1cnJlbnQgcG9zaXRpb25zLiBJdCBpcyBwb3NzaWJsZSAoYW5kIGFjY2VwdGFibGUpIGZvciB0d28gcGFydGljbGVzIHRvIHBhc3MgdGhyb3VnaCB0aGVcclxuICogc2FtZSBwb2ludCBvbiB0aGUgd2F5IHRvIHRob3NlIHBvc2l0aW9uIGFuZCBub3QgY29sbGlkZS5cclxuICovXHJcbmZ1bmN0aW9uIGRvUGFydGljbGVQYXJ0aWNsZUNvbGxpc2lvbnMoIHBhcnRpY2xlczogUGFydGljbGVbXSwgbXV0YWJsZVZlY3RvcnM6IE11dGFibGVWZWN0b3JzICk6IHZvaWQge1xyXG5cclxuICBmb3IgKCBsZXQgaSA9IHBhcnRpY2xlcy5sZW5ndGggLSAxOyBpID49IDE7IGktLSApIHtcclxuXHJcbiAgICBjb25zdCBwYXJ0aWNsZTEgPSBwYXJ0aWNsZXNbIGkgXTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaiA9IGkgLSAxOyBqID49IDA7IGotLSApIHtcclxuXHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlMiA9IHBhcnRpY2xlc1sgaiBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJ0aWNsZTEgIT09IHBhcnRpY2xlMiwgJ3BhcnRpY2xlIGNhbm5vdCBjb2xsaWRlIHdpdGggaXRzZWxmJyApO1xyXG5cclxuICAgICAgLy8gSWdub3JlIGNvbGxpc2lvbnMgaWYgdGhlIHBhcnRpY2xlcyB3ZXJlIGluIGNvbnRhY3Qgb24gdGhlIHByZXZpb3VzIHN0ZXAuIFRoaXMgcmVzdWx0cyBpbiBtb3JlXHJcbiAgICAgIC8vIG5hdHVyYWwgYmVoYXZpb3Igd2hlcmUgdGhlIHBhcnRpY2xlcyBlbnRlciB0aGUgY29udGFpbmVyLCBhbmQgd2FzIGFkYXB0ZWQgZnJvbSB0aGUgSmF2YSB2ZXJzaW9uLlxyXG4gICAgICBpZiAoICFwYXJ0aWNsZTEuY29udGFjdGVkUGFydGljbGUoIHBhcnRpY2xlMiApICYmIHBhcnRpY2xlMS5jb250YWN0c1BhcnRpY2xlKCBwYXJ0aWNsZTIgKSApIHtcclxuXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGVyZSB0aGUgcGFydGljbGVzIG1hZGUgY29udGFjdC5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIGNvbnN0IGR4ID0gcGFydGljbGUxLnBvc2l0aW9uLnggLSBwYXJ0aWNsZTIucG9zaXRpb24ueDtcclxuICAgICAgICBjb25zdCBkeSA9IHBhcnRpY2xlMS5wb3NpdGlvbi55IC0gcGFydGljbGUyLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgY29uc3QgY29udGFjdFJhdGlvID0gcGFydGljbGUxLnJhZGl1cyAvIHBhcnRpY2xlMS5wb3NpdGlvbi5kaXN0YW5jZSggcGFydGljbGUyLnBvc2l0aW9uICk7XHJcbiAgICAgICAgY29uc3QgY29udGFjdFBvaW50WCA9IHBhcnRpY2xlMS5wb3NpdGlvbi54IC0gZHggKiBjb250YWN0UmF0aW87XHJcbiAgICAgICAgY29uc3QgY29udGFjdFBvaW50WSA9IHBhcnRpY2xlMS5wb3NpdGlvbi55IC0gZHkgKiBjb250YWN0UmF0aW87XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyBBZGp1c3QgcGFydGljbGUgcG9zaXRpb25zIGJ5IHJlZmxlY3RpbmcgYWNyb3NzIHRoZSBsaW5lIG9mIGltcGFjdC5cclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIC8vIE5vcm1hbCB2ZWN0b3IsIGFrYSAnbGluZSBvZiBpbXBhY3QnXHJcbiAgICAgICAgbXV0YWJsZVZlY3RvcnMubm9ybWFsLnNldFhZKCBkeCwgZHkgKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICAgICAgLy8gVGFuZ2VudCB2ZWN0b3IsIHBlcnBlbmRpY3VsYXIgdG8gdGhlIGxpbmUgb2YgaW1wYWN0LCBha2EgJ3BsYW5lIG9mIGNvbnRhY3QnXHJcbiAgICAgICAgbXV0YWJsZVZlY3RvcnMudGFuZ2VudC5zZXRYWSggZHksIC1keCApO1xyXG5cclxuICAgICAgICAvLyBBbmdsZSBvZiB0aGUgcGxhbmUgb2YgY29udGFjdFxyXG4gICAgICAgIGNvbnN0IGxpbmVBbmdsZSA9IE1hdGguYXRhbjIoIG11dGFibGVWZWN0b3JzLnRhbmdlbnQueSwgbXV0YWJsZVZlY3RvcnMudGFuZ2VudC54ICk7XHJcblxyXG4gICAgICAgIC8vIEFkanVzdCBwb3NpdGlvbnNcclxuICAgICAgICBhZGp1c3RQYXJ0aWNsZVBvc2l0aW9uKCBwYXJ0aWNsZTEsIGNvbnRhY3RQb2ludFgsIGNvbnRhY3RQb2ludFksIGxpbmVBbmdsZSxcclxuICAgICAgICAgIG11dGFibGVWZWN0b3JzLnBvaW50T25MaW5lLCBtdXRhYmxlVmVjdG9ycy5yZWZsZWN0ZWRQb2ludCApO1xyXG4gICAgICAgIGFkanVzdFBhcnRpY2xlUG9zaXRpb24oIHBhcnRpY2xlMiwgY29udGFjdFBvaW50WCwgY29udGFjdFBvaW50WSwgbGluZUFuZ2xlLFxyXG4gICAgICAgICAgbXV0YWJsZVZlY3RvcnMucG9pbnRPbkxpbmUsIG11dGFibGVWZWN0b3JzLnJlZmxlY3RlZFBvaW50ICk7XHJcblxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAvLyBBZGp1c3QgcGFydGljbGUgdmVsb2NpdGllcyB1c2luZyBpbXB1bHNlLWJhc2VkIGNvbnRhY3QgbW9kZWwuXHJcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbGxpc2lvbl9yZXNwb25zZSNJbXB1bHNlLWJhc2VkX2NvbnRhY3RfbW9kZWxcclxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGltcHVsc2UsIGouXHJcbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gYW5ndWxhciB2ZWxvY2l0eSBpbiBvdXIgbW9kZWwsIHNvIHRoZSBkZW5vbWluYXRvciBpbnZvbHZlcyBvbmx5IG1hc3MuXHJcbiAgICAgICAgbXV0YWJsZVZlY3RvcnMucmVsYXRpdmVWZWxvY2l0eS5zZXQoIHBhcnRpY2xlMS52ZWxvY2l0eSApLnN1YnRyYWN0KCBwYXJ0aWNsZTIudmVsb2NpdHkgKTtcclxuICAgICAgICBjb25zdCB2ciA9IG11dGFibGVWZWN0b3JzLnJlbGF0aXZlVmVsb2NpdHkuZG90KCBtdXRhYmxlVmVjdG9ycy5ub3JtYWwgKTtcclxuICAgICAgICBjb25zdCBudW1lcmF0b3IgPSAtdnIgKiAoIDEgKyBlICk7XHJcbiAgICAgICAgY29uc3QgZGVub21pbmF0b3IgPSAoIDEgLyBwYXJ0aWNsZTEubWFzcyArIDEgLyBwYXJ0aWNsZTIubWFzcyApO1xyXG4gICAgICAgIGNvbnN0IGogPSBudW1lcmF0b3IgLyBkZW5vbWluYXRvcjtcclxuXHJcbiAgICAgICAgYWRqdXN0UGFydGljbGVTcGVlZCggcGFydGljbGUxLCBqIC8gcGFydGljbGUxLm1hc3MsIG11dGFibGVWZWN0b3JzLm5vcm1hbCApO1xyXG4gICAgICAgIGFkanVzdFBhcnRpY2xlU3BlZWQoIHBhcnRpY2xlMiwgLWogLyBwYXJ0aWNsZTIubWFzcywgbXV0YWJsZVZlY3RvcnMubm9ybWFsICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBZGp1c3RzIHRoZSBwb3NpdGlvbiBvZiBhIHBhcnRpY2xlIGluIHJlc3BvbnNlIHRvIGEgY29sbGlzaW9uIHdpdGggYW5vdGhlciBwYXJ0aWNsZS5cclxuICogQHBhcmFtIHBhcnRpY2xlXHJcbiAqIEBwYXJhbSBjb250YWN0UG9pbnRYIC0geCBjb29yZGluYXRlIHdoZXJlIGNvbGxpc2lvbiBvY2N1cnJlZFxyXG4gKiBAcGFyYW0gY29udGFjdFBvaW50WSAtIHkgY29vcmRpbmF0ZSB3aGVyZSBjb2xsaXNpb24gb2NjdXJyZWRcclxuICogQHBhcmFtIGxpbmVBbmdsZSAtIGFuZ2xlIG9mIHRoZSBwbGFuZSBvZiBjb250YWN0LCBpbiByYWRpYW5zXHJcbiAqIEBwYXJhbSBwb2ludE9uTGluZSAtIHVzZWQgdG8gY29tcHV0ZSBhIHBvaW50IG9mIGxpbmUgb2YgY29udGFjdCwgd2lsbCBiZSBtdXRhdGVkIVxyXG4gKiBAcGFyYW0gcmVmbGVjdGVkUG9pbnQgLSB1c2VkIHRvIGNvbXB1dGUgcmVmbGVjdGVkIHBvaW50LCB3aWxsIGJlIG11dGF0ZWQhXHJcbiAqL1xyXG5mdW5jdGlvbiBhZGp1c3RQYXJ0aWNsZVBvc2l0aW9uKCBwYXJ0aWNsZTogUGFydGljbGUsIGNvbnRhY3RQb2ludFg6IG51bWJlciwgY29udGFjdFBvaW50WTogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lQW5nbGU6IG51bWJlciwgcG9pbnRPbkxpbmU6IFZlY3RvcjIsIHJlZmxlY3RlZFBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xyXG5cclxuICBjb25zdCBwcmV2aW91c0Rpc3RhbmNlID0gcGFydGljbGUucHJldmlvdXNQb3NpdGlvbi5kaXN0YW5jZVhZKCBjb250YWN0UG9pbnRYLCBjb250YWN0UG9pbnRZICk7XHJcbiAgY29uc3QgcG9zaXRpb25SYXRpbyA9IHBhcnRpY2xlLnJhZGl1cyAvIHByZXZpb3VzRGlzdGFuY2U7XHJcbiAgcG9pbnRPbkxpbmUuc2V0WFkoXHJcbiAgICBjb250YWN0UG9pbnRYIC0gKCBjb250YWN0UG9pbnRYIC0gcGFydGljbGUucHJldmlvdXNQb3NpdGlvbi54ICkgKiBwb3NpdGlvblJhdGlvLFxyXG4gICAgY29udGFjdFBvaW50WSAtICggY29udGFjdFBvaW50WSAtIHBhcnRpY2xlLnByZXZpb3VzUG9zaXRpb24ueSApICogcG9zaXRpb25SYXRpb1xyXG4gICk7XHJcbiAgR2FzUHJvcGVydGllc1V0aWxzLnJlZmxlY3RQb2ludEFjcm9zc0xpbmUoIHBhcnRpY2xlLnBvc2l0aW9uLCBwb2ludE9uTGluZSwgbGluZUFuZ2xlLCByZWZsZWN0ZWRQb2ludCApO1xyXG4gIHBhcnRpY2xlLnNldFBvc2l0aW9uWFkoIHJlZmxlY3RlZFBvaW50LngsIHJlZmxlY3RlZFBvaW50LnkgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkanVzdHMgdGhlIHNwZWVkIG9mIGEgcGFydGljbGUgaW4gcmVzcG9uc2UgdG8gYSBjb2xsaXNpb24gd2l0aCBhbm90aGVyIHBhcnRpY2xlLlxyXG4gKi9cclxuZnVuY3Rpb24gYWRqdXN0UGFydGljbGVTcGVlZCggcGFydGljbGU6IFBhcnRpY2xlLCBzY2FsZTogbnVtYmVyLCBub3JtYWxWZWN0b3I6IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgY29uc3QgdnggPSBub3JtYWxWZWN0b3IueCAqIHNjYWxlO1xyXG4gIGNvbnN0IHZ5ID0gbm9ybWFsVmVjdG9yLnkgKiBzY2FsZTtcclxuICBwYXJ0aWNsZS5zZXRWZWxvY2l0eVhZKCBwYXJ0aWNsZS52ZWxvY2l0eS54ICsgdngsIHBhcnRpY2xlLnZlbG9jaXR5LnkgKyB2eSApO1xyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnQ29sbGlzaW9uRGV0ZWN0b3InLCBDb2xsaXNpb25EZXRlY3RvciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUd6RCxPQUFPQyxNQUFNLE1BQU0sYUFBYTs7QUFFaEM7QUFDQTtBQUNBO0FBQ0Es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