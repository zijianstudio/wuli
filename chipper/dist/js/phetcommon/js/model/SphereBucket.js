// Copyright 2013-2023, University of Colorado Boulder

/**
 * SphereBucket is a model of a bucket that can be used to store spherical objects.  It manages the addition and removal
 * of the spheres, stacks them as they are added, and manages the stack as spheres are removed.
 *
 * This expects the spheres to have certain properties, please inspect the code to understand the 'contract' between the
 * bucket and the spheres.
 *
 * @author John Blanco
 */

import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import phetcommon from '../phetcommon.js';
import Bucket from './Bucket.js';
import optionize from '../../../phet-core/js/optionize.js';
const ReferenceObjectArrayIO = ArrayIO(ReferenceIO(IOType.ObjectIO));
class SphereBucket extends Bucket {
  // empirically determined, for positioning particles inside the bucket

  // particles managed by this bucket
  _particles = [];
  constructor(providedOptions) {
    const options = optionize()({
      sphereRadius: 10,
      // expected radius of the spheres that will be placed in this bucket
      usableWidthProportion: 1.0,
      // proportion of the bucket width that the spheres can occupy
      tandem: Tandem.OPTIONAL,
      phetioType: SphereBucket.SphereBucketIO,
      verticalParticleOffset: null
    }, providedOptions);
    super(options);
    this.sphereBucketTandem = options.tandem;
    this._sphereRadius = options.sphereRadius;
    this._usableWidthProportion = options.usableWidthProportion;
    this._verticalParticleOffset = options.verticalParticleOffset === null ? -this._sphereRadius * 0.4 : options.verticalParticleOffset;
    this._particles = [];
  }

  /**
   * add a particle to the first open position in the stacking order
   */
  addParticleFirstOpen(particle, animate) {
    particle.destinationProperty.set(this.getFirstOpenPosition());
    this.addParticle(particle, animate);
  }

  /**
   * add a particle to the nearest open position in the particle stack
   */
  addParticleNearestOpen(particle, animate) {
    particle.destinationProperty.set(this.getNearestOpenPosition(particle.destinationProperty.get()));
    this.addParticle(particle, animate);
  }

  /**
   * add a particle to the bucket and set up listeners for when the particle is removed
   */
  addParticle(particle, animate) {
    if (!animate) {
      particle.positionProperty.set(particle.destinationProperty.get());
    }
    this._particles.push(particle);

    // add a listener that will remove this particle from the bucket if the user grabs it
    const particleRemovedListener = () => {
      this.removeParticle(particle);

      // the process of removing the particle from the bucket should also disconnect removal listener
      assert && assert(!particle.bucketRemovalListener, 'listener still present after being removed from bucket');
    };
    particle.userControlledProperty.lazyLink(particleRemovedListener);
    particle.bucketRemovalListener = particleRemovedListener; // Attach to the particle to aid unlinking in some cases.
  }

  /**
   * remove a particle from the bucket, updating listeners as necessary
   */
  removeParticle(particle, skipLayout = false) {
    assert && assert(this.containsParticle(particle), 'attempt made to remove particle that is not in bucket');

    // remove the particle from the array
    this._particles = _.without(this._particles, particle);

    // remove the removal listener if it is still present
    if (particle.bucketRemovalListener) {
      particle.userControlledProperty.unlink(particle.bucketRemovalListener);
      delete particle.bucketRemovalListener;
    }

    // redo the layout of the particles if enabled
    if (!skipLayout) {
      this.relayoutBucketParticles();
    }
  }
  containsParticle(particle) {
    return this._particles.includes(particle);
  }

  /**
   * extract the particle that is closest to the provided position from the bucket
   */
  extractClosestParticle(position) {
    let closestParticle = null;
    this._particles.forEach(particle => {
      if (closestParticle === null || closestParticle.positionProperty.get().distance(position) > particle.positionProperty.get().distance(position)) {
        closestParticle = particle;
      }
    });
    const closestParticleValue = closestParticle;
    if (closestParticleValue !== null) {
      // The particle is removed by setting 'userControlled' to true.  This relies on the listener that was added when
      // the particle was placed into the bucket.
      closestParticleValue.userControlledProperty.set(true);
    }
    return closestParticle;
  }

  /**
   * get the list of particles currently contained within this bucket
   */
  getParticleList() {
    return this._particles;
  }
  reset() {
    this._particles.forEach(particle => {
      // Remove listeners that are watching for removal from bucket.
      if (typeof particle.bucketRemovalListener === 'function') {
        particle.userControlledProperty.unlink(particle.bucketRemovalListener);
        delete particle.bucketRemovalListener;
      }
    });
    cleanArray(this._particles);
  }

  /**
   * check if the provided position is open, i.e. unoccupied by a particle
   */
  isPositionOpen(position) {
    let positionOpen = true;
    for (let i = 0; i < this._particles.length; i++) {
      const particle = this._particles[i];
      if (particle.destinationProperty.get().equals(position)) {
        positionOpen = false;
        break;
      }
    }
    return positionOpen;
  }

  /**
   * Find the first open position in the stacking order, which is a triangular stack starting from the lower left.
   */
  getFirstOpenPosition() {
    let openPosition = Vector2.ZERO;
    const usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
    let offsetFromBucketEdge = (this.size.width - usableWidth) / 2 + this._sphereRadius;
    let numParticlesInLayer = Math.floor(usableWidth / (this._sphereRadius * 2));
    let row = 0;
    let positionInLayer = 0;
    let found = false;
    while (!found) {
      const testPosition = new Vector2(this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius, this.getYPositionForLayer(row));
      if (this.isPositionOpen(testPosition)) {
        // We found a position that is open.
        openPosition = testPosition;
        found = true;
      } else {
        positionInLayer++;
        if (positionInLayer >= numParticlesInLayer) {
          // Move to the next layer.
          row++;
          positionInLayer = 0;
          numParticlesInLayer--;
          offsetFromBucketEdge += this._sphereRadius;
          if (numParticlesInLayer === 0) {
            // This algorithm doesn't handle the situation where
            // more particles are added than can be stacked into
            // a pyramid of the needed size, but so far it hasn't
            // needed to.  If this requirement changes, the
            // algorithm will need to change too.
            numParticlesInLayer = 1;
            offsetFromBucketEdge -= this._sphereRadius;
          }
        }
      }
    }
    return openPosition;
  }

