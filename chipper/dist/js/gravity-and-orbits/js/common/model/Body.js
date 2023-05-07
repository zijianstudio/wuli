// Copyright 2014-2023, University of Colorado Boulder
/**
 * Body is a single point mass in the Gravity and Orbits simulation, such as the Earth, Sun, Moon or Space Station.
 * This class also keeps track of body-related data such as the path.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsStrings from '../../GravityAndOrbitsStrings.js';
import BodyState from './BodyState.js';
import RewindableProperty from './RewindableProperty.js';

// Used as a type annotation only
// eslint-disable-next-line no-view-imported-from-model
import optionize from '../../../../phet-core/js/optionize.js';
// reduce Vector2 allocation by reusing this Vector2 in collidesWith computation
const tempVector = new Vector2(0, 0);
export default class Body extends PhetioObject {
  static BodyIO = new IOType('BodyIO', {
    valueType: Body,
    documentation: 'Represents a physical body in the simulation',
    toStateObject: body => body.toStateObject(),
    applyState: (body, stateObject) => body.setStateObject(stateObject),
    stateSchema: {
      pathLength: NumberIO,
      modelPathLength: NumberIO,
      path: ArrayIO(Vector2.Vector2IO)
    }
  });

  /**
   * @param type - used for object identification
   * @param bodyConfiguration - collection of properties that define the body state
   * @param color
   * @param highlight
   * @param renderer - way to associate the graphical representation directly
   *                                                          instead of later with conditional logic or map
   * @param labelAngle
   * @param tickValue - default value for mass setting
   * @param tickLabelProperty - translatable label for the mass slider labeling the default value
   * @param model
   * @param tandem
   * @param [providedOptions]
   */
  constructor(type, bodyConfiguration, color, highlight, renderer, labelAngle, tickValue, tickLabelProperty, model, tandem, providedOptions) {
    const options = optionize()({
      pathLengthBuffer: 0,
      // a buffer to alter the path trace if necessary
      diameterScale: 1,
      // scale factor applied to the diameter
      massSettable: true,
      // can the mass of this body be set by the control panel?
      massReadoutBelow: true,
      // should the mass label appear below the body to prevent occlusion?
      orbitalCenter: new Vector2(0, 0),
      // orbital center for the body
      maxPathLength: 1400000000,
      // max path length for the body in km (should only be used if the body is too close to the center)
      pathLengthLimit: 6000,
      // limit on the number of points in the path
      rotationPeriod: null,
      // period of body rotation, in seconds - null rotation period will prevent rotation
      phetioType: Body.BodyIO,
      touchDilation: 15,
      tandem: tandem
    }, providedOptions);
    super(options);

    // indicates how much the touch radius should be expanded in any views
    this.touchDilation = options.touchDilation;

    // Keep track of the time at the beginning of a time step, for interpolation
    this.previousPosition = new Vector2(0, 0);
    const diameter = bodyConfiguration.radius * 2 * options.diameterScale;
    this.tandemName = tandem.name;

    // (read-only) {string}
    this.bodyNodeTandemName = `${tandem.name}Node`;
    this.accelerationProperty = new Vector2Property(new Vector2(0, 0));
    this.diameterProperty = new NumberProperty(diameter, {
      tandem: tandem.createTandem('diameterProperty'),
      units: 'm',
      phetioDocumentation: 'The distance across the body',
      phetioReadOnly: true
    });
    this.clockTicksSinceExplosionProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('clockTicksSinceExplosionProperty'),
      phetioDocumentation: 'for internal PhET use only',
      phetioReadOnly: true
    });
    this.boundsProperty = new Property(new Bounds2(0, 0, 0, 0));
    this.pathLengthBuffer = options.pathLengthBuffer; // (read-only)

    this.massSettable = options.massSettable; // (read-only)

    // number of samples in the path before it starts erasing (fading out from the back)
    this.maxPathLength = 0;

    // total length of the current path
    this.pathLength = 0;

    // limit on the number of segments in the path
    this.pathLengthLimit = options.pathLengthLimit;

    // total length of the current path in model coordinates
    this.modelPathLength = 0;

    // True if the mass readout should appear below the body (so that readouts don't overlap too much),
    // in the model for convenience since the body type determines where the mass readout should appear
    this.massReadoutBelow = options.massReadoutBelow; // (read-only)

    // value that this body's mass should be identified with, for 'planet' this will be the earth's mass
    this.tickValue = tickValue; // (read-only)

    // name associated with this body when it takes on the tickValue above, for 'planet' this will be "earth"
    this.tickLabelProperty = tickLabelProperty; // (read-only)

    this.color = color; // (read-only)
    this.highlight = highlight; // (read-only)
    this.type = type; // (read-only)

    // (read-only) - period of rotation for the body in seconds
    this.rotationPeriod = options.rotationPeriod;

    // (read-only) - passed to visual labels, must be translatable
    this.labelStringProperty = this.type === 'planet' ? GravityAndOrbitsStrings.planetStringProperty : this.type === 'satellite' ? GravityAndOrbitsStrings.satelliteStringProperty : this.type === 'star' ? GravityAndOrbitsStrings.starStringProperty : this.type === 'moon' ? GravityAndOrbitsStrings.moonStringProperty : null;
    assert && assert(this.labelStringProperty, `no label found for body with identifier ${this.type}`);
    assert && assert(renderer !== null);

    // Function that creates a Node for this Body. This is in the model so we can associate the graphical
    // representation directly instead of later with conditional logic or map
    this.renderer = renderer;

    // force freeze all changes to the rewind values for rewindable Property
    this.freezeRewindChangeProperty = new Property(false);
    this.labelAngle = labelAngle;
    const changeRewindValueProperty = new DerivedProperty([model.changeRewindValueProperty, this.freezeRewindChangeProperty], (modelChangeRewindProperty, freezeRewind) => modelChangeRewindProperty && !freezeRewind);

    // rewindable properties - body states can be rewound, and these properties can have saved states to support this

    this.positionProperty = new RewindableProperty(changeRewindValueProperty, new Vector2(bodyConfiguration.x, bodyConfiguration.y), {
      phetioValueType: Vector2.Vector2IO,
      tandem: tandem.createTandem('positionProperty'),
      units: 'm',
      phetioHighFrequency: true,
      phetioDocumentation: 'The position of the body'
    });
    this.velocityProperty = new RewindableProperty(changeRewindValueProperty, new Vector2(bodyConfiguration.vx, bodyConfiguration.vy), {
      phetioValueType: Vector2.Vector2IO,
      tandem: tandem.createTandem('velocityProperty'),
      units: 'm/s',
      phetioHighFrequency: true,
      phetioDocumentation: 'The absolute speed and direction of motion of the body'
    });
    this.speedProperty = new DerivedProperty([this.velocityProperty], velocity => velocity.magnitude, {
      phetioValueType: NumberIO,
      tandem: tandem.createTandem('speedProperty'),
      units: 'm/s',
      phetioHighFrequency: true,
      phetioDocumentation: 'The absolute speed of the body'
    });
    this.forceProperty = new RewindableProperty(changeRewindValueProperty, new Vector2(0, 0), {
      phetioDocumentation: 'The net force of gravity exerted on this body by other bodies',
      phetioValueType: Vector2.Vector2IO,
      tandem: tandem.createTandem('forceProperty'),
      phetioHighFrequency: true,
      units: 'N',
      phetioReadOnly: true
    });
    this.forceMagnitudeProperty = new DerivedProperty([this.forceProperty], force => force.magnitude, {
      phetioDocumentation: 'The magnitude of the net force on this body by other bodies',
      phetioValueType: NumberIO,
      tandem: tandem.createTandem('forceMagnitudeProperty'),
      phetioHighFrequency: true,
      units: 'N'
    });
    this.massProperty = new RewindableProperty(changeRewindValueProperty, bodyConfiguration.mass, {
      tandem: tandem.createTandem('massProperty'),
      phetioValueType: NumberIO,
      units: 'kg',
      phetioDocumentation: 'The mass of the body'
    });
    this.isCollidedProperty = new RewindableProperty(changeRewindValueProperty, false, {
      tandem: tandem.createTandem('isCollidedProperty'),
      phetioValueType: BooleanIO,
      phetioReadOnly: true,
      phetioDocumentation: 'True if the body has collided with another body'
    });
    this.rotationProperty = new RewindableProperty(changeRewindValueProperty, 0, {
      tandem: tandem.createTandem('rotationProperty'),
      phetioValueType: NumberIO,
      units: 'radians',
      phetioHighFrequency: true,
      phetioDocumentation: 'The rotation of the body about its own origin'
    });

    // (read-only)
    this.isMovableProperty = new BooleanProperty(bodyConfiguration.isMovable, {
      tandem: tandem.createTandem('isMovableProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'If true, the body can move during the physics update.'
    });
    this.density = bodyConfiguration.mass / this.getVolume();

    // true if the user is currently controlling the position of the body with the mouse
    this.userControlled = false;
    this.path = []; // {Vector2[]} array of the points in the body's trail

    // emitters for various events
    this.pointAddedEmitter = new Emitter({
      parameters: [{
        valueType: Vector2
      }, {
        validValues: ['planet', 'satellite', 'star', 'moon']
      }]
    });
    this.pointRemovedEmitter = new Emitter({
      parameters: [{
        validValues: ['planet', 'satellite', 'star', 'moon']
      }]
    });
    this.clearedEmitter = new Emitter({
      parameters: [{
        validValues: ['planet', 'satellite', 'star', 'moon']
      }]
    });
    this.userModifiedPositionEmitter = new Emitter();
    this.userModifiedVelocityEmitter = new Emitter();
    this.isCollidedProperty.link(collided => {
      if (collided) {
        this.clockTicksSinceExplosionProperty.set(0);
      }
    });
    assert && assert(this.positionProperty.initialValue, 'initial value should be truthy');
    const initialPosition = this.positionProperty.initialValue.minus(options.orbitalCenter);
    const distToCenter = initialPosition.magnitude;

    // determine the max path length for the body in model coordinates
    if (distToCenter < 1000) {
      // if too close to the center, use this optional length
      this.maxPathLength = options.maxPathLength;
    } else {
      // max path length is ~0.85 of a full orbit
      this.maxPathLength = 0.85 * 2 * Math.PI * distToCenter + this.pathLengthBuffer;
    }
  }
  getVolume() {
    return 4.0 / 3.0 * Math.PI * Math.pow(this.getRadius(), 3);
  }
  getRadius() {
    return this.diameterProperty.get() / 2;
  }

  /**
   * (phet-io)
   */
  toStateObject() {
    return {
      pathLength: this.pathLength,
      modelPathLength: this.modelPathLength,
      path: ArrayIO(Vector2.Vector2IO).toStateObject(this.path)
    };
  }

  /**
   * (phet-io)
   */
  setStateObject(stateObject) {
    this.pathLength = stateObject.pathLength;
    this.modelPathLength = stateObject.modelPathLength;
    this.path = ArrayIO(Vector2.Vector2IO).fromStateObject(stateObject.path);
    this.clearedEmitter.emit(this.type);
    this.path.forEach(pathPoint => this.pointAddedEmitter.emit(pathPoint, this.type));
  }

  /**
   * Create an immutable representation of this body for use in the physics engine
   * use copy() for Vector2 so that the properties don't get mutated
   */
  toBodyState() {
    return new BodyState(this, this.positionProperty.get().copy(), this.velocityProperty.get().copy(), this.accelerationProperty.get().copy(), this.massProperty.get(), this.isCollidedProperty.get(), this.rotationProperty.get(), this.rotationPeriod);
  }

  /**
   * Save the current state of the body by storing the values of all rewindable properties.  This should only
   * be called when the clock is paused.
   */
  saveBodyState() {
    this.positionProperty.storeRewindValueNoNotify();
    this.velocityProperty.storeRewindValueNoNotify();
    this.forceProperty.storeRewindValueNoNotify();
    this.massProperty.storeRewindValueNoNotify();
    this.isCollidedProperty.storeRewindValueNoNotify();
    this.rotationProperty.storeRewindValueNoNotify();
  }

  /**
   * Take the updated BodyState from the physics engine and update the state of this body based on it.
   */
  updateBodyStateFromModel(bodyState) {
    if (!this.isCollidedProperty.value) {
      if (this.isMovableProperty.value && !this.userControlled) {
        this.positionProperty.set(bodyState.position);
        this.velocityProperty.set(bodyState.velocity);
      }
      this.accelerationProperty.value = bodyState.acceleration;
      this.forceProperty.set(bodyState.acceleration.multiplyScalar(bodyState.mass));
      this.rotationProperty.set(bodyState.rotation);
    }
  }

  /**
   * This method is called after all bodies have been updated by the physics engine (must be done as a batch),
   * so that the path can be updated
   *
   */
  modelStepped() {
    // Only add to the path if the user isn't dragging it and if the body is not exploded and the body is movable
    if (!this.userControlled && !this.isCollidedProperty.get() && this.isMovableProperty.value) {
      this.addPathPoint();
    }
  }

  /**
   * Add a point to the collection of points that follow the trajectory of a moving body.
   * This also removes points when the path gets too long.
   */
  addPathPoint() {
    const pathPoint = this.positionProperty.get();
    this.path.push(pathPoint);
    this.pointAddedEmitter.emit(pathPoint, this.type);

    // add the length to the tracked path length
    if (this.path.length > 2) {
      const difference = this.path[this.path.length - 1].minus(this.path[this.path.length - 2]);
      const addedMagnitude = difference.magnitude;
      this.modelPathLength += addedMagnitude;
    }

    // remove points from the path as the path gets too long
    // if the path grows more than ~6000 points, start removing points
    while (this.modelPathLength > this.maxPathLength || this.path.length > this.pathLengthLimit) {
      const loss = this.path[1].minus(this.path[0]);
      const lossMagnitude = loss.magnitude;
      this.path.shift();
      this.pointRemovedEmitter.emit(this.type);
      this.modelPathLength -= lossMagnitude;
    }
  }

  /**
   * Clear the whole path of points tracking the body's trajectory.
   */
  clearPath() {
    this.path = [];
    this.pathLength = 0;
    this.modelPathLength = 0;
    this.clearedEmitter.emit(this.type);
  }
  resetAll() {
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.forceProperty.reset();
    this.massProperty.reset();
    this.diameterProperty.reset();
    this.isCollidedProperty.reset();
    this.clockTicksSinceExplosionProperty.reset();
    this.rotationProperty.reset();
    this.clearPath();
  }

  /**
   * Create an image renderer for this body.
   */
  createRenderer(viewDiameter) {
    return this.renderer(this, viewDiameter);
  }

  /**
   * Keep track of the time at the beginning of a time step, for interpolation
   */
  storePreviousPosition() {
    this.previousPosition.x = this.positionProperty.value.x;
    this.previousPosition.y = this.positionProperty.value.y;
  }

  /**
   * Check to see if this body collides with another.
   */
  collidesWidth(body) {
    const position1 = this.positionProperty.get();
    const position2 = body.positionProperty.get();

    // reuse tempVector to reduce Vector2 allocations
    tempVector.x = position1.x - position2.x;
    tempVector.y = position1.y - position2.y;
    const distance = tempVector.magnitude;
    const radiiSum = this.diameterProperty.get() / 2 + body.diameterProperty.get() / 2;
    return distance < radiiSum;
  }

  /**
   * Rewind all rewindable properties to their values in the last time step.
   *
   */
  rewind() {
    this.positionProperty.rewind();
    this.velocityProperty.rewind();
    this.forceProperty.rewind();
    this.massProperty.rewind();
    this.isCollidedProperty.rewind();
    this.rotationProperty.rewind();
    this.clearPath();
  }

  /**
   * Returns the Properties which, when changed, enable the rewind button.
   */
  getRewindableProperties() {
    return [this.positionProperty, this.velocityProperty, this.massProperty, this.isCollidedProperty];
  }
  resetPositionAndVelocity() {
    this.positionProperty.reset();
    this.velocityProperty.reset();
  }
  toString() {
    return `name = ${this.type}, mass = ${this.massProperty.get()}`;
  }
}
gravityAndOrbits.register('Body', Body);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiUGhldGlvT2JqZWN0IiwiQXJyYXlJTyIsIkJvb2xlYW5JTyIsIklPVHlwZSIsIk51bWJlcklPIiwiZ3Jhdml0eUFuZE9yYml0cyIsIkdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzIiwiQm9keVN0YXRlIiwiUmV3aW5kYWJsZVByb3BlcnR5Iiwib3B0aW9uaXplIiwidGVtcFZlY3RvciIsIkJvZHkiLCJCb2R5SU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwidG9TdGF0ZU9iamVjdCIsImJvZHkiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJzZXRTdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwicGF0aExlbmd0aCIsIm1vZGVsUGF0aExlbmd0aCIsInBhdGgiLCJWZWN0b3IySU8iLCJjb25zdHJ1Y3RvciIsInR5cGUiLCJib2R5Q29uZmlndXJhdGlvbiIsImNvbG9yIiwiaGlnaGxpZ2h0IiwicmVuZGVyZXIiLCJsYWJlbEFuZ2xlIiwidGlja1ZhbHVlIiwidGlja0xhYmVsUHJvcGVydHkiLCJtb2RlbCIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwYXRoTGVuZ3RoQnVmZmVyIiwiZGlhbWV0ZXJTY2FsZSIsIm1hc3NTZXR0YWJsZSIsIm1hc3NSZWFkb3V0QmVsb3ciLCJvcmJpdGFsQ2VudGVyIiwibWF4UGF0aExlbmd0aCIsInBhdGhMZW5ndGhMaW1pdCIsInJvdGF0aW9uUGVyaW9kIiwicGhldGlvVHlwZSIsInRvdWNoRGlsYXRpb24iLCJwcmV2aW91c1Bvc2l0aW9uIiwiZGlhbWV0ZXIiLCJyYWRpdXMiLCJ0YW5kZW1OYW1lIiwibmFtZSIsImJvZHlOb2RlVGFuZGVtTmFtZSIsImFjY2VsZXJhdGlvblByb3BlcnR5IiwiZGlhbWV0ZXJQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInVuaXRzIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1JlYWRPbmx5IiwiY2xvY2tUaWNrc1NpbmNlRXhwbG9zaW9uUHJvcGVydHkiLCJib3VuZHNQcm9wZXJ0eSIsImxhYmVsU3RyaW5nUHJvcGVydHkiLCJwbGFuZXRTdHJpbmdQcm9wZXJ0eSIsInNhdGVsbGl0ZVN0cmluZ1Byb3BlcnR5Iiwic3RhclN0cmluZ1Byb3BlcnR5IiwibW9vblN0cmluZ1Byb3BlcnR5IiwiYXNzZXJ0IiwiZnJlZXplUmV3aW5kQ2hhbmdlUHJvcGVydHkiLCJjaGFuZ2VSZXdpbmRWYWx1ZVByb3BlcnR5IiwibW9kZWxDaGFuZ2VSZXdpbmRQcm9wZXJ0eSIsImZyZWV6ZVJld2luZCIsInBvc2l0aW9uUHJvcGVydHkiLCJ4IiwieSIsInBoZXRpb1ZhbHVlVHlwZSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJ2ZWxvY2l0eVByb3BlcnR5IiwidngiLCJ2eSIsInNwZWVkUHJvcGVydHkiLCJ2ZWxvY2l0eSIsIm1hZ25pdHVkZSIsImZvcmNlUHJvcGVydHkiLCJmb3JjZU1hZ25pdHVkZVByb3BlcnR5IiwiZm9yY2UiLCJtYXNzUHJvcGVydHkiLCJtYXNzIiwiaXNDb2xsaWRlZFByb3BlcnR5Iiwicm90YXRpb25Qcm9wZXJ0eSIsImlzTW92YWJsZVByb3BlcnR5IiwiaXNNb3ZhYmxlIiwiZGVuc2l0eSIsImdldFZvbHVtZSIsInVzZXJDb250cm9sbGVkIiwicG9pbnRBZGRlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsaWRWYWx1ZXMiLCJwb2ludFJlbW92ZWRFbWl0dGVyIiwiY2xlYXJlZEVtaXR0ZXIiLCJ1c2VyTW9kaWZpZWRQb3NpdGlvbkVtaXR0ZXIiLCJ1c2VyTW9kaWZpZWRWZWxvY2l0eUVtaXR0ZXIiLCJsaW5rIiwiY29sbGlkZWQiLCJzZXQiLCJpbml0aWFsVmFsdWUiLCJpbml0aWFsUG9zaXRpb24iLCJtaW51cyIsImRpc3RUb0NlbnRlciIsIk1hdGgiLCJQSSIsInBvdyIsImdldFJhZGl1cyIsImdldCIsImZyb21TdGF0ZU9iamVjdCIsImVtaXQiLCJmb3JFYWNoIiwicGF0aFBvaW50IiwidG9Cb2R5U3RhdGUiLCJjb3B5Iiwic2F2ZUJvZHlTdGF0ZSIsInN0b3JlUmV3aW5kVmFsdWVOb05vdGlmeSIsInVwZGF0ZUJvZHlTdGF0ZUZyb21Nb2RlbCIsImJvZHlTdGF0ZSIsInZhbHVlIiwicG9zaXRpb24iLCJhY2NlbGVyYXRpb24iLCJtdWx0aXBseVNjYWxhciIsInJvdGF0aW9uIiwibW9kZWxTdGVwcGVkIiwiYWRkUGF0aFBvaW50IiwicHVzaCIsImxlbmd0aCIsImRpZmZlcmVuY2UiLCJhZGRlZE1hZ25pdHVkZSIsImxvc3MiLCJsb3NzTWFnbml0dWRlIiwic2hpZnQiLCJjbGVhclBhdGgiLCJyZXNldEFsbCIsInJlc2V0IiwiY3JlYXRlUmVuZGVyZXIiLCJ2aWV3RGlhbWV0ZXIiLCJzdG9yZVByZXZpb3VzUG9zaXRpb24iLCJjb2xsaWRlc1dpZHRoIiwicG9zaXRpb24xIiwicG9zaXRpb24yIiwiZGlzdGFuY2UiLCJyYWRpaVN1bSIsInJld2luZCIsImdldFJld2luZGFibGVQcm9wZXJ0aWVzIiwicmVzZXRQb3NpdGlvbkFuZFZlbG9jaXR5IiwidG9TdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJvZHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8qKlxyXG4gKiBCb2R5IGlzIGEgc2luZ2xlIHBvaW50IG1hc3MgaW4gdGhlIEdyYXZpdHkgYW5kIE9yYml0cyBzaW11bGF0aW9uLCBzdWNoIGFzIHRoZSBFYXJ0aCwgU3VuLCBNb29uIG9yIFNwYWNlIFN0YXRpb24uXHJcbiAqIFRoaXMgY2xhc3MgYWxzbyBrZWVwcyB0cmFjayBvZiBib2R5LXJlbGF0ZWQgZGF0YSBzdWNoIGFzIHRoZSBwYXRoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIsIHsgVmVjdG9yMlN0YXRlT2JqZWN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IGdyYXZpdHlBbmRPcmJpdHMgZnJvbSAnLi4vLi4vZ3Jhdml0eUFuZE9yYml0cy5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncyBmcm9tICcuLi8uLi9HcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCb2R5U3RhdGUgZnJvbSAnLi9Cb2R5U3RhdGUuanMnO1xyXG5pbXBvcnQgQm9keVR5cGVFbnVtIGZyb20gJy4vQm9keVR5cGVFbnVtLmpzJztcclxuaW1wb3J0IFJld2luZGFibGVQcm9wZXJ0eSBmcm9tICcuL1Jld2luZGFibGVQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb2R5Q29uZmlndXJhdGlvbiBmcm9tICcuL0JvZHlDb25maWd1cmF0aW9uLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gVXNlZCBhcyBhIHR5cGUgYW5ub3RhdGlvbiBvbmx5XHJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12aWV3LWltcG9ydGVkLWZyb20tbW9kZWxcclxuaW1wb3J0IEJvZHlSZW5kZXJlciBmcm9tICcuLi92aWV3L0JvZHlSZW5kZXJlci5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzTW9kZWwgZnJvbSAnLi9HcmF2aXR5QW5kT3JiaXRzTW9kZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcblxyXG4vLyByZWR1Y2UgVmVjdG9yMiBhbGxvY2F0aW9uIGJ5IHJldXNpbmcgdGhpcyBWZWN0b3IyIGluIGNvbGxpZGVzV2l0aCBjb21wdXRhdGlvblxyXG5jb25zdCB0ZW1wVmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcGF0aExlbmd0aEJ1ZmZlcj86IG51bWJlcjtcclxuICBkaWFtZXRlclNjYWxlPzogbnVtYmVyO1xyXG4gIG1hc3NTZXR0YWJsZT86IGJvb2xlYW47XHJcbiAgbWFzc1JlYWRvdXRCZWxvdz86IGJvb2xlYW47XHJcbiAgb3JiaXRhbENlbnRlcj86IFZlY3RvcjI7XHJcbiAgbWF4UGF0aExlbmd0aD86IG51bWJlcjtcclxuICBwYXRoTGVuZ3RoTGltaXQ/OiBudW1iZXI7XHJcbiAgcm90YXRpb25QZXJpb2Q/OiBudWxsIHwgbnVtYmVyO1xyXG4gIHRvdWNoRGlsYXRpb24/OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIEJvZHlPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaGV0aW9PYmplY3RPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9keSBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIHB1YmxpYyBwYXRoTGVuZ3RoOiBudW1iZXI7XHJcbiAgcHVibGljIHBhdGg6IFZlY3RvcjJbXTtcclxuICBwdWJsaWMgdXNlckNvbnRyb2xsZWQ6IGJvb2xlYW47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNsb2NrVGlja3NTaW5jZUV4cGxvc2lvblByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGRlbnNpdHk6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdG91Y2hEaWxhdGlvbjogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJldmlvdXNQb3NpdGlvbjogVmVjdG9yMjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdHlwZTogQm9keVR5cGVFbnVtO1xyXG4gIHB1YmxpYyByZWFkb25seSBsYWJlbFN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWFzc1Byb3BlcnR5OiBSZXdpbmRhYmxlUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdmVsb2NpdHlQcm9wZXJ0eTogUmV3aW5kYWJsZVByb3BlcnR5PFZlY3RvcjI+O1xyXG4gIHB1YmxpYyByZWFkb25seSBkaWFtZXRlclByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgZnJlZXplUmV3aW5kQ2hhbmdlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBwb3NpdGlvblByb3BlcnR5OiBSZXdpbmRhYmxlUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzQ29sbGlkZWRQcm9wZXJ0eTogUmV3aW5kYWJsZVByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSByb3RhdGlvblByb3BlcnR5OiBSZXdpbmRhYmxlUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcG9pbnRBZGRlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgVmVjdG9yMiwgQm9keVR5cGVFbnVtIF0+O1xyXG4gIHB1YmxpYyByZWFkb25seSBwb2ludFJlbW92ZWRFbWl0dGVyOiBURW1pdHRlcjxbIEJvZHlUeXBlRW51bSBdPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY2xlYXJlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgQm9keVR5cGVFbnVtIF0+O1xyXG4gIHB1YmxpYyByZWFkb25seSB1c2VyTW9kaWZpZWRQb3NpdGlvbkVtaXR0ZXI6IFRFbWl0dGVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB1c2VyTW9kaWZpZWRWZWxvY2l0eUVtaXR0ZXI6IFRFbWl0dGVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0YW5kZW1OYW1lOiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRpY2tWYWx1ZTogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB0aWNrTGFiZWxQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWFzc1JlYWRvdXRCZWxvdzogYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYm9keU5vZGVUYW5kZW1OYW1lOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBhY2NlbGVyYXRpb25Qcm9wZXJ0eTogVmVjdG9yMlByb3BlcnR5O1xyXG4gIHB1YmxpYyByZWFkb25seSBib3VuZHNQcm9wZXJ0eTogUHJvcGVydHk8Qm91bmRzMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IG1hc3NTZXR0YWJsZTogYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWF4UGF0aExlbmd0aDogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGF0aExlbmd0aEJ1ZmZlcjogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGF0aExlbmd0aExpbWl0OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBtb2RlbFBhdGhMZW5ndGg6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY29sb3I6IENvbG9yO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaGlnaGxpZ2h0OiBDb2xvcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHJvdGF0aW9uUGVyaW9kOiBudW1iZXIgfCBudWxsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVuZGVyZXI6ICggYXJnMDogQm9keSwgYXJnMTogbnVtYmVyICkgPT4gQm9keVJlbmRlcmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBsYWJlbEFuZ2xlOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzcGVlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyByZWFkb25seSBmb3JjZVByb3BlcnR5OiBSZXdpbmRhYmxlUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBmb3JjZU1hZ25pdHVkZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHB1YmxpYyByZWFkb25seSBpc01vdmFibGVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJvZHlJTyA9IG5ldyBJT1R5cGU8Qm9keSwgQm9keVN0YXRlVHlwZT4oICdCb2R5SU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IEJvZHksXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnUmVwcmVzZW50cyBhIHBoeXNpY2FsIGJvZHkgaW4gdGhlIHNpbXVsYXRpb24nLFxyXG4gICAgdG9TdGF0ZU9iamVjdDogKCBib2R5OiBCb2R5ICkgPT4gYm9keS50b1N0YXRlT2JqZWN0KCksXHJcbiAgICBhcHBseVN0YXRlOiAoIGJvZHk6IEJvZHksIHN0YXRlT2JqZWN0OiBCb2R5U3RhdGVUeXBlICkgPT4gYm9keS5zZXRTdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKSxcclxuICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgIHBhdGhMZW5ndGg6IE51bWJlcklPLFxyXG4gICAgICBtb2RlbFBhdGhMZW5ndGg6IE51bWJlcklPLFxyXG4gICAgICBwYXRoOiBBcnJheUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApXHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdHlwZSAtIHVzZWQgZm9yIG9iamVjdCBpZGVudGlmaWNhdGlvblxyXG4gICAqIEBwYXJhbSBib2R5Q29uZmlndXJhdGlvbiAtIGNvbGxlY3Rpb24gb2YgcHJvcGVydGllcyB0aGF0IGRlZmluZSB0aGUgYm9keSBzdGF0ZVxyXG4gICAqIEBwYXJhbSBjb2xvclxyXG4gICAqIEBwYXJhbSBoaWdobGlnaHRcclxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSB3YXkgdG8gYXNzb2NpYXRlIHRoZSBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gZGlyZWN0bHlcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0ZWFkIG9mIGxhdGVyIHdpdGggY29uZGl0aW9uYWwgbG9naWMgb3IgbWFwXHJcbiAgICogQHBhcmFtIGxhYmVsQW5nbGVcclxuICAgKiBAcGFyYW0gdGlja1ZhbHVlIC0gZGVmYXVsdCB2YWx1ZSBmb3IgbWFzcyBzZXR0aW5nXHJcbiAgICogQHBhcmFtIHRpY2tMYWJlbFByb3BlcnR5IC0gdHJhbnNsYXRhYmxlIGxhYmVsIGZvciB0aGUgbWFzcyBzbGlkZXIgbGFiZWxpbmcgdGhlIGRlZmF1bHQgdmFsdWVcclxuICAgKiBAcGFyYW0gbW9kZWxcclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0eXBlOiBCb2R5VHlwZUVudW0sIGJvZHlDb25maWd1cmF0aW9uOiBCb2R5Q29uZmlndXJhdGlvbiwgY29sb3I6IENvbG9yLCBoaWdobGlnaHQ6IENvbG9yLCByZW5kZXJlcjogKCBhcmcwOiBCb2R5LCBhcmcxOiBudW1iZXIgKSA9PiBCb2R5UmVuZGVyZXIsIGxhYmVsQW5nbGU6IG51bWJlciwgdGlja1ZhbHVlOiBudW1iZXIsIHRpY2tMYWJlbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBtb2RlbDogR3Jhdml0eUFuZE9yYml0c01vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0sIHByb3ZpZGVkT3B0aW9ucz86IEJvZHlPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Qm9keU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICBwYXRoTGVuZ3RoQnVmZmVyOiAwLCAvLyBhIGJ1ZmZlciB0byBhbHRlciB0aGUgcGF0aCB0cmFjZSBpZiBuZWNlc3NhcnlcclxuICAgICAgZGlhbWV0ZXJTY2FsZTogMSwgLy8gc2NhbGUgZmFjdG9yIGFwcGxpZWQgdG8gdGhlIGRpYW1ldGVyXHJcbiAgICAgIG1hc3NTZXR0YWJsZTogdHJ1ZSwgLy8gY2FuIHRoZSBtYXNzIG9mIHRoaXMgYm9keSBiZSBzZXQgYnkgdGhlIGNvbnRyb2wgcGFuZWw/XHJcbiAgICAgIG1hc3NSZWFkb3V0QmVsb3c6IHRydWUsIC8vIHNob3VsZCB0aGUgbWFzcyBsYWJlbCBhcHBlYXIgYmVsb3cgdGhlIGJvZHkgdG8gcHJldmVudCBvY2NsdXNpb24/XHJcbiAgICAgIG9yYml0YWxDZW50ZXI6IG5ldyBWZWN0b3IyKCAwLCAwICksIC8vIG9yYml0YWwgY2VudGVyIGZvciB0aGUgYm9keVxyXG4gICAgICBtYXhQYXRoTGVuZ3RoOiAxNDAwMDAwMDAwLCAvLyBtYXggcGF0aCBsZW5ndGggZm9yIHRoZSBib2R5IGluIGttIChzaG91bGQgb25seSBiZSB1c2VkIGlmIHRoZSBib2R5IGlzIHRvbyBjbG9zZSB0byB0aGUgY2VudGVyKVxyXG4gICAgICBwYXRoTGVuZ3RoTGltaXQ6IDYwMDAsIC8vIGxpbWl0IG9uIHRoZSBudW1iZXIgb2YgcG9pbnRzIGluIHRoZSBwYXRoXHJcbiAgICAgIHJvdGF0aW9uUGVyaW9kOiBudWxsLCAvLyBwZXJpb2Qgb2YgYm9keSByb3RhdGlvbiwgaW4gc2Vjb25kcyAtIG51bGwgcm90YXRpb24gcGVyaW9kIHdpbGwgcHJldmVudCByb3RhdGlvblxyXG4gICAgICBwaGV0aW9UeXBlOiBCb2R5LkJvZHlJTyxcclxuICAgICAgdG91Y2hEaWxhdGlvbjogMTUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGluZGljYXRlcyBob3cgbXVjaCB0aGUgdG91Y2ggcmFkaXVzIHNob3VsZCBiZSBleHBhbmRlZCBpbiBhbnkgdmlld3NcclxuICAgIHRoaXMudG91Y2hEaWxhdGlvbiA9IG9wdGlvbnMudG91Y2hEaWxhdGlvbjtcclxuXHJcbiAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSB0aW1lIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSB0aW1lIHN0ZXAsIGZvciBpbnRlcnBvbGF0aW9uXHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgIGNvbnN0IGRpYW1ldGVyID0gKCBib2R5Q29uZmlndXJhdGlvbi5yYWRpdXMgKiAyICkgKiBvcHRpb25zLmRpYW1ldGVyU2NhbGU7XHJcblxyXG4gICAgdGhpcy50YW5kZW1OYW1lID0gdGFuZGVtLm5hbWU7XHJcblxyXG4gICAgLy8gKHJlYWQtb25seSkge3N0cmluZ31cclxuICAgIHRoaXMuYm9keU5vZGVUYW5kZW1OYW1lID0gYCR7dGFuZGVtLm5hbWV9Tm9kZWA7XHJcblxyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAwICkgKTtcclxuICAgIHRoaXMuZGlhbWV0ZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggZGlhbWV0ZXIsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlhbWV0ZXJQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBkaXN0YW5jZSBhY3Jvc3MgdGhlIGJvZHknLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2xvY2tUaWNrc1NpbmNlRXhwbG9zaW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2xvY2tUaWNrc1NpbmNlRXhwbG9zaW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdmb3IgaW50ZXJuYWwgUGhFVCB1c2Ugb25seScsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApICk7XHJcblxyXG4gICAgdGhpcy5wYXRoTGVuZ3RoQnVmZmVyID0gb3B0aW9ucy5wYXRoTGVuZ3RoQnVmZmVyOyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIHRoaXMubWFzc1NldHRhYmxlID0gb3B0aW9ucy5tYXNzU2V0dGFibGU7IC8vIChyZWFkLW9ubHkpXHJcblxyXG4gICAgLy8gbnVtYmVyIG9mIHNhbXBsZXMgaW4gdGhlIHBhdGggYmVmb3JlIGl0IHN0YXJ0cyBlcmFzaW5nIChmYWRpbmcgb3V0IGZyb20gdGhlIGJhY2spXHJcbiAgICB0aGlzLm1heFBhdGhMZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIHRvdGFsIGxlbmd0aCBvZiB0aGUgY3VycmVudCBwYXRoXHJcbiAgICB0aGlzLnBhdGhMZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIGxpbWl0IG9uIHRoZSBudW1iZXIgb2Ygc2VnbWVudHMgaW4gdGhlIHBhdGhcclxuICAgIHRoaXMucGF0aExlbmd0aExpbWl0ID0gb3B0aW9ucy5wYXRoTGVuZ3RoTGltaXQ7XHJcblxyXG4gICAgLy8gdG90YWwgbGVuZ3RoIG9mIHRoZSBjdXJyZW50IHBhdGggaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgIHRoaXMubW9kZWxQYXRoTGVuZ3RoID0gMDtcclxuXHJcbiAgICAvLyBUcnVlIGlmIHRoZSBtYXNzIHJlYWRvdXQgc2hvdWxkIGFwcGVhciBiZWxvdyB0aGUgYm9keSAoc28gdGhhdCByZWFkb3V0cyBkb24ndCBvdmVybGFwIHRvbyBtdWNoKSxcclxuICAgIC8vIGluIHRoZSBtb2RlbCBmb3IgY29udmVuaWVuY2Ugc2luY2UgdGhlIGJvZHkgdHlwZSBkZXRlcm1pbmVzIHdoZXJlIHRoZSBtYXNzIHJlYWRvdXQgc2hvdWxkIGFwcGVhclxyXG4gICAgdGhpcy5tYXNzUmVhZG91dEJlbG93ID0gb3B0aW9ucy5tYXNzUmVhZG91dEJlbG93OyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIC8vIHZhbHVlIHRoYXQgdGhpcyBib2R5J3MgbWFzcyBzaG91bGQgYmUgaWRlbnRpZmllZCB3aXRoLCBmb3IgJ3BsYW5ldCcgdGhpcyB3aWxsIGJlIHRoZSBlYXJ0aCdzIG1hc3NcclxuICAgIHRoaXMudGlja1ZhbHVlID0gdGlja1ZhbHVlOyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIC8vIG5hbWUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYm9keSB3aGVuIGl0IHRha2VzIG9uIHRoZSB0aWNrVmFsdWUgYWJvdmUsIGZvciAncGxhbmV0JyB0aGlzIHdpbGwgYmUgXCJlYXJ0aFwiXHJcbiAgICB0aGlzLnRpY2tMYWJlbFByb3BlcnR5ID0gdGlja0xhYmVsUHJvcGVydHk7IC8vIChyZWFkLW9ubHkpXHJcblxyXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yOyAvLyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5oaWdobGlnaHQgPSBoaWdobGlnaHQ7IC8vIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlOyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIC8vIChyZWFkLW9ubHkpIC0gcGVyaW9kIG9mIHJvdGF0aW9uIGZvciB0aGUgYm9keSBpbiBzZWNvbmRzXHJcbiAgICB0aGlzLnJvdGF0aW9uUGVyaW9kID0gb3B0aW9ucy5yb3RhdGlvblBlcmlvZDtcclxuXHJcbiAgICAvLyAocmVhZC1vbmx5KSAtIHBhc3NlZCB0byB2aXN1YWwgbGFiZWxzLCBtdXN0IGJlIHRyYW5zbGF0YWJsZVxyXG4gICAgdGhpcy5sYWJlbFN0cmluZ1Byb3BlcnR5ID0gdGhpcy50eXBlID09PSAncGxhbmV0JyA/IEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLnBsYW5ldFN0cmluZ1Byb3BlcnR5IDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9PT0gJ3NhdGVsbGl0ZScgPyBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5zYXRlbGxpdGVTdHJpbmdQcm9wZXJ0eSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPT09ICdzdGFyJyA/IEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLnN0YXJTdHJpbmdQcm9wZXJ0eSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPT09ICdtb29uJyA/IEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLm1vb25TdHJpbmdQcm9wZXJ0eSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5sYWJlbFN0cmluZ1Byb3BlcnR5LCBgbm8gbGFiZWwgZm91bmQgZm9yIGJvZHkgd2l0aCBpZGVudGlmaWVyICR7dGhpcy50eXBlfWAgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZW5kZXJlciAhPT0gbnVsbCApO1xyXG5cclxuICAgIC8vIEZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIE5vZGUgZm9yIHRoaXMgQm9keS4gVGhpcyBpcyBpbiB0aGUgbW9kZWwgc28gd2UgY2FuIGFzc29jaWF0ZSB0aGUgZ3JhcGhpY2FsXHJcbiAgICAvLyByZXByZXNlbnRhdGlvbiBkaXJlY3RseSBpbnN0ZWFkIG9mIGxhdGVyIHdpdGggY29uZGl0aW9uYWwgbG9naWMgb3IgbWFwXHJcbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XHJcblxyXG4gICAgLy8gZm9yY2UgZnJlZXplIGFsbCBjaGFuZ2VzIHRvIHRoZSByZXdpbmQgdmFsdWVzIGZvciByZXdpbmRhYmxlIFByb3BlcnR5XHJcbiAgICB0aGlzLmZyZWV6ZVJld2luZENoYW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PGJvb2xlYW4+KCBmYWxzZSApO1xyXG5cclxuICAgIHRoaXMubGFiZWxBbmdsZSA9IGxhYmVsQW5nbGU7XHJcblxyXG4gICAgY29uc3QgY2hhbmdlUmV3aW5kVmFsdWVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFtcclxuICAgICAgICBtb2RlbC5jaGFuZ2VSZXdpbmRWYWx1ZVByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuZnJlZXplUmV3aW5kQ2hhbmdlUHJvcGVydHlcclxuICAgICAgXSwgKCBtb2RlbENoYW5nZVJld2luZFByb3BlcnR5LCBmcmVlemVSZXdpbmQgKSA9PlxyXG4gICAgICAgIG1vZGVsQ2hhbmdlUmV3aW5kUHJvcGVydHkgJiYgIWZyZWV6ZVJld2luZFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyByZXdpbmRhYmxlIHByb3BlcnRpZXMgLSBib2R5IHN0YXRlcyBjYW4gYmUgcmV3b3VuZCwgYW5kIHRoZXNlIHByb3BlcnRpZXMgY2FuIGhhdmUgc2F2ZWQgc3RhdGVzIHRvIHN1cHBvcnQgdGhpc1xyXG5cclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBSZXdpbmRhYmxlUHJvcGVydHk8VmVjdG9yMj4oIGNoYW5nZVJld2luZFZhbHVlUHJvcGVydHksIG5ldyBWZWN0b3IyKCBib2R5Q29uZmlndXJhdGlvbi54LCBib2R5Q29uZmlndXJhdGlvbi55ICksIHtcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJyxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBwb3NpdGlvbiBvZiB0aGUgYm9keSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkgPSBuZXcgUmV3aW5kYWJsZVByb3BlcnR5KCBjaGFuZ2VSZXdpbmRWYWx1ZVByb3BlcnR5LCBuZXcgVmVjdG9yMiggYm9keUNvbmZpZ3VyYXRpb24udngsIGJvZHlDb25maWd1cmF0aW9uLnZ5ICksIHtcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVsb2NpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtL3MnLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGFic29sdXRlIHNwZWVkIGFuZCBkaXJlY3Rpb24gb2YgbW90aW9uIG9mIHRoZSBib2R5J1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3BlZWRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy52ZWxvY2l0eVByb3BlcnR5IF0sIHZlbG9jaXR5ID0+IHZlbG9jaXR5Lm1hZ25pdHVkZSwge1xyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGVlZFByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ20vcycsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgYWJzb2x1dGUgc3BlZWQgb2YgdGhlIGJvZHknXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mb3JjZVByb3BlcnR5ID0gbmV3IFJld2luZGFibGVQcm9wZXJ0eSggY2hhbmdlUmV3aW5kVmFsdWVQcm9wZXJ0eSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwge1xyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIG5ldCBmb3JjZSBvZiBncmF2aXR5IGV4ZXJ0ZWQgb24gdGhpcyBib2R5IGJ5IG90aGVyIGJvZGllcycsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAnTicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mb3JjZU1hZ25pdHVkZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmZvcmNlUHJvcGVydHkgXSwgZm9yY2UgPT4gZm9yY2UubWFnbml0dWRlLCB7XHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgbWFnbml0dWRlIG9mIHRoZSBuZXQgZm9yY2Ugb24gdGhpcyBib2R5IGJ5IG90aGVyIGJvZGllcycsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlTWFnbml0dWRlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAnTidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1hc3NQcm9wZXJ0eSA9IG5ldyBSZXdpbmRhYmxlUHJvcGVydHkoIGNoYW5nZVJld2luZFZhbHVlUHJvcGVydHksIGJvZHlDb25maWd1cmF0aW9uLm1hc3MsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzc1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPLFxyXG4gICAgICB1bml0czogJ2tnJyxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBtYXNzIG9mIHRoZSBib2R5J1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaXNDb2xsaWRlZFByb3BlcnR5ID0gbmV3IFJld2luZGFibGVQcm9wZXJ0eTxib29sZWFuPiggY2hhbmdlUmV3aW5kVmFsdWVQcm9wZXJ0eSwgZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNDb2xsaWRlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IEJvb2xlYW5JTyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUcnVlIGlmIHRoZSBib2R5IGhhcyBjb2xsaWRlZCB3aXRoIGFub3RoZXIgYm9keSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJvdGF0aW9uUHJvcGVydHkgPSBuZXcgUmV3aW5kYWJsZVByb3BlcnR5PG51bWJlcj4oIGNoYW5nZVJld2luZFZhbHVlUHJvcGVydHksIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncm90YXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJTyxcclxuICAgICAgdW5pdHM6ICdyYWRpYW5zJyxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSByb3RhdGlvbiBvZiB0aGUgYm9keSBhYm91dCBpdHMgb3duIG9yaWdpbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5pc01vdmFibGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGJvZHlDb25maWd1cmF0aW9uLmlzTW92YWJsZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc01vdmFibGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdJZiB0cnVlLCB0aGUgYm9keSBjYW4gbW92ZSBkdXJpbmcgdGhlIHBoeXNpY3MgdXBkYXRlLidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRlbnNpdHkgPSBib2R5Q29uZmlndXJhdGlvbi5tYXNzIC8gdGhpcy5nZXRWb2x1bWUoKTtcclxuXHJcbiAgICAvLyB0cnVlIGlmIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBjb250cm9sbGluZyB0aGUgcG9zaXRpb24gb2YgdGhlIGJvZHkgd2l0aCB0aGUgbW91c2VcclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGF0aCA9IFtdOyAvLyB7VmVjdG9yMltdfSBhcnJheSBvZiB0aGUgcG9pbnRzIGluIHRoZSBib2R5J3MgdHJhaWxcclxuXHJcbiAgICAvLyBlbWl0dGVycyBmb3IgdmFyaW91cyBldmVudHNcclxuICAgIHRoaXMucG9pbnRBZGRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIFZlY3RvcjIsIEJvZHlUeXBlRW51bSBdPigge1xyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyB2YWx1ZVR5cGU6IFZlY3RvcjIgfSxcclxuICAgICAgICB7IHZhbGlkVmFsdWVzOiBbICdwbGFuZXQnLCAnc2F0ZWxsaXRlJywgJ3N0YXInLCAnbW9vbicgXSB9XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMucG9pbnRSZW1vdmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWxpZFZhbHVlczogWyAncGxhbmV0JywgJ3NhdGVsbGl0ZScsICdzdGFyJywgJ21vb24nIF0gfSBdIH0gKTtcclxuICAgIHRoaXMuY2xlYXJlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgJ3BsYW5ldCcsICdzYXRlbGxpdGUnLCAnc3RhcicsICdtb29uJyBdIH0gXSB9ICk7XHJcbiAgICB0aGlzLnVzZXJNb2RpZmllZFBvc2l0aW9uRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLnVzZXJNb2RpZmllZFZlbG9jaXR5RW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5pc0NvbGxpZGVkUHJvcGVydHkubGluayggY29sbGlkZWQgPT4ge1xyXG4gICAgICBpZiAoIGNvbGxpZGVkICkge1xyXG4gICAgICAgIHRoaXMuY2xvY2tUaWNrc1NpbmNlRXhwbG9zaW9uUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuaW5pdGlhbFZhbHVlLCAnaW5pdGlhbCB2YWx1ZSBzaG91bGQgYmUgdHJ1dGh5JyApO1xyXG4gICAgY29uc3QgaW5pdGlhbFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZS5taW51cyggb3B0aW9ucy5vcmJpdGFsQ2VudGVyICk7XHJcbiAgICBjb25zdCBkaXN0VG9DZW50ZXIgPSBpbml0aWFsUG9zaXRpb24ubWFnbml0dWRlO1xyXG5cclxuICAgIC8vIGRldGVybWluZSB0aGUgbWF4IHBhdGggbGVuZ3RoIGZvciB0aGUgYm9keSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgaWYgKCBkaXN0VG9DZW50ZXIgPCAxMDAwICkge1xyXG5cclxuICAgICAgLy8gaWYgdG9vIGNsb3NlIHRvIHRoZSBjZW50ZXIsIHVzZSB0aGlzIG9wdGlvbmFsIGxlbmd0aFxyXG4gICAgICB0aGlzLm1heFBhdGhMZW5ndGggPSBvcHRpb25zLm1heFBhdGhMZW5ndGg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG1heCBwYXRoIGxlbmd0aCBpcyB+MC44NSBvZiBhIGZ1bGwgb3JiaXRcclxuICAgICAgdGhpcy5tYXhQYXRoTGVuZ3RoID0gMC44NSAqIDIgKiBNYXRoLlBJICogZGlzdFRvQ2VudGVyICsgdGhpcy5wYXRoTGVuZ3RoQnVmZmVyO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRWb2x1bWUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiA0LjAgLyAzLjAgKiBNYXRoLlBJICogTWF0aC5wb3coIHRoaXMuZ2V0UmFkaXVzKCksIDMgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmFkaXVzKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5kaWFtZXRlclByb3BlcnR5LmdldCgpIC8gMjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIChwaGV0LWlvKVxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b1N0YXRlT2JqZWN0KCk6IEJvZHlTdGF0ZVR5cGUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGF0aExlbmd0aDogdGhpcy5wYXRoTGVuZ3RoLFxyXG4gICAgICBtb2RlbFBhdGhMZW5ndGg6IHRoaXMubW9kZWxQYXRoTGVuZ3RoLFxyXG4gICAgICBwYXRoOiBBcnJheUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApLnRvU3RhdGVPYmplY3QoIHRoaXMucGF0aCApXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHBoZXQtaW8pXHJcbiAgICovXHJcbiAgcHVibGljIHNldFN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogUmV0dXJuVHlwZTx0eXBlb2YgQm9keS5wcm90b3R5cGUudG9TdGF0ZU9iamVjdD4gKTogdm9pZCB7XHJcbiAgICB0aGlzLnBhdGhMZW5ndGggPSBzdGF0ZU9iamVjdC5wYXRoTGVuZ3RoO1xyXG4gICAgdGhpcy5tb2RlbFBhdGhMZW5ndGggPSBzdGF0ZU9iamVjdC5tb2RlbFBhdGhMZW5ndGg7XHJcbiAgICB0aGlzLnBhdGggPSBBcnJheUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QucGF0aCApO1xyXG4gICAgdGhpcy5jbGVhcmVkRW1pdHRlci5lbWl0KCB0aGlzLnR5cGUgKTtcclxuICAgIHRoaXMucGF0aC5mb3JFYWNoKCBwYXRoUG9pbnQgPT4gdGhpcy5wb2ludEFkZGVkRW1pdHRlci5lbWl0KCBwYXRoUG9pbnQsIHRoaXMudHlwZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaW1tdXRhYmxlIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgYm9keSBmb3IgdXNlIGluIHRoZSBwaHlzaWNzIGVuZ2luZVxyXG4gICAqIHVzZSBjb3B5KCkgZm9yIFZlY3RvcjIgc28gdGhhdCB0aGUgcHJvcGVydGllcyBkb24ndCBnZXQgbXV0YXRlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyB0b0JvZHlTdGF0ZSgpOiBCb2R5U3RhdGUge1xyXG4gICAgcmV0dXJuIG5ldyBCb2R5U3RhdGUoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5jb3B5KCksXHJcbiAgICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5nZXQoKS5jb3B5KCksXHJcbiAgICAgIHRoaXMuYWNjZWxlcmF0aW9uUHJvcGVydHkuZ2V0KCkuY29weSgpLFxyXG4gICAgICB0aGlzLm1hc3NQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5pc0NvbGxpZGVkUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIHRoaXMucm90YXRpb25Qcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5yb3RhdGlvblBlcmlvZFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNhdmUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGJvZHkgYnkgc3RvcmluZyB0aGUgdmFsdWVzIG9mIGFsbCByZXdpbmRhYmxlIHByb3BlcnRpZXMuICBUaGlzIHNob3VsZCBvbmx5XHJcbiAgICogYmUgY2FsbGVkIHdoZW4gdGhlIGNsb2NrIGlzIHBhdXNlZC5cclxuICAgKi9cclxuICBwdWJsaWMgc2F2ZUJvZHlTdGF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5zdG9yZVJld2luZFZhbHVlTm9Ob3RpZnkoKTtcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5zdG9yZVJld2luZFZhbHVlTm9Ob3RpZnkoKTtcclxuICAgIHRoaXMuZm9yY2VQcm9wZXJ0eS5zdG9yZVJld2luZFZhbHVlTm9Ob3RpZnkoKTtcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5LnN0b3JlUmV3aW5kVmFsdWVOb05vdGlmeSgpO1xyXG4gICAgdGhpcy5pc0NvbGxpZGVkUHJvcGVydHkuc3RvcmVSZXdpbmRWYWx1ZU5vTm90aWZ5KCk7XHJcbiAgICB0aGlzLnJvdGF0aW9uUHJvcGVydHkuc3RvcmVSZXdpbmRWYWx1ZU5vTm90aWZ5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlIHRoZSB1cGRhdGVkIEJvZHlTdGF0ZSBmcm9tIHRoZSBwaHlzaWNzIGVuZ2luZSBhbmQgdXBkYXRlIHRoZSBzdGF0ZSBvZiB0aGlzIGJvZHkgYmFzZWQgb24gaXQuXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZUJvZHlTdGF0ZUZyb21Nb2RlbCggYm9keVN0YXRlOiB7IHBvc2l0aW9uOiBWZWN0b3IyOyB2ZWxvY2l0eTogVmVjdG9yMjsgYWNjZWxlcmF0aW9uOiBWZWN0b3IyOyBtYXNzOiBudW1iZXI7IHJvdGF0aW9uOiBudW1iZXIgfSApOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMuaXNDb2xsaWRlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBpZiAoIHRoaXMuaXNNb3ZhYmxlUHJvcGVydHkudmFsdWUgJiYgIXRoaXMudXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggYm9keVN0YXRlLnBvc2l0aW9uICk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnNldCggYm9keVN0YXRlLnZlbG9jaXR5ICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGJvZHlTdGF0ZS5hY2NlbGVyYXRpb247XHJcbiAgICAgIHRoaXMuZm9yY2VQcm9wZXJ0eS5zZXQoIGJvZHlTdGF0ZS5hY2NlbGVyYXRpb24ubXVsdGlwbHlTY2FsYXIoIGJvZHlTdGF0ZS5tYXNzICkgKTtcclxuICAgICAgdGhpcy5yb3RhdGlvblByb3BlcnR5LnNldCggYm9keVN0YXRlLnJvdGF0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYWZ0ZXIgYWxsIGJvZGllcyBoYXZlIGJlZW4gdXBkYXRlZCBieSB0aGUgcGh5c2ljcyBlbmdpbmUgKG11c3QgYmUgZG9uZSBhcyBhIGJhdGNoKSxcclxuICAgKiBzbyB0aGF0IHRoZSBwYXRoIGNhbiBiZSB1cGRhdGVkXHJcbiAgICpcclxuICAgKi9cclxuICBwdWJsaWMgbW9kZWxTdGVwcGVkKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIE9ubHkgYWRkIHRvIHRoZSBwYXRoIGlmIHRoZSB1c2VyIGlzbid0IGRyYWdnaW5nIGl0IGFuZCBpZiB0aGUgYm9keSBpcyBub3QgZXhwbG9kZWQgYW5kIHRoZSBib2R5IGlzIG1vdmFibGVcclxuICAgIGlmICggIXRoaXMudXNlckNvbnRyb2xsZWQgJiYgIXRoaXMuaXNDb2xsaWRlZFByb3BlcnR5LmdldCgpICYmIHRoaXMuaXNNb3ZhYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuYWRkUGF0aFBvaW50KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBwb2ludCB0byB0aGUgY29sbGVjdGlvbiBvZiBwb2ludHMgdGhhdCBmb2xsb3cgdGhlIHRyYWplY3Rvcnkgb2YgYSBtb3ZpbmcgYm9keS5cclxuICAgKiBUaGlzIGFsc28gcmVtb3ZlcyBwb2ludHMgd2hlbiB0aGUgcGF0aCBnZXRzIHRvbyBsb25nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWRkUGF0aFBvaW50KCk6IHZvaWQge1xyXG4gICAgY29uc3QgcGF0aFBvaW50ID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5wYXRoLnB1c2goIHBhdGhQb2ludCApO1xyXG4gICAgdGhpcy5wb2ludEFkZGVkRW1pdHRlci5lbWl0KCBwYXRoUG9pbnQsIHRoaXMudHlwZSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgbGVuZ3RoIHRvIHRoZSB0cmFja2VkIHBhdGggbGVuZ3RoXHJcbiAgICBpZiAoIHRoaXMucGF0aC5sZW5ndGggPiAyICkge1xyXG4gICAgICBjb25zdCBkaWZmZXJlbmNlID0gdGhpcy5wYXRoWyB0aGlzLnBhdGgubGVuZ3RoIC0gMSBdLm1pbnVzKCB0aGlzLnBhdGhbIHRoaXMucGF0aC5sZW5ndGggLSAyIF0gKTtcclxuICAgICAgY29uc3QgYWRkZWRNYWduaXR1ZGUgPSBkaWZmZXJlbmNlLm1hZ25pdHVkZTtcclxuXHJcbiAgICAgIHRoaXMubW9kZWxQYXRoTGVuZ3RoICs9IGFkZGVkTWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSBwb2ludHMgZnJvbSB0aGUgcGF0aCBhcyB0aGUgcGF0aCBnZXRzIHRvbyBsb25nXHJcbiAgICAvLyBpZiB0aGUgcGF0aCBncm93cyBtb3JlIHRoYW4gfjYwMDAgcG9pbnRzLCBzdGFydCByZW1vdmluZyBwb2ludHNcclxuICAgIHdoaWxlICggdGhpcy5tb2RlbFBhdGhMZW5ndGggPiB0aGlzLm1heFBhdGhMZW5ndGggfHwgdGhpcy5wYXRoLmxlbmd0aCA+IHRoaXMucGF0aExlbmd0aExpbWl0ICkge1xyXG4gICAgICBjb25zdCBsb3NzID0gdGhpcy5wYXRoWyAxIF0ubWludXMoIHRoaXMucGF0aFsgMCBdICk7XHJcbiAgICAgIGNvbnN0IGxvc3NNYWduaXR1ZGUgPSBsb3NzLm1hZ25pdHVkZTtcclxuXHJcbiAgICAgIHRoaXMucGF0aC5zaGlmdCgpO1xyXG4gICAgICB0aGlzLnBvaW50UmVtb3ZlZEVtaXR0ZXIuZW1pdCggdGhpcy50eXBlICk7XHJcblxyXG4gICAgICB0aGlzLm1vZGVsUGF0aExlbmd0aCAtPSBsb3NzTWFnbml0dWRlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgdGhlIHdob2xlIHBhdGggb2YgcG9pbnRzIHRyYWNraW5nIHRoZSBib2R5J3MgdHJhamVjdG9yeS5cclxuICAgKi9cclxuICBwdWJsaWMgY2xlYXJQYXRoKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wYXRoID0gW107XHJcbiAgICB0aGlzLnBhdGhMZW5ndGggPSAwO1xyXG4gICAgdGhpcy5tb2RlbFBhdGhMZW5ndGggPSAwO1xyXG4gICAgdGhpcy5jbGVhcmVkRW1pdHRlci5lbWl0KCB0aGlzLnR5cGUgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldEFsbCgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZvcmNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmRpYW1ldGVyUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNDb2xsaWRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNsb2NrVGlja3NTaW5jZUV4cGxvc2lvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJvdGF0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2xlYXJQYXRoKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gaW1hZ2UgcmVuZGVyZXIgZm9yIHRoaXMgYm9keS5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlUmVuZGVyZXIoIHZpZXdEaWFtZXRlcjogbnVtYmVyICk6IEJvZHlSZW5kZXJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlciggdGhpcywgdmlld0RpYW1ldGVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBLZWVwIHRyYWNrIG9mIHRoZSB0aW1lIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSB0aW1lIHN0ZXAsIGZvciBpbnRlcnBvbGF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHN0b3JlUHJldmlvdXNQb3NpdGlvbigpOiB2b2lkIHtcclxuICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbi54ID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24ueSA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdG8gc2VlIGlmIHRoaXMgYm9keSBjb2xsaWRlcyB3aXRoIGFub3RoZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbGxpZGVzV2lkdGgoIGJvZHk6IEJvZHkgKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBwb3NpdGlvbjEgPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBwb3NpdGlvbjIgPSBib2R5LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gcmV1c2UgdGVtcFZlY3RvciB0byByZWR1Y2UgVmVjdG9yMiBhbGxvY2F0aW9uc1xyXG4gICAgdGVtcFZlY3Rvci54ID0gcG9zaXRpb24xLnggLSBwb3NpdGlvbjIueDtcclxuICAgIHRlbXBWZWN0b3IueSA9IHBvc2l0aW9uMS55IC0gcG9zaXRpb24yLnk7XHJcblxyXG4gICAgY29uc3QgZGlzdGFuY2UgPSB0ZW1wVmVjdG9yLm1hZ25pdHVkZTtcclxuICAgIGNvbnN0IHJhZGlpU3VtID0gdGhpcy5kaWFtZXRlclByb3BlcnR5LmdldCgpIC8gMiArIGJvZHkuZGlhbWV0ZXJQcm9wZXJ0eS5nZXQoKSAvIDI7XHJcbiAgICByZXR1cm4gZGlzdGFuY2UgPCByYWRpaVN1bTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJld2luZCBhbGwgcmV3aW5kYWJsZSBwcm9wZXJ0aWVzIHRvIHRoZWlyIHZhbHVlcyBpbiB0aGUgbGFzdCB0aW1lIHN0ZXAuXHJcbiAgICpcclxuICAgKi9cclxuICBwdWJsaWMgcmV3aW5kKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJld2luZCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnJld2luZCgpO1xyXG4gICAgdGhpcy5mb3JjZVByb3BlcnR5LnJld2luZCgpO1xyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkucmV3aW5kKCk7XHJcbiAgICB0aGlzLmlzQ29sbGlkZWRQcm9wZXJ0eS5yZXdpbmQoKTtcclxuICAgIHRoaXMucm90YXRpb25Qcm9wZXJ0eS5yZXdpbmQoKTtcclxuICAgIHRoaXMuY2xlYXJQYXRoKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBQcm9wZXJ0aWVzIHdoaWNoLCB3aGVuIGNoYW5nZWQsIGVuYWJsZSB0aGUgcmV3aW5kIGJ1dHRvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UmV3aW5kYWJsZVByb3BlcnRpZXMoKTogUmV3aW5kYWJsZVByb3BlcnR5PEludGVudGlvbmFsQW55PltdIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LFxyXG4gICAgICB0aGlzLm1hc3NQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5pc0NvbGxpZGVkUHJvcGVydHlcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0UG9zaXRpb25BbmRWZWxvY2l0eSgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYG5hbWUgPSAke3RoaXMudHlwZX0sIG1hc3MgPSAke3RoaXMubWFzc1Byb3BlcnR5LmdldCgpfWA7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIEJvZHlTdGF0ZVR5cGUgPSB7IHBhdGhMZW5ndGg6IG51bWJlcjsgbW9kZWxQYXRoTGVuZ3RoOiBudW1iZXI7IHBhdGg6IFZlY3RvcjJTdGF0ZU9iamVjdFtdIH07XHJcblxyXG5ncmF2aXR5QW5kT3JiaXRzLnJlZ2lzdGVyKCAnQm9keScsIEJvZHkgKTtcclxuZXhwb3J0IHR5cGUgeyBCb2R5T3B0aW9ucyB9OyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQThCLCtCQUErQjtBQUMzRSxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLFlBQVksTUFBK0IsdUNBQXVDO0FBQ3pGLE9BQU9DLE9BQU8sTUFBTSx3Q0FBd0M7QUFDNUQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBRXRDLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5Qjs7QUFJeEQ7QUFDQTtBQUtBLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFJN0Q7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSVosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFnQnRDLGVBQWUsTUFBTWEsSUFBSSxTQUFTWCxZQUFZLENBQUM7RUE4QzdDLE9BQXVCWSxNQUFNLEdBQUcsSUFBSVQsTUFBTSxDQUF1QixRQUFRLEVBQUU7SUFDekVVLFNBQVMsRUFBRUYsSUFBSTtJQUNmRyxhQUFhLEVBQUUsOENBQThDO0lBQzdEQyxhQUFhLEVBQUlDLElBQVUsSUFBTUEsSUFBSSxDQUFDRCxhQUFhLENBQUMsQ0FBQztJQUNyREUsVUFBVSxFQUFFQSxDQUFFRCxJQUFVLEVBQUVFLFdBQTBCLEtBQU1GLElBQUksQ0FBQ0csY0FBYyxDQUFFRCxXQUFZLENBQUM7SUFDNUZFLFdBQVcsRUFBRTtNQUNYQyxVQUFVLEVBQUVqQixRQUFRO01BQ3BCa0IsZUFBZSxFQUFFbEIsUUFBUTtNQUN6Qm1CLElBQUksRUFBRXRCLE9BQU8sQ0FBRUgsT0FBTyxDQUFDMEIsU0FBVTtJQUNuQztFQUNGLENBQUUsQ0FBQzs7RUFFSDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLElBQWtCLEVBQUVDLGlCQUFvQyxFQUFFQyxLQUFZLEVBQUVDLFNBQWdCLEVBQUVDLFFBQXNELEVBQUVDLFVBQWtCLEVBQUVDLFNBQWlCLEVBQUVDLGlCQUE0QyxFQUFFQyxLQUE0QixFQUNuUUMsTUFBYyxFQUFFQyxlQUE2QixFQUFHO0lBRWxFLE1BQU1DLE9BQU8sR0FBRzVCLFNBQVMsQ0FBZ0QsQ0FBQyxDQUFFO01BRTFFNkIsZ0JBQWdCLEVBQUUsQ0FBQztNQUFFO01BQ3JCQyxhQUFhLEVBQUUsQ0FBQztNQUFFO01BQ2xCQyxZQUFZLEVBQUUsSUFBSTtNQUFFO01BQ3BCQyxnQkFBZ0IsRUFBRSxJQUFJO01BQUU7TUFDeEJDLGFBQWEsRUFBRSxJQUFJNUMsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFBRTtNQUNwQzZDLGFBQWEsRUFBRSxVQUFVO01BQUU7TUFDM0JDLGVBQWUsRUFBRSxJQUFJO01BQUU7TUFDdkJDLGNBQWMsRUFBRSxJQUFJO01BQUU7TUFDdEJDLFVBQVUsRUFBRW5DLElBQUksQ0FBQ0MsTUFBTTtNQUN2Qm1DLGFBQWEsRUFBRSxFQUFFO01BQ2pCWixNQUFNLEVBQUVBO0lBQ1YsQ0FBQyxFQUFFQyxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ1UsYUFBYSxHQUFHVixPQUFPLENBQUNVLGFBQWE7O0lBRTFDO0lBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxJQUFJbEQsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFFM0MsTUFBTW1ELFFBQVEsR0FBS3RCLGlCQUFpQixDQUFDdUIsTUFBTSxHQUFHLENBQUMsR0FBS2IsT0FBTyxDQUFDRSxhQUFhO0lBRXpFLElBQUksQ0FBQ1ksVUFBVSxHQUFHaEIsTUFBTSxDQUFDaUIsSUFBSTs7SUFFN0I7SUFDQSxJQUFJLENBQUNDLGtCQUFrQixHQUFJLEdBQUVsQixNQUFNLENBQUNpQixJQUFLLE1BQUs7SUFFOUMsSUFBSSxDQUFDRSxvQkFBb0IsR0FBRyxJQUFJdkQsZUFBZSxDQUFFLElBQUlELE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDdEUsSUFBSSxDQUFDeUQsZ0JBQWdCLEdBQUcsSUFBSTVELGNBQWMsQ0FBRXNELFFBQVEsRUFBRTtNQUNwRGQsTUFBTSxFQUFFQSxNQUFNLENBQUNxQixZQUFZLENBQUUsa0JBQW1CLENBQUM7TUFDakRDLEtBQUssRUFBRSxHQUFHO01BQ1ZDLG1CQUFtQixFQUFFLDhCQUE4QjtNQUNuREMsY0FBYyxFQUFFO0lBQ2xCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsZ0NBQWdDLEdBQUcsSUFBSWpFLGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFDN0R3QyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxrQ0FBbUMsQ0FBQztNQUNqRUUsbUJBQW1CLEVBQUUsNEJBQTRCO01BQ2pEQyxjQUFjLEVBQUU7SUFDbEIsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDRSxjQUFjLEdBQUcsSUFBSWpFLFFBQVEsQ0FBRSxJQUFJQyxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFFL0QsSUFBSSxDQUFDeUMsZ0JBQWdCLEdBQUdELE9BQU8sQ0FBQ0MsZ0JBQWdCLENBQUMsQ0FBQzs7SUFFbEQsSUFBSSxDQUFDRSxZQUFZLEdBQUdILE9BQU8sQ0FBQ0csWUFBWSxDQUFDLENBQUM7O0lBRTFDO0lBQ0EsSUFBSSxDQUFDRyxhQUFhLEdBQUcsQ0FBQzs7SUFFdEI7SUFDQSxJQUFJLENBQUN0QixVQUFVLEdBQUcsQ0FBQzs7SUFFbkI7SUFDQSxJQUFJLENBQUN1QixlQUFlLEdBQUdQLE9BQU8sQ0FBQ08sZUFBZTs7SUFFOUM7SUFDQSxJQUFJLENBQUN0QixlQUFlLEdBQUcsQ0FBQzs7SUFFeEI7SUFDQTtJQUNBLElBQUksQ0FBQ21CLGdCQUFnQixHQUFHSixPQUFPLENBQUNJLGdCQUFnQixDQUFDLENBQUM7O0lBRWxEO0lBQ0EsSUFBSSxDQUFDVCxTQUFTLEdBQUdBLFNBQVMsQ0FBQyxDQUFDOztJQUU1QjtJQUNBLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUdBLGlCQUFpQixDQUFDLENBQUM7O0lBRTVDLElBQUksQ0FBQ0wsS0FBSyxHQUFHQSxLQUFLLENBQUMsQ0FBQztJQUNwQixJQUFJLENBQUNDLFNBQVMsR0FBR0EsU0FBUyxDQUFDLENBQUM7SUFDNUIsSUFBSSxDQUFDSCxJQUFJLEdBQUdBLElBQUksQ0FBQyxDQUFDOztJQUVsQjtJQUNBLElBQUksQ0FBQ21CLGNBQWMsR0FBR1IsT0FBTyxDQUFDUSxjQUFjOztJQUU1QztJQUNBLElBQUksQ0FBQ2lCLG1CQUFtQixHQUFHLElBQUksQ0FBQ3BDLElBQUksS0FBSyxRQUFRLEdBQUdwQix1QkFBdUIsQ0FBQ3lELG9CQUFvQixHQUNyRSxJQUFJLENBQUNyQyxJQUFJLEtBQUssV0FBVyxHQUFHcEIsdUJBQXVCLENBQUMwRCx1QkFBdUIsR0FDM0UsSUFBSSxDQUFDdEMsSUFBSSxLQUFLLE1BQU0sR0FBR3BCLHVCQUF1QixDQUFDMkQsa0JBQWtCLEdBQ2pFLElBQUksQ0FBQ3ZDLElBQUksS0FBSyxNQUFNLEdBQUdwQix1QkFBdUIsQ0FBQzRELGtCQUFrQixHQUNqRSxJQUFJO0lBQy9CQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNMLG1CQUFtQixFQUFHLDJDQUEwQyxJQUFJLENBQUNwQyxJQUFLLEVBQUUsQ0FBQztJQUVwR3lDLE1BQU0sSUFBSUEsTUFBTSxDQUFFckMsUUFBUSxLQUFLLElBQUssQ0FBQzs7SUFFckM7SUFDQTtJQUNBLElBQUksQ0FBQ0EsUUFBUSxHQUFHQSxRQUFROztJQUV4QjtJQUNBLElBQUksQ0FBQ3NDLDBCQUEwQixHQUFHLElBQUl4RSxRQUFRLENBQVcsS0FBTSxDQUFDO0lBRWhFLElBQUksQ0FBQ21DLFVBQVUsR0FBR0EsVUFBVTtJQUU1QixNQUFNc0MseUJBQXlCLEdBQUcsSUFBSTVFLGVBQWUsQ0FBRSxDQUNuRHlDLEtBQUssQ0FBQ21DLHlCQUF5QixFQUMvQixJQUFJLENBQUNELDBCQUEwQixDQUNoQyxFQUFFLENBQUVFLHlCQUF5QixFQUFFQyxZQUFZLEtBQzFDRCx5QkFBeUIsSUFBSSxDQUFDQyxZQUNsQyxDQUFDOztJQUVEOztJQUVBLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSWhFLGtCQUFrQixDQUFXNkQseUJBQXlCLEVBQUUsSUFBSXZFLE9BQU8sQ0FBRTZCLGlCQUFpQixDQUFDOEMsQ0FBQyxFQUFFOUMsaUJBQWlCLENBQUMrQyxDQUFFLENBQUMsRUFBRTtNQUMzSUMsZUFBZSxFQUFFN0UsT0FBTyxDQUFDMEIsU0FBUztNQUNsQ1csTUFBTSxFQUFFQSxNQUFNLENBQUNxQixZQUFZLENBQUUsa0JBQW1CLENBQUM7TUFDakRDLEtBQUssRUFBRSxHQUFHO01BQ1ZtQixtQkFBbUIsRUFBRSxJQUFJO01BQ3pCbEIsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDbUIsZ0JBQWdCLEdBQUcsSUFBSXJFLGtCQUFrQixDQUFFNkQseUJBQXlCLEVBQUUsSUFBSXZFLE9BQU8sQ0FBRTZCLGlCQUFpQixDQUFDbUQsRUFBRSxFQUFFbkQsaUJBQWlCLENBQUNvRCxFQUFHLENBQUMsRUFBRTtNQUNwSUosZUFBZSxFQUFFN0UsT0FBTyxDQUFDMEIsU0FBUztNQUNsQ1csTUFBTSxFQUFFQSxNQUFNLENBQUNxQixZQUFZLENBQUUsa0JBQW1CLENBQUM7TUFDakRDLEtBQUssRUFBRSxLQUFLO01BQ1ptQixtQkFBbUIsRUFBRSxJQUFJO01BQ3pCbEIsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDc0IsYUFBYSxHQUFHLElBQUl2RixlQUFlLENBQUUsQ0FBRSxJQUFJLENBQUNvRixnQkFBZ0IsQ0FBRSxFQUFFSSxRQUFRLElBQUlBLFFBQVEsQ0FBQ0MsU0FBUyxFQUFFO01BQ25HUCxlQUFlLEVBQUV2RSxRQUFRO01BQ3pCK0IsTUFBTSxFQUFFQSxNQUFNLENBQUNxQixZQUFZLENBQUUsZUFBZ0IsQ0FBQztNQUM5Q0MsS0FBSyxFQUFFLEtBQUs7TUFDWm1CLG1CQUFtQixFQUFFLElBQUk7TUFDekJsQixtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUN5QixhQUFhLEdBQUcsSUFBSTNFLGtCQUFrQixDQUFFNkQseUJBQXlCLEVBQUUsSUFBSXZFLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQUU7TUFDM0Y0RCxtQkFBbUIsRUFBRSwrREFBK0Q7TUFDcEZpQixlQUFlLEVBQUU3RSxPQUFPLENBQUMwQixTQUFTO01BQ2xDVyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxlQUFnQixDQUFDO01BQzlDb0IsbUJBQW1CLEVBQUUsSUFBSTtNQUN6Qm5CLEtBQUssRUFBRSxHQUFHO01BQ1ZFLGNBQWMsRUFBRTtJQUNsQixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUN5QixzQkFBc0IsR0FBRyxJQUFJM0YsZUFBZSxDQUFFLENBQUUsSUFBSSxDQUFDMEYsYUFBYSxDQUFFLEVBQUVFLEtBQUssSUFBSUEsS0FBSyxDQUFDSCxTQUFTLEVBQUU7TUFDbkd4QixtQkFBbUIsRUFBRSw2REFBNkQ7TUFDbEZpQixlQUFlLEVBQUV2RSxRQUFRO01BQ3pCK0IsTUFBTSxFQUFFQSxNQUFNLENBQUNxQixZQUFZLENBQUUsd0JBQXlCLENBQUM7TUFDdkRvQixtQkFBbUIsRUFBRSxJQUFJO01BQ3pCbkIsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDNkIsWUFBWSxHQUFHLElBQUk5RSxrQkFBa0IsQ0FBRTZELHlCQUF5QixFQUFFMUMsaUJBQWlCLENBQUM0RCxJQUFJLEVBQUU7TUFDN0ZwRCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxjQUFlLENBQUM7TUFDN0NtQixlQUFlLEVBQUV2RSxRQUFRO01BQ3pCcUQsS0FBSyxFQUFFLElBQUk7TUFDWEMsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDOEIsa0JBQWtCLEdBQUcsSUFBSWhGLGtCQUFrQixDQUFXNkQseUJBQXlCLEVBQUUsS0FBSyxFQUFFO01BQzNGbEMsTUFBTSxFQUFFQSxNQUFNLENBQUNxQixZQUFZLENBQUUsb0JBQXFCLENBQUM7TUFDbkRtQixlQUFlLEVBQUV6RSxTQUFTO01BQzFCeUQsY0FBYyxFQUFFLElBQUk7TUFDcEJELG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQytCLGdCQUFnQixHQUFHLElBQUlqRixrQkFBa0IsQ0FBVTZELHlCQUF5QixFQUFFLENBQUMsRUFBRTtNQUNwRmxDLE1BQU0sRUFBRUEsTUFBTSxDQUFDcUIsWUFBWSxDQUFFLGtCQUFtQixDQUFDO01BQ2pEbUIsZUFBZSxFQUFFdkUsUUFBUTtNQUN6QnFELEtBQUssRUFBRSxTQUFTO01BQ2hCbUIsbUJBQW1CLEVBQUUsSUFBSTtNQUN6QmxCLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ2dDLGlCQUFpQixHQUFHLElBQUlsRyxlQUFlLENBQUVtQyxpQkFBaUIsQ0FBQ2dFLFNBQVMsRUFBRTtNQUN6RXhELE1BQU0sRUFBRUEsTUFBTSxDQUFDcUIsWUFBWSxDQUFFLG1CQUFvQixDQUFDO01BQ2xERyxjQUFjLEVBQUUsSUFBSTtNQUNwQkQsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDa0MsT0FBTyxHQUFHakUsaUJBQWlCLENBQUM0RCxJQUFJLEdBQUcsSUFBSSxDQUFDTSxTQUFTLENBQUMsQ0FBQzs7SUFFeEQ7SUFDQSxJQUFJLENBQUNDLGNBQWMsR0FBRyxLQUFLO0lBQzNCLElBQUksQ0FBQ3ZFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQzs7SUFFaEI7SUFDQSxJQUFJLENBQUN3RSxpQkFBaUIsR0FBRyxJQUFJckcsT0FBTyxDQUE2QjtNQUMvRHNHLFVBQVUsRUFBRSxDQUNWO1FBQUVuRixTQUFTLEVBQUVmO01BQVEsQ0FBQyxFQUN0QjtRQUFFbUcsV0FBVyxFQUFFLENBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTTtNQUFHLENBQUM7SUFFOUQsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRyxJQUFJeEcsT0FBTyxDQUFFO01BQUVzRyxVQUFVLEVBQUUsQ0FBRTtRQUFFQyxXQUFXLEVBQUUsQ0FBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNO01BQUcsQ0FBQztJQUFHLENBQUUsQ0FBQztJQUN4SCxJQUFJLENBQUNFLGNBQWMsR0FBRyxJQUFJekcsT0FBTyxDQUFFO01BQUVzRyxVQUFVLEVBQUUsQ0FBRTtRQUFFQyxXQUFXLEVBQUUsQ0FBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNO01BQUcsQ0FBQztJQUFHLENBQUUsQ0FBQztJQUNuSCxJQUFJLENBQUNHLDJCQUEyQixHQUFHLElBQUkxRyxPQUFPLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMyRywyQkFBMkIsR0FBRyxJQUFJM0csT0FBTyxDQUFDLENBQUM7SUFFaEQsSUFBSSxDQUFDOEYsa0JBQWtCLENBQUNjLElBQUksQ0FBRUMsUUFBUSxJQUFJO01BQ3hDLElBQUtBLFFBQVEsRUFBRztRQUNkLElBQUksQ0FBQzNDLGdDQUFnQyxDQUFDNEMsR0FBRyxDQUFFLENBQUUsQ0FBQztNQUNoRDtJQUNGLENBQUUsQ0FBQztJQUVIckMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDSyxnQkFBZ0IsQ0FBQ2lDLFlBQVksRUFBRSxnQ0FBaUMsQ0FBQztJQUN4RixNQUFNQyxlQUFlLEdBQUcsSUFBSSxDQUFDbEMsZ0JBQWdCLENBQUNpQyxZQUFZLENBQUNFLEtBQUssQ0FBRXRFLE9BQU8sQ0FBQ0ssYUFBYyxDQUFDO0lBQ3pGLE1BQU1rRSxZQUFZLEdBQUdGLGVBQWUsQ0FBQ3hCLFNBQVM7O0lBRTlDO0lBQ0EsSUFBSzBCLFlBQVksR0FBRyxJQUFJLEVBQUc7TUFFekI7TUFDQSxJQUFJLENBQUNqRSxhQUFhLEdBQUdOLE9BQU8sQ0FBQ00sYUFBYTtJQUM1QyxDQUFDLE1BQ0k7TUFFSDtNQUNBLElBQUksQ0FBQ0EsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUdrRSxJQUFJLENBQUNDLEVBQUUsR0FBR0YsWUFBWSxHQUFHLElBQUksQ0FBQ3RFLGdCQUFnQjtJQUNoRjtFQUNGO0VBRVF1RCxTQUFTQSxDQUFBLEVBQVc7SUFDMUIsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHZ0IsSUFBSSxDQUFDQyxFQUFFLEdBQUdELElBQUksQ0FBQ0UsR0FBRyxDQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUM7RUFDOUQ7RUFFUUEsU0FBU0EsQ0FBQSxFQUFXO0lBQzFCLE9BQU8sSUFBSSxDQUFDekQsZ0JBQWdCLENBQUMwRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7RUFDeEM7O0VBRUE7QUFDRjtBQUNBO0VBQ1NsRyxhQUFhQSxDQUFBLEVBQWtCO0lBQ3BDLE9BQU87TUFDTE0sVUFBVSxFQUFFLElBQUksQ0FBQ0EsVUFBVTtNQUMzQkMsZUFBZSxFQUFFLElBQUksQ0FBQ0EsZUFBZTtNQUNyQ0MsSUFBSSxFQUFFdEIsT0FBTyxDQUFFSCxPQUFPLENBQUMwQixTQUFVLENBQUMsQ0FBQ1QsYUFBYSxDQUFFLElBQUksQ0FBQ1EsSUFBSztJQUM5RCxDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0VBQ1NKLGNBQWNBLENBQUVELFdBQTRELEVBQVM7SUFDMUYsSUFBSSxDQUFDRyxVQUFVLEdBQUdILFdBQVcsQ0FBQ0csVUFBVTtJQUN4QyxJQUFJLENBQUNDLGVBQWUsR0FBR0osV0FBVyxDQUFDSSxlQUFlO0lBQ2xELElBQUksQ0FBQ0MsSUFBSSxHQUFHdEIsT0FBTyxDQUFFSCxPQUFPLENBQUMwQixTQUFVLENBQUMsQ0FBQzBGLGVBQWUsQ0FBRWhHLFdBQVcsQ0FBQ0ssSUFBSyxDQUFDO0lBQzVFLElBQUksQ0FBQzRFLGNBQWMsQ0FBQ2dCLElBQUksQ0FBRSxJQUFJLENBQUN6RixJQUFLLENBQUM7SUFDckMsSUFBSSxDQUFDSCxJQUFJLENBQUM2RixPQUFPLENBQUVDLFNBQVMsSUFBSSxJQUFJLENBQUN0QixpQkFBaUIsQ0FBQ29CLElBQUksQ0FBRUUsU0FBUyxFQUFFLElBQUksQ0FBQzNGLElBQUssQ0FBRSxDQUFDO0VBQ3ZGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1M0RixXQUFXQSxDQUFBLEVBQWM7SUFDOUIsT0FBTyxJQUFJL0csU0FBUyxDQUNsQixJQUFJLEVBQ0osSUFBSSxDQUFDaUUsZ0JBQWdCLENBQUN5QyxHQUFHLENBQUMsQ0FBQyxDQUFDTSxJQUFJLENBQUMsQ0FBQyxFQUNsQyxJQUFJLENBQUMxQyxnQkFBZ0IsQ0FBQ29DLEdBQUcsQ0FBQyxDQUFDLENBQUNNLElBQUksQ0FBQyxDQUFDLEVBQ2xDLElBQUksQ0FBQ2pFLG9CQUFvQixDQUFDMkQsR0FBRyxDQUFDLENBQUMsQ0FBQ00sSUFBSSxDQUFDLENBQUMsRUFDdEMsSUFBSSxDQUFDakMsWUFBWSxDQUFDMkIsR0FBRyxDQUFDLENBQUMsRUFDdkIsSUFBSSxDQUFDekIsa0JBQWtCLENBQUN5QixHQUFHLENBQUMsQ0FBQyxFQUM3QixJQUFJLENBQUN4QixnQkFBZ0IsQ0FBQ3dCLEdBQUcsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQ3BFLGNBQ1AsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1MyRSxhQUFhQSxDQUFBLEVBQVM7SUFDM0IsSUFBSSxDQUFDaEQsZ0JBQWdCLENBQUNpRCx3QkFBd0IsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQzVDLGdCQUFnQixDQUFDNEMsd0JBQXdCLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUN0QyxhQUFhLENBQUNzQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQ25DLFlBQVksQ0FBQ21DLHdCQUF3QixDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDakMsa0JBQWtCLENBQUNpQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQ2hDLGdCQUFnQixDQUFDZ0Msd0JBQXdCLENBQUMsQ0FBQztFQUNsRDs7RUFFQTtBQUNGO0FBQ0E7RUFDU0Msd0JBQXdCQSxDQUFFQyxTQUEwRyxFQUFTO0lBQ2xKLElBQUssQ0FBQyxJQUFJLENBQUNuQyxrQkFBa0IsQ0FBQ29DLEtBQUssRUFBRztNQUNwQyxJQUFLLElBQUksQ0FBQ2xDLGlCQUFpQixDQUFDa0MsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDOUIsY0FBYyxFQUFHO1FBQzFELElBQUksQ0FBQ3RCLGdCQUFnQixDQUFDZ0MsR0FBRyxDQUFFbUIsU0FBUyxDQUFDRSxRQUFTLENBQUM7UUFDL0MsSUFBSSxDQUFDaEQsZ0JBQWdCLENBQUMyQixHQUFHLENBQUVtQixTQUFTLENBQUMxQyxRQUFTLENBQUM7TUFDakQ7TUFDQSxJQUFJLENBQUMzQixvQkFBb0IsQ0FBQ3NFLEtBQUssR0FBR0QsU0FBUyxDQUFDRyxZQUFZO01BQ3hELElBQUksQ0FBQzNDLGFBQWEsQ0FBQ3FCLEdBQUcsQ0FBRW1CLFNBQVMsQ0FBQ0csWUFBWSxDQUFDQyxjQUFjLENBQUVKLFNBQVMsQ0FBQ3BDLElBQUssQ0FBRSxDQUFDO01BQ2pGLElBQUksQ0FBQ0UsZ0JBQWdCLENBQUNlLEdBQUcsQ0FBRW1CLFNBQVMsQ0FBQ0ssUUFBUyxDQUFDO0lBQ2pEO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxZQUFZQSxDQUFBLEVBQVM7SUFFMUI7SUFDQSxJQUFLLENBQUMsSUFBSSxDQUFDbkMsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDTixrQkFBa0IsQ0FBQ3lCLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDdkIsaUJBQWlCLENBQUNrQyxLQUFLLEVBQUc7TUFDNUYsSUFBSSxDQUFDTSxZQUFZLENBQUMsQ0FBQztJQUNyQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1VBLFlBQVlBLENBQUEsRUFBUztJQUMzQixNQUFNYixTQUFTLEdBQUcsSUFBSSxDQUFDN0MsZ0JBQWdCLENBQUN5QyxHQUFHLENBQUMsQ0FBQztJQUM3QyxJQUFJLENBQUMxRixJQUFJLENBQUM0RyxJQUFJLENBQUVkLFNBQVUsQ0FBQztJQUMzQixJQUFJLENBQUN0QixpQkFBaUIsQ0FBQ29CLElBQUksQ0FBRUUsU0FBUyxFQUFFLElBQUksQ0FBQzNGLElBQUssQ0FBQzs7SUFFbkQ7SUFDQSxJQUFLLElBQUksQ0FBQ0gsSUFBSSxDQUFDNkcsTUFBTSxHQUFHLENBQUMsRUFBRztNQUMxQixNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDOUcsSUFBSSxDQUFFLElBQUksQ0FBQ0EsSUFBSSxDQUFDNkcsTUFBTSxHQUFHLENBQUMsQ0FBRSxDQUFDekIsS0FBSyxDQUFFLElBQUksQ0FBQ3BGLElBQUksQ0FBRSxJQUFJLENBQUNBLElBQUksQ0FBQzZHLE1BQU0sR0FBRyxDQUFDLENBQUcsQ0FBQztNQUMvRixNQUFNRSxjQUFjLEdBQUdELFVBQVUsQ0FBQ25ELFNBQVM7TUFFM0MsSUFBSSxDQUFDNUQsZUFBZSxJQUFJZ0gsY0FBYztJQUN4Qzs7SUFFQTtJQUNBO0lBQ0EsT0FBUSxJQUFJLENBQUNoSCxlQUFlLEdBQUcsSUFBSSxDQUFDcUIsYUFBYSxJQUFJLElBQUksQ0FBQ3BCLElBQUksQ0FBQzZHLE1BQU0sR0FBRyxJQUFJLENBQUN4RixlQUFlLEVBQUc7TUFDN0YsTUFBTTJGLElBQUksR0FBRyxJQUFJLENBQUNoSCxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUNvRixLQUFLLENBQUUsSUFBSSxDQUFDcEYsSUFBSSxDQUFFLENBQUMsQ0FBRyxDQUFDO01BQ25ELE1BQU1pSCxhQUFhLEdBQUdELElBQUksQ0FBQ3JELFNBQVM7TUFFcEMsSUFBSSxDQUFDM0QsSUFBSSxDQUFDa0gsS0FBSyxDQUFDLENBQUM7TUFDakIsSUFBSSxDQUFDdkMsbUJBQW1CLENBQUNpQixJQUFJLENBQUUsSUFBSSxDQUFDekYsSUFBSyxDQUFDO01BRTFDLElBQUksQ0FBQ0osZUFBZSxJQUFJa0gsYUFBYTtJQUN2QztFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRSxTQUFTQSxDQUFBLEVBQVM7SUFDdkIsSUFBSSxDQUFDbkgsSUFBSSxHQUFHLEVBQUU7SUFDZCxJQUFJLENBQUNGLFVBQVUsR0FBRyxDQUFDO0lBQ25CLElBQUksQ0FBQ0MsZUFBZSxHQUFHLENBQUM7SUFDeEIsSUFBSSxDQUFDNkUsY0FBYyxDQUFDZ0IsSUFBSSxDQUFFLElBQUksQ0FBQ3pGLElBQUssQ0FBQztFQUN2QztFQUVPaUgsUUFBUUEsQ0FBQSxFQUFTO0lBQ3RCLElBQUksQ0FBQ25FLGdCQUFnQixDQUFDb0UsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDL0QsZ0JBQWdCLENBQUMrRCxLQUFLLENBQUMsQ0FBQztJQUM3QixJQUFJLENBQUN0RixvQkFBb0IsQ0FBQ3NGLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLElBQUksQ0FBQ3pELGFBQWEsQ0FBQ3lELEtBQUssQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQ3RELFlBQVksQ0FBQ3NELEtBQUssQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQ3JGLGdCQUFnQixDQUFDcUYsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDcEQsa0JBQWtCLENBQUNvRCxLQUFLLENBQUMsQ0FBQztJQUMvQixJQUFJLENBQUNoRixnQ0FBZ0MsQ0FBQ2dGLEtBQUssQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQ25ELGdCQUFnQixDQUFDbUQsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDRixTQUFTLENBQUMsQ0FBQztFQUNsQjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0csY0FBY0EsQ0FBRUMsWUFBb0IsRUFBaUI7SUFDMUQsT0FBTyxJQUFJLENBQUNoSCxRQUFRLENBQUUsSUFBSSxFQUFFZ0gsWUFBYSxDQUFDO0VBQzVDOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxxQkFBcUJBLENBQUEsRUFBUztJQUNuQyxJQUFJLENBQUMvRixnQkFBZ0IsQ0FBQ3lCLENBQUMsR0FBRyxJQUFJLENBQUNELGdCQUFnQixDQUFDb0QsS0FBSyxDQUFDbkQsQ0FBQztJQUN2RCxJQUFJLENBQUN6QixnQkFBZ0IsQ0FBQzBCLENBQUMsR0FBRyxJQUFJLENBQUNGLGdCQUFnQixDQUFDb0QsS0FBSyxDQUFDbEQsQ0FBQztFQUN6RDs7RUFFQTtBQUNGO0FBQ0E7RUFDU3NFLGFBQWFBLENBQUVoSSxJQUFVLEVBQVk7SUFDMUMsTUFBTWlJLFNBQVMsR0FBRyxJQUFJLENBQUN6RSxnQkFBZ0IsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFDO0lBQzdDLE1BQU1pQyxTQUFTLEdBQUdsSSxJQUFJLENBQUN3RCxnQkFBZ0IsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFDOztJQUU3QztJQUNBdkcsVUFBVSxDQUFDK0QsQ0FBQyxHQUFHd0UsU0FBUyxDQUFDeEUsQ0FBQyxHQUFHeUUsU0FBUyxDQUFDekUsQ0FBQztJQUN4Qy9ELFVBQVUsQ0FBQ2dFLENBQUMsR0FBR3VFLFNBQVMsQ0FBQ3ZFLENBQUMsR0FBR3dFLFNBQVMsQ0FBQ3hFLENBQUM7SUFFeEMsTUFBTXlFLFFBQVEsR0FBR3pJLFVBQVUsQ0FBQ3dFLFNBQVM7SUFDckMsTUFBTWtFLFFBQVEsR0FBRyxJQUFJLENBQUM3RixnQkFBZ0IsQ0FBQzBELEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHakcsSUFBSSxDQUFDdUMsZ0JBQWdCLENBQUMwRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDbEYsT0FBT2tDLFFBQVEsR0FBR0MsUUFBUTtFQUM1Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTQyxNQUFNQSxDQUFBLEVBQVM7SUFDcEIsSUFBSSxDQUFDN0UsZ0JBQWdCLENBQUM2RSxNQUFNLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUN4RSxnQkFBZ0IsQ0FBQ3dFLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQ2xFLGFBQWEsQ0FBQ2tFLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQy9ELFlBQVksQ0FBQytELE1BQU0sQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQzdELGtCQUFrQixDQUFDNkQsTUFBTSxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDNUQsZ0JBQWdCLENBQUM0RCxNQUFNLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUNYLFNBQVMsQ0FBQyxDQUFDO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTWSx1QkFBdUJBLENBQUEsRUFBeUM7SUFDckUsT0FBTyxDQUNMLElBQUksQ0FBQzlFLGdCQUFnQixFQUNyQixJQUFJLENBQUNLLGdCQUFnQixFQUNyQixJQUFJLENBQUNTLFlBQVksRUFDakIsSUFBSSxDQUFDRSxrQkFBa0IsQ0FDeEI7RUFDSDtFQUVRK0Qsd0JBQXdCQSxDQUFBLEVBQVM7SUFDdkMsSUFBSSxDQUFDL0UsZ0JBQWdCLENBQUNvRSxLQUFLLENBQUMsQ0FBQztJQUM3QixJQUFJLENBQUMvRCxnQkFBZ0IsQ0FBQytELEtBQUssQ0FBQyxDQUFDO0VBQy9CO0VBRWlCWSxRQUFRQSxDQUFBLEVBQVc7SUFDbEMsT0FBUSxVQUFTLElBQUksQ0FBQzlILElBQUssWUFBVyxJQUFJLENBQUM0RCxZQUFZLENBQUMyQixHQUFHLENBQUMsQ0FBRSxFQUFDO0VBQ2pFO0FBQ0Y7QUFJQTVHLGdCQUFnQixDQUFDb0osUUFBUSxDQUFFLE1BQU0sRUFBRTlJLElBQUssQ0FBQyJ9