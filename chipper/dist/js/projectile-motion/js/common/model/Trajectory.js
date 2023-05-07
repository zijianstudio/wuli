// Copyright 2016-2023, University of Colorado Boulder

/**
 * Model of a trajectory.
 * One trajectory can have multiple projectiles on its path.
 * Air resistance and altitude can immediately change the path of the projectiles in the air.
 * Velocity, angle, mass, diameter, dragcoefficient only affect the next projectile fired.
 * Units are meters, kilograms, and seconds (mks)
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import projectileMotion from '../../projectileMotion.js';
import DataPoint from './DataPoint.js';
import ProjectileObjectType from './ProjectileObjectType.js';
class Trajectory extends PhetioObject {
  // the type of projectile being launched
  // mass of projectiles in kilograms
  // diameter of projectiles in meters
  // drag coefficient of the projectiles
  // launch speed of the projectiles
  // initial height of the projectiles
  // cannon launch angle
  // world gravity
  // air density
  // the number of projectiles that are currently in flight
  // emitter to update the ranks of the trajectories
  // contains reference to the apex point, or null if apex point doesn't exist/has been recorded
  // the maximum height reached by the projectile
  // the horizontal displacement of the projectile from its launch point
  // the horizontal displacement of the projectile from its launch point
  // the callback from the common Target to check and return if the projectile hit the target
  // whether the projectile has hit the target
  // accessor for DataProbe component

  constructor(projectileObjectType, projectileMass, projectileDiameter, projectileDragCoefficient, initialSpeed, initialHeight, initialAngle, airDensityProperty, gravityProperty, updateTrajectoryRanksEmitter, numberOfMovingProjectilesProperty, checkIfHitTarget, getDataProbe, providedOptions) {
    const options = optionize()({
      tandem: Tandem.REQUIRED,
      phetioDynamicElement: true,
      phetioType: Trajectory.TrajectoryIO
    }, providedOptions);
    super(options);
    this.projectileObjectType = projectileObjectType;
    this.mass = projectileMass;
    this.diameter = projectileDiameter;
    this.dragCoefficient = projectileDragCoefficient;
    this.initialSpeed = initialSpeed;
    this.initialHeight = initialHeight;
    this.initialAngle = initialAngle;
    this.gravityProperty = gravityProperty;
    this.airDensityProperty = airDensityProperty;
    this.numberOfMovingProjectilesProperty = numberOfMovingProjectilesProperty;
    this.numberOfMovingProjectilesProperty.value++;
    this.updateTrajectoryRanksEmitter = updateTrajectoryRanksEmitter;
    this.apexPoint = null;
    this.maxHeight = this.initialHeight;
    this.horizontalDisplacement = 0;
    this.flightTime = 0;
    this.checkIfHitTarget = checkIfHitTarget;
    this.hasHitTarget = false;
    this.getDataProbe = getDataProbe;
    this.rankProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('rankProperty'),
      phetioDocumentation: `${'The count of how old this projectile trajectory is. Older trajectories have more ' + 'opacity until they are subsequently removed. The most recent trajectory fired has rank 0. ' + 'The second most recent has rank 1.'}`,
      phetioReadOnly: true
    });

    // did the trajectory path change in midair due to air density change
    this.changedInMidAir = false;

    // record points along the trajectory with critical information
    this.dataPoints = createObservableArray({
      phetioType: createObservableArray.ObservableArrayIO(DataPoint.DataPointIO),
      tandem: options.tandem.createTandem('dataPoints'),
      phetioDocumentation: 'An ordered list of all data points taken on this trajectory. The earliest data point ' + 'will be first'
    });

    // set by TrajectoryIO.js
    this.reachedGround = false;

    // Add one to the rank
    const incrementRank = () => this.rankProperty.value++;

    // Listen to whether this rank should be incremented
    this.updateTrajectoryRanksEmitter.addListener(incrementRank);

    // Set the initial velocity based on the initial speed and angle
    const velocity = Vector2.pool.fetch().setPolar(this.initialSpeed, this.initialAngle * Math.PI / 180);
    const dragForce = this.dragForceForVelocity(velocity);
    const acceleration = this.accelerationForDragForce(dragForce);
    const initialPoint = new DataPoint(0, Vector2.pool.create(0, this.initialHeight), this.airDensityProperty.value, velocity, acceleration, dragForce, this.gravityForce());
    this.addDataPoint(initialPoint);

    // The "projectile object" is really just what data point the projectile is currently at.
    this.projectileDataPointProperty = new Property(initialPoint, {
      phetioValueType: DataPoint.DataPointIO
    });
    this.trajectoryLandedEmitter = new Emitter({
      tandem: options.tandem.createTandem('trajectoryLandedEmitter'),
      parameters: [{
        name: 'trajectory',
        phetioType: Trajectory.TrajectoryIO
      }]
    });
    this.dataPoints.elementAddedEmitter.addListener(addedDataPoint => {
      this.maxHeight = Math.max(addedDataPoint.position.y, this.maxHeight);
      this.horizontalDisplacement = addedDataPoint.position.x;
      this.flightTime = addedDataPoint.time;
      if (addedDataPoint.reachedGround) {
        this.trajectoryLandedEmitter.emit(this);
      }
    });
    this.disposeTrajectory = () => {
      this.apexPoint = null; // remove reference
      this.dataPoints.dispose();
      this.trajectoryLandedEmitter.dispose();
      this.rankProperty.dispose();
      this.updateTrajectoryRanksEmitter.removeListener(incrementRank);
    };
  }
  gravityForce() {
    return -this.gravityProperty.value * this.mass;
  }

  /**
   * @param dragForce - the drag force on the projectile
   */
  accelerationForDragForce(dragForce) {
    return Vector2.pool.fetch().setXY(-dragForce.x / this.mass, -this.gravityProperty.value - dragForce.y / this.mass);
  }

  /**
   * @param velocity - the velocity of the projectile
   */
  dragForceForVelocity(velocity) {
    // cross-sectional area of the projectile
    const area = Math.PI * this.diameter * this.diameter / 4;
    return Vector2.pool.fetch().set(velocity).multiplyScalar(0.5 * this.airDensityProperty.value * area * this.dragCoefficient * velocity.magnitude);
  }
  step(dt) {
    assert && assert(!this.reachedGround, 'Trajectories should not step after reaching ground');
    const previousPoint = this.dataPoints.get(this.dataPoints.length - 1);
    let newY = nextPosition(previousPoint.position.y, previousPoint.velocity.y, previousPoint.acceleration.y, dt);
    if (newY <= 0) {
      newY = 0;
      this.reachedGround = true;
    }
    const cappedDeltaTime = this.reachedGround ? timeToGround(previousPoint) : dt;
    let newX = nextPosition(previousPoint.position.x, previousPoint.velocity.x, previousPoint.acceleration.x, cappedDeltaTime);
    let newVx = previousPoint.velocity.x + previousPoint.acceleration.x * cappedDeltaTime;
    const newVy = previousPoint.velocity.y + previousPoint.acceleration.y * cappedDeltaTime;

    // if drag force reverses the x-velocity in this step, set vx to zero to better approximate reality
    // We do not need to do this adjustment for the y direction because gravity is already resulting in a change in
    // direction, and because our air-resistance model is not 100% accurate already (via linear interpolation).
    if (Math.sign(newVx) !== Math.sign(previousPoint.velocity.x)) {
      const deltaTimeForLargeDragForceX = -1 * previousPoint.velocity.x / previousPoint.acceleration.x;
      newX = nextPosition(previousPoint.position.x, previousPoint.velocity.x, previousPoint.acceleration.x, deltaTimeForLargeDragForceX);
      newVx = 0;
    }
    const newPosition = Vector2.pool.fetch().setXY(newX, newY);
    const newVelocity = Vector2.pool.fetch().setXY(newVx, newVy);
    const newDragForce = this.dragForceForVelocity(newVelocity);
    const newAcceleration = this.accelerationForDragForce(newDragForce);

    //if the apex has been reached
    if (previousPoint.velocity.y > 0 && newVelocity.y < 0) {
      this.handleApex(previousPoint);
    }
    const newPoint = new DataPoint(previousPoint.time + cappedDeltaTime, newPosition, this.airDensityProperty.value, newVelocity, newAcceleration, newDragForce, this.gravityForce(), {
      reachedGround: this.reachedGround
    });
    this.addDataPoint(newPoint);
    this.projectileDataPointProperty.set(newPoint);

    // make sure the data point is created before calling handleLanded and notifying any listeners
    this.reachedGround && this.handleLanded();
  }
  handleLanded() {
    this.trajectoryLandedEmitter.emit(this);
    this.numberOfMovingProjectilesProperty.value--;
    const displacement = this.projectileDataPointProperty.get().position.x;

    // checkIfHitTarget calls back to the target in the common model, where the checking takes place
    this.hasHitTarget = this.checkIfHitTarget(displacement);
  }
  handleApex(previousPoint) {
    // These are all approximations if there is air resistance
    const dtToApex = Math.abs(previousPoint.velocity.y / previousPoint.acceleration.y);
    const apexX = nextPosition(previousPoint.position.x, previousPoint.velocity.x, previousPoint.acceleration.x, dtToApex);
    const apexY = nextPosition(previousPoint.position.y, previousPoint.velocity.y, previousPoint.acceleration.y, dtToApex);
    const apexVelocityX = previousPoint.velocity.x + previousPoint.acceleration.x * dtToApex;
    const apexVelocityY = 0; // by definition this is what makes it the apex
    const apexVelocity = Vector2.pool.fetch().setXY(apexVelocityX, apexVelocityY);
    const apexDragForce = this.dragForceForVelocity(apexVelocity);
    const apexAcceleration = this.accelerationForDragForce(apexDragForce);
    const apexPoint = new DataPoint(previousPoint.time + dtToApex, Vector2.pool.fetch().setXY(apexX, apexY), this.airDensityProperty.value, apexVelocity, apexAcceleration, apexDragForce, this.gravityForce(), {
      apex: true
    });
    assert && assert(this.apexPoint === null, 'already have an apex point');
    this.apexPoint = apexPoint; // save apex point
    this.addDataPoint(apexPoint);
  }
  addDataPoint(dataPoint) {
    this.dataPoints.push(dataPoint);

    // update data probe if apex point is within range
    this.getDataProbe() && this.getDataProbe()?.updateDataIfWithinRange(dataPoint);
  }

  /**
   * Finds the dataPoint in this trajectory with the least euclidian distance to coordinates given,
   * or returns null if this trajectory has no datapoints
   * @param x - coordinate in model
   * @param y - coordinate in model
   */
  getNearestPoint(x, y) {
    if (this.dataPoints.length === 0) {
      return null;
    }

    // First, set the nearest point and corresponding distance to the first datapoint.
    let nearestPoint = this.dataPoints.get(0);
    let minDistance = nearestPoint.position.distanceXY(x, y);

    // Search through datapoints for the smallest distance. If there are two datapoints with equal distance, the one
    // with more time is chosen.
    for (let i = 0; i < this.dataPoints.length; i++) {
      const currentPoint = this.dataPoints.get(i);
      const currentDistance = currentPoint.position.distanceXY(x, y);
      if (currentDistance <= minDistance) {
        nearestPoint = currentPoint;
        minDistance = currentDistance;
      }
    }
    return nearestPoint;
  }

  /**
   * Create a PhetioGroup for the trajectories
   * @param model
   * @param tandem
   */
  static createGroup(model, tandem) {
    const checkIfHitTarget = model.target.checkIfHitTarget.bind(model.target);
    return new PhetioGroup((tandem, projectileObjectType, projectileMass, projectileDiameter, projectileDragCoefficient, initialSpeed, initialHeight, initialAngle) => {
      return new Trajectory(projectileObjectType, projectileMass, projectileDiameter, projectileDragCoefficient, initialSpeed, initialHeight, initialAngle, model.airDensityProperty, model.gravityProperty, model.updateTrajectoryRanksEmitter, model.numberOfMovingProjectilesProperty, checkIfHitTarget, () => {
        return model.dataProbe;
      }, {
        tandem: tandem
      });
    }, [model.selectedProjectileObjectTypeProperty.value, model.projectileMassProperty.value, model.projectileDiameterProperty.value, model.projectileDragCoefficientProperty.value, model.initialSpeedProperty.value, model.cannonHeightProperty.value, model.cannonAngleProperty.value], {
      tandem: tandem,
      phetioType: PhetioGroup.PhetioGroupIO(Trajectory.TrajectoryIO),
      phetioDocumentation: 'The container for any trajectory that is created when a projectile is fired.'
    });
  }

  /**
   * Dispose this Trajectory, for memory management
   */
  dispose() {
    this.disposeTrajectory();
    super.dispose();
  }

  /**
   * Returns a map of state keys and their associated IOTypes, see IOType for details.
   */
  static get STATE_SCHEMA() {
    return {
      mass: NumberIO,
      diameter: NumberIO,
      dragCoefficient: NumberIO,
      changedInMidAir: BooleanIO,
      reachedGround: BooleanIO,
      apexPoint: NullableIO(DataPoint.DataPointIO),
      maxHeight: NumberIO,
      horizontalDisplacement: NumberIO,
      flightTime: NumberIO,
      hasHitTarget: BooleanIO,
      projectileObjectType: ReferenceIO(ProjectileObjectType.ProjectileObjectTypeIO),
      initialSpeed: NumberIO,
      initialHeight: NumberIO,
      initialAngle: NumberIO
    };
  }

  /**
   * @returns map from state object to parameters being passed to createNextElement
   */
  static stateObjectToCreateElementArguments(stateObject) {
    return [ReferenceIO(ProjectileObjectType.ProjectileObjectTypeIO).fromStateObject(stateObject.projectileObjectType), stateObject.mass, stateObject.diameter, stateObject.dragCoefficient, stateObject.initialSpeed, stateObject.initialHeight, stateObject.initialAngle];
  }

  // Name the types needed to serialize each field on the Trajectory so that it can be used in toStateObject, fromStateObject, and applyState.
  static TrajectoryIO = new IOType('TrajectoryIO', {
    valueType: Trajectory,
    documentation: 'A trajectory outlining the projectile\'s path. The following are passed into the state schema:' + '<ul>' + '<li>mass: the mass of the projectile' + '<li>diameter: the diameter of the projectile' + '<li>dragCoefficient: the drag coefficient of the projectile' + '<li>initialSpeed: the initial speed of the projectile' + '<li>initialHeight: the initial height of the projectile' + '<li>initialAngle: the initial angle of the projectile' + '</ul>',
    stateSchema: Trajectory.STATE_SCHEMA,
    stateObjectToCreateElementArguments: s => Trajectory.stateObjectToCreateElementArguments(s)
  });
}

