// Copyright 2016-2022, University of Colorado Boulder

/**
 * This code governs the movement of charges, making sure they are distributed equally among the different
 * CircuitElements.  This exists for the life of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import RunningAverage from '../../../dot/js/RunningAverage.js';
import Utils from '../../../dot/js/Utils.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
// constants
// If the current is lower than this, then there is no charge movement
const MINIMUM_CURRENT = 1E-10;

// The furthest an charge can step in one frame before the time scale must be reduced (to prevent a strobe effect)
const MAX_POSITION_CHANGE = CCKCConstants.CHARGE_SEPARATION * 0.43;

// Number of times to spread out charges so they don't get bunched up.
const NUMBER_OF_EQUALIZE_STEPS = 2;

// Factor that multiplies the current to attain speed in screen coordinates per second
// No longer manually tuned so that at 1 Amp, 1 charge flows past in 1 second
const SPEED_SCALE = 25;

// the highest allowable time step for integration
const MAX_DT = 1 / 30;
/**
 * Gets the absolute value of the current in a circuit element.
 */
const CURRENT_MAGNITUDE = function (circuitElement) {
  return Math.abs(circuitElement.currentProperty.get());
};
export default class ChargeAnimator {
  // factor that reduces the overall propagator speed when maximum speed is exceeded

  // a running average over last time steps as a smoothing step

  // how much the time should be slowed, 1 is full speed, 0.5 is running at half speed, etc.

  constructor(circuit) {
    this.charges = circuit.charges;
    this.circuit = circuit;
    this.scale = 1;
    this.timeScaleRunningAverage = new RunningAverage(30);
    this.timeScaleProperty = new NumberProperty(1, {
      range: new Range(0, 1)
    });
  }

  // Restores to the initial state
  reset() {
    this.timeScaleProperty.reset();
    this.timeScaleRunningAverage.clear();
  }

  /**
   * Update the position of the charges based on the circuit currents
   * @param dt - elapsed time in seconds
   */
  step(dt) {
    if (this.charges.length === 0 || this.circuit.circuitElements.length === 0) {
      return;
    }

    // dt would ideally be around 16.666ms = 0.0166 sec.  Cap it to avoid too large of an integration step.
    dt = Math.min(dt, MAX_DT);

    // Find the fastest current in any circuit element
    const maxCircuitElement = _.maxBy(this.circuit.circuitElements, CURRENT_MAGNITUDE);
    const maxCurrentMagnitude = CURRENT_MAGNITUDE(maxCircuitElement);
    assert && assert(maxCurrentMagnitude >= 0, 'max current should be positive');
    const maxSpeed = maxCurrentMagnitude * SPEED_SCALE;
    const maxPositionChange = maxSpeed * MAX_DT; // Use the max dt instead of the true dt to avoid fluctuations

    // Slow down the simulation if the fastest step distance exceeds the maximum allowed step
    this.scale = maxPositionChange >= MAX_POSITION_CHANGE ? MAX_POSITION_CHANGE / maxPositionChange : 1;

    // Average over scale values to smooth them out
    const averageScale = Utils.clamp(this.timeScaleRunningAverage.updateRunningAverage(this.scale), 0, 1);
    this.timeScaleProperty.set(averageScale);
    for (let i = 0; i < this.charges.length; i++) {
      const charge = this.charges[i];

      // Don't update charges in chargeLayoutDirty circuit elements, because they will get a relayout anyways
      if (!charge.circuitElement.chargeLayoutDirty) {
        this.propagate(charge, dt);
      }
    }

    // Spread out the charges so they don't bunch up
    for (let i = 0; i < NUMBER_OF_EQUALIZE_STEPS; i++) {
      this.equalizeAll(dt);
    }

    // After computing the new charge positions (possibly across several deltas), trigger the views to update.
    this.charges.forEach(charge => charge.updatePositionAndAngle());
  }

  /**
   * Make the charges repel each other so they don't bunch up.
   * @param dt - the elapsed time in seconds
   */
  equalizeAll(dt) {
    // Update them in a stochastic order to avoid systematic sources of error building up.
    const indices = dotRandom.shuffle(_.range(this.charges.length));
    for (let i = 0; i < this.charges.length; i++) {
      const charge = this.charges[indices[i]];

      // No need to update charges in chargeLayoutDirty circuit elements, they will be replaced anyways.  Skipping
      // chargeLayoutDirty circuitElements improves performance.  Also, only update electrons in circuit elements
      // that have a current (to improve performance)
      if (!charge.circuitElement.chargeLayoutDirty && Math.abs(charge.circuitElement.currentProperty.get()) >= MINIMUM_CURRENT) {
        this.equalizeCharge(charge, dt);
      }
    }
  }

  /**
   * Adjust the charge so it is more closely centered between its neighbors.  This prevents charges from getting
   * too bunched up.
   * @param charge - the charge to adjust
   * @param dt - seconds
   */
  equalizeCharge(charge, dt) {
    const circuitElementCharges = this.circuit.getChargesInCircuitElement(charge.circuitElement);

    // if it has a lower and upper neighbor, nudge the charge to be closer to the midpoint
    const sorted = _.sortBy(circuitElementCharges, 'distance');
    const chargeIndex = sorted.indexOf(charge);
    const upper = sorted[chargeIndex + 1];
    const lower = sorted[chargeIndex - 1];

    // Only adjust a charge if it is between two other charges
    if (upper && lower) {
      const neighborSeparation = upper.distance - lower.distance;
      const currentPosition = charge.distance;
      let desiredPosition = lower.distance + neighborSeparation / 2;
      const distanceFromDesiredPosition = Math.abs(desiredPosition - currentPosition);
      const sameDirectionAsCurrent = Math.sign(desiredPosition - currentPosition) === Math.sign(-charge.circuitElement.currentProperty.get() * charge.charge);

      // never slow down or run the current backwards
      if (sameDirectionAsCurrent) {
        // When we need to correct in the same direction as current flow, do it quickly.
        const correctionStepSize = Math.abs(5.5 / NUMBER_OF_EQUALIZE_STEPS * SPEED_SCALE * dt);

        // If far enough away that it won't overshoot, then correct it with one step
        if (distanceFromDesiredPosition > correctionStepSize) {
          // move in the appropriate direction maxDX
          if (desiredPosition < currentPosition) {
            desiredPosition = currentPosition - correctionStepSize;
          } else if (desiredPosition > currentPosition) {
            desiredPosition = currentPosition + correctionStepSize;
          }
        }

        // Only update the charge if its new position would be within the same circuit element.
        if (desiredPosition >= 0 && desiredPosition <= charge.circuitElement.chargePathLength) {
          charge.distance = desiredPosition;
        }
      }
    }
  }

  /**
   * Move the charge forward in time by the specified amount.
   * @param charge - the charge to update
   * @param dt - elapsed time in seconds
   */
  propagate(charge, dt) {
    const chargePosition = charge.distance;
    assert && assert(_.isNumber(chargePosition), 'distance along wire should be a number');
    const current = -charge.circuitElement.currentProperty.get() * charge.charge;

    // Below min current, the charges should remain stationary
    if (Math.abs(current) > MINIMUM_CURRENT) {
      const speed = current * SPEED_SCALE;
      const chargePositionDelta = speed * dt * this.scale;
      const newChargePosition = chargePosition + chargePositionDelta;

      // Step within a single circuit element
      if (charge.circuitElement.containsScalarPosition(newChargePosition)) {
        charge.distance = newChargePosition;
      } else {
        // move to a new CircuitElement
        const overshoot = current < 0 ? -newChargePosition : newChargePosition - charge.circuitElement.chargePathLength;
        const lessThanBeginningOfOldCircuitElement = newChargePosition < 0;
        assert && assert(!isNaN(overshoot), 'overshoot should be a number');
        assert && assert(overshoot >= 0, 'overshoot should be >=0');

        // enumerate all possible circuit elements the charge could go to
        const vertex = lessThanBeginningOfOldCircuitElement ? charge.circuitElement.startVertexProperty.get() : charge.circuitElement.endVertexProperty.get();
        const circuitPositions = this.getPositions(charge, overshoot, vertex, 0);
        if (circuitPositions.length > 0) {
          // choose the CircuitElement with the furthest away electron
          const chosenCircuitPosition = _.maxBy(circuitPositions, 'distanceToClosestElectron');
          assert && assert(chosenCircuitPosition.distanceToClosestElectron >= 0, 'distanceToClosestElectron should be >=0');
          charge.circuitElement = chosenCircuitPosition.circuitElement;
          charge.distance = chosenCircuitPosition.distance;
        }
      }
    }
  }

