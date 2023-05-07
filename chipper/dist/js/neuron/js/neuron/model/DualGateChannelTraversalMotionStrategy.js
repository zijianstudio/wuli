// Copyright 2014-2021, University of Colorado Boulder
/**
 * A motion strategy for traversing through a dual-gated channel, meaning one that has a gate and an inactivation level.
 * <p/>
 * This strategy makes several assumptions about the nature of the dual-gate channel and how it is portrayed.  These
 * assumptions depend both on the model representation and the view representation of the dual-gated channel. If changes
 * are made to either, this class may need to be revised.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import neuron from '../../neuron.js';
import MathUtils from '../common/MathUtils.js';
import NeuronConstants from '../common/NeuronConstants.js';
import LinearMotionStrategy from './LinearMotionStrategy.js';
import MotionStrategy from './MotionStrategy.js';
import SpeedChangeLinearMotionStrategy from './SpeedChangeLinearMotionStrategy.js';
import TimedFadeAwayStrategy from './TimedFadeAwayStrategy.js';
import WanderAwayThenFadeMotionStrategy from './WanderAwayThenFadeMotionStrategy.js';

// Threshold at which particles will "bounce" back out of the channel rather than traversing it.
const INACTIVATION_BOUNCE_THRESHOLD = 0.5;
class DualGateChannelTraversalMotionStrategy extends MotionStrategy {
  /**
   * @param {MembraneChannel} channel
   * @param {number} startingPositionX
   * @param {number} startingPositionY
   * @param {number} maxVelocity
   */
  constructor(channel, startingPositionX, startingPositionY, maxVelocity) {
    super();
    maxVelocity = maxVelocity || NeuronConstants.DEFAULT_MAX_VELOCITY;
    this.velocityVector = new Vector2(0, 0);
    this.channel = channel;
    this.maxVelocity = maxVelocity;

    // Holds array of objects with x and y properties (doesn't use vector for performance reasons)
    // http://jsperf.com/object-notation-vs-constructor
    this.traversalPoints = this.createTraversalPoints(channel, startingPositionX, startingPositionY); // @private
    this.currentDestinationIndex = 0; // @private
    this.bouncing = false; // @private
    this.setCourseForCurrentTraversalPoint(startingPositionX, startingPositionY);
  }

  // @public, @override
  move(movableModelElement, fadableModelElement, dt) {
    assert && assert(this.currentDestinationIndex < this.traversalPoints.length); // Error checking.
    let angularRange = 0;
    const currentPositionRefX = movableModelElement.getPositionX();
    const currentPositionRefY = movableModelElement.getPositionY();
    if (this.currentDestinationIndex === 0) {
      // Currently moving towards the first destination point.  Is the
      // channel still open?
      if (!this.channel.isOpen()) {
        // The channel has closed, so there is no sense in continuing
        // towards it.  The particle should wander and then fade out.
        movableModelElement.setMotionStrategy(new WanderAwayThenFadeMotionStrategy(this.channel.getCenterPosition(), movableModelElement.getPositionX(), movableModelElement.getPositionY(), 0, 0.002));
        // For error checking, set the destination index really high.
        // That way it will be detected if this strategy instance is
        // used again.
        this.currentDestinationIndex = Number.MAX_VALUE;
      } else if (this.distanceBetweenPosAndTraversalPoint(currentPositionRefX, currentPositionRefY, this.traversalPoints[this.currentDestinationIndex]) < this.velocityVector.magnitude * dt) {
        // We have arrived at the first traversal point, so now start
        // heading towards the second.
        movableModelElement.setPosition(this.traversalPoints[this.currentDestinationIndex].x, this.traversalPoints[this.currentDestinationIndex].y);
        this.currentDestinationIndex++;
        this.setCourseForPoint(movableModelElement.getPositionX(), movableModelElement.getPositionY(), this.traversalPoints[this.currentDestinationIndex], this.velocityVector.magnitude);
      } else {
        // Keep moving towards current destination.
        this.moveBasedOnCurrentVelocity(movableModelElement, dt);
      }
    } else if (this.currentDestinationIndex === 1) {
      // Currently moving towards the 2nd point, which is in the
      // channel just above where the inactivation gate appears.
      if (this.channel.getInactivationAmount() > INACTIVATION_BOUNCE_THRESHOLD) {
        // The inactivation threshold has been reached, so we can't
        // finish traversing the channel and need to bounce.  Check
        // whether we've already handled this.
        if (!this.bouncing) {
          // Set the particle up to "bounce", i.e. to turn around
          // and go back whence it came once it reaches the 2nd
          // point.
          this.traversalPoints[2].x = this.traversalPoints[0].x;
          this.traversalPoints[2].y = this.traversalPoints[0].y;
          this.bouncing = true; // Flag for tracking that we need to bounce.
        }
      }

      if (this.distanceBetweenPosAndTraversalPoint(currentPositionRefX, currentPositionRefY, this.traversalPoints[this.currentDestinationIndex]) < this.velocityVector.magnitude * dt) {
        // The element has reached the current traversal point, so
        // it should start moving towards the next.
        movableModelElement.setPosition(this.traversalPoints[this.currentDestinationIndex].x, this.traversalPoints[this.currentDestinationIndex].y);
        this.currentDestinationIndex++;
        this.setCourseForPoint(movableModelElement.getPositionX(), movableModelElement.getPositionY(), this.traversalPoints[this.currentDestinationIndex], this.velocityVector.magnitude);
        if (this.bouncing) {
          // Slow down if we are bouncing - it looks better this way.
          this.velocityVector.multiplyScalar(0.5);
        }
      } else {
        // Keep moving towards current destination.
        this.moveBasedOnCurrentVelocity(movableModelElement, dt);
      }
    } else if (this.currentDestinationIndex === 2) {
      // Currently moving towards the 3rd point.
      if (this.distanceBetweenPosAndTraversalPoint(currentPositionRefX, currentPositionRefY, this.traversalPoints[this.currentDestinationIndex]) < this.velocityVector.magnitude * dt) {
        // The element has reached the last traversal point, so a
        // new motion strategy is set to have it move away and then
        // fade out.

        movableModelElement.setPosition(this.traversalPoints[this.currentDestinationIndex].x, this.traversalPoints[this.currentDestinationIndex].y);
        this.currentDestinationIndex = Number.MAX_VALUE;
        const newVelocityVector = new Vector2(this.velocityVector.x, this.velocityVector.y);
        if (this.bouncing) {
          // This particle should be back where it entered the
          // channel, and can head off in any direction except
          // back toward the membrane.
          newVelocityVector.rotate((dotRandom.nextDouble() - 0.5) * Math.PI);
          newVelocityVector.multiplyScalar(0.3 + dotRandom.nextDouble() * 0.2);
          movableModelElement.setMotionStrategy(new LinearMotionStrategy(newVelocityVector));
        } else {
          // The particle is existing the part of the channel where
          // the inactivation gate exists, so it needs to take on a
          // new course that avoids the gate.  Note that this is set
          // up to work with a specific representation of the
          // inactivation gate, and will need to be changed if the
          // representation of the gate is changed.
          newVelocityVector.multiplyScalar(0.5 + dotRandom.nextDouble() * 0.3);
          let maxRotation;
          let minRotation;
          if (dotRandom.nextDouble() > 0.3) {
            // Move out to the right (assuming channel is vertical).
            // The angle at which we can move gets more restricted
            // as the inactivation gate closes.
            maxRotation = Math.PI * 0.4;
            angularRange = (1 - this.channel.getInactivationAmount()) * Math.PI * 0.3;
            minRotation = maxRotation - angularRange;
          } else {
            // Move out to the left (assuming channel is vertical).
            // The angle at which we can move gets more restricted
            // as the inactivation gate closes.
            maxRotation = -Math.PI * 0.4;
            angularRange = (1 - this.channel.getInactivationAmount()) * -Math.PI * 0.1;
            minRotation = maxRotation - angularRange;
          }
          newVelocityVector.rotate(minRotation + dotRandom.nextDouble() * (maxRotation - minRotation));
          movableModelElement.setMotionStrategy(new SpeedChangeLinearMotionStrategy(newVelocityVector, 0.2, 0.0002));
        }
        fadableModelElement.setFadeStrategy(new TimedFadeAwayStrategy(0.003));
      } else {
        // Keep moving towards current destination.
        this.moveBasedOnCurrentVelocity(movableModelElement, dt);
      }
    }
  }

  /**
   * @param {number} posX
   * @param {number} posY
   * @param {Object} traversalPoint - object literal with x and y properties
   * @private
   */
  distanceBetweenPosAndTraversalPoint(posX, posY, traversalPoint) {
    return MathUtils.distanceBetween(posX, posY, traversalPoint.x, traversalPoint.y);
  }

  // @private
  moveBasedOnCurrentVelocity(movable, dt) {
    movable.setPosition(movable.getPositionX() + this.velocityVector.x * dt, movable.getPositionY() + this.velocityVector.y * dt);
  }

  /**
   * Create the points through which a particle must move when traversing
   * this channel.
   *
   * @param {MembraneChannel} channel
   * @param {number} startingPositionX
   * @param {number} startingPositionY
   * @returns {Array.<Vector2>}
   * @private
   */
  createTraversalPoints(channel, startingPositionX, startingPositionY) {
    const points = [];
    const ctr = channel.getCenterPosition();
    const r = channel.getChannelSize().height * 0.5;

    // The profiler shows too many vector instances are created from createTravesal method, Since we are dealing with
    // 1000s of particles, for performance reasons and to reduce memory allocation, changing vector constructor
    // function to use object literal http://jsperf.com/object-notation-vs-constructor.

    // Create points that represent the inner and outer mouths of the channel.
    const outerOpeningPosition = {
      x: ctr.x + Math.cos(channel.getRotationalAngle()) * r,
      y: ctr.y + Math.sin(channel.getRotationalAngle()) * r
    };
    const innerOpeningPosition = {
      x: ctr.x - Math.cos(channel.getRotationalAngle()) * r,
      y: ctr.y - Math.sin(channel.getRotationalAngle()) * r
    };

    // Create a point that just above where the inactivation gate would be if the channel were inactivated.  Since the
    // model doesn't actually track the position of the inactivation gate (it is left up to the view), this position
    // is a guess, and may have to be tweaked in order to work well with the view.
    const aboveInactivationGatePosition = {
      x: ctr.x - Math.cos(channel.getRotationalAngle()) * r * 0.5,
      y: ctr.y - Math.sin(channel.getRotationalAngle()) * r * 0.5
    };
    if (this.distanceBetweenPosAndTraversalPoint(startingPositionX, startingPositionY, innerOpeningPosition) < this.distanceBetweenPosAndTraversalPoint(startingPositionX, startingPositionY, outerOpeningPosition)) {
      points.push(innerOpeningPosition);
      points.push(aboveInactivationGatePosition);
      points.push(outerOpeningPosition);
    } else {
      points.push(outerOpeningPosition);
      points.push(aboveInactivationGatePosition);
      points.push(innerOpeningPosition);
    }
    return points;
  }

  // @private
  setCourseForPoint(startPositionX, startPositionY, destination, velocityScaler) {
    this.velocityVector.setXY(destination.x - startPositionX, destination.y - startPositionY);
    const scaleFactor = this.maxVelocity / this.velocityVector.magnitude;
    this.velocityVector.multiplyScalar(scaleFactor);
  }

  // @private
  setCourseForCurrentTraversalPoint(currentPositionX, currentPositionY) {
    let angularRange = 0;
    if (this.currentDestinationIndex < this.traversalPoints.length) {
      const dest = this.traversalPoints[this.currentDestinationIndex];
      this.velocityVector.setXY(dest.x - currentPositionX, dest.y - currentPositionY);
      const scaleFactor = this.maxVelocity / this.velocityVector.magnitude;
      this.velocityVector.multiplyScalar(scaleFactor);
    } else {
      // All points have been traversed.  The behavior at this point depends on whether the channel has an
      // inactivation gate, since such a gate is depicted on the cell-interior side of the channel in this sim.  No
      // matter whether such a gate exists or not, the particle is re-routed a bit in order to create a bit of a
      // brownian look.  If the gate exists, there are more limitations to where the particle can go.
      if (this.channel.getHasInactivationGate()) {
        // NOTE: The following is tweaked to work with a particular visual representation of the inactivation gate,
        // and may need to be changed if that representation is changed.
        let velocityRotationAngle = 0;
        let minRotation = 0;
        let maxRotation = 0;
        if (dotRandom.nextDouble() > 0.3) {
          // Move out to the right (assuming channel is vertical). The angle at which we can move gets more restricted
          // as the inactivation gate closes.
          maxRotation = Math.PI * 0.4;
          angularRange = (1 - this.channel.getInactivationAmount()) * Math.PI * 0.3;
          minRotation = maxRotation - angularRange;
        } else {
          // Move out to the left (assuming channel is vertical). The angle at which we can move gets more restricted
          // as the inactivation gate closes.
          maxRotation = -Math.PI * 0.4;
          angularRange = (1 - this.channel.getInactivationAmount()) * -Math.PI * 0.1;
          minRotation = maxRotation - angularRange;
        }
        velocityRotationAngle = minRotation + dotRandom.nextDouble() * (maxRotation - minRotation);
        this.velocityVector.rotate(velocityRotationAngle);
      } else {
        this.velocityVector.rotate((dotRandom.nextDouble() - 0.5) * (Math.PI * 0.9) * this.maxVelocity / NeuronConstants.DEFAULT_MAX_VELOCITY);
      }
    }
  }
}
neuron.register('DualGateChannelTraversalMotionStrategy', DualGateChannelTraversalMotionStrategy);
export default DualGateChannelTraversalMotionStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJWZWN0b3IyIiwibmV1cm9uIiwiTWF0aFV0aWxzIiwiTmV1cm9uQ29uc3RhbnRzIiwiTGluZWFyTW90aW9uU3RyYXRlZ3kiLCJNb3Rpb25TdHJhdGVneSIsIlNwZWVkQ2hhbmdlTGluZWFyTW90aW9uU3RyYXRlZ3kiLCJUaW1lZEZhZGVBd2F5U3RyYXRlZ3kiLCJXYW5kZXJBd2F5VGhlbkZhZGVNb3Rpb25TdHJhdGVneSIsIklOQUNUSVZBVElPTl9CT1VOQ0VfVEhSRVNIT0xEIiwiRHVhbEdhdGVDaGFubmVsVHJhdmVyc2FsTW90aW9uU3RyYXRlZ3kiLCJjb25zdHJ1Y3RvciIsImNoYW5uZWwiLCJzdGFydGluZ1Bvc2l0aW9uWCIsInN0YXJ0aW5nUG9zaXRpb25ZIiwibWF4VmVsb2NpdHkiLCJERUZBVUxUX01BWF9WRUxPQ0lUWSIsInZlbG9jaXR5VmVjdG9yIiwidHJhdmVyc2FsUG9pbnRzIiwiY3JlYXRlVHJhdmVyc2FsUG9pbnRzIiwiY3VycmVudERlc3RpbmF0aW9uSW5kZXgiLCJib3VuY2luZyIsInNldENvdXJzZUZvckN1cnJlbnRUcmF2ZXJzYWxQb2ludCIsIm1vdmUiLCJtb3ZhYmxlTW9kZWxFbGVtZW50IiwiZmFkYWJsZU1vZGVsRWxlbWVudCIsImR0IiwiYXNzZXJ0IiwibGVuZ3RoIiwiYW5ndWxhclJhbmdlIiwiY3VycmVudFBvc2l0aW9uUmVmWCIsImdldFBvc2l0aW9uWCIsImN1cnJlbnRQb3NpdGlvblJlZlkiLCJnZXRQb3NpdGlvblkiLCJpc09wZW4iLCJzZXRNb3Rpb25TdHJhdGVneSIsImdldENlbnRlclBvc2l0aW9uIiwiTnVtYmVyIiwiTUFYX1ZBTFVFIiwiZGlzdGFuY2VCZXR3ZWVuUG9zQW5kVHJhdmVyc2FsUG9pbnQiLCJtYWduaXR1ZGUiLCJzZXRQb3NpdGlvbiIsIngiLCJ5Iiwic2V0Q291cnNlRm9yUG9pbnQiLCJtb3ZlQmFzZWRPbkN1cnJlbnRWZWxvY2l0eSIsImdldEluYWN0aXZhdGlvbkFtb3VudCIsIm11bHRpcGx5U2NhbGFyIiwibmV3VmVsb2NpdHlWZWN0b3IiLCJyb3RhdGUiLCJuZXh0RG91YmxlIiwiTWF0aCIsIlBJIiwibWF4Um90YXRpb24iLCJtaW5Sb3RhdGlvbiIsInNldEZhZGVTdHJhdGVneSIsInBvc1giLCJwb3NZIiwidHJhdmVyc2FsUG9pbnQiLCJkaXN0YW5jZUJldHdlZW4iLCJtb3ZhYmxlIiwicG9pbnRzIiwiY3RyIiwiciIsImdldENoYW5uZWxTaXplIiwiaGVpZ2h0Iiwib3V0ZXJPcGVuaW5nUG9zaXRpb24iLCJjb3MiLCJnZXRSb3RhdGlvbmFsQW5nbGUiLCJzaW4iLCJpbm5lck9wZW5pbmdQb3NpdGlvbiIsImFib3ZlSW5hY3RpdmF0aW9uR2F0ZVBvc2l0aW9uIiwicHVzaCIsInN0YXJ0UG9zaXRpb25YIiwic3RhcnRQb3NpdGlvblkiLCJkZXN0aW5hdGlvbiIsInZlbG9jaXR5U2NhbGVyIiwic2V0WFkiLCJzY2FsZUZhY3RvciIsImN1cnJlbnRQb3NpdGlvblgiLCJjdXJyZW50UG9zaXRpb25ZIiwiZGVzdCIsImdldEhhc0luYWN0aXZhdGlvbkdhdGUiLCJ2ZWxvY2l0eVJvdGF0aW9uQW5nbGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkR1YWxHYXRlQ2hhbm5lbFRyYXZlcnNhbE1vdGlvblN0cmF0ZWd5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogQSBtb3Rpb24gc3RyYXRlZ3kgZm9yIHRyYXZlcnNpbmcgdGhyb3VnaCBhIGR1YWwtZ2F0ZWQgY2hhbm5lbCwgbWVhbmluZyBvbmUgdGhhdCBoYXMgYSBnYXRlIGFuZCBhbiBpbmFjdGl2YXRpb24gbGV2ZWwuXHJcbiAqIDxwLz5cclxuICogVGhpcyBzdHJhdGVneSBtYWtlcyBzZXZlcmFsIGFzc3VtcHRpb25zIGFib3V0IHRoZSBuYXR1cmUgb2YgdGhlIGR1YWwtZ2F0ZSBjaGFubmVsIGFuZCBob3cgaXQgaXMgcG9ydHJheWVkLiAgVGhlc2VcclxuICogYXNzdW1wdGlvbnMgZGVwZW5kIGJvdGggb24gdGhlIG1vZGVsIHJlcHJlc2VudGF0aW9uIGFuZCB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZHVhbC1nYXRlZCBjaGFubmVsLiBJZiBjaGFuZ2VzXHJcbiAqIGFyZSBtYWRlIHRvIGVpdGhlciwgdGhpcyBjbGFzcyBtYXkgbmVlZCB0byBiZSByZXZpc2VkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG5ldXJvbiBmcm9tICcuLi8uLi9uZXVyb24uanMnO1xyXG5pbXBvcnQgTWF0aFV0aWxzIGZyb20gJy4uL2NvbW1vbi9NYXRoVXRpbHMuanMnO1xyXG5pbXBvcnQgTmV1cm9uQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9OZXVyb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgTGluZWFyTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi9MaW5lYXJNb3Rpb25TdHJhdGVneS5qcyc7XHJcbmltcG9ydCBNb3Rpb25TdHJhdGVneSBmcm9tICcuL01vdGlvblN0cmF0ZWd5LmpzJztcclxuaW1wb3J0IFNwZWVkQ2hhbmdlTGluZWFyTW90aW9uU3RyYXRlZ3kgZnJvbSAnLi9TcGVlZENoYW5nZUxpbmVhck1vdGlvblN0cmF0ZWd5LmpzJztcclxuaW1wb3J0IFRpbWVkRmFkZUF3YXlTdHJhdGVneSBmcm9tICcuL1RpbWVkRmFkZUF3YXlTdHJhdGVneS5qcyc7XHJcbmltcG9ydCBXYW5kZXJBd2F5VGhlbkZhZGVNb3Rpb25TdHJhdGVneSBmcm9tICcuL1dhbmRlckF3YXlUaGVuRmFkZU1vdGlvblN0cmF0ZWd5LmpzJztcclxuXHJcbi8vIFRocmVzaG9sZCBhdCB3aGljaCBwYXJ0aWNsZXMgd2lsbCBcImJvdW5jZVwiIGJhY2sgb3V0IG9mIHRoZSBjaGFubmVsIHJhdGhlciB0aGFuIHRyYXZlcnNpbmcgaXQuXHJcbmNvbnN0IElOQUNUSVZBVElPTl9CT1VOQ0VfVEhSRVNIT0xEID0gMC41O1xyXG5cclxuY2xhc3MgRHVhbEdhdGVDaGFubmVsVHJhdmVyc2FsTW90aW9uU3RyYXRlZ3kgZXh0ZW5kcyBNb3Rpb25TdHJhdGVneSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWVtYnJhbmVDaGFubmVsfSBjaGFubmVsXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0aW5nUG9zaXRpb25YXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0aW5nUG9zaXRpb25ZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFZlbG9jaXR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYW5uZWwsIHN0YXJ0aW5nUG9zaXRpb25YLCBzdGFydGluZ1Bvc2l0aW9uWSwgbWF4VmVsb2NpdHkgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgbWF4VmVsb2NpdHkgPSBtYXhWZWxvY2l0eSB8fCBOZXVyb25Db25zdGFudHMuREVGQVVMVF9NQVhfVkVMT0NJVFk7XHJcbiAgICB0aGlzLnZlbG9jaXR5VmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcbiAgICB0aGlzLm1heFZlbG9jaXR5ID0gbWF4VmVsb2NpdHk7XHJcblxyXG4gICAgLy8gSG9sZHMgYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHggYW5kIHkgcHJvcGVydGllcyAoZG9lc24ndCB1c2UgdmVjdG9yIGZvciBwZXJmb3JtYW5jZSByZWFzb25zKVxyXG4gICAgLy8gaHR0cDovL2pzcGVyZi5jb20vb2JqZWN0LW5vdGF0aW9uLXZzLWNvbnN0cnVjdG9yXHJcbiAgICB0aGlzLnRyYXZlcnNhbFBvaW50cyA9IHRoaXMuY3JlYXRlVHJhdmVyc2FsUG9pbnRzKCBjaGFubmVsLCBzdGFydGluZ1Bvc2l0aW9uWCwgc3RhcnRpbmdQb3NpdGlvblkgKTsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuY3VycmVudERlc3RpbmF0aW9uSW5kZXggPSAwOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5ib3VuY2luZyA9IGZhbHNlOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zZXRDb3Vyc2VGb3JDdXJyZW50VHJhdmVyc2FsUG9pbnQoIHN0YXJ0aW5nUG9zaXRpb25YLCBzdGFydGluZ1Bvc2l0aW9uWSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYywgQG92ZXJyaWRlXHJcbiAgbW92ZSggbW92YWJsZU1vZGVsRWxlbWVudCwgZmFkYWJsZU1vZGVsRWxlbWVudCwgZHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IDwgdGhpcy50cmF2ZXJzYWxQb2ludHMubGVuZ3RoICk7ICAvLyBFcnJvciBjaGVja2luZy5cclxuICAgIGxldCBhbmd1bGFyUmFuZ2UgPSAwO1xyXG4gICAgY29uc3QgY3VycmVudFBvc2l0aW9uUmVmWCA9IG1vdmFibGVNb2RlbEVsZW1lbnQuZ2V0UG9zaXRpb25YKCk7XHJcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb25SZWZZID0gbW92YWJsZU1vZGVsRWxlbWVudC5nZXRQb3NpdGlvblkoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuY3VycmVudERlc3RpbmF0aW9uSW5kZXggPT09IDAgKSB7XHJcbiAgICAgIC8vIEN1cnJlbnRseSBtb3ZpbmcgdG93YXJkcyB0aGUgZmlyc3QgZGVzdGluYXRpb24gcG9pbnQuICBJcyB0aGVcclxuICAgICAgLy8gY2hhbm5lbCBzdGlsbCBvcGVuP1xyXG4gICAgICBpZiAoICF0aGlzLmNoYW5uZWwuaXNPcGVuKCkgKSB7XHJcbiAgICAgICAgLy8gVGhlIGNoYW5uZWwgaGFzIGNsb3NlZCwgc28gdGhlcmUgaXMgbm8gc2Vuc2UgaW4gY29udGludWluZ1xyXG4gICAgICAgIC8vIHRvd2FyZHMgaXQuICBUaGUgcGFydGljbGUgc2hvdWxkIHdhbmRlciBhbmQgdGhlbiBmYWRlIG91dC5cclxuICAgICAgICBtb3ZhYmxlTW9kZWxFbGVtZW50LnNldE1vdGlvblN0cmF0ZWd5KCBuZXcgV2FuZGVyQXdheVRoZW5GYWRlTW90aW9uU3RyYXRlZ3koIHRoaXMuY2hhbm5lbC5nZXRDZW50ZXJQb3NpdGlvbigpLCBtb3ZhYmxlTW9kZWxFbGVtZW50LmdldFBvc2l0aW9uWCgpLCBtb3ZhYmxlTW9kZWxFbGVtZW50LmdldFBvc2l0aW9uWSgpLCAwLCAwLjAwMiApICk7XHJcbiAgICAgICAgLy8gRm9yIGVycm9yIGNoZWNraW5nLCBzZXQgdGhlIGRlc3RpbmF0aW9uIGluZGV4IHJlYWxseSBoaWdoLlxyXG4gICAgICAgIC8vIFRoYXQgd2F5IGl0IHdpbGwgYmUgZGV0ZWN0ZWQgaWYgdGhpcyBzdHJhdGVneSBpbnN0YW5jZSBpc1xyXG4gICAgICAgIC8vIHVzZWQgYWdhaW4uXHJcbiAgICAgICAgdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMuZGlzdGFuY2VCZXR3ZWVuUG9zQW5kVHJhdmVyc2FsUG9pbnQoIGN1cnJlbnRQb3NpdGlvblJlZlgsIGN1cnJlbnRQb3NpdGlvblJlZlksIHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF0gKSA8IHRoaXMudmVsb2NpdHlWZWN0b3IubWFnbml0dWRlICogZHQgKSB7XHJcbiAgICAgICAgLy8gV2UgaGF2ZSBhcnJpdmVkIGF0IHRoZSBmaXJzdCB0cmF2ZXJzYWwgcG9pbnQsIHNvIG5vdyBzdGFydFxyXG4gICAgICAgIC8vIGhlYWRpbmcgdG93YXJkcyB0aGUgc2Vjb25kLlxyXG4gICAgICAgIG1vdmFibGVNb2RlbEVsZW1lbnQuc2V0UG9zaXRpb24oIHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF0ueCwgdGhpcy50cmF2ZXJzYWxQb2ludHNbIHRoaXMuY3VycmVudERlc3RpbmF0aW9uSW5kZXggXS55ICk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCsrO1xyXG4gICAgICAgIHRoaXMuc2V0Q291cnNlRm9yUG9pbnQoIG1vdmFibGVNb2RlbEVsZW1lbnQuZ2V0UG9zaXRpb25YKCksIG1vdmFibGVNb2RlbEVsZW1lbnQuZ2V0UG9zaXRpb25ZKCksIHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF0sXHJcbiAgICAgICAgICB0aGlzLnZlbG9jaXR5VmVjdG9yLm1hZ25pdHVkZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIEtlZXAgbW92aW5nIHRvd2FyZHMgY3VycmVudCBkZXN0aW5hdGlvbi5cclxuICAgICAgICB0aGlzLm1vdmVCYXNlZE9uQ3VycmVudFZlbG9jaXR5KCBtb3ZhYmxlTW9kZWxFbGVtZW50LCBkdCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCA9PT0gMSApIHtcclxuICAgICAgLy8gQ3VycmVudGx5IG1vdmluZyB0b3dhcmRzIHRoZSAybmQgcG9pbnQsIHdoaWNoIGlzIGluIHRoZVxyXG4gICAgICAvLyBjaGFubmVsIGp1c3QgYWJvdmUgd2hlcmUgdGhlIGluYWN0aXZhdGlvbiBnYXRlIGFwcGVhcnMuXHJcbiAgICAgIGlmICggdGhpcy5jaGFubmVsLmdldEluYWN0aXZhdGlvbkFtb3VudCgpID4gSU5BQ1RJVkFUSU9OX0JPVU5DRV9USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgLy8gVGhlIGluYWN0aXZhdGlvbiB0aHJlc2hvbGQgaGFzIGJlZW4gcmVhY2hlZCwgc28gd2UgY2FuJ3RcclxuICAgICAgICAvLyBmaW5pc2ggdHJhdmVyc2luZyB0aGUgY2hhbm5lbCBhbmQgbmVlZCB0byBib3VuY2UuICBDaGVja1xyXG4gICAgICAgIC8vIHdoZXRoZXIgd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoaXMuXHJcbiAgICAgICAgaWYgKCAhdGhpcy5ib3VuY2luZyApIHtcclxuICAgICAgICAgIC8vIFNldCB0aGUgcGFydGljbGUgdXAgdG8gXCJib3VuY2VcIiwgaS5lLiB0byB0dXJuIGFyb3VuZFxyXG4gICAgICAgICAgLy8gYW5kIGdvIGJhY2sgd2hlbmNlIGl0IGNhbWUgb25jZSBpdCByZWFjaGVzIHRoZSAybmRcclxuICAgICAgICAgIC8vIHBvaW50LlxyXG4gICAgICAgICAgdGhpcy50cmF2ZXJzYWxQb2ludHNbIDIgXS54ID0gdGhpcy50cmF2ZXJzYWxQb2ludHNbIDAgXS54O1xyXG4gICAgICAgICAgdGhpcy50cmF2ZXJzYWxQb2ludHNbIDIgXS55ID0gdGhpcy50cmF2ZXJzYWxQb2ludHNbIDAgXS55O1xyXG5cclxuICAgICAgICAgIHRoaXMuYm91bmNpbmcgPSB0cnVlOyAvLyBGbGFnIGZvciB0cmFja2luZyB0aGF0IHdlIG5lZWQgdG8gYm91bmNlLlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMuZGlzdGFuY2VCZXR3ZWVuUG9zQW5kVHJhdmVyc2FsUG9pbnQoIGN1cnJlbnRQb3NpdGlvblJlZlgsIGN1cnJlbnRQb3NpdGlvblJlZlksIHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF0gKSA8IHRoaXMudmVsb2NpdHlWZWN0b3IubWFnbml0dWRlICogZHQgKSB7XHJcbiAgICAgICAgLy8gVGhlIGVsZW1lbnQgaGFzIHJlYWNoZWQgdGhlIGN1cnJlbnQgdHJhdmVyc2FsIHBvaW50LCBzb1xyXG4gICAgICAgIC8vIGl0IHNob3VsZCBzdGFydCBtb3ZpbmcgdG93YXJkcyB0aGUgbmV4dC5cclxuICAgICAgICBtb3ZhYmxlTW9kZWxFbGVtZW50LnNldFBvc2l0aW9uKCB0aGlzLnRyYXZlcnNhbFBvaW50c1sgdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCBdLngsIHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF0ueSApO1xyXG4gICAgICAgIHRoaXMuY3VycmVudERlc3RpbmF0aW9uSW5kZXgrKztcclxuICAgICAgICB0aGlzLnNldENvdXJzZUZvclBvaW50KCBtb3ZhYmxlTW9kZWxFbGVtZW50LmdldFBvc2l0aW9uWCgpLCBtb3ZhYmxlTW9kZWxFbGVtZW50LmdldFBvc2l0aW9uWSgpLCB0aGlzLnRyYXZlcnNhbFBvaW50c1sgdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCBdLFxyXG4gICAgICAgICAgdGhpcy52ZWxvY2l0eVZlY3Rvci5tYWduaXR1ZGUgKTtcclxuICAgICAgICBpZiAoIHRoaXMuYm91bmNpbmcgKSB7XHJcbiAgICAgICAgICAvLyBTbG93IGRvd24gaWYgd2UgYXJlIGJvdW5jaW5nIC0gaXQgbG9va3MgYmV0dGVyIHRoaXMgd2F5LlxyXG4gICAgICAgICAgdGhpcy52ZWxvY2l0eVZlY3Rvci5tdWx0aXBseVNjYWxhciggMC41ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIEtlZXAgbW92aW5nIHRvd2FyZHMgY3VycmVudCBkZXN0aW5hdGlvbi5cclxuICAgICAgICB0aGlzLm1vdmVCYXNlZE9uQ3VycmVudFZlbG9jaXR5KCBtb3ZhYmxlTW9kZWxFbGVtZW50LCBkdCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCA9PT0gMiApIHtcclxuICAgICAgLy8gQ3VycmVudGx5IG1vdmluZyB0b3dhcmRzIHRoZSAzcmQgcG9pbnQuXHJcbiAgICAgIGlmICggdGhpcy5kaXN0YW5jZUJldHdlZW5Qb3NBbmRUcmF2ZXJzYWxQb2ludCggY3VycmVudFBvc2l0aW9uUmVmWCwgY3VycmVudFBvc2l0aW9uUmVmWSwgdGhpcy50cmF2ZXJzYWxQb2ludHNbIHRoaXMuY3VycmVudERlc3RpbmF0aW9uSW5kZXggXSApIDwgdGhpcy52ZWxvY2l0eVZlY3Rvci5tYWduaXR1ZGUgKiBkdCApIHtcclxuICAgICAgICAvLyBUaGUgZWxlbWVudCBoYXMgcmVhY2hlZCB0aGUgbGFzdCB0cmF2ZXJzYWwgcG9pbnQsIHNvIGFcclxuICAgICAgICAvLyBuZXcgbW90aW9uIHN0cmF0ZWd5IGlzIHNldCB0byBoYXZlIGl0IG1vdmUgYXdheSBhbmQgdGhlblxyXG4gICAgICAgIC8vIGZhZGUgb3V0LlxyXG5cclxuICAgICAgICBtb3ZhYmxlTW9kZWxFbGVtZW50LnNldFBvc2l0aW9uKCB0aGlzLnRyYXZlcnNhbFBvaW50c1sgdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCBdLngsIHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF0ueSApO1xyXG4gICAgICAgIHRoaXMuY3VycmVudERlc3RpbmF0aW9uSW5kZXggPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIGNvbnN0IG5ld1ZlbG9jaXR5VmVjdG9yID0gbmV3IFZlY3RvcjIoIHRoaXMudmVsb2NpdHlWZWN0b3IueCwgdGhpcy52ZWxvY2l0eVZlY3Rvci55ICk7XHJcbiAgICAgICAgaWYgKCB0aGlzLmJvdW5jaW5nICkge1xyXG4gICAgICAgICAgLy8gVGhpcyBwYXJ0aWNsZSBzaG91bGQgYmUgYmFjayB3aGVyZSBpdCBlbnRlcmVkIHRoZVxyXG4gICAgICAgICAgLy8gY2hhbm5lbCwgYW5kIGNhbiBoZWFkIG9mZiBpbiBhbnkgZGlyZWN0aW9uIGV4Y2VwdFxyXG4gICAgICAgICAgLy8gYmFjayB0b3dhcmQgdGhlIG1lbWJyYW5lLlxyXG4gICAgICAgICAgbmV3VmVsb2NpdHlWZWN0b3Iucm90YXRlKCAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIE1hdGguUEkgKTtcclxuICAgICAgICAgIG5ld1ZlbG9jaXR5VmVjdG9yLm11bHRpcGx5U2NhbGFyKCAwLjMgKyAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAwLjIgKSApO1xyXG4gICAgICAgICAgbW92YWJsZU1vZGVsRWxlbWVudC5zZXRNb3Rpb25TdHJhdGVneSggbmV3IExpbmVhck1vdGlvblN0cmF0ZWd5KCBuZXdWZWxvY2l0eVZlY3RvciApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gVGhlIHBhcnRpY2xlIGlzIGV4aXN0aW5nIHRoZSBwYXJ0IG9mIHRoZSBjaGFubmVsIHdoZXJlXHJcbiAgICAgICAgICAvLyB0aGUgaW5hY3RpdmF0aW9uIGdhdGUgZXhpc3RzLCBzbyBpdCBuZWVkcyB0byB0YWtlIG9uIGFcclxuICAgICAgICAgIC8vIG5ldyBjb3Vyc2UgdGhhdCBhdm9pZHMgdGhlIGdhdGUuICBOb3RlIHRoYXQgdGhpcyBpcyBzZXRcclxuICAgICAgICAgIC8vIHVwIHRvIHdvcmsgd2l0aCBhIHNwZWNpZmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZVxyXG4gICAgICAgICAgLy8gaW5hY3RpdmF0aW9uIGdhdGUsIGFuZCB3aWxsIG5lZWQgdG8gYmUgY2hhbmdlZCBpZiB0aGVcclxuICAgICAgICAgIC8vIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnYXRlIGlzIGNoYW5nZWQuXHJcbiAgICAgICAgICBuZXdWZWxvY2l0eVZlY3Rvci5tdWx0aXBseVNjYWxhciggMC41ICsgKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMC4zICkgKTtcclxuICAgICAgICAgIGxldCBtYXhSb3RhdGlvbjtcclxuICAgICAgICAgIGxldCBtaW5Sb3RhdGlvbjtcclxuICAgICAgICAgIGlmICggZG90UmFuZG9tLm5leHREb3VibGUoKSA+IDAuMyApIHtcclxuICAgICAgICAgICAgLy8gTW92ZSBvdXQgdG8gdGhlIHJpZ2h0IChhc3N1bWluZyBjaGFubmVsIGlzIHZlcnRpY2FsKS5cclxuICAgICAgICAgICAgLy8gVGhlIGFuZ2xlIGF0IHdoaWNoIHdlIGNhbiBtb3ZlIGdldHMgbW9yZSByZXN0cmljdGVkXHJcbiAgICAgICAgICAgIC8vIGFzIHRoZSBpbmFjdGl2YXRpb24gZ2F0ZSBjbG9zZXMuXHJcbiAgICAgICAgICAgIG1heFJvdGF0aW9uID0gTWF0aC5QSSAqIDAuNDtcclxuICAgICAgICAgICAgYW5ndWxhclJhbmdlID0gKCAxIC0gdGhpcy5jaGFubmVsLmdldEluYWN0aXZhdGlvbkFtb3VudCgpICkgKiBNYXRoLlBJICogMC4zO1xyXG4gICAgICAgICAgICBtaW5Sb3RhdGlvbiA9IG1heFJvdGF0aW9uIC0gYW5ndWxhclJhbmdlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE1vdmUgb3V0IHRvIHRoZSBsZWZ0IChhc3N1bWluZyBjaGFubmVsIGlzIHZlcnRpY2FsKS5cclxuICAgICAgICAgICAgLy8gVGhlIGFuZ2xlIGF0IHdoaWNoIHdlIGNhbiBtb3ZlIGdldHMgbW9yZSByZXN0cmljdGVkXHJcbiAgICAgICAgICAgIC8vIGFzIHRoZSBpbmFjdGl2YXRpb24gZ2F0ZSBjbG9zZXMuXHJcbiAgICAgICAgICAgIG1heFJvdGF0aW9uID0gLU1hdGguUEkgKiAwLjQ7XHJcbiAgICAgICAgICAgIGFuZ3VsYXJSYW5nZSA9ICggMSAtIHRoaXMuY2hhbm5lbC5nZXRJbmFjdGl2YXRpb25BbW91bnQoKSApICogLU1hdGguUEkgKiAwLjE7XHJcbiAgICAgICAgICAgIG1pblJvdGF0aW9uID0gbWF4Um90YXRpb24gLSBhbmd1bGFyUmFuZ2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBuZXdWZWxvY2l0eVZlY3Rvci5yb3RhdGUoIG1pblJvdGF0aW9uICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAqICggbWF4Um90YXRpb24gLSBtaW5Sb3RhdGlvbiApICk7XHJcbiAgICAgICAgICBtb3ZhYmxlTW9kZWxFbGVtZW50LnNldE1vdGlvblN0cmF0ZWd5KCBuZXcgU3BlZWRDaGFuZ2VMaW5lYXJNb3Rpb25TdHJhdGVneSggbmV3VmVsb2NpdHlWZWN0b3IsIDAuMiwgMC4wMDAyICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmFkYWJsZU1vZGVsRWxlbWVudC5zZXRGYWRlU3RyYXRlZ3koIG5ldyBUaW1lZEZhZGVBd2F5U3RyYXRlZ3koIDAuMDAzICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBLZWVwIG1vdmluZyB0b3dhcmRzIGN1cnJlbnQgZGVzdGluYXRpb24uXHJcbiAgICAgICAgdGhpcy5tb3ZlQmFzZWRPbkN1cnJlbnRWZWxvY2l0eSggbW92YWJsZU1vZGVsRWxlbWVudCwgZHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBvc1hcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9zWVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmF2ZXJzYWxQb2ludCAtIG9iamVjdCBsaXRlcmFsIHdpdGggeCBhbmQgeSBwcm9wZXJ0aWVzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkaXN0YW5jZUJldHdlZW5Qb3NBbmRUcmF2ZXJzYWxQb2ludCggcG9zWCwgcG9zWSwgdHJhdmVyc2FsUG9pbnQgKSB7XHJcbiAgICByZXR1cm4gTWF0aFV0aWxzLmRpc3RhbmNlQmV0d2VlbiggcG9zWCwgcG9zWSwgdHJhdmVyc2FsUG9pbnQueCwgdHJhdmVyc2FsUG9pbnQueSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBtb3ZlQmFzZWRPbkN1cnJlbnRWZWxvY2l0eSggbW92YWJsZSwgZHQgKSB7XHJcbiAgICBtb3ZhYmxlLnNldFBvc2l0aW9uKCBtb3ZhYmxlLmdldFBvc2l0aW9uWCgpICsgdGhpcy52ZWxvY2l0eVZlY3Rvci54ICogZHQsXHJcbiAgICAgIG1vdmFibGUuZ2V0UG9zaXRpb25ZKCkgKyB0aGlzLnZlbG9jaXR5VmVjdG9yLnkgKiBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIHRoZSBwb2ludHMgdGhyb3VnaCB3aGljaCBhIHBhcnRpY2xlIG11c3QgbW92ZSB3aGVuIHRyYXZlcnNpbmdcclxuICAgKiB0aGlzIGNoYW5uZWwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01lbWJyYW5lQ2hhbm5lbH0gY2hhbm5lbFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydGluZ1Bvc2l0aW9uWFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydGluZ1Bvc2l0aW9uWVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48VmVjdG9yMj59XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVUcmF2ZXJzYWxQb2ludHMoIGNoYW5uZWwsIHN0YXJ0aW5nUG9zaXRpb25YLCBzdGFydGluZ1Bvc2l0aW9uWSApIHtcclxuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xyXG4gICAgY29uc3QgY3RyID0gY2hhbm5lbC5nZXRDZW50ZXJQb3NpdGlvbigpO1xyXG4gICAgY29uc3QgciA9IGNoYW5uZWwuZ2V0Q2hhbm5lbFNpemUoKS5oZWlnaHQgKiAwLjU7XHJcblxyXG4gICAgLy8gVGhlIHByb2ZpbGVyIHNob3dzIHRvbyBtYW55IHZlY3RvciBpbnN0YW5jZXMgYXJlIGNyZWF0ZWQgZnJvbSBjcmVhdGVUcmF2ZXNhbCBtZXRob2QsIFNpbmNlIHdlIGFyZSBkZWFsaW5nIHdpdGhcclxuICAgIC8vIDEwMDBzIG9mIHBhcnRpY2xlcywgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgYW5kIHRvIHJlZHVjZSBtZW1vcnkgYWxsb2NhdGlvbiwgY2hhbmdpbmcgdmVjdG9yIGNvbnN0cnVjdG9yXHJcbiAgICAvLyBmdW5jdGlvbiB0byB1c2Ugb2JqZWN0IGxpdGVyYWwgaHR0cDovL2pzcGVyZi5jb20vb2JqZWN0LW5vdGF0aW9uLXZzLWNvbnN0cnVjdG9yLlxyXG5cclxuICAgIC8vIENyZWF0ZSBwb2ludHMgdGhhdCByZXByZXNlbnQgdGhlIGlubmVyIGFuZCBvdXRlciBtb3V0aHMgb2YgdGhlIGNoYW5uZWwuXHJcbiAgICBjb25zdCBvdXRlck9wZW5pbmdQb3NpdGlvbiA9IHtcclxuICAgICAgeDogY3RyLnggKyBNYXRoLmNvcyggY2hhbm5lbC5nZXRSb3RhdGlvbmFsQW5nbGUoKSApICogcixcclxuICAgICAgeTogY3RyLnkgKyBNYXRoLnNpbiggY2hhbm5lbC5nZXRSb3RhdGlvbmFsQW5nbGUoKSApICogclxyXG4gICAgfTtcclxuICAgIGNvbnN0IGlubmVyT3BlbmluZ1Bvc2l0aW9uID0ge1xyXG4gICAgICB4OiBjdHIueCAtIE1hdGguY29zKCBjaGFubmVsLmdldFJvdGF0aW9uYWxBbmdsZSgpICkgKiByLFxyXG4gICAgICB5OiBjdHIueSAtIE1hdGguc2luKCBjaGFubmVsLmdldFJvdGF0aW9uYWxBbmdsZSgpICkgKiByXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHBvaW50IHRoYXQganVzdCBhYm92ZSB3aGVyZSB0aGUgaW5hY3RpdmF0aW9uIGdhdGUgd291bGQgYmUgaWYgdGhlIGNoYW5uZWwgd2VyZSBpbmFjdGl2YXRlZC4gIFNpbmNlIHRoZVxyXG4gICAgLy8gbW9kZWwgZG9lc24ndCBhY3R1YWxseSB0cmFjayB0aGUgcG9zaXRpb24gb2YgdGhlIGluYWN0aXZhdGlvbiBnYXRlIChpdCBpcyBsZWZ0IHVwIHRvIHRoZSB2aWV3KSwgdGhpcyBwb3NpdGlvblxyXG4gICAgLy8gaXMgYSBndWVzcywgYW5kIG1heSBoYXZlIHRvIGJlIHR3ZWFrZWQgaW4gb3JkZXIgdG8gd29yayB3ZWxsIHdpdGggdGhlIHZpZXcuXHJcbiAgICBjb25zdCBhYm92ZUluYWN0aXZhdGlvbkdhdGVQb3NpdGlvbiA9XHJcbiAgICAgIHtcclxuICAgICAgICB4OiBjdHIueCAtIE1hdGguY29zKCBjaGFubmVsLmdldFJvdGF0aW9uYWxBbmdsZSgpICkgKiByICogMC41LFxyXG4gICAgICAgIHk6IGN0ci55IC0gTWF0aC5zaW4oIGNoYW5uZWwuZ2V0Um90YXRpb25hbEFuZ2xlKCkgKSAqIHIgKiAwLjVcclxuICAgICAgfTtcclxuXHJcbiAgICBpZiAoIHRoaXMuZGlzdGFuY2VCZXR3ZWVuUG9zQW5kVHJhdmVyc2FsUG9pbnQoIHN0YXJ0aW5nUG9zaXRpb25YLCBzdGFydGluZ1Bvc2l0aW9uWSwgaW5uZXJPcGVuaW5nUG9zaXRpb24gKSA8IHRoaXMuZGlzdGFuY2VCZXR3ZWVuUG9zQW5kVHJhdmVyc2FsUG9pbnQoIHN0YXJ0aW5nUG9zaXRpb25YLCBzdGFydGluZ1Bvc2l0aW9uWSwgb3V0ZXJPcGVuaW5nUG9zaXRpb24gKSApIHtcclxuICAgICAgcG9pbnRzLnB1c2goIGlubmVyT3BlbmluZ1Bvc2l0aW9uICk7XHJcbiAgICAgIHBvaW50cy5wdXNoKCBhYm92ZUluYWN0aXZhdGlvbkdhdGVQb3NpdGlvbiApO1xyXG4gICAgICBwb2ludHMucHVzaCggb3V0ZXJPcGVuaW5nUG9zaXRpb24gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwb2ludHMucHVzaCggb3V0ZXJPcGVuaW5nUG9zaXRpb24gKTtcclxuICAgICAgcG9pbnRzLnB1c2goIGFib3ZlSW5hY3RpdmF0aW9uR2F0ZVBvc2l0aW9uICk7XHJcbiAgICAgIHBvaW50cy5wdXNoKCBpbm5lck9wZW5pbmdQb3NpdGlvbiApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb2ludHM7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHNldENvdXJzZUZvclBvaW50KCBzdGFydFBvc2l0aW9uWCwgc3RhcnRQb3NpdGlvblksIGRlc3RpbmF0aW9uLCB2ZWxvY2l0eVNjYWxlciApIHtcclxuICAgIHRoaXMudmVsb2NpdHlWZWN0b3Iuc2V0WFkoIGRlc3RpbmF0aW9uLnggLSBzdGFydFBvc2l0aW9uWCxcclxuICAgICAgZGVzdGluYXRpb24ueSAtIHN0YXJ0UG9zaXRpb25ZICk7XHJcbiAgICBjb25zdCBzY2FsZUZhY3RvciA9IHRoaXMubWF4VmVsb2NpdHkgLyB0aGlzLnZlbG9jaXR5VmVjdG9yLm1hZ25pdHVkZTtcclxuICAgIHRoaXMudmVsb2NpdHlWZWN0b3IubXVsdGlwbHlTY2FsYXIoIHNjYWxlRmFjdG9yICk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBzZXRDb3Vyc2VGb3JDdXJyZW50VHJhdmVyc2FsUG9pbnQoIGN1cnJlbnRQb3NpdGlvblgsIGN1cnJlbnRQb3NpdGlvblkgKSB7XHJcbiAgICBsZXQgYW5ndWxhclJhbmdlID0gMDtcclxuICAgIGlmICggdGhpcy5jdXJyZW50RGVzdGluYXRpb25JbmRleCA8IHRoaXMudHJhdmVyc2FsUG9pbnRzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZGVzdCA9IHRoaXMudHJhdmVyc2FsUG9pbnRzWyB0aGlzLmN1cnJlbnREZXN0aW5hdGlvbkluZGV4IF07XHJcbiAgICAgIHRoaXMudmVsb2NpdHlWZWN0b3Iuc2V0WFkoIGRlc3QueCAtIGN1cnJlbnRQb3NpdGlvblgsIGRlc3QueSAtIGN1cnJlbnRQb3NpdGlvblkgKTtcclxuICAgICAgY29uc3Qgc2NhbGVGYWN0b3IgPSB0aGlzLm1heFZlbG9jaXR5IC8gdGhpcy52ZWxvY2l0eVZlY3Rvci5tYWduaXR1ZGU7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlWZWN0b3IubXVsdGlwbHlTY2FsYXIoIHNjYWxlRmFjdG9yICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gQWxsIHBvaW50cyBoYXZlIGJlZW4gdHJhdmVyc2VkLiAgVGhlIGJlaGF2aW9yIGF0IHRoaXMgcG9pbnQgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZSBjaGFubmVsIGhhcyBhblxyXG4gICAgICAvLyBpbmFjdGl2YXRpb24gZ2F0ZSwgc2luY2Ugc3VjaCBhIGdhdGUgaXMgZGVwaWN0ZWQgb24gdGhlIGNlbGwtaW50ZXJpb3Igc2lkZSBvZiB0aGUgY2hhbm5lbCBpbiB0aGlzIHNpbS4gIE5vXHJcbiAgICAgIC8vIG1hdHRlciB3aGV0aGVyIHN1Y2ggYSBnYXRlIGV4aXN0cyBvciBub3QsIHRoZSBwYXJ0aWNsZSBpcyByZS1yb3V0ZWQgYSBiaXQgaW4gb3JkZXIgdG8gY3JlYXRlIGEgYml0IG9mIGFcclxuICAgICAgLy8gYnJvd25pYW4gbG9vay4gIElmIHRoZSBnYXRlIGV4aXN0cywgdGhlcmUgYXJlIG1vcmUgbGltaXRhdGlvbnMgdG8gd2hlcmUgdGhlIHBhcnRpY2xlIGNhbiBnby5cclxuICAgICAgaWYgKCB0aGlzLmNoYW5uZWwuZ2V0SGFzSW5hY3RpdmF0aW9uR2F0ZSgpICkge1xyXG4gICAgICAgIC8vIE5PVEU6IFRoZSBmb2xsb3dpbmcgaXMgdHdlYWtlZCB0byB3b3JrIHdpdGggYSBwYXJ0aWN1bGFyIHZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgaW5hY3RpdmF0aW9uIGdhdGUsXHJcbiAgICAgICAgLy8gYW5kIG1heSBuZWVkIHRvIGJlIGNoYW5nZWQgaWYgdGhhdCByZXByZXNlbnRhdGlvbiBpcyBjaGFuZ2VkLlxyXG4gICAgICAgIGxldCB2ZWxvY2l0eVJvdGF0aW9uQW5nbGUgPSAwO1xyXG4gICAgICAgIGxldCBtaW5Sb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgbGV0IG1heFJvdGF0aW9uID0gMDtcclxuICAgICAgICBpZiAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPiAwLjMgKSB7XHJcbiAgICAgICAgICAvLyBNb3ZlIG91dCB0byB0aGUgcmlnaHQgKGFzc3VtaW5nIGNoYW5uZWwgaXMgdmVydGljYWwpLiBUaGUgYW5nbGUgYXQgd2hpY2ggd2UgY2FuIG1vdmUgZ2V0cyBtb3JlIHJlc3RyaWN0ZWRcclxuICAgICAgICAgIC8vIGFzIHRoZSBpbmFjdGl2YXRpb24gZ2F0ZSBjbG9zZXMuXHJcbiAgICAgICAgICBtYXhSb3RhdGlvbiA9IE1hdGguUEkgKiAwLjQ7XHJcbiAgICAgICAgICBhbmd1bGFyUmFuZ2UgPSAoIDEgLSB0aGlzLmNoYW5uZWwuZ2V0SW5hY3RpdmF0aW9uQW1vdW50KCkgKSAqIE1hdGguUEkgKiAwLjM7XHJcbiAgICAgICAgICBtaW5Sb3RhdGlvbiA9IG1heFJvdGF0aW9uIC0gYW5ndWxhclJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIE1vdmUgb3V0IHRvIHRoZSBsZWZ0IChhc3N1bWluZyBjaGFubmVsIGlzIHZlcnRpY2FsKS4gVGhlIGFuZ2xlIGF0IHdoaWNoIHdlIGNhbiBtb3ZlIGdldHMgbW9yZSByZXN0cmljdGVkXHJcbiAgICAgICAgICAvLyBhcyB0aGUgaW5hY3RpdmF0aW9uIGdhdGUgY2xvc2VzLlxyXG4gICAgICAgICAgbWF4Um90YXRpb24gPSAtTWF0aC5QSSAqIDAuNDtcclxuICAgICAgICAgIGFuZ3VsYXJSYW5nZSA9ICggMSAtIHRoaXMuY2hhbm5lbC5nZXRJbmFjdGl2YXRpb25BbW91bnQoKSApICogLU1hdGguUEkgKiAwLjE7XHJcbiAgICAgICAgICBtaW5Sb3RhdGlvbiA9IG1heFJvdGF0aW9uIC0gYW5ndWxhclJhbmdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2ZWxvY2l0eVJvdGF0aW9uQW5nbGUgPSBtaW5Sb3RhdGlvbiArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAoIG1heFJvdGF0aW9uIC0gbWluUm90YXRpb24gKTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5VmVjdG9yLnJvdGF0ZSggdmVsb2NpdHlSb3RhdGlvbkFuZ2xlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eVZlY3Rvci5yb3RhdGUoICggZG90UmFuZG9tLm5leHREb3VibGUoKSAtIDAuNSApICogKCBNYXRoLlBJICogMC45ICkgKiB0aGlzLm1heFZlbG9jaXR5IC8gTmV1cm9uQ29uc3RhbnRzLkRFRkFVTFRfTUFYX1ZFTE9DSVRZICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfVxyXG59XHJcblxyXG5uZXVyb24ucmVnaXN0ZXIoICdEdWFsR2F0ZUNoYW5uZWxUcmF2ZXJzYWxNb3Rpb25TdHJhdGVneScsIER1YWxHYXRlQ2hhbm5lbFRyYXZlcnNhbE1vdGlvblN0cmF0ZWd5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEdWFsR2F0ZUNoYW5uZWxUcmF2ZXJzYWxNb3Rpb25TdHJhdGVneTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLFNBQVMsTUFBTSx3QkFBd0I7QUFDOUMsT0FBT0MsZUFBZSxNQUFNLDhCQUE4QjtBQUMxRCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQywrQkFBK0IsTUFBTSxzQ0FBc0M7QUFDbEYsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLGdDQUFnQyxNQUFNLHVDQUF1Qzs7QUFFcEY7QUFDQSxNQUFNQyw2QkFBNkIsR0FBRyxHQUFHO0FBRXpDLE1BQU1DLHNDQUFzQyxTQUFTTCxjQUFjLENBQUM7RUFFbEU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsaUJBQWlCLEVBQUVDLGlCQUFpQixFQUFFQyxXQUFXLEVBQUc7SUFDeEUsS0FBSyxDQUFDLENBQUM7SUFDUEEsV0FBVyxHQUFHQSxXQUFXLElBQUlaLGVBQWUsQ0FBQ2Esb0JBQW9CO0lBQ2pFLElBQUksQ0FBQ0MsY0FBYyxHQUFHLElBQUlqQixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztJQUN6QyxJQUFJLENBQUNZLE9BQU8sR0FBR0EsT0FBTztJQUN0QixJQUFJLENBQUNHLFdBQVcsR0FBR0EsV0FBVzs7SUFFOUI7SUFDQTtJQUNBLElBQUksQ0FBQ0csZUFBZSxHQUFHLElBQUksQ0FBQ0MscUJBQXFCLENBQUVQLE9BQU8sRUFBRUMsaUJBQWlCLEVBQUVDLGlCQUFrQixDQUFDLENBQUMsQ0FBQztJQUNwRyxJQUFJLENBQUNNLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQ0MsUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3ZCLElBQUksQ0FBQ0MsaUNBQWlDLENBQUVULGlCQUFpQixFQUFFQyxpQkFBa0IsQ0FBQztFQUNoRjs7RUFFQTtFQUNBUyxJQUFJQSxDQUFFQyxtQkFBbUIsRUFBRUMsbUJBQW1CLEVBQUVDLEVBQUUsRUFBRztJQUNuREMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDUCx1QkFBdUIsR0FBRyxJQUFJLENBQUNGLGVBQWUsQ0FBQ1UsTUFBTyxDQUFDLENBQUMsQ0FBRTtJQUNqRixJQUFJQyxZQUFZLEdBQUcsQ0FBQztJQUNwQixNQUFNQyxtQkFBbUIsR0FBR04sbUJBQW1CLENBQUNPLFlBQVksQ0FBQyxDQUFDO0lBQzlELE1BQU1DLG1CQUFtQixHQUFHUixtQkFBbUIsQ0FBQ1MsWUFBWSxDQUFDLENBQUM7SUFFOUQsSUFBSyxJQUFJLENBQUNiLHVCQUF1QixLQUFLLENBQUMsRUFBRztNQUN4QztNQUNBO01BQ0EsSUFBSyxDQUFDLElBQUksQ0FBQ1IsT0FBTyxDQUFDc0IsTUFBTSxDQUFDLENBQUMsRUFBRztRQUM1QjtRQUNBO1FBQ0FWLG1CQUFtQixDQUFDVyxpQkFBaUIsQ0FBRSxJQUFJM0IsZ0NBQWdDLENBQUUsSUFBSSxDQUFDSSxPQUFPLENBQUN3QixpQkFBaUIsQ0FBQyxDQUFDLEVBQUVaLG1CQUFtQixDQUFDTyxZQUFZLENBQUMsQ0FBQyxFQUFFUCxtQkFBbUIsQ0FBQ1MsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBTSxDQUFFLENBQUM7UUFDbk07UUFDQTtRQUNBO1FBQ0EsSUFBSSxDQUFDYix1QkFBdUIsR0FBR2lCLE1BQU0sQ0FBQ0MsU0FBUztNQUNqRCxDQUFDLE1BQ0ksSUFBSyxJQUFJLENBQUNDLG1DQUFtQyxDQUFFVCxtQkFBbUIsRUFBRUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDZCxlQUFlLENBQUUsSUFBSSxDQUFDRSx1QkFBdUIsQ0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxjQUFjLENBQUN1QixTQUFTLEdBQUdkLEVBQUUsRUFBRztRQUMxTDtRQUNBO1FBQ0FGLG1CQUFtQixDQUFDaUIsV0FBVyxDQUFFLElBQUksQ0FBQ3ZCLGVBQWUsQ0FBRSxJQUFJLENBQUNFLHVCQUF1QixDQUFFLENBQUNzQixDQUFDLEVBQUUsSUFBSSxDQUFDeEIsZUFBZSxDQUFFLElBQUksQ0FBQ0UsdUJBQXVCLENBQUUsQ0FBQ3VCLENBQUUsQ0FBQztRQUNqSixJQUFJLENBQUN2Qix1QkFBdUIsRUFBRTtRQUM5QixJQUFJLENBQUN3QixpQkFBaUIsQ0FBRXBCLG1CQUFtQixDQUFDTyxZQUFZLENBQUMsQ0FBQyxFQUFFUCxtQkFBbUIsQ0FBQ1MsWUFBWSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNmLGVBQWUsQ0FBRSxJQUFJLENBQUNFLHVCQUF1QixDQUFFLEVBQ2xKLElBQUksQ0FBQ0gsY0FBYyxDQUFDdUIsU0FBVSxDQUFDO01BQ25DLENBQUMsTUFDSTtRQUNIO1FBQ0EsSUFBSSxDQUFDSywwQkFBMEIsQ0FBRXJCLG1CQUFtQixFQUFFRSxFQUFHLENBQUM7TUFDNUQ7SUFDRixDQUFDLE1BQ0ksSUFBSyxJQUFJLENBQUNOLHVCQUF1QixLQUFLLENBQUMsRUFBRztNQUM3QztNQUNBO01BQ0EsSUFBSyxJQUFJLENBQUNSLE9BQU8sQ0FBQ2tDLHFCQUFxQixDQUFDLENBQUMsR0FBR3JDLDZCQUE2QixFQUFHO1FBQzFFO1FBQ0E7UUFDQTtRQUNBLElBQUssQ0FBQyxJQUFJLENBQUNZLFFBQVEsRUFBRztVQUNwQjtVQUNBO1VBQ0E7VUFDQSxJQUFJLENBQUNILGVBQWUsQ0FBRSxDQUFDLENBQUUsQ0FBQ3dCLENBQUMsR0FBRyxJQUFJLENBQUN4QixlQUFlLENBQUUsQ0FBQyxDQUFFLENBQUN3QixDQUFDO1VBQ3pELElBQUksQ0FBQ3hCLGVBQWUsQ0FBRSxDQUFDLENBQUUsQ0FBQ3lCLENBQUMsR0FBRyxJQUFJLENBQUN6QixlQUFlLENBQUUsQ0FBQyxDQUFFLENBQUN5QixDQUFDO1VBRXpELElBQUksQ0FBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN4QjtNQUNGOztNQUNBLElBQUssSUFBSSxDQUFDa0IsbUNBQW1DLENBQUVULG1CQUFtQixFQUFFRSxtQkFBbUIsRUFBRSxJQUFJLENBQUNkLGVBQWUsQ0FBRSxJQUFJLENBQUNFLHVCQUF1QixDQUFHLENBQUMsR0FBRyxJQUFJLENBQUNILGNBQWMsQ0FBQ3VCLFNBQVMsR0FBR2QsRUFBRSxFQUFHO1FBQ3JMO1FBQ0E7UUFDQUYsbUJBQW1CLENBQUNpQixXQUFXLENBQUUsSUFBSSxDQUFDdkIsZUFBZSxDQUFFLElBQUksQ0FBQ0UsdUJBQXVCLENBQUUsQ0FBQ3NCLENBQUMsRUFBRSxJQUFJLENBQUN4QixlQUFlLENBQUUsSUFBSSxDQUFDRSx1QkFBdUIsQ0FBRSxDQUFDdUIsQ0FBRSxDQUFDO1FBQ2pKLElBQUksQ0FBQ3ZCLHVCQUF1QixFQUFFO1FBQzlCLElBQUksQ0FBQ3dCLGlCQUFpQixDQUFFcEIsbUJBQW1CLENBQUNPLFlBQVksQ0FBQyxDQUFDLEVBQUVQLG1CQUFtQixDQUFDUyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ2YsZUFBZSxDQUFFLElBQUksQ0FBQ0UsdUJBQXVCLENBQUUsRUFDbEosSUFBSSxDQUFDSCxjQUFjLENBQUN1QixTQUFVLENBQUM7UUFDakMsSUFBSyxJQUFJLENBQUNuQixRQUFRLEVBQUc7VUFDbkI7VUFDQSxJQUFJLENBQUNKLGNBQWMsQ0FBQzhCLGNBQWMsQ0FBRSxHQUFJLENBQUM7UUFDM0M7TUFDRixDQUFDLE1BQ0k7UUFDSDtRQUNBLElBQUksQ0FBQ0YsMEJBQTBCLENBQUVyQixtQkFBbUIsRUFBRUUsRUFBRyxDQUFDO01BQzVEO0lBQ0YsQ0FBQyxNQUNJLElBQUssSUFBSSxDQUFDTix1QkFBdUIsS0FBSyxDQUFDLEVBQUc7TUFDN0M7TUFDQSxJQUFLLElBQUksQ0FBQ21CLG1DQUFtQyxDQUFFVCxtQkFBbUIsRUFBRUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDZCxlQUFlLENBQUUsSUFBSSxDQUFDRSx1QkFBdUIsQ0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDSCxjQUFjLENBQUN1QixTQUFTLEdBQUdkLEVBQUUsRUFBRztRQUNyTDtRQUNBO1FBQ0E7O1FBRUFGLG1CQUFtQixDQUFDaUIsV0FBVyxDQUFFLElBQUksQ0FBQ3ZCLGVBQWUsQ0FBRSxJQUFJLENBQUNFLHVCQUF1QixDQUFFLENBQUNzQixDQUFDLEVBQUUsSUFBSSxDQUFDeEIsZUFBZSxDQUFFLElBQUksQ0FBQ0UsdUJBQXVCLENBQUUsQ0FBQ3VCLENBQUUsQ0FBQztRQUNqSixJQUFJLENBQUN2Qix1QkFBdUIsR0FBR2lCLE1BQU0sQ0FBQ0MsU0FBUztRQUMvQyxNQUFNVSxpQkFBaUIsR0FBRyxJQUFJaEQsT0FBTyxDQUFFLElBQUksQ0FBQ2lCLGNBQWMsQ0FBQ3lCLENBQUMsRUFBRSxJQUFJLENBQUN6QixjQUFjLENBQUMwQixDQUFFLENBQUM7UUFDckYsSUFBSyxJQUFJLENBQUN0QixRQUFRLEVBQUc7VUFDbkI7VUFDQTtVQUNBO1VBQ0EyQixpQkFBaUIsQ0FBQ0MsTUFBTSxDQUFFLENBQUVsRCxTQUFTLENBQUNtRCxVQUFVLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBS0MsSUFBSSxDQUFDQyxFQUFHLENBQUM7VUFDdEVKLGlCQUFpQixDQUFDRCxjQUFjLENBQUUsR0FBRyxHQUFLaEQsU0FBUyxDQUFDbUQsVUFBVSxDQUFDLENBQUMsR0FBRyxHQUFNLENBQUM7VUFDMUUxQixtQkFBbUIsQ0FBQ1csaUJBQWlCLENBQUUsSUFBSS9CLG9CQUFvQixDQUFFNEMsaUJBQWtCLENBQUUsQ0FBQztRQUN4RixDQUFDLE1BQ0k7VUFDSDtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQUEsaUJBQWlCLENBQUNELGNBQWMsQ0FBRSxHQUFHLEdBQUtoRCxTQUFTLENBQUNtRCxVQUFVLENBQUMsQ0FBQyxHQUFHLEdBQU0sQ0FBQztVQUMxRSxJQUFJRyxXQUFXO1VBQ2YsSUFBSUMsV0FBVztVQUNmLElBQUt2RCxTQUFTLENBQUNtRCxVQUFVLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRztZQUNsQztZQUNBO1lBQ0E7WUFDQUcsV0FBVyxHQUFHRixJQUFJLENBQUNDLEVBQUUsR0FBRyxHQUFHO1lBQzNCdkIsWUFBWSxHQUFHLENBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQ2pCLE9BQU8sQ0FBQ2tDLHFCQUFxQixDQUFDLENBQUMsSUFBS0ssSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBRztZQUMzRUUsV0FBVyxHQUFHRCxXQUFXLEdBQUd4QixZQUFZO1VBQzFDLENBQUMsTUFDSTtZQUNIO1lBQ0E7WUFDQTtZQUNBd0IsV0FBVyxHQUFHLENBQUNGLElBQUksQ0FBQ0MsRUFBRSxHQUFHLEdBQUc7WUFDNUJ2QixZQUFZLEdBQUcsQ0FBRSxDQUFDLEdBQUcsSUFBSSxDQUFDakIsT0FBTyxDQUFDa0MscUJBQXFCLENBQUMsQ0FBQyxJQUFLLENBQUNLLElBQUksQ0FBQ0MsRUFBRSxHQUFHLEdBQUc7WUFDNUVFLFdBQVcsR0FBR0QsV0FBVyxHQUFHeEIsWUFBWTtVQUMxQztVQUNBbUIsaUJBQWlCLENBQUNDLE1BQU0sQ0FBRUssV0FBVyxHQUFHdkQsU0FBUyxDQUFDbUQsVUFBVSxDQUFDLENBQUMsSUFBS0csV0FBVyxHQUFHQyxXQUFXLENBQUcsQ0FBQztVQUNoRzlCLG1CQUFtQixDQUFDVyxpQkFBaUIsQ0FBRSxJQUFJN0IsK0JBQStCLENBQUUwQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsTUFBTyxDQUFFLENBQUM7UUFDaEg7UUFDQXZCLG1CQUFtQixDQUFDOEIsZUFBZSxDQUFFLElBQUloRCxxQkFBcUIsQ0FBRSxLQUFNLENBQUUsQ0FBQztNQUMzRSxDQUFDLE1BQ0k7UUFDSDtRQUNBLElBQUksQ0FBQ3NDLDBCQUEwQixDQUFFckIsbUJBQW1CLEVBQUVFLEVBQUcsQ0FBQztNQUM1RDtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VhLG1DQUFtQ0EsQ0FBRWlCLElBQUksRUFBRUMsSUFBSSxFQUFFQyxjQUFjLEVBQUc7SUFDaEUsT0FBT3hELFNBQVMsQ0FBQ3lELGVBQWUsQ0FBRUgsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLGNBQWMsQ0FBQ2hCLENBQUMsRUFBRWdCLGNBQWMsQ0FBQ2YsQ0FBRSxDQUFDO0VBQ3BGOztFQUVBO0VBQ0FFLDBCQUEwQkEsQ0FBRWUsT0FBTyxFQUFFbEMsRUFBRSxFQUFHO0lBQ3hDa0MsT0FBTyxDQUFDbkIsV0FBVyxDQUFFbUIsT0FBTyxDQUFDN0IsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNkLGNBQWMsQ0FBQ3lCLENBQUMsR0FBR2hCLEVBQUUsRUFDdEVrQyxPQUFPLENBQUMzQixZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQ2hCLGNBQWMsQ0FBQzBCLENBQUMsR0FBR2pCLEVBQUcsQ0FBQztFQUN6RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUCxxQkFBcUJBLENBQUVQLE9BQU8sRUFBRUMsaUJBQWlCLEVBQUVDLGlCQUFpQixFQUFHO0lBQ3JFLE1BQU0rQyxNQUFNLEdBQUcsRUFBRTtJQUNqQixNQUFNQyxHQUFHLEdBQUdsRCxPQUFPLENBQUN3QixpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0yQixDQUFDLEdBQUduRCxPQUFPLENBQUNvRCxjQUFjLENBQUMsQ0FBQyxDQUFDQyxNQUFNLEdBQUcsR0FBRzs7SUFFL0M7SUFDQTtJQUNBOztJQUVBO0lBQ0EsTUFBTUMsb0JBQW9CLEdBQUc7TUFDM0J4QixDQUFDLEVBQUVvQixHQUFHLENBQUNwQixDQUFDLEdBQUdTLElBQUksQ0FBQ2dCLEdBQUcsQ0FBRXZELE9BQU8sQ0FBQ3dELGtCQUFrQixDQUFDLENBQUUsQ0FBQyxHQUFHTCxDQUFDO01BQ3ZEcEIsQ0FBQyxFQUFFbUIsR0FBRyxDQUFDbkIsQ0FBQyxHQUFHUSxJQUFJLENBQUNrQixHQUFHLENBQUV6RCxPQUFPLENBQUN3RCxrQkFBa0IsQ0FBQyxDQUFFLENBQUMsR0FBR0w7SUFDeEQsQ0FBQztJQUNELE1BQU1PLG9CQUFvQixHQUFHO01BQzNCNUIsQ0FBQyxFQUFFb0IsR0FBRyxDQUFDcEIsQ0FBQyxHQUFHUyxJQUFJLENBQUNnQixHQUFHLENBQUV2RCxPQUFPLENBQUN3RCxrQkFBa0IsQ0FBQyxDQUFFLENBQUMsR0FBR0wsQ0FBQztNQUN2RHBCLENBQUMsRUFBRW1CLEdBQUcsQ0FBQ25CLENBQUMsR0FBR1EsSUFBSSxDQUFDa0IsR0FBRyxDQUFFekQsT0FBTyxDQUFDd0Qsa0JBQWtCLENBQUMsQ0FBRSxDQUFDLEdBQUdMO0lBQ3hELENBQUM7O0lBRUQ7SUFDQTtJQUNBO0lBQ0EsTUFBTVEsNkJBQTZCLEdBQ2pDO01BQ0U3QixDQUFDLEVBQUVvQixHQUFHLENBQUNwQixDQUFDLEdBQUdTLElBQUksQ0FBQ2dCLEdBQUcsQ0FBRXZELE9BQU8sQ0FBQ3dELGtCQUFrQixDQUFDLENBQUUsQ0FBQyxHQUFHTCxDQUFDLEdBQUcsR0FBRztNQUM3RHBCLENBQUMsRUFBRW1CLEdBQUcsQ0FBQ25CLENBQUMsR0FBR1EsSUFBSSxDQUFDa0IsR0FBRyxDQUFFekQsT0FBTyxDQUFDd0Qsa0JBQWtCLENBQUMsQ0FBRSxDQUFDLEdBQUdMLENBQUMsR0FBRztJQUM1RCxDQUFDO0lBRUgsSUFBSyxJQUFJLENBQUN4QixtQ0FBbUMsQ0FBRTFCLGlCQUFpQixFQUFFQyxpQkFBaUIsRUFBRXdELG9CQUFxQixDQUFDLEdBQUcsSUFBSSxDQUFDL0IsbUNBQW1DLENBQUUxQixpQkFBaUIsRUFBRUMsaUJBQWlCLEVBQUVvRCxvQkFBcUIsQ0FBQyxFQUFHO01BQ3JOTCxNQUFNLENBQUNXLElBQUksQ0FBRUYsb0JBQXFCLENBQUM7TUFDbkNULE1BQU0sQ0FBQ1csSUFBSSxDQUFFRCw2QkFBOEIsQ0FBQztNQUM1Q1YsTUFBTSxDQUFDVyxJQUFJLENBQUVOLG9CQUFxQixDQUFDO0lBQ3JDLENBQUMsTUFDSTtNQUNITCxNQUFNLENBQUNXLElBQUksQ0FBRU4sb0JBQXFCLENBQUM7TUFDbkNMLE1BQU0sQ0FBQ1csSUFBSSxDQUFFRCw2QkFBOEIsQ0FBQztNQUM1Q1YsTUFBTSxDQUFDVyxJQUFJLENBQUVGLG9CQUFxQixDQUFDO0lBQ3JDO0lBRUEsT0FBT1QsTUFBTTtFQUNmOztFQUVBO0VBQ0FqQixpQkFBaUJBLENBQUU2QixjQUFjLEVBQUVDLGNBQWMsRUFBRUMsV0FBVyxFQUFFQyxjQUFjLEVBQUc7SUFDL0UsSUFBSSxDQUFDM0QsY0FBYyxDQUFDNEQsS0FBSyxDQUFFRixXQUFXLENBQUNqQyxDQUFDLEdBQUcrQixjQUFjLEVBQ3ZERSxXQUFXLENBQUNoQyxDQUFDLEdBQUcrQixjQUFlLENBQUM7SUFDbEMsTUFBTUksV0FBVyxHQUFHLElBQUksQ0FBQy9ELFdBQVcsR0FBRyxJQUFJLENBQUNFLGNBQWMsQ0FBQ3VCLFNBQVM7SUFDcEUsSUFBSSxDQUFDdkIsY0FBYyxDQUFDOEIsY0FBYyxDQUFFK0IsV0FBWSxDQUFDO0VBRW5EOztFQUVBO0VBQ0F4RCxpQ0FBaUNBLENBQUV5RCxnQkFBZ0IsRUFBRUMsZ0JBQWdCLEVBQUc7SUFDdEUsSUFBSW5ELFlBQVksR0FBRyxDQUFDO0lBQ3BCLElBQUssSUFBSSxDQUFDVCx1QkFBdUIsR0FBRyxJQUFJLENBQUNGLGVBQWUsQ0FBQ1UsTUFBTSxFQUFHO01BQ2hFLE1BQU1xRCxJQUFJLEdBQUcsSUFBSSxDQUFDL0QsZUFBZSxDQUFFLElBQUksQ0FBQ0UsdUJBQXVCLENBQUU7TUFDakUsSUFBSSxDQUFDSCxjQUFjLENBQUM0RCxLQUFLLENBQUVJLElBQUksQ0FBQ3ZDLENBQUMsR0FBR3FDLGdCQUFnQixFQUFFRSxJQUFJLENBQUN0QyxDQUFDLEdBQUdxQyxnQkFBaUIsQ0FBQztNQUNqRixNQUFNRixXQUFXLEdBQUcsSUFBSSxDQUFDL0QsV0FBVyxHQUFHLElBQUksQ0FBQ0UsY0FBYyxDQUFDdUIsU0FBUztNQUNwRSxJQUFJLENBQUN2QixjQUFjLENBQUM4QixjQUFjLENBQUUrQixXQUFZLENBQUM7SUFDbkQsQ0FBQyxNQUNJO01BQ0g7TUFDQTtNQUNBO01BQ0E7TUFDQSxJQUFLLElBQUksQ0FBQ2xFLE9BQU8sQ0FBQ3NFLHNCQUFzQixDQUFDLENBQUMsRUFBRztRQUMzQztRQUNBO1FBQ0EsSUFBSUMscUJBQXFCLEdBQUcsQ0FBQztRQUM3QixJQUFJN0IsV0FBVyxHQUFHLENBQUM7UUFDbkIsSUFBSUQsV0FBVyxHQUFHLENBQUM7UUFDbkIsSUFBS3RELFNBQVMsQ0FBQ21ELFVBQVUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFHO1VBQ2xDO1VBQ0E7VUFDQUcsV0FBVyxHQUFHRixJQUFJLENBQUNDLEVBQUUsR0FBRyxHQUFHO1VBQzNCdkIsWUFBWSxHQUFHLENBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQ2pCLE9BQU8sQ0FBQ2tDLHFCQUFxQixDQUFDLENBQUMsSUFBS0ssSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBRztVQUMzRUUsV0FBVyxHQUFHRCxXQUFXLEdBQUd4QixZQUFZO1FBQzFDLENBQUMsTUFDSTtVQUNIO1VBQ0E7VUFDQXdCLFdBQVcsR0FBRyxDQUFDRixJQUFJLENBQUNDLEVBQUUsR0FBRyxHQUFHO1VBQzVCdkIsWUFBWSxHQUFHLENBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQ2pCLE9BQU8sQ0FBQ2tDLHFCQUFxQixDQUFDLENBQUMsSUFBSyxDQUFDSyxJQUFJLENBQUNDLEVBQUUsR0FBRyxHQUFHO1VBQzVFRSxXQUFXLEdBQUdELFdBQVcsR0FBR3hCLFlBQVk7UUFDMUM7UUFDQXNELHFCQUFxQixHQUFHN0IsV0FBVyxHQUFHdkQsU0FBUyxDQUFDbUQsVUFBVSxDQUFDLENBQUMsSUFBS0csV0FBVyxHQUFHQyxXQUFXLENBQUU7UUFDNUYsSUFBSSxDQUFDckMsY0FBYyxDQUFDZ0MsTUFBTSxDQUFFa0MscUJBQXNCLENBQUM7TUFDckQsQ0FBQyxNQUNJO1FBQ0gsSUFBSSxDQUFDbEUsY0FBYyxDQUFDZ0MsTUFBTSxDQUFFLENBQUVsRCxTQUFTLENBQUNtRCxVQUFVLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBT0MsSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBRyxDQUFFLEdBQUcsSUFBSSxDQUFDckMsV0FBVyxHQUFHWixlQUFlLENBQUNhLG9CQUFxQixDQUFDO01BQzlJO0lBQ0Y7RUFFRjtBQUNGO0FBRUFmLE1BQU0sQ0FBQ21GLFFBQVEsQ0FBRSx3Q0FBd0MsRUFBRTFFLHNDQUF1QyxDQUFDO0FBRW5HLGVBQWVBLHNDQUFzQyJ9