  /**
   * get the layer in the stacking order for the provided y (vertical) position
   */
  getLayerForYPosition(yPosition) {
    return Math.abs(Utils.roundSymmetric((yPosition - (this.position.y + this._verticalParticleOffset)) / (this._sphereRadius * 2 * 0.866)));
  }

  /**
   * Get the nearest open position in the stacking order that would be supported if the particle were to be placed
   * there.  This is used for particle stacking.
   */
  getNearestOpenPosition(position) {
    // Determine the highest occupied layer.  The bottom layer is 0.
    let highestOccupiedLayer = 0;
    _.each(this._particles, particle => {
      const layer = this.getLayerForYPosition(particle.destinationProperty.get().y);
      if (layer > highestOccupiedLayer) {
        highestOccupiedLayer = layer;
      }
    });

    // Make a list of all open positions in the occupied layers.
    const openPositions = [];
    const usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
    let offsetFromBucketEdge = (this.size.width - usableWidth) / 2 + this._sphereRadius;
    let numParticlesInLayer = Math.floor(usableWidth / (this._sphereRadius * 2));

    // Loop, searching for open positions in the particle stack.
    for (let layer = 0; layer <= highestOccupiedLayer + 1; layer++) {
      // Add all open positions in the current layer.
      for (let positionInLayer = 0; positionInLayer < numParticlesInLayer; positionInLayer++) {
        const testPosition = new Vector2(this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius, this.getYPositionForLayer(layer));
        if (this.isPositionOpen(testPosition)) {
          // We found a position that is unoccupied.
          if (layer === 0 || this.countSupportingParticles(testPosition) === 2) {
            // This is a valid open position.
            openPositions.push(testPosition);
          }
        }
      }

      // Adjust variables for the next layer.
      numParticlesInLayer--;
      offsetFromBucketEdge += this._sphereRadius;
      if (numParticlesInLayer === 0) {
        // If the stacking pyramid is full, meaning that there are no positions that are open within it, this algorithm
        // classifies the positions directly above the top of the pyramid as being open.  This would result in a stack
        // of particles with a pyramid base.  So far, this hasn't been a problem, but this limitation may limit
        // reusability of this algorithm.
        numParticlesInLayer = 1;
        offsetFromBucketEdge -= this._sphereRadius;
      }
    }

    // Find the closest open position to the provided current position.
    // Only the X-component is used for this determination, because if
    // the Y-component is used the particles often appear to fall sideways
    // when released above the bucket, which just looks weird.
    let closestOpenPosition = openPositions[0] || Vector2.ZERO;
    _.each(openPositions, openPosition => {
      if (openPosition.distance(position) < closestOpenPosition.distance(position)) {
        // This openPosition is closer.
        closestOpenPosition = openPosition;
      }
    });
    return closestOpenPosition;
  }

  /**
   * given a layer in the stack, calculate the corresponding Y position for a particle in that layer
   */
  getYPositionForLayer(layer) {
    return this.position.y + this._verticalParticleOffset + layer * this._sphereRadius * 2 * 0.866;
  }

  /**
   * Determine whether a particle is 'dangling', i.e. hanging above an open space in the stack of particles.  Dangling
   * particles should be made to fall to a stable position.
   */
  isDangling(particle) {
    const onBottomRow = particle.destinationProperty.get().y === this.position.y + this._verticalParticleOffset;
    return !onBottomRow && this.countSupportingParticles(particle.destinationProperty.get()) < 2;
  }

