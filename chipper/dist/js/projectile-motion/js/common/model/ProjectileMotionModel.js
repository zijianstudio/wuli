// Copyright 2016-2023, University of Colorado Boulder

/**
 * Common model (base type) for Projectile Motion.
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import VarianceNumberProperty from '../../../../axon/js/VarianceNumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhysicalConstants from '../../../../phet-core/js/PhysicalConstants.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionConstants from '../ProjectileMotionConstants.js';
import StatUtils from '../StatUtils.js';
import DataProbe from './DataProbe.js';
import ProjectileMotionMeasuringTape from './ProjectileMotionMeasuringTape.js';
import ProjectileObjectType from './ProjectileObjectType.js';
import Target from './Target.js';
import Trajectory from './Trajectory.js';

// constants
const MIN_ZOOM = ProjectileMotionConstants.MIN_ZOOM;
const MAX_ZOOM = ProjectileMotionConstants.MAX_ZOOM;
const DEFAULT_ZOOM = ProjectileMotionConstants.DEFAULT_ZOOM;
const TIME_PER_DATA_POINT = ProjectileMotionConstants.TIME_PER_DATA_POINT; // ms

class ProjectileMotionModel {
  // emits when cannon needs to update its muzzle flash animation

  // a group of trajectories, limited to this.maxProjectiles

  /**
   * @param defaultProjectileObjectType -  default object type for the model
   * @param defaultAirResistanceOn -  default air resistance on value
   * @param possibleObjectTypes - a list of the possible ProjectileObjectTypes for the model
   */
  constructor(defaultProjectileObjectType, defaultAirResistanceOn, possibleObjectTypes, tandem, providedOptions) {
    const options = optionize()({
      maxProjectiles: ProjectileMotionConstants.MAX_NUMBER_OF_TRAJECTORIES,
      defaultCannonHeight: 0,
      defaultCannonAngle: 80,
      defaultInitialSpeed: 18,
      defaultSpeedStandardDeviation: 0,
      defaultAngleStandardDeviation: 0,
      targetX: ProjectileMotionConstants.TARGET_X_DEFAULT,
      phetioInstrumentAltitudeProperty: true
    }, providedOptions);
    this.maxProjectiles = options.maxProjectiles;
    this.target = new Target(options.targetX, tandem.createTandem('target'));
    this.measuringTape = new ProjectileMotionMeasuringTape(tandem.createTandem('measuringTape'));
    this.cannonHeightProperty = new NumberProperty(options.defaultCannonHeight, {
      tandem: tandem.createTandem('cannonHeightProperty'),
      phetioDocumentation: 'Height of the cannon',
      units: 'm',
      range: ProjectileMotionConstants.CANNON_HEIGHT_RANGE
    });
    this.initialSpeedStandardDeviationProperty = new NumberProperty(options.defaultSpeedStandardDeviation, {
      tandem: tandem.createTandem('initialSpeedStandardDeviationProperty'),
      phetioDocumentation: 'The standard deviation of the launch speed',
      units: 'm/s',
      range: new Range(0, 10)
    });
    this.initialSpeedProperty = new VarianceNumberProperty(options.defaultInitialSpeed, value => {
      return StatUtils.randomFromNormal(value, this.initialSpeedStandardDeviationProperty.value);
    }, {
      tandem: tandem.createTandem('initialSpeedProperty'),
      phetioDocumentation: 'The speed on launch',
      units: 'm/s',
      range: ProjectileMotionConstants.LAUNCH_VELOCITY_RANGE
    });
    this.initialAngleStandardDeviationProperty = new NumberProperty(options.defaultAngleStandardDeviation, {
      tandem: tandem.createTandem('initialAngleStandardDeviationProperty'),
      phetioDocumentation: 'The standard deviation of the launch angle',
      units: '\u00B0',
      // degrees
      range: new Range(0, 30)
    });
    this.cannonAngleProperty = new VarianceNumberProperty(options.defaultCannonAngle, value => {
      return StatUtils.randomFromNormal(value, this.initialAngleStandardDeviationProperty.value);
    }, {
      tandem: tandem.createTandem('cannonAngleProperty'),
      phetioDocumentation: 'Angle of the cannon',
      units: '\u00B0',
      // degrees
      range: ProjectileMotionConstants.CANNON_ANGLE_RANGE
    });
    this.projectileMassProperty = new NumberProperty(defaultProjectileObjectType.mass, {
      tandem: tandem.createTandem('projectileMassProperty'),
      phetioDocumentation: 'Mass of the projectile',
      units: 'kg',
      range: ProjectileMotionConstants.PROJECTILE_MASS_RANGE
    });
    this.projectileDiameterProperty = new NumberProperty(defaultProjectileObjectType.diameter, {
      tandem: tandem.createTandem('projectileDiameterProperty'),
      phetioDocumentation: 'Diameter of the projectile',
      units: 'm',
      range: ProjectileMotionConstants.PROJECTILE_DIAMETER_RANGE
    });
    this.projectileDragCoefficientProperty = new NumberProperty(defaultProjectileObjectType.dragCoefficient, {
      tandem: tandem.createTandem('projectileDragCoefficientProperty'),
      phetioDocumentation: 'Drag coefficient of the projectile, unitless as it is a coefficient',
      range: ProjectileMotionConstants.PROJECTILE_DRAG_COEFFICIENT_RANGE
    });
    this.selectedProjectileObjectTypeProperty = new Property(defaultProjectileObjectType, {
      tandem: tandem.createTandem('selectedProjectileObjectTypeProperty'),
      phetioDocumentation: 'The currently selected projectile object type',
      phetioValueType: ReferenceIO(ProjectileObjectType.ProjectileObjectTypeIO),
      validValues: possibleObjectTypes
    });
    this.gravityProperty = new NumberProperty(PhysicalConstants.GRAVITY_ON_EARTH, {
      tandem: tandem.createTandem('gravityProperty'),
      phetioDocumentation: 'Acceleration due to gravity',
      units: 'm/s^2'
    });
    this.altitudeProperty = new NumberProperty(0, {
      tandem: options.phetioInstrumentAltitudeProperty ? tandem.createTandem('altitudeProperty') : Tandem.OPT_OUT,
      phetioDocumentation: 'Altitude of the environment',
      range: ProjectileMotionConstants.ALTITUDE_RANGE,
      units: 'm'
    });
    this.airResistanceOnProperty = new BooleanProperty(defaultAirResistanceOn, {
      tandem: tandem.createTandem('airResistanceOnProperty'),
      phetioDocumentation: 'Whether air resistance is on'
    });
    this.airDensityProperty = new DerivedProperty([this.altitudeProperty, this.airResistanceOnProperty], calculateAirDensity, {
      tandem: tandem.createTandem('airDensityProperty'),
      units: 'kg/m^3',
      phetioDocumentation: 'air density, depends on altitude and whether air resistance is on',
      phetioValueType: NumberIO
    });
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW],
      tandem: tandem.createTandem('timeSpeedProperty'),
      phetioDocumentation: 'Speed of animation, either normal or slow.'
    });
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty'),
      phetioDocumentation: 'whether animation is playing (as opposed to paused)'
    });
    this.davidHeight = 2; // meters
    this.davidPosition = new Vector2(7, 0); // meters

    this.numberOfMovingProjectilesProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('numberOfMovingProjectilesProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'number of projectiles that are still moving'
    });
    this.rapidFireModeProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('rapidFireModeProperty'),
      phetioDocumentation: 'Is the stats screen in rapid-fire mode?'
    });
    this.fireEnabledProperty = new DerivedProperty([this.numberOfMovingProjectilesProperty, this.rapidFireModeProperty], (numMoving, rapidFireMode) => !rapidFireMode && numMoving < this.maxProjectiles, {
      tandem: tandem.createTandem('fireEnabledProperty'),
      phetioDocumentation: `The fire button is only enabled if there are less than ${this.maxProjectiles} projectiles in the air.`,
      phetioValueType: BooleanIO
    });
    this.updateTrajectoryRanksEmitter = new Emitter();
    this.eventTimer = new EventTimer(new EventTimer.ConstantEventModel(1000 / TIME_PER_DATA_POINT), this.stepModelElements.bind(this, TIME_PER_DATA_POINT / 1000));
    this.muzzleFlashStepper = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });
    this.zoomProperty = new NumberProperty(DEFAULT_ZOOM, {
      tandem: tandem.createTandem('zoomProperty'),
      range: new Range(MIN_ZOOM, MAX_ZOOM),
      phetioDocumentation: 'Used to adjust to visual zoom for this screen. Each new zoom level increases the value by a factor of 2.',
      phetioReadOnly: true
    });

    // Create this after model properties to support the PhetioGroup creating the prototype immediately
    this.trajectoryGroup = Trajectory.createGroup(this, tandem.createTandem('trajectoryGroup'));
    this.dataProbe = new DataProbe(this.trajectoryGroup, 10, 10, this.zoomProperty, tandem.createTandem('dataProbe')); // position arbitrary

    // Links in this constructor last for the lifetime of the sim, so no need to dispose

    // if any of the global Properties change, update the status of moving projectiles
    this.airDensityProperty.link(() => {
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.markMovingTrajectoriesChangedMidAir();
      }
    });
    this.gravityProperty.link(() => {
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.markMovingTrajectoriesChangedMidAir();
      }
    });
    this.selectedProjectileObjectTypeProperty.link(selectedProjectileObjectType => {
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.setProjectileParameters(selectedProjectileObjectType);
      }
    });
  }
  reset() {
    // disposes all trajectories and resets number of moving projectiles Property
    this.eraseTrajectories();
    this.target.reset();
    this.measuringTape.reset();
    this.dataProbe.reset();
    this.zoomProperty.reset();
    this.cannonHeightProperty.reset();
    this.cannonAngleProperty.reset();
    this.initialAngleStandardDeviationProperty.reset();
    this.initialSpeedProperty.reset();
    this.initialSpeedStandardDeviationProperty.reset();
    this.selectedProjectileObjectTypeProperty.reset();
    this.projectileMassProperty.reset();
    this.projectileDiameterProperty.reset();
    this.projectileDragCoefficientProperty.reset();
    this.gravityProperty.reset();
    this.altitudeProperty.reset();
    this.airResistanceOnProperty.reset();
    this.timeSpeedProperty.reset();
    this.isPlayingProperty.reset();
    this.rapidFireModeProperty.reset();
    this.muzzleFlashStepper.emit(0);
  }
  step(dt) {
    if (this.isPlayingProperty.value) {
      this.eventTimer.step((this.timeSpeedProperty.value === TimeSpeed.SLOW ? 0.33 : 1) * dt);
    }
  }

  // Steps model elements given a time step, used by the step button
  stepModelElements(dt) {
    for (let i = 0; i < this.trajectoryGroup.count; i++) {
      const trajectory = this.trajectoryGroup.getElement(i);
      if (!trajectory.reachedGround) {
        trajectory.step(dt);
      }
    }
    this.muzzleFlashStepper.emit(dt);
  }

  // Remove and dispose old trajectories that are over the limit from the observable array
  limitTrajectories() {
    // create a temporary array to hold all trajectories to be disposed, to avoid array mutation of trajectoryGroup while looping
    const trajectoriesToDispose = [];
    const numTrajectoriesToDispose = this.trajectoryGroup.count - this.maxProjectiles;
    if (numTrajectoriesToDispose > 0) {
      for (let i = 0; i < this.trajectoryGroup.count; i++) {
        const trajectory = this.trajectoryGroup.getElement(i);
        if (trajectory.reachedGround) {
          trajectoriesToDispose.push(trajectory);
          if (trajectoriesToDispose.length >= numTrajectoriesToDispose) {
            break;
          }
        }
      }
      trajectoriesToDispose.forEach(t => this.trajectoryGroup.disposeElement(t));
    }
  }

  // Removes all trajectories and resets corresponding Properties
  eraseTrajectories() {
    this.trajectoryGroup.clear();
    this.numberOfMovingProjectilesProperty.reset();
  }

  /**
   * @param numProjectiles - the number of simultaneous projectiles to fire
   */
  fireNumProjectiles(numProjectiles) {
    for (let i = 0; i < numProjectiles; i++) {
      const initialSpeed = this.initialSpeedProperty.getRandomizedValue();
      const initialAngle = this.cannonAngleProperty.getRandomizedValue();
      this.trajectoryGroup.createNextElement(this.selectedProjectileObjectTypeProperty.value, this.projectileMassProperty.value, this.projectileDiameterProperty.value, this.projectileDragCoefficientProperty.value, initialSpeed, this.cannonHeightProperty.value, initialAngle);
      this.updateTrajectoryRanksEmitter.emit(); // increment rank of all trajectories
    }

    this.limitTrajectories();
  }

  // Set changedInMidAir to true for trajectories with currently moving projectiles
  markMovingTrajectoriesChangedMidAir() {
    let trajectory;
    for (let j = 0; j < this.trajectoryGroup.count; j++) {
      trajectory = this.trajectoryGroup.getElement(j);

      // Trajectory has not reached ground
      if (!trajectory.changedInMidAir && !trajectory.reachedGround) {
        trajectory.changedInMidAir = true;
      }
    }
  }

  /**
   * Set mass, diameter, and drag coefficient based on the currently selected projectile object type
   * @param selectedProjectileObjectType - contains information such as mass, diameter, etc.
   */
  setProjectileParameters(selectedProjectileObjectType) {
    this.projectileMassProperty.set(selectedProjectileObjectType.mass);
    this.projectileDiameterProperty.set(selectedProjectileObjectType.diameter);
    this.projectileDragCoefficientProperty.set(selectedProjectileObjectType.dragCoefficient);
  }
}