  /**
   * Returns the positions where a charge can flow to (connected circuits with current flowing in the right direction)
   * @param charge - the charge that is moving
   * @param overshoot - the distance the charge should appear along the next circuit element
   * @param vertex - vertex the charge is passing by
   * @param depth - number of recursive calls
   */
  getPositions(charge, overshoot, vertex, depth) {
    const circuit = this.circuit;
    const adjacentCircuitElements = this.circuit.getNeighborCircuitElements(vertex);
    const circuitPositions = [];

    // Keep only those with outgoing current.
    for (let i = 0; i < adjacentCircuitElements.length; i++) {
      const circuitElement = adjacentCircuitElements[i];
      const current = -circuitElement.currentProperty.get() * charge.charge;
      let distance = null;

      // The linear algebra solver can result in currents of 1E-12 where it should be zero.  For these cases, don't
      // permit charges to flow. The current is clamped here instead of after the linear algebra so that we don't
      // mess up support for oscillating elements that may need the small values such as capacitors and inductors.
      let found = false;
      if (current > MINIMUM_CURRENT && circuitElement.startVertexProperty.get() === vertex) {
        // Start near the beginning.
        distance = Utils.clamp(overshoot, 0, circuitElement.chargePathLength); // Note, this can be zero
        found = true;
      } else if (current < -MINIMUM_CURRENT && circuitElement.endVertexProperty.get() === vertex) {
        // start near the end
        distance = Utils.clamp(circuitElement.chargePathLength - overshoot, 0, circuitElement.chargePathLength); // can be zero
        found = true;
      } else {

        // Current too small to animate
      }
      if (found) {
        const charges = circuit.getChargesInCircuitElement(circuitElement);
        assert && assert(circuitElement.startVertexProperty.get() === vertex || circuitElement.endVertexProperty.get() === vertex);
        const atStartOfNewCircuitElement = circuitElement.startVertexProperty.get() === vertex;
        let distanceToClosestElectron = 0;
        if (charges.length > 0) {
          // find closest electron to the vertex
          if (atStartOfNewCircuitElement) {
            distanceToClosestElectron = _.minBy(charges, 'distance').distance;
          } else {
            distanceToClosestElectron = circuitElement.chargePathLength - _.maxBy(charges, 'distance').distance;
          }
          assert && assert(distance !== null, 'distance should be a number');
          if (typeof distance === 'number') {
            circuitPositions.push({
              circuitElement: circuitElement,
              distance: distance,
              distanceToClosestElectron: distanceToClosestElectron
            });
          }
        } else if (depth < 20) {
          // check downstream circuit elements, but only if we haven't recursed too far (just in case)
          const positions = this.getPositions(charge, 0, circuitElement.getOppositeVertex(vertex), depth + 1);
          if (positions.length > 0) {
            // find the one with the closest electron
            const nearest = _.minBy(positions, 'distanceToClosestElectron');
            assert && assert(distance !== null, 'distance should be a number');
            if (typeof distance === 'number') {
              circuitPositions.push({
                circuitElement: circuitElement,
                distance: distance,
                distanceToClosestElectron: nearest.distanceToClosestElectron + circuitElement.chargePathLength
              });
            }
          }
        }
      }
    }
    return circuitPositions;
  }
}
circuitConstructionKitCommon.register('ChargeAnimator', ChargeAnimator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiUnVubmluZ0F2ZXJhZ2UiLCJVdGlscyIsIkNDS0NDb25zdGFudHMiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiTUlOSU1VTV9DVVJSRU5UIiwiTUFYX1BPU0lUSU9OX0NIQU5HRSIsIkNIQVJHRV9TRVBBUkFUSU9OIiwiTlVNQkVSX09GX0VRVUFMSVpFX1NURVBTIiwiU1BFRURfU0NBTEUiLCJNQVhfRFQiLCJDVVJSRU5UX01BR05JVFVERSIsImNpcmN1aXRFbGVtZW50IiwiTWF0aCIsImFicyIsImN1cnJlbnRQcm9wZXJ0eSIsImdldCIsIkNoYXJnZUFuaW1hdG9yIiwiY29uc3RydWN0b3IiLCJjaXJjdWl0IiwiY2hhcmdlcyIsInNjYWxlIiwidGltZVNjYWxlUnVubmluZ0F2ZXJhZ2UiLCJ0aW1lU2NhbGVQcm9wZXJ0eSIsInJhbmdlIiwicmVzZXQiLCJjbGVhciIsInN0ZXAiLCJkdCIsImxlbmd0aCIsImNpcmN1aXRFbGVtZW50cyIsIm1pbiIsIm1heENpcmN1aXRFbGVtZW50IiwiXyIsIm1heEJ5IiwibWF4Q3VycmVudE1hZ25pdHVkZSIsImFzc2VydCIsIm1heFNwZWVkIiwibWF4UG9zaXRpb25DaGFuZ2UiLCJhdmVyYWdlU2NhbGUiLCJjbGFtcCIsInVwZGF0ZVJ1bm5pbmdBdmVyYWdlIiwic2V0IiwiaSIsImNoYXJnZSIsImNoYXJnZUxheW91dERpcnR5IiwicHJvcGFnYXRlIiwiZXF1YWxpemVBbGwiLCJmb3JFYWNoIiwidXBkYXRlUG9zaXRpb25BbmRBbmdsZSIsImluZGljZXMiLCJzaHVmZmxlIiwiZXF1YWxpemVDaGFyZ2UiLCJjaXJjdWl0RWxlbWVudENoYXJnZXMiLCJnZXRDaGFyZ2VzSW5DaXJjdWl0RWxlbWVudCIsInNvcnRlZCIsInNvcnRCeSIsImNoYXJnZUluZGV4IiwiaW5kZXhPZiIsInVwcGVyIiwibG93ZXIiLCJuZWlnaGJvclNlcGFyYXRpb24iLCJkaXN0YW5jZSIsImN1cnJlbnRQb3NpdGlvbiIsImRlc2lyZWRQb3NpdGlvbiIsImRpc3RhbmNlRnJvbURlc2lyZWRQb3NpdGlvbiIsInNhbWVEaXJlY3Rpb25Bc0N1cnJlbnQiLCJzaWduIiwiY29ycmVjdGlvblN0ZXBTaXplIiwiY2hhcmdlUGF0aExlbmd0aCIsImNoYXJnZVBvc2l0aW9uIiwiaXNOdW1iZXIiLCJjdXJyZW50Iiwic3BlZWQiLCJjaGFyZ2VQb3NpdGlvbkRlbHRhIiwibmV3Q2hhcmdlUG9zaXRpb24iLCJjb250YWluc1NjYWxhclBvc2l0aW9uIiwib3ZlcnNob290IiwibGVzc1RoYW5CZWdpbm5pbmdPZk9sZENpcmN1aXRFbGVtZW50IiwiaXNOYU4iLCJ2ZXJ0ZXgiLCJzdGFydFZlcnRleFByb3BlcnR5IiwiZW5kVmVydGV4UHJvcGVydHkiLCJjaXJjdWl0UG9zaXRpb25zIiwiZ2V0UG9zaXRpb25zIiwiY2hvc2VuQ2lyY3VpdFBvc2l0aW9uIiwiZGlzdGFuY2VUb0Nsb3Nlc3RFbGVjdHJvbiIsImRlcHRoIiwiYWRqYWNlbnRDaXJjdWl0RWxlbWVudHMiLCJnZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyIsImZvdW5kIiwiYXRTdGFydE9mTmV3Q2lyY3VpdEVsZW1lbnQiLCJtaW5CeSIsInB1c2giLCJwb3NpdGlvbnMiLCJnZXRPcHBvc2l0ZVZlcnRleCIsIm5lYXJlc3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYXJnZUFuaW1hdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY29kZSBnb3Zlcm5zIHRoZSBtb3ZlbWVudCBvZiBjaGFyZ2VzLCBtYWtpbmcgc3VyZSB0aGV5IGFyZSBkaXN0cmlidXRlZCBlcXVhbGx5IGFtb25nIHRoZSBkaWZmZXJlbnRcclxuICogQ2lyY3VpdEVsZW1lbnRzLiAgVGhpcyBleGlzdHMgZm9yIHRoZSBsaWZlIG9mIHRoZSBzaW0gYW5kIGhlbmNlIGRvZXMgbm90IG5lZWQgYSBkaXNwb3NlIGltcGxlbWVudGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFJ1bm5pbmdBdmVyYWdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SdW5uaW5nQXZlcmFnZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgQ0NLQ0NvbnN0YW50cyBmcm9tICcuLi9DQ0tDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcbmltcG9ydCBDaGFyZ2UgZnJvbSAnLi9DaGFyZ2UuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdCBmcm9tICcuL0NpcmN1aXQuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnQgZnJvbSAnLi9DaXJjdWl0RWxlbWVudC5qcyc7XHJcbmltcG9ydCBWZXJ0ZXggZnJvbSAnLi9WZXJ0ZXguanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcblxyXG4vLyBJZiB0aGUgY3VycmVudCBpcyBsb3dlciB0aGFuIHRoaXMsIHRoZW4gdGhlcmUgaXMgbm8gY2hhcmdlIG1vdmVtZW50XHJcbmNvbnN0IE1JTklNVU1fQ1VSUkVOVCA9IDFFLTEwO1xyXG5cclxuLy8gVGhlIGZ1cnRoZXN0IGFuIGNoYXJnZSBjYW4gc3RlcCBpbiBvbmUgZnJhbWUgYmVmb3JlIHRoZSB0aW1lIHNjYWxlIG11c3QgYmUgcmVkdWNlZCAodG8gcHJldmVudCBhIHN0cm9iZSBlZmZlY3QpXHJcbmNvbnN0IE1BWF9QT1NJVElPTl9DSEFOR0UgPSBDQ0tDQ29uc3RhbnRzLkNIQVJHRV9TRVBBUkFUSU9OICogMC40MztcclxuXHJcbi8vIE51bWJlciBvZiB0aW1lcyB0byBzcHJlYWQgb3V0IGNoYXJnZXMgc28gdGhleSBkb24ndCBnZXQgYnVuY2hlZCB1cC5cclxuY29uc3QgTlVNQkVSX09GX0VRVUFMSVpFX1NURVBTID0gMjtcclxuXHJcbi8vIEZhY3RvciB0aGF0IG11bHRpcGxpZXMgdGhlIGN1cnJlbnQgdG8gYXR0YWluIHNwZWVkIGluIHNjcmVlbiBjb29yZGluYXRlcyBwZXIgc2Vjb25kXHJcbi8vIE5vIGxvbmdlciBtYW51YWxseSB0dW5lZCBzbyB0aGF0IGF0IDEgQW1wLCAxIGNoYXJnZSBmbG93cyBwYXN0IGluIDEgc2Vjb25kXHJcbmNvbnN0IFNQRUVEX1NDQUxFID0gMjU7XHJcblxyXG4vLyB0aGUgaGlnaGVzdCBhbGxvd2FibGUgdGltZSBzdGVwIGZvciBpbnRlZ3JhdGlvblxyXG5jb25zdCBNQVhfRFQgPSAxIC8gMzA7XHJcblxyXG50eXBlIENpcmN1aXRFbGVtZW50UG9zaXRpb24gPSB7XHJcbiAgY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50O1xyXG4gIGRpc3RhbmNlOiBudW1iZXI7XHJcbiAgZGlzdGFuY2VUb0Nsb3Nlc3RFbGVjdHJvbjogbnVtYmVyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoZSBjdXJyZW50IGluIGEgY2lyY3VpdCBlbGVtZW50LlxyXG4gKi9cclxuY29uc3QgQ1VSUkVOVF9NQUdOSVRVREUgPSBmdW5jdGlvbiggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkge1xyXG4gIHJldHVybiBNYXRoLmFicyggY2lyY3VpdEVsZW1lbnQuY3VycmVudFByb3BlcnR5LmdldCgpICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFyZ2VBbmltYXRvciB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFyZ2VzOiBPYnNlcnZhYmxlQXJyYXk8Q2hhcmdlPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNpcmN1aXQ6IENpcmN1aXQ7XHJcblxyXG4gIC8vIGZhY3RvciB0aGF0IHJlZHVjZXMgdGhlIG92ZXJhbGwgcHJvcGFnYXRvciBzcGVlZCB3aGVuIG1heGltdW0gc3BlZWQgaXMgZXhjZWVkZWRcclxuICBwcml2YXRlIHNjYWxlOiBudW1iZXI7XHJcblxyXG4gIC8vIGEgcnVubmluZyBhdmVyYWdlIG92ZXIgbGFzdCB0aW1lIHN0ZXBzIGFzIGEgc21vb3RoaW5nIHN0ZXBcclxuICBwdWJsaWMgcmVhZG9ubHkgdGltZVNjYWxlUnVubmluZ0F2ZXJhZ2U6IFJ1bm5pbmdBdmVyYWdlO1xyXG5cclxuICAvLyBob3cgbXVjaCB0aGUgdGltZSBzaG91bGQgYmUgc2xvd2VkLCAxIGlzIGZ1bGwgc3BlZWQsIDAuNSBpcyBydW5uaW5nIGF0IGhhbGYgc3BlZWQsIGV0Yy5cclxuICBwdWJsaWMgcmVhZG9ubHkgdGltZVNjYWxlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNpcmN1aXQ6IENpcmN1aXQgKSB7XHJcbiAgICB0aGlzLmNoYXJnZXMgPSBjaXJjdWl0LmNoYXJnZXM7XHJcbiAgICB0aGlzLmNpcmN1aXQgPSBjaXJjdWl0O1xyXG4gICAgdGhpcy5zY2FsZSA9IDE7XHJcbiAgICB0aGlzLnRpbWVTY2FsZVJ1bm5pbmdBdmVyYWdlID0gbmV3IFJ1bm5pbmdBdmVyYWdlKCAzMCApO1xyXG4gICAgdGhpcy50aW1lU2NhbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSwgeyByYW5nZTogbmV3IFJhbmdlKCAwLCAxICkgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gUmVzdG9yZXMgdG8gdGhlIGluaXRpYWwgc3RhdGVcclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnRpbWVTY2FsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVTY2FsZVJ1bm5pbmdBdmVyYWdlLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBjaGFyZ2VzIGJhc2VkIG9uIHRoZSBjaXJjdWl0IGN1cnJlbnRzXHJcbiAgICogQHBhcmFtIGR0IC0gZWxhcHNlZCB0aW1lIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuY2hhcmdlcy5sZW5ndGggPT09IDAgfHwgdGhpcy5jaXJjdWl0LmNpcmN1aXRFbGVtZW50cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkdCB3b3VsZCBpZGVhbGx5IGJlIGFyb3VuZCAxNi42NjZtcyA9IDAuMDE2NiBzZWMuICBDYXAgaXQgdG8gYXZvaWQgdG9vIGxhcmdlIG9mIGFuIGludGVncmF0aW9uIHN0ZXAuXHJcbiAgICBkdCA9IE1hdGgubWluKCBkdCwgTUFYX0RUICk7XHJcblxyXG4gICAgLy8gRmluZCB0aGUgZmFzdGVzdCBjdXJyZW50IGluIGFueSBjaXJjdWl0IGVsZW1lbnRcclxuICAgIGNvbnN0IG1heENpcmN1aXRFbGVtZW50ID0gXy5tYXhCeSggdGhpcy5jaXJjdWl0LmNpcmN1aXRFbGVtZW50cywgQ1VSUkVOVF9NQUdOSVRVREUgKSE7XHJcbiAgICBjb25zdCBtYXhDdXJyZW50TWFnbml0dWRlID0gQ1VSUkVOVF9NQUdOSVRVREUoIG1heENpcmN1aXRFbGVtZW50ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXhDdXJyZW50TWFnbml0dWRlID49IDAsICdtYXggY3VycmVudCBzaG91bGQgYmUgcG9zaXRpdmUnICk7XHJcblxyXG4gICAgY29uc3QgbWF4U3BlZWQgPSBtYXhDdXJyZW50TWFnbml0dWRlICogU1BFRURfU0NBTEU7XHJcbiAgICBjb25zdCBtYXhQb3NpdGlvbkNoYW5nZSA9IG1heFNwZWVkICogTUFYX0RUOyAvLyBVc2UgdGhlIG1heCBkdCBpbnN0ZWFkIG9mIHRoZSB0cnVlIGR0IHRvIGF2b2lkIGZsdWN0dWF0aW9uc1xyXG5cclxuICAgIC8vIFNsb3cgZG93biB0aGUgc2ltdWxhdGlvbiBpZiB0aGUgZmFzdGVzdCBzdGVwIGRpc3RhbmNlIGV4Y2VlZHMgdGhlIG1heGltdW0gYWxsb3dlZCBzdGVwXHJcbiAgICB0aGlzLnNjYWxlID0gKCBtYXhQb3NpdGlvbkNoYW5nZSA+PSBNQVhfUE9TSVRJT05fQ0hBTkdFICkgPyAoIE1BWF9QT1NJVElPTl9DSEFOR0UgLyBtYXhQb3NpdGlvbkNoYW5nZSApIDogMTtcclxuXHJcbiAgICAvLyBBdmVyYWdlIG92ZXIgc2NhbGUgdmFsdWVzIHRvIHNtb290aCB0aGVtIG91dFxyXG4gICAgY29uc3QgYXZlcmFnZVNjYWxlID0gVXRpbHMuY2xhbXAoIHRoaXMudGltZVNjYWxlUnVubmluZ0F2ZXJhZ2UudXBkYXRlUnVubmluZ0F2ZXJhZ2UoIHRoaXMuc2NhbGUgKSwgMCwgMSApO1xyXG4gICAgdGhpcy50aW1lU2NhbGVQcm9wZXJ0eS5zZXQoIGF2ZXJhZ2VTY2FsZSApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hhcmdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2hhcmdlID0gdGhpcy5jaGFyZ2VzWyBpIF07XHJcblxyXG4gICAgICAvLyBEb24ndCB1cGRhdGUgY2hhcmdlcyBpbiBjaGFyZ2VMYXlvdXREaXJ0eSBjaXJjdWl0IGVsZW1lbnRzLCBiZWNhdXNlIHRoZXkgd2lsbCBnZXQgYSByZWxheW91dCBhbnl3YXlzXHJcbiAgICAgIGlmICggIWNoYXJnZS5jaXJjdWl0RWxlbWVudC5jaGFyZ2VMYXlvdXREaXJ0eSApIHtcclxuICAgICAgICB0aGlzLnByb3BhZ2F0ZSggY2hhcmdlLCBkdCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3ByZWFkIG91dCB0aGUgY2hhcmdlcyBzbyB0aGV5IGRvbid0IGJ1bmNoIHVwXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOVU1CRVJfT0ZfRVFVQUxJWkVfU1RFUFM7IGkrKyApIHtcclxuICAgICAgdGhpcy5lcXVhbGl6ZUFsbCggZHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZnRlciBjb21wdXRpbmcgdGhlIG5ldyBjaGFyZ2UgcG9zaXRpb25zIChwb3NzaWJseSBhY3Jvc3Mgc2V2ZXJhbCBkZWx0YXMpLCB0cmlnZ2VyIHRoZSB2aWV3cyB0byB1cGRhdGUuXHJcbiAgICB0aGlzLmNoYXJnZXMuZm9yRWFjaCggY2hhcmdlID0+IGNoYXJnZS51cGRhdGVQb3NpdGlvbkFuZEFuZ2xlKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2UgdGhlIGNoYXJnZXMgcmVwZWwgZWFjaCBvdGhlciBzbyB0aGV5IGRvbid0IGJ1bmNoIHVwLlxyXG4gICAqIEBwYXJhbSBkdCAtIHRoZSBlbGFwc2VkIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgZXF1YWxpemVBbGwoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZW0gaW4gYSBzdG9jaGFzdGljIG9yZGVyIHRvIGF2b2lkIHN5c3RlbWF0aWMgc291cmNlcyBvZiBlcnJvciBidWlsZGluZyB1cC5cclxuICAgIGNvbnN0IGluZGljZXMgPSBkb3RSYW5kb20uc2h1ZmZsZSggXy5yYW5nZSggdGhpcy5jaGFyZ2VzLmxlbmd0aCApICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNoYXJnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoYXJnZSA9IHRoaXMuY2hhcmdlc1sgaW5kaWNlc1sgaSBdIF07XHJcblxyXG4gICAgICAvLyBObyBuZWVkIHRvIHVwZGF0ZSBjaGFyZ2VzIGluIGNoYXJnZUxheW91dERpcnR5IGNpcmN1aXQgZWxlbWVudHMsIHRoZXkgd2lsbCBiZSByZXBsYWNlZCBhbnl3YXlzLiAgU2tpcHBpbmdcclxuICAgICAgLy8gY2hhcmdlTGF5b3V0RGlydHkgY2lyY3VpdEVsZW1lbnRzIGltcHJvdmVzIHBlcmZvcm1hbmNlLiAgQWxzbywgb25seSB1cGRhdGUgZWxlY3Ryb25zIGluIGNpcmN1aXQgZWxlbWVudHNcclxuICAgICAgLy8gdGhhdCBoYXZlIGEgY3VycmVudCAodG8gaW1wcm92ZSBwZXJmb3JtYW5jZSlcclxuICAgICAgaWYgKCAhY2hhcmdlLmNpcmN1aXRFbGVtZW50LmNoYXJnZUxheW91dERpcnR5ICYmIE1hdGguYWJzKCBjaGFyZ2UuY2lyY3VpdEVsZW1lbnQuY3VycmVudFByb3BlcnR5LmdldCgpICkgPj0gTUlOSU1VTV9DVVJSRU5UICkge1xyXG4gICAgICAgIHRoaXMuZXF1YWxpemVDaGFyZ2UoIGNoYXJnZSwgZHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRqdXN0IHRoZSBjaGFyZ2Ugc28gaXQgaXMgbW9yZSBjbG9zZWx5IGNlbnRlcmVkIGJldHdlZW4gaXRzIG5laWdoYm9ycy4gIFRoaXMgcHJldmVudHMgY2hhcmdlcyBmcm9tIGdldHRpbmdcclxuICAgKiB0b28gYnVuY2hlZCB1cC5cclxuICAgKiBAcGFyYW0gY2hhcmdlIC0gdGhlIGNoYXJnZSB0byBhZGp1c3RcclxuICAgKiBAcGFyYW0gZHQgLSBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBlcXVhbGl6ZUNoYXJnZSggY2hhcmdlOiBDaGFyZ2UsIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgY2lyY3VpdEVsZW1lbnRDaGFyZ2VzID0gdGhpcy5jaXJjdWl0LmdldENoYXJnZXNJbkNpcmN1aXRFbGVtZW50KCBjaGFyZ2UuY2lyY3VpdEVsZW1lbnQgKTtcclxuXHJcbiAgICAvLyBpZiBpdCBoYXMgYSBsb3dlciBhbmQgdXBwZXIgbmVpZ2hib3IsIG51ZGdlIHRoZSBjaGFyZ2UgdG8gYmUgY2xvc2VyIHRvIHRoZSBtaWRwb2ludFxyXG4gICAgY29uc3Qgc29ydGVkID0gXy5zb3J0QnkoIGNpcmN1aXRFbGVtZW50Q2hhcmdlcywgJ2Rpc3RhbmNlJyApO1xyXG5cclxuICAgIGNvbnN0IGNoYXJnZUluZGV4ID0gc29ydGVkLmluZGV4T2YoIGNoYXJnZSApO1xyXG4gICAgY29uc3QgdXBwZXIgPSBzb3J0ZWRbIGNoYXJnZUluZGV4ICsgMSBdO1xyXG4gICAgY29uc3QgbG93ZXIgPSBzb3J0ZWRbIGNoYXJnZUluZGV4IC0gMSBdO1xyXG5cclxuICAgIC8vIE9ubHkgYWRqdXN0IGEgY2hhcmdlIGlmIGl0IGlzIGJldHdlZW4gdHdvIG90aGVyIGNoYXJnZXNcclxuICAgIGlmICggdXBwZXIgJiYgbG93ZXIgKSB7XHJcbiAgICAgIGNvbnN0IG5laWdoYm9yU2VwYXJhdGlvbiA9IHVwcGVyLmRpc3RhbmNlIC0gbG93ZXIuZGlzdGFuY2U7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IGNoYXJnZS5kaXN0YW5jZTtcclxuXHJcbiAgICAgIGxldCBkZXNpcmVkUG9zaXRpb24gPSBsb3dlci5kaXN0YW5jZSArIG5laWdoYm9yU2VwYXJhdGlvbiAvIDI7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlRnJvbURlc2lyZWRQb3NpdGlvbiA9IE1hdGguYWJzKCBkZXNpcmVkUG9zaXRpb24gLSBjdXJyZW50UG9zaXRpb24gKTtcclxuICAgICAgY29uc3Qgc2FtZURpcmVjdGlvbkFzQ3VycmVudCA9IE1hdGguc2lnbiggZGVzaXJlZFBvc2l0aW9uIC0gY3VycmVudFBvc2l0aW9uICkgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNpZ24oIC1jaGFyZ2UuY2lyY3VpdEVsZW1lbnQuY3VycmVudFByb3BlcnR5LmdldCgpICogY2hhcmdlLmNoYXJnZSApO1xyXG5cclxuICAgICAgLy8gbmV2ZXIgc2xvdyBkb3duIG9yIHJ1biB0aGUgY3VycmVudCBiYWNrd2FyZHNcclxuICAgICAgaWYgKCBzYW1lRGlyZWN0aW9uQXNDdXJyZW50ICkge1xyXG5cclxuICAgICAgICAvLyBXaGVuIHdlIG5lZWQgdG8gY29ycmVjdCBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gYXMgY3VycmVudCBmbG93LCBkbyBpdCBxdWlja2x5LlxyXG4gICAgICAgIGNvbnN0IGNvcnJlY3Rpb25TdGVwU2l6ZSA9IE1hdGguYWJzKCA1LjUgLyBOVU1CRVJfT0ZfRVFVQUxJWkVfU1RFUFMgKiBTUEVFRF9TQ0FMRSAqIGR0ICk7XHJcblxyXG4gICAgICAgIC8vIElmIGZhciBlbm91Z2ggYXdheSB0aGF0IGl0IHdvbid0IG92ZXJzaG9vdCwgdGhlbiBjb3JyZWN0IGl0IHdpdGggb25lIHN0ZXBcclxuICAgICAgICBpZiAoIGRpc3RhbmNlRnJvbURlc2lyZWRQb3NpdGlvbiA+IGNvcnJlY3Rpb25TdGVwU2l6ZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBtb3ZlIGluIHRoZSBhcHByb3ByaWF0ZSBkaXJlY3Rpb24gbWF4RFhcclxuICAgICAgICAgIGlmICggZGVzaXJlZFBvc2l0aW9uIDwgY3VycmVudFBvc2l0aW9uICkge1xyXG4gICAgICAgICAgICBkZXNpcmVkUG9zaXRpb24gPSBjdXJyZW50UG9zaXRpb24gLSBjb3JyZWN0aW9uU3RlcFNpemU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGVzaXJlZFBvc2l0aW9uID4gY3VycmVudFBvc2l0aW9uICkge1xyXG4gICAgICAgICAgICBkZXNpcmVkUG9zaXRpb24gPSBjdXJyZW50UG9zaXRpb24gKyBjb3JyZWN0aW9uU3RlcFNpemU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbmx5IHVwZGF0ZSB0aGUgY2hhcmdlIGlmIGl0cyBuZXcgcG9zaXRpb24gd291bGQgYmUgd2l0aGluIHRoZSBzYW1lIGNpcmN1aXQgZWxlbWVudC5cclxuICAgICAgICBpZiAoIGRlc2lyZWRQb3NpdGlvbiA+PSAwICYmIGRlc2lyZWRQb3NpdGlvbiA8PSBjaGFyZ2UuY2lyY3VpdEVsZW1lbnQuY2hhcmdlUGF0aExlbmd0aCApIHtcclxuICAgICAgICAgIGNoYXJnZS5kaXN0YW5jZSA9IGRlc2lyZWRQb3NpdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgdGhlIGNoYXJnZSBmb3J3YXJkIGluIHRpbWUgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQuXHJcbiAgICogQHBhcmFtIGNoYXJnZSAtIHRoZSBjaGFyZ2UgdG8gdXBkYXRlXHJcbiAgICogQHBhcmFtIGR0IC0gZWxhcHNlZCB0aW1lIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwcml2YXRlIHByb3BhZ2F0ZSggY2hhcmdlOiBDaGFyZ2UsIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBjb25zdCBjaGFyZ2VQb3NpdGlvbiA9IGNoYXJnZS5kaXN0YW5jZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaXNOdW1iZXIoIGNoYXJnZVBvc2l0aW9uICksICdkaXN0YW5jZSBhbG9uZyB3aXJlIHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgIGNvbnN0IGN1cnJlbnQgPSAtY2hhcmdlLmNpcmN1aXRFbGVtZW50LmN1cnJlbnRQcm9wZXJ0eS5nZXQoKSAqIGNoYXJnZS5jaGFyZ2U7XHJcblxyXG4gICAgLy8gQmVsb3cgbWluIGN1cnJlbnQsIHRoZSBjaGFyZ2VzIHNob3VsZCByZW1haW4gc3RhdGlvbmFyeVxyXG4gICAgaWYgKCBNYXRoLmFicyggY3VycmVudCApID4gTUlOSU1VTV9DVVJSRU5UICkge1xyXG4gICAgICBjb25zdCBzcGVlZCA9IGN1cnJlbnQgKiBTUEVFRF9TQ0FMRTtcclxuICAgICAgY29uc3QgY2hhcmdlUG9zaXRpb25EZWx0YSA9IHNwZWVkICogZHQgKiB0aGlzLnNjYWxlO1xyXG4gICAgICBjb25zdCBuZXdDaGFyZ2VQb3NpdGlvbiA9IGNoYXJnZVBvc2l0aW9uICsgY2hhcmdlUG9zaXRpb25EZWx0YTtcclxuXHJcbiAgICAgIC8vIFN0ZXAgd2l0aGluIGEgc2luZ2xlIGNpcmN1aXQgZWxlbWVudFxyXG4gICAgICBpZiAoIGNoYXJnZS5jaXJjdWl0RWxlbWVudC5jb250YWluc1NjYWxhclBvc2l0aW9uKCBuZXdDaGFyZ2VQb3NpdGlvbiApICkge1xyXG4gICAgICAgIGNoYXJnZS5kaXN0YW5jZSA9IG5ld0NoYXJnZVBvc2l0aW9uO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBtb3ZlIHRvIGEgbmV3IENpcmN1aXRFbGVtZW50XHJcbiAgICAgICAgY29uc3Qgb3ZlcnNob290ID0gY3VycmVudCA8IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC1uZXdDaGFyZ2VQb3NpdGlvbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKCBuZXdDaGFyZ2VQb3NpdGlvbiAtIGNoYXJnZS5jaXJjdWl0RWxlbWVudC5jaGFyZ2VQYXRoTGVuZ3RoICk7XHJcbiAgICAgICAgY29uc3QgbGVzc1RoYW5CZWdpbm5pbmdPZk9sZENpcmN1aXRFbGVtZW50ID0gbmV3Q2hhcmdlUG9zaXRpb24gPCAwO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIG92ZXJzaG9vdCApLCAnb3ZlcnNob290IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvdmVyc2hvb3QgPj0gMCwgJ292ZXJzaG9vdCBzaG91bGQgYmUgPj0wJyApO1xyXG5cclxuICAgICAgICAvLyBlbnVtZXJhdGUgYWxsIHBvc3NpYmxlIGNpcmN1aXQgZWxlbWVudHMgdGhlIGNoYXJnZSBjb3VsZCBnbyB0b1xyXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IGxlc3NUaGFuQmVnaW5uaW5nT2ZPbGRDaXJjdWl0RWxlbWVudCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgY2hhcmdlLmNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgIGNoYXJnZS5jaXJjdWl0RWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBjb25zdCBjaXJjdWl0UG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnMoIGNoYXJnZSwgb3ZlcnNob290LCB2ZXJ0ZXgsIDAgKTtcclxuICAgICAgICBpZiAoIGNpcmN1aXRQb3NpdGlvbnMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBjaG9vc2UgdGhlIENpcmN1aXRFbGVtZW50IHdpdGggdGhlIGZ1cnRoZXN0IGF3YXkgZWxlY3Ryb25cclxuICAgICAgICAgIGNvbnN0IGNob3NlbkNpcmN1aXRQb3NpdGlvbiA9IF8ubWF4QnkoIGNpcmN1aXRQb3NpdGlvbnMsICdkaXN0YW5jZVRvQ2xvc2VzdEVsZWN0cm9uJyApITtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNob3NlbkNpcmN1aXRQb3NpdGlvbi5kaXN0YW5jZVRvQ2xvc2VzdEVsZWN0cm9uID49IDAsICdkaXN0YW5jZVRvQ2xvc2VzdEVsZWN0cm9uIHNob3VsZCBiZSA+PTAnICk7XHJcbiAgICAgICAgICBjaGFyZ2UuY2lyY3VpdEVsZW1lbnQgPSBjaG9zZW5DaXJjdWl0UG9zaXRpb24uY2lyY3VpdEVsZW1lbnQ7XHJcbiAgICAgICAgICBjaGFyZ2UuZGlzdGFuY2UgPSBjaG9zZW5DaXJjdWl0UG9zaXRpb24uZGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbnMgd2hlcmUgYSBjaGFyZ2UgY2FuIGZsb3cgdG8gKGNvbm5lY3RlZCBjaXJjdWl0cyB3aXRoIGN1cnJlbnQgZmxvd2luZyBpbiB0aGUgcmlnaHQgZGlyZWN0aW9uKVxyXG4gICAqIEBwYXJhbSBjaGFyZ2UgLSB0aGUgY2hhcmdlIHRoYXQgaXMgbW92aW5nXHJcbiAgICogQHBhcmFtIG92ZXJzaG9vdCAtIHRoZSBkaXN0YW5jZSB0aGUgY2hhcmdlIHNob3VsZCBhcHBlYXIgYWxvbmcgdGhlIG5leHQgY2lyY3VpdCBlbGVtZW50XHJcbiAgICogQHBhcmFtIHZlcnRleCAtIHZlcnRleCB0aGUgY2hhcmdlIGlzIHBhc3NpbmcgYnlcclxuICAgKiBAcGFyYW0gZGVwdGggLSBudW1iZXIgb2YgcmVjdXJzaXZlIGNhbGxzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRQb3NpdGlvbnMoIGNoYXJnZTogQ2hhcmdlLCBvdmVyc2hvb3Q6IG51bWJlciwgdmVydGV4OiBWZXJ0ZXgsIGRlcHRoOiBudW1iZXIgKTogQ2lyY3VpdEVsZW1lbnRQb3NpdGlvbltdIHtcclxuXHJcbiAgICBjb25zdCBjaXJjdWl0ID0gdGhpcy5jaXJjdWl0O1xyXG5cclxuICAgIGNvbnN0IGFkamFjZW50Q2lyY3VpdEVsZW1lbnRzID0gdGhpcy5jaXJjdWl0LmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCB2ZXJ0ZXggKTtcclxuICAgIGNvbnN0IGNpcmN1aXRQb3NpdGlvbnM6IENpcmN1aXRFbGVtZW50UG9zaXRpb25bXSA9IFtdO1xyXG5cclxuICAgIC8vIEtlZXAgb25seSB0aG9zZSB3aXRoIG91dGdvaW5nIGN1cnJlbnQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhZGphY2VudENpcmN1aXRFbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2lyY3VpdEVsZW1lbnQgPSBhZGphY2VudENpcmN1aXRFbGVtZW50c1sgaSBdO1xyXG4gICAgICBjb25zdCBjdXJyZW50ID0gLWNpcmN1aXRFbGVtZW50LmN1cnJlbnRQcm9wZXJ0eS5nZXQoKSAqIGNoYXJnZS5jaGFyZ2U7XHJcbiAgICAgIGxldCBkaXN0YW5jZSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBUaGUgbGluZWFyIGFsZ2VicmEgc29sdmVyIGNhbiByZXN1bHQgaW4gY3VycmVudHMgb2YgMUUtMTIgd2hlcmUgaXQgc2hvdWxkIGJlIHplcm8uICBGb3IgdGhlc2UgY2FzZXMsIGRvbid0XHJcbiAgICAgIC8vIHBlcm1pdCBjaGFyZ2VzIHRvIGZsb3cuIFRoZSBjdXJyZW50IGlzIGNsYW1wZWQgaGVyZSBpbnN0ZWFkIG9mIGFmdGVyIHRoZSBsaW5lYXIgYWxnZWJyYSBzbyB0aGF0IHdlIGRvbid0XHJcbiAgICAgIC8vIG1lc3MgdXAgc3VwcG9ydCBmb3Igb3NjaWxsYXRpbmcgZWxlbWVudHMgdGhhdCBtYXkgbmVlZCB0aGUgc21hbGwgdmFsdWVzIHN1Y2ggYXMgY2FwYWNpdG9ycyBhbmQgaW5kdWN0b3JzLlxyXG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgaWYgKCBjdXJyZW50ID4gTUlOSU1VTV9DVVJSRU5UICYmIGNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkgPT09IHZlcnRleCApIHtcclxuXHJcbiAgICAgICAgLy8gU3RhcnQgbmVhciB0aGUgYmVnaW5uaW5nLlxyXG4gICAgICAgIGRpc3RhbmNlID0gVXRpbHMuY2xhbXAoIG92ZXJzaG9vdCwgMCwgY2lyY3VpdEVsZW1lbnQuY2hhcmdlUGF0aExlbmd0aCApOyAvLyBOb3RlLCB0aGlzIGNhbiBiZSB6ZXJvXHJcbiAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBjdXJyZW50IDwgLU1JTklNVU1fQ1VSUkVOVCAmJiBjaXJjdWl0RWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSA9PT0gdmVydGV4ICkge1xyXG5cclxuICAgICAgICAvLyBzdGFydCBuZWFyIHRoZSBlbmRcclxuICAgICAgICBkaXN0YW5jZSA9IFV0aWxzLmNsYW1wKCBjaXJjdWl0RWxlbWVudC5jaGFyZ2VQYXRoTGVuZ3RoIC0gb3ZlcnNob290LCAwLCBjaXJjdWl0RWxlbWVudC5jaGFyZ2VQYXRoTGVuZ3RoICk7IC8vIGNhbiBiZSB6ZXJvXHJcbiAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBDdXJyZW50IHRvbyBzbWFsbCB0byBhbmltYXRlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggZm91bmQgKSB7XHJcbiAgICAgICAgY29uc3QgY2hhcmdlcyA9IGNpcmN1aXQuZ2V0Q2hhcmdlc0luQ2lyY3VpdEVsZW1lbnQoIGNpcmN1aXRFbGVtZW50ICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgIGNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkgPT09IHZlcnRleCB8fFxyXG4gICAgICAgICAgY2lyY3VpdEVsZW1lbnQuZW5kVmVydGV4UHJvcGVydHkuZ2V0KCkgPT09IHZlcnRleFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgYXRTdGFydE9mTmV3Q2lyY3VpdEVsZW1lbnQgPSBjaXJjdWl0RWxlbWVudC5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpID09PSB2ZXJ0ZXg7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlVG9DbG9zZXN0RWxlY3Ryb24gPSAwO1xyXG4gICAgICAgIGlmICggY2hhcmdlcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgY2xvc2VzdCBlbGVjdHJvbiB0byB0aGUgdmVydGV4XHJcbiAgICAgICAgICBpZiAoIGF0U3RhcnRPZk5ld0NpcmN1aXRFbGVtZW50ICkge1xyXG4gICAgICAgICAgICBkaXN0YW5jZVRvQ2xvc2VzdEVsZWN0cm9uID0gKCBfLm1pbkJ5KCBjaGFyZ2VzLCAnZGlzdGFuY2UnICkhICkuZGlzdGFuY2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGlzdGFuY2VUb0Nsb3Nlc3RFbGVjdHJvbiA9IGNpcmN1aXRFbGVtZW50LmNoYXJnZVBhdGhMZW5ndGggLSAoIF8ubWF4QnkoIGNoYXJnZXMsICdkaXN0YW5jZScgKSEgKS5kaXN0YW5jZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaXN0YW5jZSAhPT0gbnVsbCwgJ2Rpc3RhbmNlIHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHR5cGVvZiBkaXN0YW5jZSA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgICAgICAgIGNpcmN1aXRQb3NpdGlvbnMucHVzaCgge1xyXG4gICAgICAgICAgICAgIGNpcmN1aXRFbGVtZW50OiBjaXJjdWl0RWxlbWVudCxcclxuICAgICAgICAgICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXHJcbiAgICAgICAgICAgICAgZGlzdGFuY2VUb0Nsb3Nlc3RFbGVjdHJvbjogZGlzdGFuY2VUb0Nsb3Nlc3RFbGVjdHJvblxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBkZXB0aCA8IDIwICkge1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrIGRvd25zdHJlYW0gY2lyY3VpdCBlbGVtZW50cywgYnV0IG9ubHkgaWYgd2UgaGF2ZW4ndCByZWN1cnNlZCB0b28gZmFyIChqdXN0IGluIGNhc2UpXHJcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9ucyggY2hhcmdlLCAwLCBjaXJjdWl0RWxlbWVudC5nZXRPcHBvc2l0ZVZlcnRleCggdmVydGV4ICksIGRlcHRoICsgMSApO1xyXG5cclxuICAgICAgICAgIGlmICggcG9zaXRpb25zLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBmaW5kIHRoZSBvbmUgd2l0aCB0aGUgY2xvc2VzdCBlbGVjdHJvblxyXG4gICAgICAgICAgICBjb25zdCBuZWFyZXN0ID0gXy5taW5CeSggcG9zaXRpb25zLCAnZGlzdGFuY2VUb0Nsb3Nlc3RFbGVjdHJvbicgKSE7XHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRpc3RhbmNlICE9PSBudWxsLCAnZGlzdGFuY2Ugc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBkaXN0YW5jZSA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgICAgICAgICAgY2lyY3VpdFBvc2l0aW9ucy5wdXNoKCB7XHJcbiAgICAgICAgICAgICAgICBjaXJjdWl0RWxlbWVudDogY2lyY3VpdEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZVRvQ2xvc2VzdEVsZWN0cm9uOiBuZWFyZXN0LmRpc3RhbmNlVG9DbG9zZXN0RWxlY3Ryb24gKyBjaXJjdWl0RWxlbWVudC5jaGFyZ2VQYXRoTGVuZ3RoXHJcbiAgICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2lyY3VpdFBvc2l0aW9ucztcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdDaGFyZ2VBbmltYXRvcicsIENoYXJnZUFuaW1hdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxTQUFTLE1BQU0sOEJBQThCO0FBQ3BELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsY0FBYyxNQUFNLG1DQUFtQztBQUM5RCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBTTdFO0FBRUE7QUFDQSxNQUFNQyxlQUFlLEdBQUcsS0FBSzs7QUFFN0I7QUFDQSxNQUFNQyxtQkFBbUIsR0FBR0gsYUFBYSxDQUFDSSxpQkFBaUIsR0FBRyxJQUFJOztBQUVsRTtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLENBQUM7O0FBRWxDO0FBQ0E7QUFDQSxNQUFNQyxXQUFXLEdBQUcsRUFBRTs7QUFFdEI7QUFDQSxNQUFNQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFRckI7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsU0FBQUEsQ0FBVUMsY0FBOEIsRUFBRztFQUNuRSxPQUFPQyxJQUFJLENBQUNDLEdBQUcsQ0FBRUYsY0FBYyxDQUFDRyxlQUFlLENBQUNDLEdBQUcsQ0FBQyxDQUFFLENBQUM7QUFDekQsQ0FBQztBQUVELGVBQWUsTUFBTUMsY0FBYyxDQUFDO0VBSWxDOztFQUdBOztFQUdBOztFQUdPQyxXQUFXQSxDQUFFQyxPQUFnQixFQUFHO0lBQ3JDLElBQUksQ0FBQ0MsT0FBTyxHQUFHRCxPQUFPLENBQUNDLE9BQU87SUFDOUIsSUFBSSxDQUFDRCxPQUFPLEdBQUdBLE9BQU87SUFDdEIsSUFBSSxDQUFDRSxLQUFLLEdBQUcsQ0FBQztJQUNkLElBQUksQ0FBQ0MsdUJBQXVCLEdBQUcsSUFBSXJCLGNBQWMsQ0FBRSxFQUFHLENBQUM7SUFDdkQsSUFBSSxDQUFDc0IsaUJBQWlCLEdBQUcsSUFBSXpCLGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFBRTBCLEtBQUssRUFBRSxJQUFJeEIsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFO0lBQUUsQ0FBRSxDQUFDO0VBQ2hGOztFQUVBO0VBQ095QixLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDRixpQkFBaUIsQ0FBQ0UsS0FBSyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDSCx1QkFBdUIsQ0FBQ0ksS0FBSyxDQUFDLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0MsSUFBSUEsQ0FBRUMsRUFBVSxFQUFTO0lBRTlCLElBQUssSUFBSSxDQUFDUixPQUFPLENBQUNTLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDVixPQUFPLENBQUNXLGVBQWUsQ0FBQ0QsTUFBTSxLQUFLLENBQUMsRUFBRztNQUM1RTtJQUNGOztJQUVBO0lBQ0FELEVBQUUsR0FBR2YsSUFBSSxDQUFDa0IsR0FBRyxDQUFFSCxFQUFFLEVBQUVsQixNQUFPLENBQUM7O0lBRTNCO0lBQ0EsTUFBTXNCLGlCQUFpQixHQUFHQyxDQUFDLENBQUNDLEtBQUssQ0FBRSxJQUFJLENBQUNmLE9BQU8sQ0FBQ1csZUFBZSxFQUFFbkIsaUJBQWtCLENBQUU7SUFDckYsTUFBTXdCLG1CQUFtQixHQUFHeEIsaUJBQWlCLENBQUVxQixpQkFBa0IsQ0FBQztJQUNsRUksTUFBTSxJQUFJQSxNQUFNLENBQUVELG1CQUFtQixJQUFJLENBQUMsRUFBRSxnQ0FBaUMsQ0FBQztJQUU5RSxNQUFNRSxRQUFRLEdBQUdGLG1CQUFtQixHQUFHMUIsV0FBVztJQUNsRCxNQUFNNkIsaUJBQWlCLEdBQUdELFFBQVEsR0FBRzNCLE1BQU0sQ0FBQyxDQUFDOztJQUU3QztJQUNBLElBQUksQ0FBQ1csS0FBSyxHQUFLaUIsaUJBQWlCLElBQUloQyxtQkFBbUIsR0FBT0EsbUJBQW1CLEdBQUdnQyxpQkFBaUIsR0FBSyxDQUFDOztJQUUzRztJQUNBLE1BQU1DLFlBQVksR0FBR3JDLEtBQUssQ0FBQ3NDLEtBQUssQ0FBRSxJQUFJLENBQUNsQix1QkFBdUIsQ0FBQ21CLG9CQUFvQixDQUFFLElBQUksQ0FBQ3BCLEtBQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDekcsSUFBSSxDQUFDRSxpQkFBaUIsQ0FBQ21CLEdBQUcsQ0FBRUgsWUFBYSxDQUFDO0lBRTFDLEtBQU0sSUFBSUksQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ3ZCLE9BQU8sQ0FBQ1MsTUFBTSxFQUFFYyxDQUFDLEVBQUUsRUFBRztNQUM5QyxNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDeEIsT0FBTyxDQUFFdUIsQ0FBQyxDQUFFOztNQUVoQztNQUNBLElBQUssQ0FBQ0MsTUFBTSxDQUFDaEMsY0FBYyxDQUFDaUMsaUJBQWlCLEVBQUc7UUFDOUMsSUFBSSxDQUFDQyxTQUFTLENBQUVGLE1BQU0sRUFBRWhCLEVBQUcsQ0FBQztNQUM5QjtJQUNGOztJQUVBO0lBQ0EsS0FBTSxJQUFJZSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUduQyx3QkFBd0IsRUFBRW1DLENBQUMsRUFBRSxFQUFHO01BQ25ELElBQUksQ0FBQ0ksV0FBVyxDQUFFbkIsRUFBRyxDQUFDO0lBQ3hCOztJQUVBO0lBQ0EsSUFBSSxDQUFDUixPQUFPLENBQUM0QixPQUFPLENBQUVKLE1BQU0sSUFBSUEsTUFBTSxDQUFDSyxzQkFBc0IsQ0FBQyxDQUFFLENBQUM7RUFDbkU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDVUYsV0FBV0EsQ0FBRW5CLEVBQVUsRUFBUztJQUV0QztJQUNBLE1BQU1zQixPQUFPLEdBQUduRCxTQUFTLENBQUNvRCxPQUFPLENBQUVsQixDQUFDLENBQUNULEtBQUssQ0FBRSxJQUFJLENBQUNKLE9BQU8sQ0FBQ1MsTUFBTyxDQUFFLENBQUM7SUFDbkUsS0FBTSxJQUFJYyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDdkIsT0FBTyxDQUFDUyxNQUFNLEVBQUVjLENBQUMsRUFBRSxFQUFHO01BQzlDLE1BQU1DLE1BQU0sR0FBRyxJQUFJLENBQUN4QixPQUFPLENBQUU4QixPQUFPLENBQUVQLENBQUMsQ0FBRSxDQUFFOztNQUUzQztNQUNBO01BQ0E7TUFDQSxJQUFLLENBQUNDLE1BQU0sQ0FBQ2hDLGNBQWMsQ0FBQ2lDLGlCQUFpQixJQUFJaEMsSUFBSSxDQUFDQyxHQUFHLENBQUU4QixNQUFNLENBQUNoQyxjQUFjLENBQUNHLGVBQWUsQ0FBQ0MsR0FBRyxDQUFDLENBQUUsQ0FBQyxJQUFJWCxlQUFlLEVBQUc7UUFDNUgsSUFBSSxDQUFDK0MsY0FBYyxDQUFFUixNQUFNLEVBQUVoQixFQUFHLENBQUM7TUFDbkM7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNVd0IsY0FBY0EsQ0FBRVIsTUFBYyxFQUFFaEIsRUFBVSxFQUFTO0lBRXpELE1BQU15QixxQkFBcUIsR0FBRyxJQUFJLENBQUNsQyxPQUFPLENBQUNtQywwQkFBMEIsQ0FBRVYsTUFBTSxDQUFDaEMsY0FBZSxDQUFDOztJQUU5RjtJQUNBLE1BQU0yQyxNQUFNLEdBQUd0QixDQUFDLENBQUN1QixNQUFNLENBQUVILHFCQUFxQixFQUFFLFVBQVcsQ0FBQztJQUU1RCxNQUFNSSxXQUFXLEdBQUdGLE1BQU0sQ0FBQ0csT0FBTyxDQUFFZCxNQUFPLENBQUM7SUFDNUMsTUFBTWUsS0FBSyxHQUFHSixNQUFNLENBQUVFLFdBQVcsR0FBRyxDQUFDLENBQUU7SUFDdkMsTUFBTUcsS0FBSyxHQUFHTCxNQUFNLENBQUVFLFdBQVcsR0FBRyxDQUFDLENBQUU7O0lBRXZDO0lBQ0EsSUFBS0UsS0FBSyxJQUFJQyxLQUFLLEVBQUc7TUFDcEIsTUFBTUMsa0JBQWtCLEdBQUdGLEtBQUssQ0FBQ0csUUFBUSxHQUFHRixLQUFLLENBQUNFLFFBQVE7TUFDMUQsTUFBTUMsZUFBZSxHQUFHbkIsTUFBTSxDQUFDa0IsUUFBUTtNQUV2QyxJQUFJRSxlQUFlLEdBQUdKLEtBQUssQ0FBQ0UsUUFBUSxHQUFHRCxrQkFBa0IsR0FBRyxDQUFDO01BQzdELE1BQU1JLDJCQUEyQixHQUFHcEQsSUFBSSxDQUFDQyxHQUFHLENBQUVrRCxlQUFlLEdBQUdELGVBQWdCLENBQUM7TUFDakYsTUFBTUcsc0JBQXNCLEdBQUdyRCxJQUFJLENBQUNzRCxJQUFJLENBQUVILGVBQWUsR0FBR0QsZUFBZ0IsQ0FBQyxLQUM5Q2xELElBQUksQ0FBQ3NELElBQUksQ0FBRSxDQUFDdkIsTUFBTSxDQUFDaEMsY0FBYyxDQUFDRyxlQUFlLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEdBQUc0QixNQUFNLENBQUNBLE1BQU8sQ0FBQzs7TUFFeEc7TUFDQSxJQUFLc0Isc0JBQXNCLEVBQUc7UUFFNUI7UUFDQSxNQUFNRSxrQkFBa0IsR0FBR3ZELElBQUksQ0FBQ0MsR0FBRyxDQUFFLEdBQUcsR0FBR04sd0JBQXdCLEdBQUdDLFdBQVcsR0FBR21CLEVBQUcsQ0FBQzs7UUFFeEY7UUFDQSxJQUFLcUMsMkJBQTJCLEdBQUdHLGtCQUFrQixFQUFHO1VBRXREO1VBQ0EsSUFBS0osZUFBZSxHQUFHRCxlQUFlLEVBQUc7WUFDdkNDLGVBQWUsR0FBR0QsZUFBZSxHQUFHSyxrQkFBa0I7VUFDeEQsQ0FBQyxNQUNJLElBQUtKLGVBQWUsR0FBR0QsZUFBZSxFQUFHO1lBQzVDQyxlQUFlLEdBQUdELGVBQWUsR0FBR0ssa0JBQWtCO1VBQ3hEO1FBQ0Y7O1FBRUE7UUFDQSxJQUFLSixlQUFlLElBQUksQ0FBQyxJQUFJQSxlQUFlLElBQUlwQixNQUFNLENBQUNoQyxjQUFjLENBQUN5RCxnQkFBZ0IsRUFBRztVQUN2RnpCLE1BQU0sQ0FBQ2tCLFFBQVEsR0FBR0UsZUFBZTtRQUNuQztNQUNGO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1VsQixTQUFTQSxDQUFFRixNQUFjLEVBQUVoQixFQUFVLEVBQVM7SUFDcEQsTUFBTTBDLGNBQWMsR0FBRzFCLE1BQU0sQ0FBQ2tCLFFBQVE7SUFDdEMxQixNQUFNLElBQUlBLE1BQU0sQ0FBRUgsQ0FBQyxDQUFDc0MsUUFBUSxDQUFFRCxjQUFlLENBQUMsRUFBRSx3Q0FBeUMsQ0FBQztJQUMxRixNQUFNRSxPQUFPLEdBQUcsQ0FBQzVCLE1BQU0sQ0FBQ2hDLGNBQWMsQ0FBQ0csZUFBZSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHNEIsTUFBTSxDQUFDQSxNQUFNOztJQUU1RTtJQUNBLElBQUsvQixJQUFJLENBQUNDLEdBQUcsQ0FBRTBELE9BQVEsQ0FBQyxHQUFHbkUsZUFBZSxFQUFHO01BQzNDLE1BQU1vRSxLQUFLLEdBQUdELE9BQU8sR0FBRy9ELFdBQVc7TUFDbkMsTUFBTWlFLG1CQUFtQixHQUFHRCxLQUFLLEdBQUc3QyxFQUFFLEdBQUcsSUFBSSxDQUFDUCxLQUFLO01BQ25ELE1BQU1zRCxpQkFBaUIsR0FBR0wsY0FBYyxHQUFHSSxtQkFBbUI7O01BRTlEO01BQ0EsSUFBSzlCLE1BQU0sQ0FBQ2hDLGNBQWMsQ0FBQ2dFLHNCQUFzQixDQUFFRCxpQkFBa0IsQ0FBQyxFQUFHO1FBQ3ZFL0IsTUFBTSxDQUFDa0IsUUFBUSxHQUFHYSxpQkFBaUI7TUFDckMsQ0FBQyxNQUNJO1FBRUg7UUFDQSxNQUFNRSxTQUFTLEdBQUdMLE9BQU8sR0FBRyxDQUFDLEdBQ1gsQ0FBQ0csaUJBQWlCLEdBQ2hCQSxpQkFBaUIsR0FBRy9CLE1BQU0sQ0FBQ2hDLGNBQWMsQ0FBQ3lELGdCQUFrQjtRQUNoRixNQUFNUyxvQ0FBb0MsR0FBR0gsaUJBQWlCLEdBQUcsQ0FBQztRQUVsRXZDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMyQyxLQUFLLENBQUVGLFNBQVUsQ0FBQyxFQUFFLDhCQUErQixDQUFDO1FBQ3ZFekMsTUFBTSxJQUFJQSxNQUFNLENBQUV5QyxTQUFTLElBQUksQ0FBQyxFQUFFLHlCQUEwQixDQUFDOztRQUU3RDtRQUNBLE1BQU1HLE1BQU0sR0FBR0Ysb0NBQW9DLEdBQ3BDbEMsTUFBTSxDQUFDaEMsY0FBYyxDQUFDcUUsbUJBQW1CLENBQUNqRSxHQUFHLENBQUMsQ0FBQyxHQUMvQzRCLE1BQU0sQ0FBQ2hDLGNBQWMsQ0FBQ3NFLGlCQUFpQixDQUFDbEUsR0FBRyxDQUFDLENBQUM7UUFDNUQsTUFBTW1FLGdCQUFnQixHQUFHLElBQUksQ0FBQ0MsWUFBWSxDQUFFeEMsTUFBTSxFQUFFaUMsU0FBUyxFQUFFRyxNQUFNLEVBQUUsQ0FBRSxDQUFDO1FBQzFFLElBQUtHLGdCQUFnQixDQUFDdEQsTUFBTSxHQUFHLENBQUMsRUFBRztVQUVqQztVQUNBLE1BQU13RCxxQkFBcUIsR0FBR3BELENBQUMsQ0FBQ0MsS0FBSyxDQUFFaUQsZ0JBQWdCLEVBQUUsMkJBQTRCLENBQUU7VUFDdkYvQyxNQUFNLElBQUlBLE1BQU0sQ0FBRWlELHFCQUFxQixDQUFDQyx5QkFBeUIsSUFBSSxDQUFDLEVBQUUseUNBQTBDLENBQUM7VUFDbkgxQyxNQUFNLENBQUNoQyxjQUFjLEdBQUd5RSxxQkFBcUIsQ0FBQ3pFLGNBQWM7VUFDNURnQyxNQUFNLENBQUNrQixRQUFRLEdBQUd1QixxQkFBcUIsQ0FBQ3ZCLFFBQVE7UUFDbEQ7TUFDRjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDVXNCLFlBQVlBLENBQUV4QyxNQUFjLEVBQUVpQyxTQUFpQixFQUFFRyxNQUFjLEVBQUVPLEtBQWEsRUFBNkI7SUFFakgsTUFBTXBFLE9BQU8sR0FBRyxJQUFJLENBQUNBLE9BQU87SUFFNUIsTUFBTXFFLHVCQUF1QixHQUFHLElBQUksQ0FBQ3JFLE9BQU8sQ0FBQ3NFLDBCQUEwQixDQUFFVCxNQUFPLENBQUM7SUFDakYsTUFBTUcsZ0JBQTBDLEdBQUcsRUFBRTs7SUFFckQ7SUFDQSxLQUFNLElBQUl4QyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc2Qyx1QkFBdUIsQ0FBQzNELE1BQU0sRUFBRWMsQ0FBQyxFQUFFLEVBQUc7TUFDekQsTUFBTS9CLGNBQWMsR0FBRzRFLHVCQUF1QixDQUFFN0MsQ0FBQyxDQUFFO01BQ25ELE1BQU02QixPQUFPLEdBQUcsQ0FBQzVELGNBQWMsQ0FBQ0csZUFBZSxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHNEIsTUFBTSxDQUFDQSxNQUFNO01BQ3JFLElBQUlrQixRQUFRLEdBQUcsSUFBSTs7TUFFbkI7TUFDQTtNQUNBO01BQ0EsSUFBSTRCLEtBQUssR0FBRyxLQUFLO01BQ2pCLElBQUtsQixPQUFPLEdBQUduRSxlQUFlLElBQUlPLGNBQWMsQ0FBQ3FFLG1CQUFtQixDQUFDakUsR0FBRyxDQUFDLENBQUMsS0FBS2dFLE1BQU0sRUFBRztRQUV0RjtRQUNBbEIsUUFBUSxHQUFHNUQsS0FBSyxDQUFDc0MsS0FBSyxDQUFFcUMsU0FBUyxFQUFFLENBQUMsRUFBRWpFLGNBQWMsQ0FBQ3lELGdCQUFpQixDQUFDLENBQUMsQ0FBQztRQUN6RXFCLEtBQUssR0FBRyxJQUFJO01BQ2QsQ0FBQyxNQUNJLElBQUtsQixPQUFPLEdBQUcsQ0FBQ25FLGVBQWUsSUFBSU8sY0FBYyxDQUFDc0UsaUJBQWlCLENBQUNsRSxHQUFHLENBQUMsQ0FBQyxLQUFLZ0UsTUFBTSxFQUFHO1FBRTFGO1FBQ0FsQixRQUFRLEdBQUc1RCxLQUFLLENBQUNzQyxLQUFLLENBQUU1QixjQUFjLENBQUN5RCxnQkFBZ0IsR0FBR1EsU0FBUyxFQUFFLENBQUMsRUFBRWpFLGNBQWMsQ0FBQ3lELGdCQUFpQixDQUFDLENBQUMsQ0FBQztRQUMzR3FCLEtBQUssR0FBRyxJQUFJO01BQ2QsQ0FBQyxNQUNJOztRQUVIO01BQUE7TUFHRixJQUFLQSxLQUFLLEVBQUc7UUFDWCxNQUFNdEUsT0FBTyxHQUFHRCxPQUFPLENBQUNtQywwQkFBMEIsQ0FBRTFDLGNBQWUsQ0FBQztRQUNwRXdCLE1BQU0sSUFBSUEsTUFBTSxDQUNkeEIsY0FBYyxDQUFDcUUsbUJBQW1CLENBQUNqRSxHQUFHLENBQUMsQ0FBQyxLQUFLZ0UsTUFBTSxJQUNuRHBFLGNBQWMsQ0FBQ3NFLGlCQUFpQixDQUFDbEUsR0FBRyxDQUFDLENBQUMsS0FBS2dFLE1BQzdDLENBQUM7UUFDRCxNQUFNVywwQkFBMEIsR0FBRy9FLGNBQWMsQ0FBQ3FFLG1CQUFtQixDQUFDakUsR0FBRyxDQUFDLENBQUMsS0FBS2dFLE1BQU07UUFDdEYsSUFBSU0seUJBQXlCLEdBQUcsQ0FBQztRQUNqQyxJQUFLbEUsT0FBTyxDQUFDUyxNQUFNLEdBQUcsQ0FBQyxFQUFHO1VBRXhCO1VBQ0EsSUFBSzhELDBCQUEwQixFQUFHO1lBQ2hDTCx5QkFBeUIsR0FBS3JELENBQUMsQ0FBQzJELEtBQUssQ0FBRXhFLE9BQU8sRUFBRSxVQUFXLENBQUMsQ0FBSTBDLFFBQVE7VUFDMUUsQ0FBQyxNQUNJO1lBQ0h3Qix5QkFBeUIsR0FBRzFFLGNBQWMsQ0FBQ3lELGdCQUFnQixHQUFLcEMsQ0FBQyxDQUFDQyxLQUFLLENBQUVkLE9BQU8sRUFBRSxVQUFXLENBQUMsQ0FBSTBDLFFBQVE7VUFDNUc7VUFFQTFCLE1BQU0sSUFBSUEsTUFBTSxDQUFFMEIsUUFBUSxLQUFLLElBQUksRUFBRSw2QkFBOEIsQ0FBQztVQUVwRSxJQUFLLE9BQU9BLFFBQVEsS0FBSyxRQUFRLEVBQUc7WUFDbENxQixnQkFBZ0IsQ0FBQ1UsSUFBSSxDQUFFO2NBQ3JCakYsY0FBYyxFQUFFQSxjQUFjO2NBQzlCa0QsUUFBUSxFQUFFQSxRQUFRO2NBQ2xCd0IseUJBQXlCLEVBQUVBO1lBQzdCLENBQUUsQ0FBQztVQUNMO1FBQ0YsQ0FBQyxNQUNJLElBQUtDLEtBQUssR0FBRyxFQUFFLEVBQUc7VUFFckI7VUFDQSxNQUFNTyxTQUFTLEdBQUcsSUFBSSxDQUFDVixZQUFZLENBQUV4QyxNQUFNLEVBQUUsQ0FBQyxFQUFFaEMsY0FBYyxDQUFDbUYsaUJBQWlCLENBQUVmLE1BQU8sQ0FBQyxFQUFFTyxLQUFLLEdBQUcsQ0FBRSxDQUFDO1VBRXZHLElBQUtPLFNBQVMsQ0FBQ2pFLE1BQU0sR0FBRyxDQUFDLEVBQUc7WUFFMUI7WUFDQSxNQUFNbUUsT0FBTyxHQUFHL0QsQ0FBQyxDQUFDMkQsS0FBSyxDQUFFRSxTQUFTLEVBQUUsMkJBQTRCLENBQUU7WUFDbEUxRCxNQUFNLElBQUlBLE1BQU0sQ0FBRTBCLFFBQVEsS0FBSyxJQUFJLEVBQUUsNkJBQThCLENBQUM7WUFDcEUsSUFBSyxPQUFPQSxRQUFRLEtBQUssUUFBUSxFQUFHO2NBQ2xDcUIsZ0JBQWdCLENBQUNVLElBQUksQ0FBRTtnQkFDckJqRixjQUFjLEVBQUVBLGNBQWM7Z0JBQzlCa0QsUUFBUSxFQUFFQSxRQUFRO2dCQUNsQndCLHlCQUF5QixFQUFFVSxPQUFPLENBQUNWLHlCQUF5QixHQUFHMUUsY0FBYyxDQUFDeUQ7Y0FDaEYsQ0FBRSxDQUFDO1lBQ0w7VUFDRjtRQUNGO01BQ0Y7SUFDRjtJQUNBLE9BQU9jLGdCQUFnQjtFQUN6QjtBQUNGO0FBRUEvRSw0QkFBNEIsQ0FBQzZGLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRWhGLGNBQWUsQ0FBQyJ9