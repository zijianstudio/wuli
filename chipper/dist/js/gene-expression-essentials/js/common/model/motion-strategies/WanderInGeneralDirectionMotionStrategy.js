// Copyright 2015-2021, University of Colorado Boulder

/**
 * A motion strategy where the user moves in a general direction with some random direction changes every once in a while.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import geneExpressionEssentials from '../../../geneExpressionEssentials.js';
import MotionStrategy from './MotionStrategy.js';

// constants
const MIN_VELOCITY = 100; // In picometers/s
const MAX_VELOCITY = 500; // In picometers/s
const MIN_TIME_IN_ONE_DIRECTION = 0.25; // In seconds.
const MAX_TIME_IN_ONE_DIRECTION = 1.25; // In seconds.

class WanderInGeneralDirectionMotionStrategy extends MotionStrategy {
  /**
   * @param  {Vector2} generalDirection
   * @param motionBoundsProperty
   */
  constructor(generalDirection, motionBoundsProperty) {
    super();
    this.directionChangeCountdown = 0; // @private
    this.currentMotionVector = new Vector2(0, 0); // @private

    const handleMotionBoundsChanged = motionBounds => {
      this.motionBounds = motionBounds;
    };
    motionBoundsProperty.link(handleMotionBoundsChanged);
    this.disposeWanderInGeneralDirectionMotionStrategy = () => {
      motionBoundsProperty.unlink(handleMotionBoundsChanged);
    };
    this.generalDirection = generalDirection;
  }

  /**
   * @override
   * @public
   */
  dispose() {
    this.disposeWanderInGeneralDirectionMotionStrategy();
  }

  /**
   * @returns {number}
   * @private
   */
  generateDirectionChangeCountdownValue() {
    return MIN_TIME_IN_ONE_DIRECTION + dotRandom.nextDouble() * (MAX_TIME_IN_ONE_DIRECTION - MIN_TIME_IN_ONE_DIRECTION);
  }

  /**
   * @override
   * @param {Vector2} currentPosition
   * @param {Bounds2} bounds
   * @param {number} dt
   * @returns {Vector2}
   * @public
   */
  getNextPosition(currentPosition, bounds, dt) {
    this.directionChangeCountdown -= dt;
    if (this.directionChangeCountdown <= 0) {
      // Time to change the direction.
      const newVelocity = MIN_VELOCITY + dotRandom.nextDouble() * (MAX_VELOCITY - MIN_VELOCITY);
      const varianceAngle = (dotRandom.nextDouble() - 0.5) * Math.PI / 3;
      this.currentMotionVector = this.generalDirection.withMagnitude(newVelocity).rotated(varianceAngle);

      // Reset the countdown timer.
      this.directionChangeCountdown = this.generateDirectionChangeCountdownValue();
    }

    // Make sure that current motion will not cause the model element to move outside of the motion bounds.
    if (!this.motionBounds.testIfInMotionBoundsWithDelta(bounds, this.currentMotionVector, dt)) {
      // The current motion vector would take this element out of bounds, so it needs to "bounce".
      this.currentMotionVector = this.getMotionVectorForBounce(bounds, this.currentMotionVector, dt, MAX_VELOCITY);

      // Reset the timer.
      this.directionChangeCountdown = this.generateDirectionChangeCountdownValue();
    }
    return currentPosition.plus(this.currentMotionVector.timesScalar(dt));
  }

  /**
   * @override
   * @param {Vector3} currentPosition
   * @param {Bounds2} bounds
   * @param {number} dt
   * @returns {Vector3}
   * @public
   */
  getNextPosition3D(currentPosition, bounds, dt) {
    // The 3D version of this motion strategy doesn't move in the z direction. This may change some day.
    const nextPosition2D = this.getNextPosition(new Vector2(currentPosition.x, currentPosition.y), bounds, dt);
    return new Vector3(nextPosition2D.x, nextPosition2D.y, currentPosition.z);
  }
}
geneExpressionEssentials.register('WanderInGeneralDirectionMotionStrategy', WanderInGeneralDirectionMotionStrategy);
export default WanderInGeneralDirectionMotionStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJWZWN0b3IyIiwiVmVjdG9yMyIsImdlbmVFeHByZXNzaW9uRXNzZW50aWFscyIsIk1vdGlvblN0cmF0ZWd5IiwiTUlOX1ZFTE9DSVRZIiwiTUFYX1ZFTE9DSVRZIiwiTUlOX1RJTUVfSU5fT05FX0RJUkVDVElPTiIsIk1BWF9USU1FX0lOX09ORV9ESVJFQ1RJT04iLCJXYW5kZXJJbkdlbmVyYWxEaXJlY3Rpb25Nb3Rpb25TdHJhdGVneSIsImNvbnN0cnVjdG9yIiwiZ2VuZXJhbERpcmVjdGlvbiIsIm1vdGlvbkJvdW5kc1Byb3BlcnR5IiwiZGlyZWN0aW9uQ2hhbmdlQ291bnRkb3duIiwiY3VycmVudE1vdGlvblZlY3RvciIsImhhbmRsZU1vdGlvbkJvdW5kc0NoYW5nZWQiLCJtb3Rpb25Cb3VuZHMiLCJsaW5rIiwiZGlzcG9zZVdhbmRlckluR2VuZXJhbERpcmVjdGlvbk1vdGlvblN0cmF0ZWd5IiwidW5saW5rIiwiZGlzcG9zZSIsImdlbmVyYXRlRGlyZWN0aW9uQ2hhbmdlQ291bnRkb3duVmFsdWUiLCJuZXh0RG91YmxlIiwiZ2V0TmV4dFBvc2l0aW9uIiwiY3VycmVudFBvc2l0aW9uIiwiYm91bmRzIiwiZHQiLCJuZXdWZWxvY2l0eSIsInZhcmlhbmNlQW5nbGUiLCJNYXRoIiwiUEkiLCJ3aXRoTWFnbml0dWRlIiwicm90YXRlZCIsInRlc3RJZkluTW90aW9uQm91bmRzV2l0aERlbHRhIiwiZ2V0TW90aW9uVmVjdG9yRm9yQm91bmNlIiwicGx1cyIsInRpbWVzU2NhbGFyIiwiZ2V0TmV4dFBvc2l0aW9uM0QiLCJuZXh0UG9zaXRpb24yRCIsIngiLCJ5IiwieiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2FuZGVySW5HZW5lcmFsRGlyZWN0aW9uTW90aW9uU3RyYXRlZ3kuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBtb3Rpb24gc3RyYXRlZ3kgd2hlcmUgdGhlIHVzZXIgbW92ZXMgaW4gYSBnZW5lcmFsIGRpcmVjdGlvbiB3aXRoIHNvbWUgcmFuZG9tIGRpcmVjdGlvbiBjaGFuZ2VzIGV2ZXJ5IG9uY2UgaW4gYSB3aGlsZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBNb3Rpb25TdHJhdGVneSBmcm9tICcuL01vdGlvblN0cmF0ZWd5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNSU5fVkVMT0NJVFkgPSAxMDA7IC8vIEluIHBpY29tZXRlcnMvc1xyXG5jb25zdCBNQVhfVkVMT0NJVFkgPSA1MDA7IC8vIEluIHBpY29tZXRlcnMvc1xyXG5jb25zdCBNSU5fVElNRV9JTl9PTkVfRElSRUNUSU9OID0gMC4yNTsgLy8gSW4gc2Vjb25kcy5cclxuY29uc3QgTUFYX1RJTUVfSU5fT05FX0RJUkVDVElPTiA9IDEuMjU7IC8vIEluIHNlY29uZHMuXHJcblxyXG5jbGFzcyBXYW5kZXJJbkdlbmVyYWxEaXJlY3Rpb25Nb3Rpb25TdHJhdGVneSBleHRlbmRzIE1vdGlvblN0cmF0ZWd5IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtICB7VmVjdG9yMn0gZ2VuZXJhbERpcmVjdGlvblxyXG4gICAqIEBwYXJhbSBtb3Rpb25Cb3VuZHNQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBnZW5lcmFsRGlyZWN0aW9uLCBtb3Rpb25Cb3VuZHNQcm9wZXJ0eSApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLmRpcmVjdGlvbkNoYW5nZUNvdW50ZG93biA9IDA7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmN1cnJlbnRNb3Rpb25WZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIGNvbnN0IGhhbmRsZU1vdGlvbkJvdW5kc0NoYW5nZWQgPSBtb3Rpb25Cb3VuZHMgPT4ge1xyXG4gICAgICB0aGlzLm1vdGlvbkJvdW5kcyA9IG1vdGlvbkJvdW5kcztcclxuICAgIH07XHJcblxyXG4gICAgbW90aW9uQm91bmRzUHJvcGVydHkubGluayggaGFuZGxlTW90aW9uQm91bmRzQ2hhbmdlZCApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVdhbmRlckluR2VuZXJhbERpcmVjdGlvbk1vdGlvblN0cmF0ZWd5ID0gKCkgPT4ge1xyXG4gICAgICBtb3Rpb25Cb3VuZHNQcm9wZXJ0eS51bmxpbmsoIGhhbmRsZU1vdGlvbkJvdW5kc0NoYW5nZWQgKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5nZW5lcmFsRGlyZWN0aW9uID0gZ2VuZXJhbERpcmVjdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlV2FuZGVySW5HZW5lcmFsRGlyZWN0aW9uTW90aW9uU3RyYXRlZ3koKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZW5lcmF0ZURpcmVjdGlvbkNoYW5nZUNvdW50ZG93blZhbHVlKCkge1xyXG4gICAgcmV0dXJuIE1JTl9USU1FX0lOX09ORV9ESVJFQ1RJT04gKyBkb3RSYW5kb20ubmV4dERvdWJsZSgpICpcclxuICAgICAgICAgICAoIE1BWF9USU1FX0lOX09ORV9ESVJFQ1RJT04gLSBNSU5fVElNRV9JTl9PTkVfRElSRUNUSU9OICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGN1cnJlbnRQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gYm91bmRzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE5leHRQb3NpdGlvbiggY3VycmVudFBvc2l0aW9uLCBib3VuZHMsIGR0ICkge1xyXG4gICAgdGhpcy5kaXJlY3Rpb25DaGFuZ2VDb3VudGRvd24gLT0gZHQ7XHJcbiAgICBpZiAoIHRoaXMuZGlyZWN0aW9uQ2hhbmdlQ291bnRkb3duIDw9IDAgKSB7XHJcblxyXG4gICAgICAvLyBUaW1lIHRvIGNoYW5nZSB0aGUgZGlyZWN0aW9uLlxyXG4gICAgICBjb25zdCBuZXdWZWxvY2l0eSA9IE1JTl9WRUxPQ0lUWSArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAoIE1BWF9WRUxPQ0lUWSAtIE1JTl9WRUxPQ0lUWSApO1xyXG4gICAgICBjb25zdCB2YXJpYW5jZUFuZ2xlID0gKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIC0gMC41ICkgKiBNYXRoLlBJIC8gMztcclxuICAgICAgdGhpcy5jdXJyZW50TW90aW9uVmVjdG9yID0gdGhpcy5nZW5lcmFsRGlyZWN0aW9uLndpdGhNYWduaXR1ZGUoIG5ld1ZlbG9jaXR5ICkucm90YXRlZCggdmFyaWFuY2VBbmdsZSApO1xyXG5cclxuICAgICAgLy8gUmVzZXQgdGhlIGNvdW50ZG93biB0aW1lci5cclxuICAgICAgdGhpcy5kaXJlY3Rpb25DaGFuZ2VDb3VudGRvd24gPSB0aGlzLmdlbmVyYXRlRGlyZWN0aW9uQ2hhbmdlQ291bnRkb3duVmFsdWUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCBjdXJyZW50IG1vdGlvbiB3aWxsIG5vdCBjYXVzZSB0aGUgbW9kZWwgZWxlbWVudCB0byBtb3ZlIG91dHNpZGUgb2YgdGhlIG1vdGlvbiBib3VuZHMuXHJcbiAgICBpZiAoICF0aGlzLm1vdGlvbkJvdW5kcy50ZXN0SWZJbk1vdGlvbkJvdW5kc1dpdGhEZWx0YSggYm91bmRzLCB0aGlzLmN1cnJlbnRNb3Rpb25WZWN0b3IsIGR0ICkgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgY3VycmVudCBtb3Rpb24gdmVjdG9yIHdvdWxkIHRha2UgdGhpcyBlbGVtZW50IG91dCBvZiBib3VuZHMsIHNvIGl0IG5lZWRzIHRvIFwiYm91bmNlXCIuXHJcbiAgICAgIHRoaXMuY3VycmVudE1vdGlvblZlY3RvciA9IHRoaXMuZ2V0TW90aW9uVmVjdG9yRm9yQm91bmNlKCBib3VuZHMsIHRoaXMuY3VycmVudE1vdGlvblZlY3RvciwgZHQsIE1BWF9WRUxPQ0lUWSApO1xyXG5cclxuICAgICAgLy8gUmVzZXQgdGhlIHRpbWVyLlxyXG4gICAgICB0aGlzLmRpcmVjdGlvbkNoYW5nZUNvdW50ZG93biA9IHRoaXMuZ2VuZXJhdGVEaXJlY3Rpb25DaGFuZ2VDb3VudGRvd25WYWx1ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjdXJyZW50UG9zaXRpb24ucGx1cyggdGhpcy5jdXJyZW50TW90aW9uVmVjdG9yLnRpbWVzU2NhbGFyKCBkdCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IGN1cnJlbnRQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gYm91bmRzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE5leHRQb3NpdGlvbjNEKCBjdXJyZW50UG9zaXRpb24sIGJvdW5kcywgZHQgKSB7XHJcblxyXG4gICAgLy8gVGhlIDNEIHZlcnNpb24gb2YgdGhpcyBtb3Rpb24gc3RyYXRlZ3kgZG9lc24ndCBtb3ZlIGluIHRoZSB6IGRpcmVjdGlvbi4gVGhpcyBtYXkgY2hhbmdlIHNvbWUgZGF5LlxyXG4gICAgY29uc3QgbmV4dFBvc2l0aW9uMkQgPSB0aGlzLmdldE5leHRQb3NpdGlvbiggbmV3IFZlY3RvcjIoIGN1cnJlbnRQb3NpdGlvbi54LCBjdXJyZW50UG9zaXRpb24ueSApLCBib3VuZHMsIGR0ICk7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIG5leHRQb3NpdGlvbjJELngsIG5leHRQb3NpdGlvbjJELnksIGN1cnJlbnRQb3NpdGlvbi56ICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdXYW5kZXJJbkdlbmVyYWxEaXJlY3Rpb25Nb3Rpb25TdHJhdGVneScsIFdhbmRlckluR2VuZXJhbERpcmVjdGlvbk1vdGlvblN0cmF0ZWd5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXYW5kZXJJbkdlbmVyYWxEaXJlY3Rpb25Nb3Rpb25TdHJhdGVneTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxvQ0FBb0M7QUFDMUQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLHNDQUFzQztBQUMzRSxPQUFPQyxjQUFjLE1BQU0scUJBQXFCOztBQUVoRDtBQUNBLE1BQU1DLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMxQixNQUFNQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDMUIsTUFBTUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDeEMs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