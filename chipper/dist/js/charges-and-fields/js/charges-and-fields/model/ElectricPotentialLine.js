// Copyright 2015-2023, University of Colorado Boulder

/**
 * Type responsible for creating an electric potential line
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dot from '../../../../dot/js/dot.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import chargesAndFields from '../../chargesAndFields.js';

// constants
// see getEquipotentialPositionArray to find how these are used
const MAX_STEPS = 5000; // {number} integer, the maximum number of steps in the search for a closed path
const MIN_STEPS = 1000; // {number} integer, the minimum number of steps it will do while searching for a closed path
const MAX_EPSILON_DISTANCE = 0.05; // {number} maximum step length along electricPotential in meters
const MIN_EPSILON_DISTANCE = 0.01; // {number} minimum step length along electricPotential in meters

class ElectricPotentialLine extends PhetioObject {
  /**
   * @param {ChargesAndFieldsModel} model
   * @param {Vector2} position
   * @param {Tandem} tandem
   */
  constructor(model, position, tandem) {
    super({
      tandem: tandem,
      phetioType: ElectricPotentialLine.ElectricPotentialLineIO,
      phetioDynamicElement: true
    });
    this.model = model;
    this.position = position; // {Vector2} @public read-only static

    // @public - the position of where the user is trying to drag the voltage label, in model coordinates
    this.voltageLabelPositionProperty = new Vector2Property(position, {
      tandem: tandem.createTandem('voltageLabelPositionProperty'),
      valueComparisonStrategy: 'equalsFunction'
    });
    this.chargeChangedEmitter = new Emitter();

    // On startup and whenever the charge configuration changes, update the state of this line
    this.chargeChangedListener = () => {
      this.electricPotential = model.getElectricPotential(position); // {number} @public read-only static - value in volts

      this.isLineClosed = false; // @private - value will be updated by  this.getEquipotentialPositionArray
      this.isEquipotentialLineTerminatingInsideBounds = true; // @private - value will be updated by this.getEquipotentialPositionArray

      // TODO: the conditional here is to support mutating this potential line, let's do this better.
      const hasElectricField = this.model.getElectricField(position).magnitude !== 0;
      this.positionArray = hasElectricField ? this.getEquipotentialPositionArray(position) : []; // @public read-only

      if (!this.isDisposed) {
        this.chargeChangedEmitter.emit();
      }
    };
    this.chargeChangedListener();
    this.model.chargeConfigurationChangedEmitter.addListener(this.chargeChangedListener);
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.model.chargeConfigurationChangedEmitter.removeListener(this.chargeChangedListener);
    this.voltageLabelPositionProperty.dispose();
    this.chargeChangedEmitter.dispose();
    super.dispose();
  }

  /**
   * Given an (initial) position, find a position with the targeted electric potential within a distance 'deltaDistance'
   * This finds the next position with a precision of  ('deltaDistance')^2. There are other algorithms
   * that are more precise however, this is globally quite precise since it keeps track of the targeted electric potential
   * and therefore there is no electric potential drift over large distance. The drawback of this approach is that
   * there is no guarantee that the next position is within a delta distance from the initial point.
   * see https://github.com/phetsims/charges-and-fields/issues/5
   *
   * @private
   * @param {Vector2} position
   * @param {number} electricPotential
   * @param {number} deltaDistance - a distance in meters, can be positive or negative
   * @returns {Vector2} finalPosition
   */
  getNextPositionAlongEquipotentialWithElectricPotential(position, electricPotential, deltaDistance) {
    /*
     * General Idea: Given the electric field at point position, find an intermediate point that is 90 degrees
     * to the left of the electric field (if deltaDistance is positive) or to the right (if deltaDistance is negative).
     * A further correction is applied since this intermediate point will not have the same electric potential
     * as the targeted electric potential. To find the final point, the electric potential offset between the targeted
     * and the electric potential at the intermediate point is found. By knowing the electric field at the intermediate point
     * the next point should be found (approximately) at a distance epsilon equal to (Delta V)/|E| of the intermediate point.
     */
    const initialElectricField = this.model.getElectricField(position); // {Vector2}
    assert && assert(initialElectricField.magnitude !== 0, 'the magnitude of the electric field is zero: initial Electric Field');
    const electricPotentialNormalizedVector = initialElectricField.normalize().rotate(Math.PI / 2); // {Vector2} normalized Vector along electricPotential
    const midwayPosition = electricPotentialNormalizedVector.multiplyScalar(deltaDistance).add(position); // {Vector2}
    const midwayElectricField = this.model.getElectricField(midwayPosition); // {Vector2}
    assert && assert(midwayElectricField.magnitude !== 0, 'the magnitude of the electric field is zero: midway Electric Field ');
    const midwayElectricPotential = this.model.getElectricPotential(midwayPosition); //  {number}
    const deltaElectricPotential = midwayElectricPotential - electricPotential; // {number}
    const deltaPosition = midwayElectricField.multiplyScalar(deltaElectricPotential / midwayElectricField.magnitudeSquared); // {Vector2}

    // if the second order correction is larger than the first, use a more computationally expensive but accurate method.
    if (deltaPosition.magnitude > Math.abs(deltaDistance)) {
      // use a fail safe method
      return this.getNextPositionAlongEquipotentialWithRK4(position, deltaDistance);
    } else {
      return midwayPosition.add(deltaPosition); // {Vector2} finalPosition
    }
  }

  /**
   * Given an (initial) position, find a position with the same (ideally) electric potential within a distance deltaDistance
   * of the initial position. This is locally precise to (deltaDistance)^4 and guaranteed to be within a distance deltaDistance
   * from the starting point.
   *
   * This uses a standard RK4 algorithm generalized to 2D
   * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
   * @private
   * @param {Vector2} position
   * @param {number} deltaDistance - a distance in meters, can be positive or negative
   * @returns {Vector2} finalPosition
   */
  getNextPositionAlongEquipotentialWithRK4(position, deltaDistance) {
    const initialElectricField = this.model.getElectricField(position); // {Vector2}
    assert && assert(initialElectricField.magnitude !== 0, 'the magnitude of the electric field is zero: initial Electric Field');
    const k1Vector = this.model.getElectricField(position).normalize().rotate(Math.PI / 2); // {Vector2} normalized Vector along electricPotential
    const k2Vector = this.model.getElectricField(position.plus(k1Vector.timesScalar(deltaDistance / 2))).normalize().rotate(Math.PI / 2); // {Vector2} normalized Vector along electricPotential
    const k3Vector = this.model.getElectricField(position.plus(k2Vector.timesScalar(deltaDistance / 2))).normalize().rotate(Math.PI / 2); // {Vector2} normalized Vector along electricPotential
    const k4Vector = this.model.getElectricField(position.plus(k3Vector.timesScalar(deltaDistance))).normalize().rotate(Math.PI / 2); // {Vector2} normalized Vector along electricPotential
    const deltaDisplacement = {
      x: deltaDistance * (k1Vector.x + 2 * k2Vector.x + 2 * k3Vector.x + k4Vector.x) / 6,
      y: deltaDistance * (k1Vector.y + 2 * k2Vector.y + 2 * k3Vector.y + k4Vector.y) / 6
    };
    return position.plus(deltaDisplacement); // {Vector2} finalPosition
  }

  /**
   * This method returns an array of points {Vector2} with the same electric potential as the electric potential
   * at the initial position. The array is ordered with position points going counterclockwise.
   *
   * This function has side effects and updates this.isEquipotentialLineTerminatingInsideBounds and
   * this.isLineClosed.
   *
   * @private
   * @param {Vector2} position - initial position
   * @returns {Array.<Vector2>} a series of positions with the same electric Potential as the initial position
   */
  getEquipotentialPositionArray(position) {
    if (this.model.activeChargedParticles.length === 0) {
      return [];
    }

    /*
     * General Idea of this algorithm
     *
     * The electricPotential line is found using two searches. Starting from an initial point, we find the electric
     * field at this position and define the point to the left of the electric field as the counterclockwise point,
     * whereas the point that is 90 degree right of the electric field is the clockwise point. The points are stored
     * in a counterclockwise and clockwise array. The search of the clockwise and counterclockwise points done
     * concurrently. The search stops if (1) the number of searching steps exceeds a large number and (2) either the
     * clockwise or counterClockwise point is very far away from the origin. A third condition to bailout of the
     * search is that the clockwise and counterClockwise position are very close to one another in which case we have
     * a closed electricPotential line. Note that if the conditions (1) and (2) are fulfilled the electricPotential
     * line is not going to be a closed line but this is so far away from the screenview that the end user will simply
     * see the line going beyond the screen.
     *
     * After the search is done, the function returns an array of points ordered in a counterclockwise direction,
     * i.e. after joining all the points, the directed line would be made of points that have an electric field
     * pointing clockwise (yes  clockwise) to the direction of the line.
     */
    let stepCounter = 0; // {number} integer

    let nextClockwisePosition; // {Vector2}
    let nextCounterClockwisePosition; // {Vector2}
    let currentClockwisePosition = position; // {Vector2}
    let currentCounterClockwisePosition = position; // {Vector2}
    const clockwisePositionArray = [];
    const counterClockwisePositionArray = [];

    // initial epsilon distance for the two heads.
    let clockwiseEpsilonDistance = MIN_EPSILON_DISTANCE;
    let counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;
    while (stepCounter < MAX_STEPS && !this.isLineClosed && (this.isEquipotentialLineTerminatingInsideBounds || stepCounter < MIN_STEPS)) {
      nextClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(currentClockwisePosition, this.electricPotential, clockwiseEpsilonDistance);
      nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(currentCounterClockwisePosition, this.electricPotential, counterClockwiseEpsilonDistance);
      clockwisePositionArray.push(nextClockwisePosition);
      counterClockwisePositionArray.push(nextCounterClockwisePosition);
      currentClockwisePosition = nextClockwisePosition;
      currentCounterClockwisePosition = nextCounterClockwisePosition;
      stepCounter++;

      // after three steps, the epsilon distance is adaptative, i.e. large distance when 'easy', small when 'difficult'
      if (stepCounter > 3) {
        // adaptative epsilon distance
        clockwiseEpsilonDistance = this.getAdaptativeEpsilonDistance(clockwiseEpsilonDistance, clockwisePositionArray, true);
        counterClockwiseEpsilonDistance = this.getAdaptativeEpsilonDistance(counterClockwiseEpsilonDistance, counterClockwisePositionArray, false);
        assert && assert(clockwiseEpsilonDistance > 0); // sanity check
        assert && assert(counterClockwiseEpsilonDistance < 0);

        // distance between the two searching heads
        const approachDistance = currentClockwisePosition.distance(currentCounterClockwisePosition);

        // logic to stop the while loop when the two heads are getting closer
        if (approachDistance < clockwiseEpsilonDistance + Math.abs(counterClockwiseEpsilonDistance)) {
          // we want to perform more steps as the two head get closer but we want to avoid the two heads to pass
          // one another. Let's reduce the epsilon distance
          clockwiseEpsilonDistance = approachDistance / 3;
          counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;
          if (approachDistance < 2 * MIN_EPSILON_DISTANCE) {
            // if the clockwise and counterclockwise points are close to one another, set this.isLineClosed to true to get out of this while loop
            this.isLineClosed = true;
          }
        }
      } // end of if (stepCounter>3)

      // is at least one current head inside the bounds?
      this.isEquipotentialLineTerminatingInsideBounds = this.model.enlargedBounds.containsPoint(currentClockwisePosition) || this.model.enlargedBounds.containsPoint(currentCounterClockwisePosition);
    } // end of while()

    if (!this.isLineClosed && this.isEquipotentialLineTerminatingInsideBounds) {
      // see https://github.com/phetsims/charges-and-fields/issues/1
      // this is very difficult to come up with such a scenario. so far this
      // was encountered only with a pure quadrupole configuration.
      // let's redo the entire process but starting a tad to the right so we don't get stuck in our search
      const weeVector = new Vector2(0.00031415, 0.00027178); // (pi, e)
      return this.getEquipotentialPositionArray(position.plus(weeVector));
    }

    // let's order all the positions (including the initial point) in an array in a counterclockwise fashion
    const reversedArray = clockwisePositionArray.reverse();

    // let's return the entire array, i.e. the reversed clockwise array, the initial position, and the counterclockwise array
    return reversedArray.concat(position, counterClockwisePositionArray);
  }

  /**
   * Function that prunes points from a positionArray. The goal of this method is to
   * speed up the laying out the line by passing to scenery the minimal number of points
   * in the position array while being visually equivalent.
   * For instance this method would remove the middle point of three consecutive collinear points.
   * More generally, if the middle point is a distance less than maxOffset of the line connecting the two
   * neighboring points, then it is removed.
   *
   * @private
   * @param {Array.<Vector2>} positionArray
   * @returns {Array.<Vector2>}
   */
  getPrunedPositionArray(positionArray) {
    const length = positionArray.length;
    const prunedPositionArray = []; // {Array.<Vector2>}

    if (length === 0) {
      return [];
    }

    // push first data point
    prunedPositionArray.push(positionArray[0]);
    const maxOffset = 0.001; // in model coordinates, the threshold of visual acuity when rendered on the screen
    let lastPushedIndex = 0; // index of the last positionArray element pushed into prunedPosition

    for (let i = 1; i < length - 1; i++) {
      const lastPushedPoint = prunedPositionArray[prunedPositionArray.length - 1];
      for (let j = lastPushedIndex; j < i + 1; j++) {
        const distance = this.getDistanceFromLine(lastPushedPoint, positionArray[j + 1], positionArray[i + 1]);
        if (distance > maxOffset) {
          prunedPositionArray.push(positionArray[i]);
          lastPushedIndex = i;
          break; // breaks out of the inner for loop
        }
      }
    }

    // push last data point
    prunedPositionArray.push(positionArray[length - 1]);
    return prunedPositionArray;
  }

  /**
   * Function that returns the smallest distance between the midwayPoint and
   * a straight line that would connect initialPoint and finalPoint.
   * see http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
   * @private
   * @param {Vector2} initialPoint
   * @param {Vector2} midwayPoint
   * @param {Vector2} finalPoint
   * @returns {number}
   */
  getDistanceFromLine(initialPoint, midwayPoint, finalPoint) {
    const midwayDisplacement = midwayPoint.minus(initialPoint);
    const finalDisplacement = finalPoint.minus(initialPoint);
    return Math.abs(midwayDisplacement.crossScalar(finalDisplacement.normalized()));
  }

  /**
   * Function that returns the an updated epsilonDistance based on the three last points
   * of positionArray
   * @private
   * @param {number} epsilonDistance
   * @param {Array.<Vector2>} positionArray
   * @param {boolean} isClockwise
   * @returns {number}
   */
  getAdaptativeEpsilonDistance(epsilonDistance, positionArray, isClockwise) {
    const deflectionAngle = this.getRotationAngle(positionArray); // non negative number in radians
    if (deflectionAngle === 0) {
      // pedal to metal
      epsilonDistance = MAX_EPSILON_DISTANCE;
    } else {
      // shorten the epsilon distance in tight turns, longer steps in straighter stretch
      // 360 implies that a perfect circle could be generated by 360 points, i.e. a rotation of 1 degree doesn't change epsilonDistance.
      epsilonDistance *= 2 * Math.PI / 360 / deflectionAngle;
    }
    // clamp the value of epsilonDistance to be within this range
    epsilonDistance = dot.clamp(Math.abs(epsilonDistance), MIN_EPSILON_DISTANCE, MAX_EPSILON_DISTANCE);
    epsilonDistance = isClockwise ? epsilonDistance : -epsilonDistance;
    return epsilonDistance;
  }

  /**
   * Function that returns the rotation angle between the three last points of a position array
   *
   * @private
   * @param {Array.<Vector2>} positionArray
   * @returns {number}
   */
  getRotationAngle(positionArray) {
    assert && assert(positionArray.length > 2, 'the positionArray must contain at least three elements');
    const length = positionArray.length;
    const newDeltaPosition = positionArray[length - 1].minus(positionArray[length - 2]);
    const oldDeltaPosition = positionArray[length - 2].minus(positionArray[length - 3]);
    return newDeltaPosition.angleBetween(oldDeltaPosition); // a positive number
  }

  /**
   * Returns the Shape of the electric potential line
   * @public read-only
   * @returns {Shape}
   */
  getShape() {
    const shape = new Shape();
    if (this.model.activeChargedParticles.lengthProperty.value === 0) {
      return shape; // to support mutable potential lines and PhET-iO state
    }

    const prunedPositionArray = this.getPrunedPositionArray(this.positionArray);
    return this.positionArrayToStraightLine(shape, prunedPositionArray, {
      isClosedLineSegments: this.isLineClosed
    });
  }

  /**
   * Function that returns an appended shape with lines between points.
   * @private
   * @param {Shape} shape
   * @param {Array.<Vector2>} positionArray
   * @param {Object} [options]
   * @returns {Shape}
   */
  positionArrayToStraightLine(shape, positionArray, options) {
    options = merge({
      // is the resulting shape forming a close path
      isClosedLineSegments: false
    }, options);

    // if the line is open, there is one less segments than point vectors
    const segmentsNumber = options.isClosedLineSegments ? positionArray.length : positionArray.length - 1;
    shape.moveToPoint(positionArray[0]);
    for (let i = 1; i < segmentsNumber + 1; i++) {
      shape.lineToPoint(positionArray[i % positionArray.length]);
    }
    return shape;
  }
}
ElectricPotentialLine.ElectricPotentialLineIO = new IOType('ElectricPotentialLineIO', {
  valueType: ElectricPotentialLine,
  documentation: 'The vector that shows the charge strength and direction.',
  toStateObject: electricPotentialLine => ({
    position: Vector2.Vector2IO.toStateObject(electricPotentialLine.position)
  }),
  stateSchema: {
    position: Vector2.Vector2IO
  },
  stateObjectToCreateElementArguments: stateObject => [Vector2.Vector2IO.fromStateObject(stateObject.position)]
});
chargesAndFields.register('ElectricPotentialLine', ElectricPotentialLine);
export default ElectricPotentialLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiZG90IiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlNoYXBlIiwibWVyZ2UiLCJQaGV0aW9PYmplY3QiLCJJT1R5cGUiLCJjaGFyZ2VzQW5kRmllbGRzIiwiTUFYX1NURVBTIiwiTUlOX1NURVBTIiwiTUFYX0VQU0lMT05fRElTVEFOQ0UiLCJNSU5fRVBTSUxPTl9ESVNUQU5DRSIsIkVsZWN0cmljUG90ZW50aWFsTGluZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJwb3NpdGlvbiIsInRhbmRlbSIsInBoZXRpb1R5cGUiLCJFbGVjdHJpY1BvdGVudGlhbExpbmVJTyIsInBoZXRpb0R5bmFtaWNFbGVtZW50Iiwidm9sdGFnZUxhYmVsUG9zaXRpb25Qcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IiwiY2hhcmdlQ2hhbmdlZEVtaXR0ZXIiLCJjaGFyZ2VDaGFuZ2VkTGlzdGVuZXIiLCJlbGVjdHJpY1BvdGVudGlhbCIsImdldEVsZWN0cmljUG90ZW50aWFsIiwiaXNMaW5lQ2xvc2VkIiwiaXNFcXVpcG90ZW50aWFsTGluZVRlcm1pbmF0aW5nSW5zaWRlQm91bmRzIiwiaGFzRWxlY3RyaWNGaWVsZCIsImdldEVsZWN0cmljRmllbGQiLCJtYWduaXR1ZGUiLCJwb3NpdGlvbkFycmF5IiwiZ2V0RXF1aXBvdGVudGlhbFBvc2l0aW9uQXJyYXkiLCJpc0Rpc3Bvc2VkIiwiZW1pdCIsImNoYXJnZUNvbmZpZ3VyYXRpb25DaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsInJlbW92ZUxpc3RlbmVyIiwiZ2V0TmV4dFBvc2l0aW9uQWxvbmdFcXVpcG90ZW50aWFsV2l0aEVsZWN0cmljUG90ZW50aWFsIiwiZGVsdGFEaXN0YW5jZSIsImluaXRpYWxFbGVjdHJpY0ZpZWxkIiwiYXNzZXJ0IiwiZWxlY3RyaWNQb3RlbnRpYWxOb3JtYWxpemVkVmVjdG9yIiwibm9ybWFsaXplIiwicm90YXRlIiwiTWF0aCIsIlBJIiwibWlkd2F5UG9zaXRpb24iLCJtdWx0aXBseVNjYWxhciIsImFkZCIsIm1pZHdheUVsZWN0cmljRmllbGQiLCJtaWR3YXlFbGVjdHJpY1BvdGVudGlhbCIsImRlbHRhRWxlY3RyaWNQb3RlbnRpYWwiLCJkZWx0YVBvc2l0aW9uIiwibWFnbml0dWRlU3F1YXJlZCIsImFicyIsImdldE5leHRQb3NpdGlvbkFsb25nRXF1aXBvdGVudGlhbFdpdGhSSzQiLCJrMVZlY3RvciIsImsyVmVjdG9yIiwicGx1cyIsInRpbWVzU2NhbGFyIiwiazNWZWN0b3IiLCJrNFZlY3RvciIsImRlbHRhRGlzcGxhY2VtZW50IiwieCIsInkiLCJhY3RpdmVDaGFyZ2VkUGFydGljbGVzIiwibGVuZ3RoIiwic3RlcENvdW50ZXIiLCJuZXh0Q2xvY2t3aXNlUG9zaXRpb24iLCJuZXh0Q291bnRlckNsb2Nrd2lzZVBvc2l0aW9uIiwiY3VycmVudENsb2Nrd2lzZVBvc2l0aW9uIiwiY3VycmVudENvdW50ZXJDbG9ja3dpc2VQb3NpdGlvbiIsImNsb2Nrd2lzZVBvc2l0aW9uQXJyYXkiLCJjb3VudGVyQ2xvY2t3aXNlUG9zaXRpb25BcnJheSIsImNsb2Nrd2lzZUVwc2lsb25EaXN0YW5jZSIsImNvdW50ZXJDbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UiLCJwdXNoIiwiZ2V0QWRhcHRhdGl2ZUVwc2lsb25EaXN0YW5jZSIsImFwcHJvYWNoRGlzdGFuY2UiLCJkaXN0YW5jZSIsImVubGFyZ2VkQm91bmRzIiwiY29udGFpbnNQb2ludCIsIndlZVZlY3RvciIsInJldmVyc2VkQXJyYXkiLCJyZXZlcnNlIiwiY29uY2F0IiwiZ2V0UHJ1bmVkUG9zaXRpb25BcnJheSIsInBydW5lZFBvc2l0aW9uQXJyYXkiLCJtYXhPZmZzZXQiLCJsYXN0UHVzaGVkSW5kZXgiLCJpIiwibGFzdFB1c2hlZFBvaW50IiwiaiIsImdldERpc3RhbmNlRnJvbUxpbmUiLCJpbml0aWFsUG9pbnQiLCJtaWR3YXlQb2ludCIsImZpbmFsUG9pbnQiLCJtaWR3YXlEaXNwbGFjZW1lbnQiLCJtaW51cyIsImZpbmFsRGlzcGxhY2VtZW50IiwiY3Jvc3NTY2FsYXIiLCJub3JtYWxpemVkIiwiZXBzaWxvbkRpc3RhbmNlIiwiaXNDbG9ja3dpc2UiLCJkZWZsZWN0aW9uQW5nbGUiLCJnZXRSb3RhdGlvbkFuZ2xlIiwiY2xhbXAiLCJuZXdEZWx0YVBvc2l0aW9uIiwib2xkRGVsdGFQb3NpdGlvbiIsImFuZ2xlQmV0d2VlbiIsImdldFNoYXBlIiwic2hhcGUiLCJsZW5ndGhQcm9wZXJ0eSIsInZhbHVlIiwicG9zaXRpb25BcnJheVRvU3RyYWlnaHRMaW5lIiwiaXNDbG9zZWRMaW5lU2VnbWVudHMiLCJvcHRpb25zIiwic2VnbWVudHNOdW1iZXIiLCJtb3ZlVG9Qb2ludCIsImxpbmVUb1BvaW50IiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJlbGVjdHJpY1BvdGVudGlhbExpbmUiLCJWZWN0b3IySU8iLCJzdGF0ZVNjaGVtYSIsInN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzIiwic3RhdGVPYmplY3QiLCJmcm9tU3RhdGVPYmplY3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVsZWN0cmljUG90ZW50aWFsTGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUeXBlIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyBhbiBlbGVjdHJpYyBwb3RlbnRpYWwgbGluZVxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgY2hhcmdlc0FuZEZpZWxkcyBmcm9tICcuLi8uLi9jaGFyZ2VzQW5kRmllbGRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBzZWUgZ2V0RXF1aXBvdGVudGlhbFBvc2l0aW9uQXJyYXkgdG8gZmluZCBob3cgdGhlc2UgYXJlIHVzZWRcclxuY29uc3QgTUFYX1NURVBTID0gNTAwMDsgLy8ge251bWJlcn0gaW50ZWdlciwgdGhlIG1heGltdW0gbnVtYmVyIG9mIHN0ZXBzIGluIHRoZSBzZWFyY2ggZm9yIGEgY2xvc2VkIHBhdGhcclxuY29uc3QgTUlOX1NURVBTID0gMTAwMDsgLy8ge251bWJlcn0gaW50ZWdlciwgdGhlIG1pbmltdW0gbnVtYmVyIG9mIHN0ZXBzIGl0IHdpbGwgZG8gd2hpbGUgc2VhcmNoaW5nIGZvciBhIGNsb3NlZCBwYXRoXHJcbmNvbnN0IE1BWF9FUFNJTE9OX0RJU1RBTkNFID0gMC4wNTsgLy8ge251bWJlcn0gbWF4aW11bSBzdGVwIGxlbmd0aCBhbG9uZyBlbGVjdHJpY1BvdGVudGlhbCBpbiBtZXRlcnNcclxuY29uc3QgTUlOX0VQU0lMT05fRElTVEFOQ0UgPSAwLjAxOyAvLyB7bnVtYmVyfSBtaW5pbXVtIHN0ZXAgbGVuZ3RoIGFsb25nIGVsZWN0cmljUG90ZW50aWFsIGluIG1ldGVyc1xyXG5cclxuY2xhc3MgRWxlY3RyaWNQb3RlbnRpYWxMaW5lIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDaGFyZ2VzQW5kRmllbGRzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHBvc2l0aW9uLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1R5cGU6IEVsZWN0cmljUG90ZW50aWFsTGluZS5FbGVjdHJpY1BvdGVudGlhbExpbmVJTyxcclxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247IC8vIHtWZWN0b3IyfSBAcHVibGljIHJlYWQtb25seSBzdGF0aWNcclxuXHJcbiAgICAvLyBAcHVibGljIC0gdGhlIHBvc2l0aW9uIG9mIHdoZXJlIHRoZSB1c2VyIGlzIHRyeWluZyB0byBkcmFnIHRoZSB2b2x0YWdlIGxhYmVsLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgdGhpcy52b2x0YWdlTGFiZWxQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggcG9zaXRpb24sIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdGFnZUxhYmVsUG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNoYXJnZUNoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBPbiBzdGFydHVwIGFuZCB3aGVuZXZlciB0aGUgY2hhcmdlIGNvbmZpZ3VyYXRpb24gY2hhbmdlcywgdXBkYXRlIHRoZSBzdGF0ZSBvZiB0aGlzIGxpbmVcclxuICAgIHRoaXMuY2hhcmdlQ2hhbmdlZExpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmVsZWN0cmljUG90ZW50aWFsID0gbW9kZWwuZ2V0RWxlY3RyaWNQb3RlbnRpYWwoIHBvc2l0aW9uICk7IC8vIHtudW1iZXJ9IEBwdWJsaWMgcmVhZC1vbmx5IHN0YXRpYyAtIHZhbHVlIGluIHZvbHRzXHJcblxyXG4gICAgICB0aGlzLmlzTGluZUNsb3NlZCA9IGZhbHNlOyAvLyBAcHJpdmF0ZSAtIHZhbHVlIHdpbGwgYmUgdXBkYXRlZCBieSAgdGhpcy5nZXRFcXVpcG90ZW50aWFsUG9zaXRpb25BcnJheVxyXG4gICAgICB0aGlzLmlzRXF1aXBvdGVudGlhbExpbmVUZXJtaW5hdGluZ0luc2lkZUJvdW5kcyA9IHRydWU7IC8vIEBwcml2YXRlIC0gdmFsdWUgd2lsbCBiZSB1cGRhdGVkIGJ5IHRoaXMuZ2V0RXF1aXBvdGVudGlhbFBvc2l0aW9uQXJyYXlcclxuXHJcbiAgICAgIC8vIFRPRE86IHRoZSBjb25kaXRpb25hbCBoZXJlIGlzIHRvIHN1cHBvcnQgbXV0YXRpbmcgdGhpcyBwb3RlbnRpYWwgbGluZSwgbGV0J3MgZG8gdGhpcyBiZXR0ZXIuXHJcbiAgICAgIGNvbnN0IGhhc0VsZWN0cmljRmllbGQgPSB0aGlzLm1vZGVsLmdldEVsZWN0cmljRmllbGQoIHBvc2l0aW9uICkubWFnbml0dWRlICE9PSAwO1xyXG4gICAgICB0aGlzLnBvc2l0aW9uQXJyYXkgPSBoYXNFbGVjdHJpY0ZpZWxkID8gdGhpcy5nZXRFcXVpcG90ZW50aWFsUG9zaXRpb25BcnJheSggcG9zaXRpb24gKSA6IFtdOyAvLyBAcHVibGljIHJlYWQtb25seVxyXG5cclxuICAgICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICAgIHRoaXMuY2hhcmdlQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5jaGFyZ2VDaGFuZ2VkTGlzdGVuZXIoKTtcclxuICAgIHRoaXMubW9kZWwuY2hhcmdlQ29uZmlndXJhdGlvbkNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmNoYXJnZUNoYW5nZWRMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5tb2RlbC5jaGFyZ2VDb25maWd1cmF0aW9uQ2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuY2hhcmdlQ2hhbmdlZExpc3RlbmVyICk7XHJcbiAgICB0aGlzLnZvbHRhZ2VMYWJlbFBvc2l0aW9uUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5jaGFyZ2VDaGFuZ2VkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhbiAoaW5pdGlhbCkgcG9zaXRpb24sIGZpbmQgYSBwb3NpdGlvbiB3aXRoIHRoZSB0YXJnZXRlZCBlbGVjdHJpYyBwb3RlbnRpYWwgd2l0aGluIGEgZGlzdGFuY2UgJ2RlbHRhRGlzdGFuY2UnXHJcbiAgICogVGhpcyBmaW5kcyB0aGUgbmV4dCBwb3NpdGlvbiB3aXRoIGEgcHJlY2lzaW9uIG9mICAoJ2RlbHRhRGlzdGFuY2UnKV4yLiBUaGVyZSBhcmUgb3RoZXIgYWxnb3JpdGhtc1xyXG4gICAqIHRoYXQgYXJlIG1vcmUgcHJlY2lzZSBob3dldmVyLCB0aGlzIGlzIGdsb2JhbGx5IHF1aXRlIHByZWNpc2Ugc2luY2UgaXQga2VlcHMgdHJhY2sgb2YgdGhlIHRhcmdldGVkIGVsZWN0cmljIHBvdGVudGlhbFxyXG4gICAqIGFuZCB0aGVyZWZvcmUgdGhlcmUgaXMgbm8gZWxlY3RyaWMgcG90ZW50aWFsIGRyaWZ0IG92ZXIgbGFyZ2UgZGlzdGFuY2UuIFRoZSBkcmF3YmFjayBvZiB0aGlzIGFwcHJvYWNoIGlzIHRoYXRcclxuICAgKiB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGUgbmV4dCBwb3NpdGlvbiBpcyB3aXRoaW4gYSBkZWx0YSBkaXN0YW5jZSBmcm9tIHRoZSBpbml0aWFsIHBvaW50LlxyXG4gICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hhcmdlcy1hbmQtZmllbGRzL2lzc3Vlcy81XHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZWxlY3RyaWNQb3RlbnRpYWxcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGFEaXN0YW5jZSAtIGEgZGlzdGFuY2UgaW4gbWV0ZXJzLCBjYW4gYmUgcG9zaXRpdmUgb3IgbmVnYXRpdmVcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gZmluYWxQb3NpdGlvblxyXG4gICAqL1xyXG4gIGdldE5leHRQb3NpdGlvbkFsb25nRXF1aXBvdGVudGlhbFdpdGhFbGVjdHJpY1BvdGVudGlhbCggcG9zaXRpb24sIGVsZWN0cmljUG90ZW50aWFsLCBkZWx0YURpc3RhbmNlICkge1xyXG4gICAgLypcclxuICAgICAqIEdlbmVyYWwgSWRlYTogR2l2ZW4gdGhlIGVsZWN0cmljIGZpZWxkIGF0IHBvaW50IHBvc2l0aW9uLCBmaW5kIGFuIGludGVybWVkaWF0ZSBwb2ludCB0aGF0IGlzIDkwIGRlZ3JlZXNcclxuICAgICAqIHRvIHRoZSBsZWZ0IG9mIHRoZSBlbGVjdHJpYyBmaWVsZCAoaWYgZGVsdGFEaXN0YW5jZSBpcyBwb3NpdGl2ZSkgb3IgdG8gdGhlIHJpZ2h0IChpZiBkZWx0YURpc3RhbmNlIGlzIG5lZ2F0aXZlKS5cclxuICAgICAqIEEgZnVydGhlciBjb3JyZWN0aW9uIGlzIGFwcGxpZWQgc2luY2UgdGhpcyBpbnRlcm1lZGlhdGUgcG9pbnQgd2lsbCBub3QgaGF2ZSB0aGUgc2FtZSBlbGVjdHJpYyBwb3RlbnRpYWxcclxuICAgICAqIGFzIHRoZSB0YXJnZXRlZCBlbGVjdHJpYyBwb3RlbnRpYWwuIFRvIGZpbmQgdGhlIGZpbmFsIHBvaW50LCB0aGUgZWxlY3RyaWMgcG90ZW50aWFsIG9mZnNldCBiZXR3ZWVuIHRoZSB0YXJnZXRlZFxyXG4gICAgICogYW5kIHRoZSBlbGVjdHJpYyBwb3RlbnRpYWwgYXQgdGhlIGludGVybWVkaWF0ZSBwb2ludCBpcyBmb3VuZC4gQnkga25vd2luZyB0aGUgZWxlY3RyaWMgZmllbGQgYXQgdGhlIGludGVybWVkaWF0ZSBwb2ludFxyXG4gICAgICogdGhlIG5leHQgcG9pbnQgc2hvdWxkIGJlIGZvdW5kIChhcHByb3hpbWF0ZWx5KSBhdCBhIGRpc3RhbmNlIGVwc2lsb24gZXF1YWwgdG8gKERlbHRhIFYpL3xFfCBvZiB0aGUgaW50ZXJtZWRpYXRlIHBvaW50LlxyXG4gICAgICovXHJcbiAgICBjb25zdCBpbml0aWFsRWxlY3RyaWNGaWVsZCA9IHRoaXMubW9kZWwuZ2V0RWxlY3RyaWNGaWVsZCggcG9zaXRpb24gKTsgLy8ge1ZlY3RvcjJ9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbml0aWFsRWxlY3RyaWNGaWVsZC5tYWduaXR1ZGUgIT09IDAsICd0aGUgbWFnbml0dWRlIG9mIHRoZSBlbGVjdHJpYyBmaWVsZCBpcyB6ZXJvOiBpbml0aWFsIEVsZWN0cmljIEZpZWxkJyApO1xyXG4gICAgY29uc3QgZWxlY3RyaWNQb3RlbnRpYWxOb3JtYWxpemVkVmVjdG9yID0gaW5pdGlhbEVsZWN0cmljRmllbGQubm9ybWFsaXplKCkucm90YXRlKCBNYXRoLlBJIC8gMiApOyAvLyB7VmVjdG9yMn0gbm9ybWFsaXplZCBWZWN0b3IgYWxvbmcgZWxlY3RyaWNQb3RlbnRpYWxcclxuICAgIGNvbnN0IG1pZHdheVBvc2l0aW9uID0gKCBlbGVjdHJpY1BvdGVudGlhbE5vcm1hbGl6ZWRWZWN0b3IubXVsdGlwbHlTY2FsYXIoIGRlbHRhRGlzdGFuY2UgKSApLmFkZCggcG9zaXRpb24gKTsgLy8ge1ZlY3RvcjJ9XHJcbiAgICBjb25zdCBtaWR3YXlFbGVjdHJpY0ZpZWxkID0gdGhpcy5tb2RlbC5nZXRFbGVjdHJpY0ZpZWxkKCBtaWR3YXlQb3NpdGlvbiApOyAvLyB7VmVjdG9yMn1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pZHdheUVsZWN0cmljRmllbGQubWFnbml0dWRlICE9PSAwLCAndGhlIG1hZ25pdHVkZSBvZiB0aGUgZWxlY3RyaWMgZmllbGQgaXMgemVybzogbWlkd2F5IEVsZWN0cmljIEZpZWxkICcgKTtcclxuICAgIGNvbnN0IG1pZHdheUVsZWN0cmljUG90ZW50aWFsID0gdGhpcy5tb2RlbC5nZXRFbGVjdHJpY1BvdGVudGlhbCggbWlkd2F5UG9zaXRpb24gKTsgLy8gIHtudW1iZXJ9XHJcbiAgICBjb25zdCBkZWx0YUVsZWN0cmljUG90ZW50aWFsID0gbWlkd2F5RWxlY3RyaWNQb3RlbnRpYWwgLSBlbGVjdHJpY1BvdGVudGlhbDsgLy8ge251bWJlcn1cclxuICAgIGNvbnN0IGRlbHRhUG9zaXRpb24gPSBtaWR3YXlFbGVjdHJpY0ZpZWxkLm11bHRpcGx5U2NhbGFyKCBkZWx0YUVsZWN0cmljUG90ZW50aWFsIC8gbWlkd2F5RWxlY3RyaWNGaWVsZC5tYWduaXR1ZGVTcXVhcmVkICk7IC8vIHtWZWN0b3IyfVxyXG5cclxuICAgIC8vIGlmIHRoZSBzZWNvbmQgb3JkZXIgY29ycmVjdGlvbiBpcyBsYXJnZXIgdGhhbiB0aGUgZmlyc3QsIHVzZSBhIG1vcmUgY29tcHV0YXRpb25hbGx5IGV4cGVuc2l2ZSBidXQgYWNjdXJhdGUgbWV0aG9kLlxyXG4gICAgaWYgKCBkZWx0YVBvc2l0aW9uLm1hZ25pdHVkZSA+IE1hdGguYWJzKCBkZWx0YURpc3RhbmNlICkgKSB7XHJcblxyXG4gICAgICAvLyB1c2UgYSBmYWlsIHNhZmUgbWV0aG9kXHJcbiAgICAgIHJldHVybiB0aGlzLmdldE5leHRQb3NpdGlvbkFsb25nRXF1aXBvdGVudGlhbFdpdGhSSzQoIHBvc2l0aW9uLCBkZWx0YURpc3RhbmNlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG1pZHdheVBvc2l0aW9uLmFkZCggZGVsdGFQb3NpdGlvbiApOyAvLyB7VmVjdG9yMn0gZmluYWxQb3NpdGlvblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYW4gKGluaXRpYWwpIHBvc2l0aW9uLCBmaW5kIGEgcG9zaXRpb24gd2l0aCB0aGUgc2FtZSAoaWRlYWxseSkgZWxlY3RyaWMgcG90ZW50aWFsIHdpdGhpbiBhIGRpc3RhbmNlIGRlbHRhRGlzdGFuY2VcclxuICAgKiBvZiB0aGUgaW5pdGlhbCBwb3NpdGlvbi4gVGhpcyBpcyBsb2NhbGx5IHByZWNpc2UgdG8gKGRlbHRhRGlzdGFuY2UpXjQgYW5kIGd1YXJhbnRlZWQgdG8gYmUgd2l0aGluIGEgZGlzdGFuY2UgZGVsdGFEaXN0YW5jZVxyXG4gICAqIGZyb20gdGhlIHN0YXJ0aW5nIHBvaW50LlxyXG4gICAqXHJcbiAgICogVGhpcyB1c2VzIGEgc3RhbmRhcmQgUks0IGFsZ29yaXRobSBnZW5lcmFsaXplZCB0byAyRFxyXG4gICAqIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUnVuZ2UlRTIlODAlOTNLdXR0YV9tZXRob2RzXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhRGlzdGFuY2UgLSBhIGRpc3RhbmNlIGluIG1ldGVycywgY2FuIGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9IGZpbmFsUG9zaXRpb25cclxuICAgKi9cclxuICBnZXROZXh0UG9zaXRpb25BbG9uZ0VxdWlwb3RlbnRpYWxXaXRoUks0KCBwb3NpdGlvbiwgZGVsdGFEaXN0YW5jZSApIHtcclxuICAgIGNvbnN0IGluaXRpYWxFbGVjdHJpY0ZpZWxkID0gdGhpcy5tb2RlbC5nZXRFbGVjdHJpY0ZpZWxkKCBwb3NpdGlvbiApOyAvLyB7VmVjdG9yMn1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluaXRpYWxFbGVjdHJpY0ZpZWxkLm1hZ25pdHVkZSAhPT0gMCwgJ3RoZSBtYWduaXR1ZGUgb2YgdGhlIGVsZWN0cmljIGZpZWxkIGlzIHplcm86IGluaXRpYWwgRWxlY3RyaWMgRmllbGQnICk7XHJcbiAgICBjb25zdCBrMVZlY3RvciA9IHRoaXMubW9kZWwuZ2V0RWxlY3RyaWNGaWVsZCggcG9zaXRpb24gKS5ub3JtYWxpemUoKS5yb3RhdGUoIE1hdGguUEkgLyAyICk7IC8vIHtWZWN0b3IyfSBub3JtYWxpemVkIFZlY3RvciBhbG9uZyBlbGVjdHJpY1BvdGVudGlhbFxyXG4gICAgY29uc3QgazJWZWN0b3IgPSB0aGlzLm1vZGVsLmdldEVsZWN0cmljRmllbGQoIHBvc2l0aW9uLnBsdXMoIGsxVmVjdG9yLnRpbWVzU2NhbGFyKCBkZWx0YURpc3RhbmNlIC8gMiApICkgKS5ub3JtYWxpemUoKS5yb3RhdGUoIE1hdGguUEkgLyAyICk7IC8vIHtWZWN0b3IyfSBub3JtYWxpemVkIFZlY3RvciBhbG9uZyBlbGVjdHJpY1BvdGVudGlhbFxyXG4gICAgY29uc3QgazNWZWN0b3IgPSB0aGlzLm1vZGVsLmdldEVsZWN0cmljRmllbGQoIHBvc2l0aW9uLnBsdXMoIGsyVmVjdG9yLnRpbWVzU2NhbGFyKCBkZWx0YURpc3RhbmNlIC8gMiApICkgKS5ub3JtYWxpemUoKS5yb3RhdGUoIE1hdGguUEkgLyAyICk7IC8vIHtWZWN0b3IyfSBub3JtYWxpemVkIFZlY3RvciBhbG9uZyBlbGVjdHJpY1BvdGVudGlhbFxyXG4gICAgY29uc3QgazRWZWN0b3IgPSB0aGlzLm1vZGVsLmdldEVsZWN0cmljRmllbGQoIHBvc2l0aW9uLnBsdXMoIGszVmVjdG9yLnRpbWVzU2NhbGFyKCBkZWx0YURpc3RhbmNlICkgKSApLm5vcm1hbGl6ZSgpLnJvdGF0ZSggTWF0aC5QSSAvIDIgKTsgLy8ge1ZlY3RvcjJ9IG5vcm1hbGl6ZWQgVmVjdG9yIGFsb25nIGVsZWN0cmljUG90ZW50aWFsXHJcbiAgICBjb25zdCBkZWx0YURpc3BsYWNlbWVudCA9XHJcbiAgICAgIHtcclxuICAgICAgICB4OiBkZWx0YURpc3RhbmNlICogKCBrMVZlY3Rvci54ICsgMiAqIGsyVmVjdG9yLnggKyAyICogazNWZWN0b3IueCArIGs0VmVjdG9yLnggKSAvIDYsXHJcbiAgICAgICAgeTogZGVsdGFEaXN0YW5jZSAqICggazFWZWN0b3IueSArIDIgKiBrMlZlY3Rvci55ICsgMiAqIGszVmVjdG9yLnkgKyBrNFZlY3Rvci55ICkgLyA2XHJcbiAgICAgIH07XHJcbiAgICByZXR1cm4gcG9zaXRpb24ucGx1cyggZGVsdGFEaXNwbGFjZW1lbnQgKTsgLy8ge1ZlY3RvcjJ9IGZpbmFsUG9zaXRpb25cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYW4gYXJyYXkgb2YgcG9pbnRzIHtWZWN0b3IyfSB3aXRoIHRoZSBzYW1lIGVsZWN0cmljIHBvdGVudGlhbCBhcyB0aGUgZWxlY3RyaWMgcG90ZW50aWFsXHJcbiAgICogYXQgdGhlIGluaXRpYWwgcG9zaXRpb24uIFRoZSBhcnJheSBpcyBvcmRlcmVkIHdpdGggcG9zaXRpb24gcG9pbnRzIGdvaW5nIGNvdW50ZXJjbG9ja3dpc2UuXHJcbiAgICpcclxuICAgKiBUaGlzIGZ1bmN0aW9uIGhhcyBzaWRlIGVmZmVjdHMgYW5kIHVwZGF0ZXMgdGhpcy5pc0VxdWlwb3RlbnRpYWxMaW5lVGVybWluYXRpbmdJbnNpZGVCb3VuZHMgYW5kXHJcbiAgICogdGhpcy5pc0xpbmVDbG9zZWQuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gLSBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge0FycmF5LjxWZWN0b3IyPn0gYSBzZXJpZXMgb2YgcG9zaXRpb25zIHdpdGggdGhlIHNhbWUgZWxlY3RyaWMgUG90ZW50aWFsIGFzIHRoZSBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICovXHJcbiAgZ2V0RXF1aXBvdGVudGlhbFBvc2l0aW9uQXJyYXkoIHBvc2l0aW9uICkge1xyXG5cclxuICAgIGlmICggdGhpcy5tb2RlbC5hY3RpdmVDaGFyZ2VkUGFydGljbGVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBHZW5lcmFsIElkZWEgb2YgdGhpcyBhbGdvcml0aG1cclxuICAgICAqXHJcbiAgICAgKiBUaGUgZWxlY3RyaWNQb3RlbnRpYWwgbGluZSBpcyBmb3VuZCB1c2luZyB0d28gc2VhcmNoZXMuIFN0YXJ0aW5nIGZyb20gYW4gaW5pdGlhbCBwb2ludCwgd2UgZmluZCB0aGUgZWxlY3RyaWNcclxuICAgICAqIGZpZWxkIGF0IHRoaXMgcG9zaXRpb24gYW5kIGRlZmluZSB0aGUgcG9pbnQgdG8gdGhlIGxlZnQgb2YgdGhlIGVsZWN0cmljIGZpZWxkIGFzIHRoZSBjb3VudGVyY2xvY2t3aXNlIHBvaW50LFxyXG4gICAgICogd2hlcmVhcyB0aGUgcG9pbnQgdGhhdCBpcyA5MCBkZWdyZWUgcmlnaHQgb2YgdGhlIGVsZWN0cmljIGZpZWxkIGlzIHRoZSBjbG9ja3dpc2UgcG9pbnQuIFRoZSBwb2ludHMgYXJlIHN0b3JlZFxyXG4gICAgICogaW4gYSBjb3VudGVyY2xvY2t3aXNlIGFuZCBjbG9ja3dpc2UgYXJyYXkuIFRoZSBzZWFyY2ggb2YgdGhlIGNsb2Nrd2lzZSBhbmQgY291bnRlcmNsb2Nrd2lzZSBwb2ludHMgZG9uZVxyXG4gICAgICogY29uY3VycmVudGx5LiBUaGUgc2VhcmNoIHN0b3BzIGlmICgxKSB0aGUgbnVtYmVyIG9mIHNlYXJjaGluZyBzdGVwcyBleGNlZWRzIGEgbGFyZ2UgbnVtYmVyIGFuZCAoMikgZWl0aGVyIHRoZVxyXG4gICAgICogY2xvY2t3aXNlIG9yIGNvdW50ZXJDbG9ja3dpc2UgcG9pbnQgaXMgdmVyeSBmYXIgYXdheSBmcm9tIHRoZSBvcmlnaW4uIEEgdGhpcmQgY29uZGl0aW9uIHRvIGJhaWxvdXQgb2YgdGhlXHJcbiAgICAgKiBzZWFyY2ggaXMgdGhhdCB0aGUgY2xvY2t3aXNlIGFuZCBjb3VudGVyQ2xvY2t3aXNlIHBvc2l0aW9uIGFyZSB2ZXJ5IGNsb3NlIHRvIG9uZSBhbm90aGVyIGluIHdoaWNoIGNhc2Ugd2UgaGF2ZVxyXG4gICAgICogYSBjbG9zZWQgZWxlY3RyaWNQb3RlbnRpYWwgbGluZS4gTm90ZSB0aGF0IGlmIHRoZSBjb25kaXRpb25zICgxKSBhbmQgKDIpIGFyZSBmdWxmaWxsZWQgdGhlIGVsZWN0cmljUG90ZW50aWFsXHJcbiAgICAgKiBsaW5lIGlzIG5vdCBnb2luZyB0byBiZSBhIGNsb3NlZCBsaW5lIGJ1dCB0aGlzIGlzIHNvIGZhciBhd2F5IGZyb20gdGhlIHNjcmVlbnZpZXcgdGhhdCB0aGUgZW5kIHVzZXIgd2lsbCBzaW1wbHlcclxuICAgICAqIHNlZSB0aGUgbGluZSBnb2luZyBiZXlvbmQgdGhlIHNjcmVlbi5cclxuICAgICAqXHJcbiAgICAgKiBBZnRlciB0aGUgc2VhcmNoIGlzIGRvbmUsIHRoZSBmdW5jdGlvbiByZXR1cm5zIGFuIGFycmF5IG9mIHBvaW50cyBvcmRlcmVkIGluIGEgY291bnRlcmNsb2Nrd2lzZSBkaXJlY3Rpb24sXHJcbiAgICAgKiBpLmUuIGFmdGVyIGpvaW5pbmcgYWxsIHRoZSBwb2ludHMsIHRoZSBkaXJlY3RlZCBsaW5lIHdvdWxkIGJlIG1hZGUgb2YgcG9pbnRzIHRoYXQgaGF2ZSBhbiBlbGVjdHJpYyBmaWVsZFxyXG4gICAgICogcG9pbnRpbmcgY2xvY2t3aXNlICh5ZXMgIGNsb2Nrd2lzZSkgdG8gdGhlIGRpcmVjdGlvbiBvZiB0aGUgbGluZS5cclxuICAgICAqL1xyXG4gICAgbGV0IHN0ZXBDb3VudGVyID0gMDsgLy8ge251bWJlcn0gaW50ZWdlclxyXG5cclxuICAgIGxldCBuZXh0Q2xvY2t3aXNlUG9zaXRpb247IC8vIHtWZWN0b3IyfVxyXG4gICAgbGV0IG5leHRDb3VudGVyQ2xvY2t3aXNlUG9zaXRpb247IC8vIHtWZWN0b3IyfVxyXG4gICAgbGV0IGN1cnJlbnRDbG9ja3dpc2VQb3NpdGlvbiA9IHBvc2l0aW9uOyAvLyB7VmVjdG9yMn1cclxuICAgIGxldCBjdXJyZW50Q291bnRlckNsb2Nrd2lzZVBvc2l0aW9uID0gcG9zaXRpb247IC8vIHtWZWN0b3IyfVxyXG4gICAgY29uc3QgY2xvY2t3aXNlUG9zaXRpb25BcnJheSA9IFtdO1xyXG4gICAgY29uc3QgY291bnRlckNsb2Nrd2lzZVBvc2l0aW9uQXJyYXkgPSBbXTtcclxuXHJcbiAgICAvLyBpbml0aWFsIGVwc2lsb24gZGlzdGFuY2UgZm9yIHRoZSB0d28gaGVhZHMuXHJcbiAgICBsZXQgY2xvY2t3aXNlRXBzaWxvbkRpc3RhbmNlID0gTUlOX0VQU0lMT05fRElTVEFOQ0U7XHJcbiAgICBsZXQgY291bnRlckNsb2Nrd2lzZUVwc2lsb25EaXN0YW5jZSA9IC1jbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2U7XHJcblxyXG4gICAgd2hpbGUgKCAoIHN0ZXBDb3VudGVyIDwgTUFYX1NURVBTICkgJiYgIXRoaXMuaXNMaW5lQ2xvc2VkICYmXHJcbiAgICAgICAgICAgICggdGhpcy5pc0VxdWlwb3RlbnRpYWxMaW5lVGVybWluYXRpbmdJbnNpZGVCb3VuZHMgfHwgKCBzdGVwQ291bnRlciA8IE1JTl9TVEVQUyApICkgKSB7XHJcblxyXG4gICAgICBuZXh0Q2xvY2t3aXNlUG9zaXRpb24gPSB0aGlzLmdldE5leHRQb3NpdGlvbkFsb25nRXF1aXBvdGVudGlhbFdpdGhFbGVjdHJpY1BvdGVudGlhbChcclxuICAgICAgICBjdXJyZW50Q2xvY2t3aXNlUG9zaXRpb24sXHJcbiAgICAgICAgdGhpcy5lbGVjdHJpY1BvdGVudGlhbCxcclxuICAgICAgICBjbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgKTtcclxuICAgICAgbmV4dENvdW50ZXJDbG9ja3dpc2VQb3NpdGlvbiA9IHRoaXMuZ2V0TmV4dFBvc2l0aW9uQWxvbmdFcXVpcG90ZW50aWFsV2l0aEVsZWN0cmljUG90ZW50aWFsKFxyXG4gICAgICAgIGN1cnJlbnRDb3VudGVyQ2xvY2t3aXNlUG9zaXRpb24sXHJcbiAgICAgICAgdGhpcy5lbGVjdHJpY1BvdGVudGlhbCxcclxuICAgICAgICBjb3VudGVyQ2xvY2t3aXNlRXBzaWxvbkRpc3RhbmNlICk7XHJcblxyXG4gICAgICBjbG9ja3dpc2VQb3NpdGlvbkFycmF5LnB1c2goIG5leHRDbG9ja3dpc2VQb3NpdGlvbiApO1xyXG4gICAgICBjb3VudGVyQ2xvY2t3aXNlUG9zaXRpb25BcnJheS5wdXNoKCBuZXh0Q291bnRlckNsb2Nrd2lzZVBvc2l0aW9uICk7XHJcblxyXG4gICAgICBjdXJyZW50Q2xvY2t3aXNlUG9zaXRpb24gPSBuZXh0Q2xvY2t3aXNlUG9zaXRpb247XHJcbiAgICAgIGN1cnJlbnRDb3VudGVyQ2xvY2t3aXNlUG9zaXRpb24gPSBuZXh0Q291bnRlckNsb2Nrd2lzZVBvc2l0aW9uO1xyXG5cclxuICAgICAgc3RlcENvdW50ZXIrKztcclxuXHJcbiAgICAgIC8vIGFmdGVyIHRocmVlIHN0ZXBzLCB0aGUgZXBzaWxvbiBkaXN0YW5jZSBpcyBhZGFwdGF0aXZlLCBpLmUuIGxhcmdlIGRpc3RhbmNlIHdoZW4gJ2Vhc3knLCBzbWFsbCB3aGVuICdkaWZmaWN1bHQnXHJcbiAgICAgIGlmICggc3RlcENvdW50ZXIgPiAzICkge1xyXG5cclxuICAgICAgICAvLyBhZGFwdGF0aXZlIGVwc2lsb24gZGlzdGFuY2VcclxuICAgICAgICBjbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgPSB0aGlzLmdldEFkYXB0YXRpdmVFcHNpbG9uRGlzdGFuY2UoIGNsb2Nrd2lzZUVwc2lsb25EaXN0YW5jZSwgY2xvY2t3aXNlUG9zaXRpb25BcnJheSwgdHJ1ZSApO1xyXG4gICAgICAgIGNvdW50ZXJDbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgPSB0aGlzLmdldEFkYXB0YXRpdmVFcHNpbG9uRGlzdGFuY2UoIGNvdW50ZXJDbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UsIGNvdW50ZXJDbG9ja3dpc2VQb3NpdGlvbkFycmF5LCBmYWxzZSApO1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgPiAwICk7IC8vIHNhbml0eSBjaGVja1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvdW50ZXJDbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgPCAwICk7XHJcblxyXG4gICAgICAgIC8vIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBzZWFyY2hpbmcgaGVhZHNcclxuICAgICAgICBjb25zdCBhcHByb2FjaERpc3RhbmNlID0gY3VycmVudENsb2Nrd2lzZVBvc2l0aW9uLmRpc3RhbmNlKCBjdXJyZW50Q291bnRlckNsb2Nrd2lzZVBvc2l0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIGxvZ2ljIHRvIHN0b3AgdGhlIHdoaWxlIGxvb3Agd2hlbiB0aGUgdHdvIGhlYWRzIGFyZSBnZXR0aW5nIGNsb3NlclxyXG4gICAgICAgIGlmICggYXBwcm9hY2hEaXN0YW5jZSA8IGNsb2Nrd2lzZUVwc2lsb25EaXN0YW5jZSArIE1hdGguYWJzKCBjb3VudGVyQ2xvY2t3aXNlRXBzaWxvbkRpc3RhbmNlICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gd2Ugd2FudCB0byBwZXJmb3JtIG1vcmUgc3RlcHMgYXMgdGhlIHR3byBoZWFkIGdldCBjbG9zZXIgYnV0IHdlIHdhbnQgdG8gYXZvaWQgdGhlIHR3byBoZWFkcyB0byBwYXNzXHJcbiAgICAgICAgICAvLyBvbmUgYW5vdGhlci4gTGV0J3MgcmVkdWNlIHRoZSBlcHNpbG9uIGRpc3RhbmNlXHJcbiAgICAgICAgICBjbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgPSBhcHByb2FjaERpc3RhbmNlIC8gMztcclxuICAgICAgICAgIGNvdW50ZXJDbG9ja3dpc2VFcHNpbG9uRGlzdGFuY2UgPSAtY2xvY2t3aXNlRXBzaWxvbkRpc3RhbmNlO1xyXG4gICAgICAgICAgaWYgKCBhcHByb2FjaERpc3RhbmNlIDwgMiAqIE1JTl9FUFNJTE9OX0RJU1RBTkNFICkge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlIGNsb2Nrd2lzZSBhbmQgY291bnRlcmNsb2Nrd2lzZSBwb2ludHMgYXJlIGNsb3NlIHRvIG9uZSBhbm90aGVyLCBzZXQgdGhpcy5pc0xpbmVDbG9zZWQgdG8gdHJ1ZSB0byBnZXQgb3V0IG9mIHRoaXMgd2hpbGUgbG9vcFxyXG4gICAgICAgICAgICB0aGlzLmlzTGluZUNsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IC8vIGVuZCBvZiBpZiAoc3RlcENvdW50ZXI+MylcclxuXHJcbiAgICAgIC8vIGlzIGF0IGxlYXN0IG9uZSBjdXJyZW50IGhlYWQgaW5zaWRlIHRoZSBib3VuZHM/XHJcbiAgICAgIHRoaXMuaXNFcXVpcG90ZW50aWFsTGluZVRlcm1pbmF0aW5nSW5zaWRlQm91bmRzID1cclxuICAgICAgICAoIHRoaXMubW9kZWwuZW5sYXJnZWRCb3VuZHMuY29udGFpbnNQb2ludCggY3VycmVudENsb2Nrd2lzZVBvc2l0aW9uICkgfHwgdGhpcy5tb2RlbC5lbmxhcmdlZEJvdW5kcy5jb250YWluc1BvaW50KCBjdXJyZW50Q291bnRlckNsb2Nrd2lzZVBvc2l0aW9uICkgKTtcclxuXHJcbiAgICB9IC8vIGVuZCBvZiB3aGlsZSgpXHJcblxyXG4gICAgaWYgKCAhdGhpcy5pc0xpbmVDbG9zZWQgJiYgdGhpcy5pc0VxdWlwb3RlbnRpYWxMaW5lVGVybWluYXRpbmdJbnNpZGVCb3VuZHMgKSB7XHJcblxyXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoYXJnZXMtYW5kLWZpZWxkcy9pc3N1ZXMvMVxyXG4gICAgICAvLyB0aGlzIGlzIHZlcnkgZGlmZmljdWx0IHRvIGNvbWUgdXAgd2l0aCBzdWNoIGEgc2NlbmFyaW8uIHNvIGZhciB0aGlzXHJcbiAgICAgIC8vIHdhcyBlbmNvdW50ZXJlZCBvbmx5IHdpdGggYSBwdXJlIHF1YWRydXBvbGUgY29uZmlndXJhdGlvbi5cclxuICAgICAgLy8gbGV0J3MgcmVkbyB0aGUgZW50aXJlIHByb2Nlc3MgYnV0IHN0YXJ0aW5nIGEgdGFkIHRvIHRoZSByaWdodCBzbyB3ZSBkb24ndCBnZXQgc3R1Y2sgaW4gb3VyIHNlYXJjaFxyXG4gICAgICBjb25zdCB3ZWVWZWN0b3IgPSBuZXcgVmVjdG9yMiggMC4wMDAzMTQxNSwgMC4wMDAyNzE3OCApOyAvLyAocGksIGUpXHJcbiAgICAgIHJldHVybiB0aGlzLmdldEVxdWlwb3RlbnRpYWxQb3NpdGlvbkFycmF5KCBwb3NpdGlvbi5wbHVzKCB3ZWVWZWN0b3IgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxldCdzIG9yZGVyIGFsbCB0aGUgcG9zaXRpb25zIChpbmNsdWRpbmcgdGhlIGluaXRpYWwgcG9pbnQpIGluIGFuIGFycmF5IGluIGEgY291bnRlcmNsb2Nrd2lzZSBmYXNoaW9uXHJcbiAgICBjb25zdCByZXZlcnNlZEFycmF5ID0gY2xvY2t3aXNlUG9zaXRpb25BcnJheS5yZXZlcnNlKCk7XHJcblxyXG4gICAgLy8gbGV0J3MgcmV0dXJuIHRoZSBlbnRpcmUgYXJyYXksIGkuZS4gdGhlIHJldmVyc2VkIGNsb2Nrd2lzZSBhcnJheSwgdGhlIGluaXRpYWwgcG9zaXRpb24sIGFuZCB0aGUgY291bnRlcmNsb2Nrd2lzZSBhcnJheVxyXG4gICAgcmV0dXJuIHJldmVyc2VkQXJyYXkuY29uY2F0KCBwb3NpdGlvbiwgY291bnRlckNsb2Nrd2lzZVBvc2l0aW9uQXJyYXkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcHJ1bmVzIHBvaW50cyBmcm9tIGEgcG9zaXRpb25BcnJheS4gVGhlIGdvYWwgb2YgdGhpcyBtZXRob2QgaXMgdG9cclxuICAgKiBzcGVlZCB1cCB0aGUgbGF5aW5nIG91dCB0aGUgbGluZSBieSBwYXNzaW5nIHRvIHNjZW5lcnkgdGhlIG1pbmltYWwgbnVtYmVyIG9mIHBvaW50c1xyXG4gICAqIGluIHRoZSBwb3NpdGlvbiBhcnJheSB3aGlsZSBiZWluZyB2aXN1YWxseSBlcXVpdmFsZW50LlxyXG4gICAqIEZvciBpbnN0YW5jZSB0aGlzIG1ldGhvZCB3b3VsZCByZW1vdmUgdGhlIG1pZGRsZSBwb2ludCBvZiB0aHJlZSBjb25zZWN1dGl2ZSBjb2xsaW5lYXIgcG9pbnRzLlxyXG4gICAqIE1vcmUgZ2VuZXJhbGx5LCBpZiB0aGUgbWlkZGxlIHBvaW50IGlzIGEgZGlzdGFuY2UgbGVzcyB0aGFuIG1heE9mZnNldCBvZiB0aGUgbGluZSBjb25uZWN0aW5nIHRoZSB0d29cclxuICAgKiBuZWlnaGJvcmluZyBwb2ludHMsIHRoZW4gaXQgaXMgcmVtb3ZlZC5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IHBvc2l0aW9uQXJyYXlcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFZlY3RvcjI+fVxyXG4gICAqL1xyXG4gIGdldFBydW5lZFBvc2l0aW9uQXJyYXkoIHBvc2l0aW9uQXJyYXkgKSB7XHJcbiAgICBjb25zdCBsZW5ndGggPSBwb3NpdGlvbkFycmF5Lmxlbmd0aDtcclxuICAgIGNvbnN0IHBydW5lZFBvc2l0aW9uQXJyYXkgPSBbXTsgLy8ge0FycmF5LjxWZWN0b3IyPn1cclxuXHJcbiAgICBpZiAoIGxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHB1c2ggZmlyc3QgZGF0YSBwb2ludFxyXG4gICAgcHJ1bmVkUG9zaXRpb25BcnJheS5wdXNoKCBwb3NpdGlvbkFycmF5WyAwIF0gKTtcclxuXHJcbiAgICBjb25zdCBtYXhPZmZzZXQgPSAwLjAwMTsgLy8gaW4gbW9kZWwgY29vcmRpbmF0ZXMsIHRoZSB0aHJlc2hvbGQgb2YgdmlzdWFsIGFjdWl0eSB3aGVuIHJlbmRlcmVkIG9uIHRoZSBzY3JlZW5cclxuICAgIGxldCBsYXN0UHVzaGVkSW5kZXggPSAwOyAvLyBpbmRleCBvZiB0aGUgbGFzdCBwb3NpdGlvbkFycmF5IGVsZW1lbnQgcHVzaGVkIGludG8gcHJ1bmVkUG9zaXRpb25cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBsZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGxhc3RQdXNoZWRQb2ludCA9IHBydW5lZFBvc2l0aW9uQXJyYXlbIHBydW5lZFBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMSBdO1xyXG5cclxuICAgICAgZm9yICggbGV0IGogPSBsYXN0UHVzaGVkSW5kZXg7IGogPCBpICsgMTsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZUZyb21MaW5lKCBsYXN0UHVzaGVkUG9pbnQsIHBvc2l0aW9uQXJyYXlbIGogKyAxIF0sIHBvc2l0aW9uQXJyYXlbIGkgKyAxIF0gKTtcclxuICAgICAgICBpZiAoIGRpc3RhbmNlID4gbWF4T2Zmc2V0ICkge1xyXG4gICAgICAgICAgcHJ1bmVkUG9zaXRpb25BcnJheS5wdXNoKCBwb3NpdGlvbkFycmF5WyBpIF0gKTtcclxuICAgICAgICAgIGxhc3RQdXNoZWRJbmRleCA9IGk7XHJcbiAgICAgICAgICBicmVhazsgLy8gYnJlYWtzIG91dCBvZiB0aGUgaW5uZXIgZm9yIGxvb3BcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwdXNoIGxhc3QgZGF0YSBwb2ludFxyXG4gICAgcHJ1bmVkUG9zaXRpb25BcnJheS5wdXNoKCBwb3NpdGlvbkFycmF5WyBsZW5ndGggLSAxIF0gKTtcclxuICAgIHJldHVybiBwcnVuZWRQb3NpdGlvbkFycmF5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBzbWFsbGVzdCBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBtaWR3YXlQb2ludCBhbmRcclxuICAgKiBhIHN0cmFpZ2h0IGxpbmUgdGhhdCB3b3VsZCBjb25uZWN0IGluaXRpYWxQb2ludCBhbmQgZmluYWxQb2ludC5cclxuICAgKiBzZWUgaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9Qb2ludC1MaW5lRGlzdGFuY2UyLURpbWVuc2lvbmFsLmh0bWxcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbFBvaW50XHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBtaWR3YXlQb2ludFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gZmluYWxQb2ludFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0RGlzdGFuY2VGcm9tTGluZSggaW5pdGlhbFBvaW50LCBtaWR3YXlQb2ludCwgZmluYWxQb2ludCApIHtcclxuICAgIGNvbnN0IG1pZHdheURpc3BsYWNlbWVudCA9IG1pZHdheVBvaW50Lm1pbnVzKCBpbml0aWFsUG9pbnQgKTtcclxuICAgIGNvbnN0IGZpbmFsRGlzcGxhY2VtZW50ID0gZmluYWxQb2ludC5taW51cyggaW5pdGlhbFBvaW50ICk7XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIG1pZHdheURpc3BsYWNlbWVudC5jcm9zc1NjYWxhciggZmluYWxEaXNwbGFjZW1lbnQubm9ybWFsaXplZCgpICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYW4gdXBkYXRlZCBlcHNpbG9uRGlzdGFuY2UgYmFzZWQgb24gdGhlIHRocmVlIGxhc3QgcG9pbnRzXHJcbiAgICogb2YgcG9zaXRpb25BcnJheVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb25EaXN0YW5jZVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSBwb3NpdGlvbkFycmF5XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0Nsb2Nrd2lzZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0QWRhcHRhdGl2ZUVwc2lsb25EaXN0YW5jZSggZXBzaWxvbkRpc3RhbmNlLCBwb3NpdGlvbkFycmF5LCBpc0Nsb2Nrd2lzZSApIHtcclxuICAgIGNvbnN0IGRlZmxlY3Rpb25BbmdsZSA9IHRoaXMuZ2V0Um90YXRpb25BbmdsZSggcG9zaXRpb25BcnJheSApOyAvLyBub24gbmVnYXRpdmUgbnVtYmVyIGluIHJhZGlhbnNcclxuICAgIGlmICggZGVmbGVjdGlvbkFuZ2xlID09PSAwICkge1xyXG5cclxuICAgICAgLy8gcGVkYWwgdG8gbWV0YWxcclxuICAgICAgZXBzaWxvbkRpc3RhbmNlID0gTUFYX0VQU0lMT05fRElTVEFOQ0U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHNob3J0ZW4gdGhlIGVwc2lsb24gZGlzdGFuY2UgaW4gdGlnaHQgdHVybnMsIGxvbmdlciBzdGVwcyBpbiBzdHJhaWdodGVyIHN0cmV0Y2hcclxuICAgICAgLy8gMzYwIGltcGxpZXMgdGhhdCBhIHBlcmZlY3QgY2lyY2xlIGNvdWxkIGJlIGdlbmVyYXRlZCBieSAzNjAgcG9pbnRzLCBpLmUuIGEgcm90YXRpb24gb2YgMSBkZWdyZWUgZG9lc24ndCBjaGFuZ2UgZXBzaWxvbkRpc3RhbmNlLlxyXG4gICAgICBlcHNpbG9uRGlzdGFuY2UgKj0gKCAyICogTWF0aC5QSSAvIDM2MCApIC8gZGVmbGVjdGlvbkFuZ2xlO1xyXG4gICAgfVxyXG4gICAgLy8gY2xhbXAgdGhlIHZhbHVlIG9mIGVwc2lsb25EaXN0YW5jZSB0byBiZSB3aXRoaW4gdGhpcyByYW5nZVxyXG4gICAgZXBzaWxvbkRpc3RhbmNlID0gZG90LmNsYW1wKCBNYXRoLmFicyggZXBzaWxvbkRpc3RhbmNlICksIE1JTl9FUFNJTE9OX0RJU1RBTkNFLCBNQVhfRVBTSUxPTl9ESVNUQU5DRSApO1xyXG4gICAgZXBzaWxvbkRpc3RhbmNlID0gaXNDbG9ja3dpc2UgPyBlcHNpbG9uRGlzdGFuY2UgOiAtZXBzaWxvbkRpc3RhbmNlO1xyXG4gICAgcmV0dXJuIGVwc2lsb25EaXN0YW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgcm90YXRpb24gYW5nbGUgYmV0d2VlbiB0aGUgdGhyZWUgbGFzdCBwb2ludHMgb2YgYSBwb3NpdGlvbiBhcnJheVxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gcG9zaXRpb25BcnJheVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0Um90YXRpb25BbmdsZSggcG9zaXRpb25BcnJheSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvc2l0aW9uQXJyYXkubGVuZ3RoID4gMiwgJ3RoZSBwb3NpdGlvbkFycmF5IG11c3QgY29udGFpbiBhdCBsZWFzdCB0aHJlZSBlbGVtZW50cycgKTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHBvc2l0aW9uQXJyYXkubGVuZ3RoO1xyXG4gICAgY29uc3QgbmV3RGVsdGFQb3NpdGlvbiA9IHBvc2l0aW9uQXJyYXlbIGxlbmd0aCAtIDEgXS5taW51cyggcG9zaXRpb25BcnJheVsgbGVuZ3RoIC0gMiBdICk7XHJcbiAgICBjb25zdCBvbGREZWx0YVBvc2l0aW9uID0gcG9zaXRpb25BcnJheVsgbGVuZ3RoIC0gMiBdLm1pbnVzKCBwb3NpdGlvbkFycmF5WyBsZW5ndGggLSAzIF0gKTtcclxuICAgIHJldHVybiBuZXdEZWx0YVBvc2l0aW9uLmFuZ2xlQmV0d2Vlbiggb2xkRGVsdGFQb3NpdGlvbiApOyAvLyBhIHBvc2l0aXZlIG51bWJlclxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgU2hhcGUgb2YgdGhlIGVsZWN0cmljIHBvdGVudGlhbCBsaW5lXHJcbiAgICogQHB1YmxpYyByZWFkLW9ubHlcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgZ2V0U2hhcGUoKSB7XHJcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMubGVuZ3RoUHJvcGVydHkudmFsdWUgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBzaGFwZTsgLy8gdG8gc3VwcG9ydCBtdXRhYmxlIHBvdGVudGlhbCBsaW5lcyBhbmQgUGhFVC1pTyBzdGF0ZVxyXG4gICAgfVxyXG4gICAgY29uc3QgcHJ1bmVkUG9zaXRpb25BcnJheSA9IHRoaXMuZ2V0UHJ1bmVkUG9zaXRpb25BcnJheSggdGhpcy5wb3NpdGlvbkFycmF5ICk7XHJcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbkFycmF5VG9TdHJhaWdodExpbmUoIHNoYXBlLCBwcnVuZWRQb3NpdGlvbkFycmF5LCB7IGlzQ2xvc2VkTGluZVNlZ21lbnRzOiB0aGlzLmlzTGluZUNsb3NlZCB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gYXBwZW5kZWQgc2hhcGUgd2l0aCBsaW5lcyBiZXR3ZWVuIHBvaW50cy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXHJcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IHBvc2l0aW9uQXJyYXlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIHBvc2l0aW9uQXJyYXlUb1N0cmFpZ2h0TGluZSggc2hhcGUsIHBvc2l0aW9uQXJyYXksIG9wdGlvbnMgKSB7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8gaXMgdGhlIHJlc3VsdGluZyBzaGFwZSBmb3JtaW5nIGEgY2xvc2UgcGF0aFxyXG4gICAgICBpc0Nsb3NlZExpbmVTZWdtZW50czogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgbGluZSBpcyBvcGVuLCB0aGVyZSBpcyBvbmUgbGVzcyBzZWdtZW50cyB0aGFuIHBvaW50IHZlY3RvcnNcclxuICAgIGNvbnN0IHNlZ21lbnRzTnVtYmVyID0gKCBvcHRpb25zLmlzQ2xvc2VkTGluZVNlZ21lbnRzICkgPyBwb3NpdGlvbkFycmF5Lmxlbmd0aCA6IHBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcclxuXHJcbiAgICBzaGFwZS5tb3ZlVG9Qb2ludCggcG9zaXRpb25BcnJheVsgMCBdICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBzZWdtZW50c051bWJlciArIDE7IGkrKyApIHtcclxuICAgICAgc2hhcGUubGluZVRvUG9pbnQoIHBvc2l0aW9uQXJyYXlbICggaSApICUgcG9zaXRpb25BcnJheS5sZW5ndGggXSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNoYXBlO1xyXG4gIH1cclxufVxyXG5cclxuRWxlY3RyaWNQb3RlbnRpYWxMaW5lLkVsZWN0cmljUG90ZW50aWFsTGluZUlPID0gbmV3IElPVHlwZSggJ0VsZWN0cmljUG90ZW50aWFsTGluZUlPJywge1xyXG4gIHZhbHVlVHlwZTogRWxlY3RyaWNQb3RlbnRpYWxMaW5lLFxyXG4gIGRvY3VtZW50YXRpb246ICdUaGUgdmVjdG9yIHRoYXQgc2hvd3MgdGhlIGNoYXJnZSBzdHJlbmd0aCBhbmQgZGlyZWN0aW9uLicsXHJcbiAgdG9TdGF0ZU9iamVjdDogZWxlY3RyaWNQb3RlbnRpYWxMaW5lID0+ICgge1xyXG4gICAgcG9zaXRpb246IFZlY3RvcjIuVmVjdG9yMklPLnRvU3RhdGVPYmplY3QoIGVsZWN0cmljUG90ZW50aWFsTGluZS5wb3NpdGlvbiApXHJcbiAgfSApLFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICBwb3NpdGlvbjogVmVjdG9yMi5WZWN0b3IySU9cclxuICB9LFxyXG4gIHN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzOiBzdGF0ZU9iamVjdCA9PiBbIFZlY3RvcjIuVmVjdG9yMklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QucG9zaXRpb24gKSBdXHJcbn0gKTtcclxuXHJcbmNoYXJnZXNBbmRGaWVsZHMucmVnaXN0ZXIoICdFbGVjdHJpY1BvdGVudGlhbExpbmUnLCBFbGVjdHJpY1BvdGVudGlhbExpbmUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRWxlY3RyaWNQb3RlbnRpYWxMaW5lO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxHQUFHLE1BQU0sMkJBQTJCO0FBQzNDLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsWUFBWSxNQUFNLHVDQUF1QztBQUNoRSxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjs7QUFFeEQ7QUFDQTtBQUNBLE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN4QixNQUFNQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDeEIsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDbkMsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRW5DLE1BQU1DLHFCQUFxQixTQUFTUCxZQUFZLENBQUM7RUFFL0M7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLFFBQVEsRUFBRUMsTUFBTSxFQUFHO0lBRXJDLEtBQUssQ0FBRTtNQUNMQSxNQUFNLEVBQUVBLE1BQU07TUFDZEMsVUFBVSxFQUFFTCxxQkFBcUIsQ0FBQ00s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