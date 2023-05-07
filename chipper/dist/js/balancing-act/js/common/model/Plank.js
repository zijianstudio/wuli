// Copyright 2013-2022, University of Colorado Boulder

/**
 * This is the model for the plank upon which masses can be placed.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import balancingAct from '../../balancingAct.js';
import BASharedConstants from '../BASharedConstants.js';
import ColumnState from './ColumnState.js';
import MassForceVector from './MassForceVector.js';

// constants
const PLANK_LENGTH = 4.5; // meters
const PLANK_THICKNESS = 0.05; // meters
const PLANK_MASS = 75; // kg
const INTER_SNAP_TO_MARKER_DISTANCE = 0.25; // meters
const NUM_SNAP_TO_POSITIONS = Math.floor(PLANK_LENGTH / INTER_SNAP_TO_MARKER_DISTANCE - 1);
const MOMENT_OF_INERTIA = PLANK_MASS * (PLANK_LENGTH * PLANK_LENGTH + PLANK_THICKNESS * PLANK_THICKNESS) / 12;
class Plank {
  /**
   * @param position {Vector2} Initial position of the horizontal center, vertical bottom
   * @param pivotPoint {Vector2} Point around which the plank will pivot
   * @param columnState {Property} Property that indicates current state of support columns.
   * @param userControlledMasses {Array} Masses being controlled by the user, used to update active drop positions.
   * @param {Tandem} tandem
   */
  constructor(position, pivotPoint, columnState, userControlledMasses, tandem) {
    this.userControlledMasses = userControlledMasses;

    // @public (read-only)
    this.tiltAngleProperty = new NumberProperty(0, {
      phetioDocumentation: 'Angle of the plank with respect to the ground.  A value of 0 indicates a level plank, ' + 'positive is tilted left, negative to the right.',
      units: 'radians',
      tandem: tandem.createTandem('tiltAngleProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true
    });

    // @public (read-only) - Point where the bottom center of the plank is currently positioned. If the plank is sitting
    // on top of the fulcrum, this point will be the same as the pivot point.  When the pivot point is above the plank,
    // as is generally done in this simulation in order to make the plank rebalance if nothing is on it, this position
    // will be different.
    this.bottomCenterPositionProperty = new Property(position);

    // @public (read-only) - Externally visible observable lists.
    this.massesOnSurface = createObservableArray();
    this.forceVectors = createObservableArray();
    this.activeDropPositions = createObservableArray(); // Positions where user-controlled masses would land if dropped, in meters from center.

    // @public (read-only) {Vector2} Other external visible attributes.
    this.pivotPoint = pivotPoint;

    // @public (read-only) - Map of masses to distance from the plank's center.
    this.massDistancePairs = [];

    // @private - signify in the data stream when masses are placed and removed
    this.massDroppedOnPlankEmitter = new Emitter({
      tandem: tandem.createTandem('massDroppedOnPlankEmitter'),
      parameters: [{
        name: 'phetioID',
        phetioType: StringIO
      }, {
        name: 'mass',
        phetioType: NumberIO
      }, {
        name: 'distance',
        phetioType: NumberIO
      }, {
        name: 'fullState',
        phetioType: Plank.PlankIO
      }]
    });

    // @private - signify in the data stream when masses are placed and removed
    this.massRemovedFromPlankEmitter = new Emitter({
      tandem: tandem.createTandem('massRemovedFromPlankEmitter'),
      parameters: [{
        name: 'phetioID',
        phetioType: StringIO
      }, {
        name: 'mass',
        phetioType: NumberIO
      }, {
        name: 'distance',
        phetioType: NumberIO
      }, {
        name: 'fullState',
        phetioType: Plank.PlankIO
      }]
    });

    // Variables that need to be retained for dynamic behavior, but are not intended to be accessed externally.
    this.columnState = columnState;
    this.angularVelocity = 0;
    this.currentNetTorque = 0;

    // @public (read-only) - Calculate the max angle at which the plank can tilt before hitting the ground.  NOTE: This
    // assumes a small distance between the pivot point and the bottom of the plank.  If this assumption changes, or if
    // the fulcrum becomes movable, the way this is done will need to change.
    this.maxTiltAngle = Math.asin(position.y / (PLANK_LENGTH / 2));

    // Unrotated shape of the plank
    this.unrotatedShape = Shape.rect(position.x - PLANK_LENGTH / 2, position.y, PLANK_LENGTH, PLANK_THICKNESS);

    // Listen to the support column property.  The plank goes to the level position whenever there are two columns
    // present, and into a tilted position when only one is present.
    columnState.link(newColumnState => {
      if (newColumnState === ColumnState.SINGLE_COLUMN) {
        this.forceToMaxAndStill();
      } else if (newColumnState === ColumnState.DOUBLE_COLUMNS) {
        this.forceToLevelAndStill();
      }
    });

    // Listen for when masses are added to the plank and add a listener that removes that mass if the user picks is up.
    this.massesOnSurface.addItemAddedListener(addedMass => {
      // Add a listener that will remove this mass from the surface when the user picks it up.
      const userControlledListener = userControlled => {
        if (userControlled) {
          this.removeMassFromSurface(addedMass);
        }
      };
      addedMass.userControlledProperty.link(userControlledListener);

      // Remove the listener when the mass is removed.
      const self = this;
      this.massesOnSurface.addItemRemovedListener(function massRemovalListener(removedMass) {
        if (removedMass === addedMass) {
          removedMass.userControlledProperty.unlink(userControlledListener);
          self.massesOnSurface.removeItemRemovedListener(massRemovalListener);
        }
      });
    });
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    let angularAcceleration;
    this.updateNetTorque();

    // Update the angular acceleration and velocity.  There is some thresholding here to prevent the plank from
    // oscillating forever with small values, since this can cause odd-looking movements of the planks and masses.  The
    // thresholds were empirically determined.
    angularAcceleration = this.currentNetTorque / MOMENT_OF_INERTIA;
    angularAcceleration = Math.abs(angularAcceleration) > 0.00001 ? angularAcceleration : 0;
    this.angularVelocity += angularAcceleration;
    this.angularVelocity = Math.abs(this.angularVelocity) > 0.00001 ? this.angularVelocity : 0;

    // Update the angle of the plank's tilt based on the angular velocity.
    const previousTiltAngle = this.tiltAngleProperty.get();
    let newTiltAngle = this.tiltAngleProperty.get() + this.angularVelocity * dt;
    if (Math.abs(newTiltAngle) > this.maxTiltAngle) {
      // Limit the angle when one end is touching the ground.
      newTiltAngle = this.maxTiltAngle * (this.tiltAngleProperty.get() < 0 ? -1 : 1);
      this.angularVelocity = 0;
    } else if (Math.abs(newTiltAngle) < 0.0001) {
      // Below a certain threshold just force the tilt angle to be zero so that it appears perfectly level.
      newTiltAngle = 0;
    }
    this.tiltAngleProperty.set(newTiltAngle);

    // Update the shape of the plank and the positions of the masses on the surface, but only if the tilt angle has
    // changed.
    if (this.tiltAngleProperty.get() !== previousTiltAngle) {
      this.updatePlank();
      this.updateMassPositions();
    }

    // Simulate friction by slowing down the rotation a little.
    this.angularVelocity *= 0.91;

    // Update the active drop positions.
    const tempDropPositions = [];
    this.userControlledMasses.forEach(userControlledMass => {
      if (this.isPointAbovePlank(userControlledMass.getMiddlePoint())) {
        const closestOpenPosition = this.getOpenMassDroppedPosition(userControlledMass.positionProperty.get());
        if (closestOpenPosition) {
          const plankSurfaceCenter = this.getPlankSurfaceCenter();
          const distanceFromCenter = closestOpenPosition.distance(plankSurfaceCenter) * (closestOpenPosition.x < 0 ? -1 : 1);
          tempDropPositions.push(distanceFromCenter);
        }
      }
    });
    const copyOfActiveDropPositions = this.activeDropPositions.slice(0);
    // Remove newly inactive drop positions.
    copyOfActiveDropPositions.forEach(activeDropPositions => {
      if (tempDropPositions.indexOf(activeDropPositions) < 0) {
        this.activeDropPositions.remove(activeDropPositions);
      }
    });
    // Add any new active drop positions.
    tempDropPositions.forEach(dropPosition => {
      if (!this.activeDropPositions.includes(dropPosition)) {
        this.activeDropPositions.add(dropPosition);
      }
    });
  }

  /**
   * Add a mass to the surface of the plank, chooses a position below the mass.
   * @param {Mass} mass
   * @returns {boolean}
   * @public
   */
  addMassToSurface(mass) {
    let massAdded = false;
    const closestOpenPosition = this.getOpenMassDroppedPosition(mass.positionProperty.get());
    if (this.isPointAbovePlank(mass.getMiddlePoint()) && closestOpenPosition !== null) {
      mass.positionProperty.set(closestOpenPosition);
      mass.onPlankProperty.set(true);
      const result = {
        mass: mass,
        distance: this.getPlankSurfaceCenter().distance(mass.positionProperty.get()) * (mass.positionProperty.get().x > this.getPlankSurfaceCenter().x ? 1 : -1)
      };
      this.massDistancePairs.push(result);
      this.massDroppedOnPlankEmitter.emit(mass.tandem.phetioID, mass.massValue, result.distance, this);

      // Add the force vector for this mass.
      this.forceVectors.push(new MassForceVector(mass));

      // Final steps.
      this.massesOnSurface.push(mass);
      this.updateMassPositions();
      this.updateNetTorque();
      massAdded = true;
    }
    return massAdded;
  }

  /**
   * Indicates all of the masses that are currently on the plank
   * @returns {Object}
   * @private
   */
  toStateObject() {
    return {
      massDistancePairs: this.massDistancePairs.map(massDistancePair => {
        return {
          name: massDistancePair.mass.tandem.phetioID,
          mass: massDistancePair.mass.massValue,
          distance: massDistancePair.distance
        };
      })
    };
  }

  /**
   * Add a mass to the specified position on the plank.
   * @param {Mass} mass
   * @param {number} distanceFromCenter
   * @public
   */
  addMassToSurfaceAt(mass, distanceFromCenter) {
    if (Math.abs(distanceFromCenter) > PLANK_LENGTH / 2) {
      throw new Error('Warning: Attempt to add mass at invalid distance from center');
    }
    const vectorToPosition = this.getPlankSurfaceCenter().plus(Vector2.createPolar(distanceFromCenter, this.tiltAngleProperty.get()));

    // Set the position of the mass to be just above the plank at the
    // appropriate distance so that it will drop to the correct place.
    mass.positionProperty.set(new Vector2(vectorToPosition.x, vectorToPosition.y + 0.01));
    assert && assert(this.isPointAbovePlank(mass.positionProperty.get())); // Need to fix this if mass isn't above the surface.
    this.addMassToSurface(mass);
  }

  /**
   * @private
   */
  updateMassPositions() {
    this.massesOnSurface.forEach(mass => {
      // Compute the vector from the center of the plank's surface to the bottom of the mass, in meters.
      const vectorFromCenterToMass = new Vector2(this.getMassDistanceFromCenter(mass), 0).rotated(this.tiltAngleProperty.get());

      // Set the position and rotation of the mass.
      mass.rotationAngleProperty.set(this.tiltAngleProperty.get());
      mass.positionProperty.set(this.getPlankSurfaceCenter().plus(vectorFromCenterToMass));
    });

    // Update the force vectors from the masses.  This mostly just moves
    // them to the correct positions.
    this.forceVectors.forEach(forceVectors => {
      forceVectors.update();
    });
  }

  /**
   * @param {Mass} mass
   * @public
   */
  removeMassFromSurface(mass) {
    // Remove the mass.
    this.massesOnSurface.remove(mass);

    // Remove the mass-distance pair for this mass.
    for (let i = 0; i < this.massDistancePairs.length; i++) {
      if (this.massDistancePairs[i].mass === mass) {
        const distance = this.massDistancePairs[i].distance;
        this.massDistancePairs.splice(i, 1);
        this.massRemovedFromPlankEmitter.emit(mass.tandem.phetioID, mass.massValue, distance, this);
        break;
      }
    }

    // Reset the attributes of the mass that may have been affected by being on the plank.
    mass.rotationAngleProperty.set(0);
    mass.onPlankProperty.set(false);

    // Remove the force vector associated with this mass.
    for (let j = 0; j < this.forceVectors.length; j++) {
      if (this.forceVectors.get(j).mass === mass) {
        this.forceVectors.remove(this.forceVectors.get(j));
        break;
      }
    }

    // Update the torque, since the removal of the mass undoubtedly changed it.
    this.updateNetTorque();
  }

  /**
   * @public
   */
  removeAllMasses() {
    const copyOfMassesArray = this.massesOnSurface.slice(0);
    copyOfMassesArray.forEach(mass => {
      this.removeMassFromSurface(mass);
    });
  }

  /**
   * @param {Mass} mass
   * @returns {number}
   * @public
   */
  getMassDistanceFromCenter(mass) {
    for (let i = 0; i < this.massDistancePairs.length; i++) {
      if (this.massDistancePairs[i].mass === mass) {
        return this.massDistancePairs[i].distance;
      }
    }
    return 0;
  }

  /**
   * @private
   */
  updatePlank() {
    if (this.pivotPoint.y < this.unrotatedShape.minY) {
      throw new Error('Pivot point cannot be below the plank.');
    }
    let attachmentBarVector = new Vector2(0, this.unrotatedShape.bounds.y - this.pivotPoint.y);
    attachmentBarVector = attachmentBarVector.rotated(this.tiltAngleProperty.get());
    this.bottomCenterPositionProperty.set(this.pivotPoint.plus(attachmentBarVector));
  }

  /**
   * Find the best open position for a mass that was dropped at the given point.  Returns null if no nearby open
   * position is available.
   * @param {Vector2} position
   * @returns {Vector2|null}
   * @private
   */
  getOpenMassDroppedPosition(position) {
    let closestOpenPosition = null;
    const validMassPositions = this.getSnapToPositions();
    if (NUM_SNAP_TO_POSITIONS % 2 === 1) {
      // Remove the position at the center of the plank from the set of candidates, since we don't want to allow users
      // to place things there.
      validMassPositions.splice(NUM_SNAP_TO_POSITIONS / 2, 1);
    }
    let candidateOpenPositions = [];
    validMassPositions.forEach(validPosition => {
      let occupiedOrTooFar = false;
      if (Math.abs(validPosition.x - position.x) > INTER_SNAP_TO_MARKER_DISTANCE * 2) {
        occupiedOrTooFar = true;
      }
      for (let i = 0; i < this.massesOnSurface.length && !occupiedOrTooFar; i++) {
        if (this.massesOnSurface.get(i).positionProperty.get().distance(validPosition) < INTER_SNAP_TO_MARKER_DISTANCE / 10) {
          occupiedOrTooFar = true;
        }
      }
      if (!occupiedOrTooFar) {
        candidateOpenPositions.push(validPosition);
      }
    });

    // Sort through the positions and eliminate those that are already occupied or too far away.
    const copyOfCandidatePositions = candidateOpenPositions.slice(0);
    for (let i = 0; i < copyOfCandidatePositions.length; i++) {
      for (let j = 0; j < this.massesOnSurface.length; j++) {
        if (this.massesOnSurface.get(j).positionProperty.get().distance(copyOfCandidatePositions[i]) < INTER_SNAP_TO_MARKER_DISTANCE / 10) {
          // This position is already occupied.
          candidateOpenPositions = _.without(candidateOpenPositions, this.massesOnSurface[j]);
        }
      }
    }

    // Find the closest of the open positions.
    candidateOpenPositions.forEach(candidateOpenPosition => {
      // Must be a reasonable distance away in the horizontal direction so that objects don't appear to fall sideways.
      if (Math.abs(candidateOpenPosition.x - position.x) <= INTER_SNAP_TO_MARKER_DISTANCE) {
        // This position is a potential candidate.  Is it better than what was already found?
        if (closestOpenPosition === null || candidateOpenPosition.distance(position) < closestOpenPosition.distance(position)) {
          closestOpenPosition = candidateOpenPosition;
        }
      }
    });
    return closestOpenPosition;
  }

  /**
   * Force the plank back to the level position.  This is generally done when the two support columns are put into
   * place.
   * @private
   */
  forceToLevelAndStill() {
    this.forceAngle(0.0);
  }

  /**
   * Force the plank to the max tilted position.  This is generally done when the single big support column is put into
   * place.
   * @private
   */
  forceToMaxAndStill() {
    this.forceAngle(this.maxTiltAngle);
  }

  /**
   * @param {number} angle
   * @private
   */
  forceAngle(angle) {
    this.angularVelocity = 0;
    this.tiltAngleProperty.set(angle);
    this.updatePlank();
    this.updateMassPositions();
  }

  /**
   * Obtain the absolute position (in meters) of the center surface (top) of the plank
   * @returns {Vector2}
   * @public
   */
  getPlankSurfaceCenter() {
    // Start at the absolute position of the attachment point, and add the relative position of the top of the plank,
    // accounting for its rotation angle.
    return this.bottomCenterPositionProperty.get().plus(Vector2.createPolar(PLANK_THICKNESS, this.tiltAngleProperty.get() + Math.PI / 2));
  }

  /**
   * Obtain the Y value for the surface of the plank for the specified X value.  Does not check for valid x value.
   * @param {number} xValue
   * @returns {number}
   * @private
   */
  getSurfaceYValue(xValue) {
    // Solve the linear equation for the line that represents the surface of the plank.
    const m = Math.tan(this.tiltAngleProperty.get());
    const plankSurfaceCenter = this.getPlankSurfaceCenter();
    const b = plankSurfaceCenter.y - m * plankSurfaceCenter.x;
    // Does NOT check if the xValue range is valid.
    return m * xValue + b;
  }

  /**
   * @param {Vector2} p
   * @returns {boolean}
   * @private
   */
  isPointAbovePlank(p) {
    const plankSpan = PLANK_LENGTH * Math.cos(this.tiltAngleProperty.get());
    const surfaceCenter = this.getPlankSurfaceCenter();
    return p.x >= surfaceCenter.x - plankSpan / 2 && p.x <= surfaceCenter.x + plankSpan / 2 && p.y > this.getSurfaceYValue(p.x);
  }

  /**
   * Returns true if the masses and distances on the plank work out such that the plank is balanced, even if it is not
   * yet in the level position. This does NOT pay attention to support columns.
   * @public
   */
  isBalanced() {
    let unCompensatedTorque = 0;
    this.massesOnSurface.forEach(mass => {
      unCompensatedTorque += mass.massValue * this.getMassDistanceFromCenter(mass);
    });

    // Account for floating point error, just make sure it is close enough.
    return Math.abs(unCompensatedTorque) < BASharedConstants.COMPARISON_TOLERANCE;
  }

  /**
   * @private
   */
  updateNetTorque() {
    this.currentNetTorque = 0;
    if (this.columnState.value === ColumnState.NO_COLUMNS) {
      // Add the torque due to the masses on the surface of the plank.
      this.currentNetTorque += this.getTorqueDueToMasses();

      // Add in torque due to plank.
      this.currentNetTorque += (this.pivotPoint.x - this.bottomCenterPositionProperty.get().x) * PLANK_MASS;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getTorqueDueToMasses() {
    let torque = 0;
    this.massesOnSurface.forEach(mass => {
      torque += this.pivotPoint.x - mass.positionProperty.get().x * mass.massValue;
    });
    return torque;
  }

  /**
   * @returns {Vector2[]}
   * @private
   */
  getSnapToPositions() {
    const snapToPositions = new Array(NUM_SNAP_TO_POSITIONS);
    const rotationTransform = Matrix3.rotationAround(this.tiltAngleProperty.get(), this.pivotPoint.x, this.pivotPoint.y);
    const unrotatedY = this.unrotatedShape.bounds.maxY;
    const unrotatedMinX = this.unrotatedShape.bounds.minX;
    for (let i = 0; i < NUM_SNAP_TO_POSITIONS; i++) {
      const unrotatedPoint = new Vector2(unrotatedMinX + (i + 1) * INTER_SNAP_TO_MARKER_DISTANCE, unrotatedY);
      snapToPositions[i] = rotationTransform.timesVector2(unrotatedPoint);
    }
    return snapToPositions;
  }
}

// static constants
Plank.LENGTH = PLANK_LENGTH;
Plank.THICKNESS = PLANK_THICKNESS;
Plank.INTER_SNAP_TO_MARKER_DISTANCE = INTER_SNAP_TO_MARKER_DISTANCE;
Plank.NUM_SNAP_TO_POSITIONS = NUM_SNAP_TO_POSITIONS;
Plank.MAX_VALID_MASS_DISTANCE_FROM_CENTER = (NUM_SNAP_TO_POSITIONS - 1) * INTER_SNAP_TO_MARKER_DISTANCE / 2;
Plank.PlankIO = new IOType('PlankIO', {
  valueType: Plank,
  stateSchema: {
    massDistancePairs: ArrayIO(ObjectLiteralIO) // TODO https://github.com/phetsims/balancing-act/issues/130 more specific schema
  },

  toStateObject: plank => plank.toStateObject()
});
balancingAct.register('Plank', Plank);
export default Plank;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIk1hdHJpeDMiLCJWZWN0b3IyIiwiU2hhcGUiLCJBcnJheUlPIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJPYmplY3RMaXRlcmFsSU8iLCJTdHJpbmdJTyIsImJhbGFuY2luZ0FjdCIsIkJBU2hhcmVkQ29uc3RhbnRzIiwiQ29sdW1uU3RhdGUiLCJNYXNzRm9yY2VWZWN0b3IiLCJQTEFOS19MRU5HVEgiLCJQTEFOS19USElDS05FU1MiLCJQTEFOS19NQVNTIiwiSU5URVJfU05BUF9UT19NQVJLRVJfRElTVEFOQ0UiLCJOVU1fU05BUF9UT19QT1NJVElPTlMiLCJNYXRoIiwiZmxvb3IiLCJNT01FTlRfT0ZfSU5FUlRJQSIsIlBsYW5rIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvbiIsInBpdm90UG9pbnQiLCJjb2x1bW5TdGF0ZSIsInVzZXJDb250cm9sbGVkTWFzc2VzIiwidGFuZGVtIiwidGlsdEFuZ2xlUHJvcGVydHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidW5pdHMiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJib3R0b21DZW50ZXJQb3NpdGlvblByb3BlcnR5IiwibWFzc2VzT25TdXJmYWNlIiwiZm9yY2VWZWN0b3JzIiwiYWN0aXZlRHJvcFBvc2l0aW9ucyIsIm1hc3NEaXN0YW5jZVBhaXJzIiwibWFzc0Ryb3BwZWRPblBsYW5rRW1pdHRlciIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlBsYW5rSU8iLCJtYXNzUmVtb3ZlZEZyb21QbGFua0VtaXR0ZXIiLCJhbmd1bGFyVmVsb2NpdHkiLCJjdXJyZW50TmV0VG9ycXVlIiwibWF4VGlsdEFuZ2xlIiwiYXNpbiIsInkiLCJ1bnJvdGF0ZWRTaGFwZSIsInJlY3QiLCJ4IiwibGluayIsIm5ld0NvbHVtblN0YXRlIiwiU0lOR0xFX0NPTFVNTiIsImZvcmNlVG9NYXhBbmRTdGlsbCIsIkRPVUJMRV9DT0xVTU5TIiwiZm9yY2VUb0xldmVsQW5kU3RpbGwiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZGVkTWFzcyIsInVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJ1c2VyQ29udHJvbGxlZCIsInJlbW92ZU1hc3NGcm9tU3VyZmFjZSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJzZWxmIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsIm1hc3NSZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkTWFzcyIsInVubGluayIsInJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJzdGVwIiwiZHQiLCJhbmd1bGFyQWNjZWxlcmF0aW9uIiwidXBkYXRlTmV0VG9ycXVlIiwiYWJzIiwicHJldmlvdXNUaWx0QW5nbGUiLCJnZXQiLCJuZXdUaWx0QW5nbGUiLCJzZXQiLCJ1cGRhdGVQbGFuayIsInVwZGF0ZU1hc3NQb3NpdGlvbnMiLCJ0ZW1wRHJvcFBvc2l0aW9ucyIsImZvckVhY2giLCJ1c2VyQ29udHJvbGxlZE1hc3MiLCJpc1BvaW50QWJvdmVQbGFuayIsImdldE1pZGRsZVBvaW50IiwiY2xvc2VzdE9wZW5Qb3NpdGlvbiIsImdldE9wZW5NYXNzRHJvcHBlZFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInBsYW5rU3VyZmFjZUNlbnRlciIsImdldFBsYW5rU3VyZmFjZUNlbnRlciIsImRpc3RhbmNlRnJvbUNlbnRlciIsImRpc3RhbmNlIiwicHVzaCIsImNvcHlPZkFjdGl2ZURyb3BQb3NpdGlvbnMiLCJzbGljZSIsImluZGV4T2YiLCJyZW1vdmUiLCJkcm9wUG9zaXRpb24iLCJpbmNsdWRlcyIsImFkZCIsImFkZE1hc3NUb1N1cmZhY2UiLCJtYXNzIiwibWFzc0FkZGVkIiwib25QbGFua1Byb3BlcnR5IiwicmVzdWx0IiwiZW1pdCIsInBoZXRpb0lEIiwibWFzc1ZhbHVlIiwidG9TdGF0ZU9iamVjdCIsIm1hcCIsIm1hc3NEaXN0YW5jZVBhaXIiLCJhZGRNYXNzVG9TdXJmYWNlQXQiLCJFcnJvciIsInZlY3RvclRvUG9zaXRpb24iLCJwbHVzIiwiY3JlYXRlUG9sYXIiLCJhc3NlcnQiLCJ2ZWN0b3JGcm9tQ2VudGVyVG9NYXNzIiwiZ2V0TWFzc0Rpc3RhbmNlRnJvbUNlbnRlciIsInJvdGF0ZWQiLCJyb3RhdGlvbkFuZ2xlUHJvcGVydHkiLCJ1cGRhdGUiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwiaiIsInJlbW92ZUFsbE1hc3NlcyIsImNvcHlPZk1hc3Nlc0FycmF5IiwibWluWSIsImF0dGFjaG1lbnRCYXJWZWN0b3IiLCJib3VuZHMiLCJ2YWxpZE1hc3NQb3NpdGlvbnMiLCJnZXRTbmFwVG9Qb3NpdGlvbnMiLCJjYW5kaWRhdGVPcGVuUG9zaXRpb25zIiwidmFsaWRQb3NpdGlvbiIsIm9jY3VwaWVkT3JUb29GYXIiLCJjb3B5T2ZDYW5kaWRhdGVQb3NpdGlvbnMiLCJfIiwid2l0aG91dCIsImNhbmRpZGF0ZU9wZW5Qb3NpdGlvbiIsImZvcmNlQW5nbGUiLCJhbmdsZSIsIlBJIiwiZ2V0U3VyZmFjZVlWYWx1ZSIsInhWYWx1ZSIsIm0iLCJ0YW4iLCJiIiwicCIsInBsYW5rU3BhbiIsImNvcyIsInN1cmZhY2VDZW50ZXIiLCJpc0JhbGFuY2VkIiwidW5Db21wZW5zYXRlZFRvcnF1ZSIsIkNPTVBBUklTT05fVE9MRVJBTkNFIiwidmFsdWUiLCJOT19DT0xVTU5TIiwiZ2V0VG9ycXVlRHVlVG9NYXNzZXMiLCJ0b3JxdWUiLCJzbmFwVG9Qb3NpdGlvbnMiLCJBcnJheSIsInJvdGF0aW9uVHJhbnNmb3JtIiwicm90YXRpb25Bcm91bmQiLCJ1bnJvdGF0ZWRZIiwibWF4WSIsInVucm90YXRlZE1pblgiLCJtaW5YIiwidW5yb3RhdGVkUG9pbnQiLCJ0aW1lc1ZlY3RvcjIiLCJMRU5HVEgiLCJUSElDS05FU1MiLCJNQVhfVkFMSURfTUFTU19ESVNUQU5DRV9GUk9NX0NFTlRFUiIsInZhbHVlVHlwZSIsInN0YXRlU2NoZW1hIiwicGxhbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYW5rLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgaXMgdGhlIG1vZGVsIGZvciB0aGUgcGxhbmsgdXBvbiB3aGljaCBtYXNzZXMgY2FuIGJlIHBsYWNlZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IE9iamVjdExpdGVyYWxJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT2JqZWN0TGl0ZXJhbElPLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuaW1wb3J0IEJBU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uL0JBU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvbHVtblN0YXRlIGZyb20gJy4vQ29sdW1uU3RhdGUuanMnO1xyXG5pbXBvcnQgTWFzc0ZvcmNlVmVjdG9yIGZyb20gJy4vTWFzc0ZvcmNlVmVjdG9yLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBQTEFOS19MRU5HVEggPSA0LjU7Ly8gbWV0ZXJzXHJcbmNvbnN0IFBMQU5LX1RISUNLTkVTUyA9IDAuMDU7IC8vIG1ldGVyc1xyXG5jb25zdCBQTEFOS19NQVNTID0gNzU7IC8vIGtnXHJcbmNvbnN0IElOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFID0gMC4yNTsgLy8gbWV0ZXJzXHJcbmNvbnN0IE5VTV9TTkFQX1RPX1BPU0lUSU9OUyA9IE1hdGguZmxvb3IoIFBMQU5LX0xFTkdUSCAvIElOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFIC0gMSApO1xyXG5jb25zdCBNT01FTlRfT0ZfSU5FUlRJQSA9IFBMQU5LX01BU1MgKiAoICggUExBTktfTEVOR1RIICogUExBTktfTEVOR1RIICkgKyAoIFBMQU5LX1RISUNLTkVTUyAqIFBMQU5LX1RISUNLTkVTUyApICkgLyAxMjtcclxuXHJcbmNsYXNzIFBsYW5rIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHBvc2l0aW9uIHtWZWN0b3IyfSBJbml0aWFsIHBvc2l0aW9uIG9mIHRoZSBob3Jpem9udGFsIGNlbnRlciwgdmVydGljYWwgYm90dG9tXHJcbiAgICogQHBhcmFtIHBpdm90UG9pbnQge1ZlY3RvcjJ9IFBvaW50IGFyb3VuZCB3aGljaCB0aGUgcGxhbmsgd2lsbCBwaXZvdFxyXG4gICAqIEBwYXJhbSBjb2x1bW5TdGF0ZSB7UHJvcGVydHl9IFByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIGN1cnJlbnQgc3RhdGUgb2Ygc3VwcG9ydCBjb2x1bW5zLlxyXG4gICAqIEBwYXJhbSB1c2VyQ29udHJvbGxlZE1hc3NlcyB7QXJyYXl9IE1hc3NlcyBiZWluZyBjb250cm9sbGVkIGJ5IHRoZSB1c2VyLCB1c2VkIHRvIHVwZGF0ZSBhY3RpdmUgZHJvcCBwb3NpdGlvbnMuXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwb3NpdGlvbiwgcGl2b3RQb2ludCwgY29sdW1uU3RhdGUsIHVzZXJDb250cm9sbGVkTWFzc2VzLCB0YW5kZW0gKSB7XHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkTWFzc2VzID0gdXNlckNvbnRyb2xsZWRNYXNzZXM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy50aWx0QW5nbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQW5nbGUgb2YgdGhlIHBsYW5rIHdpdGggcmVzcGVjdCB0byB0aGUgZ3JvdW5kLiAgQSB2YWx1ZSBvZiAwIGluZGljYXRlcyBhIGxldmVsIHBsYW5rLCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Bvc2l0aXZlIGlzIHRpbHRlZCBsZWZ0LCBuZWdhdGl2ZSB0byB0aGUgcmlnaHQuJyxcclxuICAgICAgdW5pdHM6ICdyYWRpYW5zJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGlsdEFuZ2xlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIFBvaW50IHdoZXJlIHRoZSBib3R0b20gY2VudGVyIG9mIHRoZSBwbGFuayBpcyBjdXJyZW50bHkgcG9zaXRpb25lZC4gSWYgdGhlIHBsYW5rIGlzIHNpdHRpbmdcclxuICAgIC8vIG9uIHRvcCBvZiB0aGUgZnVsY3J1bSwgdGhpcyBwb2ludCB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSBwaXZvdCBwb2ludC4gIFdoZW4gdGhlIHBpdm90IHBvaW50IGlzIGFib3ZlIHRoZSBwbGFuayxcclxuICAgIC8vIGFzIGlzIGdlbmVyYWxseSBkb25lIGluIHRoaXMgc2ltdWxhdGlvbiBpbiBvcmRlciB0byBtYWtlIHRoZSBwbGFuayByZWJhbGFuY2UgaWYgbm90aGluZyBpcyBvbiBpdCwgdGhpcyBwb3NpdGlvblxyXG4gICAgLy8gd2lsbCBiZSBkaWZmZXJlbnQuXHJcbiAgICB0aGlzLmJvdHRvbUNlbnRlclBvc2l0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIEV4dGVybmFsbHkgdmlzaWJsZSBvYnNlcnZhYmxlIGxpc3RzLlxyXG4gICAgdGhpcy5tYXNzZXNPblN1cmZhY2UgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuICAgIHRoaXMuZm9yY2VWZWN0b3JzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcbiAgICB0aGlzLmFjdGl2ZURyb3BQb3NpdGlvbnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTsgLy8gUG9zaXRpb25zIHdoZXJlIHVzZXItY29udHJvbGxlZCBtYXNzZXMgd291bGQgbGFuZCBpZiBkcm9wcGVkLCBpbiBtZXRlcnMgZnJvbSBjZW50ZXIuXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7VmVjdG9yMn0gT3RoZXIgZXh0ZXJuYWwgdmlzaWJsZSBhdHRyaWJ1dGVzLlxyXG4gICAgdGhpcy5waXZvdFBvaW50ID0gcGl2b3RQb2ludDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gTWFwIG9mIG1hc3NlcyB0byBkaXN0YW5jZSBmcm9tIHRoZSBwbGFuaydzIGNlbnRlci5cclxuICAgIHRoaXMubWFzc0Rpc3RhbmNlUGFpcnMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHNpZ25pZnkgaW4gdGhlIGRhdGEgc3RyZWFtIHdoZW4gbWFzc2VzIGFyZSBwbGFjZWQgYW5kIHJlbW92ZWRcclxuICAgIHRoaXMubWFzc0Ryb3BwZWRPblBsYW5rRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3NEcm9wcGVkT25QbGFua0VtaXR0ZXInICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IG5hbWU6ICdwaGV0aW9JRCcsIHBoZXRpb1R5cGU6IFN0cmluZ0lPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnbWFzcycsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnZGlzdGFuY2UnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2Z1bGxTdGF0ZScsIHBoZXRpb1R5cGU6IFBsYW5rLlBsYW5rSU8gfSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBzaWduaWZ5IGluIHRoZSBkYXRhIHN0cmVhbSB3aGVuIG1hc3NlcyBhcmUgcGxhY2VkIGFuZCByZW1vdmVkXHJcbiAgICB0aGlzLm1hc3NSZW1vdmVkRnJvbVBsYW5rRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3NSZW1vdmVkRnJvbVBsYW5rRW1pdHRlcicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3BoZXRpb0lEJywgcGhldGlvVHlwZTogU3RyaW5nSU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdtYXNzJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdkaXN0YW5jZScsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnZnVsbFN0YXRlJywgcGhldGlvVHlwZTogUGxhbmsuUGxhbmtJTyB9IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBWYXJpYWJsZXMgdGhhdCBuZWVkIHRvIGJlIHJldGFpbmVkIGZvciBkeW5hbWljIGJlaGF2aW9yLCBidXQgYXJlIG5vdCBpbnRlbmRlZCB0byBiZSBhY2Nlc3NlZCBleHRlcm5hbGx5LlxyXG4gICAgdGhpcy5jb2x1bW5TdGF0ZSA9IGNvbHVtblN0YXRlO1xyXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSAwO1xyXG4gICAgdGhpcy5jdXJyZW50TmV0VG9ycXVlID0gMDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gQ2FsY3VsYXRlIHRoZSBtYXggYW5nbGUgYXQgd2hpY2ggdGhlIHBsYW5rIGNhbiB0aWx0IGJlZm9yZSBoaXR0aW5nIHRoZSBncm91bmQuICBOT1RFOiBUaGlzXHJcbiAgICAvLyBhc3N1bWVzIGEgc21hbGwgZGlzdGFuY2UgYmV0d2VlbiB0aGUgcGl2b3QgcG9pbnQgYW5kIHRoZSBib3R0b20gb2YgdGhlIHBsYW5rLiAgSWYgdGhpcyBhc3N1bXB0aW9uIGNoYW5nZXMsIG9yIGlmXHJcbiAgICAvLyB0aGUgZnVsY3J1bSBiZWNvbWVzIG1vdmFibGUsIHRoZSB3YXkgdGhpcyBpcyBkb25lIHdpbGwgbmVlZCB0byBjaGFuZ2UuXHJcbiAgICB0aGlzLm1heFRpbHRBbmdsZSA9IE1hdGguYXNpbiggcG9zaXRpb24ueSAvICggUExBTktfTEVOR1RIIC8gMiApICk7XHJcblxyXG4gICAgLy8gVW5yb3RhdGVkIHNoYXBlIG9mIHRoZSBwbGFua1xyXG4gICAgdGhpcy51bnJvdGF0ZWRTaGFwZSA9IFNoYXBlLnJlY3QoIHBvc2l0aW9uLnggLSBQTEFOS19MRU5HVEggLyAyLCBwb3NpdGlvbi55LCBQTEFOS19MRU5HVEgsIFBMQU5LX1RISUNLTkVTUyApO1xyXG5cclxuICAgIC8vIExpc3RlbiB0byB0aGUgc3VwcG9ydCBjb2x1bW4gcHJvcGVydHkuICBUaGUgcGxhbmsgZ29lcyB0byB0aGUgbGV2ZWwgcG9zaXRpb24gd2hlbmV2ZXIgdGhlcmUgYXJlIHR3byBjb2x1bW5zXHJcbiAgICAvLyBwcmVzZW50LCBhbmQgaW50byBhIHRpbHRlZCBwb3NpdGlvbiB3aGVuIG9ubHkgb25lIGlzIHByZXNlbnQuXHJcbiAgICBjb2x1bW5TdGF0ZS5saW5rKCBuZXdDb2x1bW5TdGF0ZSA9PiB7XHJcbiAgICAgIGlmICggbmV3Q29sdW1uU3RhdGUgPT09IENvbHVtblN0YXRlLlNJTkdMRV9DT0xVTU4gKSB7XHJcbiAgICAgICAgdGhpcy5mb3JjZVRvTWF4QW5kU3RpbGwoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggbmV3Q29sdW1uU3RhdGUgPT09IENvbHVtblN0YXRlLkRPVUJMRV9DT0xVTU5TICkge1xyXG4gICAgICAgIHRoaXMuZm9yY2VUb0xldmVsQW5kU3RpbGwoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3Igd2hlbiBtYXNzZXMgYXJlIGFkZGVkIHRvIHRoZSBwbGFuayBhbmQgYWRkIGEgbGlzdGVuZXIgdGhhdCByZW1vdmVzIHRoYXQgbWFzcyBpZiB0aGUgdXNlciBwaWNrcyBpcyB1cC5cclxuICAgIHRoaXMubWFzc2VzT25TdXJmYWNlLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZE1hc3MgPT4ge1xyXG5cclxuICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHJlbW92ZSB0aGlzIG1hc3MgZnJvbSB0aGUgc3VyZmFjZSB3aGVuIHRoZSB1c2VyIHBpY2tzIGl0IHVwLlxyXG4gICAgICBjb25zdCB1c2VyQ29udHJvbGxlZExpc3RlbmVyID0gdXNlckNvbnRyb2xsZWQgPT4ge1xyXG4gICAgICAgIGlmICggdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZU1hc3NGcm9tU3VyZmFjZSggYWRkZWRNYXNzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBhZGRlZE1hc3MudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhlIGxpc3RlbmVyIHdoZW4gdGhlIG1hc3MgaXMgcmVtb3ZlZC5cclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMubWFzc2VzT25TdXJmYWNlLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIG1hc3NSZW1vdmFsTGlzdGVuZXIoIHJlbW92ZWRNYXNzICkge1xyXG4gICAgICAgIGlmICggcmVtb3ZlZE1hc3MgPT09IGFkZGVkTWFzcyApIHtcclxuICAgICAgICAgIHJlbW92ZWRNYXNzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCB1c2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcbiAgICAgICAgICBzZWxmLm1hc3Nlc09uU3VyZmFjZS5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCBtYXNzUmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICBsZXQgYW5ndWxhckFjY2VsZXJhdGlvbjtcclxuICAgIHRoaXMudXBkYXRlTmV0VG9ycXVlKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBhbmd1bGFyIGFjY2VsZXJhdGlvbiBhbmQgdmVsb2NpdHkuICBUaGVyZSBpcyBzb21lIHRocmVzaG9sZGluZyBoZXJlIHRvIHByZXZlbnQgdGhlIHBsYW5rIGZyb21cclxuICAgIC8vIG9zY2lsbGF0aW5nIGZvcmV2ZXIgd2l0aCBzbWFsbCB2YWx1ZXMsIHNpbmNlIHRoaXMgY2FuIGNhdXNlIG9kZC1sb29raW5nIG1vdmVtZW50cyBvZiB0aGUgcGxhbmtzIGFuZCBtYXNzZXMuICBUaGVcclxuICAgIC8vIHRocmVzaG9sZHMgd2VyZSBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG4gICAgYW5ndWxhckFjY2VsZXJhdGlvbiA9IHRoaXMuY3VycmVudE5ldFRvcnF1ZSAvIE1PTUVOVF9PRl9JTkVSVElBO1xyXG4gICAgYW5ndWxhckFjY2VsZXJhdGlvbiA9IE1hdGguYWJzKCBhbmd1bGFyQWNjZWxlcmF0aW9uICkgPiAwLjAwMDAxID8gYW5ndWxhckFjY2VsZXJhdGlvbiA6IDA7XHJcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSArPSBhbmd1bGFyQWNjZWxlcmF0aW9uO1xyXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSBNYXRoLmFicyggdGhpcy5hbmd1bGFyVmVsb2NpdHkgKSA+IDAuMDAwMDEgPyB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA6IDA7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBhbmdsZSBvZiB0aGUgcGxhbmsncyB0aWx0IGJhc2VkIG9uIHRoZSBhbmd1bGFyIHZlbG9jaXR5LlxyXG4gICAgY29uc3QgcHJldmlvdXNUaWx0QW5nbGUgPSB0aGlzLnRpbHRBbmdsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgbGV0IG5ld1RpbHRBbmdsZSA9IHRoaXMudGlsdEFuZ2xlUHJvcGVydHkuZ2V0KCkgKyB0aGlzLmFuZ3VsYXJWZWxvY2l0eSAqIGR0O1xyXG4gICAgaWYgKCBNYXRoLmFicyggbmV3VGlsdEFuZ2xlICkgPiB0aGlzLm1heFRpbHRBbmdsZSApIHtcclxuXHJcbiAgICAgIC8vIExpbWl0IHRoZSBhbmdsZSB3aGVuIG9uZSBlbmQgaXMgdG91Y2hpbmcgdGhlIGdyb3VuZC5cclxuICAgICAgbmV3VGlsdEFuZ2xlID0gdGhpcy5tYXhUaWx0QW5nbGUgKiAoIHRoaXMudGlsdEFuZ2xlUHJvcGVydHkuZ2V0KCkgPCAwID8gLTEgOiAxICk7XHJcbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBNYXRoLmFicyggbmV3VGlsdEFuZ2xlICkgPCAwLjAwMDEgKSB7XHJcblxyXG4gICAgICAvLyBCZWxvdyBhIGNlcnRhaW4gdGhyZXNob2xkIGp1c3QgZm9yY2UgdGhlIHRpbHQgYW5nbGUgdG8gYmUgemVybyBzbyB0aGF0IGl0IGFwcGVhcnMgcGVyZmVjdGx5IGxldmVsLlxyXG4gICAgICBuZXdUaWx0QW5nbGUgPSAwO1xyXG4gICAgfVxyXG4gICAgdGhpcy50aWx0QW5nbGVQcm9wZXJ0eS5zZXQoIG5ld1RpbHRBbmdsZSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgc2hhcGUgb2YgdGhlIHBsYW5rIGFuZCB0aGUgcG9zaXRpb25zIG9mIHRoZSBtYXNzZXMgb24gdGhlIHN1cmZhY2UsIGJ1dCBvbmx5IGlmIHRoZSB0aWx0IGFuZ2xlIGhhc1xyXG4gICAgLy8gY2hhbmdlZC5cclxuICAgIGlmICggdGhpcy50aWx0QW5nbGVQcm9wZXJ0eS5nZXQoKSAhPT0gcHJldmlvdXNUaWx0QW5nbGUgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlUGxhbmsoKTtcclxuICAgICAgdGhpcy51cGRhdGVNYXNzUG9zaXRpb25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2ltdWxhdGUgZnJpY3Rpb24gYnkgc2xvd2luZyBkb3duIHRoZSByb3RhdGlvbiBhIGxpdHRsZS5cclxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ICo9IDAuOTE7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBhY3RpdmUgZHJvcCBwb3NpdGlvbnMuXHJcbiAgICBjb25zdCB0ZW1wRHJvcFBvc2l0aW9ucyA9IFtdO1xyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZE1hc3Nlcy5mb3JFYWNoKCB1c2VyQ29udHJvbGxlZE1hc3MgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMuaXNQb2ludEFib3ZlUGxhbmsoIHVzZXJDb250cm9sbGVkTWFzcy5nZXRNaWRkbGVQb2ludCgpICkgKSB7XHJcbiAgICAgICAgY29uc3QgY2xvc2VzdE9wZW5Qb3NpdGlvbiA9IHRoaXMuZ2V0T3Blbk1hc3NEcm9wcGVkUG9zaXRpb24oIHVzZXJDb250cm9sbGVkTWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgaWYgKCBjbG9zZXN0T3BlblBvc2l0aW9uICkge1xyXG4gICAgICAgICAgY29uc3QgcGxhbmtTdXJmYWNlQ2VudGVyID0gdGhpcy5nZXRQbGFua1N1cmZhY2VDZW50ZXIoKTtcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlRnJvbUNlbnRlciA9IGNsb3Nlc3RPcGVuUG9zaXRpb24uZGlzdGFuY2UoIHBsYW5rU3VyZmFjZUNlbnRlciApICogKCBjbG9zZXN0T3BlblBvc2l0aW9uLnggPCAwID8gLTEgOiAxICk7XHJcbiAgICAgICAgICB0ZW1wRHJvcFBvc2l0aW9ucy5wdXNoKCBkaXN0YW5jZUZyb21DZW50ZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGNvcHlPZkFjdGl2ZURyb3BQb3NpdGlvbnMgPSB0aGlzLmFjdGl2ZURyb3BQb3NpdGlvbnMuc2xpY2UoIDAgKTtcclxuICAgIC8vIFJlbW92ZSBuZXdseSBpbmFjdGl2ZSBkcm9wIHBvc2l0aW9ucy5cclxuICAgIGNvcHlPZkFjdGl2ZURyb3BQb3NpdGlvbnMuZm9yRWFjaCggYWN0aXZlRHJvcFBvc2l0aW9ucyA9PiB7XHJcbiAgICAgIGlmICggdGVtcERyb3BQb3NpdGlvbnMuaW5kZXhPZiggYWN0aXZlRHJvcFBvc2l0aW9ucyApIDwgMCApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZURyb3BQb3NpdGlvbnMucmVtb3ZlKCBhY3RpdmVEcm9wUG9zaXRpb25zICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIC8vIEFkZCBhbnkgbmV3IGFjdGl2ZSBkcm9wIHBvc2l0aW9ucy5cclxuICAgIHRlbXBEcm9wUG9zaXRpb25zLmZvckVhY2goIGRyb3BQb3NpdGlvbiA9PiB7XHJcbiAgICAgIGlmICggIXRoaXMuYWN0aXZlRHJvcFBvc2l0aW9ucy5pbmNsdWRlcyggZHJvcFBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEcm9wUG9zaXRpb25zLmFkZCggZHJvcFBvc2l0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIG1hc3MgdG8gdGhlIHN1cmZhY2Ugb2YgdGhlIHBsYW5rLCBjaG9vc2VzIGEgcG9zaXRpb24gYmVsb3cgdGhlIG1hc3MuXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZE1hc3NUb1N1cmZhY2UoIG1hc3MgKSB7XHJcbiAgICBsZXQgbWFzc0FkZGVkID0gZmFsc2U7XHJcbiAgICBjb25zdCBjbG9zZXN0T3BlblBvc2l0aW9uID0gdGhpcy5nZXRPcGVuTWFzc0Ryb3BwZWRQb3NpdGlvbiggbWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICBpZiAoIHRoaXMuaXNQb2ludEFib3ZlUGxhbmsoIG1hc3MuZ2V0TWlkZGxlUG9pbnQoKSApICYmIGNsb3Nlc3RPcGVuUG9zaXRpb24gIT09IG51bGwgKSB7XHJcbiAgICAgIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIGNsb3Nlc3RPcGVuUG9zaXRpb24gKTtcclxuICAgICAgbWFzcy5vblBsYW5rUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgICBjb25zdCByZXN1bHQgPSB7XHJcbiAgICAgICAgbWFzczogbWFzcyxcclxuICAgICAgICBkaXN0YW5jZTogdGhpcy5nZXRQbGFua1N1cmZhY2VDZW50ZXIoKS5kaXN0YW5jZSggbWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgKlxyXG4gICAgICAgICAgICAgICAgICAoIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ID4gdGhpcy5nZXRQbGFua1N1cmZhY2VDZW50ZXIoKS54ID8gMSA6IC0xIClcclxuICAgICAgfTtcclxuICAgICAgdGhpcy5tYXNzRGlzdGFuY2VQYWlycy5wdXNoKCByZXN1bHQgKTtcclxuXHJcbiAgICAgIHRoaXMubWFzc0Ryb3BwZWRPblBsYW5rRW1pdHRlci5lbWl0KCBtYXNzLnRhbmRlbS5waGV0aW9JRCwgbWFzcy5tYXNzVmFsdWUsIHJlc3VsdC5kaXN0YW5jZSwgdGhpcyApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBmb3JjZSB2ZWN0b3IgZm9yIHRoaXMgbWFzcy5cclxuICAgICAgdGhpcy5mb3JjZVZlY3RvcnMucHVzaCggbmV3IE1hc3NGb3JjZVZlY3RvciggbWFzcyApICk7XHJcblxyXG4gICAgICAvLyBGaW5hbCBzdGVwcy5cclxuICAgICAgdGhpcy5tYXNzZXNPblN1cmZhY2UucHVzaCggbWFzcyApO1xyXG4gICAgICB0aGlzLnVwZGF0ZU1hc3NQb3NpdGlvbnMoKTtcclxuICAgICAgdGhpcy51cGRhdGVOZXRUb3JxdWUoKTtcclxuICAgICAgbWFzc0FkZGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWFzc0FkZGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5kaWNhdGVzIGFsbCBvZiB0aGUgbWFzc2VzIHRoYXQgYXJlIGN1cnJlbnRseSBvbiB0aGUgcGxhbmtcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG1hc3NEaXN0YW5jZVBhaXJzOiB0aGlzLm1hc3NEaXN0YW5jZVBhaXJzLm1hcCggbWFzc0Rpc3RhbmNlUGFpciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hc3NEaXN0YW5jZVBhaXIubWFzcy50YW5kZW0ucGhldGlvSUQsXHJcbiAgICAgICAgICBtYXNzOiBtYXNzRGlzdGFuY2VQYWlyLm1hc3MubWFzc1ZhbHVlLFxyXG4gICAgICAgICAgZGlzdGFuY2U6IG1hc3NEaXN0YW5jZVBhaXIuZGlzdGFuY2VcclxuICAgICAgICB9O1xyXG4gICAgICB9IClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBtYXNzIHRvIHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gb24gdGhlIHBsYW5rLlxyXG4gICAqIEBwYXJhbSB7TWFzc30gbWFzc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZUZyb21DZW50ZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkTWFzc1RvU3VyZmFjZUF0KCBtYXNzLCBkaXN0YW5jZUZyb21DZW50ZXIgKSB7XHJcbiAgICBpZiAoIE1hdGguYWJzKCBkaXN0YW5jZUZyb21DZW50ZXIgKSA+IFBMQU5LX0xFTkdUSCAvIDIgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ1dhcm5pbmc6IEF0dGVtcHQgdG8gYWRkIG1hc3MgYXQgaW52YWxpZCBkaXN0YW5jZSBmcm9tIGNlbnRlcicgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHZlY3RvclRvUG9zaXRpb24gPSB0aGlzLmdldFBsYW5rU3VyZmFjZUNlbnRlcigpLnBsdXMoXHJcbiAgICAgIFZlY3RvcjIuY3JlYXRlUG9sYXIoIGRpc3RhbmNlRnJvbUNlbnRlciwgdGhpcy50aWx0QW5nbGVQcm9wZXJ0eS5nZXQoKSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1hc3MgdG8gYmUganVzdCBhYm92ZSB0aGUgcGxhbmsgYXQgdGhlXHJcbiAgICAvLyBhcHByb3ByaWF0ZSBkaXN0YW5jZSBzbyB0aGF0IGl0IHdpbGwgZHJvcCB0byB0aGUgY29ycmVjdCBwbGFjZS5cclxuICAgIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB2ZWN0b3JUb1Bvc2l0aW9uLngsIHZlY3RvclRvUG9zaXRpb24ueSArIDAuMDEgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1BvaW50QWJvdmVQbGFuayggbWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgKTsgIC8vIE5lZWQgdG8gZml4IHRoaXMgaWYgbWFzcyBpc24ndCBhYm92ZSB0aGUgc3VyZmFjZS5cclxuICAgIHRoaXMuYWRkTWFzc1RvU3VyZmFjZSggbWFzcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVNYXNzUG9zaXRpb25zKCkge1xyXG4gICAgdGhpcy5tYXNzZXNPblN1cmZhY2UuZm9yRWFjaCggbWFzcyA9PiB7XHJcblxyXG4gICAgICAvLyBDb21wdXRlIHRoZSB2ZWN0b3IgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBwbGFuaydzIHN1cmZhY2UgdG8gdGhlIGJvdHRvbSBvZiB0aGUgbWFzcywgaW4gbWV0ZXJzLlxyXG4gICAgICBjb25zdCB2ZWN0b3JGcm9tQ2VudGVyVG9NYXNzID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgdGhpcy5nZXRNYXNzRGlzdGFuY2VGcm9tQ2VudGVyKCBtYXNzICksIDAgKS5yb3RhdGVkKCB0aGlzLnRpbHRBbmdsZVByb3BlcnR5LmdldCgpXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBTZXQgdGhlIHBvc2l0aW9uIGFuZCByb3RhdGlvbiBvZiB0aGUgbWFzcy5cclxuICAgICAgbWFzcy5yb3RhdGlvbkFuZ2xlUHJvcGVydHkuc2V0KCB0aGlzLnRpbHRBbmdsZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0UGxhbmtTdXJmYWNlQ2VudGVyKCkucGx1cyggdmVjdG9yRnJvbUNlbnRlclRvTWFzcyApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBmb3JjZSB2ZWN0b3JzIGZyb20gdGhlIG1hc3Nlcy4gIFRoaXMgbW9zdGx5IGp1c3QgbW92ZXNcclxuICAgIC8vIHRoZW0gdG8gdGhlIGNvcnJlY3QgcG9zaXRpb25zLlxyXG4gICAgdGhpcy5mb3JjZVZlY3RvcnMuZm9yRWFjaCggZm9yY2VWZWN0b3JzID0+IHtcclxuICAgICAgZm9yY2VWZWN0b3JzLnVwZGF0ZSgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZU1hc3NGcm9tU3VyZmFjZSggbWFzcyApIHtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIG1hc3MuXHJcbiAgICB0aGlzLm1hc3Nlc09uU3VyZmFjZS5yZW1vdmUoIG1hc3MgKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIG1hc3MtZGlzdGFuY2UgcGFpciBmb3IgdGhpcyBtYXNzLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tYXNzRGlzdGFuY2VQYWlycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLm1hc3NEaXN0YW5jZVBhaXJzWyBpIF0ubWFzcyA9PT0gbWFzcyApIHtcclxuXHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLm1hc3NEaXN0YW5jZVBhaXJzWyBpIF0uZGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy5tYXNzRGlzdGFuY2VQYWlycy5zcGxpY2UoIGksIDEgKTtcclxuICAgICAgICB0aGlzLm1hc3NSZW1vdmVkRnJvbVBsYW5rRW1pdHRlci5lbWl0KCBtYXNzLnRhbmRlbS5waGV0aW9JRCwgbWFzcy5tYXNzVmFsdWUsIGRpc3RhbmNlLCB0aGlzICk7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG1hc3MgdGhhdCBtYXkgaGF2ZSBiZWVuIGFmZmVjdGVkIGJ5IGJlaW5nIG9uIHRoZSBwbGFuay5cclxuICAgIG1hc3Mucm90YXRpb25BbmdsZVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgbWFzcy5vblBsYW5rUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIFJlbW92ZSB0aGUgZm9yY2UgdmVjdG9yIGFzc29jaWF0ZWQgd2l0aCB0aGlzIG1hc3MuXHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmZvcmNlVmVjdG9ycy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgaWYgKCB0aGlzLmZvcmNlVmVjdG9ycy5nZXQoIGogKS5tYXNzID09PSBtYXNzICkge1xyXG4gICAgICAgIHRoaXMuZm9yY2VWZWN0b3JzLnJlbW92ZSggdGhpcy5mb3JjZVZlY3RvcnMuZ2V0KCBqICkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdG9ycXVlLCBzaW5jZSB0aGUgcmVtb3ZhbCBvZiB0aGUgbWFzcyB1bmRvdWJ0ZWRseSBjaGFuZ2VkIGl0LlxyXG4gICAgdGhpcy51cGRhdGVOZXRUb3JxdWUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVBbGxNYXNzZXMoKSB7XHJcbiAgICBjb25zdCBjb3B5T2ZNYXNzZXNBcnJheSA9IHRoaXMubWFzc2VzT25TdXJmYWNlLnNsaWNlKCAwICk7XHJcbiAgICBjb3B5T2ZNYXNzZXNBcnJheS5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVNYXNzRnJvbVN1cmZhY2UoIG1hc3MgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWFzc30gbWFzc1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1hc3NEaXN0YW5jZUZyb21DZW50ZXIoIG1hc3MgKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm1hc3NEaXN0YW5jZVBhaXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMubWFzc0Rpc3RhbmNlUGFpcnNbIGkgXS5tYXNzID09PSBtYXNzICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hc3NEaXN0YW5jZVBhaXJzWyBpIF0uZGlzdGFuY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVQbGFuaygpIHtcclxuICAgIGlmICggdGhpcy5waXZvdFBvaW50LnkgPCB0aGlzLnVucm90YXRlZFNoYXBlLm1pblkgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ1Bpdm90IHBvaW50IGNhbm5vdCBiZSBiZWxvdyB0aGUgcGxhbmsuJyApO1xyXG4gICAgfVxyXG4gICAgbGV0IGF0dGFjaG1lbnRCYXJWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgdGhpcy51bnJvdGF0ZWRTaGFwZS5ib3VuZHMueSAtIHRoaXMucGl2b3RQb2ludC55ICk7XHJcbiAgICBhdHRhY2htZW50QmFyVmVjdG9yID0gYXR0YWNobWVudEJhclZlY3Rvci5yb3RhdGVkKCB0aGlzLnRpbHRBbmdsZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICB0aGlzLmJvdHRvbUNlbnRlclBvc2l0aW9uUHJvcGVydHkuc2V0KCB0aGlzLnBpdm90UG9pbnQucGx1cyggYXR0YWNobWVudEJhclZlY3RvciApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHRoZSBiZXN0IG9wZW4gcG9zaXRpb24gZm9yIGEgbWFzcyB0aGF0IHdhcyBkcm9wcGVkIGF0IHRoZSBnaXZlbiBwb2ludC4gIFJldHVybnMgbnVsbCBpZiBubyBuZWFyYnkgb3BlblxyXG4gICAqIHBvc2l0aW9uIGlzIGF2YWlsYWJsZS5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ8bnVsbH1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE9wZW5NYXNzRHJvcHBlZFBvc2l0aW9uKCBwb3NpdGlvbiApIHtcclxuICAgIGxldCBjbG9zZXN0T3BlblBvc2l0aW9uID0gbnVsbDtcclxuICAgIGNvbnN0IHZhbGlkTWFzc1Bvc2l0aW9ucyA9IHRoaXMuZ2V0U25hcFRvUG9zaXRpb25zKCk7XHJcbiAgICBpZiAoIE5VTV9TTkFQX1RPX1BPU0lUSU9OUyAlIDIgPT09IDEgKSB7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhlIHBvc2l0aW9uIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHBsYW5rIGZyb20gdGhlIHNldCBvZiBjYW5kaWRhdGVzLCBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIGFsbG93IHVzZXJzXHJcbiAgICAgIC8vIHRvIHBsYWNlIHRoaW5ncyB0aGVyZS5cclxuICAgICAgdmFsaWRNYXNzUG9zaXRpb25zLnNwbGljZSggTlVNX1NOQVBfVE9fUE9TSVRJT05TIC8gMiwgMSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBjYW5kaWRhdGVPcGVuUG9zaXRpb25zID0gW107XHJcblxyXG4gICAgdmFsaWRNYXNzUG9zaXRpb25zLmZvckVhY2goIHZhbGlkUG9zaXRpb24gPT4ge1xyXG4gICAgICBsZXQgb2NjdXBpZWRPclRvb0ZhciA9IGZhbHNlO1xyXG4gICAgICBpZiAoIE1hdGguYWJzKCB2YWxpZFBvc2l0aW9uLnggLSBwb3NpdGlvbi54ICkgPiBJTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSAqIDIgKSB7XHJcbiAgICAgICAgb2NjdXBpZWRPclRvb0ZhciA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tYXNzZXNPblN1cmZhY2UubGVuZ3RoICYmICFvY2N1cGllZE9yVG9vRmFyOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm1hc3Nlc09uU3VyZmFjZS5nZXQoIGkgKS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB2YWxpZFBvc2l0aW9uICkgPCBJTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSAvIDEwICkge1xyXG4gICAgICAgICAgb2NjdXBpZWRPclRvb0ZhciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggIW9jY3VwaWVkT3JUb29GYXIgKSB7XHJcbiAgICAgICAgY2FuZGlkYXRlT3BlblBvc2l0aW9ucy5wdXNoKCB2YWxpZFBvc2l0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTb3J0IHRocm91Z2ggdGhlIHBvc2l0aW9ucyBhbmQgZWxpbWluYXRlIHRob3NlIHRoYXQgYXJlIGFscmVhZHkgb2NjdXBpZWQgb3IgdG9vIGZhciBhd2F5LlxyXG4gICAgY29uc3QgY29weU9mQ2FuZGlkYXRlUG9zaXRpb25zID0gY2FuZGlkYXRlT3BlblBvc2l0aW9ucy5zbGljZSggMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29weU9mQ2FuZGlkYXRlUG9zaXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm1hc3Nlc09uU3VyZmFjZS5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICBpZiAoIHRoaXMubWFzc2VzT25TdXJmYWNlLmdldCggaiApLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIGNvcHlPZkNhbmRpZGF0ZVBvc2l0aW9uc1sgaSBdICkgPCBJTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSAvIDEwICkge1xyXG4gICAgICAgICAgLy8gVGhpcyBwb3NpdGlvbiBpcyBhbHJlYWR5IG9jY3VwaWVkLlxyXG4gICAgICAgICAgY2FuZGlkYXRlT3BlblBvc2l0aW9ucyA9IF8ud2l0aG91dCggY2FuZGlkYXRlT3BlblBvc2l0aW9ucywgdGhpcy5tYXNzZXNPblN1cmZhY2VbIGogXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbmQgdGhlIGNsb3Nlc3Qgb2YgdGhlIG9wZW4gcG9zaXRpb25zLlxyXG4gICAgY2FuZGlkYXRlT3BlblBvc2l0aW9ucy5mb3JFYWNoKCBjYW5kaWRhdGVPcGVuUG9zaXRpb24gPT4ge1xyXG5cclxuICAgICAgLy8gTXVzdCBiZSBhIHJlYXNvbmFibGUgZGlzdGFuY2UgYXdheSBpbiB0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24gc28gdGhhdCBvYmplY3RzIGRvbid0IGFwcGVhciB0byBmYWxsIHNpZGV3YXlzLlxyXG4gICAgICBpZiAoIE1hdGguYWJzKCBjYW5kaWRhdGVPcGVuUG9zaXRpb24ueCAtIHBvc2l0aW9uLnggKSA8PSBJTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSApIHtcclxuICAgICAgICAvLyBUaGlzIHBvc2l0aW9uIGlzIGEgcG90ZW50aWFsIGNhbmRpZGF0ZS4gIElzIGl0IGJldHRlciB0aGFuIHdoYXQgd2FzIGFscmVhZHkgZm91bmQ/XHJcbiAgICAgICAgaWYgKCBjbG9zZXN0T3BlblBvc2l0aW9uID09PSBudWxsIHx8IGNhbmRpZGF0ZU9wZW5Qb3NpdGlvbi5kaXN0YW5jZSggcG9zaXRpb24gKSA8IGNsb3Nlc3RPcGVuUG9zaXRpb24uZGlzdGFuY2UoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICBjbG9zZXN0T3BlblBvc2l0aW9uID0gY2FuZGlkYXRlT3BlblBvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGNsb3Nlc3RPcGVuUG9zaXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3JjZSB0aGUgcGxhbmsgYmFjayB0byB0aGUgbGV2ZWwgcG9zaXRpb24uICBUaGlzIGlzIGdlbmVyYWxseSBkb25lIHdoZW4gdGhlIHR3byBzdXBwb3J0IGNvbHVtbnMgYXJlIHB1dCBpbnRvXHJcbiAgICogcGxhY2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBmb3JjZVRvTGV2ZWxBbmRTdGlsbCgpIHtcclxuICAgIHRoaXMuZm9yY2VBbmdsZSggMC4wICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3JjZSB0aGUgcGxhbmsgdG8gdGhlIG1heCB0aWx0ZWQgcG9zaXRpb24uICBUaGlzIGlzIGdlbmVyYWxseSBkb25lIHdoZW4gdGhlIHNpbmdsZSBiaWcgc3VwcG9ydCBjb2x1bW4gaXMgcHV0IGludG9cclxuICAgKiBwbGFjZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGZvcmNlVG9NYXhBbmRTdGlsbCgpIHtcclxuICAgIHRoaXMuZm9yY2VBbmdsZSggdGhpcy5tYXhUaWx0QW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZm9yY2VBbmdsZSggYW5nbGUgKSB7XHJcbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IDA7XHJcbiAgICB0aGlzLnRpbHRBbmdsZVByb3BlcnR5LnNldCggYW5nbGUgKTtcclxuICAgIHRoaXMudXBkYXRlUGxhbmsoKTtcclxuICAgIHRoaXMudXBkYXRlTWFzc1Bvc2l0aW9ucygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT2J0YWluIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiAoaW4gbWV0ZXJzKSBvZiB0aGUgY2VudGVyIHN1cmZhY2UgKHRvcCkgb2YgdGhlIHBsYW5rXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFBsYW5rU3VyZmFjZUNlbnRlcigpIHtcclxuXHJcbiAgICAvLyBTdGFydCBhdCB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIGF0dGFjaG1lbnQgcG9pbnQsIGFuZCBhZGQgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIHBsYW5rLFxyXG4gICAgLy8gYWNjb3VudGluZyBmb3IgaXRzIHJvdGF0aW9uIGFuZ2xlLlxyXG4gICAgcmV0dXJuIHRoaXMuYm90dG9tQ2VudGVyUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5wbHVzKFxyXG4gICAgICBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBQTEFOS19USElDS05FU1MsIHRoaXMudGlsdEFuZ2xlUHJvcGVydHkuZ2V0KCkgKyBNYXRoLlBJIC8gMiApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT2J0YWluIHRoZSBZIHZhbHVlIGZvciB0aGUgc3VyZmFjZSBvZiB0aGUgcGxhbmsgZm9yIHRoZSBzcGVjaWZpZWQgWCB2YWx1ZS4gIERvZXMgbm90IGNoZWNrIGZvciB2YWxpZCB4IHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4VmFsdWVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0U3VyZmFjZVlWYWx1ZSggeFZhbHVlICkge1xyXG5cclxuICAgIC8vIFNvbHZlIHRoZSBsaW5lYXIgZXF1YXRpb24gZm9yIHRoZSBsaW5lIHRoYXQgcmVwcmVzZW50cyB0aGUgc3VyZmFjZSBvZiB0aGUgcGxhbmsuXHJcbiAgICBjb25zdCBtID0gTWF0aC50YW4oIHRoaXMudGlsdEFuZ2xlUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIGNvbnN0IHBsYW5rU3VyZmFjZUNlbnRlciA9IHRoaXMuZ2V0UGxhbmtTdXJmYWNlQ2VudGVyKCk7XHJcbiAgICBjb25zdCBiID0gcGxhbmtTdXJmYWNlQ2VudGVyLnkgLSBtICogcGxhbmtTdXJmYWNlQ2VudGVyLng7XHJcbiAgICAvLyBEb2VzIE5PVCBjaGVjayBpZiB0aGUgeFZhbHVlIHJhbmdlIGlzIHZhbGlkLlxyXG4gICAgcmV0dXJuIG0gKiB4VmFsdWUgKyBiO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpc1BvaW50QWJvdmVQbGFuayggcCApIHtcclxuICAgIGNvbnN0IHBsYW5rU3BhbiA9IFBMQU5LX0xFTkdUSCAqIE1hdGguY29zKCB0aGlzLnRpbHRBbmdsZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICBjb25zdCBzdXJmYWNlQ2VudGVyID0gdGhpcy5nZXRQbGFua1N1cmZhY2VDZW50ZXIoKTtcclxuICAgIHJldHVybiBwLnggPj0gc3VyZmFjZUNlbnRlci54IC0gKCBwbGFua1NwYW4gLyAyICkgJiYgcC54IDw9IHN1cmZhY2VDZW50ZXIueCArICggcGxhbmtTcGFuIC8gMiApICYmIHAueSA+IHRoaXMuZ2V0U3VyZmFjZVlWYWx1ZSggcC54ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG1hc3NlcyBhbmQgZGlzdGFuY2VzIG9uIHRoZSBwbGFuayB3b3JrIG91dCBzdWNoIHRoYXQgdGhlIHBsYW5rIGlzIGJhbGFuY2VkLCBldmVuIGlmIGl0IGlzIG5vdFxyXG4gICAqIHlldCBpbiB0aGUgbGV2ZWwgcG9zaXRpb24uIFRoaXMgZG9lcyBOT1QgcGF5IGF0dGVudGlvbiB0byBzdXBwb3J0IGNvbHVtbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzQmFsYW5jZWQoKSB7XHJcbiAgICBsZXQgdW5Db21wZW5zYXRlZFRvcnF1ZSA9IDA7XHJcbiAgICB0aGlzLm1hc3Nlc09uU3VyZmFjZS5mb3JFYWNoKCBtYXNzID0+IHtcclxuICAgICAgdW5Db21wZW5zYXRlZFRvcnF1ZSArPSBtYXNzLm1hc3NWYWx1ZSAqIHRoaXMuZ2V0TWFzc0Rpc3RhbmNlRnJvbUNlbnRlciggbWFzcyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFjY291bnQgZm9yIGZsb2F0aW5nIHBvaW50IGVycm9yLCBqdXN0IG1ha2Ugc3VyZSBpdCBpcyBjbG9zZSBlbm91Z2guXHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIHVuQ29tcGVuc2F0ZWRUb3JxdWUgKSA8IEJBU2hhcmVkQ29uc3RhbnRzLkNPTVBBUklTT05fVE9MRVJBTkNFO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVOZXRUb3JxdWUoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnROZXRUb3JxdWUgPSAwO1xyXG4gICAgaWYgKCB0aGlzLmNvbHVtblN0YXRlLnZhbHVlID09PSBDb2x1bW5TdGF0ZS5OT19DT0xVTU5TICkge1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSB0b3JxdWUgZHVlIHRvIHRoZSBtYXNzZXMgb24gdGhlIHN1cmZhY2Ugb2YgdGhlIHBsYW5rLlxyXG4gICAgICB0aGlzLmN1cnJlbnROZXRUb3JxdWUgKz0gdGhpcy5nZXRUb3JxdWVEdWVUb01hc3NlcygpO1xyXG5cclxuICAgICAgLy8gQWRkIGluIHRvcnF1ZSBkdWUgdG8gcGxhbmsuXHJcbiAgICAgIHRoaXMuY3VycmVudE5ldFRvcnF1ZSArPSAoIHRoaXMucGl2b3RQb2ludC54IC0gdGhpcy5ib3R0b21DZW50ZXJQb3NpdGlvblByb3BlcnR5LmdldCgpLnggKSAqIFBMQU5LX01BU1M7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUb3JxdWVEdWVUb01hc3NlcygpIHtcclxuICAgIGxldCB0b3JxdWUgPSAwO1xyXG4gICAgdGhpcy5tYXNzZXNPblN1cmZhY2UuZm9yRWFjaCggbWFzcyA9PiB7XHJcbiAgICAgIHRvcnF1ZSArPSB0aGlzLnBpdm90UG9pbnQueCAtIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICogbWFzcy5tYXNzVmFsdWU7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gdG9ycXVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJbXX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldFNuYXBUb1Bvc2l0aW9ucygpIHtcclxuICAgIGNvbnN0IHNuYXBUb1Bvc2l0aW9ucyA9IG5ldyBBcnJheSggTlVNX1NOQVBfVE9fUE9TSVRJT05TICk7XHJcbiAgICBjb25zdCByb3RhdGlvblRyYW5zZm9ybSA9IE1hdHJpeDMucm90YXRpb25Bcm91bmQoXHJcbiAgICAgIHRoaXMudGlsdEFuZ2xlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIHRoaXMucGl2b3RQb2ludC54LFxyXG4gICAgICB0aGlzLnBpdm90UG9pbnQueVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHVucm90YXRlZFkgPSB0aGlzLnVucm90YXRlZFNoYXBlLmJvdW5kcy5tYXhZO1xyXG4gICAgY29uc3QgdW5yb3RhdGVkTWluWCA9IHRoaXMudW5yb3RhdGVkU2hhcGUuYm91bmRzLm1pblg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOVU1fU05BUF9UT19QT1NJVElPTlM7IGkrKyApIHtcclxuICAgICAgY29uc3QgdW5yb3RhdGVkUG9pbnQgPSBuZXcgVmVjdG9yMiggdW5yb3RhdGVkTWluWCArICggaSArIDEgKSAqIElOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFLCB1bnJvdGF0ZWRZICk7XHJcbiAgICAgIHNuYXBUb1Bvc2l0aW9uc1sgaSBdID0gcm90YXRpb25UcmFuc2Zvcm0udGltZXNWZWN0b3IyKCB1bnJvdGF0ZWRQb2ludCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzbmFwVG9Qb3NpdGlvbnM7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzdGF0aWMgY29uc3RhbnRzXHJcblBsYW5rLkxFTkdUSCA9IFBMQU5LX0xFTkdUSDtcclxuUGxhbmsuVEhJQ0tORVNTID0gUExBTktfVEhJQ0tORVNTO1xyXG5QbGFuay5JTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSA9IElOVEVSX1NOQVBfVE9fTUFSS0VSX0RJU1RBTkNFO1xyXG5QbGFuay5OVU1fU05BUF9UT19QT1NJVElPTlMgPSBOVU1fU05BUF9UT19QT1NJVElPTlM7XHJcblBsYW5rLk1BWF9WQUxJRF9NQVNTX0RJU1RBTkNFX0ZST01fQ0VOVEVSID0gKCBOVU1fU05BUF9UT19QT1NJVElPTlMgLSAxICkgKiBJTlRFUl9TTkFQX1RPX01BUktFUl9ESVNUQU5DRSAvIDI7XHJcblxyXG5QbGFuay5QbGFua0lPID0gbmV3IElPVHlwZSggJ1BsYW5rSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBQbGFuayxcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgbWFzc0Rpc3RhbmNlUGFpcnM6IEFycmF5SU8oIE9iamVjdExpdGVyYWxJTyApIC8vIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JhbGFuY2luZy1hY3QvaXNzdWVzLzEzMCBtb3JlIHNwZWNpZmljIHNjaGVtYVxyXG4gIH0sXHJcbiAgdG9TdGF0ZU9iamVjdDogcGxhbmsgPT4gcGxhbmsudG9TdGF0ZU9iamVjdCgpXHJcbn0gKTtcclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ1BsYW5rJywgUGxhbmsgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYW5rO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSx3Q0FBd0M7QUFDNUQsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9D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