// Copyright 2013-2022, University of Colorado Boulder

/**
 * Model for the Motion, Friction and Acceleration screens
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import crate_png from '../../../images/crate_png.js';
import fridge_png from '../../../images/fridge_png.js';
import mysteryObject01_png from '../../../images/mysteryObject01_png.js';
import waterBucket_png from '../../../images/waterBucket_png.js';
import girlHolding_png from '../../../mipmaps/girlHolding_png.js';
import girlSitting_png from '../../../mipmaps/girlSitting_png.js';
import girlStanding_png from '../../../mipmaps/girlStanding_png.js';
import manHolding_png from '../../../mipmaps/manHolding_png.js';
import manSitting_png from '../../../mipmaps/manSitting_png.js';
import manStanding_png from '../../../mipmaps/manStanding_png.js';
import trashCan_png from '../../../mipmaps/trashCan_png.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import MotionConstants from '../MotionConstants.js';
import Item from './Item.js';
class MotionModel {
  /**
   * Constructor for the motion model
   *
   * @param {string} screen String that indicates which of the 3 screens this model represents
   * @param {Tandem} tandem
   */
  constructor(screen, tandem) {
    //Motion models must be constructed with a screen, which indicates 'motion'|'friction'|'acceleration'
    assert && assert(screen);

    //Constants
    this.screen = screen;
    this.skateboard = screen === 'motion';
    this.accelerometer = screen === 'acceleration';
    const frictionValue = screen === 'motion' ? 0 : MotionConstants.MAX_FRICTION / 2;
    this.stack = createObservableArray({
      tandem: tandem.createTandem('stackObservableArray'),
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(IOType.ObjectIO))
    });

    // @public - force applied to the stack of items by the pusher
    this.appliedForceProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('appliedForceProperty'),
      units: 'N',
      range: new Range(-500, 500)
    });

    // @public - force applied to the stack of items by friction
    this.frictionForceProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('frictionForceProperty'),
      units: 'N'
    });

    // @public - friction of the ground
    this.frictionProperty = new NumberProperty(frictionValue, {
      tandem: tandem.createTandem('frictionProperty')
    });

    // @public - sum of all forces acting on the stack of items
    this.sumOfForcesProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('sumOfForcesProperty'),
      units: 'N'
    });

    // @public - 1-D position of the stack of items
    this.positionProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('positionProperty'),
      units: 'm'
    });

    // @public - speed of the stack of items, in the x direction
    this.speedProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('speedProperty'),
      units: 'm/s'
    });

    // @public - elocity is a 1-d vector, where the direction (right or left) is indicated by the sign
    this.velocityProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('velocityProperty'),
      units: 'm/s'
    });

    // @public - 1-d acceleration of the stack of items
    this.accelerationProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('accelerationProperty'),
      units: 'm/s/s'
    });

    // @public {number} - initially to the left of the box by this many meters
    this.pusherPositionProperty = new NumberProperty(-16, {
      tandem: tandem.createTandem('pusherPositionProperty'),
      units: 'm'
    });

    // @public {boolean} - whether or not forces are visible
    this.showForceProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('showForceProperty')
    });

    // @public {boolean} - whether or not values are visible
    this.showValuesProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showValuesProperty')
    });

    // @public {boolean} - whether or not sum of forces is visible
    this.showSumOfForcesProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showSumOfForcesProperty')
    });

    // @public {boolean} - whether or not speedometer is visible
    this.showSpeedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showSpeedProperty')
    });

    // @public {boolean} - whether or not mass values are visible
    this.showMassesProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showMassesProperty')
    });

    // @public {boolean} - whether or not acceleration meter is visible
    this.showAccelerationProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showAccelerationProperty')
    });

    //  @public Keep track of whether the speed is classified as:
    // 'RIGHT_SPEED_EXCEEDED', 'LEFT_SPEED_EXCEEDED' or 'WITHIN_ALLOWED_RANGE'
    // so that the Applied Force can be stopped if the speed goes out of range.
    // TODO: Why not an enum?
    this.speedClassificationProperty = new StringProperty('WITHIN_ALLOWED_RANGE', {
      tandem: tandem.createTandem('speedClassificationProperty')
    });

    // @public {string} See speedClassification
    // TODO: Why not an enum?
    this.previousSpeedClassificationProperty = new StringProperty('WITHIN_ALLOWED_RANGE', {
      tandem: tandem.createTandem('previousSpeedClassificationProperty')
    });

    // @public {boolean} - whether or not the stack of items is moving to the right
    this.movingRightProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('movingRightProperty')
    });

    // @public {string} - 'right'|'left'|none, direction of movement of the stack of items
    // TODO: Why not an enum?
    this.directionProperty = new StringProperty('none', {
      tandem: tandem.createTandem('directionProperty')
    });

    // @public {number} - time since pusher has fallen over, in seconds
    // TODO: Should we this have a tandem? It spams the data stream.
    // TODO: Why is default value 10?
    this.timeSinceFallenProperty = new NumberProperty(10, {
      units: 's'
    });

    // @public {boolean} - whether or not the pusher has fallen over
    this.fallenProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('fallenProperty')
    });

    // @public {string} - 'left'|'right', direction pusher facing when it falls over
    this.fallenDirectionProperty = new StringProperty('left', {
      tandem: tandem.createTandem('fallenDirectionProperty')
    });

    // @public {number} - how long the simulation has been running
    // TODO: Should we this have a tandem? It spams the data stream.
    this.timeProperty = new NumberProperty(0, {
      units: 's'
    });

    //stack.length is already a property, but mirror it here to easily multilink with it, see usage in MotionScreenView.js
    //TODO: Perhaps a DerivedProperty would be more suitable instead of duplicating/synchronizing this value
    this.stackSizeProperty = new NumberProperty(1, {
      tandem: tandem.createTandem('stackSizeProperty')
    });

    // @public {boolean} - is the sim running or paused?
    this.playProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('playProperty')
    });

    // @public DerivedProperty to observe whether or not the friction is zero
    this.frictionZeroProperty = new DerivedProperty([this.frictionProperty], friction => friction === 0);

    // @public DerivedProperty to observe whether or not the friction is zero
    this.frictionNonZeroProperty = new DerivedProperty([this.frictionProperty], friction => friction !== 0);

    // @public - broadcast messages on step and reset all
    this.resetAllEmitter = new Emitter();
    this.stepEmitter = new Emitter();

    //Zero out the applied force when the last object is removed.  Necessary to remove the force applied with the slider tweaker buttons.  See #37
    this.stack.lengthProperty.link(length => {
      if (length === 0) {
        this.appliedForceProperty.set(0);
      }
    });

    // TODO: Should stacksize Property be removed?
    this.stack.lengthProperty.link(length => {
      this.stackSizeProperty.set(length);
    });

    // track the previous model position when model position changes
    // animation for the pusher and background nodes is based off of
    // the change in model position (this.position - this.previousModelPosition )
    this.previousModelPosition = this.positionProperty.value;

    // create the items - Initial positions determined empirically
    const bucket = new Item(this, 'bucket', tandem.createTandem('bucket'), waterBucket_png, 100, 840, 547 + -45, 0.78, 1.0, 8);
    bucket.bucket = true;
    const fridge = new Item(this, 'fridge', tandem.createTandem('fridge'), fridge_png, 200, 23, 437, 0.8, 1.1, 4);
    const crate1 = new Item(this, 'crate1', tandem.createTandem('crate1'), crate_png, 50, 129, 507, 0.5);
    const crate2 = new Item(this, 'crate2', tandem.createTandem('crate2'), crate_png, 50, 219, 507, 0.5);
    const girl = new Item(this, 'girl', tandem.createTandem('girl'), girlStanding_png, 40, 689, 465, 0.6, 1.0, 4.2, girlSitting_png, girlHolding_png[1].img);
    const man = new Item(this, 'man', tandem.createTandem('man'), manStanding_png, 80, 750, 428, 0.6, 0.92, 5, manSitting_png, manHolding_png);
    this.items = this.accelerometer ? [fridge, crate1, crate2, girl, man, bucket] : [fridge, crate1, crate2, girl, man, new Item(this, 'trash', tandem.createTandem('trash'), trashCan_png, 100, 816, 496, 0.7, 1.0, 5), new Item(this, 'mystery', tandem.createTandem('mystery'), mysteryObject01_png, 50, 888, 513, 0.3, 1.0, undefined, undefined, undefined, true)];
    this.appliedForceProperty.link(appliedForce => {
      this.directionProperty.set(appliedForce > 0 ? 'right' : appliedForce < 0 ? 'left' : 'none');

      // if the applied force changes and the pusher is fallen, stand up to push immediately
      if (this.fallenProperty.get() && appliedForce !== 0) {
        this.fallenProperty.set(!this.fallenProperty.get());
      }
    });

    //Applied force should drop to zero if max speed reached
    this.speedClassificationProperty.link(speedClassification => {
      if (speedClassification !== 'WITHIN_ALLOWED_RANGE') {
        this.appliedForceProperty.set(0);
      }
    });

    // when we fall down, we want the applied force to immediately be zero
    // see https://github.com/phetsims/forces-and-motion-basics/issues/180
    this.fallenProperty.link(fallen => {
      if (fallen) {
        this.appliedForceProperty.set(0);
      }
    });

    // update the previous model position for computations based on the delta
    // linked lazily so that oldPosition is always defined
    this.positionProperty.lazyLink((position, oldPosition) => {
      this.previousModelPosition = oldPosition;
    });
  }

  /**
   * Get an array representing the items that are being dragged.
   *
   * @returns {Array.<Item>}
   * @public
   */
  draggingItems() {
    const draggingItems = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.draggingProperty.get()) {
        draggingItems.push(item);
      }
    }
    return draggingItems;
  }

  /**
   * Upper items should fall if an item removed from beneath
   * Uses the view to get item dimensions.
   *
   * @param {number} index - index of item in the stack array
   * @public
   */
  spliceStack(index) {
    const item = this.stack.get(index);
    this.stack.remove(item);
    if (this.stack.length > 0) {
      let sumHeight = 0;
      for (let i = 0; i < this.stack.length; i++) {
        const size = this.view.getSize(this.stack.get(i));
        sumHeight += size.height;
        this.stack.get(i).animateTo(this.view.layoutBounds.width / 2 - size.width / 2 + this.stack.get(i).centeringOffset, (this.skateboard ? 334 : 360) - sumHeight, 'stack'); //TODO: factor out this code for layout, which is duplicated in MotionTab.topOfStack
      }
    }

    //If the stack is emptied, stop the motion
    if (this.stack.length === 0) {
      this.velocityProperty.set(0);
      this.accelerationProperty.set(0);
    }
    return item;
  }

  // @public - When a 4th item is placed on the stack, move the bottom item home and have the stack fall
  spliceStackBottom() {
    const bottom = this.spliceStack(0);
    bottom.onBoardProperty.set(false);
    bottom.animateHome();
  }

  /**
   * Determine whether a value is positive, negative, or zero for the physics computations.
   *
   * @param  {number} value
   * @returns {number}
   * @public
   */
  getSign(value) {
    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }

  /**
   * Returns the friction force on an object given the applied force.  The friction and applied
   * forces are rounded so that they have the same precision. If one force is more precise,
   * a system with seemingly equal forces can lose energy.
   * See https://github.com/phetsims/forces-and-motion-basics/issues/197
   *
   * @param  {number} appliedForce
   * @returns {number}
   * @public
   */
  getFrictionForce(appliedForce) {
    let frictionForce;

    // Why does g=10.0?  See https://github.com/phetsims/forces-and-motion-basics/issues/132
    // We decide to keep it as it is, even though 9.8 may be more realistic.
    const g = 10.0;
    const mass = this.getStackMass();
    const frictionForceMagnitude = Math.abs(this.frictionProperty.get() * mass * g);

    //Friction force only applies above this velocity
    const velocityThreshold = 1E-12;

    //Object is motionless, friction should oppose the applied force
    if (Math.abs(this.velocityProperty.get()) <= velocityThreshold) {
      //the friction is higher than the applied force, so don't allow the friction force to be higher than the applied force
      frictionForce = frictionForceMagnitude >= Math.abs(appliedForce) ? -appliedForce :
      //Oppose the applied force
      -this.getSign(this.appliedForceProperty.get()) * frictionForceMagnitude;
    }

    //Object is moving, so friction should oppose the velocity
    else {
      frictionForce = -this.getSign(this.velocityProperty.get()) * frictionForceMagnitude * 0.75;
    }

    // round the friction force so that one force is not more precise than another
    return Utils.roundSymmetric(frictionForce);
  }

  // @public - Compute the mass of the entire stack, for purposes of momentum computation
  getStackMass() {
    let mass = 0;
    for (let i = 0; i < this.stack.length; i++) {
      mass += this.stack.get(i).mass;
    }
    return mass;
  }

  /**
   * Determine whether a value is positive, negative or zero to determine wheter the object changed directions.
   * @param  {number} value
   * @returns {number}
   * @public
   */
  sign(value) {
    return value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero';
  }

  /**
   * Determine whether a velocity value changed direction.
   * @param  {number} a - initial value
   * @param  {number} b - second value
   * @returns {boolean}
   * @public
   */
  changedDirection(a, b) {
    return this.sign(a) === 'negative' && this.sign(b) === 'positive' || this.sign(b) === 'negative' && this.sign(a) === 'positive';
  }

  // @public - get the pusher position relative to the center and layout bounds of the view
  getRelativePusherPosition() {
    return this.view.layoutBounds.width / 2 + (this.pusherPositionProperty.get() - this.positionProperty.get()) * MotionConstants.POSITION_SCALE;
  }

  /**
   * Step function for this model, function of the time step.  Called by step and manualStep functions below.
   *
   * @param {number} dt - time step
   * @public
   */
  stepModel(dt) {
    // update the tracked time which is used by the WaterBucketNode and the Accelerometer
    this.timeProperty.set(this.timeProperty.get() + dt);

    // update the acceleration values
    const mass = this.getStackMass();
    this.accelerationProperty.set(mass !== 0 ? this.sumOfForcesProperty.get() / mass : 0.0);
    let newVelocity = this.velocityProperty.get() + this.accelerationProperty.get() * dt;

    //friction force should not be able to make the object move backwards
    //Also make sure velocity goes exactly to zero when the pusher is pushing so that the friction force will be correctly computed
    //Without this logic, it was causing flickering arrows because the velocity was flipping sign and the friction force was flipping direction
    if (this.changedDirection(newVelocity, this.velocityProperty.get())) {
      newVelocity = 0.0;
    }

    //Cap at strobe speed.  This is necessary so that a reverse applied force will take effect immediately, without these lines of code the pusher will stutter.
    if (newVelocity > MotionConstants.MAX_SPEED) {
      newVelocity = MotionConstants.MAX_SPEED;
    }
    if (newVelocity < -MotionConstants.MAX_SPEED) {
      newVelocity = -MotionConstants.MAX_SPEED;
    }
    this.velocityProperty.set(newVelocity);
    this.positionProperty.set(this.positionProperty.get() + this.velocityProperty.get() * dt);
    this.speedProperty.set(Math.abs(this.velocityProperty.get()));
    this.speedClassificationProperty.set(this.velocityProperty.get() >= MotionConstants.MAX_SPEED ? 'RIGHT_SPEED_EXCEEDED' : this.velocityProperty.get() <= -MotionConstants.MAX_SPEED ? 'LEFT_SPEED_EXCEEDED' : 'WITHIN_ALLOWED_RANGE');
    if (this.speedClassificationProperty.get() !== 'WITHIN_ALLOWED_RANGE') {
      this.timeSinceFallenProperty.set(0);
      this.fallenDirectionProperty.set(this.speedClassificationProperty.get() === 'RIGHT_SPEED_EXCEEDED' ? 'right' : 'left');
      this.fallenProperty.set(true);
    } else {
      // if the pusher is very far off screen, stand up immediately
      // based on width of the background image, determined by visual inspection
      const relativePosition = this.getRelativePusherPosition();
      if (relativePosition > 1600 || relativePosition < -600) {
        this.fallenProperty.set(false);
      }
      this.timeSinceFallenProperty.set(this.timeSinceFallenProperty.get() + dt);

      //Stand up after 2 seconds
      if (this.timeSinceFallenProperty.get() > 2) {
        this.fallenProperty.set(false);
      }
    }

    //Stand up if applying a force in the opposite direction that you fell
    if (this.fallenProperty.get() && this.fallenDirectionProperty.get() === 'left' && this.appliedForceProperty.get() > 0) {
      this.fallenProperty.set(false);
    }
    if (this.fallenProperty.get() && this.fallenDirectionProperty.get() === 'right' && this.appliedForceProperty.get() < 0) {
      this.fallenProperty.set(false);
    }
    if (this.previousSpeedClassificationProperty.get() !== 'WITHIN_ALLOWED_RANGE') {
      this.speedClassificationProperty.set(this.previousSpeedClassificationProperty.get());
    }

    //Don't show the pusher as fallen while applying a force, see https://github.com/phetsims/forces-and-motion-basics/issues/66
    if (this.appliedForceProperty.get() !== 0 && this.speedClassificationProperty.get() === 'WITHIN_ALLOWED_RANGE') {
      this.fallenProperty.set(false);
    }
  }

  /**
   * Update the physics.
   *
   * @param {number} dt
   * @public
   */
  step(dt) {
    // Computes the new forces and sets them to the corresponding properties
    // The first part of stepInTime is to compute and set the forces.  This is factored out because the forces must
    // also be updated when the user changes the friction force or mass while the sim is paused.
    this.frictionForceProperty.set(this.getFrictionForce(this.appliedForceProperty.get()));
    this.sumOfForcesProperty.set(this.frictionForceProperty.get() + this.appliedForceProperty.get());
    if (this.playProperty.get()) {
      this.stepModel(dt);
    }

    // update the pusher position every time step, even if the sim is paused
    if (this.appliedForceProperty.get() !== 0) {
      this.pusherPositionProperty.set(this.positionProperty.get() + 2 * (this.appliedForceProperty.get() > 0 ? -1 : 1));
    }

    // step all model items so that they are interactive while paused
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].step(dt);
    }

    // notify that the sim has stepped to calculate forces.  This needs to update even when the sim is paused.
    this.stepEmitter.emit();
  }

  /**
   * Manually step the model by a small time step.  This function is used by the 'step' button under
   * the control panel.  Assumes 60 frames per second.
   * @public
   */
  manualStep() {
    this.stepModel(1 / 60);
  }

  /**
   * Determine whether an item is in the stack.
   * @param  {Item} item
   * @returns {boolean}
   * @public
   */
  isInStack(item) {
    return this.stack.includes(item);
  }

  /**
   * Determine whether an item is stacked above another item, so that the arms can be raised for humans.
   *
   * @param  {Item}
   * @returns {boolean}
   * @public
   */
  isItemStackedAbove(item) {
    return this.isInStack(item) && this.stack.indexOf(item) < this.stack.length - 1;
  }

  // @public - Reset the model
  reset() {
    // reset all Properties of this model.
    this.appliedForceProperty.reset();
    this.frictionForceProperty.reset();
    this.frictionProperty.reset();
    this.sumOfForcesProperty.reset();
    this.positionProperty.reset();
    this.speedProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.pusherPositionProperty.reset();
    this.showForceProperty.reset();
    this.showValuesProperty.reset();
    this.showSumOfForcesProperty.reset();
    this.showSpeedProperty.reset();
    this.showMassesProperty.reset();
    this.showAccelerationProperty.reset();
    this.speedClassificationProperty.reset();
    this.previousSpeedClassificationProperty.reset();
    this.movingRightProperty.reset();
    this.directionProperty.reset();
    this.timeSinceFallenProperty.reset();
    this.fallenProperty.reset();
    this.fallenDirectionProperty.reset();
    this.timeProperty.reset();
    this.stackSizeProperty.reset();
    this.playProperty.reset();
    for (let i = 0; i < this.items.length; i++) {
      // if the item is being dragged we need to cancel the drag in ItemNode
      if (!this.items[i].draggingProperty.get()) {
        this.items[i].reset();
      }
    }

    // also reset the previous model position, used by the pusher to track translations
    this.previousModelPosition = this.positionProperty.initialValue;

    // notify that a reset was triggered
    this.resetAllEmitter.emit();
    this.stack.clear();

    //Move the initial crate to the play area, since it resets to the toolbox, not its initial position.
    this.viewInitialized(this.view);
  }

  /**
   * After the view is constructed, move one of the blocks to the top of the stack.
   * It would be better if more of this could be done in the model constructor, but it would be difficult with the way things are currently set up.
   * @param {ScreenView} view
   * @public
   */
  viewInitialized(view) {
    const item = this.items[1];
    // only move item to the top of the stack if it is not being dragged
    if (!item.draggingProperty.get()) {
      this.view = view;
      item.onBoardProperty.set(true);
      const itemNode = view.itemNodes[1];
      item.animationStateProperty.set({
        enabled: false,
        x: 0,
        y: 0,
        end: null
      });
      item.interactionScaleProperty.set(1.3);
      const scaledWidth = this.view.getSize(item).width;
      item.positionProperty.set(new Vector2(view.layoutBounds.width / 2 - scaledWidth / 2, view.topOfStack - itemNode.height));
      this.stack.add(item);
    }
  }

  /**
   * Get the state of the simulation, for persistence.
   * @returns {{properties: *, stack: Array}}
   * @public
   */
  getState() {
    return {
      properties: this.getValues(),
      stack: this.stack.getArray().map(item => item.get().name).join(',')
    };
  }
}
forcesAndMotionBasics.register('MotionModel', MotionModel);
export default MotionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiSU9UeXBlIiwiUmVmZXJlbmNlSU8iLCJjcmF0ZV9wbmciLCJmcmlkZ2VfcG5nIiwibXlzdGVyeU9iamVjdDAxX3BuZyIsIndhdGVyQnVja2V0X3BuZyIsImdpcmxIb2xkaW5nX3BuZyIsImdpcmxTaXR0aW5nX3BuZyIsImdpcmxTdGFuZGluZ19wbmciLCJtYW5Ib2xkaW5nX3BuZyIsIm1hblNpdHRpbmdfcG5nIiwibWFuU3RhbmRpbmdfcG5nIiwidHJhc2hDYW5fcG5nIiwiZm9yY2VzQW5kTW90aW9uQmFzaWNzIiwiTW90aW9uQ29uc3RhbnRzIiwiSXRlbSIsIk1vdGlvbk1vZGVsIiwiY29uc3RydWN0b3IiLCJzY3JlZW4iLCJ0YW5kZW0iLCJhc3NlcnQiLCJza2F0ZWJvYXJkIiwiYWNjZWxlcm9tZXRlciIsImZyaWN0aW9uVmFsdWUiLCJNQVhfRlJJQ1RJT04iLCJzdGFjayIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1R5cGUiLCJPYnNlcnZhYmxlQXJyYXlJTyIsIk9iamVjdElPIiwiYXBwbGllZEZvcmNlUHJvcGVydHkiLCJ1bml0cyIsInJhbmdlIiwiZnJpY3Rpb25Gb3JjZVByb3BlcnR5IiwiZnJpY3Rpb25Qcm9wZXJ0eSIsInN1bU9mRm9yY2VzUHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5Iiwic3BlZWRQcm9wZXJ0eSIsInZlbG9jaXR5UHJvcGVydHkiLCJhY2NlbGVyYXRpb25Qcm9wZXJ0eSIsInB1c2hlclBvc2l0aW9uUHJvcGVydHkiLCJzaG93Rm9yY2VQcm9wZXJ0eSIsInNob3dWYWx1ZXNQcm9wZXJ0eSIsInNob3dTdW1PZkZvcmNlc1Byb3BlcnR5Iiwic2hvd1NwZWVkUHJvcGVydHkiLCJzaG93TWFzc2VzUHJvcGVydHkiLCJzaG93QWNjZWxlcmF0aW9uUHJvcGVydHkiLCJzcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHkiLCJwcmV2aW91c1NwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eSIsIm1vdmluZ1JpZ2h0UHJvcGVydHkiLCJkaXJlY3Rpb25Qcm9wZXJ0eSIsInRpbWVTaW5jZUZhbGxlblByb3BlcnR5IiwiZmFsbGVuUHJvcGVydHkiLCJmYWxsZW5EaXJlY3Rpb25Qcm9wZXJ0eSIsInRpbWVQcm9wZXJ0eSIsInN0YWNrU2l6ZVByb3BlcnR5IiwicGxheVByb3BlcnR5IiwiZnJpY3Rpb25aZXJvUHJvcGVydHkiLCJmcmljdGlvbiIsImZyaWN0aW9uTm9uWmVyb1Byb3BlcnR5IiwicmVzZXRBbGxFbWl0dGVyIiwic3RlcEVtaXR0ZXIiLCJsZW5ndGhQcm9wZXJ0eSIsImxpbmsiLCJsZW5ndGgiLCJzZXQiLCJwcmV2aW91c01vZGVsUG9zaXRpb24iLCJ2YWx1ZSIsImJ1Y2tldCIsImZyaWRnZSIsImNyYXRlMSIsImNyYXRlMiIsImdpcmwiLCJpbWciLCJtYW4iLCJpdGVtcyIsInVuZGVmaW5lZCIsImFwcGxpZWRGb3JjZSIsImdldCIsInNwZWVkQ2xhc3NpZmljYXRpb24iLCJmYWxsZW4iLCJsYXp5TGluayIsInBvc2l0aW9uIiwib2xkUG9zaXRpb24iLCJkcmFnZ2luZ0l0ZW1zIiwiaSIsIml0ZW0iLCJkcmFnZ2luZ1Byb3BlcnR5IiwicHVzaCIsInNwbGljZVN0YWNrIiwiaW5kZXgiLCJyZW1vdmUiLCJzdW1IZWlnaHQiLCJzaXplIiwidmlldyIsImdldFNpemUiLCJoZWlnaHQiLCJhbmltYXRlVG8iLCJsYXlvdXRCb3VuZHMiLCJ3aWR0aCIsImNlbnRlcmluZ09mZnNldCIsInNwbGljZVN0YWNrQm90dG9tIiwiYm90dG9tIiwib25Cb2FyZFByb3BlcnR5IiwiYW5pbWF0ZUhvbWUiLCJnZXRTaWduIiwiZ2V0RnJpY3Rpb25Gb3JjZSIsImZyaWN0aW9uRm9yY2UiLCJnIiwibWFzcyIsImdldFN0YWNrTWFzcyIsImZyaWN0aW9uRm9yY2VNYWduaXR1ZGUiLCJNYXRoIiwiYWJzIiwidmVsb2NpdHlUaHJlc2hvbGQiLCJyb3VuZFN5bW1ldHJpYyIsInNpZ24iLCJjaGFuZ2VkRGlyZWN0aW9uIiwiYSIsImIiLCJnZXRSZWxhdGl2ZVB1c2hlclBvc2l0aW9uIiwiUE9TSVRJT05fU0NBTEUiLCJzdGVwTW9kZWwiLCJkdCIsIm5ld1ZlbG9jaXR5IiwiTUFYX1NQRUVEIiwicmVsYXRpdmVQb3NpdGlvbiIsInN0ZXAiLCJlbWl0IiwibWFudWFsU3RlcCIsImlzSW5TdGFjayIsImluY2x1ZGVzIiwiaXNJdGVtU3RhY2tlZEFib3ZlIiwiaW5kZXhPZiIsInJlc2V0IiwiaW5pdGlhbFZhbHVlIiwiY2xlYXIiLCJ2aWV3SW5pdGlhbGl6ZWQiLCJpdGVtTm9kZSIsIml0ZW1Ob2RlcyIsImFuaW1hdGlvblN0YXRlUHJvcGVydHkiLCJlbmFibGVkIiwieCIsInkiLCJlbmQiLCJpbnRlcmFjdGlvblNjYWxlUHJvcGVydHkiLCJzY2FsZWRXaWR0aCIsInRvcE9mU3RhY2siLCJhZGQiLCJnZXRTdGF0ZSIsInByb3BlcnRpZXMiLCJnZXRWYWx1ZXMiLCJnZXRBcnJheSIsIm1hcCIsIm5hbWUiLCJqb2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb3Rpb25Nb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIE1vdGlvbiwgRnJpY3Rpb24gYW5kIEFjY2VsZXJhdGlvbiBzY3JlZW5zXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGNyYXRlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY3JhdGVfcG5nLmpzJztcclxuaW1wb3J0IGZyaWRnZV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2ZyaWRnZV9wbmcuanMnO1xyXG5pbXBvcnQgbXlzdGVyeU9iamVjdDAxX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvbXlzdGVyeU9iamVjdDAxX3BuZy5qcyc7XHJcbmltcG9ydCB3YXRlckJ1Y2tldF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3dhdGVyQnVja2V0X3BuZy5qcyc7XHJcbmltcG9ydCBnaXJsSG9sZGluZ19wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9naXJsSG9sZGluZ19wbmcuanMnO1xyXG5pbXBvcnQgZ2lybFNpdHRpbmdfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZ2lybFNpdHRpbmdfcG5nLmpzJztcclxuaW1wb3J0IGdpcmxTdGFuZGluZ19wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9naXJsU3RhbmRpbmdfcG5nLmpzJztcclxuaW1wb3J0IG1hbkhvbGRpbmdfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvbWFuSG9sZGluZ19wbmcuanMnO1xyXG5pbXBvcnQgbWFuU2l0dGluZ19wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9tYW5TaXR0aW5nX3BuZy5qcyc7XHJcbmltcG9ydCBtYW5TdGFuZGluZ19wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9tYW5TdGFuZGluZ19wbmcuanMnO1xyXG5pbXBvcnQgdHJhc2hDYW5fcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvdHJhc2hDYW5fcG5nLmpzJztcclxuaW1wb3J0IGZvcmNlc0FuZE1vdGlvbkJhc2ljcyBmcm9tICcuLi8uLi9mb3JjZXNBbmRNb3Rpb25CYXNpY3MuanMnO1xyXG5pbXBvcnQgTW90aW9uQ29uc3RhbnRzIGZyb20gJy4uL01vdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBJdGVtIGZyb20gJy4vSXRlbS5qcyc7XHJcblxyXG5jbGFzcyBNb3Rpb25Nb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgbW90aW9uIG1vZGVsXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NyZWVuIFN0cmluZyB0aGF0IGluZGljYXRlcyB3aGljaCBvZiB0aGUgMyBzY3JlZW5zIHRoaXMgbW9kZWwgcmVwcmVzZW50c1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NyZWVuLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy9Nb3Rpb24gbW9kZWxzIG11c3QgYmUgY29uc3RydWN0ZWQgd2l0aCBhIHNjcmVlbiwgd2hpY2ggaW5kaWNhdGVzICdtb3Rpb24nfCdmcmljdGlvbid8J2FjY2VsZXJhdGlvbidcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjcmVlbiApO1xyXG5cclxuICAgIC8vQ29uc3RhbnRzXHJcbiAgICB0aGlzLnNjcmVlbiA9IHNjcmVlbjtcclxuICAgIHRoaXMuc2thdGVib2FyZCA9IHNjcmVlbiA9PT0gJ21vdGlvbic7XHJcbiAgICB0aGlzLmFjY2VsZXJvbWV0ZXIgPSBzY3JlZW4gPT09ICdhY2NlbGVyYXRpb24nO1xyXG4gICAgY29uc3QgZnJpY3Rpb25WYWx1ZSA9IHNjcmVlbiA9PT0gJ21vdGlvbicgPyAwIDogTW90aW9uQ29uc3RhbnRzLk1BWF9GUklDVElPTiAvIDI7XHJcbiAgICB0aGlzLnN0YWNrID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YWNrT2JzZXJ2YWJsZUFycmF5JyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBJT1R5cGUuT2JqZWN0SU8gKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGZvcmNlIGFwcGxpZWQgdG8gdGhlIHN0YWNrIG9mIGl0ZW1zIGJ5IHRoZSBwdXNoZXJcclxuICAgIHRoaXMuYXBwbGllZEZvcmNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXBwbGllZEZvcmNlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTicsXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIC01MDAsIDUwMCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGZvcmNlIGFwcGxpZWQgdG8gdGhlIHN0YWNrIG9mIGl0ZW1zIGJ5IGZyaWN0aW9uXHJcbiAgICB0aGlzLmZyaWN0aW9uRm9yY2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmcmljdGlvbkZvcmNlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZnJpY3Rpb24gb2YgdGhlIGdyb3VuZFxyXG4gICAgdGhpcy5mcmljdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBmcmljdGlvblZhbHVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZyaWN0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gc3VtIG9mIGFsbCBmb3JjZXMgYWN0aW5nIG9uIHRoZSBzdGFjayBvZiBpdGVtc1xyXG4gICAgdGhpcy5zdW1PZkZvcmNlc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bU9mRm9yY2VzUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gMS1EIHBvc2l0aW9uIG9mIHRoZSBzdGFjayBvZiBpdGVtc1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvc2l0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gc3BlZWQgb2YgdGhlIHN0YWNrIG9mIGl0ZW1zLCBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICAgIHRoaXMuc3BlZWRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGVlZFByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ20vcydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZWxvY2l0eSBpcyBhIDEtZCB2ZWN0b3IsIHdoZXJlIHRoZSBkaXJlY3Rpb24gKHJpZ2h0IG9yIGxlZnQpIGlzIGluZGljYXRlZCBieSB0aGUgc2lnblxyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlbG9jaXR5UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbS9zJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSAxLWQgYWNjZWxlcmF0aW9uIG9mIHRoZSBzdGFjayBvZiBpdGVtc1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhY2NlbGVyYXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtL3MvcydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gaW5pdGlhbGx5IHRvIHRoZSBsZWZ0IG9mIHRoZSBib3ggYnkgdGhpcyBtYW55IG1ldGVyc1xyXG4gICAgdGhpcy5wdXNoZXJQb3NpdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAtMTYsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHVzaGVyUG9zaXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgZm9yY2VzIGFyZSB2aXNpYmxlXHJcbiAgICB0aGlzLnNob3dGb3JjZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93Rm9yY2VQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdmFsdWVzIGFyZSB2aXNpYmxlXHJcbiAgICB0aGlzLnNob3dWYWx1ZXNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Nob3dWYWx1ZXNQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3Qgc3VtIG9mIGZvcmNlcyBpcyB2aXNpYmxlXHJcbiAgICB0aGlzLnNob3dTdW1PZkZvcmNlc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd1N1bU9mRm9yY2VzUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IHNwZWVkb21ldGVyIGlzIHZpc2libGVcclxuICAgIHRoaXMuc2hvd1NwZWVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93U3BlZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgbWFzcyB2YWx1ZXMgYXJlIHZpc2libGVcclxuICAgIHRoaXMuc2hvd01hc3Nlc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd01hc3Nlc1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSB3aGV0aGVyIG9yIG5vdCBhY2NlbGVyYXRpb24gbWV0ZXIgaXMgdmlzaWJsZVxyXG4gICAgdGhpcy5zaG93QWNjZWxlcmF0aW9uUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93QWNjZWxlcmF0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAgQHB1YmxpYyBLZWVwIHRyYWNrIG9mIHdoZXRoZXIgdGhlIHNwZWVkIGlzIGNsYXNzaWZpZWQgYXM6XHJcbiAgICAvLyAnUklHSFRfU1BFRURfRVhDRUVERUQnLCAnTEVGVF9TUEVFRF9FWENFRURFRCcgb3IgJ1dJVEhJTl9BTExPV0VEX1JBTkdFJ1xyXG4gICAgLy8gc28gdGhhdCB0aGUgQXBwbGllZCBGb3JjZSBjYW4gYmUgc3RvcHBlZCBpZiB0aGUgc3BlZWQgZ29lcyBvdXQgb2YgcmFuZ2UuXHJcbiAgICAvLyBUT0RPOiBXaHkgbm90IGFuIGVudW0/XHJcbiAgICB0aGlzLnNwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ1dJVEhJTl9BTExPV0VEX1JBTkdFJywge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtzdHJpbmd9IFNlZSBzcGVlZENsYXNzaWZpY2F0aW9uXHJcbiAgICAvLyBUT0RPOiBXaHkgbm90IGFuIGVudW0/XHJcbiAgICB0aGlzLnByZXZpb3VzU3BlZWRDbGFzc2lmaWNhdGlvblByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnV0lUSElOX0FMTE9XRURfUkFOR0UnLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXZpb3VzU3BlZWRDbGFzc2lmaWNhdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSB3aGV0aGVyIG9yIG5vdCB0aGUgc3RhY2sgb2YgaXRlbXMgaXMgbW92aW5nIHRvIHRoZSByaWdodFxyXG4gICAgdGhpcy5tb3ZpbmdSaWdodFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3ZpbmdSaWdodFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfSAtICdyaWdodCd8J2xlZnQnfG5vbmUsIGRpcmVjdGlvbiBvZiBtb3ZlbWVudCBvZiB0aGUgc3RhY2sgb2YgaXRlbXNcclxuICAgIC8vIFRPRE86IFdoeSBub3QgYW4gZW51bT9cclxuICAgIHRoaXMuZGlyZWN0aW9uUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdub25lJywge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXJlY3Rpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSB0aW1lIHNpbmNlIHB1c2hlciBoYXMgZmFsbGVuIG92ZXIsIGluIHNlY29uZHNcclxuICAgIC8vIFRPRE86IFNob3VsZCB3ZSB0aGlzIGhhdmUgYSB0YW5kZW0/IEl0IHNwYW1zIHRoZSBkYXRhIHN0cmVhbS5cclxuICAgIC8vIFRPRE86IFdoeSBpcyBkZWZhdWx0IHZhbHVlIDEwP1xyXG4gICAgdGhpcy50aW1lU2luY2VGYWxsZW5Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMTAsIHtcclxuICAgICAgdW5pdHM6ICdzJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhlIHB1c2hlciBoYXMgZmFsbGVuIG92ZXJcclxuICAgIHRoaXMuZmFsbGVuUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmYWxsZW5Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ30gLSAnbGVmdCd8J3JpZ2h0JywgZGlyZWN0aW9uIHB1c2hlciBmYWNpbmcgd2hlbiBpdCBmYWxscyBvdmVyXHJcbiAgICB0aGlzLmZhbGxlbkRpcmVjdGlvblByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnbGVmdCcsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmFsbGVuRGlyZWN0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gaG93IGxvbmcgdGhlIHNpbXVsYXRpb24gaGFzIGJlZW4gcnVubmluZ1xyXG4gICAgLy8gVE9ETzogU2hvdWxkIHdlIHRoaXMgaGF2ZSBhIHRhbmRlbT8gSXQgc3BhbXMgdGhlIGRhdGEgc3RyZWFtLlxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdW5pdHM6ICdzJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vc3RhY2subGVuZ3RoIGlzIGFscmVhZHkgYSBwcm9wZXJ0eSwgYnV0IG1pcnJvciBpdCBoZXJlIHRvIGVhc2lseSBtdWx0aWxpbmsgd2l0aCBpdCwgc2VlIHVzYWdlIGluIE1vdGlvblNjcmVlblZpZXcuanNcclxuICAgIC8vVE9ETzogUGVyaGFwcyBhIERlcml2ZWRQcm9wZXJ0eSB3b3VsZCBiZSBtb3JlIHN1aXRhYmxlIGluc3RlYWQgb2YgZHVwbGljYXRpbmcvc3luY2hyb25pemluZyB0aGlzIHZhbHVlXHJcbiAgICB0aGlzLnN0YWNrU2l6ZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YWNrU2l6ZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBpcyB0aGUgc2ltIHJ1bm5pbmcgb3IgcGF1c2VkP1xyXG4gICAgdGhpcy5wbGF5UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsYXlQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgRGVyaXZlZFByb3BlcnR5IHRvIG9ic2VydmUgd2hldGhlciBvciBub3QgdGhlIGZyaWN0aW9uIGlzIHplcm9cclxuICAgIHRoaXMuZnJpY3Rpb25aZXJvUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eSBdLCBmcmljdGlvbiA9PiBmcmljdGlvbiA9PT0gMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgRGVyaXZlZFByb3BlcnR5IHRvIG9ic2VydmUgd2hldGhlciBvciBub3QgdGhlIGZyaWN0aW9uIGlzIHplcm9cclxuICAgIHRoaXMuZnJpY3Rpb25Ob25aZXJvUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eSBdLCBmcmljdGlvbiA9PiBmcmljdGlvbiAhPT0gMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBicm9hZGNhc3QgbWVzc2FnZXMgb24gc3RlcCBhbmQgcmVzZXQgYWxsXHJcbiAgICB0aGlzLnJlc2V0QWxsRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLnN0ZXBFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvL1plcm8gb3V0IHRoZSBhcHBsaWVkIGZvcmNlIHdoZW4gdGhlIGxhc3Qgb2JqZWN0IGlzIHJlbW92ZWQuICBOZWNlc3NhcnkgdG8gcmVtb3ZlIHRoZSBmb3JjZSBhcHBsaWVkIHdpdGggdGhlIHNsaWRlciB0d2Vha2VyIGJ1dHRvbnMuICBTZWUgIzM3XHJcbiAgICB0aGlzLnN0YWNrLmxlbmd0aFByb3BlcnR5LmxpbmsoIGxlbmd0aCA9PiB7IGlmICggbGVuZ3RoID09PSAwICkgeyB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LnNldCggMCApOyB9IH0gKTtcclxuXHJcbiAgICAvLyBUT0RPOiBTaG91bGQgc3RhY2tzaXplIFByb3BlcnR5IGJlIHJlbW92ZWQ/XHJcbiAgICB0aGlzLnN0YWNrLmxlbmd0aFByb3BlcnR5LmxpbmsoIGxlbmd0aCA9PiB7XHJcbiAgICAgIHRoaXMuc3RhY2tTaXplUHJvcGVydHkuc2V0KCBsZW5ndGggKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0cmFjayB0aGUgcHJldmlvdXMgbW9kZWwgcG9zaXRpb24gd2hlbiBtb2RlbCBwb3NpdGlvbiBjaGFuZ2VzXHJcbiAgICAvLyBhbmltYXRpb24gZm9yIHRoZSBwdXNoZXIgYW5kIGJhY2tncm91bmQgbm9kZXMgaXMgYmFzZWQgb2ZmIG9mXHJcbiAgICAvLyB0aGUgY2hhbmdlIGluIG1vZGVsIHBvc2l0aW9uICh0aGlzLnBvc2l0aW9uIC0gdGhpcy5wcmV2aW91c01vZGVsUG9zaXRpb24gKVxyXG4gICAgdGhpcy5wcmV2aW91c01vZGVsUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBpdGVtcyAtIEluaXRpYWwgcG9zaXRpb25zIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBJdGVtKCB0aGlzLCAnYnVja2V0JywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1Y2tldCcgKSwgd2F0ZXJCdWNrZXRfcG5nLCAxMDAsIDg0MCwgNTQ3ICsgLTQ1LCAwLjc4LCAxLjAsIDggKTtcclxuICAgIGJ1Y2tldC5idWNrZXQgPSB0cnVlO1xyXG4gICAgY29uc3QgZnJpZGdlID0gbmV3IEl0ZW0oIHRoaXMsICdmcmlkZ2UnLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZnJpZGdlJyApLCBmcmlkZ2VfcG5nLCAyMDAsIDIzLCA0MzcsIDAuOCwgMS4xLCA0ICk7XHJcbiAgICBjb25zdCBjcmF0ZTEgPSBuZXcgSXRlbSggdGhpcywgJ2NyYXRlMScsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjcmF0ZTEnICksIGNyYXRlX3BuZywgNTAsIDEyOSwgNTA3LCAwLjUgKTtcclxuICAgIGNvbnN0IGNyYXRlMiA9IG5ldyBJdGVtKCB0aGlzLCAnY3JhdGUyJywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NyYXRlMicgKSwgY3JhdGVfcG5nLCA1MCwgMjE5LCA1MDcsIDAuNSApO1xyXG4gICAgY29uc3QgZ2lybCA9IG5ldyBJdGVtKCB0aGlzLCAnZ2lybCcsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdnaXJsJyApLCBnaXJsU3RhbmRpbmdfcG5nLCA0MCwgNjg5LCA0NjUsIDAuNiwgMS4wLCA0LjIsIGdpcmxTaXR0aW5nX3BuZywgZ2lybEhvbGRpbmdfcG5nWyAxIF0uaW1nICk7XHJcbiAgICBjb25zdCBtYW4gPSBuZXcgSXRlbSggdGhpcywgJ21hbicsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYW4nICksIG1hblN0YW5kaW5nX3BuZywgODAsIDc1MCwgNDI4LCAwLjYsIDAuOTIsIDUsIG1hblNpdHRpbmdfcG5nLCBtYW5Ib2xkaW5nX3BuZyApO1xyXG4gICAgdGhpcy5pdGVtcyA9IHRoaXMuYWNjZWxlcm9tZXRlciA/XHJcbiAgICAgIFsgZnJpZGdlLCBjcmF0ZTEsIGNyYXRlMiwgZ2lybCwgbWFuLCBidWNrZXQgXSA6XHJcbiAgICAgIFsgZnJpZGdlLCBjcmF0ZTEsIGNyYXRlMiwgZ2lybCwgbWFuLFxyXG4gICAgICAgIG5ldyBJdGVtKCB0aGlzLCAndHJhc2gnLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndHJhc2gnICksIHRyYXNoQ2FuX3BuZywgMTAwLCA4MTYsIDQ5NiwgMC43LCAxLjAsIDUgKSxcclxuICAgICAgICBuZXcgSXRlbSggdGhpcywgJ215c3RlcnknLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbXlzdGVyeScgKSwgbXlzdGVyeU9iamVjdDAxX3BuZywgNTAsIDg4OCwgNTEzLCAwLjMsIDEuMCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSApXHJcbiAgICAgIF07XHJcblxyXG4gICAgdGhpcy5hcHBsaWVkRm9yY2VQcm9wZXJ0eS5saW5rKCBhcHBsaWVkRm9yY2UgPT4ge1xyXG4gICAgICB0aGlzLmRpcmVjdGlvblByb3BlcnR5LnNldCggYXBwbGllZEZvcmNlID4gMCA/ICdyaWdodCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGllZEZvcmNlIDwgMCA/ICdsZWZ0JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbm9uZScgKTtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSBhcHBsaWVkIGZvcmNlIGNoYW5nZXMgYW5kIHRoZSBwdXNoZXIgaXMgZmFsbGVuLCBzdGFuZCB1cCB0byBwdXNoIGltbWVkaWF0ZWx5XHJcbiAgICAgIGlmICggdGhpcy5mYWxsZW5Qcm9wZXJ0eS5nZXQoKSAmJiBhcHBsaWVkRm9yY2UgIT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5mYWxsZW5Qcm9wZXJ0eS5zZXQoICF0aGlzLmZhbGxlblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvL0FwcGxpZWQgZm9yY2Ugc2hvdWxkIGRyb3AgdG8gemVybyBpZiBtYXggc3BlZWQgcmVhY2hlZFxyXG4gICAgdGhpcy5zcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHkubGluayggc3BlZWRDbGFzc2lmaWNhdGlvbiA9PiB7XHJcbiAgICAgIGlmICggc3BlZWRDbGFzc2lmaWNhdGlvbiAhPT0gJ1dJVEhJTl9BTExPV0VEX1JBTkdFJyApIHtcclxuICAgICAgICB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2hlbiB3ZSBmYWxsIGRvd24sIHdlIHdhbnQgdGhlIGFwcGxpZWQgZm9yY2UgdG8gaW1tZWRpYXRlbHkgYmUgemVyb1xyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3JjZXMtYW5kLW1vdGlvbi1iYXNpY3MvaXNzdWVzLzE4MFxyXG4gICAgdGhpcy5mYWxsZW5Qcm9wZXJ0eS5saW5rKCBmYWxsZW4gPT4ge1xyXG4gICAgICBpZiAoIGZhbGxlbiApIHtcclxuICAgICAgICB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBwcmV2aW91cyBtb2RlbCBwb3NpdGlvbiBmb3IgY29tcHV0YXRpb25zIGJhc2VkIG9uIHRoZSBkZWx0YVxyXG4gICAgLy8gbGlua2VkIGxhemlseSBzbyB0aGF0IG9sZFBvc2l0aW9uIGlzIGFsd2F5cyBkZWZpbmVkXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoICggcG9zaXRpb24sIG9sZFBvc2l0aW9uICkgPT4ge1xyXG4gICAgICB0aGlzLnByZXZpb3VzTW9kZWxQb3NpdGlvbiA9IG9sZFBvc2l0aW9uO1xyXG4gICAgfSApO1xyXG5cclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBpdGVtcyB0aGF0IGFyZSBiZWluZyBkcmFnZ2VkLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxJdGVtPn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZHJhZ2dpbmdJdGVtcygpIHtcclxuICAgIGNvbnN0IGRyYWdnaW5nSXRlbXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zWyBpIF07XHJcbiAgICAgIGlmICggaXRlbS5kcmFnZ2luZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIGRyYWdnaW5nSXRlbXMucHVzaCggaXRlbSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZHJhZ2dpbmdJdGVtcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwcGVyIGl0ZW1zIHNob3VsZCBmYWxsIGlmIGFuIGl0ZW0gcmVtb3ZlZCBmcm9tIGJlbmVhdGhcclxuICAgKiBVc2VzIHRoZSB2aWV3IHRvIGdldCBpdGVtIGRpbWVuc2lvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBpbmRleCBvZiBpdGVtIGluIHRoZSBzdGFjayBhcnJheVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzcGxpY2VTdGFjayggaW5kZXggKSB7XHJcbiAgICBjb25zdCBpdGVtID0gdGhpcy5zdGFjay5nZXQoIGluZGV4ICk7XHJcbiAgICB0aGlzLnN0YWNrLnJlbW92ZSggaXRlbSApO1xyXG4gICAgaWYgKCB0aGlzLnN0YWNrLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGxldCBzdW1IZWlnaHQgPSAwO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YWNrLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLnZpZXcuZ2V0U2l6ZSggdGhpcy5zdGFjay5nZXQoIGkgKSApO1xyXG4gICAgICAgIHN1bUhlaWdodCArPSBzaXplLmhlaWdodDtcclxuICAgICAgICB0aGlzLnN0YWNrLmdldCggaSApLmFuaW1hdGVUbyggdGhpcy52aWV3LmxheW91dEJvdW5kcy53aWR0aCAvIDIgLSBzaXplLndpZHRoIC8gMiArIHRoaXMuc3RhY2suZ2V0KCBpICkuY2VudGVyaW5nT2Zmc2V0LCAoIHRoaXMuc2thdGVib2FyZCA/IDMzNCA6IDM2MCApIC0gc3VtSGVpZ2h0LCAnc3RhY2snICk7Ly9UT0RPOiBmYWN0b3Igb3V0IHRoaXMgY29kZSBmb3IgbGF5b3V0LCB3aGljaCBpcyBkdXBsaWNhdGVkIGluIE1vdGlvblRhYi50b3BPZlN0YWNrXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL0lmIHRoZSBzdGFjayBpcyBlbXB0aWVkLCBzdG9wIHRoZSBtb3Rpb25cclxuICAgIGlmICggdGhpcy5zdGFjay5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBpdGVtO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIFdoZW4gYSA0dGggaXRlbSBpcyBwbGFjZWQgb24gdGhlIHN0YWNrLCBtb3ZlIHRoZSBib3R0b20gaXRlbSBob21lIGFuZCBoYXZlIHRoZSBzdGFjayBmYWxsXHJcbiAgc3BsaWNlU3RhY2tCb3R0b20oKSB7XHJcbiAgICBjb25zdCBib3R0b20gPSB0aGlzLnNwbGljZVN0YWNrKCAwICk7XHJcbiAgICBib3R0b20ub25Cb2FyZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIGJvdHRvbS5hbmltYXRlSG9tZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgYSB2YWx1ZSBpcyBwb3NpdGl2ZSwgbmVnYXRpdmUsIG9yIHplcm8gZm9yIHRoZSBwaHlzaWNzIGNvbXB1dGF0aW9ucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gdmFsdWVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTaWduKCB2YWx1ZSApIHtcclxuICAgIHJldHVybiB2YWx1ZSA+IDAgPyAxIDogdmFsdWUgPCAwID8gLTEgOiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZnJpY3Rpb24gZm9yY2Ugb24gYW4gb2JqZWN0IGdpdmVuIHRoZSBhcHBsaWVkIGZvcmNlLiAgVGhlIGZyaWN0aW9uIGFuZCBhcHBsaWVkXHJcbiAgICogZm9yY2VzIGFyZSByb3VuZGVkIHNvIHRoYXQgdGhleSBoYXZlIHRoZSBzYW1lIHByZWNpc2lvbi4gSWYgb25lIGZvcmNlIGlzIG1vcmUgcHJlY2lzZSxcclxuICAgKiBhIHN5c3RlbSB3aXRoIHNlZW1pbmdseSBlcXVhbCBmb3JjZXMgY2FuIGxvc2UgZW5lcmd5LlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm9yY2VzLWFuZC1tb3Rpb24tYmFzaWNzL2lzc3Vlcy8xOTdcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gYXBwbGllZEZvcmNlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RnJpY3Rpb25Gb3JjZSggYXBwbGllZEZvcmNlICkge1xyXG5cclxuICAgIGxldCBmcmljdGlvbkZvcmNlO1xyXG5cclxuICAgIC8vIFdoeSBkb2VzIGc9MTAuMD8gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm9yY2VzLWFuZC1tb3Rpb24tYmFzaWNzL2lzc3Vlcy8xMzJcclxuICAgIC8vIFdlIGRlY2lkZSB0byBrZWVwIGl0IGFzIGl0IGlzLCBldmVuIHRob3VnaCA5LjggbWF5IGJlIG1vcmUgcmVhbGlzdGljLlxyXG4gICAgY29uc3QgZyA9IDEwLjA7XHJcblxyXG4gICAgY29uc3QgbWFzcyA9IHRoaXMuZ2V0U3RhY2tNYXNzKCk7XHJcblxyXG4gICAgY29uc3QgZnJpY3Rpb25Gb3JjZU1hZ25pdHVkZSA9IE1hdGguYWJzKCB0aGlzLmZyaWN0aW9uUHJvcGVydHkuZ2V0KCkgKiBtYXNzICogZyApO1xyXG5cclxuICAgIC8vRnJpY3Rpb24gZm9yY2Ugb25seSBhcHBsaWVzIGFib3ZlIHRoaXMgdmVsb2NpdHlcclxuICAgIGNvbnN0IHZlbG9jaXR5VGhyZXNob2xkID0gMUUtMTI7XHJcblxyXG4gICAgLy9PYmplY3QgaXMgbW90aW9ubGVzcywgZnJpY3Rpb24gc2hvdWxkIG9wcG9zZSB0aGUgYXBwbGllZCBmb3JjZVxyXG4gICAgaWYgKCBNYXRoLmFicyggdGhpcy52ZWxvY2l0eVByb3BlcnR5LmdldCgpICkgPD0gdmVsb2NpdHlUaHJlc2hvbGQgKSB7XHJcblxyXG4gICAgICAvL3RoZSBmcmljdGlvbiBpcyBoaWdoZXIgdGhhbiB0aGUgYXBwbGllZCBmb3JjZSwgc28gZG9uJ3QgYWxsb3cgdGhlIGZyaWN0aW9uIGZvcmNlIHRvIGJlIGhpZ2hlciB0aGFuIHRoZSBhcHBsaWVkIGZvcmNlXHJcbiAgICAgIGZyaWN0aW9uRm9yY2UgPSBmcmljdGlvbkZvcmNlTWFnbml0dWRlID49IE1hdGguYWJzKCBhcHBsaWVkRm9yY2UgKSA/IC1hcHBsaWVkRm9yY2UgOlxyXG5cclxuICAgICAgICAvL09wcG9zZSB0aGUgYXBwbGllZCBmb3JjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgLXRoaXMuZ2V0U2lnbiggdGhpcy5hcHBsaWVkRm9yY2VQcm9wZXJ0eS5nZXQoKSApICogZnJpY3Rpb25Gb3JjZU1hZ25pdHVkZTtcclxuICAgIH1cclxuXHJcbiAgICAvL09iamVjdCBpcyBtb3ZpbmcsIHNvIGZyaWN0aW9uIHNob3VsZCBvcHBvc2UgdGhlIHZlbG9jaXR5XHJcbiAgICBlbHNlIHtcclxuICAgICAgZnJpY3Rpb25Gb3JjZSA9IC10aGlzLmdldFNpZ24oIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5nZXQoKSApICogZnJpY3Rpb25Gb3JjZU1hZ25pdHVkZSAqIDAuNzU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcm91bmQgdGhlIGZyaWN0aW9uIGZvcmNlIHNvIHRoYXQgb25lIGZvcmNlIGlzIG5vdCBtb3JlIHByZWNpc2UgdGhhbiBhbm90aGVyXHJcbiAgICByZXR1cm4gVXRpbHMucm91bmRTeW1tZXRyaWMoIGZyaWN0aW9uRm9yY2UgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgLSBDb21wdXRlIHRoZSBtYXNzIG9mIHRoZSBlbnRpcmUgc3RhY2ssIGZvciBwdXJwb3NlcyBvZiBtb21lbnR1bSBjb21wdXRhdGlvblxyXG4gIGdldFN0YWNrTWFzcygpIHtcclxuICAgIGxldCBtYXNzID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc3RhY2subGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIG1hc3MgKz0gdGhpcy5zdGFjay5nZXQoIGkgKS5tYXNzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1hc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciBhIHZhbHVlIGlzIHBvc2l0aXZlLCBuZWdhdGl2ZSBvciB6ZXJvIHRvIGRldGVybWluZSB3aGV0ZXIgdGhlIG9iamVjdCBjaGFuZ2VkIGRpcmVjdGlvbnMuXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNpZ24oIHZhbHVlICkge1xyXG4gICAgcmV0dXJuIHZhbHVlIDwgMCA/ICduZWdhdGl2ZScgOlxyXG4gICAgICAgICAgIHZhbHVlID4gMCA/ICdwb3NpdGl2ZScgOlxyXG4gICAgICAgICAgICd6ZXJvJztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB3aGV0aGVyIGEgdmVsb2NpdHkgdmFsdWUgY2hhbmdlZCBkaXJlY3Rpb24uXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBhIC0gaW5pdGlhbCB2YWx1ZVxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gYiAtIHNlY29uZCB2YWx1ZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjaGFuZ2VkRGlyZWN0aW9uKCBhLCBiICkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2lnbiggYSApID09PSAnbmVnYXRpdmUnICYmIHRoaXMuc2lnbiggYiApID09PSAncG9zaXRpdmUnIHx8XHJcbiAgICAgICAgICAgdGhpcy5zaWduKCBiICkgPT09ICduZWdhdGl2ZScgJiYgdGhpcy5zaWduKCBhICkgPT09ICdwb3NpdGl2ZSc7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gZ2V0IHRoZSBwdXNoZXIgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIGNlbnRlciBhbmQgbGF5b3V0IGJvdW5kcyBvZiB0aGUgdmlld1xyXG4gIGdldFJlbGF0aXZlUHVzaGVyUG9zaXRpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy52aWV3LmxheW91dEJvdW5kcy53aWR0aCAvIDIgKyAoIHRoaXMucHVzaGVyUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSAtIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICogTW90aW9uQ29uc3RhbnRzLlBPU0lUSU9OX1NDQUxFO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCBmdW5jdGlvbiBmb3IgdGhpcyBtb2RlbCwgZnVuY3Rpb24gb2YgdGhlIHRpbWUgc3RlcC4gIENhbGxlZCBieSBzdGVwIGFuZCBtYW51YWxTdGVwIGZ1bmN0aW9ucyBiZWxvdy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwTW9kZWwoIGR0ICkge1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgdHJhY2tlZCB0aW1lIHdoaWNoIGlzIHVzZWQgYnkgdGhlIFdhdGVyQnVja2V0Tm9kZSBhbmQgdGhlIEFjY2VsZXJvbWV0ZXJcclxuICAgIHRoaXMudGltZVByb3BlcnR5LnNldCggdGhpcy50aW1lUHJvcGVydHkuZ2V0KCkgKyBkdCApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgYWNjZWxlcmF0aW9uIHZhbHVlc1xyXG4gICAgY29uc3QgbWFzcyA9IHRoaXMuZ2V0U3RhY2tNYXNzKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnNldCggbWFzcyAhPT0gMCA/IHRoaXMuc3VtT2ZGb3JjZXNQcm9wZXJ0eS5nZXQoKSAvIG1hc3MgOiAwLjAgKTtcclxuXHJcbiAgICBsZXQgbmV3VmVsb2NpdHkgPSB0aGlzLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgKyB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LmdldCgpICogZHQ7XHJcblxyXG4gICAgLy9mcmljdGlvbiBmb3JjZSBzaG91bGQgbm90IGJlIGFibGUgdG8gbWFrZSB0aGUgb2JqZWN0IG1vdmUgYmFja3dhcmRzXHJcbiAgICAvL0Fsc28gbWFrZSBzdXJlIHZlbG9jaXR5IGdvZXMgZXhhY3RseSB0byB6ZXJvIHdoZW4gdGhlIHB1c2hlciBpcyBwdXNoaW5nIHNvIHRoYXQgdGhlIGZyaWN0aW9uIGZvcmNlIHdpbGwgYmUgY29ycmVjdGx5IGNvbXB1dGVkXHJcbiAgICAvL1dpdGhvdXQgdGhpcyBsb2dpYywgaXQgd2FzIGNhdXNpbmcgZmxpY2tlcmluZyBhcnJvd3MgYmVjYXVzZSB0aGUgdmVsb2NpdHkgd2FzIGZsaXBwaW5nIHNpZ24gYW5kIHRoZSBmcmljdGlvbiBmb3JjZSB3YXMgZmxpcHBpbmcgZGlyZWN0aW9uXHJcbiAgICBpZiAoIHRoaXMuY2hhbmdlZERpcmVjdGlvbiggbmV3VmVsb2NpdHksIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICBuZXdWZWxvY2l0eSA9IDAuMDtcclxuICAgIH1cclxuXHJcbiAgICAvL0NhcCBhdCBzdHJvYmUgc3BlZWQuICBUaGlzIGlzIG5lY2Vzc2FyeSBzbyB0aGF0IGEgcmV2ZXJzZSBhcHBsaWVkIGZvcmNlIHdpbGwgdGFrZSBlZmZlY3QgaW1tZWRpYXRlbHksIHdpdGhvdXQgdGhlc2UgbGluZXMgb2YgY29kZSB0aGUgcHVzaGVyIHdpbGwgc3R1dHRlci5cclxuICAgIGlmICggbmV3VmVsb2NpdHkgPiBNb3Rpb25Db25zdGFudHMuTUFYX1NQRUVEICkgeyBuZXdWZWxvY2l0eSA9IE1vdGlvbkNvbnN0YW50cy5NQVhfU1BFRUQ7IH1cclxuICAgIGlmICggbmV3VmVsb2NpdHkgPCAtTW90aW9uQ29uc3RhbnRzLk1BWF9TUEVFRCApIHsgbmV3VmVsb2NpdHkgPSAtTW90aW9uQ29uc3RhbnRzLk1BWF9TUEVFRDsgfVxyXG5cclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ld1ZlbG9jaXR5ICk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuc2V0KCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKyB0aGlzLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgKiBkdCApO1xyXG5cclxuICAgIHRoaXMuc3BlZWRQcm9wZXJ0eS5zZXQoIE1hdGguYWJzKCB0aGlzLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgKSApO1xyXG4gICAgdGhpcy5zcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHkuc2V0KCB0aGlzLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgPj0gTW90aW9uQ29uc3RhbnRzLk1BWF9TUEVFRCA/ICdSSUdIVF9TUEVFRF9FWENFRURFRCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCkgPD0gLU1vdGlvbkNvbnN0YW50cy5NQVhfU1BFRUQgPyAnTEVGVF9TUEVFRF9FWENFRURFRCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0lUSElOX0FMTE9XRURfUkFOR0UnICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnNwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eS5nZXQoKSAhPT0gJ1dJVEhJTl9BTExPV0VEX1JBTkdFJyApIHtcclxuICAgICAgdGhpcy50aW1lU2luY2VGYWxsZW5Qcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgdGhpcy5mYWxsZW5EaXJlY3Rpb25Qcm9wZXJ0eS5zZXQoIHRoaXMuc3BlZWRDbGFzc2lmaWNhdGlvblByb3BlcnR5LmdldCgpID09PSAnUklHSFRfU1BFRURfRVhDRUVERUQnID8gJ3JpZ2h0JyA6ICdsZWZ0JyApO1xyXG4gICAgICB0aGlzLmZhbGxlblByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgcHVzaGVyIGlzIHZlcnkgZmFyIG9mZiBzY3JlZW4sIHN0YW5kIHVwIGltbWVkaWF0ZWx5XHJcbiAgICAgIC8vIGJhc2VkIG9uIHdpZHRoIG9mIHRoZSBiYWNrZ3JvdW5kIGltYWdlLCBkZXRlcm1pbmVkIGJ5IHZpc3VhbCBpbnNwZWN0aW9uXHJcbiAgICAgIGNvbnN0IHJlbGF0aXZlUG9zaXRpb24gPSB0aGlzLmdldFJlbGF0aXZlUHVzaGVyUG9zaXRpb24oKTtcclxuICAgICAgaWYgKCByZWxhdGl2ZVBvc2l0aW9uID4gMTYwMCB8fCByZWxhdGl2ZVBvc2l0aW9uIDwgLTYwMCApIHtcclxuICAgICAgICB0aGlzLmZhbGxlblByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnRpbWVTaW5jZUZhbGxlblByb3BlcnR5LnNldCggdGhpcy50aW1lU2luY2VGYWxsZW5Qcm9wZXJ0eS5nZXQoKSArIGR0ICk7XHJcblxyXG4gICAgICAvL1N0YW5kIHVwIGFmdGVyIDIgc2Vjb25kc1xyXG4gICAgICBpZiAoIHRoaXMudGltZVNpbmNlRmFsbGVuUHJvcGVydHkuZ2V0KCkgPiAyICkge1xyXG4gICAgICAgIHRoaXMuZmFsbGVuUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9TdGFuZCB1cCBpZiBhcHBseWluZyBhIGZvcmNlIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24gdGhhdCB5b3UgZmVsbFxyXG4gICAgaWYgKCB0aGlzLmZhbGxlblByb3BlcnR5LmdldCgpICYmIHRoaXMuZmFsbGVuRGlyZWN0aW9uUHJvcGVydHkuZ2V0KCkgPT09ICdsZWZ0JyAmJiB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpID4gMCApIHtcclxuICAgICAgdGhpcy5mYWxsZW5Qcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuZmFsbGVuUHJvcGVydHkuZ2V0KCkgJiYgdGhpcy5mYWxsZW5EaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKSA9PT0gJ3JpZ2h0JyAmJiB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpIDwgMCApIHtcclxuICAgICAgdGhpcy5mYWxsZW5Qcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnByZXZpb3VzU3BlZWRDbGFzc2lmaWNhdGlvblByb3BlcnR5LmdldCgpICE9PSAnV0lUSElOX0FMTE9XRURfUkFOR0UnICkge1xyXG4gICAgICB0aGlzLnNwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMucHJldmlvdXNTcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvL0Rvbid0IHNob3cgdGhlIHB1c2hlciBhcyBmYWxsZW4gd2hpbGUgYXBwbHlpbmcgYSBmb3JjZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3JjZXMtYW5kLW1vdGlvbi1iYXNpY3MvaXNzdWVzLzY2XHJcbiAgICBpZiAoIHRoaXMuYXBwbGllZEZvcmNlUHJvcGVydHkuZ2V0KCkgIT09IDAgJiYgdGhpcy5zcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHkuZ2V0KCkgPT09ICdXSVRISU5fQUxMT1dFRF9SQU5HRScgKSB7XHJcbiAgICAgIHRoaXMuZmFsbGVuUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgcGh5c2ljcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICAvLyBDb21wdXRlcyB0aGUgbmV3IGZvcmNlcyBhbmQgc2V0cyB0aGVtIHRvIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnRpZXNcclxuICAgIC8vIFRoZSBmaXJzdCBwYXJ0IG9mIHN0ZXBJblRpbWUgaXMgdG8gY29tcHV0ZSBhbmQgc2V0IHRoZSBmb3JjZXMuICBUaGlzIGlzIGZhY3RvcmVkIG91dCBiZWNhdXNlIHRoZSBmb3JjZXMgbXVzdFxyXG4gICAgLy8gYWxzbyBiZSB1cGRhdGVkIHdoZW4gdGhlIHVzZXIgY2hhbmdlcyB0aGUgZnJpY3Rpb24gZm9yY2Ugb3IgbWFzcyB3aGlsZSB0aGUgc2ltIGlzIHBhdXNlZC5cclxuICAgIHRoaXMuZnJpY3Rpb25Gb3JjZVByb3BlcnR5LnNldCggdGhpcy5nZXRGcmljdGlvbkZvcmNlKCB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpICkgKTtcclxuICAgIHRoaXMuc3VtT2ZGb3JjZXNQcm9wZXJ0eS5zZXQoIHRoaXMuZnJpY3Rpb25Gb3JjZVByb3BlcnR5LmdldCgpICsgdGhpcy5hcHBsaWVkRm9yY2VQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5wbGF5UHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMuc3RlcE1vZGVsKCBkdCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgcHVzaGVyIHBvc2l0aW9uIGV2ZXJ5IHRpbWUgc3RlcCwgZXZlbiBpZiB0aGUgc2ltIGlzIHBhdXNlZFxyXG4gICAgaWYgKCB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpICE9PSAwICkge1xyXG4gICAgICB0aGlzLnB1c2hlclBvc2l0aW9uUHJvcGVydHkuc2V0KCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKyAyICogKCB0aGlzLmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpID4gMCA/IC0xIDogMSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3RlcCBhbGwgbW9kZWwgaXRlbXMgc28gdGhhdCB0aGV5IGFyZSBpbnRlcmFjdGl2ZSB3aGlsZSBwYXVzZWRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuaXRlbXNbIGkgXS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vdGlmeSB0aGF0IHRoZSBzaW0gaGFzIHN0ZXBwZWQgdG8gY2FsY3VsYXRlIGZvcmNlcy4gIFRoaXMgbmVlZHMgdG8gdXBkYXRlIGV2ZW4gd2hlbiB0aGUgc2ltIGlzIHBhdXNlZC5cclxuICAgIHRoaXMuc3RlcEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFudWFsbHkgc3RlcCB0aGUgbW9kZWwgYnkgYSBzbWFsbCB0aW1lIHN0ZXAuICBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgYnkgdGhlICdzdGVwJyBidXR0b24gdW5kZXJcclxuICAgKiB0aGUgY29udHJvbCBwYW5lbC4gIEFzc3VtZXMgNjAgZnJhbWVzIHBlciBzZWNvbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hbnVhbFN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXBNb2RlbCggMSAvIDYwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciBhbiBpdGVtIGlzIGluIHRoZSBzdGFjay5cclxuICAgKiBAcGFyYW0gIHtJdGVtfSBpdGVtXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzSW5TdGFjayggaXRlbSApIHsgcmV0dXJuIHRoaXMuc3RhY2suaW5jbHVkZXMoIGl0ZW0gKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgd2hldGhlciBhbiBpdGVtIGlzIHN0YWNrZWQgYWJvdmUgYW5vdGhlciBpdGVtLCBzbyB0aGF0IHRoZSBhcm1zIGNhbiBiZSByYWlzZWQgZm9yIGh1bWFucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge0l0ZW19XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzSXRlbVN0YWNrZWRBYm92ZSggaXRlbSApIHsgcmV0dXJuIHRoaXMuaXNJblN0YWNrKCBpdGVtICkgJiYgdGhpcy5zdGFjay5pbmRleE9mKCBpdGVtICkgPCB0aGlzLnN0YWNrLmxlbmd0aCAtIDE7fVxyXG5cclxuICAvLyBAcHVibGljIC0gUmVzZXQgdGhlIG1vZGVsXHJcbiAgcmVzZXQoKSB7XHJcblxyXG4gICAgLy8gcmVzZXQgYWxsIFByb3BlcnRpZXMgb2YgdGhpcyBtb2RlbC5cclxuICAgIHRoaXMuYXBwbGllZEZvcmNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZnJpY3Rpb25Gb3JjZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZyaWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3VtT2ZGb3JjZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wdXNoZXJQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dGb3JjZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dWYWx1ZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93U3VtT2ZGb3JjZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93U3BlZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93TWFzc2VzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd0FjY2VsZXJhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wcmV2aW91c1NwZWVkQ2xhc3NpZmljYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tb3ZpbmdSaWdodFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmRpcmVjdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVTaW5jZUZhbGxlblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZhbGxlblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZhbGxlbkRpcmVjdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdGFja1NpemVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wbGF5UHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAvLyBpZiB0aGUgaXRlbSBpcyBiZWluZyBkcmFnZ2VkIHdlIG5lZWQgdG8gY2FuY2VsIHRoZSBkcmFnIGluIEl0ZW1Ob2RlXHJcbiAgICAgIGlmICggIXRoaXMuaXRlbXNbIGkgXS5kcmFnZ2luZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIHRoaXMuaXRlbXNbIGkgXS5yZXNldCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWxzbyByZXNldCB0aGUgcHJldmlvdXMgbW9kZWwgcG9zaXRpb24sIHVzZWQgYnkgdGhlIHB1c2hlciB0byB0cmFjayB0cmFuc2xhdGlvbnNcclxuICAgIHRoaXMucHJldmlvdXNNb2RlbFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZTtcclxuXHJcbiAgICAvLyBub3RpZnkgdGhhdCBhIHJlc2V0IHdhcyB0cmlnZ2VyZWRcclxuICAgIHRoaXMucmVzZXRBbGxFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICB0aGlzLnN0YWNrLmNsZWFyKCk7XHJcblxyXG4gICAgLy9Nb3ZlIHRoZSBpbml0aWFsIGNyYXRlIHRvIHRoZSBwbGF5IGFyZWEsIHNpbmNlIGl0IHJlc2V0cyB0byB0aGUgdG9vbGJveCwgbm90IGl0cyBpbml0aWFsIHBvc2l0aW9uLlxyXG4gICAgdGhpcy52aWV3SW5pdGlhbGl6ZWQoIHRoaXMudmlldyApO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFmdGVyIHRoZSB2aWV3IGlzIGNvbnN0cnVjdGVkLCBtb3ZlIG9uZSBvZiB0aGUgYmxvY2tzIHRvIHRoZSB0b3Agb2YgdGhlIHN0YWNrLlxyXG4gICAqIEl0IHdvdWxkIGJlIGJldHRlciBpZiBtb3JlIG9mIHRoaXMgY291bGQgYmUgZG9uZSBpbiB0aGUgbW9kZWwgY29uc3RydWN0b3IsIGJ1dCBpdCB3b3VsZCBiZSBkaWZmaWN1bHQgd2l0aCB0aGUgd2F5IHRoaW5ncyBhcmUgY3VycmVudGx5IHNldCB1cC5cclxuICAgKiBAcGFyYW0ge1NjcmVlblZpZXd9IHZpZXdcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdmlld0luaXRpYWxpemVkKCB2aWV3ICkge1xyXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbXNbIDEgXTtcclxuICAgIC8vIG9ubHkgbW92ZSBpdGVtIHRvIHRoZSB0b3Agb2YgdGhlIHN0YWNrIGlmIGl0IGlzIG5vdCBiZWluZyBkcmFnZ2VkXHJcbiAgICBpZiAoICFpdGVtLmRyYWdnaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMudmlldyA9IHZpZXc7XHJcbiAgICAgIGl0ZW0ub25Cb2FyZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICBjb25zdCBpdGVtTm9kZSA9IHZpZXcuaXRlbU5vZGVzWyAxIF07XHJcbiAgICAgIGl0ZW0uYW5pbWF0aW9uU3RhdGVQcm9wZXJ0eS5zZXQoIHsgZW5hYmxlZDogZmFsc2UsIHg6IDAsIHk6IDAsIGVuZDogbnVsbCB9ICk7XHJcbiAgICAgIGl0ZW0uaW50ZXJhY3Rpb25TY2FsZVByb3BlcnR5LnNldCggMS4zICk7XHJcbiAgICAgIGNvbnN0IHNjYWxlZFdpZHRoID0gdGhpcy52aWV3LmdldFNpemUoIGl0ZW0gKS53aWR0aDtcclxuICAgICAgaXRlbS5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIHZpZXcubGF5b3V0Qm91bmRzLndpZHRoIC8gMiAtIHNjYWxlZFdpZHRoIC8gMiwgdmlldy50b3BPZlN0YWNrIC0gaXRlbU5vZGUuaGVpZ2h0ICkgKTtcclxuICAgICAgdGhpcy5zdGFjay5hZGQoIGl0ZW0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb24sIGZvciBwZXJzaXN0ZW5jZS5cclxuICAgKiBAcmV0dXJucyB7e3Byb3BlcnRpZXM6ICosIHN0YWNrOiBBcnJheX19XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFN0YXRlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcHJvcGVydGllczogdGhpcy5nZXRWYWx1ZXMoKSxcclxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2suZ2V0QXJyYXkoKS5tYXAoIGl0ZW0gPT4gaXRlbS5nZXQoKS5uYW1lICkuam9pbiggJywnIClcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5mb3JjZXNBbmRNb3Rpb25CYXNpY3MucmVnaXN0ZXIoICdNb3Rpb25Nb2RlbCcsIE1vdGlvbk1vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb3Rpb25Nb2RlbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNB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