/**
 * @param altitude - in meters
 * @param airResistanceOn - if off, zero air density
 */
const calculateAirDensity = (altitude, airResistanceOn) => {
  // Atmospheric model algorithm is taken from https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html
  // Checked the values at http://www.engineeringtoolbox.com/standard-atmosphere-d_604.html

  if (airResistanceOn) {
    let temperature;
    let pressure;

    // The sim doesn't go beyond 5000, rendering the elses unnecessary, but keeping if others would like to
    // increase the altitude range.

    if (altitude < 11000) {
      // troposphere
      temperature = 15.04 - 0.00649 * altitude;
      pressure = 101.29 * Math.pow((temperature + 273.1) / 288.08, 5.256);
    } else if (altitude < 25000) {
      // lower stratosphere
      temperature = -56.46;
      pressure = 22.65 * Math.exp(1.73 - 0.000157 * altitude);
    } else {
      // upper stratosphere (altitude >= 25000 meters)
      temperature = -131.21 + 0.00299 * altitude;
      pressure = 2.488 * Math.pow((temperature + 273.1) / 216.6, -11.388);
    }
    return pressure / (0.2869 * (temperature + 273.1));
  } else {
    return 0;
  }
};
projectileMotion.register('ProjectileMotionModel', ProjectileMotionModel);
export default ProjectileMotionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJWYXJpYW5jZU51bWJlclByb3BlcnR5IiwiUmFuZ2UiLCJWZWN0b3IyIiwiRXZlbnRUaW1lciIsIm9wdGlvbml6ZSIsIlBoeXNpY2FsQ29uc3RhbnRzIiwiVGltZVNwZWVkIiwiVGFuZGVtIiwiQm9vbGVhbklPIiwiTnVtYmVySU8iLCJSZWZlcmVuY2VJTyIsInByb2plY3RpbGVNb3Rpb24iLCJQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzIiwiU3RhdFV0aWxzIiwiRGF0YVByb2JlIiwiUHJvamVjdGlsZU1vdGlvbk1lYXN1cmluZ1RhcGUiLCJQcm9qZWN0aWxlT2JqZWN0VHlwZSIsIlRhcmdldCIsIlRyYWplY3RvcnkiLCJNSU5fWk9PTSIsIk1BWF9aT09NIiwiREVGQVVMVF9aT09NIiwiVElNRV9QRVJfREFUQV9QT0lOVCIsIlByb2plY3RpbGVNb3Rpb25Nb2RlbCIsImNvbnN0cnVjdG9yIiwiZGVmYXVsdFByb2plY3RpbGVPYmplY3RUeXBlIiwiZGVmYXVsdEFpclJlc2lzdGFuY2VPbiIsInBvc3NpYmxlT2JqZWN0VHlwZXMiLCJ0YW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibWF4UHJvamVjdGlsZXMiLCJNQVhfTlVNQkVSX09GX1RSQUpFQ1RPUklFUyIsImRlZmF1bHRDYW5ub25IZWlnaHQiLCJkZWZhdWx0Q2Fubm9uQW5nbGUiLCJkZWZhdWx0SW5pdGlhbFNwZWVkIiwiZGVmYXVsdFNwZWVkU3RhbmRhcmREZXZpYXRpb24iLCJkZWZhdWx0QW5nbGVTdGFuZGFyZERldmlhdGlvbiIsInRhcmdldFgiLCJUQVJHRVRfWF9ERUZBVUxUIiwicGhldGlvSW5zdHJ1bWVudEFsdGl0dWRlUHJvcGVydHkiLCJ0YXJnZXQiLCJjcmVhdGVUYW5kZW0iLCJtZWFzdXJpbmdUYXBlIiwiY2Fubm9uSGVpZ2h0UHJvcGVydHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidW5pdHMiLCJyYW5nZSIsIkNBTk5PTl9IRUlHSFRfUkFOR0UiLCJpbml0aWFsU3BlZWRTdGFuZGFyZERldmlhdGlvblByb3BlcnR5IiwiaW5pdGlhbFNwZWVkUHJvcGVydHkiLCJ2YWx1ZSIsInJhbmRvbUZyb21Ob3JtYWwiLCJMQVVOQ0hfVkVMT0NJVFlfUkFOR0UiLCJpbml0aWFsQW5nbGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5IiwiY2Fubm9uQW5nbGVQcm9wZXJ0eSIsIkNBTk5PTl9BTkdMRV9SQU5HRSIsInByb2plY3RpbGVNYXNzUHJvcGVydHkiLCJtYXNzIiwiUFJPSkVDVElMRV9NQVNTX1JBTkdFIiwicHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHkiLCJkaWFtZXRlciIsIlBST0pFQ1RJTEVfRElBTUVURVJfUkFOR0UiLCJwcm9qZWN0aWxlRHJhZ0NvZWZmaWNpZW50UHJvcGVydHkiLCJkcmFnQ29lZmZpY2llbnQiLCJQUk9KRUNUSUxFX0RSQUdfQ09FRkZJQ0lFTlRfUkFOR0UiLCJzZWxlY3RlZFByb2plY3RpbGVPYmplY3RUeXBlUHJvcGVydHkiLCJwaGV0aW9WYWx1ZVR5cGUiLCJQcm9qZWN0aWxlT2JqZWN0VHlwZUlPIiwidmFsaWRWYWx1ZXMiLCJncmF2aXR5UHJvcGVydHkiLCJHUkFWSVRZX09OX0VBUlRIIiwiYWx0aXR1ZGVQcm9wZXJ0eSIsIk9QVF9PVVQiLCJBTFRJVFVERV9SQU5HRSIsImFpclJlc2lzdGFuY2VPblByb3BlcnR5IiwiYWlyRGVuc2l0eVByb3BlcnR5IiwiY2FsY3VsYXRlQWlyRGVuc2l0eSIsInRpbWVTcGVlZFByb3BlcnR5IiwiTk9STUFMIiwiU0xPVyIsImlzUGxheWluZ1Byb3BlcnR5IiwiZGF2aWRIZWlnaHQiLCJkYXZpZFBvc2l0aW9uIiwibnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5IiwicGhldGlvUmVhZE9ubHkiLCJyYXBpZEZpcmVNb2RlUHJvcGVydHkiLCJmaXJlRW5hYmxlZFByb3BlcnR5IiwibnVtTW92aW5nIiwicmFwaWRGaXJlTW9kZSIsInVwZGF0ZVRyYWplY3RvcnlSYW5rc0VtaXR0ZXIiLCJldmVudFRpbWVyIiwiQ29uc3RhbnRFdmVudE1vZGVsIiwic3RlcE1vZGVsRWxlbWVudHMiLCJiaW5kIiwibXV6emxlRmxhc2hTdGVwcGVyIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsInpvb21Qcm9wZXJ0eSIsInRyYWplY3RvcnlHcm91cCIsImNyZWF0ZUdyb3VwIiwiZGF0YVByb2JlIiwibGluayIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJtYXJrTW92aW5nVHJhamVjdG9yaWVzQ2hhbmdlZE1pZEFpciIsInNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGUiLCJzZXRQcm9qZWN0aWxlUGFyYW1ldGVycyIsInJlc2V0IiwiZXJhc2VUcmFqZWN0b3JpZXMiLCJlbWl0Iiwic3RlcCIsImR0IiwiaSIsImNvdW50IiwidHJhamVjdG9yeSIsImdldEVsZW1lbnQiLCJyZWFjaGVkR3JvdW5kIiwibGltaXRUcmFqZWN0b3JpZXMiLCJ0cmFqZWN0b3JpZXNUb0Rpc3Bvc2UiLCJudW1UcmFqZWN0b3JpZXNUb0Rpc3Bvc2UiLCJwdXNoIiwibGVuZ3RoIiwiZm9yRWFjaCIsInQiLCJkaXNwb3NlRWxlbWVudCIsImNsZWFyIiwiZmlyZU51bVByb2plY3RpbGVzIiwibnVtUHJvamVjdGlsZXMiLCJpbml0aWFsU3BlZWQiLCJnZXRSYW5kb21pemVkVmFsdWUiLCJpbml0aWFsQW5nbGUiLCJjcmVhdGVOZXh0RWxlbWVudCIsImoiLCJjaGFuZ2VkSW5NaWRBaXIiLCJzZXQiLCJhbHRpdHVkZSIsImFpclJlc2lzdGFuY2VPbiIsInRlbXBlcmF0dXJlIiwicHJlc3N1cmUiLCJNYXRoIiwicG93IiwiZXhwIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcm9qZWN0aWxlTW90aW9uTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tbW9uIG1vZGVsIChiYXNlIHR5cGUpIGZvciBQcm9qZWN0aWxlIE1vdGlvbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1hdHRoZXcgQmxhY2ttYW4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmFyaWFuY2VOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1ZhcmlhbmNlTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVE1vZGVsIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1RNb2RlbC5qcyc7XHJcbmltcG9ydCBFdmVudFRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FdmVudFRpbWVyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoeXNpY2FsQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9QaHlzaWNhbENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBUaW1lU3BlZWQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVTcGVlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvR3JvdXAuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBwcm9qZWN0aWxlTW90aW9uIGZyb20gJy4uLy4uL3Byb2plY3RpbGVNb3Rpb24uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyBmcm9tICcuLi9Qcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFN0YXRVdGlscyBmcm9tICcuLi9TdGF0VXRpbHMuanMnO1xyXG5pbXBvcnQgRGF0YVByb2JlIGZyb20gJy4vRGF0YVByb2JlLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25NZWFzdXJpbmdUYXBlIGZyb20gJy4vUHJvamVjdGlsZU1vdGlvbk1lYXN1cmluZ1RhcGUuanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU9iamVjdFR5cGUgZnJvbSAnLi9Qcm9qZWN0aWxlT2JqZWN0VHlwZS5qcyc7XHJcbmltcG9ydCBUYXJnZXQgZnJvbSAnLi9UYXJnZXQuanMnO1xyXG5pbXBvcnQgVHJhamVjdG9yeSwgeyBUcmFqZWN0b3J5R3JvdXBDcmVhdGVFbGVtZW50QXJndW1lbnRzIH0gZnJvbSAnLi9UcmFqZWN0b3J5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNSU5fWk9PTSA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuTUlOX1pPT007XHJcbmNvbnN0IE1BWF9aT09NID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5NQVhfWk9PTTtcclxuY29uc3QgREVGQVVMVF9aT09NID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5ERUZBVUxUX1pPT007XHJcblxyXG5jb25zdCBUSU1FX1BFUl9EQVRBX1BPSU5UID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5USU1FX1BFUl9EQVRBX1BPSU5UOyAvLyBtc1xyXG5cclxudHlwZSBQcm9qZWN0aWxlTW90aW9uTW9kZWxPcHRpb25zID0ge1xyXG4gIG1heFByb2plY3RpbGVzPzogbnVtYmVyO1xyXG4gIGRlZmF1bHRDYW5ub25IZWlnaHQ/OiBudW1iZXI7XHJcbiAgZGVmYXVsdENhbm5vbkFuZ2xlPzogbnVtYmVyO1xyXG4gIGRlZmF1bHRJbml0aWFsU3BlZWQ/OiBudW1iZXI7XHJcbiAgZGVmYXVsdFNwZWVkU3RhbmRhcmREZXZpYXRpb24/OiBudW1iZXI7XHJcbiAgZGVmYXVsdEFuZ2xlU3RhbmRhcmREZXZpYXRpb24/OiBudW1iZXI7XHJcbiAgdGFyZ2V0WD86IG51bWJlcjtcclxuICBwaGV0aW9JbnN0cnVtZW50QWx0aXR1ZGVQcm9wZXJ0eT86IGJvb2xlYW47XHJcbn07XHJcblxyXG5jbGFzcyBQcm9qZWN0aWxlTW90aW9uTW9kZWwgaW1wbGVtZW50cyBUTW9kZWwge1xyXG4gIHB1YmxpYyBtYXhQcm9qZWN0aWxlczogbnVtYmVyO1xyXG4gIHB1YmxpYyB0YXJnZXQ6IFRhcmdldDtcclxuICBwdWJsaWMgbWVhc3VyaW5nVGFwZTogUHJvamVjdGlsZU1vdGlvbk1lYXN1cmluZ1RhcGU7XHJcbiAgcHVibGljIGNhbm5vbkhlaWdodFByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyBpbml0aWFsU3BlZWRTdGFuZGFyZERldmlhdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyBpbml0aWFsU3BlZWRQcm9wZXJ0eTogVmFyaWFuY2VOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgaW5pdGlhbEFuZ2xlU3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgY2Fubm9uQW5nbGVQcm9wZXJ0eTogVmFyaWFuY2VOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcHJvamVjdGlsZU1hc3NQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHByb2plY3RpbGVEcmFnQ29lZmZpY2llbnRQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZVByb3BlcnR5OiBQcm9wZXJ0eTxQcm9qZWN0aWxlT2JqZWN0VHlwZT47XHJcbiAgcHVibGljIGdyYXZpdHlQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgYWx0aXR1ZGVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgYWlyUmVzaXN0YW5jZU9uUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBhaXJEZW5zaXR5UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHRpbWVTcGVlZFByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PFRpbWVTcGVlZD47XHJcbiAgcHVibGljIGlzUGxheWluZ1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGF2aWRIZWlnaHQ6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGF2aWRQb3NpdGlvbjogVmVjdG9yMjtcclxuICBwdWJsaWMgbnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyByYXBpZEZpcmVNb2RlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBmaXJlRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgdXBkYXRlVHJhamVjdG9yeVJhbmtzRW1pdHRlcjogRW1pdHRlcjtcclxuICBwcml2YXRlIGV2ZW50VGltZXI6IEV2ZW50VGltZXI7XHJcbiAgcHVibGljIG11enpsZUZsYXNoU3RlcHBlcjogRW1pdHRlcjxbIG51bWJlciBdPjsgLy8gZW1pdHMgd2hlbiBjYW5ub24gbmVlZHMgdG8gdXBkYXRlIGl0cyBtdXp6bGUgZmxhc2ggYW5pbWF0aW9uXHJcbiAgcHVibGljIHpvb21Qcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHVibGljIHRyYWplY3RvcnlHcm91cDogUGhldGlvR3JvdXA8VHJhamVjdG9yeSwgVHJhamVjdG9yeUdyb3VwQ3JlYXRlRWxlbWVudEFyZ3VtZW50cz47IC8vIGEgZ3JvdXAgb2YgdHJhamVjdG9yaWVzLCBsaW1pdGVkIHRvIHRoaXMubWF4UHJvamVjdGlsZXNcclxuICBwdWJsaWMgZGF0YVByb2JlOiBEYXRhUHJvYmU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkZWZhdWx0UHJvamVjdGlsZU9iamVjdFR5cGUgLSAgZGVmYXVsdCBvYmplY3QgdHlwZSBmb3IgdGhlIG1vZGVsXHJcbiAgICogQHBhcmFtIGRlZmF1bHRBaXJSZXNpc3RhbmNlT24gLSAgZGVmYXVsdCBhaXIgcmVzaXN0YW5jZSBvbiB2YWx1ZVxyXG4gICAqIEBwYXJhbSBwb3NzaWJsZU9iamVjdFR5cGVzIC0gYSBsaXN0IG9mIHRoZSBwb3NzaWJsZSBQcm9qZWN0aWxlT2JqZWN0VHlwZXMgZm9yIHRoZSBtb2RlbFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGVmYXVsdFByb2plY3RpbGVPYmplY3RUeXBlOiBQcm9qZWN0aWxlT2JqZWN0VHlwZSwgZGVmYXVsdEFpclJlc2lzdGFuY2VPbjogYm9vbGVhbixcclxuICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlT2JqZWN0VHlwZXM6IFByb2plY3RpbGVPYmplY3RUeXBlW10sIHRhbmRlbTogVGFuZGVtLCBwcm92aWRlZE9wdGlvbnM/OiBQcm9qZWN0aWxlTW90aW9uTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UHJvamVjdGlsZU1vdGlvbk1vZGVsT3B0aW9ucz4oKSgge1xyXG4gICAgICBtYXhQcm9qZWN0aWxlczogUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5NQVhfTlVNQkVSX09GX1RSQUpFQ1RPUklFUyxcclxuICAgICAgZGVmYXVsdENhbm5vbkhlaWdodDogMCxcclxuICAgICAgZGVmYXVsdENhbm5vbkFuZ2xlOiA4MCxcclxuICAgICAgZGVmYXVsdEluaXRpYWxTcGVlZDogMTgsXHJcbiAgICAgIGRlZmF1bHRTcGVlZFN0YW5kYXJkRGV2aWF0aW9uOiAwLFxyXG4gICAgICBkZWZhdWx0QW5nbGVTdGFuZGFyZERldmlhdGlvbjogMCxcclxuICAgICAgdGFyZ2V0WDogUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5UQVJHRVRfWF9ERUZBVUxULFxyXG4gICAgICBwaGV0aW9JbnN0cnVtZW50QWx0aXR1ZGVQcm9wZXJ0eTogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5tYXhQcm9qZWN0aWxlcyA9IG9wdGlvbnMubWF4UHJvamVjdGlsZXM7XHJcbiAgICB0aGlzLnRhcmdldCA9IG5ldyBUYXJnZXQoIG9wdGlvbnMudGFyZ2V0WCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RhcmdldCcgKSApO1xyXG4gICAgdGhpcy5tZWFzdXJpbmdUYXBlID0gbmV3IFByb2plY3RpbGVNb3Rpb25NZWFzdXJpbmdUYXBlKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyaW5nVGFwZScgKSApO1xyXG5cclxuICAgIHRoaXMuY2Fubm9uSGVpZ2h0UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuZGVmYXVsdENhbm5vbkhlaWdodCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYW5ub25IZWlnaHRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0hlaWdodCBvZiB0aGUgY2Fubm9uJyxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcmFuZ2U6IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuQ0FOTk9OX0hFSUdIVF9SQU5HRVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbFNwZWVkU3RhbmRhcmREZXZpYXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5kZWZhdWx0U3BlZWRTdGFuZGFyZERldmlhdGlvbiwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbml0aWFsU3BlZWRTdGFuZGFyZERldmlhdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHN0YW5kYXJkIGRldmlhdGlvbiBvZiB0aGUgbGF1bmNoIHNwZWVkJyxcclxuICAgICAgdW5pdHM6ICdtL3MnLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsU3BlZWRQcm9wZXJ0eSA9IG5ldyBWYXJpYW5jZU51bWJlclByb3BlcnR5KCBvcHRpb25zLmRlZmF1bHRJbml0aWFsU3BlZWQsIHZhbHVlID0+IHtcclxuICAgICAgcmV0dXJuIFN0YXRVdGlscy5yYW5kb21Gcm9tTm9ybWFsKCB2YWx1ZSwgdGhpcy5pbml0aWFsU3BlZWRTdGFuZGFyZERldmlhdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luaXRpYWxTcGVlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHNwZWVkIG9uIGxhdW5jaCcsXHJcbiAgICAgIHVuaXRzOiAnbS9zJyxcclxuICAgICAgcmFuZ2U6IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuTEFVTkNIX1ZFTE9DSVRZX1JBTkdFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsQW5nbGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmRlZmF1bHRBbmdsZVN0YW5kYXJkRGV2aWF0aW9uLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luaXRpYWxBbmdsZVN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIHRoZSBsYXVuY2ggYW5nbGUnLFxyXG4gICAgICB1bml0czogJ1xcdTAwQjAnLCAvLyBkZWdyZWVzXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDMwIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNhbm5vbkFuZ2xlUHJvcGVydHkgPSBuZXcgVmFyaWFuY2VOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5kZWZhdWx0Q2Fubm9uQW5nbGUsIHZhbHVlID0+IHtcclxuICAgICAgcmV0dXJuIFN0YXRVdGlscy5yYW5kb21Gcm9tTm9ybWFsKCB2YWx1ZSwgdGhpcy5pbml0aWFsQW5nbGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Nhbm5vbkFuZ2xlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBbmdsZSBvZiB0aGUgY2Fubm9uJyxcclxuICAgICAgdW5pdHM6ICdcXHUwMEIwJywgLy8gZGVncmVlc1xyXG4gICAgICByYW5nZTogUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5DQU5OT05fQU5HTEVfUkFOR0VcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnByb2plY3RpbGVNYXNzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGRlZmF1bHRQcm9qZWN0aWxlT2JqZWN0VHlwZS5tYXNzLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb2plY3RpbGVNYXNzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdNYXNzIG9mIHRoZSBwcm9qZWN0aWxlJyxcclxuICAgICAgdW5pdHM6ICdrZycsXHJcbiAgICAgIHJhbmdlOiBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlBST0pFQ1RJTEVfTUFTU19SQU5HRVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGRlZmF1bHRQcm9qZWN0aWxlT2JqZWN0VHlwZS5kaWFtZXRlciwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcm9qZWN0aWxlRGlhbWV0ZXJQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0RpYW1ldGVyIG9mIHRoZSBwcm9qZWN0aWxlJyxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcmFuZ2U6IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUFJPSkVDVElMRV9ESUFNRVRFUl9SQU5HRVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucHJvamVjdGlsZURyYWdDb2VmZmljaWVudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBkZWZhdWx0UHJvamVjdGlsZU9iamVjdFR5cGUuZHJhZ0NvZWZmaWNpZW50LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb2plY3RpbGVEcmFnQ29lZmZpY2llbnRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjpcclxuICAgICAgICAnRHJhZyBjb2VmZmljaWVudCBvZiB0aGUgcHJvamVjdGlsZSwgdW5pdGxlc3MgYXMgaXQgaXMgYSBjb2VmZmljaWVudCcsXHJcbiAgICAgIHJhbmdlOiBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlBST0pFQ1RJTEVfRFJBR19DT0VGRklDSUVOVF9SQU5HRVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBkZWZhdWx0UHJvamVjdGlsZU9iamVjdFR5cGUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBwcm9qZWN0aWxlIG9iamVjdCB0eXBlJyxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBSZWZlcmVuY2VJTyggUHJvamVjdGlsZU9iamVjdFR5cGUuUHJvamVjdGlsZU9iamVjdFR5cGVJTyApLFxyXG4gICAgICB2YWxpZFZhbHVlczogcG9zc2libGVPYmplY3RUeXBlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZ3Jhdml0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBQaHlzaWNhbENvbnN0YW50cy5HUkFWSVRZX09OX0VBUlRILCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXZpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjY2VsZXJhdGlvbiBkdWUgdG8gZ3Jhdml0eScsXHJcbiAgICAgIHVuaXRzOiAnbS9zXjInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hbHRpdHVkZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy5waGV0aW9JbnN0cnVtZW50QWx0aXR1ZGVQcm9wZXJ0eSA/IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbHRpdHVkZVByb3BlcnR5JyApIDogVGFuZGVtLk9QVF9PVVQsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBbHRpdHVkZSBvZiB0aGUgZW52aXJvbm1lbnQnLFxyXG4gICAgICByYW5nZTogUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5BTFRJVFVERV9SQU5HRSxcclxuICAgICAgdW5pdHM6ICdtJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWlyUmVzaXN0YW5jZU9uUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBkZWZhdWx0QWlyUmVzaXN0YW5jZU9uLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FpclJlc2lzdGFuY2VPblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnV2hldGhlciBhaXIgcmVzaXN0YW5jZSBpcyBvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFpckRlbnNpdHlQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5hbHRpdHVkZVByb3BlcnR5LCB0aGlzLmFpclJlc2lzdGFuY2VPblByb3BlcnR5IF0sIGNhbGN1bGF0ZUFpckRlbnNpdHksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWlyRGVuc2l0eVByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ2tnL21eMycsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246XHJcbiAgICAgICAgJ2FpciBkZW5zaXR5LCBkZXBlbmRzIG9uIGFsdGl0dWRlIGFuZCB3aGV0aGVyIGFpciByZXNpc3RhbmNlIGlzIG9uJyxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggVGltZVNwZWVkLk5PUk1BTCwge1xyXG4gICAgICB2YWxpZFZhbHVlczogWyBUaW1lU3BlZWQuTk9STUFMLCBUaW1lU3BlZWQuU0xPVyBdLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lU3BlZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1NwZWVkIG9mIGFuaW1hdGlvbiwgZWl0aGVyIG5vcm1hbCBvciBzbG93LidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc1BsYXlpbmdQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgYW5pbWF0aW9uIGlzIHBsYXlpbmcgKGFzIG9wcG9zZWQgdG8gcGF1c2VkKSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRhdmlkSGVpZ2h0ID0gMjsgLy8gbWV0ZXJzXHJcbiAgICB0aGlzLmRhdmlkUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggNywgMCApOyAvLyBtZXRlcnNcclxuXHJcbiAgICB0aGlzLm51bWJlck9mTW92aW5nUHJvamVjdGlsZXNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJPZk1vdmluZ1Byb2plY3RpbGVzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnbnVtYmVyIG9mIHByb2plY3RpbGVzIHRoYXQgYXJlIHN0aWxsIG1vdmluZydcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJhcGlkRmlyZU1vZGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhcGlkRmlyZU1vZGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0lzIHRoZSBzdGF0cyBzY3JlZW4gaW4gcmFwaWQtZmlyZSBtb2RlPydcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmZpcmVFbmFibGVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5LCB0aGlzLnJhcGlkRmlyZU1vZGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIG51bU1vdmluZywgcmFwaWRGaXJlTW9kZSApID0+XHJcbiAgICAgICAgIXJhcGlkRmlyZU1vZGUgJiYgbnVtTW92aW5nIDwgdGhpcy5tYXhQcm9qZWN0aWxlcywge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVFbmFibGVkUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogYFRoZSBmaXJlIGJ1dHRvbiBpcyBvbmx5IGVuYWJsZWQgaWYgdGhlcmUgYXJlIGxlc3MgdGhhbiAke3RoaXMubWF4UHJvamVjdGlsZXN9IHByb2plY3RpbGVzIGluIHRoZSBhaXIuYCxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IEJvb2xlYW5JT1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVUcmFqZWN0b3J5UmFua3NFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICB0aGlzLmV2ZW50VGltZXIgPSBuZXcgRXZlbnRUaW1lcihcclxuICAgICAgbmV3IEV2ZW50VGltZXIuQ29uc3RhbnRFdmVudE1vZGVsKCAxMDAwIC8gVElNRV9QRVJfREFUQV9QT0lOVCApLFxyXG4gICAgICB0aGlzLnN0ZXBNb2RlbEVsZW1lbnRzLmJpbmQoIHRoaXMsIFRJTUVfUEVSX0RBVEFfUE9JTlQgLyAxMDAwIClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5tdXp6bGVGbGFzaFN0ZXBwZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnpvb21Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggREVGQVVMVF9aT09NLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3pvb21Qcm9wZXJ0eScgKSxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTUlOX1pPT00sIE1BWF9aT09NICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdVc2VkIHRvIGFkanVzdCB0byB2aXN1YWwgem9vbSBmb3IgdGhpcyBzY3JlZW4uIEVhY2ggbmV3IHpvb20gbGV2ZWwgaW5jcmVhc2VzIHRoZSB2YWx1ZSBieSBhIGZhY3RvciBvZiAyLicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoaXMgYWZ0ZXIgbW9kZWwgcHJvcGVydGllcyB0byBzdXBwb3J0IHRoZSBQaGV0aW9Hcm91cCBjcmVhdGluZyB0aGUgcHJvdG90eXBlIGltbWVkaWF0ZWx5XHJcbiAgICB0aGlzLnRyYWplY3RvcnlHcm91cCA9IFRyYWplY3RvcnkuY3JlYXRlR3JvdXAoIHRoaXMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0cmFqZWN0b3J5R3JvdXAnICkgKTtcclxuXHJcbiAgICB0aGlzLmRhdGFQcm9iZSA9IG5ldyBEYXRhUHJvYmUoIHRoaXMudHJhamVjdG9yeUdyb3VwLCAxMCwgMTAsIHRoaXMuem9vbVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGF0YVByb2JlJyApICk7IC8vIHBvc2l0aW9uIGFyYml0cmFyeVxyXG5cclxuICAgIC8vIExpbmtzIGluIHRoaXMgY29uc3RydWN0b3IgbGFzdCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0sIHNvIG5vIG5lZWQgdG8gZGlzcG9zZVxyXG5cclxuICAgIC8vIGlmIGFueSBvZiB0aGUgZ2xvYmFsIFByb3BlcnRpZXMgY2hhbmdlLCB1cGRhdGUgdGhlIHN0YXR1cyBvZiBtb3ZpbmcgcHJvamVjdGlsZXNcclxuICAgIHRoaXMuYWlyRGVuc2l0eVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLm1hcmtNb3ZpbmdUcmFqZWN0b3JpZXNDaGFuZ2VkTWlkQWlyKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuZ3Jhdml0eVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLm1hcmtNb3ZpbmdUcmFqZWN0b3JpZXNDaGFuZ2VkTWlkQWlyKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZVByb3BlcnR5LmxpbmsoXHJcbiAgICAgIHNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGUgPT4ge1xyXG4gICAgICAgIGlmICggIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICB0aGlzLnNldFByb2plY3RpbGVQYXJhbWV0ZXJzKCBzZWxlY3RlZFByb2plY3RpbGVPYmplY3RUeXBlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgLy8gZGlzcG9zZXMgYWxsIHRyYWplY3RvcmllcyBhbmQgcmVzZXRzIG51bWJlciBvZiBtb3ZpbmcgcHJvamVjdGlsZXMgUHJvcGVydHlcclxuICAgIHRoaXMuZXJhc2VUcmFqZWN0b3JpZXMoKTtcclxuXHJcbiAgICB0aGlzLnRhcmdldC5yZXNldCgpO1xyXG4gICAgdGhpcy5tZWFzdXJpbmdUYXBlLnJlc2V0KCk7XHJcbiAgICB0aGlzLmRhdGFQcm9iZS5yZXNldCgpO1xyXG4gICAgdGhpcy56b29tUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2Fubm9uSGVpZ2h0UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2Fubm9uQW5nbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbml0aWFsQW5nbGVTdGFuZGFyZERldmlhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmluaXRpYWxTcGVlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmluaXRpYWxTcGVlZFN0YW5kYXJkRGV2aWF0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnByb2plY3RpbGVNYXNzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHJvamVjdGlsZURyYWdDb2VmZmljaWVudFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hbHRpdHVkZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFpclJlc2lzdGFuY2VPblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJhcGlkRmlyZU1vZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMubXV6emxlRmxhc2hTdGVwcGVyLmVtaXQoIDAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmV2ZW50VGltZXIuc3RlcCggKCB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LnZhbHVlID09PSBUaW1lU3BlZWQuU0xPVyA/IDAuMzMgOiAxICkgKiBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gU3RlcHMgbW9kZWwgZWxlbWVudHMgZ2l2ZW4gYSB0aW1lIHN0ZXAsIHVzZWQgYnkgdGhlIHN0ZXAgYnV0dG9uXHJcbiAgcHVibGljIHN0ZXBNb2RlbEVsZW1lbnRzKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50cmFqZWN0b3J5R3JvdXAuY291bnQ7IGkrKyApIHtcclxuICAgICAgY29uc3QgdHJhamVjdG9yeSA9IHRoaXMudHJhamVjdG9yeUdyb3VwLmdldEVsZW1lbnQoIGkgKTtcclxuICAgICAgaWYgKCAhdHJhamVjdG9yeS5yZWFjaGVkR3JvdW5kICkge1xyXG4gICAgICAgIHRyYWplY3Rvcnkuc3RlcCggZHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5tdXp6bGVGbGFzaFN0ZXBwZXIuZW1pdCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSBhbmQgZGlzcG9zZSBvbGQgdHJhamVjdG9yaWVzIHRoYXQgYXJlIG92ZXIgdGhlIGxpbWl0IGZyb20gdGhlIG9ic2VydmFibGUgYXJyYXlcclxuICBwdWJsaWMgbGltaXRUcmFqZWN0b3JpZXMoKTogdm9pZCB7XHJcbiAgICAvLyBjcmVhdGUgYSB0ZW1wb3JhcnkgYXJyYXkgdG8gaG9sZCBhbGwgdHJhamVjdG9yaWVzIHRvIGJlIGRpc3Bvc2VkLCB0byBhdm9pZCBhcnJheSBtdXRhdGlvbiBvZiB0cmFqZWN0b3J5R3JvdXAgd2hpbGUgbG9vcGluZ1xyXG4gICAgY29uc3QgdHJhamVjdG9yaWVzVG9EaXNwb3NlID0gW107XHJcbiAgICBjb25zdCBudW1UcmFqZWN0b3JpZXNUb0Rpc3Bvc2UgPSB0aGlzLnRyYWplY3RvcnlHcm91cC5jb3VudCAtIHRoaXMubWF4UHJvamVjdGlsZXM7XHJcbiAgICBpZiAoIG51bVRyYWplY3Rvcmllc1RvRGlzcG9zZSA+IDAgKSB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudHJhamVjdG9yeUdyb3VwLmNvdW50OyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgdHJhamVjdG9yeSA9IHRoaXMudHJhamVjdG9yeUdyb3VwLmdldEVsZW1lbnQoIGkgKTtcclxuICAgICAgICBpZiAoIHRyYWplY3RvcnkucmVhY2hlZEdyb3VuZCApIHtcclxuICAgICAgICAgIHRyYWplY3Rvcmllc1RvRGlzcG9zZS5wdXNoKCB0cmFqZWN0b3J5ICk7XHJcbiAgICAgICAgICBpZiAoIHRyYWplY3Rvcmllc1RvRGlzcG9zZS5sZW5ndGggPj0gbnVtVHJhamVjdG9yaWVzVG9EaXNwb3NlICkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdHJhamVjdG9yaWVzVG9EaXNwb3NlLmZvckVhY2goIHQgPT4gdGhpcy50cmFqZWN0b3J5R3JvdXAuZGlzcG9zZUVsZW1lbnQoIHQgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlcyBhbGwgdHJhamVjdG9yaWVzIGFuZCByZXNldHMgY29ycmVzcG9uZGluZyBQcm9wZXJ0aWVzXHJcbiAgcHVibGljIGVyYXNlVHJhamVjdG9yaWVzKCk6IHZvaWQge1xyXG4gICAgdGhpcy50cmFqZWN0b3J5R3JvdXAuY2xlYXIoKTtcclxuICAgIHRoaXMubnVtYmVyT2ZNb3ZpbmdQcm9qZWN0aWxlc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gbnVtUHJvamVjdGlsZXMgLSB0aGUgbnVtYmVyIG9mIHNpbXVsdGFuZW91cyBwcm9qZWN0aWxlcyB0byBmaXJlXHJcbiAgICovXHJcbiAgcHVibGljIGZpcmVOdW1Qcm9qZWN0aWxlcyggbnVtUHJvamVjdGlsZXM6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVByb2plY3RpbGVzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGluaXRpYWxTcGVlZCA9IHRoaXMuaW5pdGlhbFNwZWVkUHJvcGVydHkuZ2V0UmFuZG9taXplZFZhbHVlKCk7XHJcbiAgICAgIGNvbnN0IGluaXRpYWxBbmdsZSA9IHRoaXMuY2Fubm9uQW5nbGVQcm9wZXJ0eS5nZXRSYW5kb21pemVkVmFsdWUoKTtcclxuXHJcbiAgICAgIHRoaXMudHJhamVjdG9yeUdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCB0aGlzLnNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICB0aGlzLnByb2plY3RpbGVNYXNzUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgdGhpcy5wcm9qZWN0aWxlRGlhbWV0ZXJQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICB0aGlzLnByb2plY3RpbGVEcmFnQ29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICBpbml0aWFsU3BlZWQsXHJcbiAgICAgICAgdGhpcy5jYW5ub25IZWlnaHRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICBpbml0aWFsQW5nbGUgKTtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlVHJhamVjdG9yeVJhbmtzRW1pdHRlci5lbWl0KCk7IC8vIGluY3JlbWVudCByYW5rIG9mIGFsbCB0cmFqZWN0b3JpZXNcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpbWl0VHJhamVjdG9yaWVzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBTZXQgY2hhbmdlZEluTWlkQWlyIHRvIHRydWUgZm9yIHRyYWplY3RvcmllcyB3aXRoIGN1cnJlbnRseSBtb3ZpbmcgcHJvamVjdGlsZXNcclxuICBwcml2YXRlIG1hcmtNb3ZpbmdUcmFqZWN0b3JpZXNDaGFuZ2VkTWlkQWlyKCk6IHZvaWQge1xyXG4gICAgbGV0IHRyYWplY3Rvcnk7XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLnRyYWplY3RvcnlHcm91cC5jb3VudDsgaisrICkge1xyXG4gICAgICB0cmFqZWN0b3J5ID0gdGhpcy50cmFqZWN0b3J5R3JvdXAuZ2V0RWxlbWVudCggaiApO1xyXG5cclxuICAgICAgLy8gVHJhamVjdG9yeSBoYXMgbm90IHJlYWNoZWQgZ3JvdW5kXHJcbiAgICAgIGlmICggIXRyYWplY3RvcnkuY2hhbmdlZEluTWlkQWlyICYmICF0cmFqZWN0b3J5LnJlYWNoZWRHcm91bmQgKSB7XHJcbiAgICAgICAgdHJhamVjdG9yeS5jaGFuZ2VkSW5NaWRBaXIgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbWFzcywgZGlhbWV0ZXIsIGFuZCBkcmFnIGNvZWZmaWNpZW50IGJhc2VkIG9uIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgcHJvamVjdGlsZSBvYmplY3QgdHlwZVxyXG4gICAqIEBwYXJhbSBzZWxlY3RlZFByb2plY3RpbGVPYmplY3RUeXBlIC0gY29udGFpbnMgaW5mb3JtYXRpb24gc3VjaCBhcyBtYXNzLCBkaWFtZXRlciwgZXRjLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0UHJvamVjdGlsZVBhcmFtZXRlcnMoIHNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGU6IFByb2plY3RpbGVPYmplY3RUeXBlICk6IHZvaWQge1xyXG4gICAgdGhpcy5wcm9qZWN0aWxlTWFzc1Byb3BlcnR5LnNldCggc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZS5tYXNzICk7XHJcbiAgICB0aGlzLnByb2plY3RpbGVEaWFtZXRlclByb3BlcnR5LnNldCggc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZS5kaWFtZXRlciApO1xyXG4gICAgdGhpcy5wcm9qZWN0aWxlRHJhZ0NvZWZmaWNpZW50UHJvcGVydHkuc2V0KCBzZWxlY3RlZFByb2plY3RpbGVPYmplY3RUeXBlLmRyYWdDb2VmZmljaWVudCApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSBhbHRpdHVkZSAtIGluIG1ldGVyc1xyXG4gKiBAcGFyYW0gYWlyUmVzaXN0YW5jZU9uIC0gaWYgb2ZmLCB6ZXJvIGFpciBkZW5zaXR5XHJcbiAqL1xyXG5jb25zdCBjYWxjdWxhdGVBaXJEZW5zaXR5ID0gKCBhbHRpdHVkZTogbnVtYmVyLCBhaXJSZXNpc3RhbmNlT246IGJvb2xlYW4gKTogbnVtYmVyID0+IHtcclxuICAvLyBBdG1vc3BoZXJpYyBtb2RlbCBhbGdvcml0aG0gaXMgdGFrZW4gZnJvbSBodHRwczovL3d3dy5ncmMubmFzYS5nb3Yvd3d3L2stMTIvYWlycGxhbmUvYXRtb3NtZXQuaHRtbFxyXG4gIC8vIENoZWNrZWQgdGhlIHZhbHVlcyBhdCBodHRwOi8vd3d3LmVuZ2luZWVyaW5ndG9vbGJveC5jb20vc3RhbmRhcmQtYXRtb3NwaGVyZS1kXzYwNC5odG1sXHJcblxyXG4gIGlmICggYWlyUmVzaXN0YW5jZU9uICkge1xyXG4gICAgbGV0IHRlbXBlcmF0dXJlO1xyXG4gICAgbGV0IHByZXNzdXJlO1xyXG5cclxuICAgIC8vIFRoZSBzaW0gZG9lc24ndCBnbyBiZXlvbmQgNTAwMCwgcmVuZGVyaW5nIHRoZSBlbHNlcyB1bm5lY2Vzc2FyeSwgYnV0IGtlZXBpbmcgaWYgb3RoZXJzIHdvdWxkIGxpa2UgdG9cclxuICAgIC8vIGluY3JlYXNlIHRoZSBhbHRpdHVkZSByYW5nZS5cclxuXHJcbiAgICBpZiAoIGFsdGl0dWRlIDwgMTEwMDAgKSB7XHJcbiAgICAgIC8vIHRyb3Bvc3BoZXJlXHJcbiAgICAgIHRlbXBlcmF0dXJlID0gMTUuMDQgLSAwLjAwNjQ5ICogYWx0aXR1ZGU7XHJcbiAgICAgIHByZXNzdXJlID0gMTAxLjI5ICogTWF0aC5wb3coICggdGVtcGVyYXR1cmUgKyAyNzMuMSApIC8gMjg4LjA4LCA1LjI1NiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGFsdGl0dWRlIDwgMjUwMDAgKSB7XHJcbiAgICAgIC8vIGxvd2VyIHN0cmF0b3NwaGVyZVxyXG4gICAgICB0ZW1wZXJhdHVyZSA9IC01Ni40NjtcclxuICAgICAgcHJlc3N1cmUgPSAyMi42NSAqIE1hdGguZXhwKCAxLjczIC0gMC4wMDAxNTcgKiBhbHRpdHVkZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHVwcGVyIHN0cmF0b3NwaGVyZSAoYWx0aXR1ZGUgPj0gMjUwMDAgbWV0ZXJzKVxyXG4gICAgICB0ZW1wZXJhdHVyZSA9IC0xMzEuMjEgKyAwLjAwMjk5ICogYWx0aXR1ZGU7XHJcbiAgICAgIHByZXNzdXJlID0gMi40ODggKiBNYXRoLnBvdyggKCB0ZW1wZXJhdHVyZSArIDI3My4xICkgLyAyMTYuNiwgLTExLjM4OCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwcmVzc3VyZSAvICggMC4yODY5ICogKCB0ZW1wZXJhdHVyZSArIDI3My4xICkgKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbn07XHJcblxyXG5wcm9qZWN0aWxlTW90aW9uLnJlZ2lzdGVyKCAnUHJvamVjdGlsZU1vdGlvbk1vZGVsJywgUHJvamVjdGlsZU1vdGlvbk1vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQcm9qZWN0aWxlTW90aW9uTW9kZWw7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0Msc0JBQXNCLE1BQU0sK0NBQStDO0FBQ2xGLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxPQUFPQyxVQUFVLE1BQU0sd0NBQXdDO0FBQy9ELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsaUJBQWlCLE1BQU0sK0NBQStDO0FBQzdFLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFFaEUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLFNBQVMsTUFBTSxpQkFBaUI7QUFDdkMsT0FB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