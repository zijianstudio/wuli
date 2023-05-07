// Copyright 2019-2022, University of Colorado Boulder

/**
 * DiffusionCollisionDetector is a specialization of CollisionDetector that handles collisions between
 * particles and a vertical divider in a DiffusionContainer.  When the divider is present, it treats the
 * 2 sides of the container as 2 separate containers.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CollisionDetector from '../../common/model/CollisionDetector.js';
import gasProperties from '../../gasProperties.js';
export default class DiffusionCollisionDetector extends CollisionDetector {
  constructor(diffusionContainer, particles1, particles2) {
    super(diffusionContainer, [particles1, particles2], new BooleanProperty(true));
    this.diffusionContainer = diffusionContainer;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Detects and handles particle-container collisions for the system for one time step.
   * Returns the number of collisions
   */
  updateParticleContainerCollisions() {
    let numberOfParticleContainerCollisions = 0;
    if (this.diffusionContainer.hasDividerProperty.value) {
      // If the divider is in place, treat the 2 sides of the container as 2 separate containers.
      const leftWallVelocity = Vector2.ZERO;
      numberOfParticleContainerCollisions += CollisionDetector.doParticleContainerCollisions(this.particleArrays[0], this.diffusionContainer.leftBounds, leftWallVelocity);
      numberOfParticleContainerCollisions += CollisionDetector.doParticleContainerCollisions(this.particleArrays[1], this.diffusionContainer.rightBounds, leftWallVelocity);
    } else {
      // If there is no divider, use default behavior.
      numberOfParticleContainerCollisions = super.updateParticleContainerCollisions();
    }
    return numberOfParticleContainerCollisions;
  }
}
gasProperties.register('DiffusionCollisionDetector', DiffusionCollisionDetector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiQ29sbGlzaW9uRGV0ZWN0b3IiLCJnYXNQcm9wZXJ0aWVzIiwiRGlmZnVzaW9uQ29sbGlzaW9uRGV0ZWN0b3IiLCJjb25zdHJ1Y3RvciIsImRpZmZ1c2lvbkNvbnRhaW5lciIsInBhcnRpY2xlczEiLCJwYXJ0aWNsZXMyIiwiZGlzcG9zZSIsImFzc2VydCIsInVwZGF0ZVBhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyIsIm51bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zIiwiaGFzRGl2aWRlclByb3BlcnR5IiwidmFsdWUiLCJsZWZ0V2FsbFZlbG9jaXR5IiwiWkVSTyIsImRvUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zIiwicGFydGljbGVBcnJheXMiLCJsZWZ0Qm91bmRzIiwicmlnaHRCb3VuZHMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpZmZ1c2lvbkNvbGxpc2lvbkRldGVjdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpZmZ1c2lvbkNvbGxpc2lvbkRldGVjdG9yIGlzIGEgc3BlY2lhbGl6YXRpb24gb2YgQ29sbGlzaW9uRGV0ZWN0b3IgdGhhdCBoYW5kbGVzIGNvbGxpc2lvbnMgYmV0d2VlblxyXG4gKiBwYXJ0aWNsZXMgYW5kIGEgdmVydGljYWwgZGl2aWRlciBpbiBhIERpZmZ1c2lvbkNvbnRhaW5lci4gIFdoZW4gdGhlIGRpdmlkZXIgaXMgcHJlc2VudCwgaXQgdHJlYXRzIHRoZVxyXG4gKiAyIHNpZGVzIG9mIHRoZSBjb250YWluZXIgYXMgMiBzZXBhcmF0ZSBjb250YWluZXJzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25EZXRlY3RvciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ29sbGlzaW9uRGV0ZWN0b3IuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IERpZmZ1c2lvbkNvbnRhaW5lciBmcm9tICcuL0RpZmZ1c2lvbkNvbnRhaW5lci5qcyc7XHJcbmltcG9ydCBEaWZmdXNpb25QYXJ0aWNsZTEgZnJvbSAnLi9EaWZmdXNpb25QYXJ0aWNsZTEuanMnO1xyXG5pbXBvcnQgRGlmZnVzaW9uUGFydGljbGUyIGZyb20gJy4vRGlmZnVzaW9uUGFydGljbGUyLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZ1c2lvbkNvbGxpc2lvbkRldGVjdG9yIGV4dGVuZHMgQ29sbGlzaW9uRGV0ZWN0b3Ige1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpZmZ1c2lvbkNvbnRhaW5lcjogRGlmZnVzaW9uQ29udGFpbmVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpZmZ1c2lvbkNvbnRhaW5lcjogRGlmZnVzaW9uQ29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFydGljbGVzMTogRGlmZnVzaW9uUGFydGljbGUxW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZXMyOiBEaWZmdXNpb25QYXJ0aWNsZTJbXSApIHtcclxuICAgIHN1cGVyKCBkaWZmdXNpb25Db250YWluZXIsIFsgcGFydGljbGVzMSwgcGFydGljbGVzMiBdLCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICkgKTtcclxuICAgIHRoaXMuZGlmZnVzaW9uQ29udGFpbmVyID0gZGlmZnVzaW9uQ29udGFpbmVyO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVjdHMgYW5kIGhhbmRsZXMgcGFydGljbGUtY29udGFpbmVyIGNvbGxpc2lvbnMgZm9yIHRoZSBzeXN0ZW0gZm9yIG9uZSB0aW1lIHN0ZXAuXHJcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGNvbGxpc2lvbnNcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zKCk6IG51bWJlciB7XHJcblxyXG4gICAgbGV0IG51bWJlck9mUGFydGljbGVDb250YWluZXJDb2xsaXNpb25zID0gMDtcclxuICAgIGlmICggdGhpcy5kaWZmdXNpb25Db250YWluZXIuaGFzRGl2aWRlclByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGRpdmlkZXIgaXMgaW4gcGxhY2UsIHRyZWF0IHRoZSAyIHNpZGVzIG9mIHRoZSBjb250YWluZXIgYXMgMiBzZXBhcmF0ZSBjb250YWluZXJzLlxyXG4gICAgICBjb25zdCBsZWZ0V2FsbFZlbG9jaXR5ID0gVmVjdG9yMi5aRVJPO1xyXG4gICAgICBudW1iZXJPZlBhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyArPSBDb2xsaXNpb25EZXRlY3Rvci5kb1BhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucyhcclxuICAgICAgICB0aGlzLnBhcnRpY2xlQXJyYXlzWyAwIF0sIHRoaXMuZGlmZnVzaW9uQ29udGFpbmVyLmxlZnRCb3VuZHMsIGxlZnRXYWxsVmVsb2NpdHkgKTtcclxuICAgICAgbnVtYmVyT2ZQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMgKz0gQ29sbGlzaW9uRGV0ZWN0b3IuZG9QYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMoXHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUFycmF5c1sgMSBdLCB0aGlzLmRpZmZ1c2lvbkNvbnRhaW5lci5yaWdodEJvdW5kcywgbGVmdFdhbGxWZWxvY2l0eSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBkaXZpZGVyLCB1c2UgZGVmYXVsdCBiZWhhdmlvci5cclxuICAgICAgbnVtYmVyT2ZQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMgPSBzdXBlci51cGRhdGVQYXJ0aWNsZUNvbnRhaW5lckNvbGxpc2lvbnMoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBudW1iZXJPZlBhcnRpY2xlQ29udGFpbmVyQ29sbGlzaW9ucztcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdEaWZmdXNpb25Db2xsaXNpb25EZXRlY3RvcicsIERpZmZ1c2lvbkNvbGxpc2lvbkRldGVjdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsaUJBQWlCLE1BQU0seUNBQXlDO0FBQ3ZFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFLbEQsZUFBZSxNQUFNQywwQkFBMEIsU0FBU0YsaUJBQWlCLENBQUM7RUFJakVHLFdBQVdBLENBQUVDLGtCQUFzQyxFQUN0Q0MsVUFBZ0MsRUFDaENDLFVBQWdDLEVBQUc7SUFDckQsS0FBSyxDQUFFRixrQkFBa0IsRUFBRSxDQUFFQyxVQUFVLEVBQUVDLFVBQVUsQ0FBRSxFQUFFLElBQUlSLGVBQWUsQ0FBRSxJQUFLLENBQUUsQ0FBQztJQUNwRixJQUFJLENBQUNNLGtCQUFrQixHQUFHQSxrQkFBa0I7RUFDOUM7RUFFZ0JHLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDcUJFLGlDQUFpQ0EsQ0FBQSxFQUFXO0lBRTdELElBQUlDLG1DQUFtQyxHQUFHLENBQUM7SUFDM0MsSUFBSyxJQUFJLENBQUNOLGtCQUFrQixDQUFDTyxrQkFBa0IsQ0FBQ0MsS0FBSyxFQUFHO01BRXREO01BQ0EsTUFBTUMsZ0JBQWdCLEdBQUdkLE9BQU8sQ0FBQ2UsSUFBSTtNQUNyQ0osbUNBQW1DLElBQUlWLGlCQUFpQixDQUFDZSw2QkFBNkIsQ0FDcEYsSUFBSSxDQUFDQyxjQUFjLENBQUUsQ0FBQyxDQUFFLEVBQUUsSUFBSSxDQUFDWixrQkFBa0IsQ0FBQ2EsVUFBVSxFQUFFSixnQkFBaUIsQ0FBQztNQUNsRkgsbUNBQW1DLElBQUlWLGlCQUFpQixDQUFDZSw2QkFBNkIsQ0FDcEYsSUFBSSxDQUFDQyxjQUFjLENBQUUsQ0FBQyxDQUFFLEVBQUUsSUFBSSxDQUFDWixrQkFBa0IsQ0FBQ2MsV0FBVyxFQUFFTCxnQkFBaUIsQ0FBQztJQUNyRixDQUFDLE1BQ0k7TUFFSDtNQUNBSCxtQ0FBbUMsR0FBRyxLQUFLLENBQUNELGlDQUFpQyxDQUFDLENBQUM7SUFDakY7SUFDQSxPQUFPQyxtQ0FBbUM7RUFDNUM7QUFDRjtBQUVBVCxhQUFhLENBQUNrQixRQUFRLENBQUUsNEJBQTRCLEVBQUVqQiwwQkFBMkIsQ0FBQyJ9