// Calculate the next 1-d position using the basic kinematic function.
const nextPosition = (position, velocity, acceleration, time) => {
  return position + velocity * time + 0.5 * acceleration * time * time;
};
const timeToGround = previousPoint => {
  if (previousPoint.acceleration.y === 0) {
    if (previousPoint.velocity.y === 0) {
      assert && assert(false, 'How did newY reach <=0 if there was no velocity.y?');
      return 0;
    } else {
      return -previousPoint.position.y / previousPoint.velocity.y;
    }
  } else {
    const squareRoot = -Math.sqrt(previousPoint.velocity.y * previousPoint.velocity.y - 2 * previousPoint.acceleration.y * previousPoint.position.y);
    return (squareRoot - previousPoint.velocity.y) / previousPoint.acceleration.y;
  }
};
projectileMotion.register('Trajectory', Trajectory);
export default Trajectory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJQaGV0aW9Hcm91cCIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIkJvb2xlYW5JTyIsIklPVHlwZSIsIk51bGxhYmxlSU8iLCJOdW1iZXJJTyIsIlJlZmVyZW5jZUlPIiwicHJvamVjdGlsZU1vdGlvbiIsIkRhdGFQb2ludCIsIlByb2plY3RpbGVPYmplY3RUeXBlIiwiVHJhamVjdG9yeSIsImNvbnN0cnVjdG9yIiwicHJvamVjdGlsZU9iamVjdFR5cGUiLCJwcm9qZWN0aWxlTWFzcyIsInByb2plY3RpbGVEaWFtZXRlciIsInByb2plY3RpbGVEcmFnQ29lZmZpY2llbnQiLCJpbml0aWFsU3BlZWQiLCJpbml0aWFsSGVpZ2h0IiwiaW5pdGlhbEFuZ2xlIiwiYWlyRGVuc2l0eVByb3BlcnR5IiwiZ3Jhdml0eVByb3BlcnR5IiwidXBkYXRlVHJhamVjdG9yeVJhbmtzRW1pdHRlciIsIm51bWJlck9mTW92aW5nUHJvamVjdGlsZXNQcm9wZXJ0eSIsImNoZWNrSWZIaXRUYXJnZXQiLCJnZXREYXRhUHJvYmUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9EeW5hbWljRWxlbWVudCIsInBoZXRpb1R5cGUiLCJUcmFqZWN0b3J5SU8iLCJtYXNzIiwiZGlhbWV0ZXIiLCJkcmFnQ29lZmZpY2llbnQiLCJ2YWx1ZSIsImFwZXhQb2ludCIsIm1heEhlaWdodCIsImhvcml6b250YWxEaXNwbGFjZW1lbnQiLCJmbGlnaHRUaW1lIiwiaGFzSGl0VGFyZ2V0IiwicmFua1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1JlYWRPbmx5IiwiY2hhbmdlZEluTWlkQWlyIiwiZGF0YVBvaW50cyIsIk9ic2VydmFibGVBcnJheUlPIiwiRGF0YVBvaW50SU8iLCJyZWFjaGVkR3JvdW5kIiwiaW5jcmVtZW50UmFuayIsImFkZExpc3RlbmVyIiwidmVsb2NpdHkiLCJwb29sIiwiZmV0Y2giLCJzZXRQb2xhciIsIk1hdGgiLCJQSSIsImRyYWdGb3JjZSIsImRyYWdGb3JjZUZvclZlbG9jaXR5IiwiYWNjZWxlcmF0aW9uIiwiYWNjZWxlcmF0aW9uRm9yRHJhZ0ZvcmNlIiwiaW5pdGlhbFBvaW50IiwiY3JlYXRlIiwiZ3Jhdml0eUZvcmNlIiwiYWRkRGF0YVBvaW50IiwicHJvamVjdGlsZURhdGFQb2ludFByb3BlcnR5IiwicGhldGlvVmFsdWVUeXBlIiwidHJhamVjdG9yeUxhbmRlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwibmFtZSIsImVsZW1lbnRBZGRlZEVtaXR0ZXIiLCJhZGRlZERhdGFQb2ludCIsIm1heCIsInBvc2l0aW9uIiwieSIsIngiLCJ0aW1lIiwiZW1pdCIsImRpc3Bvc2VUcmFqZWN0b3J5IiwiZGlzcG9zZSIsInJlbW92ZUxpc3RlbmVyIiwic2V0WFkiLCJhcmVhIiwic2V0IiwibXVsdGlwbHlTY2FsYXIiLCJtYWduaXR1ZGUiLCJzdGVwIiwiZHQiLCJhc3NlcnQiLCJwcmV2aW91c1BvaW50IiwiZ2V0IiwibGVuZ3RoIiwibmV3WSIsIm5leHRQb3NpdGlvbiIsImNhcHBlZERlbHRhVGltZSIsInRpbWVUb0dyb3VuZCIsIm5ld1giLCJuZXdWeCIsIm5ld1Z5Iiwic2lnbiIsImRlbHRhVGltZUZvckxhcmdlRHJhZ0ZvcmNlWCIsIm5ld1Bvc2l0aW9uIiwibmV3VmVsb2NpdHkiLCJuZXdEcmFnRm9yY2UiLCJuZXdBY2NlbGVyYXRpb24iLCJoYW5kbGVBcGV4IiwibmV3UG9pbnQiLCJoYW5kbGVMYW5kZWQiLCJkaXNwbGFjZW1lbnQiLCJkdFRvQXBleCIsImFicyIsImFwZXhYIiwiYXBleFkiLCJhcGV4VmVsb2NpdHlYIiwiYXBleFZlbG9jaXR5WSIsImFwZXhWZWxvY2l0eSIsImFwZXhEcmFnRm9yY2UiLCJhcGV4QWNjZWxlcmF0aW9uIiwiYXBleCIsImRhdGFQb2ludCIsInB1c2giLCJ1cGRhdGVEYXRhSWZXaXRoaW5SYW5nZSIsImdldE5lYXJlc3RQb2ludCIsIm5lYXJlc3RQb2ludCIsIm1pbkRpc3RhbmNlIiwiZGlzdGFuY2VYWSIsImkiLCJjdXJyZW50UG9pbnQiLCJjdXJyZW50RGlzdGFuY2UiLCJjcmVhdGVHcm91cCIsIm1vZGVsIiwidGFyZ2V0IiwiYmluZCIsImRhdGFQcm9iZSIsInNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eSIsInByb2plY3RpbGVNYXNzUHJvcGVydHkiLCJwcm9qZWN0aWxlRGlhbWV0ZXJQcm9wZXJ0eSIsInByb2plY3RpbGVEcmFnQ29lZmZpY2llbnRQcm9wZXJ0eSIsImluaXRpYWxTcGVlZFByb3BlcnR5IiwiY2Fubm9uSGVpZ2h0UHJvcGVydHkiLCJjYW5ub25BbmdsZVByb3BlcnR5IiwiUGhldGlvR3JvdXBJTyIsIlNUQVRFX1NDSEVNQSIsIlByb2plY3RpbGVPYmplY3RUeXBlSU8iLCJzdGF0ZU9iamVjdFRvQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyIsInN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0IiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInN0YXRlU2NoZW1hIiwicyIsInNxdWFyZVJvb3QiLCJzcXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUcmFqZWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIGEgdHJhamVjdG9yeS5cclxuICogT25lIHRyYWplY3RvcnkgY2FuIGhhdmUgbXVsdGlwbGUgcHJvamVjdGlsZXMgb24gaXRzIHBhdGguXHJcbiAqIEFpciByZXNpc3RhbmNlIGFuZCBhbHRpdHVkZSBjYW4gaW1tZWRpYXRlbHkgY2hhbmdlIHRoZSBwYXRoIG9mIHRoZSBwcm9qZWN0aWxlcyBpbiB0aGUgYWlyLlxyXG4gKiBWZWxvY2l0eSwgYW5nbGUsIG1hc3MsIGRpYW1ldGVyLCBkcmFnY29lZmZpY2llbnQgb25seSBhZmZlY3QgdGhlIG5leHQgcHJvamVjdGlsZSBmaXJlZC5cclxuICogVW5pdHMgYXJlIG1ldGVycywga2lsb2dyYW1zLCBhbmQgc2Vjb25kcyAobWtzKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJlYSBMaW4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWF0dGhldyBCbGFja21hbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoZXRpb0dyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9Hcm91cC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTywgeyBSZWZlcmVuY2VJT1N0YXRlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IHByb2plY3RpbGVNb3Rpb24gZnJvbSAnLi4vLi4vcHJvamVjdGlsZU1vdGlvbi5qcyc7XHJcbmltcG9ydCBEYXRhUG9pbnQsIHsgRGF0YVBvaW50U3RhdGVPYmplY3QgfSBmcm9tICcuL0RhdGFQb2ludC5qcyc7XHJcbmltcG9ydCBEYXRhUHJvYmUgZnJvbSAnLi9EYXRhUHJvYmUuanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU9iamVjdFR5cGUgZnJvbSAnLi9Qcm9qZWN0aWxlT2JqZWN0VHlwZS5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlTW90aW9uTW9kZWwgZnJvbSAnLi9Qcm9qZWN0aWxlTW90aW9uTW9kZWwuanMnO1xyXG5pbXBvcnQgeyBDb21wb3NpdGVTY2hlbWEgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RhdGVTY2hlbWEuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFRyYWplY3RvcnlPcHRpb25zID0ge1xyXG4gIHRhbmRlbT86IFRhbmRlbTtcclxuICBwaGV0aW9EeW5hbWljRWxlbWVudD86IGJvb2xlYW47XHJcbiAgcGhldGlvVHlwZT86IElPVHlwZTtcclxufTtcclxuXHJcbnR5cGUgTGFuZGVkRW1pdHRlclBhcmFtcyA9IHtcclxuICBuYW1lPzogc3RyaW5nO1xyXG4gIHBoZXRpb1R5cGU/OiBJT1R5cGU7XHJcbn07XHJcblxyXG50eXBlIFRyYWplY3RvcnlTdGF0ZU9iamVjdCA9IHtcclxuICBtYXNzOiBudW1iZXI7XHJcbiAgZGlhbWV0ZXI6IG51bWJlcjtcclxuICBkcmFnQ29lZmZpY2llbnQ6IG51bWJlcjtcclxuICBjaGFuZ2VkSW5NaWRBaXI6IGJvb2xlYW47XHJcbiAgcmVhY2hlZEdyb3VuZDogYm9vbGVhbjtcclxuICBhcGV4UG9pbnQ6IERhdGFQb2ludFN0YXRlT2JqZWN0IHwgbnVsbDtcclxuICBtYXhIZWlnaHQ6IG51bWJlcjtcclxuICBob3Jpem9udGFsRGlzcGxhY2VtZW50OiBudW1iZXI7XHJcbiAgZmxpZ2h0VGltZTogbnVtYmVyO1xyXG4gIGhhc0hpdFRhcmdldDogYm9vbGVhbjtcclxuICBwcm9qZWN0aWxlT2JqZWN0VHlwZTogUmVmZXJlbmNlSU9TdGF0ZTtcclxuICBpbml0aWFsU3BlZWQ6IG51bWJlcjtcclxuICBpbml0aWFsSGVpZ2h0OiBudW1iZXI7XHJcbiAgaW5pdGlhbEFuZ2xlOiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBUcmFqZWN0b3J5R3JvdXBDcmVhdGVFbGVtZW50QXJndW1lbnRzID0gWyBQcm9qZWN0aWxlT2JqZWN0VHlwZSwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdO1xyXG5cclxuY2xhc3MgVHJhamVjdG9yeSBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHByb2plY3RpbGVPYmplY3RUeXBlOiBQcm9qZWN0aWxlT2JqZWN0VHlwZTsgLy8gdGhlIHR5cGUgb2YgcHJvamVjdGlsZSBiZWluZyBsYXVuY2hlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWFzczogbnVtYmVyOyAvLyBtYXNzIG9mIHByb2plY3RpbGVzIGluIGtpbG9ncmFtc1xyXG4gIHB1YmxpYyByZWFkb25seSBkaWFtZXRlcjogbnVtYmVyOyAvLyBkaWFtZXRlciBvZiBwcm9qZWN0aWxlcyBpbiBtZXRlcnNcclxuICBwdWJsaWMgcmVhZG9ubHkgZHJhZ0NvZWZmaWNpZW50OiBudW1iZXI7IC8vIGRyYWcgY29lZmZpY2llbnQgb2YgdGhlIHByb2plY3RpbGVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbml0aWFsU3BlZWQ6IG51bWJlcjsgLy8gbGF1bmNoIHNwZWVkIG9mIHRoZSBwcm9qZWN0aWxlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5pdGlhbEhlaWdodDogbnVtYmVyOyAvLyBpbml0aWFsIGhlaWdodCBvZiB0aGUgcHJvamVjdGlsZXNcclxuICBwcml2YXRlIHJlYWRvbmx5IGluaXRpYWxBbmdsZTogbnVtYmVyOyAvLyBjYW5ub24gbGF1bmNoIGFuZ2xlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBncmF2aXR5UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47IC8vIHdvcmxkIGdyYXZpdHlcclxuICBwcml2YXRlIHJlYWRvbmx5IGFpckRlbnNpdHlQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjsgLy8gYWlyIGRlbnNpdHlcclxuICBwcml2YXRlIG51bWJlck9mTW92aW5nUHJvamVjdGlsZXNQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjsgLy8gdGhlIG51bWJlciBvZiBwcm9qZWN0aWxlcyB0aGF0IGFyZSBjdXJyZW50bHkgaW4gZmxpZ2h0XHJcbiAgcHJpdmF0ZSByZWFkb25seSB1cGRhdGVUcmFqZWN0b3J5UmFua3NFbWl0dGVyOiBFbWl0dGVyOyAvLyBlbWl0dGVyIHRvIHVwZGF0ZSB0aGUgcmFua3Mgb2YgdGhlIHRyYWplY3Rvcmllc1xyXG4gIHB1YmxpYyBhcGV4UG9pbnQ6IERhdGFQb2ludCB8IG51bGw7IC8vIGNvbnRhaW5zIHJlZmVyZW5jZSB0byB0aGUgYXBleCBwb2ludCwgb3IgbnVsbCBpZiBhcGV4IHBvaW50IGRvZXNuJ3QgZXhpc3QvaGFzIGJlZW4gcmVjb3JkZWRcclxuICBwcml2YXRlIG1heEhlaWdodDogbnVtYmVyOyAvLyB0aGUgbWF4aW11bSBoZWlnaHQgcmVhY2hlZCBieSB0aGUgcHJvamVjdGlsZVxyXG4gIHByaXZhdGUgaG9yaXpvbnRhbERpc3BsYWNlbWVudDogbnVtYmVyOyAvLyB0aGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgb2YgdGhlIHByb2plY3RpbGUgZnJvbSBpdHMgbGF1bmNoIHBvaW50XHJcbiAgcHJpdmF0ZSBmbGlnaHRUaW1lOiBudW1iZXI7IC8vIHRoZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBvZiB0aGUgcHJvamVjdGlsZSBmcm9tIGl0cyBsYXVuY2ggcG9pbnRcclxuICBwcml2YXRlIGNoZWNrSWZIaXRUYXJnZXQ6ICggcG9zaXRpb25YOiBudW1iZXIgKSA9PiBib29sZWFuOyAvLyB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgY29tbW9uIFRhcmdldCB0byBjaGVjayBhbmQgcmV0dXJuIGlmIHRoZSBwcm9qZWN0aWxlIGhpdCB0aGUgdGFyZ2V0XHJcbiAgcHVibGljIGhhc0hpdFRhcmdldDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgcHJvamVjdGlsZSBoYXMgaGl0IHRoZSB0YXJnZXRcclxuICBwcml2YXRlIGdldERhdGFQcm9iZTogKCkgPT4gRGF0YVByb2JlIHwgbnVsbDsgLy8gYWNjZXNzb3IgZm9yIERhdGFQcm9iZSBjb21wb25lbnRcclxuICBwdWJsaWMgcmFua1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyBjaGFuZ2VkSW5NaWRBaXI6IGJvb2xlYW47XHJcbiAgcHVibGljIHJlYWRvbmx5IGRhdGFQb2ludHM6IE9ic2VydmFibGVBcnJheTxEYXRhUG9pbnQ+O1xyXG4gIHB1YmxpYyByZWFjaGVkR3JvdW5kOiBib29sZWFuO1xyXG4gIHB1YmxpYyBwcm9qZWN0aWxlRGF0YVBvaW50UHJvcGVydHk6IFByb3BlcnR5PERhdGFQb2ludD47XHJcbiAgcHJpdmF0ZSB0cmFqZWN0b3J5TGFuZGVkRW1pdHRlcjogRW1pdHRlcjxMYW5kZWRFbWl0dGVyUGFyYW1zW10+O1xyXG4gIHByaXZhdGUgZGlzcG9zZVRyYWplY3Rvcnk6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvamVjdGlsZU9iamVjdFR5cGU6IFByb2plY3RpbGVPYmplY3RUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvamVjdGlsZU1hc3M6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RpbGVEaWFtZXRlcjogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvamVjdGlsZURyYWdDb2VmZmljaWVudDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNwZWVkOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsSGVpZ2h0OiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQW5nbGU6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIGFpckRlbnNpdHlQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGdyYXZpdHlQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVRyYWplY3RvcnlSYW5rc0VtaXR0ZXI6IEVtaXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBudW1iZXJPZk1vdmluZ1Byb2plY3RpbGVzUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBjaGVja0lmSGl0VGFyZ2V0OiAoIHBvc2l0aW9uWDogbnVtYmVyICkgPT4gYm9vbGVhbixcclxuICAgICAgICAgICAgICAgICAgICAgIGdldERhdGFQcm9iZTogKCkgPT4gRGF0YVByb2JlIHwgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFRyYWplY3RvcnlPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VHJhamVjdG9yeU9wdGlvbnM+KCkoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlLFxyXG4gICAgICBwaGV0aW9UeXBlOiBUcmFqZWN0b3J5LlRyYWplY3RvcnlJT1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnByb2plY3RpbGVPYmplY3RUeXBlID0gcHJvamVjdGlsZU9iamVjdFR5cGU7XHJcbiAgICB0aGlzLm1hc3MgPSBwcm9qZWN0aWxlTWFzcztcclxuICAgIHRoaXMuZGlhbWV0ZXIgPSBwcm9qZWN0aWxlRGlhbWV0ZXI7XHJcbiAgICB0aGlzLmRyYWdDb2VmZmljaWVudCA9IHByb2plY3RpbGVEcmFnQ29lZmZpY2llbnQ7XHJcbiAgICB0aGlzLmluaXRpYWxTcGVlZCA9IGluaXRpYWxTcGVlZDtcclxuICAgIHRoaXMuaW5pdGlhbEhlaWdodCA9IGluaXRpYWxIZWlnaHQ7XHJcbiAgICB0aGlzLmluaXRpYWxBbmdsZSA9IGluaXRpYWxBbmdsZTtcclxuICAgIHRoaXMuZ3Jhdml0eVByb3BlcnR5ID0gZ3Jhdml0eVByb3BlcnR5O1xyXG4gICAgdGhpcy5haXJEZW5zaXR5UHJvcGVydHkgPSBhaXJEZW5zaXR5UHJvcGVydHk7XHJcbiAgICB0aGlzLm51bWJlck9mTW92aW5nUHJvamVjdGlsZXNQcm9wZXJ0eSA9IG51bWJlck9mTW92aW5nUHJvamVjdGlsZXNQcm9wZXJ0eTtcclxuICAgIHRoaXMubnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5LnZhbHVlKys7XHJcbiAgICB0aGlzLnVwZGF0ZVRyYWplY3RvcnlSYW5rc0VtaXR0ZXIgPSB1cGRhdGVUcmFqZWN0b3J5UmFua3NFbWl0dGVyO1xyXG4gICAgdGhpcy5hcGV4UG9pbnQgPSBudWxsO1xyXG4gICAgdGhpcy5tYXhIZWlnaHQgPSB0aGlzLmluaXRpYWxIZWlnaHQ7XHJcbiAgICB0aGlzLmhvcml6b250YWxEaXNwbGFjZW1lbnQgPSAwO1xyXG4gICAgdGhpcy5mbGlnaHRUaW1lID0gMDtcclxuICAgIHRoaXMuY2hlY2tJZkhpdFRhcmdldCA9IGNoZWNrSWZIaXRUYXJnZXQ7XHJcbiAgICB0aGlzLmhhc0hpdFRhcmdldCA9IGZhbHNlO1xyXG4gICAgdGhpcy5nZXREYXRhUHJvYmUgPSBnZXREYXRhUHJvYmU7XHJcblxyXG4gICAgdGhpcy5yYW5rUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYW5rUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IGAkeydUaGUgY291bnQgb2YgaG93IG9sZCB0aGlzIHByb2plY3RpbGUgdHJhamVjdG9yeSBpcy4gT2xkZXIgdHJhamVjdG9yaWVzIGhhdmUgbW9yZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29wYWNpdHkgdW50aWwgdGhleSBhcmUgc3Vic2VxdWVudGx5IHJlbW92ZWQuIFRoZSBtb3N0IHJlY2VudCB0cmFqZWN0b3J5IGZpcmVkIGhhcyByYW5rIDAuICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVGhlIHNlY29uZCBtb3N0IHJlY2VudCBoYXMgcmFuayAxLid9YCxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBkaWQgdGhlIHRyYWplY3RvcnkgcGF0aCBjaGFuZ2UgaW4gbWlkYWlyIGR1ZSB0byBhaXIgZGVuc2l0eSBjaGFuZ2VcclxuICAgIHRoaXMuY2hhbmdlZEluTWlkQWlyID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcmVjb3JkIHBvaW50cyBhbG9uZyB0aGUgdHJhamVjdG9yeSB3aXRoIGNyaXRpY2FsIGluZm9ybWF0aW9uXHJcbiAgICB0aGlzLmRhdGFQb2ludHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBEYXRhUG9pbnQuRGF0YVBvaW50SU8gKSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkYXRhUG9pbnRzJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQW4gb3JkZXJlZCBsaXN0IG9mIGFsbCBkYXRhIHBvaW50cyB0YWtlbiBvbiB0aGlzIHRyYWplY3RvcnkuIFRoZSBlYXJsaWVzdCBkYXRhIHBvaW50ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnd2lsbCBiZSBmaXJzdCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzZXQgYnkgVHJhamVjdG9yeUlPLmpzXHJcbiAgICB0aGlzLnJlYWNoZWRHcm91bmQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBBZGQgb25lIHRvIHRoZSByYW5rXHJcbiAgICBjb25zdCBpbmNyZW1lbnRSYW5rID0gKCkgPT4gdGhpcy5yYW5rUHJvcGVydHkudmFsdWUrKztcclxuXHJcbiAgICAvLyBMaXN0ZW4gdG8gd2hldGhlciB0aGlzIHJhbmsgc2hvdWxkIGJlIGluY3JlbWVudGVkXHJcbiAgICB0aGlzLnVwZGF0ZVRyYWplY3RvcnlSYW5rc0VtaXR0ZXIuYWRkTGlzdGVuZXIoIGluY3JlbWVudFJhbmsgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIGluaXRpYWwgdmVsb2NpdHkgYmFzZWQgb24gdGhlIGluaXRpYWwgc3BlZWQgYW5kIGFuZ2xlXHJcbiAgICBjb25zdCB2ZWxvY2l0eSA9IFZlY3RvcjIucG9vbC5mZXRjaCgpLnNldFBvbGFyKCB0aGlzLmluaXRpYWxTcGVlZCwgKCB0aGlzLmluaXRpYWxBbmdsZSAqIE1hdGguUEkgKSAvIDE4MCApO1xyXG5cclxuICAgIGNvbnN0IGRyYWdGb3JjZSA9IHRoaXMuZHJhZ0ZvcmNlRm9yVmVsb2NpdHkoIHZlbG9jaXR5ICk7XHJcbiAgICBjb25zdCBhY2NlbGVyYXRpb24gPSB0aGlzLmFjY2VsZXJhdGlvbkZvckRyYWdGb3JjZSggZHJhZ0ZvcmNlICk7XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbFBvaW50ID0gbmV3IERhdGFQb2ludCggMCwgVmVjdG9yMi5wb29sLmNyZWF0ZSggMCwgdGhpcy5pbml0aWFsSGVpZ2h0ICksIHRoaXMuYWlyRGVuc2l0eVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICB2ZWxvY2l0eSwgYWNjZWxlcmF0aW9uLCBkcmFnRm9yY2UsIHRoaXMuZ3Jhdml0eUZvcmNlKCkgKTtcclxuXHJcbiAgICB0aGlzLmFkZERhdGFQb2ludCggaW5pdGlhbFBvaW50ICk7XHJcblxyXG4gICAgLy8gVGhlIFwicHJvamVjdGlsZSBvYmplY3RcIiBpcyByZWFsbHkganVzdCB3aGF0IGRhdGEgcG9pbnQgdGhlIHByb2plY3RpbGUgaXMgY3VycmVudGx5IGF0LlxyXG4gICAgdGhpcy5wcm9qZWN0aWxlRGF0YVBvaW50UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGluaXRpYWxQb2ludCwgeyBwaGV0aW9WYWx1ZVR5cGU6IERhdGFQb2ludC5EYXRhUG9pbnRJTyB9ICk7XHJcblxyXG4gICAgdGhpcy50cmFqZWN0b3J5TGFuZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndHJhamVjdG9yeUxhbmRlZEVtaXR0ZXInICksXHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBuYW1lOiAndHJhamVjdG9yeScsIHBoZXRpb1R5cGU6IFRyYWplY3RvcnkuVHJhamVjdG9yeUlPIH0gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGF0YVBvaW50cy5lbGVtZW50QWRkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBhZGRlZERhdGFQb2ludCA9PiB7XHJcbiAgICAgIHRoaXMubWF4SGVpZ2h0ID0gTWF0aC5tYXgoIGFkZGVkRGF0YVBvaW50LnBvc2l0aW9uLnksIHRoaXMubWF4SGVpZ2h0ICk7XHJcbiAgICAgIHRoaXMuaG9yaXpvbnRhbERpc3BsYWNlbWVudCA9IGFkZGVkRGF0YVBvaW50LnBvc2l0aW9uLng7XHJcbiAgICAgIHRoaXMuZmxpZ2h0VGltZSA9IGFkZGVkRGF0YVBvaW50LnRpbWU7XHJcblxyXG4gICAgICBpZiAoIGFkZGVkRGF0YVBvaW50LnJlYWNoZWRHcm91bmQgKSB7XHJcbiAgICAgICAgdGhpcy50cmFqZWN0b3J5TGFuZGVkRW1pdHRlci5lbWl0KCB0aGlzICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VUcmFqZWN0b3J5ID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmFwZXhQb2ludCA9IG51bGw7IC8vIHJlbW92ZSByZWZlcmVuY2VcclxuICAgICAgdGhpcy5kYXRhUG9pbnRzLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy50cmFqZWN0b3J5TGFuZGVkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMucmFua1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy51cGRhdGVUcmFqZWN0b3J5UmFua3NFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBpbmNyZW1lbnRSYW5rICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBncmF2aXR5Rm9yY2UoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiAtdGhpcy5ncmF2aXR5UHJvcGVydHkudmFsdWUgKiB0aGlzLm1hc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZHJhZ0ZvcmNlIC0gdGhlIGRyYWcgZm9yY2Ugb24gdGhlIHByb2plY3RpbGVcclxuICAgKi9cclxuICBwcml2YXRlIGFjY2VsZXJhdGlvbkZvckRyYWdGb3JjZSggZHJhZ0ZvcmNlOiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIFZlY3RvcjIucG9vbC5mZXRjaCgpLnNldFhZKCAtZHJhZ0ZvcmNlLnggLyB0aGlzLm1hc3MsIC10aGlzLmdyYXZpdHlQcm9wZXJ0eS52YWx1ZSAtIGRyYWdGb3JjZS55IC8gdGhpcy5tYXNzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdmVsb2NpdHkgLSB0aGUgdmVsb2NpdHkgb2YgdGhlIHByb2plY3RpbGVcclxuICAgKi9cclxuICBwcml2YXRlIGRyYWdGb3JjZUZvclZlbG9jaXR5KCB2ZWxvY2l0eTogVmVjdG9yMiApOiBWZWN0b3IyIHtcclxuICAgIC8vIGNyb3NzLXNlY3Rpb25hbCBhcmVhIG9mIHRoZSBwcm9qZWN0aWxlXHJcbiAgICBjb25zdCBhcmVhID0gKCBNYXRoLlBJICogdGhpcy5kaWFtZXRlciAqIHRoaXMuZGlhbWV0ZXIgKSAvIDQ7XHJcbiAgICByZXR1cm4gVmVjdG9yMi5wb29sLmZldGNoKCkuc2V0KCB2ZWxvY2l0eSApLm11bHRpcGx5U2NhbGFyKFxyXG4gICAgICAwLjUgKiB0aGlzLmFpckRlbnNpdHlQcm9wZXJ0eS52YWx1ZSAqIGFyZWEgKiB0aGlzLmRyYWdDb2VmZmljaWVudCAqIHZlbG9jaXR5Lm1hZ25pdHVkZVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucmVhY2hlZEdyb3VuZCwgJ1RyYWplY3RvcmllcyBzaG91bGQgbm90IHN0ZXAgYWZ0ZXIgcmVhY2hpbmcgZ3JvdW5kJyApO1xyXG5cclxuICAgIGNvbnN0IHByZXZpb3VzUG9pbnQgPSB0aGlzLmRhdGFQb2ludHMuZ2V0KCB0aGlzLmRhdGFQb2ludHMubGVuZ3RoIC0gMSApO1xyXG5cclxuICAgIGxldCBuZXdZID0gbmV4dFBvc2l0aW9uKCBwcmV2aW91c1BvaW50LnBvc2l0aW9uLnksIHByZXZpb3VzUG9pbnQudmVsb2NpdHkueSwgcHJldmlvdXNQb2ludC5hY2NlbGVyYXRpb24ueSwgZHQgKTtcclxuXHJcbiAgICBpZiAoIG5ld1kgPD0gMCApIHtcclxuICAgICAgbmV3WSA9IDA7XHJcbiAgICAgIHRoaXMucmVhY2hlZEdyb3VuZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FwcGVkRGVsdGFUaW1lID0gdGhpcy5yZWFjaGVkR3JvdW5kID8gdGltZVRvR3JvdW5kKCBwcmV2aW91c1BvaW50ICkgOiBkdDtcclxuXHJcbiAgICBsZXQgbmV3WCA9IG5leHRQb3NpdGlvbiggcHJldmlvdXNQb2ludC5wb3NpdGlvbi54LCBwcmV2aW91c1BvaW50LnZlbG9jaXR5LngsIHByZXZpb3VzUG9pbnQuYWNjZWxlcmF0aW9uLngsIGNhcHBlZERlbHRhVGltZSApO1xyXG4gICAgbGV0IG5ld1Z4ID0gcHJldmlvdXNQb2ludC52ZWxvY2l0eS54ICsgcHJldmlvdXNQb2ludC5hY2NlbGVyYXRpb24ueCAqIGNhcHBlZERlbHRhVGltZTtcclxuICAgIGNvbnN0IG5ld1Z5ID0gcHJldmlvdXNQb2ludC52ZWxvY2l0eS55ICsgcHJldmlvdXNQb2ludC5hY2NlbGVyYXRpb24ueSAqIGNhcHBlZERlbHRhVGltZTtcclxuXHJcbiAgICAvLyBpZiBkcmFnIGZvcmNlIHJldmVyc2VzIHRoZSB4LXZlbG9jaXR5IGluIHRoaXMgc3RlcCwgc2V0IHZ4IHRvIHplcm8gdG8gYmV0dGVyIGFwcHJveGltYXRlIHJlYWxpdHlcclxuICAgIC8vIFdlIGRvIG5vdCBuZWVkIHRvIGRvIHRoaXMgYWRqdXN0bWVudCBmb3IgdGhlIHkgZGlyZWN0aW9uIGJlY2F1c2UgZ3Jhdml0eSBpcyBhbHJlYWR5IHJlc3VsdGluZyBpbiBhIGNoYW5nZSBpblxyXG4gICAgLy8gZGlyZWN0aW9uLCBhbmQgYmVjYXVzZSBvdXIgYWlyLXJlc2lzdGFuY2UgbW9kZWwgaXMgbm90IDEwMCUgYWNjdXJhdGUgYWxyZWFkeSAodmlhIGxpbmVhciBpbnRlcnBvbGF0aW9uKS5cclxuICAgIGlmICggTWF0aC5zaWduKCBuZXdWeCApICE9PSBNYXRoLnNpZ24oIHByZXZpb3VzUG9pbnQudmVsb2NpdHkueCApICkge1xyXG4gICAgICBjb25zdCBkZWx0YVRpbWVGb3JMYXJnZURyYWdGb3JjZVggPSAtMSAqIHByZXZpb3VzUG9pbnQudmVsb2NpdHkueCAvIHByZXZpb3VzUG9pbnQuYWNjZWxlcmF0aW9uLng7XHJcbiAgICAgIG5ld1ggPSBuZXh0UG9zaXRpb24oIHByZXZpb3VzUG9pbnQucG9zaXRpb24ueCwgcHJldmlvdXNQb2ludC52ZWxvY2l0eS54LCBwcmV2aW91c1BvaW50LmFjY2VsZXJhdGlvbi54LCBkZWx0YVRpbWVGb3JMYXJnZURyYWdGb3JjZVggKTtcclxuICAgICAgbmV3VnggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gVmVjdG9yMi5wb29sLmZldGNoKCkuc2V0WFkoIG5ld1gsIG5ld1kgKTtcclxuICAgIGNvbnN0IG5ld1ZlbG9jaXR5ID0gVmVjdG9yMi5wb29sLmZldGNoKCkuc2V0WFkoIG5ld1Z4LCBuZXdWeSApO1xyXG4gICAgY29uc3QgbmV3RHJhZ0ZvcmNlID0gdGhpcy5kcmFnRm9yY2VGb3JWZWxvY2l0eSggbmV3VmVsb2NpdHkgKTtcclxuICAgIGNvbnN0IG5ld0FjY2VsZXJhdGlvbiA9IHRoaXMuYWNjZWxlcmF0aW9uRm9yRHJhZ0ZvcmNlKCBuZXdEcmFnRm9yY2UgKTtcclxuXHJcbiAgICAvL2lmIHRoZSBhcGV4IGhhcyBiZWVuIHJlYWNoZWRcclxuICAgIGlmICggcHJldmlvdXNQb2ludC52ZWxvY2l0eS55ID4gMCAmJiBuZXdWZWxvY2l0eS55IDwgMCApIHtcclxuICAgICAgdGhpcy5oYW5kbGVBcGV4KCBwcmV2aW91c1BvaW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBuZXcgRGF0YVBvaW50KCBwcmV2aW91c1BvaW50LnRpbWUgKyBjYXBwZWREZWx0YVRpbWUsIG5ld1Bvc2l0aW9uLCB0aGlzLmFpckRlbnNpdHlQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgbmV3VmVsb2NpdHksIG5ld0FjY2VsZXJhdGlvbiwgbmV3RHJhZ0ZvcmNlLCB0aGlzLmdyYXZpdHlGb3JjZSgpLCB7IHJlYWNoZWRHcm91bmQ6IHRoaXMucmVhY2hlZEdyb3VuZCB9XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWRkRGF0YVBvaW50KCBuZXdQb2ludCApO1xyXG4gICAgdGhpcy5wcm9qZWN0aWxlRGF0YVBvaW50UHJvcGVydHkuc2V0KCBuZXdQb2ludCApO1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB0aGUgZGF0YSBwb2ludCBpcyBjcmVhdGVkIGJlZm9yZSBjYWxsaW5nIGhhbmRsZUxhbmRlZCBhbmQgbm90aWZ5aW5nIGFueSBsaXN0ZW5lcnNcclxuICAgIHRoaXMucmVhY2hlZEdyb3VuZCAmJiB0aGlzLmhhbmRsZUxhbmRlZCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVMYW5kZWQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnRyYWplY3RvcnlMYW5kZWRFbWl0dGVyLmVtaXQoIHRoaXMgKTtcclxuICAgIHRoaXMubnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5LnZhbHVlLS07XHJcbiAgICBjb25zdCBkaXNwbGFjZW1lbnQgPSB0aGlzLnByb2plY3RpbGVEYXRhUG9pbnRQcm9wZXJ0eS5nZXQoKS5wb3NpdGlvbi54O1xyXG5cclxuICAgIC8vIGNoZWNrSWZIaXRUYXJnZXQgY2FsbHMgYmFjayB0byB0aGUgdGFyZ2V0IGluIHRoZSBjb21tb24gbW9kZWwsIHdoZXJlIHRoZSBjaGVja2luZyB0YWtlcyBwbGFjZVxyXG4gICAgdGhpcy5oYXNIaXRUYXJnZXQgPSB0aGlzLmNoZWNrSWZIaXRUYXJnZXQoIGRpc3BsYWNlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVBcGV4KCBwcmV2aW91c1BvaW50OiBEYXRhUG9pbnQgKTogdm9pZCB7XHJcbiAgICAvLyBUaGVzZSBhcmUgYWxsIGFwcHJveGltYXRpb25zIGlmIHRoZXJlIGlzIGFpciByZXNpc3RhbmNlXHJcbiAgICBjb25zdCBkdFRvQXBleCA9IE1hdGguYWJzKCBwcmV2aW91c1BvaW50LnZlbG9jaXR5LnkgLyBwcmV2aW91c1BvaW50LmFjY2VsZXJhdGlvbi55ICk7XHJcbiAgICBjb25zdCBhcGV4WCA9IG5leHRQb3NpdGlvbiggcHJldmlvdXNQb2ludC5wb3NpdGlvbi54LCBwcmV2aW91c1BvaW50LnZlbG9jaXR5LngsIHByZXZpb3VzUG9pbnQuYWNjZWxlcmF0aW9uLngsIGR0VG9BcGV4ICk7XHJcbiAgICBjb25zdCBhcGV4WSA9IG5leHRQb3NpdGlvbiggcHJldmlvdXNQb2ludC5wb3NpdGlvbi55LCBwcmV2aW91c1BvaW50LnZlbG9jaXR5LnksIHByZXZpb3VzUG9pbnQuYWNjZWxlcmF0aW9uLnksIGR0VG9BcGV4ICk7XHJcblxyXG4gICAgY29uc3QgYXBleFZlbG9jaXR5WCA9IHByZXZpb3VzUG9pbnQudmVsb2NpdHkueCArIHByZXZpb3VzUG9pbnQuYWNjZWxlcmF0aW9uLnggKiBkdFRvQXBleDtcclxuICAgIGNvbnN0IGFwZXhWZWxvY2l0eVkgPSAwOyAvLyBieSBkZWZpbml0aW9uIHRoaXMgaXMgd2hhdCBtYWtlcyBpdCB0aGUgYXBleFxyXG4gICAgY29uc3QgYXBleFZlbG9jaXR5ID0gVmVjdG9yMi5wb29sLmZldGNoKCkuc2V0WFkoIGFwZXhWZWxvY2l0eVgsIGFwZXhWZWxvY2l0eVkgKTtcclxuXHJcbiAgICBjb25zdCBhcGV4RHJhZ0ZvcmNlID0gdGhpcy5kcmFnRm9yY2VGb3JWZWxvY2l0eSggYXBleFZlbG9jaXR5ICk7XHJcbiAgICBjb25zdCBhcGV4QWNjZWxlcmF0aW9uID0gdGhpcy5hY2NlbGVyYXRpb25Gb3JEcmFnRm9yY2UoIGFwZXhEcmFnRm9yY2UgKTtcclxuXHJcbiAgICBjb25zdCBhcGV4UG9pbnQgPSBuZXcgRGF0YVBvaW50KCBwcmV2aW91c1BvaW50LnRpbWUgKyBkdFRvQXBleCwgVmVjdG9yMi5wb29sLmZldGNoKCkuc2V0WFkoIGFwZXhYLCBhcGV4WSApLFxyXG4gICAgICB0aGlzLmFpckRlbnNpdHlQcm9wZXJ0eS52YWx1ZSwgYXBleFZlbG9jaXR5LCBhcGV4QWNjZWxlcmF0aW9uLCBhcGV4RHJhZ0ZvcmNlLCB0aGlzLmdyYXZpdHlGb3JjZSgpLFxyXG4gICAgICB7IGFwZXg6IHRydWUgfVxyXG4gICAgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmFwZXhQb2ludCA9PT0gbnVsbCwgJ2FscmVhZHkgaGF2ZSBhbiBhcGV4IHBvaW50JyApO1xyXG4gICAgdGhpcy5hcGV4UG9pbnQgPSBhcGV4UG9pbnQ7IC8vIHNhdmUgYXBleCBwb2ludFxyXG4gICAgdGhpcy5hZGREYXRhUG9pbnQoIGFwZXhQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhZGREYXRhUG9pbnQoIGRhdGFQb2ludDogRGF0YVBvaW50ICk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhUG9pbnRzLnB1c2goIGRhdGFQb2ludCApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBkYXRhIHByb2JlIGlmIGFwZXggcG9pbnQgaXMgd2l0aGluIHJhbmdlXHJcbiAgICB0aGlzLmdldERhdGFQcm9iZSgpICYmIHRoaXMuZ2V0RGF0YVByb2JlKCk/LnVwZGF0ZURhdGFJZldpdGhpblJhbmdlKCBkYXRhUG9pbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBkYXRhUG9pbnQgaW4gdGhpcyB0cmFqZWN0b3J5IHdpdGggdGhlIGxlYXN0IGV1Y2xpZGlhbiBkaXN0YW5jZSB0byBjb29yZGluYXRlcyBnaXZlbixcclxuICAgKiBvciByZXR1cm5zIG51bGwgaWYgdGhpcyB0cmFqZWN0b3J5IGhhcyBubyBkYXRhcG9pbnRzXHJcbiAgICogQHBhcmFtIHggLSBjb29yZGluYXRlIGluIG1vZGVsXHJcbiAgICogQHBhcmFtIHkgLSBjb29yZGluYXRlIGluIG1vZGVsXHJcbiAgICovXHJcbiAgcHVibGljIGdldE5lYXJlc3RQb2ludCggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogRGF0YVBvaW50IHwgbnVsbCB7XHJcbiAgICBpZiAoIHRoaXMuZGF0YVBvaW50cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpcnN0LCBzZXQgdGhlIG5lYXJlc3QgcG9pbnQgYW5kIGNvcnJlc3BvbmRpbmcgZGlzdGFuY2UgdG8gdGhlIGZpcnN0IGRhdGFwb2ludC5cclxuICAgIGxldCBuZWFyZXN0UG9pbnQgPSB0aGlzLmRhdGFQb2ludHMuZ2V0KCAwICk7XHJcbiAgICBsZXQgbWluRGlzdGFuY2UgPSBuZWFyZXN0UG9pbnQucG9zaXRpb24uZGlzdGFuY2VYWSggeCwgeSApO1xyXG5cclxuICAgIC8vIFNlYXJjaCB0aHJvdWdoIGRhdGFwb2ludHMgZm9yIHRoZSBzbWFsbGVzdCBkaXN0YW5jZS4gSWYgdGhlcmUgYXJlIHR3byBkYXRhcG9pbnRzIHdpdGggZXF1YWwgZGlzdGFuY2UsIHRoZSBvbmVcclxuICAgIC8vIHdpdGggbW9yZSB0aW1lIGlzIGNob3Nlbi5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZGF0YVBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY3VycmVudFBvaW50ID0gdGhpcy5kYXRhUG9pbnRzLmdldCggaSApO1xyXG4gICAgICBjb25zdCBjdXJyZW50RGlzdGFuY2UgPSBjdXJyZW50UG9pbnQucG9zaXRpb24uZGlzdGFuY2VYWSggeCwgeSApO1xyXG5cclxuICAgICAgaWYgKCBjdXJyZW50RGlzdGFuY2UgPD0gbWluRGlzdGFuY2UgKSB7XHJcbiAgICAgICAgbmVhcmVzdFBvaW50ID0gY3VycmVudFBvaW50O1xyXG4gICAgICAgIG1pbkRpc3RhbmNlID0gY3VycmVudERpc3RhbmNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmVhcmVzdFBvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgUGhldGlvR3JvdXAgZm9yIHRoZSB0cmFqZWN0b3JpZXNcclxuICAgKiBAcGFyYW0gbW9kZWxcclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVHcm91cCggbW9kZWw6IFByb2plY3RpbGVNb3Rpb25Nb2RlbCwgdGFuZGVtOiBUYW5kZW0gKTogUGhldGlvR3JvdXA8VHJhamVjdG9yeSwgVHJhamVjdG9yeUdyb3VwQ3JlYXRlRWxlbWVudEFyZ3VtZW50cz4ge1xyXG4gICAgY29uc3QgY2hlY2tJZkhpdFRhcmdldCA9IG1vZGVsLnRhcmdldC5jaGVja0lmSGl0VGFyZ2V0LmJpbmQoIG1vZGVsLnRhcmdldCApO1xyXG5cclxuICAgIHJldHVybiBuZXcgUGhldGlvR3JvdXA8VHJhamVjdG9yeSwgVHJhamVjdG9yeUdyb3VwQ3JlYXRlRWxlbWVudEFyZ3VtZW50cz4oXHJcbiAgICAgICggdGFuZGVtLCBwcm9qZWN0aWxlT2JqZWN0VHlwZSwgcHJvamVjdGlsZU1hc3MsIHByb2plY3RpbGVEaWFtZXRlciwgcHJvamVjdGlsZURyYWdDb2VmZmljaWVudCxcclxuICAgICAgICBpbml0aWFsU3BlZWQsIGluaXRpYWxIZWlnaHQsIGluaXRpYWxBbmdsZSApID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYWplY3RvcnkoIHByb2plY3RpbGVPYmplY3RUeXBlLCBwcm9qZWN0aWxlTWFzcywgcHJvamVjdGlsZURpYW1ldGVyLCBwcm9qZWN0aWxlRHJhZ0NvZWZmaWNpZW50LFxyXG4gICAgICAgICAgaW5pdGlhbFNwZWVkLCBpbml0aWFsSGVpZ2h0LCBpbml0aWFsQW5nbGUsIG1vZGVsLmFpckRlbnNpdHlQcm9wZXJ0eSwgbW9kZWwuZ3Jhdml0eVByb3BlcnR5LFxyXG4gICAgICAgICAgbW9kZWwudXBkYXRlVHJhamVjdG9yeVJhbmtzRW1pdHRlciwgbW9kZWwubnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5LCBjaGVja0lmSGl0VGFyZ2V0LFxyXG4gICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZGF0YVByb2JlO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgdGFuZGVtOiB0YW5kZW0gfSApO1xyXG4gICAgICB9LFxyXG4gICAgICBbIG1vZGVsLnNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICBtb2RlbC5wcm9qZWN0aWxlTWFzc1Byb3BlcnR5LnZhbHVlLCBtb2RlbC5wcm9qZWN0aWxlRGlhbWV0ZXJQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICBtb2RlbC5wcm9qZWN0aWxlRHJhZ0NvZWZmaWNpZW50UHJvcGVydHkudmFsdWUsIG1vZGVsLmluaXRpYWxTcGVlZFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgIG1vZGVsLmNhbm5vbkhlaWdodFByb3BlcnR5LnZhbHVlLCBtb2RlbC5jYW5ub25BbmdsZVByb3BlcnR5LnZhbHVlIF0sXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBUcmFqZWN0b3J5LlRyYWplY3RvcnlJTyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgY29udGFpbmVyIGZvciBhbnkgdHJhamVjdG9yeSB0aGF0IGlzIGNyZWF0ZWQgd2hlbiBhIHByb2plY3RpbGUgaXMgZmlyZWQuJ1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZSB0aGlzIFRyYWplY3RvcnksIGZvciBtZW1vcnkgbWFuYWdlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlVHJhamVjdG9yeSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG1hcCBvZiBzdGF0ZSBrZXlzIGFuZCB0aGVpciBhc3NvY2lhdGVkIElPVHlwZXMsIHNlZSBJT1R5cGUgZm9yIGRldGFpbHMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXQgU1RBVEVfU0NIRU1BKCk6IENvbXBvc2l0ZVNjaGVtYSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBtYXNzOiBOdW1iZXJJTyxcclxuICAgICAgZGlhbWV0ZXI6IE51bWJlcklPLFxyXG4gICAgICBkcmFnQ29lZmZpY2llbnQ6IE51bWJlcklPLFxyXG4gICAgICBjaGFuZ2VkSW5NaWRBaXI6IEJvb2xlYW5JTyxcclxuICAgICAgcmVhY2hlZEdyb3VuZDogQm9vbGVhbklPLFxyXG4gICAgICBhcGV4UG9pbnQ6IE51bGxhYmxlSU8oIERhdGFQb2ludC5EYXRhUG9pbnRJTyApLFxyXG4gICAgICBtYXhIZWlnaHQ6IE51bWJlcklPLFxyXG4gICAgICBob3Jpem9udGFsRGlzcGxhY2VtZW50OiBOdW1iZXJJTyxcclxuICAgICAgZmxpZ2h0VGltZTogTnVtYmVySU8sXHJcbiAgICAgIGhhc0hpdFRhcmdldDogQm9vbGVhbklPLFxyXG4gICAgICBwcm9qZWN0aWxlT2JqZWN0VHlwZTogUmVmZXJlbmNlSU8oXHJcbiAgICAgICAgUHJvamVjdGlsZU9iamVjdFR5cGUuUHJvamVjdGlsZU9iamVjdFR5cGVJT1xyXG4gICAgICApLFxyXG4gICAgICBpbml0aWFsU3BlZWQ6IE51bWJlcklPLFxyXG4gICAgICBpbml0aWFsSGVpZ2h0OiBOdW1iZXJJTyxcclxuICAgICAgaW5pdGlhbEFuZ2xlOiBOdW1iZXJJT1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIG1hcCBmcm9tIHN0YXRlIG9iamVjdCB0byBwYXJhbWV0ZXJzIGJlaW5nIHBhc3NlZCB0byBjcmVhdGVOZXh0RWxlbWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHMoIHN0YXRlT2JqZWN0OiBUcmFqZWN0b3J5U3RhdGVPYmplY3QgKTogVHJhamVjdG9yeUdyb3VwQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICBSZWZlcmVuY2VJTyggUHJvamVjdGlsZU9iamVjdFR5cGUuUHJvamVjdGlsZU9iamVjdFR5cGVJTyApLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QucHJvamVjdGlsZU9iamVjdFR5cGUgKSxcclxuICAgICAgc3RhdGVPYmplY3QubWFzcyxcclxuICAgICAgc3RhdGVPYmplY3QuZGlhbWV0ZXIsXHJcbiAgICAgIHN0YXRlT2JqZWN0LmRyYWdDb2VmZmljaWVudCxcclxuICAgICAgc3RhdGVPYmplY3QuaW5pdGlhbFNwZWVkLFxyXG4gICAgICBzdGF0ZU9iamVjdC5pbml0aWFsSGVpZ2h0LFxyXG4gICAgICBzdGF0ZU9iamVjdC5pbml0aWFsQW5nbGVcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvLyBOYW1lIHRoZSB0eXBlcyBuZWVkZWQgdG8gc2VyaWFsaXplIGVhY2ggZmllbGQgb24gdGhlIFRyYWplY3Rvcnkgc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiB0b1N0YXRlT2JqZWN0LCBmcm9tU3RhdGVPYmplY3QsIGFuZCBhcHBseVN0YXRlLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVHJhamVjdG9yeUlPID0gbmV3IElPVHlwZSggJ1RyYWplY3RvcnlJTycsIHtcclxuICAgIHZhbHVlVHlwZTogVHJhamVjdG9yeSxcclxuXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnQSB0cmFqZWN0b3J5IG91dGxpbmluZyB0aGUgcHJvamVjdGlsZVxcJ3MgcGF0aC4gVGhlIGZvbGxvd2luZyBhcmUgcGFzc2VkIGludG8gdGhlIHN0YXRlIHNjaGVtYTonICtcclxuICAgICAgICAgICAgICAgICAgICc8dWw+JyArXHJcbiAgICAgICAgICAgICAgICAgICAnPGxpPm1hc3M6IHRoZSBtYXNzIG9mIHRoZSBwcm9qZWN0aWxlJyArXHJcbiAgICAgICAgICAgICAgICAgICAnPGxpPmRpYW1ldGVyOiB0aGUgZGlhbWV0ZXIgb2YgdGhlIHByb2plY3RpbGUnICtcclxuICAgICAgICAgICAgICAgICAgICc8bGk+ZHJhZ0NvZWZmaWNpZW50OiB0aGUgZHJhZyBjb2VmZmljaWVudCBvZiB0aGUgcHJvamVjdGlsZScgK1xyXG4gICAgICAgICAgICAgICAgICAgJzxsaT5pbml0aWFsU3BlZWQ6IHRoZSBpbml0aWFsIHNwZWVkIG9mIHRoZSBwcm9qZWN0aWxlJyArXHJcbiAgICAgICAgICAgICAgICAgICAnPGxpPmluaXRpYWxIZWlnaHQ6IHRoZSBpbml0aWFsIGhlaWdodCBvZiB0aGUgcHJvamVjdGlsZScgK1xyXG4gICAgICAgICAgICAgICAgICAgJzxsaT5pbml0aWFsQW5nbGU6IHRoZSBpbml0aWFsIGFuZ2xlIG9mIHRoZSBwcm9qZWN0aWxlJyArXHJcbiAgICAgICAgICAgICAgICAgICAnPC91bD4nLFxyXG4gICAgc3RhdGVTY2hlbWE6IFRyYWplY3RvcnkuU1RBVEVfU0NIRU1BLFxyXG4gICAgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHM6IHMgPT4gVHJhamVjdG9yeS5zdGF0ZU9iamVjdFRvQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyggcyApXHJcbiAgfSApO1xyXG59XHJcblxyXG4vLyBDYWxjdWxhdGUgdGhlIG5leHQgMS1kIHBvc2l0aW9uIHVzaW5nIHRoZSBiYXNpYyBraW5lbWF0aWMgZnVuY3Rpb24uXHJcbmNvbnN0IG5leHRQb3NpdGlvbiA9ICggcG9zaXRpb246IG51bWJlciwgdmVsb2NpdHk6IG51bWJlciwgYWNjZWxlcmF0aW9uOiBudW1iZXIsIHRpbWU6IG51bWJlciApID0+IHtcclxuICByZXR1cm4gcG9zaXRpb24gKyB2ZWxvY2l0eSAqIHRpbWUgKyAwLjUgKiBhY2NlbGVyYXRpb24gKiB0aW1lICogdGltZTtcclxufTtcclxuXHJcbmNvbnN0IHRpbWVUb0dyb3VuZCA9ICggcHJldmlvdXNQb2ludDogRGF0YVBvaW50ICk6IG51bWJlciA9PiB7XHJcbiAgaWYgKCBwcmV2aW91c1BvaW50LmFjY2VsZXJhdGlvbi55ID09PSAwICkge1xyXG4gICAgaWYgKCBwcmV2aW91c1BvaW50LnZlbG9jaXR5LnkgPT09IDAgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnSG93IGRpZCBuZXdZIHJlYWNoIDw9MCBpZiB0aGVyZSB3YXMgbm8gdmVsb2NpdHkueT8nICk7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAtcHJldmlvdXNQb2ludC5wb3NpdGlvbi55IC8gcHJldmlvdXNQb2ludC52ZWxvY2l0eS55O1xyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGNvbnN0IHNxdWFyZVJvb3QgPSAtTWF0aC5zcXJ0KCBwcmV2aW91c1BvaW50LnZlbG9jaXR5LnkgKiBwcmV2aW91c1BvaW50LnZlbG9jaXR5LnkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIgKiBwcmV2aW91c1BvaW50LmFjY2VsZXJhdGlvbi55ICogcHJldmlvdXNQb2ludC5wb3NpdGlvbi55ICk7XHJcbiAgICByZXR1cm4gKCBzcXVhcmVSb290IC0gcHJldmlvdXNQb2ludC52ZWxvY2l0eS55ICkgLyBwcmV2aW91c1BvaW50LmFjY2VsZXJhdGlvbi55O1xyXG4gIH1cclxufTtcclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdUcmFqZWN0b3J5JywgVHJhamVjdG9yeSApO1xyXG5leHBvcnQgZGVmYXVsdCBUcmFqZWN0b3J5O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtB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