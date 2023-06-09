// Copyright 2014-2022, University of Colorado Boulder

/**
 * Configuration for setting up a particular GravityAndOrbitsScene, enumerated in SceneFactory.
 * This is an abstract class, and is intended only to be used by sub-types.
 * @abstract
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsClock from './GravityAndOrbitsClock.js';
// constants
const DEFAULT_DT = GravityAndOrbitsClock.DEFAULT_DT;
class ModeConfig {
  // Initial start and end point of the measuring tape

  /**
   * @param zoom
   * @constructor
   */
  constructor(zoom) {
    this.dt = DEFAULT_DT;
    this.zoom = zoom;
  }
  center() {
    const deltaVelocity = this.getTotalMomentum().times(-1.0 / this.getTotalMass());
    const bodies = this.getBodies();
    for (let i = 0; i < bodies.length; i++) {
      bodies[i].vx += deltaVelocity.x;
      bodies[i].vy += deltaVelocity.y;
    }
  }

  /**
   * Compute the total momentum for purposes of centering the camera on the center of momentum frame
   */
  getTotalMomentum() {
    let totalMomentum = new Vector2(0, 0);
    const bodies = this.getBodies();
    for (let i = 0; i < bodies.length; i++) {
      totalMomentum = totalMomentum.plus(bodies[i].getMomentum());
    }
    return totalMomentum;
  }
  getTotalMass() {
    let totalMass = 0.0;
    const bodies = this.getBodies();
    for (let i = 0; i < bodies.length; i++) {
      totalMass += bodies[i].mass;
    }
    return totalMass;
  }
}
gravityAndOrbits.register('ModeConfig', ModeConfig);
export default ModeConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiZ3Jhdml0eUFuZE9yYml0cyIsIkdyYXZpdHlBbmRPcmJpdHNDbG9jayIsIkRFRkFVTFRfRFQiLCJNb2RlQ29uZmlnIiwiY29uc3RydWN0b3IiLCJ6b29tIiwiZHQiLCJjZW50ZXIiLCJkZWx0YVZlbG9jaXR5IiwiZ2V0VG90YWxNb21lbnR1bSIsInRpbWVzIiwiZ2V0VG90YWxNYXNzIiwiYm9kaWVzIiwiZ2V0Qm9kaWVzIiwiaSIsImxlbmd0aCIsInZ4IiwieCIsInZ5IiwieSIsInRvdGFsTW9tZW50dW0iLCJwbHVzIiwiZ2V0TW9tZW50dW0iLCJ0b3RhbE1hc3MiLCJtYXNzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb2RlQ29uZmlnLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gZm9yIHNldHRpbmcgdXAgYSBwYXJ0aWN1bGFyIEdyYXZpdHlBbmRPcmJpdHNTY2VuZSwgZW51bWVyYXRlZCBpbiBTY2VuZUZhY3RvcnkuXHJcbiAqIFRoaXMgaXMgYW4gYWJzdHJhY3QgY2xhc3MsIGFuZCBpcyBpbnRlbmRlZCBvbmx5IHRvIGJlIHVzZWQgYnkgc3ViLXR5cGVzLlxyXG4gKiBAYWJzdHJhY3RcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBncmF2aXR5QW5kT3JiaXRzIGZyb20gJy4uLy4uL2dyYXZpdHlBbmRPcmJpdHMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c0Nsb2NrIGZyb20gJy4vR3Jhdml0eUFuZE9yYml0c0Nsb2NrLmpzJztcclxuaW1wb3J0IEJvZHlDb25maWd1cmF0aW9uIGZyb20gJy4vQm9keUNvbmZpZ3VyYXRpb24uanMnO1xyXG5pbXBvcnQgeyBMaW5lIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX0RUID0gR3Jhdml0eUFuZE9yYml0c0Nsb2NrLkRFRkFVTFRfRFQ7XHJcblxyXG5hYnN0cmFjdCBjbGFzcyBNb2RlQ29uZmlnIHtcclxuICBwdWJsaWMgZHQ6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgem9vbTogbnVtYmVyO1xyXG5cclxuICAvLyBJbml0aWFsIHN0YXJ0IGFuZCBlbmQgcG9pbnQgb2YgdGhlIG1lYXN1cmluZyB0YXBlXHJcbiAgcHVibGljIGluaXRpYWxNZWFzdXJpbmdUYXBlUG9zaXRpb24/OiBMaW5lO1xyXG4gIHB1YmxpYyBmb3JjZVNjYWxlPzogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gem9vbVxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3Rvciggem9vbTogbnVtYmVyICkge1xyXG4gICAgdGhpcy5kdCA9IERFRkFVTFRfRFQ7XHJcbiAgICB0aGlzLnpvb20gPSB6b29tO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNlbnRlcigpOiB2b2lkIHtcclxuICAgIGNvbnN0IGRlbHRhVmVsb2NpdHkgPSB0aGlzLmdldFRvdGFsTW9tZW50dW0oKS50aW1lcyggLTEuMCAvIHRoaXMuZ2V0VG90YWxNYXNzKCkgKTtcclxuICAgIGNvbnN0IGJvZGllcyA9IHRoaXMuZ2V0Qm9kaWVzKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGJvZGllc1sgaSBdLnZ4ICs9IGRlbHRhVmVsb2NpdHkueDtcclxuICAgICAgYm9kaWVzWyBpIF0udnkgKz0gZGVsdGFWZWxvY2l0eS55O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSB0aGUgdG90YWwgbW9tZW50dW0gZm9yIHB1cnBvc2VzIG9mIGNlbnRlcmluZyB0aGUgY2FtZXJhIG9uIHRoZSBjZW50ZXIgb2YgbW9tZW50dW0gZnJhbWVcclxuICAgKi9cclxuICBwcml2YXRlIGdldFRvdGFsTW9tZW50dW0oKTogVmVjdG9yMiB7XHJcbiAgICBsZXQgdG90YWxNb21lbnR1bSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICBjb25zdCBib2RpZXMgPSB0aGlzLmdldEJvZGllcygpO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0b3RhbE1vbWVudHVtID0gdG90YWxNb21lbnR1bS5wbHVzKCBib2RpZXNbIGkgXS5nZXRNb21lbnR1bSgpICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG90YWxNb21lbnR1bTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VG90YWxNYXNzKCk6IG51bWJlciB7XHJcbiAgICBsZXQgdG90YWxNYXNzID0gMC4wO1xyXG4gICAgY29uc3QgYm9kaWVzID0gdGhpcy5nZXRCb2RpZXMoKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdG90YWxNYXNzICs9IGJvZGllc1sgaSBdLm1hc3M7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG90YWxNYXNzO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEJvZGllcygpOiBCb2R5Q29uZmlndXJhdGlvbltdO1xyXG59XHJcblxyXG5ncmF2aXR5QW5kT3JiaXRzLnJlZ2lzdGVyKCAnTW9kZUNvbmZpZycsIE1vZGVDb25maWcgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9kZUNvbmZpZztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUk5RDtBQUNBLE1BQU1DLFVBQVUsR0FBR0QscUJBQXFCLENBQUNDLFVBQVU7QUFFbkQsTUFBZUMsVUFBVSxDQUFDO0VBSXhCOztFQUlBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1lDLFdBQVdBLENBQUVDLElBQVksRUFBRztJQUNwQyxJQUFJLENBQUNDLEVBQUUsR0FBR0osVUFBVTtJQUNwQixJQUFJLENBQUNHLElBQUksR0FBR0EsSUFBSTtFQUNsQjtFQUVPRSxNQUFNQSxDQUFBLEVBQVM7SUFDcEIsTUFBTUMsYUFBYSxHQUFHLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUMsQ0FBRSxDQUFDO0lBQ2pGLE1BQU1DLE1BQU0sR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixNQUFNLENBQUNHLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDeENGLE1BQU0sQ0FBRUUsQ0FBQyxDQUFFLENBQUNFLEVBQUUsSUFBSVIsYUFBYSxDQUFDUyxDQUFDO01BQ2pDTCxNQUFNLENBQUVFLENBQUMsQ0FBRSxDQUFDSSxFQUFFLElBQUlWLGFBQWEsQ0FBQ1csQ0FBQztJQUNuQztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNVVixnQkFBZ0JBLENBQUEsRUFBWTtJQUNsQyxJQUFJVyxhQUFhLEdBQUcsSUFBSXJCLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ3ZDLE1BQU1hLE1BQU0sR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixNQUFNLENBQUNHLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDeENNLGFBQWEsR0FBR0EsYUFBYSxDQUFDQyxJQUFJLENBQUVULE1BQU0sQ0FBRUUsQ0FBQyxDQUFFLENBQUNRLFdBQVcsQ0FBQyxDQUFFLENBQUM7SUFDakU7SUFDQSxPQUFPRixhQUFhO0VBQ3RCO0VBRVFULFlBQVlBLENBQUEsRUFBVztJQUM3QixJQUFJWSxTQUFTLEdBQUcsR0FBRztJQUNuQixNQUFNWCxNQUFNLEdBQUcsSUFBSSxDQUFDQyxTQUFTLENBQUMsQ0FBQztJQUMvQixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsTUFBTSxDQUFDRyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ3hDUyxTQUFTLElBQUlYLE1BQU0sQ0FBRUUsQ0FBQyxDQUFFLENBQUNVLElBQUk7SUFDL0I7SUFDQSxPQUFPRCxTQUFTO0VBQ2xCO0FBR0Y7QUFFQXZCLGdCQUFnQixDQUFDeUIsUUFBUSxDQUFFLFlBQVksRUFBRXRCLFVBQVcsQ0FBQztBQUNyRCxlQUFlQSxVQUFVIn0=