  /**
   * count the number of particles that are positioned to support a particle in the provided position
   * @returns - a number from 0 to 2, inclusive
   */
  countSupportingParticles(position) {
    let count = 0;
    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];
      if (p.destinationProperty.get().y < position.y &&
      // Must be in a lower layer
      p.destinationProperty.get().distance(position) < this._sphereRadius * 3) {
        // Must be a supporting particle.
        count++;
      }
    }
    return count;
  }

  /**
   * Relayout the particles, generally done after a particle is removed and some other need to fall.
   */
  relayoutBucketParticles() {
    let particleMoved;
    do {
      for (let i = 0; i < this._particles.length; i++) {
        particleMoved = false;
        const particle = this._particles[i];
        if (this.isDangling(particle)) {
          particle.destinationProperty.set(this.getNearestOpenPosition(particle.destinationProperty.get()));
          particleMoved = true;
          break;
        }
      }
    } while (particleMoved);
  }
  static SphereBucketIO = new IOType('SphereBucketIO', {
    valueType: SphereBucket,
    documentation: 'A model of a bucket into which spherical objects can be placed.',
    stateSchema: {
      particles: ReferenceObjectArrayIO
    },
    toStateObject: sphereBucket => {
      return {
        particles: ReferenceObjectArrayIO.toStateObject(sphereBucket._particles)
      };
    },
    applyState: (sphereBucket, stateObject) => {
      // remove all the particles from the observable arrays
      sphereBucket.reset();
      const particles = ReferenceObjectArrayIO.fromStateObject(stateObject.particles);

      // add back the particles
      particles.forEach(particle => {
        sphereBucket.addParticle(particle);
      });
    }
  });
}
phetcommon.register('SphereBucket', SphereBucket);
export default SphereBucket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJjbGVhbkFycmF5IiwiVGFuZGVtIiwiQXJyYXlJTyIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwicGhldGNvbW1vbiIsIkJ1Y2tldCIsIm9wdGlvbml6ZSIsIlJlZmVyZW5jZU9iamVjdEFycmF5SU8iLCJPYmplY3RJTyIsIlNwaGVyZUJ1Y2tldCIsIl9wYXJ0aWNsZXMiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzcGhlcmVSYWRpdXMiLCJ1c2FibGVXaWR0aFByb3BvcnRpb24iLCJ0YW5kZW0iLCJPUFRJT05BTCIsInBoZXRpb1R5cGUiLCJTcGhlcmVCdWNrZXRJTyIsInZlcnRpY2FsUGFydGljbGVPZmZzZXQiLCJzcGhlcmVCdWNrZXRUYW5kZW0iLCJfc3BoZXJlUmFkaXVzIiwiX3VzYWJsZVdpZHRoUHJvcG9ydGlvbiIsIl92ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0IiwiYWRkUGFydGljbGVGaXJzdE9wZW4iLCJwYXJ0aWNsZSIsImFuaW1hdGUiLCJkZXN0aW5hdGlvblByb3BlcnR5Iiwic2V0IiwiZ2V0Rmlyc3RPcGVuUG9zaXRpb24iLCJhZGRQYXJ0aWNsZSIsImFkZFBhcnRpY2xlTmVhcmVzdE9wZW4iLCJnZXROZWFyZXN0T3BlblBvc2l0aW9uIiwiZ2V0IiwicG9zaXRpb25Qcm9wZXJ0eSIsInB1c2giLCJwYXJ0aWNsZVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZVBhcnRpY2xlIiwiYXNzZXJ0IiwiYnVja2V0UmVtb3ZhbExpc3RlbmVyIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImxhenlMaW5rIiwic2tpcExheW91dCIsImNvbnRhaW5zUGFydGljbGUiLCJfIiwid2l0aG91dCIsInVubGluayIsInJlbGF5b3V0QnVja2V0UGFydGljbGVzIiwiaW5jbHVkZXMiLCJleHRyYWN0Q2xvc2VzdFBhcnRpY2xlIiwicG9zaXRpb24iLCJjbG9zZXN0UGFydGljbGUiLCJmb3JFYWNoIiwiZGlzdGFuY2UiLCJjbG9zZXN0UGFydGljbGVWYWx1ZSIsImdldFBhcnRpY2xlTGlzdCIsInJlc2V0IiwiaXNQb3NpdGlvbk9wZW4iLCJwb3NpdGlvbk9wZW4iLCJpIiwibGVuZ3RoIiwiZXF1YWxzIiwib3BlblBvc2l0aW9uIiwiWkVSTyIsInVzYWJsZVdpZHRoIiwic2l6ZSIsIndpZHRoIiwib2Zmc2V0RnJvbUJ1Y2tldEVkZ2UiLCJudW1QYXJ0aWNsZXNJbkxheWVyIiwiTWF0aCIsImZsb29yIiwicm93IiwicG9zaXRpb25JbkxheWVyIiwiZm91bmQiLCJ0ZXN0UG9zaXRpb24iLCJ4IiwiZ2V0WVBvc2l0aW9uRm9yTGF5ZXIiLCJnZXRMYXllckZvcllQb3NpdGlvbiIsInlQb3NpdGlvbiIsImFicyIsInJvdW5kU3ltbWV0cmljIiwieSIsImhpZ2hlc3RPY2N1cGllZExheWVyIiwiZWFjaCIsImxheWVyIiwib3BlblBvc2l0aW9ucyIsImNvdW50U3VwcG9ydGluZ1BhcnRpY2xlcyIsImNsb3Nlc3RPcGVuUG9zaXRpb24iLCJpc0RhbmdsaW5nIiwib25Cb3R0b21Sb3ciLCJjb3VudCIsInAiLCJwYXJ0aWNsZU1vdmVkIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInN0YXRlU2NoZW1hIiwicGFydGljbGVzIiwidG9TdGF0ZU9iamVjdCIsInNwaGVyZUJ1Y2tldCIsImFwcGx5U3RhdGUiLCJzdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3BoZXJlQnVja2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNwaGVyZUJ1Y2tldCBpcyBhIG1vZGVsIG9mIGEgYnVja2V0IHRoYXQgY2FuIGJlIHVzZWQgdG8gc3RvcmUgc3BoZXJpY2FsIG9iamVjdHMuICBJdCBtYW5hZ2VzIHRoZSBhZGRpdGlvbiBhbmQgcmVtb3ZhbFxyXG4gKiBvZiB0aGUgc3BoZXJlcywgc3RhY2tzIHRoZW0gYXMgdGhleSBhcmUgYWRkZWQsIGFuZCBtYW5hZ2VzIHRoZSBzdGFjayBhcyBzcGhlcmVzIGFyZSByZW1vdmVkLlxyXG4gKlxyXG4gKiBUaGlzIGV4cGVjdHMgdGhlIHNwaGVyZXMgdG8gaGF2ZSBjZXJ0YWluIHByb3BlcnRpZXMsIHBsZWFzZSBpbnNwZWN0IHRoZSBjb2RlIHRvIHVuZGVyc3RhbmQgdGhlICdjb250cmFjdCcgYmV0d2VlbiB0aGVcclxuICogYnVja2V0IGFuZCB0aGUgc3BoZXJlcy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IHBoZXRjb21tb24gZnJvbSAnLi4vcGhldGNvbW1vbi5qcyc7XHJcbmltcG9ydCBCdWNrZXQsIHsgQnVja2V0T3B0aW9ucyB9IGZyb20gJy4vQnVja2V0LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4uLy4uLy4uL3NocmVkL2pzL21vZGVsL1BhcnRpY2xlLmpzJztcclxuXHJcbnR5cGUgUGFydGljbGVXaXRoQnVja2V0UmVtb3ZhbExpc3RlbmVyID0gUGFydGljbGUgJiB7IGJ1Y2tldFJlbW92YWxMaXN0ZW5lcj86ICgpID0+IHZvaWQgfTtcclxuXHJcbmNvbnN0IFJlZmVyZW5jZU9iamVjdEFycmF5SU8gPSBBcnJheUlPKCBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPICkgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgc3BoZXJlUmFkaXVzPzogbnVtYmVyO1xyXG4gIHVzYWJsZVdpZHRoUHJvcG9ydGlvbj86IG51bWJlcjtcclxuICB2ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0PzogbnVtYmVyIHwgbnVsbDtcclxufTtcclxudHlwZSBTcGhlcmVCdWNrZXRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBCdWNrZXRPcHRpb25zO1xyXG5cclxuY2xhc3MgU3BoZXJlQnVja2V0IGV4dGVuZHMgQnVja2V0IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzcGhlcmVCdWNrZXRUYW5kZW06IFRhbmRlbTtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9zcGhlcmVSYWRpdXM6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF91c2FibGVXaWR0aFByb3BvcnRpb246IG51bWJlcjtcclxuXHJcbiAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCwgZm9yIHBvc2l0aW9uaW5nIHBhcnRpY2xlcyBpbnNpZGUgdGhlIGJ1Y2tldFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3ZlcnRpY2FsUGFydGljbGVPZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgLy8gcGFydGljbGVzIG1hbmFnZWQgYnkgdGhpcyBidWNrZXRcclxuICBwcml2YXRlIF9wYXJ0aWNsZXM6IFBhcnRpY2xlV2l0aEJ1Y2tldFJlbW92YWxMaXN0ZW5lcltdID0gW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogU3BoZXJlQnVja2V0T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNwaGVyZUJ1Y2tldE9wdGlvbnMsIFNlbGZPcHRpb25zLCBCdWNrZXRPcHRpb25zPigpKCB7XHJcbiAgICAgIHNwaGVyZVJhZGl1czogMTAsICAvLyBleHBlY3RlZCByYWRpdXMgb2YgdGhlIHNwaGVyZXMgdGhhdCB3aWxsIGJlIHBsYWNlZCBpbiB0aGlzIGJ1Y2tldFxyXG4gICAgICB1c2FibGVXaWR0aFByb3BvcnRpb246IDEuMCwgIC8vIHByb3BvcnRpb24gb2YgdGhlIGJ1Y2tldCB3aWR0aCB0aGF0IHRoZSBzcGhlcmVzIGNhbiBvY2N1cHlcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUwsXHJcbiAgICAgIHBoZXRpb1R5cGU6IFNwaGVyZUJ1Y2tldC5TcGhlcmVCdWNrZXRJTyxcclxuICAgICAgdmVydGljYWxQYXJ0aWNsZU9mZnNldDogbnVsbFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnNwaGVyZUJ1Y2tldFRhbmRlbSA9IG9wdGlvbnMudGFuZGVtO1xyXG4gICAgdGhpcy5fc3BoZXJlUmFkaXVzID0gb3B0aW9ucy5zcGhlcmVSYWRpdXM7XHJcbiAgICB0aGlzLl91c2FibGVXaWR0aFByb3BvcnRpb24gPSBvcHRpb25zLnVzYWJsZVdpZHRoUHJvcG9ydGlvbjtcclxuXHJcbiAgICB0aGlzLl92ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0ID0gb3B0aW9ucy52ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0ID09PSBudWxsID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtdGhpcy5fc3BoZXJlUmFkaXVzICogMC40IDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRpY2FsUGFydGljbGVPZmZzZXQ7XHJcblxyXG4gICAgdGhpcy5fcGFydGljbGVzID0gW107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgYSBwYXJ0aWNsZSB0byB0aGUgZmlyc3Qgb3BlbiBwb3NpdGlvbiBpbiB0aGUgc3RhY2tpbmcgb3JkZXJcclxuICAgKi9cclxuICBwdWJsaWMgYWRkUGFydGljbGVGaXJzdE9wZW4oIHBhcnRpY2xlOiBQYXJ0aWNsZSwgYW5pbWF0ZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCB0aGlzLmdldEZpcnN0T3BlblBvc2l0aW9uKCkgKTtcclxuICAgIHRoaXMuYWRkUGFydGljbGUoIHBhcnRpY2xlLCBhbmltYXRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgYSBwYXJ0aWNsZSB0byB0aGUgbmVhcmVzdCBvcGVuIHBvc2l0aW9uIGluIHRoZSBwYXJ0aWNsZSBzdGFja1xyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRQYXJ0aWNsZU5lYXJlc3RPcGVuKCBwYXJ0aWNsZTogUGFydGljbGUsIGFuaW1hdGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LnNldCggdGhpcy5nZXROZWFyZXN0T3BlblBvc2l0aW9uKCBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpICkgKTtcclxuICAgIHRoaXMuYWRkUGFydGljbGUoIHBhcnRpY2xlLCBhbmltYXRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgYSBwYXJ0aWNsZSB0byB0aGUgYnVja2V0IGFuZCBzZXQgdXAgbGlzdGVuZXJzIGZvciB3aGVuIHRoZSBwYXJ0aWNsZSBpcyByZW1vdmVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhZGRQYXJ0aWNsZSggcGFydGljbGU6IFBhcnRpY2xlV2l0aEJ1Y2tldFJlbW92YWxMaXN0ZW5lciwgYW5pbWF0ZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIGlmICggIWFuaW1hdGUgKSB7XHJcbiAgICAgIHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9wYXJ0aWNsZXMucHVzaCggcGFydGljbGUgKTtcclxuXHJcbiAgICAvLyBhZGQgYSBsaXN0ZW5lciB0aGF0IHdpbGwgcmVtb3ZlIHRoaXMgcGFydGljbGUgZnJvbSB0aGUgYnVja2V0IGlmIHRoZSB1c2VyIGdyYWJzIGl0XHJcbiAgICBjb25zdCBwYXJ0aWNsZVJlbW92ZWRMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNsZSggcGFydGljbGUgKTtcclxuXHJcbiAgICAgIC8vIHRoZSBwcm9jZXNzIG9mIHJlbW92aW5nIHRoZSBwYXJ0aWNsZSBmcm9tIHRoZSBidWNrZXQgc2hvdWxkIGFsc28gZGlzY29ubmVjdCByZW1vdmFsIGxpc3RlbmVyXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFwYXJ0aWNsZS5idWNrZXRSZW1vdmFsTGlzdGVuZXIsICdsaXN0ZW5lciBzdGlsbCBwcmVzZW50IGFmdGVyIGJlaW5nIHJlbW92ZWQgZnJvbSBidWNrZXQnICk7XHJcbiAgICB9O1xyXG4gICAgcGFydGljbGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggcGFydGljbGVSZW1vdmVkTGlzdGVuZXIgKTtcclxuICAgIHBhcnRpY2xlLmJ1Y2tldFJlbW92YWxMaXN0ZW5lciA9IHBhcnRpY2xlUmVtb3ZlZExpc3RlbmVyOyAvLyBBdHRhY2ggdG8gdGhlIHBhcnRpY2xlIHRvIGFpZCB1bmxpbmtpbmcgaW4gc29tZSBjYXNlcy5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlbW92ZSBhIHBhcnRpY2xlIGZyb20gdGhlIGJ1Y2tldCwgdXBkYXRpbmcgbGlzdGVuZXJzIGFzIG5lY2Vzc2FyeVxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVQYXJ0aWNsZSggcGFydGljbGU6IFBhcnRpY2xlV2l0aEJ1Y2tldFJlbW92YWxMaXN0ZW5lciwgc2tpcExheW91dCA9IGZhbHNlICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb250YWluc1BhcnRpY2xlKCBwYXJ0aWNsZSApLCAnYXR0ZW1wdCBtYWRlIHRvIHJlbW92ZSBwYXJ0aWNsZSB0aGF0IGlzIG5vdCBpbiBidWNrZXQnICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoZSBwYXJ0aWNsZSBmcm9tIHRoZSBhcnJheVxyXG4gICAgdGhpcy5fcGFydGljbGVzID0gXy53aXRob3V0KCB0aGlzLl9wYXJ0aWNsZXMsIHBhcnRpY2xlICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoZSByZW1vdmFsIGxpc3RlbmVyIGlmIGl0IGlzIHN0aWxsIHByZXNlbnRcclxuICAgIGlmICggcGFydGljbGUuYnVja2V0UmVtb3ZhbExpc3RlbmVyICkge1xyXG4gICAgICBwYXJ0aWNsZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggcGFydGljbGUuYnVja2V0UmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgIGRlbGV0ZSBwYXJ0aWNsZS5idWNrZXRSZW1vdmFsTGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVkbyB0aGUgbGF5b3V0IG9mIHRoZSBwYXJ0aWNsZXMgaWYgZW5hYmxlZFxyXG4gICAgaWYgKCAhc2tpcExheW91dCApIHtcclxuICAgICAgdGhpcy5yZWxheW91dEJ1Y2tldFBhcnRpY2xlcygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbnRhaW5zUGFydGljbGUoIHBhcnRpY2xlOiBQYXJ0aWNsZSApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXJ0aWNsZXMuaW5jbHVkZXMoIHBhcnRpY2xlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBleHRyYWN0IHRoZSBwYXJ0aWNsZSB0aGF0IGlzIGNsb3Nlc3QgdG8gdGhlIHByb3ZpZGVkIHBvc2l0aW9uIGZyb20gdGhlIGJ1Y2tldFxyXG4gICAqL1xyXG4gIHB1YmxpYyBleHRyYWN0Q2xvc2VzdFBhcnRpY2xlKCBwb3NpdGlvbjogVmVjdG9yMiApOiBQYXJ0aWNsZSB8IG51bGwge1xyXG4gICAgbGV0IGNsb3Nlc3RQYXJ0aWNsZTogUGFydGljbGUgfCBudWxsID0gbnVsbDtcclxuICAgIHRoaXMuX3BhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcbiAgICAgIGlmICggY2xvc2VzdFBhcnRpY2xlID09PSBudWxsIHx8XHJcbiAgICAgICAgICAgY2xvc2VzdFBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHBvc2l0aW9uICkgPiBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBwb3NpdGlvbiApICkge1xyXG4gICAgICAgIGNsb3Nlc3RQYXJ0aWNsZSA9IHBhcnRpY2xlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2xvc2VzdFBhcnRpY2xlVmFsdWUgPSBjbG9zZXN0UGFydGljbGUgYXMgUGFydGljbGUgfCBudWxsO1xyXG4gICAgaWYgKCBjbG9zZXN0UGFydGljbGVWYWx1ZSAhPT0gbnVsbCApIHtcclxuXHJcbiAgICAgIC8vIFRoZSBwYXJ0aWNsZSBpcyByZW1vdmVkIGJ5IHNldHRpbmcgJ3VzZXJDb250cm9sbGVkJyB0byB0cnVlLiAgVGhpcyByZWxpZXMgb24gdGhlIGxpc3RlbmVyIHRoYXQgd2FzIGFkZGVkIHdoZW5cclxuICAgICAgLy8gdGhlIHBhcnRpY2xlIHdhcyBwbGFjZWQgaW50byB0aGUgYnVja2V0LlxyXG4gICAgICBjbG9zZXN0UGFydGljbGVWYWx1ZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNsb3Nlc3RQYXJ0aWNsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgbGlzdCBvZiBwYXJ0aWNsZXMgY3VycmVudGx5IGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBidWNrZXRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UGFydGljbGVMaXN0KCk6IFBhcnRpY2xlW10geyByZXR1cm4gdGhpcy5fcGFydGljbGVzOyB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuX3BhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgbGlzdGVuZXJzIHRoYXQgYXJlIHdhdGNoaW5nIGZvciByZW1vdmFsIGZyb20gYnVja2V0LlxyXG4gICAgICBpZiAoIHR5cGVvZiAoIHBhcnRpY2xlLmJ1Y2tldFJlbW92YWxMaXN0ZW5lciApID09PSAnZnVuY3Rpb24nICkge1xyXG4gICAgICAgIHBhcnRpY2xlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCBwYXJ0aWNsZS5idWNrZXRSZW1vdmFsTGlzdGVuZXIgKTtcclxuICAgICAgICBkZWxldGUgcGFydGljbGUuYnVja2V0UmVtb3ZhbExpc3RlbmVyO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLl9wYXJ0aWNsZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNoZWNrIGlmIHRoZSBwcm92aWRlZCBwb3NpdGlvbiBpcyBvcGVuLCBpLmUuIHVub2NjdXBpZWQgYnkgYSBwYXJ0aWNsZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNQb3NpdGlvbk9wZW4oIHBvc2l0aW9uOiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgbGV0IHBvc2l0aW9uT3BlbiA9IHRydWU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJ0aWNsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlID0gdGhpcy5fcGFydGljbGVzWyBpIF07XHJcbiAgICAgIGlmICggcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKS5lcXVhbHMoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgcG9zaXRpb25PcGVuID0gZmFsc2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwb3NpdGlvbk9wZW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHRoZSBmaXJzdCBvcGVuIHBvc2l0aW9uIGluIHRoZSBzdGFja2luZyBvcmRlciwgd2hpY2ggaXMgYSB0cmlhbmd1bGFyIHN0YWNrIHN0YXJ0aW5nIGZyb20gdGhlIGxvd2VyIGxlZnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRGaXJzdE9wZW5Qb3NpdGlvbigpOiBWZWN0b3IyIHtcclxuICAgIGxldCBvcGVuUG9zaXRpb24gPSBWZWN0b3IyLlpFUk87XHJcbiAgICBjb25zdCB1c2FibGVXaWR0aCA9IHRoaXMuc2l6ZS53aWR0aCAqIHRoaXMuX3VzYWJsZVdpZHRoUHJvcG9ydGlvbiAtIDIgKiB0aGlzLl9zcGhlcmVSYWRpdXM7XHJcbiAgICBsZXQgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgPSAoIHRoaXMuc2l6ZS53aWR0aCAtIHVzYWJsZVdpZHRoICkgLyAyICsgdGhpcy5fc3BoZXJlUmFkaXVzO1xyXG4gICAgbGV0IG51bVBhcnRpY2xlc0luTGF5ZXIgPSBNYXRoLmZsb29yKCB1c2FibGVXaWR0aCAvICggdGhpcy5fc3BoZXJlUmFkaXVzICogMiApICk7XHJcbiAgICBsZXQgcm93ID0gMDtcclxuICAgIGxldCBwb3NpdGlvbkluTGF5ZXIgPSAwO1xyXG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoICFmb3VuZCApIHtcclxuICAgICAgY29uc3QgdGVzdFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5zaXplLndpZHRoIC8gMiArIG9mZnNldEZyb21CdWNrZXRFZGdlICsgcG9zaXRpb25JbkxheWVyICogMiAqIHRoaXMuX3NwaGVyZVJhZGl1cyxcclxuICAgICAgICB0aGlzLmdldFlQb3NpdGlvbkZvckxheWVyKCByb3cgKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAoIHRoaXMuaXNQb3NpdGlvbk9wZW4oIHRlc3RQb3NpdGlvbiApICkge1xyXG5cclxuICAgICAgICAvLyBXZSBmb3VuZCBhIHBvc2l0aW9uIHRoYXQgaXMgb3Blbi5cclxuICAgICAgICBvcGVuUG9zaXRpb24gPSB0ZXN0UG9zaXRpb247XHJcbiAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHBvc2l0aW9uSW5MYXllcisrO1xyXG4gICAgICAgIGlmICggcG9zaXRpb25JbkxheWVyID49IG51bVBhcnRpY2xlc0luTGF5ZXIgKSB7XHJcbiAgICAgICAgICAvLyBNb3ZlIHRvIHRoZSBuZXh0IGxheWVyLlxyXG4gICAgICAgICAgcm93Kys7XHJcbiAgICAgICAgICBwb3NpdGlvbkluTGF5ZXIgPSAwO1xyXG4gICAgICAgICAgbnVtUGFydGljbGVzSW5MYXllci0tO1xyXG4gICAgICAgICAgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgKz0gdGhpcy5fc3BoZXJlUmFkaXVzO1xyXG4gICAgICAgICAgaWYgKCBudW1QYXJ0aWNsZXNJbkxheWVyID09PSAwICkge1xyXG4gICAgICAgICAgICAvLyBUaGlzIGFsZ29yaXRobSBkb2Vzbid0IGhhbmRsZSB0aGUgc2l0dWF0aW9uIHdoZXJlXHJcbiAgICAgICAgICAgIC8vIG1vcmUgcGFydGljbGVzIGFyZSBhZGRlZCB0aGFuIGNhbiBiZSBzdGFja2VkIGludG9cclxuICAgICAgICAgICAgLy8gYSBweXJhbWlkIG9mIHRoZSBuZWVkZWQgc2l6ZSwgYnV0IHNvIGZhciBpdCBoYXNuJ3RcclxuICAgICAgICAgICAgLy8gbmVlZGVkIHRvLiAgSWYgdGhpcyByZXF1aXJlbWVudCBjaGFuZ2VzLCB0aGVcclxuICAgICAgICAgICAgLy8gYWxnb3JpdGhtIHdpbGwgbmVlZCB0byBjaGFuZ2UgdG9vLlxyXG4gICAgICAgICAgICBudW1QYXJ0aWNsZXNJbkxheWVyID0gMTtcclxuICAgICAgICAgICAgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgLT0gdGhpcy5fc3BoZXJlUmFkaXVzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9wZW5Qb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgbGF5ZXIgaW4gdGhlIHN0YWNraW5nIG9yZGVyIGZvciB0aGUgcHJvdmlkZWQgeSAodmVydGljYWwpIHBvc2l0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRMYXllckZvcllQb3NpdGlvbiggeVBvc2l0aW9uOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLmFicyggVXRpbHMucm91bmRTeW1tZXRyaWMoICggeVBvc2l0aW9uIC0gKCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLl92ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0ICkgKSAvICggdGhpcy5fc3BoZXJlUmFkaXVzICogMiAqIDAuODY2ICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBuZWFyZXN0IG9wZW4gcG9zaXRpb24gaW4gdGhlIHN0YWNraW5nIG9yZGVyIHRoYXQgd291bGQgYmUgc3VwcG9ydGVkIGlmIHRoZSBwYXJ0aWNsZSB3ZXJlIHRvIGJlIHBsYWNlZFxyXG4gICAqIHRoZXJlLiAgVGhpcyBpcyB1c2VkIGZvciBwYXJ0aWNsZSBzdGFja2luZy5cclxuICAgKi9cclxuICBwcml2YXRlIGdldE5lYXJlc3RPcGVuUG9zaXRpb24oIHBvc2l0aW9uOiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG5cclxuICAgIC8vIERldGVybWluZSB0aGUgaGlnaGVzdCBvY2N1cGllZCBsYXllci4gIFRoZSBib3R0b20gbGF5ZXIgaXMgMC5cclxuICAgIGxldCBoaWdoZXN0T2NjdXBpZWRMYXllciA9IDA7XHJcbiAgICBfLmVhY2goIHRoaXMuX3BhcnRpY2xlcywgcGFydGljbGUgPT4ge1xyXG4gICAgICBjb25zdCBsYXllciA9IHRoaXMuZ2V0TGF5ZXJGb3JZUG9zaXRpb24oIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkueSApO1xyXG4gICAgICBpZiAoIGxheWVyID4gaGlnaGVzdE9jY3VwaWVkTGF5ZXIgKSB7XHJcbiAgICAgICAgaGlnaGVzdE9jY3VwaWVkTGF5ZXIgPSBsYXllcjtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1ha2UgYSBsaXN0IG9mIGFsbCBvcGVuIHBvc2l0aW9ucyBpbiB0aGUgb2NjdXBpZWQgbGF5ZXJzLlxyXG4gICAgY29uc3Qgb3BlblBvc2l0aW9ucyA9IFtdO1xyXG4gICAgY29uc3QgdXNhYmxlV2lkdGggPSB0aGlzLnNpemUud2lkdGggKiB0aGlzLl91c2FibGVXaWR0aFByb3BvcnRpb24gLSAyICogdGhpcy5fc3BoZXJlUmFkaXVzO1xyXG4gICAgbGV0IG9mZnNldEZyb21CdWNrZXRFZGdlID0gKCB0aGlzLnNpemUud2lkdGggLSB1c2FibGVXaWR0aCApIC8gMiArIHRoaXMuX3NwaGVyZVJhZGl1cztcclxuICAgIGxldCBudW1QYXJ0aWNsZXNJbkxheWVyID0gTWF0aC5mbG9vciggdXNhYmxlV2lkdGggLyAoIHRoaXMuX3NwaGVyZVJhZGl1cyAqIDIgKSApO1xyXG5cclxuICAgIC8vIExvb3AsIHNlYXJjaGluZyBmb3Igb3BlbiBwb3NpdGlvbnMgaW4gdGhlIHBhcnRpY2xlIHN0YWNrLlxyXG4gICAgZm9yICggbGV0IGxheWVyID0gMDsgbGF5ZXIgPD0gaGlnaGVzdE9jY3VwaWVkTGF5ZXIgKyAxOyBsYXllcisrICkge1xyXG5cclxuICAgICAgLy8gQWRkIGFsbCBvcGVuIHBvc2l0aW9ucyBpbiB0aGUgY3VycmVudCBsYXllci5cclxuICAgICAgZm9yICggbGV0IHBvc2l0aW9uSW5MYXllciA9IDA7IHBvc2l0aW9uSW5MYXllciA8IG51bVBhcnRpY2xlc0luTGF5ZXI7IHBvc2l0aW9uSW5MYXllcisrICkge1xyXG4gICAgICAgIGNvbnN0IHRlc3RQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnNpemUud2lkdGggLyAyICsgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgKyBwb3NpdGlvbkluTGF5ZXIgKiAyICogdGhpcy5fc3BoZXJlUmFkaXVzLFxyXG4gICAgICAgICAgdGhpcy5nZXRZUG9zaXRpb25Gb3JMYXllciggbGF5ZXIgKSApO1xyXG4gICAgICAgIGlmICggdGhpcy5pc1Bvc2l0aW9uT3BlbiggdGVzdFBvc2l0aW9uICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gV2UgZm91bmQgYSBwb3NpdGlvbiB0aGF0IGlzIHVub2NjdXBpZWQuXHJcbiAgICAgICAgICBpZiAoIGxheWVyID09PSAwIHx8IHRoaXMuY291bnRTdXBwb3J0aW5nUGFydGljbGVzKCB0ZXN0UG9zaXRpb24gKSA9PT0gMiApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYSB2YWxpZCBvcGVuIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBvcGVuUG9zaXRpb25zLnB1c2goIHRlc3RQb3NpdGlvbiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQWRqdXN0IHZhcmlhYmxlcyBmb3IgdGhlIG5leHQgbGF5ZXIuXHJcbiAgICAgIG51bVBhcnRpY2xlc0luTGF5ZXItLTtcclxuICAgICAgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgKz0gdGhpcy5fc3BoZXJlUmFkaXVzO1xyXG4gICAgICBpZiAoIG51bVBhcnRpY2xlc0luTGF5ZXIgPT09IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBzdGFja2luZyBweXJhbWlkIGlzIGZ1bGwsIG1lYW5pbmcgdGhhdCB0aGVyZSBhcmUgbm8gcG9zaXRpb25zIHRoYXQgYXJlIG9wZW4gd2l0aGluIGl0LCB0aGlzIGFsZ29yaXRobVxyXG4gICAgICAgIC8vIGNsYXNzaWZpZXMgdGhlIHBvc2l0aW9ucyBkaXJlY3RseSBhYm92ZSB0aGUgdG9wIG9mIHRoZSBweXJhbWlkIGFzIGJlaW5nIG9wZW4uICBUaGlzIHdvdWxkIHJlc3VsdCBpbiBhIHN0YWNrXHJcbiAgICAgICAgLy8gb2YgcGFydGljbGVzIHdpdGggYSBweXJhbWlkIGJhc2UuICBTbyBmYXIsIHRoaXMgaGFzbid0IGJlZW4gYSBwcm9ibGVtLCBidXQgdGhpcyBsaW1pdGF0aW9uIG1heSBsaW1pdFxyXG4gICAgICAgIC8vIHJldXNhYmlsaXR5IG9mIHRoaXMgYWxnb3JpdGhtLlxyXG4gICAgICAgIG51bVBhcnRpY2xlc0luTGF5ZXIgPSAxO1xyXG4gICAgICAgIG9mZnNldEZyb21CdWNrZXRFZGdlIC09IHRoaXMuX3NwaGVyZVJhZGl1cztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbmQgdGhlIGNsb3Nlc3Qgb3BlbiBwb3NpdGlvbiB0byB0aGUgcHJvdmlkZWQgY3VycmVudCBwb3NpdGlvbi5cclxuICAgIC8vIE9ubHkgdGhlIFgtY29tcG9uZW50IGlzIHVzZWQgZm9yIHRoaXMgZGV0ZXJtaW5hdGlvbiwgYmVjYXVzZSBpZlxyXG4gICAgLy8gdGhlIFktY29tcG9uZW50IGlzIHVzZWQgdGhlIHBhcnRpY2xlcyBvZnRlbiBhcHBlYXIgdG8gZmFsbCBzaWRld2F5c1xyXG4gICAgLy8gd2hlbiByZWxlYXNlZCBhYm92ZSB0aGUgYnVja2V0LCB3aGljaCBqdXN0IGxvb2tzIHdlaXJkLlxyXG4gICAgbGV0IGNsb3Nlc3RPcGVuUG9zaXRpb24gPSBvcGVuUG9zaXRpb25zWyAwIF0gfHwgVmVjdG9yMi5aRVJPO1xyXG5cclxuICAgIF8uZWFjaCggb3BlblBvc2l0aW9ucywgb3BlblBvc2l0aW9uID0+IHtcclxuICAgICAgaWYgKCBvcGVuUG9zaXRpb24uZGlzdGFuY2UoIHBvc2l0aW9uICkgPCBjbG9zZXN0T3BlblBvc2l0aW9uLmRpc3RhbmNlKCBwb3NpdGlvbiApICkge1xyXG4gICAgICAgIC8vIFRoaXMgb3BlblBvc2l0aW9uIGlzIGNsb3Nlci5cclxuICAgICAgICBjbG9zZXN0T3BlblBvc2l0aW9uID0gb3BlblBvc2l0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gY2xvc2VzdE9wZW5Qb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdpdmVuIGEgbGF5ZXIgaW4gdGhlIHN0YWNrLCBjYWxjdWxhdGUgdGhlIGNvcnJlc3BvbmRpbmcgWSBwb3NpdGlvbiBmb3IgYSBwYXJ0aWNsZSBpbiB0aGF0IGxheWVyXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRZUG9zaXRpb25Gb3JMYXllciggbGF5ZXI6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueSArIHRoaXMuX3ZlcnRpY2FsUGFydGljbGVPZmZzZXQgKyBsYXllciAqIHRoaXMuX3NwaGVyZVJhZGl1cyAqIDIgKiAwLjg2NjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB3aGV0aGVyIGEgcGFydGljbGUgaXMgJ2RhbmdsaW5nJywgaS5lLiBoYW5naW5nIGFib3ZlIGFuIG9wZW4gc3BhY2UgaW4gdGhlIHN0YWNrIG9mIHBhcnRpY2xlcy4gIERhbmdsaW5nXHJcbiAgICogcGFydGljbGVzIHNob3VsZCBiZSBtYWRlIHRvIGZhbGwgdG8gYSBzdGFibGUgcG9zaXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpc0RhbmdsaW5nKCBwYXJ0aWNsZTogUGFydGljbGUgKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBvbkJvdHRvbVJvdyA9IHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkueSA9PT0gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5fdmVydGljYWxQYXJ0aWNsZU9mZnNldDtcclxuICAgIHJldHVybiAhb25Cb3R0b21Sb3cgJiYgdGhpcy5jb3VudFN1cHBvcnRpbmdQYXJ0aWNsZXMoIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkgKSA8IDI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjb3VudCB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcyB0aGF0IGFyZSBwb3NpdGlvbmVkIHRvIHN1cHBvcnQgYSBwYXJ0aWNsZSBpbiB0aGUgcHJvdmlkZWQgcG9zaXRpb25cclxuICAgKiBAcmV0dXJucyAtIGEgbnVtYmVyIGZyb20gMCB0byAyLCBpbmNsdXNpdmVcclxuICAgKi9cclxuICBwcml2YXRlIGNvdW50U3VwcG9ydGluZ1BhcnRpY2xlcyggcG9zaXRpb246IFZlY3RvcjIgKTogbnVtYmVyIHtcclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJ0aWNsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHAgPSB0aGlzLl9wYXJ0aWNsZXNbIGkgXTtcclxuICAgICAgaWYgKCBwLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkueSA8IHBvc2l0aW9uLnkgJiYgLy8gTXVzdCBiZSBpbiBhIGxvd2VyIGxheWVyXHJcbiAgICAgICAgICAgcC5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBwb3NpdGlvbiApIDwgdGhpcy5fc3BoZXJlUmFkaXVzICogMyApIHtcclxuXHJcbiAgICAgICAgLy8gTXVzdCBiZSBhIHN1cHBvcnRpbmcgcGFydGljbGUuXHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvdW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsYXlvdXQgdGhlIHBhcnRpY2xlcywgZ2VuZXJhbGx5IGRvbmUgYWZ0ZXIgYSBwYXJ0aWNsZSBpcyByZW1vdmVkIGFuZCBzb21lIG90aGVyIG5lZWQgdG8gZmFsbC5cclxuICAgKi9cclxuICBwcml2YXRlIHJlbGF5b3V0QnVja2V0UGFydGljbGVzKCk6IHZvaWQge1xyXG4gICAgbGV0IHBhcnRpY2xlTW92ZWQ7XHJcbiAgICBkbyB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3BhcnRpY2xlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBwYXJ0aWNsZU1vdmVkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgcGFydGljbGUgPSB0aGlzLl9wYXJ0aWNsZXNbIGkgXTtcclxuICAgICAgICBpZiAoIHRoaXMuaXNEYW5nbGluZyggcGFydGljbGUgKSApIHtcclxuICAgICAgICAgIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCB0aGlzLmdldE5lYXJlc3RPcGVuUG9zaXRpb24oIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkgKSApO1xyXG4gICAgICAgICAgcGFydGljbGVNb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gd2hpbGUgKCBwYXJ0aWNsZU1vdmVkICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIFNwaGVyZUJ1Y2tldElPID0gbmV3IElPVHlwZSggJ1NwaGVyZUJ1Y2tldElPJywge1xyXG4gICAgdmFsdWVUeXBlOiBTcGhlcmVCdWNrZXQsXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnQSBtb2RlbCBvZiBhIGJ1Y2tldCBpbnRvIHdoaWNoIHNwaGVyaWNhbCBvYmplY3RzIGNhbiBiZSBwbGFjZWQuJyxcclxuICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgIHBhcnRpY2xlczogUmVmZXJlbmNlT2JqZWN0QXJyYXlJT1xyXG4gICAgfSxcclxuICAgIHRvU3RhdGVPYmplY3Q6IHNwaGVyZUJ1Y2tldCA9PiB7XHJcbiAgICAgIHJldHVybiB7IHBhcnRpY2xlczogUmVmZXJlbmNlT2JqZWN0QXJyYXlJTy50b1N0YXRlT2JqZWN0KCBzcGhlcmVCdWNrZXQuX3BhcnRpY2xlcyApIH07XHJcbiAgICB9LFxyXG4gICAgYXBwbHlTdGF0ZTogKCBzcGhlcmVCdWNrZXQsIHN0YXRlT2JqZWN0ICkgPT4ge1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIGFsbCB0aGUgcGFydGljbGVzIGZyb20gdGhlIG9ic2VydmFibGUgYXJyYXlzXHJcbiAgICAgIHNwaGVyZUJ1Y2tldC5yZXNldCgpO1xyXG5cclxuICAgICAgY29uc3QgcGFydGljbGVzID0gUmVmZXJlbmNlT2JqZWN0QXJyYXlJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LnBhcnRpY2xlcyApO1xyXG5cclxuICAgICAgLy8gYWRkIGJhY2sgdGhlIHBhcnRpY2xlc1xyXG4gICAgICBwYXJ0aWNsZXMuZm9yRWFjaCggcGFydGljbGUgPT4geyBzcGhlcmVCdWNrZXQuYWRkUGFydGljbGUoIHBhcnRpY2xlICk7IH0gKTtcclxuICAgIH1cclxuICB9ICk7XHJcbn1cclxuXHJcbnBoZXRjb21tb24ucmVnaXN0ZXIoICdTcGhlcmVCdWNrZXQnLCBTcGhlcmVCdWNrZXQgKTtcclxuZXhwb3J0IGRlZmF1bHQgU3BoZXJlQnVja2V0OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsT0FBTyxNQUFNLHFDQUFxQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0sb0NBQW9DO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsVUFBVSxNQUFNLGtCQUFrQjtBQUN6QyxPQUFPQyxNQUFNLE1BQXlCLGFBQWE7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUsxRCxNQUFNQyxzQkFBc0IsR0FBR04sT0FBTyxDQUFFRSxXQUFXLENBQUVELE1BQU0sQ0FBQ00sUUFBUyxDQUFFLENBQUM7QUFTeEUsTUFBTUMsWUFBWSxTQUFTSixN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