// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for the Energy Skate Park sim, including model values for the view settings, such as whether the grid
 * is visible. All units are in mks.
 *
 * The step functions focus on making computations up front and applying changes to the skater at the end of each
 * method, to simplify the logic and make it communicate with the Axon+View as little as possible (for performance
 * reasons).
 *
 * For an analytical model, see http://digitalcommons.calpoly.edu/cgi/viewcontent.cgi?article=1387&context=phy_fac
 * Computational problems in introductory physics: Lessons from a bead on a wire
 * Thomas J. Bensky and Matthew J. Moelter
 *
 * We experimented with the analytical model, but ran into problems with discontinuous tracks, see #15, so reverted to
 * using the euclidean model from the original Java version.
 *
 * Please note: Many modifications were made to this file to reduce allocations and garbage collections on iPad,
 * see #50.  The main changes included pass by reference, and component-wise math. Pooling was also used but was
 * later determined to not be effective, see phetsims/energy-skate-park-basics#252. Unfortunately, these are often
 * compromises in the readability/maintainability of the code, but they seemed important to attain good performance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import merge from '../../../../phet-core/js/merge.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import EnergySkateParkQueryParameters from '../EnergySkateParkQueryParameters.js';
import ControlPoint from './ControlPoint.js';
import DebugTracks from './DebugTracks.js';
import Skater from './Skater.js';
import SkaterState from './SkaterState.js';
import Track from './Track.js';
import UserControlledPropertySet from './UserControlledPropertySet.js';

// Use a separate pooled curvature variable to reduce memory allocations - object values
// will be modified as the skater moves
const curvatureTemp = {
  r: 1,
  x: 0,
  y: 0
};
const curvatureTemp2 = {
  r: 1,
  x: 0,
  y: 0
};

// Thrust is not currently implemented in Energy Skate Park but may be used in a future version, so left here
const thrust = new Vector2(0, 0);

// for the EventTimer and consistent sim behavior, we assume simulation runs at 60 frames per second
const FRAME_RATE = 60;

// Flag to enable debugging for physics issues
const debug = EnergySkateParkQueryParameters.debugLog ? function (...args) {
  console.log(...args);
} : null;
const debugAttachDetach = EnergySkateParkQueryParameters.debugAttachDetach ? function (...args) {
  console.log(...args);
} : null;

// Track the model iterations to implement "slow motion" by stepping every Nth frame, see #210
let modelIterations = 0;

/**
 * @param {Tandem} tandem
 * @param {Object} [options]
 */
class EnergySkateParkModel extends PhetioObject {
  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(preferencesModel, tandem, options) {
    super({
      phetioType: EnergySkateParkModel.EnergySkateParkModelIO,
      tandem: tandem,
      phetioState: false
    });
    options = merge({
      // {number} - initial/default value of friction for the model
      defaultFriction: EnergySkateParkConstants.DEFAULT_FRICTION,
      // {boolean} - if true, tracks can be dragged around the play area
      tracksDraggable: false,
      // {boolean} - if true, track control points can be dragged and track shapes can change
      tracksConfigurable: false,
      // @boolean - default for the speedValueVisibleProperty, whether or not the value of speed is displayed
      // on the speedometer
      defaultSpeedValueVisible: true,
      // passed to Skater
      skaterOptions: null
    }, options);

    // @public - emits an event whenever a track changes in some way (control points dragged, track split apart,
    // track dragged, track deleted or scene changed, etc...)
    this.trackChangedEmitter = new Emitter();

    // @public (read-only)
    this.tracksDraggable = options.tracksDraggable;
    this.tracksConfigurable = options.tracksConfigurable;
    this.defaultFriction = options.defaultFriction;

    // @public - Will be filled in by the view, used to prevent control points from moving outside the visible model
    // bounds when adjusted, see #195
    this.availableModelBoundsProperty = new Property(new Bounds2(0, 0, 0, 0), {
      tandem: tandem.createTandem('availableModelBoundsProperty'),
      phetioValueType: Bounds2.Bounds2IO
    });

    // @public {PhetioGroup.<ControlPoint>} group of control points
    this.controlPointGroup = new PhetioGroup((tandem, x, y, options) => {
      assert && options && assert(!options.hasOwnProperty('tandem'), 'tandem is managed by the PhetioGroup');
      return new ControlPoint(x, y, merge({}, options, {
        tandem: tandem,
        phetioDynamicElement: true
      }));
    }, [0, 0, {}], {
      tandem: tandem.createTandem('controlPointGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(ControlPoint.ControlPointIO),
      phetioDynamicElementName: 'controlPoint'
    });

    // TODO: https://github.com/phetsims/energy-skate-park/issues/123 the control point group doesn't have enough archetypes to
    // TODO: create an archetype track, https://github.com/phetsims/energy-skate-park/issues/123
    // @public {PhetioGroup.<Track>} group of tracks
    this.trackGroup = new PhetioGroup((tandem, controlPoints, parents, options) => {
      assert && options && assert(!options.hasOwnProperty('tandem'), 'tandem is managed by the PhetioGroup');
      return new Track(this, controlPoints, parents, merge({}, options, {
        tandem: tandem,
        phetioDynamicElement: true
      }));
    }, [_.range(20).map(n => this.controlPointGroup.createNextElement(n * 100, 0)), [], {
      draggable: true,
      configurable: true
    }], {
      tandem: tandem.createTandem('trackGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(Track.TrackIO),
      phetioDynamicElementName: 'track'
    });

    // {boolean} - Temporary flag that keeps track of whether the track was changed in the step before the physics
    // update. True if the skater's track is being dragged by the user, so that energy conservation no longer applies.
    // Only applies to one frame at a time (for the immediate next update).  See #127 and #135
    // @private
    this.trackChangePending = false;

    // @public - model for visibility of various view parameters
    this.pieChartVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('pieChartVisibleProperty')
    });
    this.barGraphVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('barGraphVisibleProperty')
    });
    this.gridVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('gridVisibleProperty')
    });
    this.speedometerVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('speedometerVisibleProperty')
    });

    // @public (read-only) {EnergySkateParkPreferencesModel} - A model component controlling simulation specific
    // preferences for the sim.
    this.preferencesModel = preferencesModel;

    // whether the speed value is visible on the speedometer
    this.speedValueVisibleProperty = new BooleanProperty(options.defaultSpeedValueVisible, {
      tandem: tandem.createTandem('speedValueVisibleProperty')
    });
    this.referenceHeightVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('referenceHeightVisibleProperty')
    });
    this.measuringTapeVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('measuringTapeVisibleProperty')
    });

    // @public {number} - scale applied to graphs to determine relative height, making this larger will "zoom out"
    this.barGraphScaleProperty = new NumberProperty(1 / 30, {
      tandem: tandem.createTandem('barGraphScaleProperty')
    });

    // @public - enabled/disabled for the track editing buttons
    this.editButtonEnabledProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('editButtonEnabledProperty')
    });
    this.clearButtonEnabledProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('clearButtonEnabledProperty')
    });

    // Whether the sim is paused or running
    this.pausedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('pausedProperty')
    });

    // @public {StopWatch} - model element for the stop watch in this sim
    this.stopwatch = new Stopwatch({
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      },
      tandem: tandem.createTandem('stopwatch')
    });
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW],
      tandem: tandem.createTandem('timeSpeedProperty')
    });

    // @public {number} - Coefficient of friction (unitless) between skater and track
    this.frictionProperty = new NumberProperty(this.defaultFriction, {
      range: new Range(EnergySkateParkConstants.MIN_FRICTION, EnergySkateParkConstants.MAX_FRICTION),
      tandem: tandem.createTandem('frictionProperty')
    });

    // @public {Vector2Property} - model position for the base  of the measuring tape
    this.measuringTapeBasePositionProperty = new Vector2Property(new Vector2(0, 0), {
      tandem: tandem.createTandem('measuringTapeBasePositionProperty'),
      units: 'm'
    });

    // @public {Vector2Property} - model position for the tip of the measuring tape
    this.measuringTapeTipPositionProperty = new Vector2Property(new Vector2(0, 0), {
      tandem: tandem.createTandem('measuringTapeTipPositionProperty'),
      units: 'm'
    });

    // @public {boolean} - Whether the skater should stick to the track like a roller coaster, or be able to fly off
    // like a street
    this.stickingToTrackProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('stickingToTrackProperty')
    });

    // @public {UserControlledPropertySet} - collection of Properties that indicate that a user is
    // modifying some variable that will change physical system and modify all saved energy data
    this.userControlledPropertySet = new UserControlledPropertySet();
    if (EnergySkateParkQueryParameters.testTrackIndex > 0) {
      this.frictionProperty.debug('friction');
    }

    // @public {Skater} - the skater model instance
    this.skater = new Skater(tandem.createTandem('skater'), options.skaterOptions);

    // @public {DerivedProperty} - Determine if the skater is onscreen or offscreen for purposes of highlighting the
    // 'return skater' button. Don't check whether the skater is underground since that is a rare case (only if the
    // user is actively dragging a control point near y=0 and the track curves below) and the skater will pop up
    // again soon, see the related flickering problem in #206
    this.skaterInBoundsProperty = new DerivedProperty([this.skater.positionProperty], position => {
      const availableModelBounds = this.availableModelBoundsProperty.get();
      if (!availableModelBounds.hasNonzeroArea()) {
        return true;
      }
      return availableModelBounds && containsAbove(availableModelBounds, position.x, position.y);
    });

    // @public - signify that the model has successfully been reset to initial state
    this.resetEmitter = new Emitter();

    // If the mass changes while the sim is paused, trigger an update so the skater image size will update, see #115
    this.skater.massProperty.link(() => {
      if (this.pausedProperty.value) {
        this.skater.updatedEmitter.emit();
      }
    });

    // @public
    this.tracks = createObservableArray({
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(Track.TrackIO)),
      tandem: tandem.createTandem('tracks')
    });

    // Determine when to show/hide the track edit buttons (cut track or delete control point)
    const updateTrackEditingButtonProperties = () => {
      let editEnabled = false;
      let clearEnabled = false;
      const physicalTracks = this.getPhysicalTracks();
      for (let i = 0; i < physicalTracks.length; i++) {
        clearEnabled = true;
        const physicalTrack = physicalTracks[i];
        if (physicalTrack.controlPoints.length >= 3) {
          editEnabled = true;
        }
      }
      this.editButtonEnabledProperty.value = editEnabled;
      this.clearButtonEnabledProperty.value = clearEnabled;
    };
    this.tracks.addItemAddedListener(updateTrackEditingButtonProperties);
    this.tracks.addItemRemovedListener(updateTrackEditingButtonProperties);

    // @public {Emitter} - Required for PhET-iO state wrapper
    this.updateEmitter = new Emitter();
    this.trackChangedEmitter.addListener(updateTrackEditingButtonProperties);

    // @private {EventTimer} - Updates the model with constant event intervals even if there is a drop in the framerate
    // so that simulation performance has no impact on physical behavior.
    this.eventTimer = new EventTimer(new EventTimer.ConstantEventModel(FRAME_RATE), this.constantStep.bind(this));
    if (EnergySkateParkQueryParameters.testTrackIndex > 0) {
      DebugTracks.init(this);
    }
  }

  /**
   * Reset the model, including skater, tracks, tools, and UI visibility, etc.
   * @public
   */
  reset() {
    const availableModelBounds = this.availableModelBoundsProperty.value;
    this.pieChartVisibleProperty.reset();
    this.barGraphVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.speedometerVisibleProperty.reset();
    this.referenceHeightVisibleProperty.reset();
    this.measuringTapeVisibleProperty.reset();
    this.measuringTapeTipPositionProperty.reset();
    this.measuringTapeBasePositionProperty.reset();
    this.editButtonEnabledProperty.reset();
    this.clearButtonEnabledProperty.reset();
    this.barGraphScaleProperty.reset();
    this.pausedProperty.reset();
    this.frictionProperty.reset();
    this.stickingToTrackProperty.reset();
    this.availableModelBoundsProperty.reset();
    this.stopwatch.reset();
    this.availableModelBoundsProperty.value = availableModelBounds;
    this.skater.reset();
    this.timeSpeedProperty.reset();
    this.resetEmitter.emit();
  }

  /**
   * Step one frame, assuming 60 fps.
   * @public
   */
  manualStep() {
    const skaterState = new SkaterState(this.skater);
    const dt = 1.0 / FRAME_RATE;
    const result = this.stepModel(dt, skaterState);
    result.setToSkater(this.skater);
    this.skater.updatedEmitter.emit();
  }

  /**
   * Respond to an update from the EventTimer, assuming 60 frames per second. The time step is standardized so that
   * play speed has no impact on simulation behavior.
   *
   * @private
   */
  constantStep() {
    // This simulation uses a fixed time step to make the skater's motion reproducible.
    const dt = 1.0 / FRAME_RATE;
    let initialEnergy = null;

    // If the delay makes dt too high, then truncate it.  This helps e.g. when clicking in the address bar on iPad,
    // which gives a huge dt and problems for integration
    if (!this.pausedProperty.value && !this.skater.draggingProperty.value) {
      const initialThermalEnergy = this.skater.thermalEnergyProperty.value;
      const skaterState = new SkaterState(this.skater);
      if (debug) {
        initialEnergy = skaterState.getTotalEnergy();
      }

      // Update the skater state by running the dynamics engine
      // There are issues in running multiple iterations here (the skater won't attach to the track).  I presume some
      // of that work is being done in setToSkater() below or skater.trigger('updated')
      // In either case, 10 subdivisions on iPad3 makes the sim run too slowly, so we may just want to leave it as is
      let updatedState = null;
      modelIterations++;
      if (this.timeSpeedProperty.get() === TimeSpeed.NORMAL || modelIterations % 3 === 0) {
        updatedState = this.stepModel(dt, skaterState);
      }
      if (updatedState) {
        updatedState.setToSkater(this.skater);
        this.skater.updatedEmitter.emit();
        if (debug) {
          if (Math.abs(updatedState.getTotalEnergy() - initialEnergy) > 1E-6) {
            const initialStateCopy = new SkaterState(this.skater);
            const redo = this.stepModel(this.timeSpeedProperty.get() === TimeSpeed.NORMAL ? dt : dt * 0.25, initialStateCopy);
            debug && debug(redo);
          }

          // Make sure the thermal energy doesn't go negative
          const finalThermalEnergy = this.skater.thermalEnergyProperty.value;
          const deltaThermalEnergy = finalThermalEnergy - initialThermalEnergy;
          if (deltaThermalEnergy < 0) {
            debug && debug('thermal energy wanted to decrease');
          }
        }
      }
    }

    // Clear the track change pending flag for the next step
    this.trackChangePending = false;

    // If traveling on the ground, face in the direction of motion, see #181
    if (this.skater.trackProperty.value === null && this.skater.positionProperty.value.y === 0) {
      if (this.skater.velocityProperty.value.x > 0) {
        this.skater.directionProperty.value = Skater.Direction.RIGHT;
      }
      if (this.skater.velocityProperty.value.x < 0) {
        this.skater.directionProperty.value = Skater.Direction.LEFT;
      } else {
        // skater wasn't moving, so don't change directions
      }
    }
  }

  /**
   * Step the model (automatically called by joist)
   * @public
   * @override
   *
   * @param {number} dt - in seconds
   */
  step(dt) {
    this.eventTimer.step(dt);
  }

  /**
   * The skater moves along the ground with the same coefficient of fraction as the tracks, see #11. Returns a
   * SkaterState that is applied to this.skater.
   * @private
   *
   * @param {number} dt
   * @param {SkaterState} skaterState
   *
   * @returns {SkaterState}
   */
  stepGround(dt, skaterState) {
    const x0 = skaterState.positionX;
    const frictionMagnitude = this.frictionProperty.value === 0 || skaterState.getSpeed() < 1E-2 ? 0 : this.frictionProperty.value * skaterState.mass * skaterState.gravity;
    const acceleration = Math.abs(frictionMagnitude) * (skaterState.velocityX > 0 ? -1 : 1) / skaterState.mass;
    let v1 = skaterState.velocityX + acceleration * dt;

    // Exponentially decay the velocity if already nearly zero, see #138
    if (this.frictionProperty.value !== 0 && skaterState.getSpeed() < 1E-2) {
      v1 = v1 / 2;
    }
    const x1 = x0 + v1 * dt;
    const newPosition = new Vector2(x1, 0);
    const originalEnergy = skaterState.getTotalEnergy();
    const updated = skaterState.updatePositionAngleUpVelocity(newPosition.x, newPosition.y, 0, true, v1, 0);
    const newEnergy = updated.getTotalEnergy();
    const newKineticEnergy = updated.getKineticEnergy();

    // Correct the energy so that total energy does not change after this update. If the energy has gone down
    // (energyDifference positive), we can add energyDifference to thermal energy without much consequence.
    // But if energy increased, we may end up with negative thermal energy if we remove the excess from
    // thermal energy, so we attempt to take it out of kinetic energy instead.
    // See https://github.com/phetsims/energy-skate-park/issues/45
    const energyDifference = originalEnergy - newEnergy;
    const absEnergyDifference = Math.abs(energyDifference);
    if (energyDifference < 0 && newKineticEnergy > absEnergyDifference) {
      const currentSpeed = Math.abs(v1);

      // since KE = 1/2 * m * v^2
      const speedInExcessEnergy = Math.sqrt(2 * Math.abs(absEnergyDifference) / updated.mass);
      const newSpeed = currentSpeed - speedInExcessEnergy;
      assert && assert(newSpeed >= 0, 'tried to remove too much energy from kineticEnergy, correct another way');

      // restore direction to velocity
      const correctedV = v1 >= 0 ? newSpeed : -newSpeed;
      return skaterState.updatePositionAngleUpVelocity(newPosition.x, newPosition.y, 0, true, correctedV, 0);
    } else {
      const newThermalEnergy = updated.thermalEnergy + energyDifference;
      assert && assert(newThermalEnergy >= 0, 'thermal energy should not be negative, correct energy another way');
      return updated.updateThermalEnergy(newThermalEnergy);
    }
  }

  /**
   * Transition the skater to the ground. New speed for the skater will keep x component of proposed velocity, and
   * energies are then updated accordingly. Returns a new SkaterState to modify this.skater.
   *
   * No bouncing on the ground, but the code is very similar to attachment part of interactWithTracksWileFalling.
   * @private
   *
   * @param {SkaterState} skaterState
   * @param {number} initialEnergy - energy prior to transitioning to ground
   * @param {Vector2} proposedPosition
   * @param {Vector2} proposedVelocity
   * @param {number} dt
   *
   * @returns {SkaterState}
   */
  switchToGround(skaterState, initialEnergy, proposedPosition, proposedVelocity, dt) {
    const segment = new Vector2(1, 0);
    let newSpeed = segment.dot(proposedVelocity);

    // Make sure energy perfectly conserved when falling to the ground.
    const newKineticEnergy = 0.5 * newSpeed * newSpeed * skaterState.mass;
    const newPotentialEnergy = -1 * skaterState.mass * skaterState.gravity * (0 - skaterState.referenceHeight);
    let newThermalEnergy = initialEnergy - newKineticEnergy - newPotentialEnergy;
    if (newThermalEnergy < 0) {
      const correctedState = this.correctThermalEnergy(skaterState, segment, proposedPosition);
      newSpeed = correctedState.getSpeed();
      newThermalEnergy = correctedState.thermalEnergy;
    }

    // Supply information about a very rare problem that occurs when thermal energy goes negative,
    // see https://github.com/phetsims/energy-skate-park/issues/45
    assert && assert(newThermalEnergy >= 0, `${'Thermal energy should be non-negative: ' + 'skaterState: '}${skaterState}, ` + `oldPotentialEnergy:${skaterState.getPotentialEnergy()}, ` + `skaterPositionY:${skaterState.positionY}, ` + `initialEnergy: ${initialEnergy}, ` + `proposedPosition: ${proposedPosition}, ` + `proposedVelocity: ${proposedVelocity}, ` + `dt: ${dt}, ` + `newSpeed: ${newSpeed}, ` + `newKineticEnergy: ${newKineticEnergy}, ` + `newPotentialEnergy: ${newPotentialEnergy}, ` + `newThermalEnergy: ${newThermalEnergy}, ` + `referenceHeight: ${skaterState.referenceHeight}, tracked in https://github.com/phetsims/energy-skate-park/issues/45`);
    if (!isFinite(newThermalEnergy)) {
      throw new Error('not finite');
    }
    return skaterState.switchToGround(newThermalEnergy, newSpeed, 0, proposedPosition.x, proposedPosition.y);
  }

  /**
   * Only use this correction when something has gone wrong with the thermal energy calculation. For example, thermal
   * energy has gone negative. Attempts to correct by using previous thermal energy and compensate modifying
   * kinetic energy. If this results in negative kinetic energy, we have to accept a change to total energy, but
   * we make sure that it is within an acceptable amount.
   * @private
   *
   * @param {SkaterState} skaterState
   * @param {Vector2} segment
   * @returns {SkaterState}
   */
  correctThermalEnergy(skaterState, segment, proposedPosition) {
    const initialEnergy = skaterState.getTotalEnergy();
    const newPotentialEnergy = -1 * skaterState.mass * skaterState.gravity * (proposedPosition.y - skaterState.referenceHeight);
    const newThermalEnergy = skaterState.thermalEnergy;
    let newKineticEnergy = initialEnergy - newPotentialEnergy - newThermalEnergy;

    // if newPotentialEnergy ~= but slightly larger than initialEnergy (since the skater may have been bumped
    // up to the track after crossing) we must accept the increase in total energy, but it should be small
    // enough that the user does not notice it, see https://github.com/phetsims/energy-skate-park/issues/44
    if (newKineticEnergy < 0) {
      newKineticEnergy = 0;
    }

    // ke = 1/2 m v v
    const newSpeed = Math.sqrt(2 * newKineticEnergy / skaterState.mass);
    const newVelocity = segment.times(newSpeed);
    let correctedState = skaterState.updateThermalEnergy(newThermalEnergy);
    correctedState = correctedState.updatePosition(proposedPosition.x, proposedPosition.y);
    correctedState = correctedState.updateUDVelocity(correctedState.parametricSpeed, newVelocity.x, newVelocity.y);
    assert && assert(Utils.equalsEpsilon(correctedState.getTotalEnergy(), skaterState.getTotalEnergy(), 1E-8), 'substantial total energy change after corrections');
    return correctedState;
  }

  /**
   * Update the skater in free fall.
   * @private
   *
   * @param {number} dt the time that passed, in seconds
   * @param {SkaterState} skaterState the original state of the skater
   * @param {boolean} justLeft true if the skater just fell off or launched off the track: in this case it should not
   * interact with the track.
   * @returns {SkaterState} the new state
   */
  stepFreeFall(dt, skaterState, justLeft) {
    const initialEnergy = skaterState.getTotalEnergy();
    const acceleration = new Vector2(0, skaterState.gravity);
    const proposedVelocity = skaterState.getVelocity().plus(acceleration.times(dt));
    const position = skaterState.getPosition();
    const proposedPosition = position.plus(proposedVelocity.times(dt));

    // only do the work to check for interactions if there is some proposed change to position
    if (position.x !== proposedPosition.x || position.y !== proposedPosition.y) {
      // see if it crossed the track
      const physicalTracks = this.getPhysicalTracks();

      // Don't interact with the track if the skater just left the track in this same frame, see #142
      if (physicalTracks.length && !justLeft) {
        // at high freefall velocity the skater may cross a track AND the proposedPosition may be below ground in the
        // same step - in this case prefer switching to track (because tracks are above ground) by only switching to
        // ground if interactWithTracksWhileFalling produces a `null` track, see #159
        const newSkaterState = this.interactWithTracksWhileFalling(physicalTracks, skaterState, proposedPosition, initialEnergy, dt, proposedVelocity);
        if (proposedPosition.y < 0 && newSkaterState.track === null) {
          proposedPosition.y = 0;
          return this.switchToGround(skaterState, initialEnergy, proposedPosition, proposedVelocity, dt);
        } else {
          return newSkaterState;
        }
      } else {
        return this.continueFreeFall(skaterState, initialEnergy, proposedPosition, proposedVelocity, dt);
      }
    } else {
      return skaterState;
    }
  }

  /**
   * Find the closest track to the skater, to see what he can bounce off or attach to, and return the closest point
   * that the track took.
   * @private
   *
   * @param {Vector2} position
   * @param {Track[]} physicalTracks
   * @returns {Object|null} - collection of { track: {Track}, parametricPosition: {Vector2}, point: {Vector2} }, or null
   */
  getClosestTrackAndPositionAndParameter(position, physicalTracks) {
    let closestTrack = null;
    let closestMatch = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < physicalTracks.length; i++) {
      const track = physicalTracks[i];

      // PERFORMANCE/ALLOCATION maybe get closest point shouldn't return a new object allocation each time, or use
      // pooling for it, or pass in reference as an arg?
      const bestMatch = track.getClosestPositionAndParameter(position);
      if (bestMatch.distance < closestDistance) {
        closestDistance = bestMatch.distance;
        closestTrack = track;
        closestMatch = bestMatch;
      }
    }
    if (closestTrack) {
      return {
        track: closestTrack,
        parametricPosition: closestMatch.parametricPosition,
        point: closestMatch.point
      };
    } else {
      return null;
    }
  }

  /**
   * Check to see if the points crossed the track.
   * @private
   *
   * @param {Object} closestTrackAndPositionAndParameter - the object returned by getClosestTrackAndPositionAndParameter()
   * @param {Track[]} physicalTracks - all tracks that the skater can physically interact with
   * @param {number} beforeX
   * @param {number} beforeY
   * @param {number} afterX
   * @param {number} afterY
   * @returns {boolean}
   */
  crossedTrack(closestTrackAndPositionAndParameter, physicalTracks, beforeX, beforeY, afterX, afterY) {
    const track = closestTrackAndPositionAndParameter.track;
    const parametricPosition = closestTrackAndPositionAndParameter.parametricPosition;
    const trackPoint = closestTrackAndPositionAndParameter.point;
    if (!track.isParameterInBounds(parametricPosition)) {
      return false;
    } else {
      // Linearize the spline, and check to see if the skater crossed by performing a line segment intersection between
      // the skater's trajectory segment and the linearized track segment.
      // Note, this has an error for cusps, see #212
      const unitParallelVector = track.getUnitParallelVector(parametricPosition);
      const a = trackPoint.plus(unitParallelVector.times(100));
      const b = trackPoint.plus(unitParallelVector.times(-100));
      const intersection = Utils.lineSegmentIntersection(a.x, a.y, b.x, b.y, beforeX, beforeY, afterX, afterY);
      return intersection !== null;
    }
  }

  /**
   * Check to see if skater should hit or attach to  track during free fall. Returns a new SkaterState for this.skater
   * @private
   *
   * @param {Track[]} physicalTracks
   * @param {SkaterState} skaterState
   * @param {Vector2} proposedPosition
   * @param {number} initialEnergy
   * @param {number} dt
   * @param {Vector2} proposedVelocity
   * @returns {SkaterState}
   */
  interactWithTracksWhileFalling(physicalTracks, skaterState, proposedPosition, initialEnergy, dt, proposedVelocity) {
    // Find the closest track, and see if the skater would cross it in this time step.
    // Assuming the skater's initial + final positions determine a line segment, we search for the best point for the
    // skater's start point, midpoint and end point and choose whichever is closest.  This helps avoid "high curvature"
    // problems like the one identified in #212
    const a = this.getClosestTrackAndPositionAndParameter(skaterState.getPosition(), physicalTracks);
    const averagePosition = new Vector2((skaterState.positionX + proposedPosition.x) / 2, (skaterState.positionY + proposedPosition.y) / 2);
    const b = this.getClosestTrackAndPositionAndParameter(averagePosition, physicalTracks);
    const c = this.getClosestTrackAndPositionAndParameter(new Vector2(proposedPosition.x, proposedPosition.y), physicalTracks);
    const initialPosition = skaterState.getPosition();
    const distanceA = Utils.distToSegment(a.point, initialPosition, proposedPosition);
    const distanceB = Utils.distToSegment(b.point, initialPosition, proposedPosition);
    const distanceC = Utils.distToSegment(c.point, initialPosition, proposedPosition);
    const distances = [distanceA, distanceB, distanceC];
    const minDistance = _.min(distances);
    const closestTrackAndPositionAndParameter = minDistance === distanceA ? a : minDistance === distanceC ? c : b;
    debugAttachDetach && debugAttachDetach('minDistance', distances.indexOf(minDistance));
    const crossed = this.crossedTrack(closestTrackAndPositionAndParameter, physicalTracks, skaterState.positionX, skaterState.positionY, proposedPosition.x, proposedPosition.y);
    const track = closestTrackAndPositionAndParameter.track;
    const parametricPosition = closestTrackAndPositionAndParameter.parametricPosition;
    const trackPoint = closestTrackAndPositionAndParameter.point;
    if (crossed) {
      debugAttachDetach && debugAttachDetach('attaching');
      const normal = track.getUnitNormalVector(parametricPosition);
      const segment = normal.perpendicular;
      const beforeVector = skaterState.getPosition().minus(trackPoint);

      // If crossed the track, attach to it.
      let newVelocity = segment.times(segment.dot(proposedVelocity));
      let newSpeed = newVelocity.magnitude;
      const newKineticEnergy = 0.5 * skaterState.mass * newVelocity.magnitudeSquared;
      const newPosition = track.getPoint(parametricPosition);
      const newPotentialEnergy = -skaterState.mass * skaterState.gravity * (newPosition.y - skaterState.referenceHeight);
      let newThermalEnergy = initialEnergy - newKineticEnergy - newPotentialEnergy;

      // Sometimes (depending on dt) the thermal energy can go negative by the above calculation, see #141
      // In that case, set the thermal energy to zero and reduce the speed to compensate.
      if (newThermalEnergy < skaterState.thermalEnergy) {
        const correctedState = this.correctThermalEnergy(skaterState, segment, newPosition);
        newThermalEnergy = correctedState.thermalEnergy;
        newSpeed = correctedState.getSpeed();
        newVelocity = correctedState.getVelocity();
      }
      const dot = proposedVelocity.normalized().dot(segment);

      // Sanity test
      assert && assert(isFinite(dot));
      assert && assert(isFinite(newVelocity.x));
      assert && assert(isFinite(newVelocity.y));
      assert && assert(isFinite(newThermalEnergy));
      assert && assert(newThermalEnergy >= 0);
      let parametricSpeed = (dot > 0 ? +1 : -1) * newSpeed;
      const onTopSideOfTrack = beforeVector.dot(normal) > 0;
      debug && debug(`attach to track, ${parametricPosition}, ${track.maxPoint}`);

      // Double check the velocities and invert parametricSpeed if incorrect, see #172
      // Compute the new velocities same as in stepTrack
      const unitParallelVector = track.getUnitParallelVector(parametricPosition);
      const newVelocityX = unitParallelVector.x * parametricSpeed;
      const newVelocityY = unitParallelVector.y * parametricSpeed;
      const velocityDotted = skaterState.velocityX * newVelocityX + skaterState.velocityY * newVelocityY;

      // See if the track attachment will cause velocity to flip, and inverse it if so, see #172
      if (velocityDotted < -1E-6) {
        parametricSpeed = parametricSpeed * -1;
      }
      const attachedSkater = skaterState.attachToTrack(newThermalEnergy, track, onTopSideOfTrack, parametricPosition, parametricSpeed, newVelocity.x, newVelocity.y, newPosition.x, newPosition.y);
      assert && assert(Utils.equalsEpsilon(attachedSkater.getTotalEnergy(), skaterState.getTotalEnergy(), 1E-8), 'large energy change after attaching to track');
      return attachedSkater;
    }

    // It just continued in free fall
    else {
      return this.continueFreeFall(skaterState, initialEnergy, proposedPosition, proposedVelocity, dt);
    }
  }

  /**
   * Started in free fall and did not interact with a track. Returns a new SkaterState for this.skater.
   * @private
   *
   * @param {SkaterState} skaterState
   * @param {number} initialEnergy
   * @param {Vector2} proposedPosition
   * @param {Vector2} proposedVelocity
   * @param {number} dt
   *
   * @returns {SkaterState}
   */
  continueFreeFall(skaterState, initialEnergy, proposedPosition, proposedVelocity, dt) {
    // make up for the difference by changing the y value
    const y = (initialEnergy - 0.5 * skaterState.mass * proposedVelocity.magnitudeSquared - skaterState.thermalEnergy) / (-1 * skaterState.mass * skaterState.gravity) + skaterState.referenceHeight;
    if (y <= 0) {
      // When falling straight down, stop completely and convert all energy kinetic to thermal
      return skaterState.strikeGround(skaterState.getKineticEnergy(), proposedPosition.x);
    } else {
      return skaterState.continueFreeFall(proposedVelocity.x, proposedVelocity.y, proposedPosition.x, y);
    }
  }

  /**
   * Gets the net force discluding normal force.
   *
   * Split into component-wise to prevent allocations, see #50
   *
   * @private
   *
   * @param {SkaterState} skaterState the state
   * @returns {number} netForce in the X direction
   */
  getNetForceWithoutNormalX(skaterState) {
    return this.getFrictionForceX(skaterState);
  }

  /**
   * Gets the net force but without the normal force.
   *
   * Split into component-wise to prevent allocations, see #50
   * @private
   *
   * @param {SkaterState} skaterState the state
   * @returns {number} netForce in the Y direction
   */
  getNetForceWithoutNormalY(skaterState) {
    return skaterState.mass * skaterState.gravity + this.getFrictionForceY(skaterState);
  }

  /**
   * The only other force on the object in the direction of motion is the gravity force
   * Component-wise to reduce allocations, see #50
   * @private
   *
   * @param {SkaterState} skaterState
   *
   * @returns {number}
   */
  getFrictionForceX(skaterState) {
    // Friction force should not exceed sum of other forces (in the direction of motion), otherwise the friction could
    // start a stopped object moving. Hence we check to see if the object is already stopped and don't add friction
    // in that case
    if (this.frictionProperty.value === 0 || skaterState.getSpeed() < 1E-2) {
      return 0;
    } else {
      const magnitude = this.frictionProperty.value * this.getNormalForce(skaterState).magnitude;
      const angleComponent = Math.cos(skaterState.getVelocity().angle + Math.PI);
      assert && assert(isFinite(magnitude), 'magnitude should be finite');
      assert && assert(isFinite(angleComponent), 'angleComponent should be finite');
      return magnitude * angleComponent;
    }
  }

  /**
   * The only other force on the object in the direction of motion is the gravity force
   * Component-wise to reduce allocations, see #50
   * @private
   *
   * @param {SkaterState} skaterState
   * @returns {number}
   */
  getFrictionForceY(skaterState) {
    // Friction force should not exceed sum of other forces (in the direction of motion), otherwise the friction could
    // start a stopped object moving.  Hence we check to see if the object is already stopped and don't add friction in
    // that case
    if (this.frictionProperty.value === 0 || skaterState.getSpeed() < 1E-2) {
      return 0;
    } else {
      const magnitude = this.frictionProperty.value * this.getNormalForce(skaterState).magnitude;
      return magnitude * Math.sin(skaterState.getVelocity().angle + Math.PI);
    }
  }

  /**
   * Get the normal force (Newtons) on the skater.
   * @private
   *
   * @param {SkaterState} skaterState
   * @returns {number}
   */
  getNormalForce(skaterState) {
    skaterState.getCurvature(curvatureTemp2);
    const radiusOfCurvature = Math.min(curvatureTemp2.r, 100000);
    const netForceRadial = new Vector2(0, 0);
    netForceRadial.addXY(0, skaterState.mass * skaterState.gravity); // gravity
    let curvatureDirection = this.getCurvatureDirection(curvatureTemp2, skaterState.positionX, skaterState.positionY);

    // On a flat surface, just use the radial component of the net force for the normal, see #344
    if (isNaN(curvatureDirection.x) || isNaN(curvatureDirection.y)) {
      curvatureDirection = netForceRadial.normalized();
    }
    const normalForce = skaterState.mass * skaterState.getSpeed() * skaterState.getSpeed() / Math.abs(radiusOfCurvature) - netForceRadial.dot(curvatureDirection);
    debug && debug(normalForce);
    const n = Vector2.createPolar(normalForce, curvatureDirection.angle);
    assert && assert(isFinite(n.x), 'n.x should be finite');
    assert && assert(isFinite(n.y), 'n.y should be finite');
    return n;
  }

  /**
   * Use an Euler integration step to move the skater along the track. This code is in an inner loop of the model
   * physics, and has been heavily optimized. Returns a new SkaterState for this.skater.
   * @private
   *
   * @param {number} dt
   * @param {SkaterState} skaterState
   * @returns {SkaterState}
   */
  stepEuler(dt, skaterState) {
    const track = skaterState.track;
    const origEnergy = skaterState.getTotalEnergy();
    const origLocX = skaterState.positionX;
    const origLocY = skaterState.positionY;
    let thermalEnergy = skaterState.thermalEnergy;
    let parametricSpeed = skaterState.parametricSpeed;
    assert && assert(isFinite(parametricSpeed));
    let parametricPosition = skaterState.parametricPosition;

    // Component-wise math to prevent allocations, see #50
    const netForceX = this.getNetForceWithoutNormalX(skaterState);
    const netForceY = this.getNetForceWithoutNormalY(skaterState);
    const netForceMagnitude = Math.sqrt(netForceX * netForceX + netForceY * netForceY);
    const netForceAngle = Math.atan2(netForceY, netForceX);

    // Get the net force in the direction of the track.  Dot product is a * b * cos(theta)
    const a = netForceMagnitude * Math.cos(skaterState.track.getModelAngleAt(parametricPosition) - netForceAngle) / skaterState.mass;
    parametricSpeed += a * dt;
    assert && assert(isFinite(parametricSpeed), 'parametricSpeed should be finite');
    parametricPosition += track.getParametricDistance(parametricPosition, parametricSpeed * dt + 1 / 2 * a * dt * dt);
    const newPointX = skaterState.track.getX(parametricPosition);
    const newPointY = skaterState.track.getY(parametricPosition);
    const unitParallelVector = skaterState.track.getUnitParallelVector(parametricPosition);
    const parallelUnitX = unitParallelVector.x;
    const parallelUnitY = unitParallelVector.y;
    let newVelocityX = parallelUnitX * parametricSpeed;
    let newVelocityY = parallelUnitY * parametricSpeed;

    // Exponentially decay the velocity if already nearly zero and on a flat slope, see #129
    if (parallelUnitX / parallelUnitY > 5 && Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY) < 1E-2) {
      newVelocityX /= 2;
      newVelocityY /= 2;
    }

    // choose velocity by using the unit parallel vector to the track
    const newState = skaterState.updateUUDVelocityPosition(parametricPosition, parametricSpeed, newVelocityX, newVelocityY, newPointX, newPointY);
    if (this.frictionProperty.value > 0) {
      // Compute friction force magnitude component-wise to prevent allocations, see #50
      const frictionForceX = this.getFrictionForceX(skaterState);
      const frictionForceY = this.getFrictionForceY(skaterState);
      const frictionForceMagnitude = Math.sqrt(frictionForceX * frictionForceX + frictionForceY * frictionForceY);
      const newPoint = new Vector2(newPointX, newPointY);
      const therm = frictionForceMagnitude * newPoint.distanceXY(origLocX, origLocY);
      thermalEnergy += therm;
      const newTotalEnergy = newState.getTotalEnergy() + therm;

      // Conserve energy, but only if the user is not adding energy, see #135
      if (thrust.magnitude === 0 && !this.trackChangePending) {
        if (newTotalEnergy < origEnergy) {
          thermalEnergy += Math.abs(newTotalEnergy - origEnergy); // add some thermal to exactly match
          if (Math.abs(newTotalEnergy - origEnergy) > 1E-6) {
            debug && debug(`Added thermal, dE=${newState.getTotalEnergy() - origEnergy}`);
          }
        }
        if (newTotalEnergy > origEnergy) {
          if (Math.abs(newTotalEnergy - origEnergy) < therm) {
            debug && debug('gained energy, removing thermal (Would have to remove more than we gained)');
          } else {
            thermalEnergy -= Math.abs(newTotalEnergy - origEnergy);
            if (Math.abs(newTotalEnergy - origEnergy) > 1E-6) {
              debug && debug(`Removed thermal, dE=${newTotalEnergy - origEnergy}`);
            }
          }
        }
      }

      // Discrepancy with original version: original version allowed drop of thermal energy here, to be fixed in the
      // heuristic patch. We have clamped it here to make it amenable to a smaller number of euler updates,
      // to improve performance
      return newState.updateThermalEnergy(Math.max(thermalEnergy, skaterState.thermalEnergy));
    } else {
      return newState;
    }
  }

  /**
   * Update the skater as it moves along the track, and fly off the track if it  goes over a jump off the track's end.
   * @private
   *
   * @param {number} dt
   * @param {SkaterState} skaterState
   * @returns {SkaterState}
   */
  stepTrack(dt, skaterState) {
    skaterState.getCurvature(curvatureTemp);
    const curvatureDirectionX = this.getCurvatureDirectionX(curvatureTemp, skaterState.positionX, skaterState.positionY);
    const curvatureDirectionY = this.getCurvatureDirectionY(curvatureTemp, skaterState.positionX, skaterState.positionY);
    const track = skaterState.track;
    const unitNormalVector = track.getUnitNormalVector(skaterState.parametricPosition);
    const sideVectorX = skaterState.onTopSideOfTrack ? unitNormalVector.x : unitNormalVector.x * -1;
    const sideVectorY = skaterState.onTopSideOfTrack ? unitNormalVector.y : unitNormalVector.y * -1;

    // Dot product written out component-wise to avoid allocations, see #50
    const outsideCircle = sideVectorX * curvatureDirectionX + sideVectorY * curvatureDirectionY < 0;

    // compare a to v/r^2 to see if it leaves the track
    const r = Math.abs(curvatureTemp.r);
    const centripetalForce = skaterState.mass * skaterState.parametricSpeed * skaterState.parametricSpeed / r;
    const netForceWithoutNormalX = this.getNetForceWithoutNormalX(skaterState);
    const netForceWithoutNormalY = this.getNetForceWithoutNormalY(skaterState);

    // Net force in the radial direction is the dot product.  Component-wise to avoid allocations, see #50
    const netForceRadial = netForceWithoutNormalX * curvatureDirectionX + netForceWithoutNormalY * curvatureDirectionY;
    const leaveTrack = netForceRadial < centripetalForce && outsideCircle || netForceRadial > centripetalForce && !outsideCircle;
    if (leaveTrack && !this.stickingToTrackProperty.value) {
      // Leave the track.  Make sure the velocity is pointing away from the track or keep track of frames away from the
      // track so it doesn't immediately recollide.  Or project a ray and see if a collision is imminent?
      const freeSkater = skaterState.leaveTrack();
      debugAttachDetach && debugAttachDetach('left middle track', freeSkater.velocityX, freeSkater.velocityY);
      const nudged = this.nudge(freeSkater, sideVectorX, sideVectorY, +1);

      // Step after switching to free fall, so it doesn't look like it pauses
      return this.stepFreeFall(dt, nudged, true);
    } else {
      let newState = skaterState;

      // Discrepancy with original version: original version had 10 divisions here.  We have reduced it to make it more
      // smooth and less GC
      const numDivisions = 4;
      for (let i = 0; i < numDivisions; i++) {
        newState = this.stepEuler(dt / numDivisions, newState);
      }

      // Correct energy
      const correctedState = this.correctEnergy(skaterState, newState);

      // Check whether the skater has left the track
      if (skaterState.track.isParameterInBounds(correctedState.parametricPosition)) {
        // To prevent non-physical behavior when the skater "pops" above ground after leaving a track that has
        // forced it underground, we switch to ground before the skater can go below ground in the first place.
        // This should only happen while dragging the track, as all track points should be above ground otherwise.
        // See https://github.com/phetsims/energy-skate-park/issues/45
        if (correctedState.positionY <= 0) {
          const groundPosition = new Vector2(correctedState.positionX, 0);
          return this.switchToGround(correctedState, correctedState.getTotalEnergy(), groundPosition, correctedState.getVelocity(), dt);
        } else {
          return correctedState;
        }
      } else {
        // Fly off the left or right side of the track
        // Off the edge of the track.  If the skater transitions from the right edge of the 2nd track directly to the
        // ground then do not lose thermal energy during the transition, see #164
        if (correctedState.parametricPosition > skaterState.track.maxPoint && skaterState.track.slopeToGround) {
          let result = correctedState.switchToGround(correctedState.thermalEnergy, correctedState.getSpeed(), 0, correctedState.positionX, 0);

          // All track points are at or above ground so it is possible that we took potential energy out of the. Add
          // to kinetic energy to compensate
          const energyDifference = result.getPotentialEnergy() - correctedState.getPotentialEnergy();
          if (energyDifference < 0) {
            // add the lost energy to kinetic energy to compensate
            const newKineticEnergy = result.getKineticEnergy() + -energyDifference;

            // new skater speed will be speed from adjusted kinetic energy
            const adjustedSpeed = result.getSpeedFromEnergy(newKineticEnergy);

            // restore direction to velocity - slopes point to the right, but just in case
            const correctedV = result.velocityX >= 0 ? adjustedSpeed : -adjustedSpeed;
            result = result.updatePositionAngleUpVelocity(result.positionX, result.positionY, 0, true, correctedV, 0);

            // this correction should put result energy very close to correctedState energy
            assert && assert(Utils.equalsEpsilon(result.getTotalEnergy(), correctedState.getTotalEnergy(), 1E-6), 'correction after slope to ground changed total energy too much');
          }

          // Correct any other energy discrepancy when switching to the ground, see #301
          return this.correctEnergy(skaterState, result);
        } else {
          debugAttachDetach && debugAttachDetach(`left edge track: ${correctedState.parametricPosition}, ${skaterState.track.maxPoint}`);

          // There is a situation in which the `u` of the skater exceeds the track bounds before the
          // getClosestPositionAndParameter.parametricPosition does, which can cause the skater to immediately reattach
          // So make sure the skater is far enough from the track so it won't reattach right away, see #167
          const freeSkaterState = skaterState.updateTrackUD(null, 0);
          const nudgedState = this.nudge(freeSkaterState, sideVectorX, sideVectorY, -1);

          // Step after switching to free fall, so it doesn't look like it pauses
          const freeFallState = this.stepFreeFall(dt, nudgedState, true);

          // if during this step we switched to ground, restore the kinetic energy and horizontal velocity rather
          // than striking the earth
          if (freeFallState.positionY === 0) {
            return this.switchToGround(freeFallState, freeFallState.getTotalEnergy(), freeFallState.getPosition(), nudgedState.getVelocity(), dt);
          } else {
            return freeFallState;
          }
        }
      }
    }
  }

  /**
   * When the skater leaves the track, adjust the position and velocity. This prevents the following problems:
   * 1. When leaving from the sides, adjust the skater under the track so it won't immediately re-collide.
   * 2. When leaving from the middle of the track (say going over a jump or falling upside-down from a loop),
   * adjust the skater so it won't fall through or re-collide.
   * @private
   *
   * @param {SkaterState} freeSkater
   * @param {number} sideVectorX
   * @param {number} sideVectorY
   * @param {number} sign
   * @returns {SkaterState}
   */
  nudge(freeSkater, sideVectorX, sideVectorY, sign) {
    // angle the velocity down a bit and underset from track so that it won't immediately re-collide
    // Nudge the velocity in the 'up' direction so the skater won't pass through the track, see #207
    const velocity = new Vector2(freeSkater.velocityX, freeSkater.velocityY);
    const upVector = new Vector2(sideVectorX, sideVectorY);
    if (velocity.magnitude > 0) {
      const blended = velocity.normalized().blend(upVector, 0.01 * sign);
      if (blended.magnitude > 0) {
        const revisedVelocity = blended.normalized().times(velocity.magnitude);
        freeSkater = freeSkater.updateUDVelocity(0, revisedVelocity.x, revisedVelocity.y);

        // Nudge the position away from the track, slightly since it was perfectly centered on the track, see #212
        // Note this will change the energy of the skater, but only by a tiny amount (that should be undetectable in the
        // bar chart)
        const origPosition = freeSkater.getPosition();
        const newPosition = origPosition.plus(upVector.times(sign * 1E-6));
        freeSkater = freeSkater.updatePosition(newPosition.x, newPosition.y);
        debugAttachDetach && debugAttachDetach('newdot', revisedVelocity.dot(upVector));
        return freeSkater;
      }
    }
    return freeSkater;
  }

  /**
   * Try to match the target energy by reducing the velocity of the skaterState.
   * @private
   *
   * @param {SkaterState} skaterState
   * @param {SkaterState} targetState
   * @returns {SkaterState}
   */
  correctEnergyReduceVelocity(skaterState, targetState) {
    // Make a clone we can mutate and return, to protect the input argument
    const newSkaterState = targetState.copy();
    const e0 = skaterState.getTotalEnergy();
    const mass = skaterState.mass;

    // Find the direction of velocity.  This is on the track unless the skater just left the "slope" track
    const unit = newSkaterState.track ? newSkaterState.track.getUnitParallelVector(newSkaterState.parametricPosition) : newSkaterState.getVelocity().normalized();

    // Binary search, but bail after too many iterations
    for (let i = 0; i < 100; i++) {
      const dv = (newSkaterState.getTotalEnergy() - e0) / (mass * newSkaterState.parametricSpeed);
      const newVelocity = newSkaterState.parametricSpeed - dv;

      // We can just set the state directly instead of calling update since we are keeping a protected clone of the
      // newSkaterState
      newSkaterState.parametricSpeed = newVelocity;
      const result = unit.times(newVelocity);
      newSkaterState.velocityX = result.x;
      newSkaterState.velocityY = result.y;
      if (Utils.equalsEpsilon(e0, newSkaterState.getTotalEnergy(), 1E-8)) {
        break;
      }
    }
    return newSkaterState;
  }

  /**
   * Binary search to find the parametric coordinate along the track that matches the e0 energy.
   * @private
   *
   * @param {SkaterState} skaterState
   * @param {number} u0
   * @param {number} u1
   * @param {number} e0
   * @param {number} numSteps
   * @returns {number}
   */
  searchSplineForEnergy(skaterState, u0, u1, e0, numSteps) {
    const da = (u1 - u0) / numSteps;
    let bestAlpha = (u1 + u0) / 2;
    const p = skaterState.track.getPoint(bestAlpha);
    let bestDE = skaterState.updatePosition(p.x, p.y).getTotalEnergy();
    for (let i = 0; i < numSteps; i++) {
      const proposedAlpha = u0 + da * i;
      const p2 = skaterState.track.getPoint(bestAlpha);
      const e = skaterState.updatePosition(p2.x, p2.y).getTotalEnergy();
      if (Math.abs(e - e0) <= Math.abs(bestDE)) {
        bestDE = e - e0;
        bestAlpha = proposedAlpha;
      } // continue to find best value closest to proposed u, even if several values give dE=0.0
    }

    debug && debug(`After ${numSteps} steps, origAlpha=${u0}, bestAlpha=${bestAlpha}, dE=${bestDE}`);
    return bestAlpha;
  }

  /**
   * A number of heuristic energy correction steps to ensure energy is conserved while keeping the motion smooth and
   * accurate. Copied from the Java version directly (with a few different magic numbers)
   * @private
   *
   * @param {SkaterState} skaterState
   * @param {SkaterState} newState
   * @returns {SkaterState}
   */
  correctEnergy(skaterState, newState) {
    if (this.trackChangePending) {
      return newState;
    }
    const u0 = skaterState.parametricPosition;
    const e0 = skaterState.getTotalEnergy();
    if (!isFinite(newState.getTotalEnergy())) {
      throw new Error('not finite');
    }
    const dE = newState.getTotalEnergy() - e0;
    if (Math.abs(dE) < 1E-6) {
      // small enough
      return newState;
    } else {
      if (newState.getTotalEnergy() > e0) {
        debug && debug('Energy too high');

        // can we reduce the velocity enough?
        // amount we could reduce the energy if we deleted all the kinetic energy:
        if (Math.abs(newState.getKineticEnergy()) > Math.abs(dE)) {
          // This is the current rule for reducing the energy.  But in a future version maybe should only do this
          // if all velocity is not converted?
          debug && debug('Could fix all energy by changing velocity.');
          const correctedStateA = this.correctEnergyReduceVelocity(skaterState, newState);
          debug && debug(`changed velocity: dE=${correctedStateA.getTotalEnergy() - e0}`);
          if (!Utils.equalsEpsilon(e0, correctedStateA.getTotalEnergy(), 1E-8)) {
            debug && debug('Energy error[0]');
          }
          return correctedStateA;
        } else {
          debug && debug('Not enough KE to fix with velocity alone: normal:');
          debug && debug(`changed position u: dE=${newState.getTotalEnergy() - e0}`);
          // search for a place between u and u0 with a better energy

          const numRecursiveSearches = 10;
          const parametricPosition = newState.parametricPosition;
          let bestAlpha = (parametricPosition + u0) / 2.0;
          let da = Math.abs((parametricPosition - u0) / 2);
          for (let i = 0; i < numRecursiveSearches; i++) {
            const numSteps = 10;
            bestAlpha = this.searchSplineForEnergy(newState, bestAlpha - da, bestAlpha + da, e0, numSteps);
            da = Math.abs((bestAlpha - da - (bestAlpha + da)) / numSteps);
          }
          const point = newState.track.getPoint(bestAlpha);
          const correctedState = newState.updateUPosition(bestAlpha, point.x, point.y);
          debug && debug(`changed position u: dE=${correctedState.getTotalEnergy() - e0}`);
          if (!Utils.equalsEpsilon(e0, correctedState.getTotalEnergy(), 1E-8)) {
            // amount we could reduce the energy if we deleted all the kinetic energy:
            if (Math.abs(correctedState.getKineticEnergy()) > Math.abs(dE)) {
              // NOTE: maybe should only do this if all velocity is not converted
              debug && debug('Fixed position some, still need to fix velocity as well.');
              const correctedState2 = this.correctEnergyReduceVelocity(skaterState, correctedState);
              if (!Utils.equalsEpsilon(e0, correctedState2.getTotalEnergy(), 1E-8)) {
                debug && debug('Changed position & Velocity and still had energy error');
                debug && debug('Energy error[123]');
              }
              return correctedState2;
            } else {
              // This error seems to occur with friction turned on at the top of a hill, see https://github.com/phetsims/energy-skate-park-basics/issues/127
              debug && debug(`Changed position, wanted to change velocity, but didn't have enough to fix it..., dE=${newState.getTotalEnergy() - e0}`);
              if (newState.thermalEnergy > skaterState.thermalEnergy) {
                const increasedThermalEnergy = newState.thermalEnergy - skaterState.thermalEnergy;
                if (increasedThermalEnergy > dE) {
                  const reducedThermalEnergyState = newState.updateThermalEnergy(newState.thermalEnergy - dE);
                  assert && assert(Math.abs(reducedThermalEnergyState.getTotalEnergy() - e0) < 1E-6, 'energy should be corrected');
                  debug && debug(`Corrected energy by reducing thermal overestimate${dE}`);
                  return reducedThermalEnergyState;
                } else {
                  // Take as much thermal energy out as possible
                  const originalThermalEnergyState = newState.updateThermalEnergy(skaterState.thermalEnergy);
                  const correctedState3 = this.correctEnergyReduceVelocity(skaterState, originalThermalEnergyState);
                  if (!Utils.equalsEpsilon(e0, correctedState3.getTotalEnergy(), 1E-8)) {
                    debug && debug('Changed position & Velocity and still had energy error, error[124]');
                  }
                  return correctedState3;
                }
              }
              return correctedState;
            }
          }
          return correctedState;
        }
      } else {
        if (!isFinite(newState.getTotalEnergy())) {
          throw new Error('not finite');
        }
        debug && debug('Energy too low');
        assert && assert(newState.track, 'newState must be still have a track for this energy correction');
        assert && assert(newState.parametricSpeed !== 0, 'correction assumes that there is some kinetic energy to add to');

        // increasing the kinetic energy
        // Choose the exact velocity in the same direction as current velocity to ensure total energy conserved.
        const vSq = Math.abs(2 / newState.mass * (e0 - newState.getPotentialEnergy() - newState.thermalEnergy));
        const v = Math.sqrt(vSq);
        const newVelocity = v * (newState.parametricSpeed > 0 ? +1 : -1);
        const unitParallelVector = newState.track.getUnitParallelVector(newState.parametricPosition);
        const updatedVelocityX = unitParallelVector.x * newVelocity;
        const updatedVelocityY = unitParallelVector.y * newVelocity;
        const fixedState = newState.updateUDVelocity(newVelocity, updatedVelocityX, updatedVelocityY);
        debug && debug('Set velocity to match energy, when energy was low: ');
        debug && debug(`INC changed velocity: dE=${fixedState.getTotalEnergy() - e0}`);
        if (!Utils.equalsEpsilon(e0, fixedState.getTotalEnergy(), 1E-8)) {
          new Error('Energy error[2]').printStackTrace();
        }
        return fixedState;
      }
    }
  }

  // PERFORMANCE/ALLOCATION - uses a reusable Object for curvature
  /**
   * Get direction of curvature at the position of the Skater.
   * @private
   *
   * @param {Object} curvature - Reusable Object describing curvature (radius and position), see Track.getCurvature
   * @param {number} x2
   * @param {number} y2
   * @returns {Vector2}
   */
  getCurvatureDirection(curvature, x2, y2) {
    const v = new Vector2(curvature.x - x2, curvature.y - y2);
    return v.x !== 0 || v.y !== 0 ? v.normalized() : v;
  }

  /**
   * Get the x component of direction of curvature at the Skater's position.
   * @private
   *
   * @param {Object} curvature - Reusable Object describing curvature, see Track.getCurvature
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  getCurvatureDirectionX(curvature, x2, y2) {
    const vx = curvature.x - x2;
    const vy = curvature.y - y2;
    return vx !== 0 || vy !== 0 ? vx / Math.sqrt(vx * vx + vy * vy) : vx;
  }

  /**
   * Get the y component of direction of curvature at the Skater's position.
   * @private
   *
   * @param {Object} curvature - Reusable Object describing curvature, see Track.getCurvature
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  getCurvatureDirectionY(curvature, x2, y2) {
    const vx = curvature.x - x2;
    const vy = curvature.y - y2;
    return vx !== 0 || vy !== 0 ? vy / Math.sqrt(vx * vx + vy * vy) : vy;
  }

  /**
   * Update the skater based on which state.
   * @protected
   *
   * @param {number} dt
   * @param {SkaterState} skaterState
   * @returns {SkaterState}
   */
  stepModel(dt, skaterState) {
    // increment running time - done in stepModel because dt reflects timeSpeedProperty here
    this.stopwatch.step(dt);
    if (skaterState.dragging) {
      // User is dragging the skater, nothing to update here
      return skaterState;
    } else if (skaterState.track) {
      return this.stepTrack(dt, skaterState);
    } else if (skaterState.positionY <= 0) {
      return this.stepGround(dt, skaterState);
    } else if (skaterState.positionY > 0) {
      return this.stepFreeFall(dt, skaterState, false);
    } else {
      assert && assert(false, 'Impossible condition for skater, can\'t step');
      return skaterState;
    }
  }

  /**
   * Return to the place he was last released by the user. Also restores the track the skater was on so the initial
   * conditions are the same as the previous release.
   * @public
   *
   * @returns {SkaterState}
   */
  returnSkater() {
    // returning the skater moves it to a new position - signify that it is being controlled outside of the physical
    // model
    this.userControlledPropertySet.skaterControlledProperty.set(true);

    // if the skater's original track is available, restore her to it, see #143
    const originalTrackAvailable = _.includes(this.getPhysicalTracks(), this.skater.startingTrackProperty.value);
    if (originalTrackAvailable) {
      this.skater.trackProperty.value = this.skater.startingTrackProperty.value;
    }
    this.skater.returnSkater();
    this.userControlledPropertySet.skaterControlledProperty.set(false);
  }

  /**
   * Clear thermal energy from the model.
   * @public
   */
  clearThermal() {
    this.skater.clearThermal();
  }

  /**
   * Get all tracks in the model that are marked as physical (they can interact with the Skater in some way).
   * @public
   *
   * @returns {Track[]}
   */
  getPhysicalTracks() {
    // Use vanilla instead of lodash for speed since this is in an inner loop
    const physicalTracks = [];
    for (let i = 0; i < this.tracks.length; i++) {
      const track = this.tracks.get(i);
      if (track.physicalProperty.value) {
        physicalTracks.push(track);
      }
    }
    return physicalTracks;
  }

  /**
   * Get all tracks that the skater cannot interact with.
   * @public
   *
   * @returns {Track[]}
   */
  getNonPhysicalTracks() {
    return this.tracks.filter(track => !track.physicalProperty.get());
  }

  /**
   * Remove a track from the observable array of tracks and dispose it.
   * @public
   *
   * @param {Track} trackToRemove
   */
  removeAndDisposeTrack(trackToRemove) {
    assert && assert(this.tracks.includes(trackToRemove), 'trying to remove track that is not in the list');
    this.tracks.remove(trackToRemove);
    this.trackGroup.disposeElement(trackToRemove);
  }

  /**
   * Find whatever track is connected to the specified track and join them together to a new track.
   * @public
   *
   * @param {Track} track
   */
  joinTracks(track) {
    assert && assert(track.attachable, 'trying to join tracks, but track is not attachable');
    const connectedPoint = track.getSnapTarget();
    const otherTrack = _.find(this.getPhysicalTracks(), track => track.containsControlPoint(connectedPoint));
    assert && assert(otherTrack, 'trying to attach tracks, but other track was not found');
    assert && assert(otherTrack.attachable, 'trying to join tracks, but other track is not attachable');
    this.joinTrackToTrack(track, otherTrack);
  }

  /**
   * The user has pressed the "delete" button for the specified track's specified control point, and it should be
   * deleted. It should be an inner point of a track (not an end point). If there were only 2 points on the track,
   * just delete the entire track.
   * @public
   *
   *
   * @param {Track} track
   * @param {number} controlPointIndex [description]
   */
  deleteControlPoint(track, controlPointIndex) {
    track.removeEmitter.emit();
    this.removeAndDisposeTrack(track);
    if (track.controlPoints.length > 2) {
      const controlPointToDelete = track.controlPoints[controlPointIndex];
      const points = _.without(track.controlPoints, controlPointToDelete);
      this.controlPointGroup.disposeElement(controlPointToDelete);
      const newTrack = this.trackGroup.createNextElement(points, track.getParentsOrSelf(), Track.FULLY_INTERACTIVE_OPTIONS);
      newTrack.physicalProperty.value = true;
      newTrack.droppedProperty.value = true;

      // smooth out the new track, see #177
      const smoothingPoint = controlPointIndex >= newTrack.controlPoints.length ? newTrack.controlPoints.length - 1 : controlPointIndex;
      newTrack.smooth(smoothingPoint);

      // Make sure the new track doesn't go underground after a control point is deleted, see #174
      newTrack.bumpAboveGround();
      this.tracks.add(newTrack);
    } else {
      // the entire track is deleted, so we must dispose the other control points
      for (let i = 0; i < track.controlPoints.length; i++) {
        const controlPoint = track.controlPoints[i];
        this.controlPointGroup.disposeElement(controlPoint);
      }
    }

    // Trigger track changed first to update the edit enabled properties
    this.trackChangedEmitter.emit();

    // If the skater was on track, then he should fall off
    if (this.skater.trackProperty.value === track) {
      this.skater.trackProperty.value = null;
    }
  }

  /**
   * The user has pressed the "delete" button for the specified track's specified control point, and it should be
   * deleted. It should be an inner point of a track (not an endpoint).
   * @public
   *
   * @param {Track} track
   * @param {number} controlPointIndex - integer
   * @param {number} modelAngle
   */
  splitControlPoint(track, controlPointIndex, modelAngle) {
    assert && assert(track.splittable, 'trying to split a track that is not splittable!');
    const controlPointToSplit = track.controlPoints[controlPointIndex];
    const vector = Vector2.createPolar(0.5, modelAngle);
    const newPoint1 = this.controlPointGroup.createNextElement(track.controlPoints[controlPointIndex].sourcePositionProperty.value.x - vector.x, track.controlPoints[controlPointIndex].sourcePositionProperty.value.y - vector.y);
    const newPoint2 = this.controlPointGroup.createNextElement(track.controlPoints[controlPointIndex].sourcePositionProperty.value.x + vector.x, track.controlPoints[controlPointIndex].sourcePositionProperty.value.y + vector.y);
    const points1 = track.controlPoints.slice(0, controlPointIndex);
    const points2 = track.controlPoints.slice(controlPointIndex + 1, track.controlPoints.length);
    points1.push(newPoint1);
    points2.unshift(newPoint2);
    const newTrack1 = this.trackGroup.createNextElement(points1, track.getParentsOrSelf(), Track.FULLY_INTERACTIVE_OPTIONS);
    newTrack1.physicalProperty.value = true;
    newTrack1.droppedProperty.value = true;
    const newTrack2 = this.trackGroup.createNextElement(points2, track.getParentsOrSelf(), Track.FULLY_INTERACTIVE_OPTIONS);
    newTrack2.physicalProperty.value = true;
    newTrack2.droppedProperty.value = true;
    track.removeEmitter.emit();
    this.removeAndDisposeTrack(track);
    this.tracks.add(newTrack1);
    this.tracks.add(newTrack2);

    // Smooth the new tracks, see #177
    newTrack1.smooth(controlPointIndex - 1);
    newTrack2.smooth(0);

    // Trigger track changed first to update the edit enabled properties
    this.trackChangedEmitter.emit();

    // If the skater was on track, then he should fall off, see #97
    if (this.skater.trackProperty.value === track) {
      this.skater.trackProperty.value = null;
    }

    // If a control point was split and that makes too many "live" control points total, remove a piece of track from
    // the toolbox to keep the total number of control points low enough.
    if (this.getNumberOfControlPoints() > EnergySkateParkConstants.MAX_NUMBER_CONTROL_POINTS) {
      // find a nonphysical track, then remove it

      const trackToRemove = this.getNonPhysicalTracks()[0];
      trackToRemove.removeEmitter.emit();
      this.removeAndDisposeTrack(trackToRemove);
      trackToRemove.disposeControlPoints();
    }

    // Dispose the control point itself
    this.controlPointGroup.disposeElement(controlPointToSplit);
  }

  /**
   * Join the specified tracks together into a single new track and delete the old tracks.
   * @public
   *
   * @param a {Track}
   * @param b {Track}
   */
  joinTrackToTrack(a, b) {
    const points = [];
    let i;
    const firstTrackForward = () => {
      for (i = 0; i < a.controlPoints.length; i++) {
        points.push(a.controlPoints[i].copy(this));
      }
    };
    const firstTrackBackward = () => {
      for (i = a.controlPoints.length - 1; i >= 0; i--) {
        points.push(a.controlPoints[i].copy(this));
      }
    };
    const secondTrackForward = () => {
      for (i = 1; i < b.controlPoints.length; i++) {
        points.push(b.controlPoints[i].copy(this));
      }
    };
    const secondTrackBackward = () => {
      for (i = b.controlPoints.length - 2; i >= 0; i--) {
        points.push(b.controlPoints[i].copy(this));
      }
    };

    // Only include one copy of the snapped point
    // Forward Forward
    if (a.controlPoints[a.controlPoints.length - 1].snapTargetProperty.value === b.controlPoints[0]) {
      firstTrackForward();
      secondTrackForward();
    }

    // Forward Backward
    else if (a.controlPoints[a.controlPoints.length - 1].snapTargetProperty.value === b.controlPoints[b.controlPoints.length - 1]) {
      firstTrackForward();
      secondTrackBackward();
    }

    // Backward Forward
    else if (a.controlPoints[0].snapTargetProperty.value === b.controlPoints[0]) {
      firstTrackBackward();
      secondTrackForward();
    }

    // Backward backward
    else if (a.controlPoints[0].snapTargetProperty.value === b.controlPoints[b.controlPoints.length - 1]) {
      firstTrackBackward();
      secondTrackBackward();
    }
    const newTrack = this.trackGroup.createNextElement(points, a.getParentsOrSelf().concat(b.getParentsOrSelf()), Track.FULLY_INTERACTIVE_OPTIONS);
    newTrack.physicalProperty.value = true;
    newTrack.droppedProperty.value = true;
    a.disposeControlPoints();
    a.removeEmitter.emit();
    if (this.tracks.includes(a)) {
      this.removeAndDisposeTrack(a);
    }
    b.disposeControlPoints();
    b.removeEmitter.emit();
    if (this.tracks.includes(b)) {
      this.removeAndDisposeTrack(b);
    }

    // When tracks are joined, bump the new track above ground so the y value (and potential energy) cannot go negative,
    // and so it won't make the "return skater" button get bigger, see #158
    newTrack.bumpAboveGround();
    this.tracks.add(newTrack);

    // Move skater to new track if he was on the old track, by searching for the best fit point on the new track
    // Note: Energy is not conserved when tracks joined since the user has added or removed energy from the system
    if (this.skater.trackProperty.value === a || this.skater.trackProperty.value === b) {
      const originalDirectionVector = this.skater.trackProperty.value.getUnitParallelVector(this.skater.parametricPositionProperty.value).times(this.skater.parametricSpeedProperty.value);

      // Keep track of the skater direction so we can toggle the 'up' flag if the track orientation changed
      const originalNormal = this.skater.upVector;
      const p = newTrack.getClosestPositionAndParameter(this.skater.positionProperty.value.copy());
      this.skater.trackProperty.value = newTrack;
      this.skater.parametricPositionProperty.value = p.parametricPosition;
      const x2 = newTrack.getX(p.parametricPosition);
      const y2 = newTrack.getY(p.parametricPosition);
      this.skater.positionProperty.value = new Vector2(x2, y2);
      this.skater.angleProperty.value = newTrack.getViewAngleAt(p.parametricPosition) + (this.skater.onTopSideOfTrackProperty.value ? 0 : Math.PI);

      // Trigger an initial update now so we can get the right up vector, see #150
      this.skater.updatedEmitter.emit();
      const newNormal = this.skater.upVector;

      // If the skater flipped upside down because the track directionality is different, toggle his 'up' flag
      if (originalNormal.dot(newNormal) < 0) {
        this.skater.onTopSideOfTrackProperty.value = !this.skater.onTopSideOfTrackProperty.value;
        this.skater.angleProperty.value = newTrack.getViewAngleAt(p.parametricPosition) + (this.skater.onTopSideOfTrackProperty.value ? 0 : Math.PI);
        this.skater.updatedEmitter.emit();
      }

      // If the skater changed direction of motion because of the track polarity change, flip the parametric velocity
      // 'parametricSpeed' value, see #180
      const newDirectionVector = this.skater.trackProperty.value.getUnitParallelVector(this.skater.parametricPositionProperty.value).times(this.skater.parametricSpeedProperty.value);
      debugAttachDetach && debugAttachDetach(newDirectionVector.dot(originalDirectionVector));
      if (newDirectionVector.dot(originalDirectionVector) < 0) {
        this.skater.parametricSpeedProperty.value = -this.skater.parametricSpeedProperty.value;
      }
    }

    // When joining tracks, smooth out the new track, but without moving the point that joined the tracks, see #177 #238
    newTrack.smoothPointOfHighestCurvature([]);
  }

  /**
   * When a track is dragged or a control point is moved, update the skater's energy (if the sim was paused), since
   * it wouldn't be handled in the update loop.
   * @public
   *
   * @param {Track} track
   */
  trackModified(track) {
    if (this.pausedProperty.value && this.skater.trackProperty.value === track) {
      this.skater.updateEnergy();
    }

    // Flag the track as having changed *this frame* so energy doesn't need to be conserved during this frame, see #127
    this.trackChangePending = true;

    // emit a message indicating that the track has changed in some way
    this.trackChangedEmitter.emit();
  }

  /**
   * Get the number of physical control points (control points attached to a track that the Skater can interact with)
   * @public
   *
   * @returns {number}
   */
  getNumberOfPhysicalControlPoints() {
    const numberOfPointsInEachTrack = _.map(this.getPhysicalTracks(), track => {
      return track.controlPoints.length;
    });
    return _.reduce(numberOfPointsInEachTrack, (memo, num) => memo + num, 0);
  }

  /**
   * Get the number of all control points for this model's tracks (including those that are not physical, like
   * ones in the toolbox)
   * @public
   *
   * @returns {number}
   */
  getNumberOfControlPoints() {
    return this.tracks.reduce((total, track) => total + track.controlPoints.length, 0);
  }

  /**
   * Logic to determine whether a control point can be added by cutting a track's control point in two. This
   * is feasible if the number of control points in the play area above ground is less than maximum number.
   * @public
   *
   * @returns {boolean}
   */
  canCutTrackControlPoint() {
    return this.getNumberOfPhysicalControlPoints() < EnergySkateParkConstants.MAX_NUMBER_CONTROL_POINTS;
  }

  /**
   * Check whether the model contains a track so that input listeners for detached elements can't create bugs.
   * See #230
   * @public
   *
   * @param {Track} track
   * @returns {boolean}
   */
  containsTrack(track) {
    return this.tracks.includes(track);
  }

  /**
   * Called by phet-io to clear out the model state before restoring child tracks.
   * @public (phet-io)
   */
  removeAllTracks() {
    while (this.tracks.length > 0) {
      const track = this.tracks.get(0);
      track.disposeControlPoints();
      this.removeAndDisposeTrack(track);
    }
  }
}

/**
 * Helper function to determine if a point is horizontally contained within the bounds range, and anywhere
 * below the maximum Y value. Visually, this will be above since y is inverted.
 *
 * @param {Bounds2} bounds
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
const containsAbove = (bounds, x, y) => {
  return bounds.minX <= x && x <= bounds.maxX && y <= bounds.maxY;
};
EnergySkateParkModel.EnergySkateParkModelIO = new IOType('EnergySkateParkModelIO', {
  valueType: EnergySkateParkModel,
  documentation: 'The model for the Skate Park.'
});
energySkatePark.register('EnergySkateParkModel', EnergySkateParkModel);
export default EnergySkateParkModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiUmFuZ2UiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJFdmVudFRpbWVyIiwibWVyZ2UiLCJTdG9wd2F0Y2giLCJUaW1lU3BlZWQiLCJQaGV0aW9Hcm91cCIsIlBoZXRpb09iamVjdCIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwiZW5lcmd5U2thdGVQYXJrIiwiRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzIiwiRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzIiwiQ29udHJvbFBvaW50IiwiRGVidWdUcmFja3MiLCJTa2F0ZXIiLCJTa2F0ZXJTdGF0ZSIsIlRyYWNrIiwiVXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldCIsImN1cnZhdHVyZVRlbXAiLCJyIiwieCIsInkiLCJjdXJ2YXR1cmVUZW1wMiIsInRocnVzdCIsIkZSQU1FX1JBVEUiLCJkZWJ1ZyIsImRlYnVnTG9nIiwiYXJncyIsImNvbnNvbGUiLCJsb2ciLCJkZWJ1Z0F0dGFjaERldGFjaCIsIm1vZGVsSXRlcmF0aW9ucyIsIkVuZXJneVNrYXRlUGFya01vZGVsIiwiY29uc3RydWN0b3IiLCJwcmVmZXJlbmNlc01vZGVsIiwidGFuZGVtIiwib3B0aW9ucyIsInBoZXRpb1R5cGUiLCJFbmVyZ3lTa2F0ZVBhcmtNb2RlbElPIiwicGhldGlvU3RhdGUiLCJkZWZhdWx0RnJpY3Rpb24iLCJERUZBVUxUX0ZSSUNUSU9OIiwidHJhY2tzRHJhZ2dhYmxlIiwidHJhY2tzQ29uZmlndXJhYmxlIiwiZGVmYXVsdFNwZWVkVmFsdWVWaXNpYmxlIiwic2thdGVyT3B0aW9ucyIsInRyYWNrQ2hhbmdlZEVtaXR0ZXIiLCJhdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwiQm91bmRzMklPIiwiY29udHJvbFBvaW50R3JvdXAiLCJhc3NlcnQiLCJoYXNPd25Qcm9wZXJ0eSIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwiUGhldGlvR3JvdXBJTyIsIkNvbnRyb2xQb2ludElPIiwicGhldGlvRHluYW1pY0VsZW1lbnROYW1lIiwidHJhY2tHcm91cCIsImNvbnRyb2xQb2ludHMiLCJwYXJlbnRzIiwiXyIsInJhbmdlIiwibWFwIiwibiIsImNyZWF0ZU5leHRFbGVtZW50IiwiZHJhZ2dhYmxlIiwiY29uZmlndXJhYmxlIiwiVHJhY2tJTyIsInRyYWNrQ2hhbmdlUGVuZGluZyIsInBpZUNoYXJ0VmlzaWJsZVByb3BlcnR5IiwiYmFyR3JhcGhWaXNpYmxlUHJvcGVydHkiLCJncmlkVmlzaWJsZVByb3BlcnR5Iiwic3BlZWRvbWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJzcGVlZFZhbHVlVmlzaWJsZVByb3BlcnR5IiwicmVmZXJlbmNlSGVpZ2h0VmlzaWJsZVByb3BlcnR5IiwibWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSIsImJhckdyYXBoU2NhbGVQcm9wZXJ0eSIsImVkaXRCdXR0b25FbmFibGVkUHJvcGVydHkiLCJjbGVhckJ1dHRvbkVuYWJsZWRQcm9wZXJ0eSIsInBhdXNlZFByb3BlcnR5Iiwic3RvcHdhdGNoIiwidGltZVByb3BlcnR5T3B0aW9ucyIsIlpFUk9fVE9fQUxNT1NUX1NJWFRZIiwidGltZVNwZWVkUHJvcGVydHkiLCJOT1JNQUwiLCJ2YWxpZFZhbHVlcyIsIlNMT1ciLCJmcmljdGlvblByb3BlcnR5IiwiTUlOX0ZSSUNUSU9OIiwiTUFYX0ZSSUNUSU9OIiwibWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5IiwidW5pdHMiLCJtZWFzdXJpbmdUYXBlVGlwUG9zaXRpb25Qcm9wZXJ0eSIsInN0aWNraW5nVG9UcmFja1Byb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldCIsInRlc3RUcmFja0luZGV4Iiwic2thdGVyIiwic2thdGVySW5Cb3VuZHNQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvbiIsImF2YWlsYWJsZU1vZGVsQm91bmRzIiwiZ2V0IiwiaGFzTm9uemVyb0FyZWEiLCJjb250YWluc0Fib3ZlIiwicmVzZXRFbWl0dGVyIiwibWFzc1Byb3BlcnR5IiwibGluayIsInZhbHVlIiwidXBkYXRlZEVtaXR0ZXIiLCJlbWl0IiwidHJhY2tzIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJ1cGRhdGVUcmFja0VkaXRpbmdCdXR0b25Qcm9wZXJ0aWVzIiwiZWRpdEVuYWJsZWQiLCJjbGVhckVuYWJsZWQiLCJwaHlzaWNhbFRyYWNrcyIsImdldFBoeXNpY2FsVHJhY2tzIiwiaSIsImxlbmd0aCIsInBoeXNpY2FsVHJhY2siLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJ1cGRhdGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJldmVudFRpbWVyIiwiQ29uc3RhbnRFdmVudE1vZGVsIiwiY29uc3RhbnRTdGVwIiwiYmluZCIsImluaXQiLCJyZXNldCIsIm1hbnVhbFN0ZXAiLCJza2F0ZXJTdGF0ZSIsImR0IiwicmVzdWx0Iiwic3RlcE1vZGVsIiwic2V0VG9Ta2F0ZXIiLCJpbml0aWFsRW5lcmd5IiwiZHJhZ2dpbmdQcm9wZXJ0eSIsImluaXRpYWxUaGVybWFsRW5lcmd5IiwidGhlcm1hbEVuZXJneVByb3BlcnR5IiwiZ2V0VG90YWxFbmVyZ3kiLCJ1cGRhdGVkU3RhdGUiLCJNYXRoIiwiYWJzIiwiaW5pdGlhbFN0YXRlQ29weSIsInJlZG8iLCJmaW5hbFRoZXJtYWxFbmVyZ3kiLCJkZWx0YVRoZXJtYWxFbmVyZ3kiLCJ0cmFja1Byb3BlcnR5IiwidmVsb2NpdHlQcm9wZXJ0eSIsImRpcmVjdGlvblByb3BlcnR5IiwiRGlyZWN0aW9uIiwiUklHSFQiLCJMRUZUIiwic3RlcCIsInN0ZXBHcm91bmQiLCJ4MCIsInBvc2l0aW9uWCIsImZyaWN0aW9uTWFnbml0dWRlIiwiZ2V0U3BlZWQiLCJtYXNzIiwiZ3Jhdml0eSIsImFjY2VsZXJhdGlvbiIsInZlbG9jaXR5WCIsInYxIiwieDEiLCJuZXdQb3NpdGlvbiIsIm9yaWdpbmFsRW5lcmd5IiwidXBkYXRlZCIsInVwZGF0ZVBvc2l0aW9uQW5nbGVVcFZlbG9jaXR5IiwibmV3RW5lcmd5IiwibmV3S2luZXRpY0VuZXJneSIsImdldEtpbmV0aWNFbmVyZ3kiLCJlbmVyZ3lEaWZmZXJlbmNlIiwiYWJzRW5lcmd5RGlmZmVyZW5jZSIsImN1cnJlbnRTcGVlZCIsInNwZWVkSW5FeGNlc3NFbmVyZ3kiLCJzcXJ0IiwibmV3U3BlZWQiLCJjb3JyZWN0ZWRWIiwibmV3VGhlcm1hbEVuZXJneSIsInRoZXJtYWxFbmVyZ3kiLCJ1cGRhdGVUaGVybWFsRW5lcmd5Iiwic3dpdGNoVG9Hcm91bmQiLCJwcm9wb3NlZFBvc2l0aW9uIiwicHJvcG9zZWRWZWxvY2l0eSIsInNlZ21lbnQiLCJkb3QiLCJuZXdQb3RlbnRpYWxFbmVyZ3kiLCJyZWZlcmVuY2VIZWlnaHQiLCJjb3JyZWN0ZWRTdGF0ZSIsImNvcnJlY3RUaGVybWFsRW5lcmd5IiwiZ2V0UG90ZW50aWFsRW5lcmd5IiwicG9zaXRpb25ZIiwiaXNGaW5pdGUiLCJFcnJvciIsIm5ld1ZlbG9jaXR5IiwidGltZXMiLCJ1cGRhdGVQb3NpdGlvbiIsInVwZGF0ZVVEVmVsb2NpdHkiLCJwYXJhbWV0cmljU3BlZWQiLCJlcXVhbHNFcHNpbG9uIiwic3RlcEZyZWVGYWxsIiwianVzdExlZnQiLCJnZXRWZWxvY2l0eSIsInBsdXMiLCJnZXRQb3NpdGlvbiIsIm5ld1NrYXRlclN0YXRlIiwiaW50ZXJhY3RXaXRoVHJhY2tzV2hpbGVGYWxsaW5nIiwidHJhY2siLCJjb250aW51ZUZyZWVGYWxsIiwiZ2V0Q2xvc2VzdFRyYWNrQW5kUG9zaXRpb25BbmRQYXJhbWV0ZXIiLCJjbG9zZXN0VHJhY2siLCJjbG9zZXN0TWF0Y2giLCJjbG9zZXN0RGlzdGFuY2UiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImJlc3RNYXRjaCIsImdldENsb3Nlc3RQb3NpdGlvbkFuZFBhcmFtZXRlciIsImRpc3RhbmNlIiwicGFyYW1ldHJpY1Bvc2l0aW9uIiwicG9pbnQiLCJjcm9zc2VkVHJhY2siLCJjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciIsImJlZm9yZVgiLCJiZWZvcmVZIiwiYWZ0ZXJYIiwiYWZ0ZXJZIiwidHJhY2tQb2ludCIsImlzUGFyYW1ldGVySW5Cb3VuZHMiLCJ1bml0UGFyYWxsZWxWZWN0b3IiLCJnZXRVbml0UGFyYWxsZWxWZWN0b3IiLCJhIiwiYiIsImludGVyc2VjdGlvbiIsImxpbmVTZWdtZW50SW50ZXJzZWN0aW9uIiwiYXZlcmFnZVBvc2l0aW9uIiwiYyIsImluaXRpYWxQb3NpdGlvbiIsImRpc3RhbmNlQSIsImRpc3RUb1NlZ21lbnQiLCJkaXN0YW5jZUIiLCJkaXN0YW5jZUMiLCJkaXN0YW5jZXMiLCJtaW5EaXN0YW5jZSIsIm1pbiIsImluZGV4T2YiLCJjcm9zc2VkIiwibm9ybWFsIiwiZ2V0VW5pdE5vcm1hbFZlY3RvciIsInBlcnBlbmRpY3VsYXIiLCJiZWZvcmVWZWN0b3IiLCJtaW51cyIsIm1hZ25pdHVkZSIsIm1hZ25pdHVkZVNxdWFyZWQiLCJnZXRQb2ludCIsIm5vcm1hbGl6ZWQiLCJvblRvcFNpZGVPZlRyYWNrIiwibWF4UG9pbnQiLCJuZXdWZWxvY2l0eVgiLCJuZXdWZWxvY2l0eVkiLCJ2ZWxvY2l0eURvdHRlZCIsInZlbG9jaXR5WSIsImF0dGFjaGVkU2thdGVyIiwiYXR0YWNoVG9UcmFjayIsInN0cmlrZUdyb3VuZCIsImdldE5ldEZvcmNlV2l0aG91dE5vcm1hbFgiLCJnZXRGcmljdGlvbkZvcmNlWCIsImdldE5ldEZvcmNlV2l0aG91dE5vcm1hbFkiLCJnZXRGcmljdGlvbkZvcmNlWSIsImdldE5vcm1hbEZvcmNlIiwiYW5nbGVDb21wb25lbnQiLCJjb3MiLCJhbmdsZSIsIlBJIiwic2luIiwiZ2V0Q3VydmF0dXJlIiwicmFkaXVzT2ZDdXJ2YXR1cmUiLCJuZXRGb3JjZVJhZGlhbCIsImFkZFhZIiwiY3VydmF0dXJlRGlyZWN0aW9uIiwiZ2V0Q3VydmF0dXJlRGlyZWN0aW9uIiwiaXNOYU4iLCJub3JtYWxGb3JjZSIsImNyZWF0ZVBvbGFyIiwic3RlcEV1bGVyIiwib3JpZ0VuZXJneSIsIm9yaWdMb2NYIiwib3JpZ0xvY1kiLCJuZXRGb3JjZVgiLCJuZXRGb3JjZVkiLCJuZXRGb3JjZU1hZ25pdHVkZSIsIm5ldEZvcmNlQW5nbGUiLCJhdGFuMiIsImdldE1vZGVsQW5nbGVBdCIsImdldFBhcmFtZXRyaWNEaXN0YW5jZSIsIm5ld1BvaW50WCIsImdldFgiLCJuZXdQb2ludFkiLCJnZXRZIiwicGFyYWxsZWxVbml0WCIsInBhcmFsbGVsVW5pdFkiLCJuZXdTdGF0ZSIsInVwZGF0ZVVVRFZlbG9jaXR5UG9zaXRpb24iLCJmcmljdGlvbkZvcmNlWCIsImZyaWN0aW9uRm9yY2VZIiwiZnJpY3Rpb25Gb3JjZU1hZ25pdHVkZSIsIm5ld1BvaW50IiwidGhlcm0iLCJkaXN0YW5jZVhZIiwibmV3VG90YWxFbmVyZ3kiLCJtYXgiLCJzdGVwVHJhY2siLCJjdXJ2YXR1cmVEaXJlY3Rpb25YIiwiZ2V0Q3VydmF0dXJlRGlyZWN0aW9uWCIsImN1cnZhdHVyZURpcmVjdGlvblkiLCJnZXRDdXJ2YXR1cmVEaXJlY3Rpb25ZIiwidW5pdE5vcm1hbFZlY3RvciIsInNpZGVWZWN0b3JYIiwic2lkZVZlY3RvclkiLCJvdXRzaWRlQ2lyY2xlIiwiY2VudHJpcGV0YWxGb3JjZSIsIm5ldEZvcmNlV2l0aG91dE5vcm1hbFgiLCJuZXRGb3JjZVdpdGhvdXROb3JtYWxZIiwibGVhdmVUcmFjayIsImZyZWVTa2F0ZXIiLCJudWRnZWQiLCJudWRnZSIsIm51bURpdmlzaW9ucyIsImNvcnJlY3RFbmVyZ3kiLCJncm91bmRQb3NpdGlvbiIsInNsb3BlVG9Hcm91bmQiLCJhZGp1c3RlZFNwZWVkIiwiZ2V0U3BlZWRGcm9tRW5lcmd5IiwiZnJlZVNrYXRlclN0YXRlIiwidXBkYXRlVHJhY2tVRCIsIm51ZGdlZFN0YXRlIiwiZnJlZUZhbGxTdGF0ZSIsInNpZ24iLCJ2ZWxvY2l0eSIsInVwVmVjdG9yIiwiYmxlbmRlZCIsImJsZW5kIiwicmV2aXNlZFZlbG9jaXR5Iiwib3JpZ1Bvc2l0aW9uIiwiY29ycmVjdEVuZXJneVJlZHVjZVZlbG9jaXR5IiwidGFyZ2V0U3RhdGUiLCJjb3B5IiwiZTAiLCJ1bml0IiwiZHYiLCJzZWFyY2hTcGxpbmVGb3JFbmVyZ3kiLCJ1MCIsInUxIiwibnVtU3RlcHMiLCJkYSIsImJlc3RBbHBoYSIsInAiLCJiZXN0REUiLCJwcm9wb3NlZEFscGhhIiwicDIiLCJlIiwiZEUiLCJjb3JyZWN0ZWRTdGF0ZUEiLCJudW1SZWN1cnNpdmVTZWFyY2hlcyIsInVwZGF0ZVVQb3NpdGlvbiIsImNvcnJlY3RlZFN0YXRlMiIsImluY3JlYXNlZFRoZXJtYWxFbmVyZ3kiLCJyZWR1Y2VkVGhlcm1hbEVuZXJneVN0YXRlIiwib3JpZ2luYWxUaGVybWFsRW5lcmd5U3RhdGUiLCJjb3JyZWN0ZWRTdGF0ZTMiLCJ2U3EiLCJ2IiwidXBkYXRlZFZlbG9jaXR5WCIsInVwZGF0ZWRWZWxvY2l0eVkiLCJmaXhlZFN0YXRlIiwicHJpbnRTdGFja1RyYWNlIiwiY3VydmF0dXJlIiwieDIiLCJ5MiIsInZ4IiwidnkiLCJkcmFnZ2luZyIsInJldHVyblNrYXRlciIsInNrYXRlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInNldCIsIm9yaWdpbmFsVHJhY2tBdmFpbGFibGUiLCJpbmNsdWRlcyIsInN0YXJ0aW5nVHJhY2tQcm9wZXJ0eSIsImNsZWFyVGhlcm1hbCIsInBoeXNpY2FsUHJvcGVydHkiLCJwdXNoIiwiZ2V0Tm9uUGh5c2ljYWxUcmFja3MiLCJmaWx0ZXIiLCJyZW1vdmVBbmREaXNwb3NlVHJhY2siLCJ0cmFja1RvUmVtb3ZlIiwicmVtb3ZlIiwiZGlzcG9zZUVsZW1lbnQiLCJqb2luVHJhY2tzIiwiYXR0YWNoYWJsZSIsImNvbm5lY3RlZFBvaW50IiwiZ2V0U25hcFRhcmdldCIsIm90aGVyVHJhY2siLCJmaW5kIiwiY29udGFpbnNDb250cm9sUG9pbnQiLCJqb2luVHJhY2tUb1RyYWNrIiwiZGVsZXRlQ29udHJvbFBvaW50IiwiY29udHJvbFBvaW50SW5kZXgiLCJyZW1vdmVFbWl0dGVyIiwiY29udHJvbFBvaW50VG9EZWxldGUiLCJwb2ludHMiLCJ3aXRob3V0IiwibmV3VHJhY2siLCJnZXRQYXJlbnRzT3JTZWxmIiwiRlVMTFlfSU5URVJBQ1RJVkVfT1BUSU9OUyIsImRyb3BwZWRQcm9wZXJ0eSIsInNtb290aGluZ1BvaW50Iiwic21vb3RoIiwiYnVtcEFib3ZlR3JvdW5kIiwiYWRkIiwiY29udHJvbFBvaW50Iiwic3BsaXRDb250cm9sUG9pbnQiLCJtb2RlbEFuZ2xlIiwic3BsaXR0YWJsZSIsImNvbnRyb2xQb2ludFRvU3BsaXQiLCJ2ZWN0b3IiLCJuZXdQb2ludDEiLCJzb3VyY2VQb3NpdGlvblByb3BlcnR5IiwibmV3UG9pbnQyIiwicG9pbnRzMSIsInNsaWNlIiwicG9pbnRzMiIsInVuc2hpZnQiLCJuZXdUcmFjazEiLCJuZXdUcmFjazIiLCJnZXROdW1iZXJPZkNvbnRyb2xQb2ludHMiLCJNQVhfTlVNQkVSX0NPTlRST0xfUE9JTlRTIiwiZGlzcG9zZUNvbnRyb2xQb2ludHMiLCJmaXJzdFRyYWNrRm9yd2FyZCIsImZpcnN0VHJhY2tCYWNrd2FyZCIsInNlY29uZFRyYWNrRm9yd2FyZCIsInNlY29uZFRyYWNrQmFja3dhcmQiLCJzbmFwVGFyZ2V0UHJvcGVydHkiLCJjb25jYXQiLCJvcmlnaW5hbERpcmVjdGlvblZlY3RvciIsInBhcmFtZXRyaWNQb3NpdGlvblByb3BlcnR5IiwicGFyYW1ldHJpY1NwZWVkUHJvcGVydHkiLCJvcmlnaW5hbE5vcm1hbCIsImFuZ2xlUHJvcGVydHkiLCJnZXRWaWV3QW5nbGVBdCIsIm9uVG9wU2lkZU9mVHJhY2tQcm9wZXJ0eSIsIm5ld05vcm1hbCIsIm5ld0RpcmVjdGlvblZlY3RvciIsInNtb290aFBvaW50T2ZIaWdoZXN0Q3VydmF0dXJlIiwidHJhY2tNb2RpZmllZCIsInVwZGF0ZUVuZXJneSIsImdldE51bWJlck9mUGh5c2ljYWxDb250cm9sUG9pbnRzIiwibnVtYmVyT2ZQb2ludHNJbkVhY2hUcmFjayIsInJlZHVjZSIsIm1lbW8iLCJudW0iLCJ0b3RhbCIsImNhbkN1dFRyYWNrQ29udHJvbFBvaW50IiwiY29udGFpbnNUcmFjayIsInJlbW92ZUFsbFRyYWNrcyIsImJvdW5kcyIsIm1pblgiLCJtYXhYIiwibWF4WSIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneVNrYXRlUGFya01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgRW5lcmd5IFNrYXRlIFBhcmsgc2ltLCBpbmNsdWRpbmcgbW9kZWwgdmFsdWVzIGZvciB0aGUgdmlldyBzZXR0aW5ncywgc3VjaCBhcyB3aGV0aGVyIHRoZSBncmlkXHJcbiAqIGlzIHZpc2libGUuIEFsbCB1bml0cyBhcmUgaW4gbWtzLlxyXG4gKlxyXG4gKiBUaGUgc3RlcCBmdW5jdGlvbnMgZm9jdXMgb24gbWFraW5nIGNvbXB1dGF0aW9ucyB1cCBmcm9udCBhbmQgYXBwbHlpbmcgY2hhbmdlcyB0byB0aGUgc2thdGVyIGF0IHRoZSBlbmQgb2YgZWFjaFxyXG4gKiBtZXRob2QsIHRvIHNpbXBsaWZ5IHRoZSBsb2dpYyBhbmQgbWFrZSBpdCBjb21tdW5pY2F0ZSB3aXRoIHRoZSBBeG9uK1ZpZXcgYXMgbGl0dGxlIGFzIHBvc3NpYmxlIChmb3IgcGVyZm9ybWFuY2VcclxuICogcmVhc29ucykuXHJcbiAqXHJcbiAqIEZvciBhbiBhbmFseXRpY2FsIG1vZGVsLCBzZWUgaHR0cDovL2RpZ2l0YWxjb21tb25zLmNhbHBvbHkuZWR1L2NnaS92aWV3Y29udGVudC5jZ2k/YXJ0aWNsZT0xMzg3JmNvbnRleHQ9cGh5X2ZhY1xyXG4gKiBDb21wdXRhdGlvbmFsIHByb2JsZW1zIGluIGludHJvZHVjdG9yeSBwaHlzaWNzOiBMZXNzb25zIGZyb20gYSBiZWFkIG9uIGEgd2lyZVxyXG4gKiBUaG9tYXMgSi4gQmVuc2t5IGFuZCBNYXR0aGV3IEouIE1vZWx0ZXJcclxuICpcclxuICogV2UgZXhwZXJpbWVudGVkIHdpdGggdGhlIGFuYWx5dGljYWwgbW9kZWwsIGJ1dCByYW4gaW50byBwcm9ibGVtcyB3aXRoIGRpc2NvbnRpbnVvdXMgdHJhY2tzLCBzZWUgIzE1LCBzbyByZXZlcnRlZCB0b1xyXG4gKiB1c2luZyB0aGUgZXVjbGlkZWFuIG1vZGVsIGZyb20gdGhlIG9yaWdpbmFsIEphdmEgdmVyc2lvbi5cclxuICpcclxuICogUGxlYXNlIG5vdGU6IE1hbnkgbW9kaWZpY2F0aW9ucyB3ZXJlIG1hZGUgdG8gdGhpcyBmaWxlIHRvIHJlZHVjZSBhbGxvY2F0aW9ucyBhbmQgZ2FyYmFnZSBjb2xsZWN0aW9ucyBvbiBpUGFkLFxyXG4gKiBzZWUgIzUwLiAgVGhlIG1haW4gY2hhbmdlcyBpbmNsdWRlZCBwYXNzIGJ5IHJlZmVyZW5jZSwgYW5kIGNvbXBvbmVudC13aXNlIG1hdGguIFBvb2xpbmcgd2FzIGFsc28gdXNlZCBidXQgd2FzXHJcbiAqIGxhdGVyIGRldGVybWluZWQgdG8gbm90IGJlIGVmZmVjdGl2ZSwgc2VlIHBoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrLWJhc2ljcyMyNTIuIFVuZm9ydHVuYXRlbHksIHRoZXNlIGFyZSBvZnRlblxyXG4gKiBjb21wcm9taXNlcyBpbiB0aGUgcmVhZGFiaWxpdHkvbWFpbnRhaW5hYmlsaXR5IG9mIHRoZSBjb2RlLCBidXQgdGhleSBzZWVtZWQgaW1wb3J0YW50IHRvIGF0dGFpbiBnb29kIHBlcmZvcm1hbmNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRXZlbnRUaW1lciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRXZlbnRUaW1lci5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2guanMnO1xyXG5pbXBvcnQgVGltZVNwZWVkIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lU3BlZWQuanMnO1xyXG5pbXBvcnQgUGhldGlvR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0dyb3VwLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lTa2F0ZVBhcmsgZnJvbSAnLi4vLi4vZW5lcmd5U2thdGVQYXJrLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cyBmcm9tICcuLi9FbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0VuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBDb250cm9sUG9pbnQgZnJvbSAnLi9Db250cm9sUG9pbnQuanMnO1xyXG5pbXBvcnQgRGVidWdUcmFja3MgZnJvbSAnLi9EZWJ1Z1RyYWNrcy5qcyc7XHJcbmltcG9ydCBTa2F0ZXIgZnJvbSAnLi9Ta2F0ZXIuanMnO1xyXG5pbXBvcnQgU2thdGVyU3RhdGUgZnJvbSAnLi9Ta2F0ZXJTdGF0ZS5qcyc7XHJcbmltcG9ydCBUcmFjayBmcm9tICcuL1RyYWNrLmpzJztcclxuaW1wb3J0IFVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQgZnJvbSAnLi9Vc2VyQ29udHJvbGxlZFByb3BlcnR5U2V0LmpzJztcclxuXHJcbi8vIFVzZSBhIHNlcGFyYXRlIHBvb2xlZCBjdXJ2YXR1cmUgdmFyaWFibGUgdG8gcmVkdWNlIG1lbW9yeSBhbGxvY2F0aW9ucyAtIG9iamVjdCB2YWx1ZXNcclxuLy8gd2lsbCBiZSBtb2RpZmllZCBhcyB0aGUgc2thdGVyIG1vdmVzXHJcbmNvbnN0IGN1cnZhdHVyZVRlbXAgPSB7IHI6IDEsIHg6IDAsIHk6IDAgfTtcclxuY29uc3QgY3VydmF0dXJlVGVtcDIgPSB7IHI6IDEsIHg6IDAsIHk6IDAgfTtcclxuXHJcbi8vIFRocnVzdCBpcyBub3QgY3VycmVudGx5IGltcGxlbWVudGVkIGluIEVuZXJneSBTa2F0ZSBQYXJrIGJ1dCBtYXkgYmUgdXNlZCBpbiBhIGZ1dHVyZSB2ZXJzaW9uLCBzbyBsZWZ0IGhlcmVcclxuY29uc3QgdGhydXN0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbi8vIGZvciB0aGUgRXZlbnRUaW1lciBhbmQgY29uc2lzdGVudCBzaW0gYmVoYXZpb3IsIHdlIGFzc3VtZSBzaW11bGF0aW9uIHJ1bnMgYXQgNjAgZnJhbWVzIHBlciBzZWNvbmRcclxuY29uc3QgRlJBTUVfUkFURSA9IDYwO1xyXG5cclxuLy8gRmxhZyB0byBlbmFibGUgZGVidWdnaW5nIGZvciBwaHlzaWNzIGlzc3Vlc1xyXG5jb25zdCBkZWJ1ZyA9IEVuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycy5kZWJ1Z0xvZyA/IGZ1bmN0aW9uKCAuLi5hcmdzICkge1xyXG4gIGNvbnNvbGUubG9nKCAuLi5hcmdzICk7XHJcbn0gOiBudWxsO1xyXG5jb25zdCBkZWJ1Z0F0dGFjaERldGFjaCA9IEVuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycy5kZWJ1Z0F0dGFjaERldGFjaCA/IGZ1bmN0aW9uKCAuLi5hcmdzICkge1xyXG4gIGNvbnNvbGUubG9nKCAuLi5hcmdzICk7XHJcbn0gOiBudWxsO1xyXG5cclxuLy8gVHJhY2sgdGhlIG1vZGVsIGl0ZXJhdGlvbnMgdG8gaW1wbGVtZW50IFwic2xvdyBtb3Rpb25cIiBieSBzdGVwcGluZyBldmVyeSBOdGggZnJhbWUsIHNlZSAjMjEwXHJcbmxldCBtb2RlbEl0ZXJhdGlvbnMgPSAwO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKi9cclxuY2xhc3MgRW5lcmd5U2thdGVQYXJrTW9kZWwgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya1ByZWZlcmVuY2VzTW9kZWx9IHByZWZlcmVuY2VzTW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwcmVmZXJlbmNlc01vZGVsLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICBwaGV0aW9UeXBlOiBFbmVyZ3lTa2F0ZVBhcmtNb2RlbC5FbmVyZ3lTa2F0ZVBhcmtNb2RlbElPLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIGluaXRpYWwvZGVmYXVsdCB2YWx1ZSBvZiBmcmljdGlvbiBmb3IgdGhlIG1vZGVsXHJcbiAgICAgIGRlZmF1bHRGcmljdGlvbjogRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLkRFRkFVTFRfRlJJQ1RJT04sXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBpZiB0cnVlLCB0cmFja3MgY2FuIGJlIGRyYWdnZWQgYXJvdW5kIHRoZSBwbGF5IGFyZWFcclxuICAgICAgdHJhY2tzRHJhZ2dhYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGlmIHRydWUsIHRyYWNrIGNvbnRyb2wgcG9pbnRzIGNhbiBiZSBkcmFnZ2VkIGFuZCB0cmFjayBzaGFwZXMgY2FuIGNoYW5nZVxyXG4gICAgICB0cmFja3NDb25maWd1cmFibGU6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gQGJvb2xlYW4gLSBkZWZhdWx0IGZvciB0aGUgc3BlZWRWYWx1ZVZpc2libGVQcm9wZXJ0eSwgd2hldGhlciBvciBub3QgdGhlIHZhbHVlIG9mIHNwZWVkIGlzIGRpc3BsYXllZFxyXG4gICAgICAvLyBvbiB0aGUgc3BlZWRvbWV0ZXJcclxuICAgICAgZGVmYXVsdFNwZWVkVmFsdWVWaXNpYmxlOiB0cnVlLFxyXG5cclxuICAgICAgLy8gcGFzc2VkIHRvIFNrYXRlclxyXG4gICAgICBza2F0ZXJPcHRpb25zOiBudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGVtaXRzIGFuIGV2ZW50IHdoZW5ldmVyIGEgdHJhY2sgY2hhbmdlcyBpbiBzb21lIHdheSAoY29udHJvbCBwb2ludHMgZHJhZ2dlZCwgdHJhY2sgc3BsaXQgYXBhcnQsXHJcbiAgICAvLyB0cmFjayBkcmFnZ2VkLCB0cmFjayBkZWxldGVkIG9yIHNjZW5lIGNoYW5nZWQsIGV0Yy4uLilcclxuICAgIHRoaXMudHJhY2tDaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy50cmFja3NEcmFnZ2FibGUgPSBvcHRpb25zLnRyYWNrc0RyYWdnYWJsZTtcclxuICAgIHRoaXMudHJhY2tzQ29uZmlndXJhYmxlID0gb3B0aW9ucy50cmFja3NDb25maWd1cmFibGU7XHJcbiAgICB0aGlzLmRlZmF1bHRGcmljdGlvbiA9IG9wdGlvbnMuZGVmYXVsdEZyaWN0aW9uO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBXaWxsIGJlIGZpbGxlZCBpbiBieSB0aGUgdmlldywgdXNlZCB0byBwcmV2ZW50IGNvbnRyb2wgcG9pbnRzIGZyb20gbW92aW5nIG91dHNpZGUgdGhlIHZpc2libGUgbW9kZWxcclxuICAgIC8vIGJvdW5kcyB3aGVuIGFkanVzdGVkLCBzZWUgIzE5NVxyXG4gICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm91bmRzMi5Cb3VuZHMySU9cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQaGV0aW9Hcm91cC48Q29udHJvbFBvaW50Pn0gZ3JvdXAgb2YgY29udHJvbCBwb2ludHNcclxuICAgIHRoaXMuY29udHJvbFBvaW50R3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoICggdGFuZGVtLCB4LCB5LCBvcHRpb25zICkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgb3B0aW9ucyAmJiBhc3NlcnQoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAndGFuZGVtJyApLCAndGFuZGVtIGlzIG1hbmFnZWQgYnkgdGhlIFBoZXRpb0dyb3VwJyApO1xyXG4gICAgICByZXR1cm4gbmV3IENvbnRyb2xQb2ludCggeCwgeSwgbWVyZ2UoIHt9LCBvcHRpb25zLCB7IHRhbmRlbTogdGFuZGVtLCBwaGV0aW9EeW5hbWljRWxlbWVudDogdHJ1ZSB9ICkgKTtcclxuICAgIH0sIFsgMCwgMCwge30gXSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUG9pbnRHcm91cCcgKSxcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ29udHJvbFBvaW50LkNvbnRyb2xQb2ludElPICksXHJcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZTogJ2NvbnRyb2xQb2ludCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmsvaXNzdWVzLzEyMyB0aGUgY29udHJvbCBwb2ludCBncm91cCBkb2Vzbid0IGhhdmUgZW5vdWdoIGFyY2hldHlwZXMgdG9cclxuICAgIC8vIFRPRE86IGNyZWF0ZSBhbiBhcmNoZXR5cGUgdHJhY2ssIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktc2thdGUtcGFyay9pc3N1ZXMvMTIzXHJcbiAgICAvLyBAcHVibGljIHtQaGV0aW9Hcm91cC48VHJhY2s+fSBncm91cCBvZiB0cmFja3NcclxuICAgIHRoaXMudHJhY2tHcm91cCA9IG5ldyBQaGV0aW9Hcm91cCggKCB0YW5kZW0sIGNvbnRyb2xQb2ludHMsIHBhcmVudHMsIG9wdGlvbnMgKSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBvcHRpb25zICYmIGFzc2VydCggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICd0YW5kZW0nICksICd0YW5kZW0gaXMgbWFuYWdlZCBieSB0aGUgUGhldGlvR3JvdXAnICk7XHJcbiAgICAgIHJldHVybiBuZXcgVHJhY2soIHRoaXMsIGNvbnRyb2xQb2ludHMsIHBhcmVudHMsIG1lcmdlKCB7fSwgb3B0aW9ucywge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSwgWyBfLnJhbmdlKCAyMCApLm1hcCggbiA9PiB0aGlzLmNvbnRyb2xQb2ludEdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBuICogMTAwLCAwICkgKSwgW10sIHtcclxuICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0gXSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0cmFja0dyb3VwJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBUcmFjay5UcmFja0lPICksXHJcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZTogJ3RyYWNrJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHtib29sZWFufSAtIFRlbXBvcmFyeSBmbGFnIHRoYXQga2VlcHMgdHJhY2sgb2Ygd2hldGhlciB0aGUgdHJhY2sgd2FzIGNoYW5nZWQgaW4gdGhlIHN0ZXAgYmVmb3JlIHRoZSBwaHlzaWNzXHJcbiAgICAvLyB1cGRhdGUuIFRydWUgaWYgdGhlIHNrYXRlcidzIHRyYWNrIGlzIGJlaW5nIGRyYWdnZWQgYnkgdGhlIHVzZXIsIHNvIHRoYXQgZW5lcmd5IGNvbnNlcnZhdGlvbiBubyBsb25nZXIgYXBwbGllcy5cclxuICAgIC8vIE9ubHkgYXBwbGllcyB0byBvbmUgZnJhbWUgYXQgYSB0aW1lIChmb3IgdGhlIGltbWVkaWF0ZSBuZXh0IHVwZGF0ZSkuICBTZWUgIzEyNyBhbmQgIzEzNVxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudHJhY2tDaGFuZ2VQZW5kaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIG1vZGVsIGZvciB2aXNpYmlsaXR5IG9mIHZhcmlvdXMgdmlldyBwYXJhbWV0ZXJzXHJcbiAgICB0aGlzLnBpZUNoYXJ0VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGllQ2hhcnRWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYmFyR3JhcGhWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYXJHcmFwaFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ncmlkVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JpZFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zcGVlZG9tZXRlclZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwZWVkb21ldGVyVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RW5lcmd5U2thdGVQYXJrUHJlZmVyZW5jZXNNb2RlbH0gLSBBIG1vZGVsIGNvbXBvbmVudCBjb250cm9sbGluZyBzaW11bGF0aW9uIHNwZWNpZmljXHJcbiAgICAvLyBwcmVmZXJlbmNlcyBmb3IgdGhlIHNpbS5cclxuICAgIHRoaXMucHJlZmVyZW5jZXNNb2RlbCA9IHByZWZlcmVuY2VzTW9kZWw7XHJcblxyXG4gICAgLy8gd2hldGhlciB0aGUgc3BlZWQgdmFsdWUgaXMgdmlzaWJsZSBvbiB0aGUgc3BlZWRvbWV0ZXJcclxuICAgIHRoaXMuc3BlZWRWYWx1ZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMuZGVmYXVsdFNwZWVkVmFsdWVWaXNpYmxlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwZWVkVmFsdWVWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMucmVmZXJlbmNlSGVpZ2h0VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVmZXJlbmNlSGVpZ2h0VmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm1lYXN1cmluZ1RhcGVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIHNjYWxlIGFwcGxpZWQgdG8gZ3JhcGhzIHRvIGRldGVybWluZSByZWxhdGl2ZSBoZWlnaHQsIG1ha2luZyB0aGlzIGxhcmdlciB3aWxsIFwiem9vbSBvdXRcIlxyXG4gICAgdGhpcy5iYXJHcmFwaFNjYWxlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEgLyAzMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYXJHcmFwaFNjYWxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZW5hYmxlZC9kaXNhYmxlZCBmb3IgdGhlIHRyYWNrIGVkaXRpbmcgYnV0dG9uc1xyXG4gICAgdGhpcy5lZGl0QnV0dG9uRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWRpdEJ1dHRvbkVuYWJsZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jbGVhckJ1dHRvbkVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NsZWFyQnV0dG9uRW5hYmxlZFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hldGhlciB0aGUgc2ltIGlzIHBhdXNlZCBvciBydW5uaW5nXHJcbiAgICB0aGlzLnBhdXNlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGF1c2VkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTdG9wV2F0Y2h9IC0gbW9kZWwgZWxlbWVudCBmb3IgdGhlIHN0b3Agd2F0Y2ggaW4gdGhpcyBzaW1cclxuICAgIHRoaXMuc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCgge1xyXG4gICAgICB0aW1lUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgcmFuZ2U6IFN0b3B3YXRjaC5aRVJPX1RPX0FMTU9TVF9TSVhUWVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdG9wd2F0Y2gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFRpbWVTcGVlZC5OT1JNQUwsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgVGltZVNwZWVkLk5PUk1BTCwgVGltZVNwZWVkLlNMT1cgXSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZVNwZWVkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gQ29lZmZpY2llbnQgb2YgZnJpY3Rpb24gKHVuaXRsZXNzKSBiZXR3ZWVuIHNrYXRlciBhbmQgdHJhY2tcclxuICAgIHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggdGhpcy5kZWZhdWx0RnJpY3Rpb24sIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLk1JTl9GUklDVElPTiwgRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLk1BWF9GUklDVElPTiApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmcmljdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMlByb3BlcnR5fSAtIG1vZGVsIHBvc2l0aW9uIGZvciB0aGUgYmFzZSAgb2YgdGhlIG1lYXN1cmluZyB0YXBlXHJcbiAgICB0aGlzLm1lYXN1cmluZ1RhcGVCYXNlUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ20nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMlByb3BlcnR5fSAtIG1vZGVsIHBvc2l0aW9uIGZvciB0aGUgdGlwIG9mIHRoZSBtZWFzdXJpbmcgdGFwZVxyXG4gICAgdGhpcy5tZWFzdXJpbmdUYXBlVGlwUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAwICksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHNrYXRlciBzaG91bGQgc3RpY2sgdG8gdGhlIHRyYWNrIGxpa2UgYSByb2xsZXIgY29hc3Rlciwgb3IgYmUgYWJsZSB0byBmbHkgb2ZmXHJcbiAgICAvLyBsaWtlIGEgc3RyZWV0XHJcbiAgICB0aGlzLnN0aWNraW5nVG9UcmFja1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdGlja2luZ1RvVHJhY2tQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1VzZXJDb250cm9sbGVkUHJvcGVydHlTZXR9IC0gY29sbGVjdGlvbiBvZiBQcm9wZXJ0aWVzIHRoYXQgaW5kaWNhdGUgdGhhdCBhIHVzZXIgaXNcclxuICAgIC8vIG1vZGlmeWluZyBzb21lIHZhcmlhYmxlIHRoYXQgd2lsbCBjaGFuZ2UgcGh5c2ljYWwgc3lzdGVtIGFuZCBtb2RpZnkgYWxsIHNhdmVkIGVuZXJneSBkYXRhXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQgPSBuZXcgVXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldCgpO1xyXG5cclxuICAgIGlmICggRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzLnRlc3RUcmFja0luZGV4ID4gMCApIHtcclxuICAgICAgdGhpcy5mcmljdGlvblByb3BlcnR5LmRlYnVnKCAnZnJpY3Rpb24nICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U2thdGVyfSAtIHRoZSBza2F0ZXIgbW9kZWwgaW5zdGFuY2VcclxuICAgIHRoaXMuc2thdGVyID0gbmV3IFNrYXRlciggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NrYXRlcicgKSwgb3B0aW9ucy5za2F0ZXJPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RGVyaXZlZFByb3BlcnR5fSAtIERldGVybWluZSBpZiB0aGUgc2thdGVyIGlzIG9uc2NyZWVuIG9yIG9mZnNjcmVlbiBmb3IgcHVycG9zZXMgb2YgaGlnaGxpZ2h0aW5nIHRoZVxyXG4gICAgLy8gJ3JldHVybiBza2F0ZXInIGJ1dHRvbi4gRG9uJ3QgY2hlY2sgd2hldGhlciB0aGUgc2thdGVyIGlzIHVuZGVyZ3JvdW5kIHNpbmNlIHRoYXQgaXMgYSByYXJlIGNhc2UgKG9ubHkgaWYgdGhlXHJcbiAgICAvLyB1c2VyIGlzIGFjdGl2ZWx5IGRyYWdnaW5nIGEgY29udHJvbCBwb2ludCBuZWFyIHk9MCBhbmQgdGhlIHRyYWNrIGN1cnZlcyBiZWxvdykgYW5kIHRoZSBza2F0ZXIgd2lsbCBwb3AgdXBcclxuICAgIC8vIGFnYWluIHNvb24sIHNlZSB0aGUgcmVsYXRlZCBmbGlja2VyaW5nIHByb2JsZW0gaW4gIzIwNlxyXG4gICAgdGhpcy5za2F0ZXJJbkJvdW5kc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnNrYXRlci5wb3NpdGlvblByb3BlcnR5IF0sIHBvc2l0aW9uID0+IHtcclxuICAgICAgY29uc3QgYXZhaWxhYmxlTW9kZWxCb3VuZHMgPSB0aGlzLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGlmICggIWF2YWlsYWJsZU1vZGVsQm91bmRzLmhhc05vbnplcm9BcmVhKCkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGF2YWlsYWJsZU1vZGVsQm91bmRzICYmIGNvbnRhaW5zQWJvdmUoIGF2YWlsYWJsZU1vZGVsQm91bmRzLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHNpZ25pZnkgdGhhdCB0aGUgbW9kZWwgaGFzIHN1Y2Nlc3NmdWxseSBiZWVuIHJlc2V0IHRvIGluaXRpYWwgc3RhdGVcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgbWFzcyBjaGFuZ2VzIHdoaWxlIHRoZSBzaW0gaXMgcGF1c2VkLCB0cmlnZ2VyIGFuIHVwZGF0ZSBzbyB0aGUgc2thdGVyIGltYWdlIHNpemUgd2lsbCB1cGRhdGUsIHNlZSAjMTE1XHJcbiAgICB0aGlzLnNrYXRlci5tYXNzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMucGF1c2VkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5za2F0ZXIudXBkYXRlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy50cmFja3MgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBSZWZlcmVuY2VJTyggVHJhY2suVHJhY2tJTyApICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RyYWNrcycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGVuIHRvIHNob3cvaGlkZSB0aGUgdHJhY2sgZWRpdCBidXR0b25zIChjdXQgdHJhY2sgb3IgZGVsZXRlIGNvbnRyb2wgcG9pbnQpXHJcbiAgICBjb25zdCB1cGRhdGVUcmFja0VkaXRpbmdCdXR0b25Qcm9wZXJ0aWVzID0gKCkgPT4ge1xyXG4gICAgICBsZXQgZWRpdEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IGNsZWFyRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBwaHlzaWNhbFRyYWNrcyA9IHRoaXMuZ2V0UGh5c2ljYWxUcmFja3MoKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGh5c2ljYWxUcmFja3MubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY2xlYXJFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCBwaHlzaWNhbFRyYWNrID0gcGh5c2ljYWxUcmFja3NbIGkgXTtcclxuICAgICAgICBpZiAoIHBoeXNpY2FsVHJhY2suY29udHJvbFBvaW50cy5sZW5ndGggPj0gMyApIHtcclxuICAgICAgICAgIGVkaXRFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5lZGl0QnV0dG9uRW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZWRpdEVuYWJsZWQ7XHJcbiAgICAgIHRoaXMuY2xlYXJCdXR0b25FbmFibGVkUHJvcGVydHkudmFsdWUgPSBjbGVhckVuYWJsZWQ7XHJcbiAgICB9O1xyXG4gICAgdGhpcy50cmFja3MuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIHVwZGF0ZVRyYWNrRWRpdGluZ0J1dHRvblByb3BlcnRpZXMgKTtcclxuICAgIHRoaXMudHJhY2tzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHVwZGF0ZVRyYWNrRWRpdGluZ0J1dHRvblByb3BlcnRpZXMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfSAtIFJlcXVpcmVkIGZvciBQaEVULWlPIHN0YXRlIHdyYXBwZXJcclxuICAgIHRoaXMudXBkYXRlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLnRyYWNrQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZVRyYWNrRWRpdGluZ0J1dHRvblByb3BlcnRpZXMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RXZlbnRUaW1lcn0gLSBVcGRhdGVzIHRoZSBtb2RlbCB3aXRoIGNvbnN0YW50IGV2ZW50IGludGVydmFscyBldmVuIGlmIHRoZXJlIGlzIGEgZHJvcCBpbiB0aGUgZnJhbWVyYXRlXHJcbiAgICAvLyBzbyB0aGF0IHNpbXVsYXRpb24gcGVyZm9ybWFuY2UgaGFzIG5vIGltcGFjdCBvbiBwaHlzaWNhbCBiZWhhdmlvci5cclxuICAgIHRoaXMuZXZlbnRUaW1lciA9IG5ldyBFdmVudFRpbWVyKCBuZXcgRXZlbnRUaW1lci5Db25zdGFudEV2ZW50TW9kZWwoIEZSQU1FX1JBVEUgKSwgdGhpcy5jb25zdGFudFN0ZXAuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgaWYgKCBFbmVyZ3lTa2F0ZVBhcmtRdWVyeVBhcmFtZXRlcnMudGVzdFRyYWNrSW5kZXggPiAwICkge1xyXG4gICAgICBEZWJ1Z1RyYWNrcy5pbml0KCB0aGlzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgbW9kZWwsIGluY2x1ZGluZyBza2F0ZXIsIHRyYWNrcywgdG9vbHMsIGFuZCBVSSB2aXNpYmlsaXR5LCBldGMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgY29uc3QgYXZhaWxhYmxlTW9kZWxCb3VuZHMgPSB0aGlzLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkudmFsdWU7XHJcbiAgICB0aGlzLnBpZUNoYXJ0VmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJhckdyYXBoVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyaWRWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3BlZWRvbWV0ZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmVmZXJlbmNlSGVpZ2h0VmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm1lYXN1cmluZ1RhcGVWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmVkaXRCdXR0b25FbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2xlYXJCdXR0b25FbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYmFyR3JhcGhTY2FsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBhdXNlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZyaWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3RpY2tpbmdUb1RyYWNrUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdG9wd2F0Y2gucmVzZXQoKTtcclxuICAgIHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IGF2YWlsYWJsZU1vZGVsQm91bmRzO1xyXG4gICAgdGhpcy5za2F0ZXIucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIG9uZSBmcmFtZSwgYXNzdW1pbmcgNjAgZnBzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtYW51YWxTdGVwKCkge1xyXG4gICAgY29uc3Qgc2thdGVyU3RhdGUgPSBuZXcgU2thdGVyU3RhdGUoIHRoaXMuc2thdGVyICk7XHJcbiAgICBjb25zdCBkdCA9IDEuMCAvIEZSQU1FX1JBVEU7XHJcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnN0ZXBNb2RlbCggZHQsIHNrYXRlclN0YXRlICk7XHJcbiAgICByZXN1bHQuc2V0VG9Ta2F0ZXIoIHRoaXMuc2thdGVyICk7XHJcbiAgICB0aGlzLnNrYXRlci51cGRhdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25kIHRvIGFuIHVwZGF0ZSBmcm9tIHRoZSBFdmVudFRpbWVyLCBhc3N1bWluZyA2MCBmcmFtZXMgcGVyIHNlY29uZC4gVGhlIHRpbWUgc3RlcCBpcyBzdGFuZGFyZGl6ZWQgc28gdGhhdFxyXG4gICAqIHBsYXkgc3BlZWQgaGFzIG5vIGltcGFjdCBvbiBzaW11bGF0aW9uIGJlaGF2aW9yLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjb25zdGFudFN0ZXAoKSB7XHJcblxyXG4gICAgLy8gVGhpcyBzaW11bGF0aW9uIHVzZXMgYSBmaXhlZCB0aW1lIHN0ZXAgdG8gbWFrZSB0aGUgc2thdGVyJ3MgbW90aW9uIHJlcHJvZHVjaWJsZS5cclxuICAgIGNvbnN0IGR0ID0gMS4wIC8gRlJBTUVfUkFURTtcclxuXHJcbiAgICBsZXQgaW5pdGlhbEVuZXJneSA9IG51bGw7XHJcblxyXG4gICAgLy8gSWYgdGhlIGRlbGF5IG1ha2VzIGR0IHRvbyBoaWdoLCB0aGVuIHRydW5jYXRlIGl0LiAgVGhpcyBoZWxwcyBlLmcuIHdoZW4gY2xpY2tpbmcgaW4gdGhlIGFkZHJlc3MgYmFyIG9uIGlQYWQsXHJcbiAgICAvLyB3aGljaCBnaXZlcyBhIGh1Z2UgZHQgYW5kIHByb2JsZW1zIGZvciBpbnRlZ3JhdGlvblxyXG4gICAgaWYgKCAhdGhpcy5wYXVzZWRQcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy5za2F0ZXIuZHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgIGNvbnN0IGluaXRpYWxUaGVybWFsRW5lcmd5ID0gdGhpcy5za2F0ZXIudGhlcm1hbEVuZXJneVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgY29uc3Qgc2thdGVyU3RhdGUgPSBuZXcgU2thdGVyU3RhdGUoIHRoaXMuc2thdGVyICk7XHJcbiAgICAgIGlmICggZGVidWcgKSB7XHJcbiAgICAgICAgaW5pdGlhbEVuZXJneSA9IHNrYXRlclN0YXRlLmdldFRvdGFsRW5lcmd5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgc2thdGVyIHN0YXRlIGJ5IHJ1bm5pbmcgdGhlIGR5bmFtaWNzIGVuZ2luZVxyXG4gICAgICAvLyBUaGVyZSBhcmUgaXNzdWVzIGluIHJ1bm5pbmcgbXVsdGlwbGUgaXRlcmF0aW9ucyBoZXJlICh0aGUgc2thdGVyIHdvbid0IGF0dGFjaCB0byB0aGUgdHJhY2spLiAgSSBwcmVzdW1lIHNvbWVcclxuICAgICAgLy8gb2YgdGhhdCB3b3JrIGlzIGJlaW5nIGRvbmUgaW4gc2V0VG9Ta2F0ZXIoKSBiZWxvdyBvciBza2F0ZXIudHJpZ2dlcigndXBkYXRlZCcpXHJcbiAgICAgIC8vIEluIGVpdGhlciBjYXNlLCAxMCBzdWJkaXZpc2lvbnMgb24gaVBhZDMgbWFrZXMgdGhlIHNpbSBydW4gdG9vIHNsb3dseSwgc28gd2UgbWF5IGp1c3Qgd2FudCB0byBsZWF2ZSBpdCBhcyBpc1xyXG4gICAgICBsZXQgdXBkYXRlZFN0YXRlID0gbnVsbDtcclxuICAgICAgbW9kZWxJdGVyYXRpb25zKys7XHJcbiAgICAgIGlmICggdGhpcy50aW1lU3BlZWRQcm9wZXJ0eS5nZXQoKSA9PT0gVGltZVNwZWVkLk5PUk1BTCB8fCBtb2RlbEl0ZXJhdGlvbnMgJSAzID09PSAwICkge1xyXG4gICAgICAgIHVwZGF0ZWRTdGF0ZSA9IHRoaXMuc3RlcE1vZGVsKCBkdCwgc2thdGVyU3RhdGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB1cGRhdGVkU3RhdGUgKSB7XHJcbiAgICAgICAgdXBkYXRlZFN0YXRlLnNldFRvU2thdGVyKCB0aGlzLnNrYXRlciApO1xyXG4gICAgICAgIHRoaXMuc2thdGVyLnVwZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAgICAgaWYgKCBkZWJ1ZyApIHtcclxuICAgICAgICAgIGlmICggTWF0aC5hYnMoIHVwZGF0ZWRTdGF0ZS5nZXRUb3RhbEVuZXJneSgpIC0gaW5pdGlhbEVuZXJneSApID4gMUUtNiApIHtcclxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbFN0YXRlQ29weSA9IG5ldyBTa2F0ZXJTdGF0ZSggdGhpcy5za2F0ZXIgKTtcclxuICAgICAgICAgICAgY29uc3QgcmVkbyA9IHRoaXMuc3RlcE1vZGVsKCB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LmdldCgpID09PSBUaW1lU3BlZWQuTk9STUFMID8gZHQgOiBkdCAqIDAuMjUsIGluaXRpYWxTdGF0ZUNvcHkgKTtcclxuICAgICAgICAgICAgZGVidWcgJiYgZGVidWcoIHJlZG8gKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHRoZXJtYWwgZW5lcmd5IGRvZXNuJ3QgZ28gbmVnYXRpdmVcclxuICAgICAgICAgIGNvbnN0IGZpbmFsVGhlcm1hbEVuZXJneSA9IHRoaXMuc2thdGVyLnRoZXJtYWxFbmVyZ3lQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIGNvbnN0IGRlbHRhVGhlcm1hbEVuZXJneSA9IGZpbmFsVGhlcm1hbEVuZXJneSAtIGluaXRpYWxUaGVybWFsRW5lcmd5O1xyXG4gICAgICAgICAgaWYgKCBkZWx0YVRoZXJtYWxFbmVyZ3kgPCAwICkge1xyXG4gICAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggJ3RoZXJtYWwgZW5lcmd5IHdhbnRlZCB0byBkZWNyZWFzZScgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDbGVhciB0aGUgdHJhY2sgY2hhbmdlIHBlbmRpbmcgZmxhZyBmb3IgdGhlIG5leHQgc3RlcFxyXG4gICAgdGhpcy50cmFja0NoYW5nZVBlbmRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBJZiB0cmF2ZWxpbmcgb24gdGhlIGdyb3VuZCwgZmFjZSBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdGlvbiwgc2VlICMxODFcclxuICAgIGlmICggdGhpcy5za2F0ZXIudHJhY2tQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCAmJiB0aGlzLnNrYXRlci5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPT09IDAgKSB7XHJcbiAgICAgIGlmICggdGhpcy5za2F0ZXIudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS54ID4gMCApIHtcclxuICAgICAgICB0aGlzLnNrYXRlci5kaXJlY3Rpb25Qcm9wZXJ0eS52YWx1ZSA9IFNrYXRlci5EaXJlY3Rpb24uUklHSFQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLnNrYXRlci52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLnggPCAwICkge1xyXG4gICAgICAgIHRoaXMuc2thdGVyLmRpcmVjdGlvblByb3BlcnR5LnZhbHVlID0gU2thdGVyLkRpcmVjdGlvbi5MRUZUO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIHNrYXRlciB3YXNuJ3QgbW92aW5nLCBzbyBkb24ndCBjaGFuZ2UgZGlyZWN0aW9uc1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIHRoZSBtb2RlbCAoYXV0b21hdGljYWxseSBjYWxsZWQgYnkgam9pc3QpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5ldmVudFRpbWVyLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgc2thdGVyIG1vdmVzIGFsb25nIHRoZSBncm91bmQgd2l0aCB0aGUgc2FtZSBjb2VmZmljaWVudCBvZiBmcmFjdGlvbiBhcyB0aGUgdHJhY2tzLCBzZWUgIzExLiBSZXR1cm5zIGFcclxuICAgKiBTa2F0ZXJTdGF0ZSB0aGF0IGlzIGFwcGxpZWQgdG8gdGhpcy5za2F0ZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgc3RlcEdyb3VuZCggZHQsIHNrYXRlclN0YXRlICkge1xyXG4gICAgY29uc3QgeDAgPSBza2F0ZXJTdGF0ZS5wb3NpdGlvblg7XHJcbiAgICBjb25zdCBmcmljdGlvbk1hZ25pdHVkZSA9ICggdGhpcy5mcmljdGlvblByb3BlcnR5LnZhbHVlID09PSAwIHx8IHNrYXRlclN0YXRlLmdldFNwZWVkKCkgPCAxRS0yICkgPyAwIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmljdGlvblByb3BlcnR5LnZhbHVlICogc2thdGVyU3RhdGUubWFzcyAqIHNrYXRlclN0YXRlLmdyYXZpdHk7XHJcbiAgICBjb25zdCBhY2NlbGVyYXRpb24gPSBNYXRoLmFicyggZnJpY3Rpb25NYWduaXR1ZGUgKSAqICggc2thdGVyU3RhdGUudmVsb2NpdHlYID4gMCA/IC0xIDogMSApIC8gc2thdGVyU3RhdGUubWFzcztcclxuXHJcbiAgICBsZXQgdjEgPSBza2F0ZXJTdGF0ZS52ZWxvY2l0eVggKyBhY2NlbGVyYXRpb24gKiBkdDtcclxuXHJcbiAgICAvLyBFeHBvbmVudGlhbGx5IGRlY2F5IHRoZSB2ZWxvY2l0eSBpZiBhbHJlYWR5IG5lYXJseSB6ZXJvLCBzZWUgIzEzOFxyXG4gICAgaWYgKCB0aGlzLmZyaWN0aW9uUHJvcGVydHkudmFsdWUgIT09IDAgJiYgc2thdGVyU3RhdGUuZ2V0U3BlZWQoKSA8IDFFLTIgKSB7XHJcbiAgICAgIHYxID0gdjEgLyAyO1xyXG4gICAgfVxyXG4gICAgY29uc3QgeDEgPSB4MCArIHYxICogZHQ7XHJcbiAgICBjb25zdCBuZXdQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCB4MSwgMCApO1xyXG4gICAgY29uc3Qgb3JpZ2luYWxFbmVyZ3kgPSBza2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZWQgPSBza2F0ZXJTdGF0ZS51cGRhdGVQb3NpdGlvbkFuZ2xlVXBWZWxvY2l0eSggbmV3UG9zaXRpb24ueCwgbmV3UG9zaXRpb24ueSwgMCwgdHJ1ZSwgdjEsIDAgKTtcclxuXHJcbiAgICBjb25zdCBuZXdFbmVyZ3kgPSB1cGRhdGVkLmdldFRvdGFsRW5lcmd5KCk7XHJcbiAgICBjb25zdCBuZXdLaW5ldGljRW5lcmd5ID0gdXBkYXRlZC5nZXRLaW5ldGljRW5lcmd5KCk7XHJcblxyXG5cclxuICAgIC8vIENvcnJlY3QgdGhlIGVuZXJneSBzbyB0aGF0IHRvdGFsIGVuZXJneSBkb2VzIG5vdCBjaGFuZ2UgYWZ0ZXIgdGhpcyB1cGRhdGUuIElmIHRoZSBlbmVyZ3kgaGFzIGdvbmUgZG93blxyXG4gICAgLy8gKGVuZXJneURpZmZlcmVuY2UgcG9zaXRpdmUpLCB3ZSBjYW4gYWRkIGVuZXJneURpZmZlcmVuY2UgdG8gdGhlcm1hbCBlbmVyZ3kgd2l0aG91dCBtdWNoIGNvbnNlcXVlbmNlLlxyXG4gICAgLy8gQnV0IGlmIGVuZXJneSBpbmNyZWFzZWQsIHdlIG1heSBlbmQgdXAgd2l0aCBuZWdhdGl2ZSB0aGVybWFsIGVuZXJneSBpZiB3ZSByZW1vdmUgdGhlIGV4Y2VzcyBmcm9tXHJcbiAgICAvLyB0aGVybWFsIGVuZXJneSwgc28gd2UgYXR0ZW1wdCB0byB0YWtlIGl0IG91dCBvZiBraW5ldGljIGVuZXJneSBpbnN0ZWFkLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktc2thdGUtcGFyay9pc3N1ZXMvNDVcclxuICAgIGNvbnN0IGVuZXJneURpZmZlcmVuY2UgPSAoIG9yaWdpbmFsRW5lcmd5IC0gbmV3RW5lcmd5ICk7XHJcbiAgICBjb25zdCBhYnNFbmVyZ3lEaWZmZXJlbmNlID0gTWF0aC5hYnMoIGVuZXJneURpZmZlcmVuY2UgKTtcclxuICAgIGlmICggZW5lcmd5RGlmZmVyZW5jZSA8IDAgJiYgbmV3S2luZXRpY0VuZXJneSA+IGFic0VuZXJneURpZmZlcmVuY2UgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRTcGVlZCA9IE1hdGguYWJzKCB2MSApO1xyXG5cclxuICAgICAgLy8gc2luY2UgS0UgPSAxLzIgKiBtICogdl4yXHJcbiAgICAgIGNvbnN0IHNwZWVkSW5FeGNlc3NFbmVyZ3kgPSBNYXRoLnNxcnQoIDIgKiBNYXRoLmFicyggYWJzRW5lcmd5RGlmZmVyZW5jZSApIC8gdXBkYXRlZC5tYXNzICk7XHJcbiAgICAgIGNvbnN0IG5ld1NwZWVkID0gY3VycmVudFNwZWVkIC0gc3BlZWRJbkV4Y2Vzc0VuZXJneTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbmV3U3BlZWQgPj0gMCwgJ3RyaWVkIHRvIHJlbW92ZSB0b28gbXVjaCBlbmVyZ3kgZnJvbSBraW5ldGljRW5lcmd5LCBjb3JyZWN0IGFub3RoZXIgd2F5JyApO1xyXG5cclxuICAgICAgLy8gcmVzdG9yZSBkaXJlY3Rpb24gdG8gdmVsb2NpdHlcclxuICAgICAgY29uc3QgY29ycmVjdGVkViA9IHYxID49IDAgPyBuZXdTcGVlZCA6IC1uZXdTcGVlZDtcclxuICAgICAgcmV0dXJuIHNrYXRlclN0YXRlLnVwZGF0ZVBvc2l0aW9uQW5nbGVVcFZlbG9jaXR5KCBuZXdQb3NpdGlvbi54LCBuZXdQb3NpdGlvbi55LCAwLCB0cnVlLCBjb3JyZWN0ZWRWLCAwICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgbmV3VGhlcm1hbEVuZXJneSA9IHVwZGF0ZWQudGhlcm1hbEVuZXJneSArIGVuZXJneURpZmZlcmVuY2U7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5ld1RoZXJtYWxFbmVyZ3kgPj0gMCwgJ3RoZXJtYWwgZW5lcmd5IHNob3VsZCBub3QgYmUgbmVnYXRpdmUsIGNvcnJlY3QgZW5lcmd5IGFub3RoZXIgd2F5JyApO1xyXG4gICAgICByZXR1cm4gdXBkYXRlZC51cGRhdGVUaGVybWFsRW5lcmd5KCBuZXdUaGVybWFsRW5lcmd5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2l0aW9uIHRoZSBza2F0ZXIgdG8gdGhlIGdyb3VuZC4gTmV3IHNwZWVkIGZvciB0aGUgc2thdGVyIHdpbGwga2VlcCB4IGNvbXBvbmVudCBvZiBwcm9wb3NlZCB2ZWxvY2l0eSwgYW5kXHJcbiAgICogZW5lcmdpZXMgYXJlIHRoZW4gdXBkYXRlZCBhY2NvcmRpbmdseS4gUmV0dXJucyBhIG5ldyBTa2F0ZXJTdGF0ZSB0byBtb2RpZnkgdGhpcy5za2F0ZXIuXHJcbiAgICpcclxuICAgKiBObyBib3VuY2luZyBvbiB0aGUgZ3JvdW5kLCBidXQgdGhlIGNvZGUgaXMgdmVyeSBzaW1pbGFyIHRvIGF0dGFjaG1lbnQgcGFydCBvZiBpbnRlcmFjdFdpdGhUcmFja3NXaWxlRmFsbGluZy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gc2thdGVyU3RhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbEVuZXJneSAtIGVuZXJneSBwcmlvciB0byB0cmFuc2l0aW9uaW5nIHRvIGdyb3VuZFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcHJvcG9zZWRQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcHJvcG9zZWRWZWxvY2l0eVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIHN3aXRjaFRvR3JvdW5kKCBza2F0ZXJTdGF0ZSwgaW5pdGlhbEVuZXJneSwgcHJvcG9zZWRQb3NpdGlvbiwgcHJvcG9zZWRWZWxvY2l0eSwgZHQgKSB7XHJcbiAgICBjb25zdCBzZWdtZW50ID0gbmV3IFZlY3RvcjIoIDEsIDAgKTtcclxuXHJcbiAgICBsZXQgbmV3U3BlZWQgPSBzZWdtZW50LmRvdCggcHJvcG9zZWRWZWxvY2l0eSApO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBlbmVyZ3kgcGVyZmVjdGx5IGNvbnNlcnZlZCB3aGVuIGZhbGxpbmcgdG8gdGhlIGdyb3VuZC5cclxuICAgIGNvbnN0IG5ld0tpbmV0aWNFbmVyZ3kgPSAwLjUgKiBuZXdTcGVlZCAqIG5ld1NwZWVkICogc2thdGVyU3RhdGUubWFzcztcclxuICAgIGNvbnN0IG5ld1BvdGVudGlhbEVuZXJneSA9ICggLTEgKSAqIHNrYXRlclN0YXRlLm1hc3MgKiBza2F0ZXJTdGF0ZS5ncmF2aXR5ICogKCAwIC0gc2thdGVyU3RhdGUucmVmZXJlbmNlSGVpZ2h0ICk7XHJcblxyXG4gICAgbGV0IG5ld1RoZXJtYWxFbmVyZ3kgPSBpbml0aWFsRW5lcmd5IC0gbmV3S2luZXRpY0VuZXJneSAtIG5ld1BvdGVudGlhbEVuZXJneTtcclxuXHJcbiAgICBpZiAoIG5ld1RoZXJtYWxFbmVyZ3kgPCAwICkge1xyXG4gICAgICBjb25zdCBjb3JyZWN0ZWRTdGF0ZSA9IHRoaXMuY29ycmVjdFRoZXJtYWxFbmVyZ3koIHNrYXRlclN0YXRlLCBzZWdtZW50LCBwcm9wb3NlZFBvc2l0aW9uICk7XHJcblxyXG4gICAgICBuZXdTcGVlZCA9IGNvcnJlY3RlZFN0YXRlLmdldFNwZWVkKCk7XHJcbiAgICAgIG5ld1RoZXJtYWxFbmVyZ3kgPSBjb3JyZWN0ZWRTdGF0ZS50aGVybWFsRW5lcmd5O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN1cHBseSBpbmZvcm1hdGlvbiBhYm91dCBhIHZlcnkgcmFyZSBwcm9ibGVtIHRoYXQgb2NjdXJzIHdoZW4gdGhlcm1hbCBlbmVyZ3kgZ29lcyBuZWdhdGl2ZSxcclxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmsvaXNzdWVzLzQ1XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdUaGVybWFsRW5lcmd5ID49IDAsXHJcbiAgICAgIGAkeydUaGVybWFsIGVuZXJneSBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlOiAnICtcclxuICAgICAgJ3NrYXRlclN0YXRlOiAnfSR7c2thdGVyU3RhdGV9LCBgICtcclxuICAgICAgYG9sZFBvdGVudGlhbEVuZXJneToke3NrYXRlclN0YXRlLmdldFBvdGVudGlhbEVuZXJneSgpfSwgYCArXHJcbiAgICAgIGBza2F0ZXJQb3NpdGlvblk6JHtza2F0ZXJTdGF0ZS5wb3NpdGlvbll9LCBgICtcclxuICAgICAgYGluaXRpYWxFbmVyZ3k6ICR7aW5pdGlhbEVuZXJneX0sIGAgK1xyXG4gICAgICBgcHJvcG9zZWRQb3NpdGlvbjogJHtwcm9wb3NlZFBvc2l0aW9ufSwgYCArXHJcbiAgICAgIGBwcm9wb3NlZFZlbG9jaXR5OiAke3Byb3Bvc2VkVmVsb2NpdHl9LCBgICtcclxuICAgICAgYGR0OiAke2R0fSwgYCArXHJcbiAgICAgIGBuZXdTcGVlZDogJHtuZXdTcGVlZH0sIGAgK1xyXG4gICAgICBgbmV3S2luZXRpY0VuZXJneTogJHtuZXdLaW5ldGljRW5lcmd5fSwgYCArXHJcbiAgICAgIGBuZXdQb3RlbnRpYWxFbmVyZ3k6ICR7bmV3UG90ZW50aWFsRW5lcmd5fSwgYCArXHJcbiAgICAgIGBuZXdUaGVybWFsRW5lcmd5OiAke25ld1RoZXJtYWxFbmVyZ3l9LCBgICtcclxuICAgICAgYHJlZmVyZW5jZUhlaWdodDogJHtza2F0ZXJTdGF0ZS5yZWZlcmVuY2VIZWlnaHR9LCB0cmFja2VkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktc2thdGUtcGFyay9pc3N1ZXMvNDVgICk7XHJcblxyXG4gICAgaWYgKCAhaXNGaW5pdGUoIG5ld1RoZXJtYWxFbmVyZ3kgKSApIHsgdGhyb3cgbmV3IEVycm9yKCAnbm90IGZpbml0ZScgKTsgfVxyXG4gICAgcmV0dXJuIHNrYXRlclN0YXRlLnN3aXRjaFRvR3JvdW5kKCBuZXdUaGVybWFsRW5lcmd5LCBuZXdTcGVlZCwgMCwgcHJvcG9zZWRQb3NpdGlvbi54LCBwcm9wb3NlZFBvc2l0aW9uLnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ubHkgdXNlIHRoaXMgY29ycmVjdGlvbiB3aGVuIHNvbWV0aGluZyBoYXMgZ29uZSB3cm9uZyB3aXRoIHRoZSB0aGVybWFsIGVuZXJneSBjYWxjdWxhdGlvbi4gRm9yIGV4YW1wbGUsIHRoZXJtYWxcclxuICAgKiBlbmVyZ3kgaGFzIGdvbmUgbmVnYXRpdmUuIEF0dGVtcHRzIHRvIGNvcnJlY3QgYnkgdXNpbmcgcHJldmlvdXMgdGhlcm1hbCBlbmVyZ3kgYW5kIGNvbXBlbnNhdGUgbW9kaWZ5aW5nXHJcbiAgICoga2luZXRpYyBlbmVyZ3kuIElmIHRoaXMgcmVzdWx0cyBpbiBuZWdhdGl2ZSBraW5ldGljIGVuZXJneSwgd2UgaGF2ZSB0byBhY2NlcHQgYSBjaGFuZ2UgdG8gdG90YWwgZW5lcmd5LCBidXRcclxuICAgKiB3ZSBtYWtlIHN1cmUgdGhhdCBpdCBpcyB3aXRoaW4gYW4gYWNjZXB0YWJsZSBhbW91bnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBzZWdtZW50XHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIGNvcnJlY3RUaGVybWFsRW5lcmd5KCBza2F0ZXJTdGF0ZSwgc2VnbWVudCwgcHJvcG9zZWRQb3NpdGlvbiApIHtcclxuICAgIGNvbnN0IGluaXRpYWxFbmVyZ3kgPSBza2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpO1xyXG4gICAgY29uc3QgbmV3UG90ZW50aWFsRW5lcmd5ID0gKCAtMSApICogc2thdGVyU3RhdGUubWFzcyAqIHNrYXRlclN0YXRlLmdyYXZpdHkgKiAoIHByb3Bvc2VkUG9zaXRpb24ueSAtIHNrYXRlclN0YXRlLnJlZmVyZW5jZUhlaWdodCApO1xyXG4gICAgY29uc3QgbmV3VGhlcm1hbEVuZXJneSA9IHNrYXRlclN0YXRlLnRoZXJtYWxFbmVyZ3k7XHJcbiAgICBsZXQgbmV3S2luZXRpY0VuZXJneSA9IGluaXRpYWxFbmVyZ3kgLSBuZXdQb3RlbnRpYWxFbmVyZ3kgLSBuZXdUaGVybWFsRW5lcmd5O1xyXG5cclxuICAgIC8vIGlmIG5ld1BvdGVudGlhbEVuZXJneSB+PSBidXQgc2xpZ2h0bHkgbGFyZ2VyIHRoYW4gaW5pdGlhbEVuZXJneSAoc2luY2UgdGhlIHNrYXRlciBtYXkgaGF2ZSBiZWVuIGJ1bXBlZFxyXG4gICAgLy8gdXAgdG8gdGhlIHRyYWNrIGFmdGVyIGNyb3NzaW5nKSB3ZSBtdXN0IGFjY2VwdCB0aGUgaW5jcmVhc2UgaW4gdG90YWwgZW5lcmd5LCBidXQgaXQgc2hvdWxkIGJlIHNtYWxsXHJcbiAgICAvLyBlbm91Z2ggdGhhdCB0aGUgdXNlciBkb2VzIG5vdCBub3RpY2UgaXQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmsvaXNzdWVzLzQ0XHJcbiAgICBpZiAoIG5ld0tpbmV0aWNFbmVyZ3kgPCAwICkge1xyXG4gICAgICBuZXdLaW5ldGljRW5lcmd5ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBrZSA9IDEvMiBtIHYgdlxyXG4gICAgY29uc3QgbmV3U3BlZWQgPSBNYXRoLnNxcnQoIDIgKiBuZXdLaW5ldGljRW5lcmd5IC8gc2thdGVyU3RhdGUubWFzcyApO1xyXG4gICAgY29uc3QgbmV3VmVsb2NpdHkgPSBzZWdtZW50LnRpbWVzKCBuZXdTcGVlZCApO1xyXG5cclxuICAgIGxldCBjb3JyZWN0ZWRTdGF0ZSA9IHNrYXRlclN0YXRlLnVwZGF0ZVRoZXJtYWxFbmVyZ3koIG5ld1RoZXJtYWxFbmVyZ3kgKTtcclxuICAgIGNvcnJlY3RlZFN0YXRlID0gY29ycmVjdGVkU3RhdGUudXBkYXRlUG9zaXRpb24oIHByb3Bvc2VkUG9zaXRpb24ueCwgcHJvcG9zZWRQb3NpdGlvbi55ICk7XHJcbiAgICBjb3JyZWN0ZWRTdGF0ZSA9IGNvcnJlY3RlZFN0YXRlLnVwZGF0ZVVEVmVsb2NpdHkoIGNvcnJlY3RlZFN0YXRlLnBhcmFtZXRyaWNTcGVlZCwgbmV3VmVsb2NpdHkueCwgbmV3VmVsb2NpdHkueSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFV0aWxzLmVxdWFsc0Vwc2lsb24oIGNvcnJlY3RlZFN0YXRlLmdldFRvdGFsRW5lcmd5KCksIHNrYXRlclN0YXRlLmdldFRvdGFsRW5lcmd5KCksIDFFLTggKSwgJ3N1YnN0YW50aWFsIHRvdGFsIGVuZXJneSBjaGFuZ2UgYWZ0ZXIgY29ycmVjdGlvbnMnICk7XHJcblxyXG4gICAgcmV0dXJuIGNvcnJlY3RlZFN0YXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBza2F0ZXIgaW4gZnJlZSBmYWxsLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgdGhlIHRpbWUgdGhhdCBwYXNzZWQsIGluIHNlY29uZHNcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBza2F0ZXJTdGF0ZSB0aGUgb3JpZ2luYWwgc3RhdGUgb2YgdGhlIHNrYXRlclxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0ganVzdExlZnQgdHJ1ZSBpZiB0aGUgc2thdGVyIGp1c3QgZmVsbCBvZmYgb3IgbGF1bmNoZWQgb2ZmIHRoZSB0cmFjazogaW4gdGhpcyBjYXNlIGl0IHNob3VsZCBub3RcclxuICAgKiBpbnRlcmFjdCB3aXRoIHRoZSB0cmFjay5cclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9IHRoZSBuZXcgc3RhdGVcclxuICAgKi9cclxuICBzdGVwRnJlZUZhbGwoIGR0LCBza2F0ZXJTdGF0ZSwganVzdExlZnQgKSB7XHJcbiAgICBjb25zdCBpbml0aWFsRW5lcmd5ID0gc2thdGVyU3RhdGUuZ2V0VG90YWxFbmVyZ3koKTtcclxuXHJcbiAgICBjb25zdCBhY2NlbGVyYXRpb24gPSBuZXcgVmVjdG9yMiggMCwgc2thdGVyU3RhdGUuZ3Jhdml0eSApO1xyXG4gICAgY29uc3QgcHJvcG9zZWRWZWxvY2l0eSA9IHNrYXRlclN0YXRlLmdldFZlbG9jaXR5KCkucGx1cyggYWNjZWxlcmF0aW9uLnRpbWVzKCBkdCApICk7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHNrYXRlclN0YXRlLmdldFBvc2l0aW9uKCk7XHJcbiAgICBjb25zdCBwcm9wb3NlZFBvc2l0aW9uID0gcG9zaXRpb24ucGx1cyggcHJvcG9zZWRWZWxvY2l0eS50aW1lcyggZHQgKSApO1xyXG5cclxuICAgIC8vIG9ubHkgZG8gdGhlIHdvcmsgdG8gY2hlY2sgZm9yIGludGVyYWN0aW9ucyBpZiB0aGVyZSBpcyBzb21lIHByb3Bvc2VkIGNoYW5nZSB0byBwb3NpdGlvblxyXG4gICAgaWYgKCBwb3NpdGlvbi54ICE9PSBwcm9wb3NlZFBvc2l0aW9uLnggfHwgcG9zaXRpb24ueSAhPT0gcHJvcG9zZWRQb3NpdGlvbi55ICkge1xyXG5cclxuICAgICAgLy8gc2VlIGlmIGl0IGNyb3NzZWQgdGhlIHRyYWNrXHJcbiAgICAgIGNvbnN0IHBoeXNpY2FsVHJhY2tzID0gdGhpcy5nZXRQaHlzaWNhbFRyYWNrcygpO1xyXG5cclxuICAgICAgLy8gRG9uJ3QgaW50ZXJhY3Qgd2l0aCB0aGUgdHJhY2sgaWYgdGhlIHNrYXRlciBqdXN0IGxlZnQgdGhlIHRyYWNrIGluIHRoaXMgc2FtZSBmcmFtZSwgc2VlICMxNDJcclxuICAgICAgaWYgKCBwaHlzaWNhbFRyYWNrcy5sZW5ndGggJiYgIWp1c3RMZWZ0ICkge1xyXG5cclxuICAgICAgICAvLyBhdCBoaWdoIGZyZWVmYWxsIHZlbG9jaXR5IHRoZSBza2F0ZXIgbWF5IGNyb3NzIGEgdHJhY2sgQU5EIHRoZSBwcm9wb3NlZFBvc2l0aW9uIG1heSBiZSBiZWxvdyBncm91bmQgaW4gdGhlXHJcbiAgICAgICAgLy8gc2FtZSBzdGVwIC0gaW4gdGhpcyBjYXNlIHByZWZlciBzd2l0Y2hpbmcgdG8gdHJhY2sgKGJlY2F1c2UgdHJhY2tzIGFyZSBhYm92ZSBncm91bmQpIGJ5IG9ubHkgc3dpdGNoaW5nIHRvXHJcbiAgICAgICAgLy8gZ3JvdW5kIGlmIGludGVyYWN0V2l0aFRyYWNrc1doaWxlRmFsbGluZyBwcm9kdWNlcyBhIGBudWxsYCB0cmFjaywgc2VlICMxNTlcclxuICAgICAgICBjb25zdCBuZXdTa2F0ZXJTdGF0ZSA9IHRoaXMuaW50ZXJhY3RXaXRoVHJhY2tzV2hpbGVGYWxsaW5nKCBwaHlzaWNhbFRyYWNrcywgc2thdGVyU3RhdGUsIHByb3Bvc2VkUG9zaXRpb24sIGluaXRpYWxFbmVyZ3ksIGR0LCBwcm9wb3NlZFZlbG9jaXR5ICk7XHJcbiAgICAgICAgaWYgKCBwcm9wb3NlZFBvc2l0aW9uLnkgPCAwICYmIG5ld1NrYXRlclN0YXRlLnRyYWNrID09PSBudWxsICkge1xyXG4gICAgICAgICAgcHJvcG9zZWRQb3NpdGlvbi55ID0gMDtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnN3aXRjaFRvR3JvdW5kKCBza2F0ZXJTdGF0ZSwgaW5pdGlhbEVuZXJneSwgcHJvcG9zZWRQb3NpdGlvbiwgcHJvcG9zZWRWZWxvY2l0eSwgZHQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gbmV3U2thdGVyU3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRpbnVlRnJlZUZhbGwoIHNrYXRlclN0YXRlLCBpbml0aWFsRW5lcmd5LCBwcm9wb3NlZFBvc2l0aW9uLCBwcm9wb3NlZFZlbG9jaXR5LCBkdCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHNrYXRlclN0YXRlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCB0aGUgY2xvc2VzdCB0cmFjayB0byB0aGUgc2thdGVyLCB0byBzZWUgd2hhdCBoZSBjYW4gYm91bmNlIG9mZiBvciBhdHRhY2ggdG8sIGFuZCByZXR1cm4gdGhlIGNsb3Nlc3QgcG9pbnRcclxuICAgKiB0aGF0IHRoZSB0cmFjayB0b29rLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtUcmFja1tdfSBwaHlzaWNhbFRyYWNrc1xyXG4gICAqIEByZXR1cm5zIHtPYmplY3R8bnVsbH0gLSBjb2xsZWN0aW9uIG9mIHsgdHJhY2s6IHtUcmFja30sIHBhcmFtZXRyaWNQb3NpdGlvbjoge1ZlY3RvcjJ9LCBwb2ludDoge1ZlY3RvcjJ9IH0sIG9yIG51bGxcclxuICAgKi9cclxuICBnZXRDbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciggcG9zaXRpb24sIHBoeXNpY2FsVHJhY2tzICkge1xyXG4gICAgbGV0IGNsb3Nlc3RUcmFjayA9IG51bGw7XHJcbiAgICBsZXQgY2xvc2VzdE1hdGNoID0gbnVsbDtcclxuICAgIGxldCBjbG9zZXN0RGlzdGFuY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwaHlzaWNhbFRyYWNrcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdHJhY2sgPSBwaHlzaWNhbFRyYWNrc1sgaSBdO1xyXG5cclxuICAgICAgLy8gUEVSRk9STUFOQ0UvQUxMT0NBVElPTiBtYXliZSBnZXQgY2xvc2VzdCBwb2ludCBzaG91bGRuJ3QgcmV0dXJuIGEgbmV3IG9iamVjdCBhbGxvY2F0aW9uIGVhY2ggdGltZSwgb3IgdXNlXHJcbiAgICAgIC8vIHBvb2xpbmcgZm9yIGl0LCBvciBwYXNzIGluIHJlZmVyZW5jZSBhcyBhbiBhcmc/XHJcbiAgICAgIGNvbnN0IGJlc3RNYXRjaCA9IHRyYWNrLmdldENsb3Nlc3RQb3NpdGlvbkFuZFBhcmFtZXRlciggcG9zaXRpb24gKTtcclxuICAgICAgaWYgKCBiZXN0TWF0Y2guZGlzdGFuY2UgPCBjbG9zZXN0RGlzdGFuY2UgKSB7XHJcbiAgICAgICAgY2xvc2VzdERpc3RhbmNlID0gYmVzdE1hdGNoLmRpc3RhbmNlO1xyXG4gICAgICAgIGNsb3Nlc3RUcmFjayA9IHRyYWNrO1xyXG4gICAgICAgIGNsb3Nlc3RNYXRjaCA9IGJlc3RNYXRjaDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCBjbG9zZXN0VHJhY2sgKSB7XHJcbiAgICAgIHJldHVybiB7IHRyYWNrOiBjbG9zZXN0VHJhY2ssIHBhcmFtZXRyaWNQb3NpdGlvbjogY2xvc2VzdE1hdGNoLnBhcmFtZXRyaWNQb3NpdGlvbiwgcG9pbnQ6IGNsb3Nlc3RNYXRjaC5wb2ludCB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBwb2ludHMgY3Jvc3NlZCB0aGUgdHJhY2suXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciAtIHRoZSBvYmplY3QgcmV0dXJuZWQgYnkgZ2V0Q2xvc2VzdFRyYWNrQW5kUG9zaXRpb25BbmRQYXJhbWV0ZXIoKVxyXG4gICAqIEBwYXJhbSB7VHJhY2tbXX0gcGh5c2ljYWxUcmFja3MgLSBhbGwgdHJhY2tzIHRoYXQgdGhlIHNrYXRlciBjYW4gcGh5c2ljYWxseSBpbnRlcmFjdCB3aXRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJlZm9yZVhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmVmb3JlWVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhZnRlclhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYWZ0ZXJZXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY3Jvc3NlZFRyYWNrKCBjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciwgcGh5c2ljYWxUcmFja3MsIGJlZm9yZVgsIGJlZm9yZVksIGFmdGVyWCwgYWZ0ZXJZICkge1xyXG4gICAgY29uc3QgdHJhY2sgPSBjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlci50cmFjaztcclxuICAgIGNvbnN0IHBhcmFtZXRyaWNQb3NpdGlvbiA9IGNsb3Nlc3RUcmFja0FuZFBvc2l0aW9uQW5kUGFyYW1ldGVyLnBhcmFtZXRyaWNQb3NpdGlvbjtcclxuICAgIGNvbnN0IHRyYWNrUG9pbnQgPSBjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlci5wb2ludDtcclxuXHJcbiAgICBpZiAoICF0cmFjay5pc1BhcmFtZXRlckluQm91bmRzKCBwYXJhbWV0cmljUG9zaXRpb24gKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBMaW5lYXJpemUgdGhlIHNwbGluZSwgYW5kIGNoZWNrIHRvIHNlZSBpZiB0aGUgc2thdGVyIGNyb3NzZWQgYnkgcGVyZm9ybWluZyBhIGxpbmUgc2VnbWVudCBpbnRlcnNlY3Rpb24gYmV0d2VlblxyXG4gICAgICAvLyB0aGUgc2thdGVyJ3MgdHJhamVjdG9yeSBzZWdtZW50IGFuZCB0aGUgbGluZWFyaXplZCB0cmFjayBzZWdtZW50LlxyXG4gICAgICAvLyBOb3RlLCB0aGlzIGhhcyBhbiBlcnJvciBmb3IgY3VzcHMsIHNlZSAjMjEyXHJcbiAgICAgIGNvbnN0IHVuaXRQYXJhbGxlbFZlY3RvciA9IHRyYWNrLmdldFVuaXRQYXJhbGxlbFZlY3RvciggcGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICAgIGNvbnN0IGEgPSB0cmFja1BvaW50LnBsdXMoIHVuaXRQYXJhbGxlbFZlY3Rvci50aW1lcyggMTAwICkgKTtcclxuICAgICAgY29uc3QgYiA9IHRyYWNrUG9pbnQucGx1cyggdW5pdFBhcmFsbGVsVmVjdG9yLnRpbWVzKCAtMTAwICkgKTtcclxuICAgICAgY29uc3QgaW50ZXJzZWN0aW9uID0gVXRpbHMubGluZVNlZ21lbnRJbnRlcnNlY3Rpb24oIGEueCwgYS55LCBiLngsIGIueSwgYmVmb3JlWCwgYmVmb3JlWSwgYWZ0ZXJYLCBhZnRlclkgKTtcclxuICAgICAgcmV0dXJuIGludGVyc2VjdGlvbiAhPT0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHRvIHNlZSBpZiBza2F0ZXIgc2hvdWxkIGhpdCBvciBhdHRhY2ggdG8gIHRyYWNrIGR1cmluZyBmcmVlIGZhbGwuIFJldHVybnMgYSBuZXcgU2thdGVyU3RhdGUgZm9yIHRoaXMuc2thdGVyXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VHJhY2tbXX0gcGh5c2ljYWxUcmFja3NcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBza2F0ZXJTdGF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcHJvcG9zZWRQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsRW5lcmd5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwcm9wb3NlZFZlbG9jaXR5XHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIGludGVyYWN0V2l0aFRyYWNrc1doaWxlRmFsbGluZyggcGh5c2ljYWxUcmFja3MsIHNrYXRlclN0YXRlLCBwcm9wb3NlZFBvc2l0aW9uLCBpbml0aWFsRW5lcmd5LCBkdCwgcHJvcG9zZWRWZWxvY2l0eSApIHtcclxuXHJcbiAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IHRyYWNrLCBhbmQgc2VlIGlmIHRoZSBza2F0ZXIgd291bGQgY3Jvc3MgaXQgaW4gdGhpcyB0aW1lIHN0ZXAuXHJcbiAgICAvLyBBc3N1bWluZyB0aGUgc2thdGVyJ3MgaW5pdGlhbCArIGZpbmFsIHBvc2l0aW9ucyBkZXRlcm1pbmUgYSBsaW5lIHNlZ21lbnQsIHdlIHNlYXJjaCBmb3IgdGhlIGJlc3QgcG9pbnQgZm9yIHRoZVxyXG4gICAgLy8gc2thdGVyJ3Mgc3RhcnQgcG9pbnQsIG1pZHBvaW50IGFuZCBlbmQgcG9pbnQgYW5kIGNob29zZSB3aGljaGV2ZXIgaXMgY2xvc2VzdC4gIFRoaXMgaGVscHMgYXZvaWQgXCJoaWdoIGN1cnZhdHVyZVwiXHJcbiAgICAvLyBwcm9ibGVtcyBsaWtlIHRoZSBvbmUgaWRlbnRpZmllZCBpbiAjMjEyXHJcbiAgICBjb25zdCBhID0gdGhpcy5nZXRDbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciggc2thdGVyU3RhdGUuZ2V0UG9zaXRpb24oKSwgcGh5c2ljYWxUcmFja3MgKTtcclxuICAgIGNvbnN0IGF2ZXJhZ2VQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAoIHNrYXRlclN0YXRlLnBvc2l0aW9uWCArIHByb3Bvc2VkUG9zaXRpb24ueCApIC8gMiwgKCBza2F0ZXJTdGF0ZS5wb3NpdGlvblkgKyBwcm9wb3NlZFBvc2l0aW9uLnkgKSAvIDIgKTtcclxuICAgIGNvbnN0IGIgPSB0aGlzLmdldENsb3Nlc3RUcmFja0FuZFBvc2l0aW9uQW5kUGFyYW1ldGVyKCBhdmVyYWdlUG9zaXRpb24sIHBoeXNpY2FsVHJhY2tzICk7XHJcbiAgICBjb25zdCBjID0gdGhpcy5nZXRDbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciggbmV3IFZlY3RvcjIoIHByb3Bvc2VkUG9zaXRpb24ueCwgcHJvcG9zZWRQb3NpdGlvbi55ICksIHBoeXNpY2FsVHJhY2tzICk7XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbFBvc2l0aW9uID0gc2thdGVyU3RhdGUuZ2V0UG9zaXRpb24oKTtcclxuICAgIGNvbnN0IGRpc3RhbmNlQSA9IFV0aWxzLmRpc3RUb1NlZ21lbnQoIGEucG9pbnQsIGluaXRpYWxQb3NpdGlvbiwgcHJvcG9zZWRQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgZGlzdGFuY2VCID0gVXRpbHMuZGlzdFRvU2VnbWVudCggYi5wb2ludCwgaW5pdGlhbFBvc2l0aW9uLCBwcm9wb3NlZFBvc2l0aW9uICk7XHJcbiAgICBjb25zdCBkaXN0YW5jZUMgPSBVdGlscy5kaXN0VG9TZWdtZW50KCBjLnBvaW50LCBpbml0aWFsUG9zaXRpb24sIHByb3Bvc2VkUG9zaXRpb24gKTtcclxuXHJcbiAgICBjb25zdCBkaXN0YW5jZXMgPSBbIGRpc3RhbmNlQSwgZGlzdGFuY2VCLCBkaXN0YW5jZUMgXTtcclxuICAgIGNvbnN0IG1pbkRpc3RhbmNlID0gXy5taW4oIGRpc3RhbmNlcyApO1xyXG5cclxuICAgIGNvbnN0IGNsb3Nlc3RUcmFja0FuZFBvc2l0aW9uQW5kUGFyYW1ldGVyID0gbWluRGlzdGFuY2UgPT09IGRpc3RhbmNlQSA/IGEgOiBtaW5EaXN0YW5jZSA9PT0gZGlzdGFuY2VDID8gYyA6IGI7XHJcblxyXG4gICAgZGVidWdBdHRhY2hEZXRhY2ggJiYgZGVidWdBdHRhY2hEZXRhY2goICdtaW5EaXN0YW5jZScsIGRpc3RhbmNlcy5pbmRleE9mKCBtaW5EaXN0YW5jZSApICk7XHJcblxyXG4gICAgY29uc3QgY3Jvc3NlZCA9IHRoaXMuY3Jvc3NlZFRyYWNrKCBjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlciwgcGh5c2ljYWxUcmFja3MsXHJcbiAgICAgIHNrYXRlclN0YXRlLnBvc2l0aW9uWCwgc2thdGVyU3RhdGUucG9zaXRpb25ZLCBwcm9wb3NlZFBvc2l0aW9uLngsIHByb3Bvc2VkUG9zaXRpb24ueSApO1xyXG5cclxuICAgIGNvbnN0IHRyYWNrID0gY2xvc2VzdFRyYWNrQW5kUG9zaXRpb25BbmRQYXJhbWV0ZXIudHJhY2s7XHJcbiAgICBjb25zdCBwYXJhbWV0cmljUG9zaXRpb24gPSBjbG9zZXN0VHJhY2tBbmRQb3NpdGlvbkFuZFBhcmFtZXRlci5wYXJhbWV0cmljUG9zaXRpb247XHJcbiAgICBjb25zdCB0cmFja1BvaW50ID0gY2xvc2VzdFRyYWNrQW5kUG9zaXRpb25BbmRQYXJhbWV0ZXIucG9pbnQ7XHJcblxyXG4gICAgaWYgKCBjcm9zc2VkICkge1xyXG4gICAgICBkZWJ1Z0F0dGFjaERldGFjaCAmJiBkZWJ1Z0F0dGFjaERldGFjaCggJ2F0dGFjaGluZycgKTtcclxuICAgICAgY29uc3Qgbm9ybWFsID0gdHJhY2suZ2V0VW5pdE5vcm1hbFZlY3RvciggcGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSBub3JtYWwucGVycGVuZGljdWxhcjtcclxuXHJcbiAgICAgIGNvbnN0IGJlZm9yZVZlY3RvciA9IHNrYXRlclN0YXRlLmdldFBvc2l0aW9uKCkubWludXMoIHRyYWNrUG9pbnQgKTtcclxuXHJcbiAgICAgIC8vIElmIGNyb3NzZWQgdGhlIHRyYWNrLCBhdHRhY2ggdG8gaXQuXHJcbiAgICAgIGxldCBuZXdWZWxvY2l0eSA9IHNlZ21lbnQudGltZXMoIHNlZ21lbnQuZG90KCBwcm9wb3NlZFZlbG9jaXR5ICkgKTtcclxuICAgICAgbGV0IG5ld1NwZWVkID0gbmV3VmVsb2NpdHkubWFnbml0dWRlO1xyXG4gICAgICBjb25zdCBuZXdLaW5ldGljRW5lcmd5ID0gMC41ICogc2thdGVyU3RhdGUubWFzcyAqIG5ld1ZlbG9jaXR5Lm1hZ25pdHVkZVNxdWFyZWQ7XHJcbiAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gdHJhY2suZ2V0UG9pbnQoIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgICBjb25zdCBuZXdQb3RlbnRpYWxFbmVyZ3kgPSAtc2thdGVyU3RhdGUubWFzcyAqIHNrYXRlclN0YXRlLmdyYXZpdHkgKiAoIG5ld1Bvc2l0aW9uLnkgLSBza2F0ZXJTdGF0ZS5yZWZlcmVuY2VIZWlnaHQgKTtcclxuICAgICAgbGV0IG5ld1RoZXJtYWxFbmVyZ3kgPSBpbml0aWFsRW5lcmd5IC0gbmV3S2luZXRpY0VuZXJneSAtIG5ld1BvdGVudGlhbEVuZXJneTtcclxuXHJcbiAgICAgIC8vIFNvbWV0aW1lcyAoZGVwZW5kaW5nIG9uIGR0KSB0aGUgdGhlcm1hbCBlbmVyZ3kgY2FuIGdvIG5lZ2F0aXZlIGJ5IHRoZSBhYm92ZSBjYWxjdWxhdGlvbiwgc2VlICMxNDFcclxuICAgICAgLy8gSW4gdGhhdCBjYXNlLCBzZXQgdGhlIHRoZXJtYWwgZW5lcmd5IHRvIHplcm8gYW5kIHJlZHVjZSB0aGUgc3BlZWQgdG8gY29tcGVuc2F0ZS5cclxuICAgICAgaWYgKCBuZXdUaGVybWFsRW5lcmd5IDwgc2thdGVyU3RhdGUudGhlcm1hbEVuZXJneSApIHtcclxuICAgICAgICBjb25zdCBjb3JyZWN0ZWRTdGF0ZSA9IHRoaXMuY29ycmVjdFRoZXJtYWxFbmVyZ3koIHNrYXRlclN0YXRlLCBzZWdtZW50LCBuZXdQb3NpdGlvbiApO1xyXG5cclxuICAgICAgICBuZXdUaGVybWFsRW5lcmd5ID0gY29ycmVjdGVkU3RhdGUudGhlcm1hbEVuZXJneTtcclxuICAgICAgICBuZXdTcGVlZCA9IGNvcnJlY3RlZFN0YXRlLmdldFNwZWVkKCk7XHJcbiAgICAgICAgbmV3VmVsb2NpdHkgPSBjb3JyZWN0ZWRTdGF0ZS5nZXRWZWxvY2l0eSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkb3QgPSBwcm9wb3NlZFZlbG9jaXR5Lm5vcm1hbGl6ZWQoKS5kb3QoIHNlZ21lbnQgKTtcclxuXHJcbiAgICAgIC8vIFNhbml0eSB0ZXN0XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBkb3QgKSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbmV3VmVsb2NpdHkueCApICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBuZXdWZWxvY2l0eS55ICkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIG5ld1RoZXJtYWxFbmVyZ3kgKSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdUaGVybWFsRW5lcmd5ID49IDAgKTtcclxuXHJcbiAgICAgIGxldCBwYXJhbWV0cmljU3BlZWQgPSAoIGRvdCA+IDAgPyArMSA6IC0xICkgKiBuZXdTcGVlZDtcclxuICAgICAgY29uc3Qgb25Ub3BTaWRlT2ZUcmFjayA9IGJlZm9yZVZlY3Rvci5kb3QoIG5vcm1hbCApID4gMDtcclxuXHJcbiAgICAgIGRlYnVnICYmIGRlYnVnKCBgYXR0YWNoIHRvIHRyYWNrLCAke3BhcmFtZXRyaWNQb3NpdGlvbn0sICR7dHJhY2subWF4UG9pbnR9YCApO1xyXG5cclxuICAgICAgLy8gRG91YmxlIGNoZWNrIHRoZSB2ZWxvY2l0aWVzIGFuZCBpbnZlcnQgcGFyYW1ldHJpY1NwZWVkIGlmIGluY29ycmVjdCwgc2VlICMxNzJcclxuICAgICAgLy8gQ29tcHV0ZSB0aGUgbmV3IHZlbG9jaXRpZXMgc2FtZSBhcyBpbiBzdGVwVHJhY2tcclxuICAgICAgY29uc3QgdW5pdFBhcmFsbGVsVmVjdG9yID0gdHJhY2suZ2V0VW5pdFBhcmFsbGVsVmVjdG9yKCBwYXJhbWV0cmljUG9zaXRpb24gKTtcclxuICAgICAgY29uc3QgbmV3VmVsb2NpdHlYID0gdW5pdFBhcmFsbGVsVmVjdG9yLnggKiBwYXJhbWV0cmljU3BlZWQ7XHJcbiAgICAgIGNvbnN0IG5ld1ZlbG9jaXR5WSA9IHVuaXRQYXJhbGxlbFZlY3Rvci55ICogcGFyYW1ldHJpY1NwZWVkO1xyXG5cclxuICAgICAgY29uc3QgdmVsb2NpdHlEb3R0ZWQgPSBza2F0ZXJTdGF0ZS52ZWxvY2l0eVggKiBuZXdWZWxvY2l0eVggKyBza2F0ZXJTdGF0ZS52ZWxvY2l0eVkgKiBuZXdWZWxvY2l0eVk7XHJcblxyXG4gICAgICAvLyBTZWUgaWYgdGhlIHRyYWNrIGF0dGFjaG1lbnQgd2lsbCBjYXVzZSB2ZWxvY2l0eSB0byBmbGlwLCBhbmQgaW52ZXJzZSBpdCBpZiBzbywgc2VlICMxNzJcclxuICAgICAgaWYgKCB2ZWxvY2l0eURvdHRlZCA8IC0xRS02ICkge1xyXG4gICAgICAgIHBhcmFtZXRyaWNTcGVlZCA9IHBhcmFtZXRyaWNTcGVlZCAqIC0xO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhdHRhY2hlZFNrYXRlciA9IHNrYXRlclN0YXRlLmF0dGFjaFRvVHJhY2soIG5ld1RoZXJtYWxFbmVyZ3ksIHRyYWNrLCBvblRvcFNpZGVPZlRyYWNrLCBwYXJhbWV0cmljUG9zaXRpb24sIHBhcmFtZXRyaWNTcGVlZCwgbmV3VmVsb2NpdHkueCwgbmV3VmVsb2NpdHkueSwgbmV3UG9zaXRpb24ueCwgbmV3UG9zaXRpb24ueSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVdGlscy5lcXVhbHNFcHNpbG9uKCBhdHRhY2hlZFNrYXRlci5nZXRUb3RhbEVuZXJneSgpLCBza2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICksICdsYXJnZSBlbmVyZ3kgY2hhbmdlIGFmdGVyIGF0dGFjaGluZyB0byB0cmFjaycgKTtcclxuICAgICAgcmV0dXJuIGF0dGFjaGVkU2thdGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEl0IGp1c3QgY29udGludWVkIGluIGZyZWUgZmFsbFxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbnRpbnVlRnJlZUZhbGwoIHNrYXRlclN0YXRlLCBpbml0aWFsRW5lcmd5LCBwcm9wb3NlZFBvc2l0aW9uLCBwcm9wb3NlZFZlbG9jaXR5LCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnRlZCBpbiBmcmVlIGZhbGwgYW5kIGRpZCBub3QgaW50ZXJhY3Qgd2l0aCBhIHRyYWNrLiBSZXR1cm5zIGEgbmV3IFNrYXRlclN0YXRlIGZvciB0aGlzLnNrYXRlci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gc2thdGVyU3RhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbEVuZXJneVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcHJvcG9zZWRQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcHJvcG9zZWRWZWxvY2l0eVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIGNvbnRpbnVlRnJlZUZhbGwoIHNrYXRlclN0YXRlLCBpbml0aWFsRW5lcmd5LCBwcm9wb3NlZFBvc2l0aW9uLCBwcm9wb3NlZFZlbG9jaXR5LCBkdCApIHtcclxuXHJcbiAgICAvLyBtYWtlIHVwIGZvciB0aGUgZGlmZmVyZW5jZSBieSBjaGFuZ2luZyB0aGUgeSB2YWx1ZVxyXG4gICAgY29uc3QgeSA9ICggaW5pdGlhbEVuZXJneSAtIDAuNSAqIHNrYXRlclN0YXRlLm1hc3MgKiBwcm9wb3NlZFZlbG9jaXR5Lm1hZ25pdHVkZVNxdWFyZWQgLSBza2F0ZXJTdGF0ZS50aGVybWFsRW5lcmd5ICkgLyAoIC0xICogc2thdGVyU3RhdGUubWFzcyAqIHNrYXRlclN0YXRlLmdyYXZpdHkgKSArIHNrYXRlclN0YXRlLnJlZmVyZW5jZUhlaWdodDtcclxuICAgIGlmICggeSA8PSAwICkge1xyXG5cclxuICAgICAgLy8gV2hlbiBmYWxsaW5nIHN0cmFpZ2h0IGRvd24sIHN0b3AgY29tcGxldGVseSBhbmQgY29udmVydCBhbGwgZW5lcmd5IGtpbmV0aWMgdG8gdGhlcm1hbFxyXG4gICAgICByZXR1cm4gc2thdGVyU3RhdGUuc3RyaWtlR3JvdW5kKCBza2F0ZXJTdGF0ZS5nZXRLaW5ldGljRW5lcmd5KCksIHByb3Bvc2VkUG9zaXRpb24ueCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBza2F0ZXJTdGF0ZS5jb250aW51ZUZyZWVGYWxsKCBwcm9wb3NlZFZlbG9jaXR5LngsIHByb3Bvc2VkVmVsb2NpdHkueSwgcHJvcG9zZWRQb3NpdGlvbi54LCB5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBuZXQgZm9yY2UgZGlzY2x1ZGluZyBub3JtYWwgZm9yY2UuXHJcbiAgICpcclxuICAgKiBTcGxpdCBpbnRvIGNvbXBvbmVudC13aXNlIHRvIHByZXZlbnQgYWxsb2NhdGlvbnMsIHNlZSAjNTBcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBza2F0ZXJTdGF0ZSB0aGUgc3RhdGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBuZXRGb3JjZSBpbiB0aGUgWCBkaXJlY3Rpb25cclxuICAgKi9cclxuICBnZXROZXRGb3JjZVdpdGhvdXROb3JtYWxYKCBza2F0ZXJTdGF0ZSApIHtcclxuICAgIHJldHVybiB0aGlzLmdldEZyaWN0aW9uRm9yY2VYKCBza2F0ZXJTdGF0ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbmV0IGZvcmNlIGJ1dCB3aXRob3V0IHRoZSBub3JtYWwgZm9yY2UuXHJcbiAgICpcclxuICAgKiBTcGxpdCBpbnRvIGNvbXBvbmVudC13aXNlIHRvIHByZXZlbnQgYWxsb2NhdGlvbnMsIHNlZSAjNTBcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gc2thdGVyU3RhdGUgdGhlIHN0YXRlXHJcbiAgICogQHJldHVybnMge251bWJlcn0gbmV0Rm9yY2UgaW4gdGhlIFkgZGlyZWN0aW9uXHJcbiAgICovXHJcbiAgZ2V0TmV0Rm9yY2VXaXRob3V0Tm9ybWFsWSggc2thdGVyU3RhdGUgKSB7XHJcbiAgICByZXR1cm4gc2thdGVyU3RhdGUubWFzcyAqIHNrYXRlclN0YXRlLmdyYXZpdHkgKyB0aGlzLmdldEZyaWN0aW9uRm9yY2VZKCBza2F0ZXJTdGF0ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIG9ubHkgb3RoZXIgZm9yY2Ugb24gdGhlIG9iamVjdCBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdGlvbiBpcyB0aGUgZ3Jhdml0eSBmb3JjZVxyXG4gICAqIENvbXBvbmVudC13aXNlIHRvIHJlZHVjZSBhbGxvY2F0aW9ucywgc2VlICM1MFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBza2F0ZXJTdGF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRGcmljdGlvbkZvcmNlWCggc2thdGVyU3RhdGUgKSB7XHJcblxyXG4gICAgLy8gRnJpY3Rpb24gZm9yY2Ugc2hvdWxkIG5vdCBleGNlZWQgc3VtIG9mIG90aGVyIGZvcmNlcyAoaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24pLCBvdGhlcndpc2UgdGhlIGZyaWN0aW9uIGNvdWxkXHJcbiAgICAvLyBzdGFydCBhIHN0b3BwZWQgb2JqZWN0IG1vdmluZy4gSGVuY2Ugd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBvYmplY3QgaXMgYWxyZWFkeSBzdG9wcGVkIGFuZCBkb24ndCBhZGQgZnJpY3Rpb25cclxuICAgIC8vIGluIHRoYXQgY2FzZVxyXG4gICAgaWYgKCB0aGlzLmZyaWN0aW9uUHJvcGVydHkudmFsdWUgPT09IDAgfHwgc2thdGVyU3RhdGUuZ2V0U3BlZWQoKSA8IDFFLTIgKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IG1hZ25pdHVkZSA9IHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eS52YWx1ZSAqIHRoaXMuZ2V0Tm9ybWFsRm9yY2UoIHNrYXRlclN0YXRlICkubWFnbml0dWRlO1xyXG4gICAgICBjb25zdCBhbmdsZUNvbXBvbmVudCA9IE1hdGguY29zKCBza2F0ZXJTdGF0ZS5nZXRWZWxvY2l0eSgpLmFuZ2xlICsgTWF0aC5QSSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbWFnbml0dWRlICksICdtYWduaXR1ZGUgc2hvdWxkIGJlIGZpbml0ZScgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGFuZ2xlQ29tcG9uZW50ICksICdhbmdsZUNvbXBvbmVudCBzaG91bGQgYmUgZmluaXRlJyApO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlICogYW5nbGVDb21wb25lbnQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgb25seSBvdGhlciBmb3JjZSBvbiB0aGUgb2JqZWN0IGluIHRoZSBkaXJlY3Rpb24gb2YgbW90aW9uIGlzIHRoZSBncmF2aXR5IGZvcmNlXHJcbiAgICogQ29tcG9uZW50LXdpc2UgdG8gcmVkdWNlIGFsbG9jYXRpb25zLCBzZWUgIzUwXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRGcmljdGlvbkZvcmNlWSggc2thdGVyU3RhdGUgKSB7XHJcblxyXG4gICAgLy8gRnJpY3Rpb24gZm9yY2Ugc2hvdWxkIG5vdCBleGNlZWQgc3VtIG9mIG90aGVyIGZvcmNlcyAoaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24pLCBvdGhlcndpc2UgdGhlIGZyaWN0aW9uIGNvdWxkXHJcbiAgICAvLyBzdGFydCBhIHN0b3BwZWQgb2JqZWN0IG1vdmluZy4gIEhlbmNlIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgb2JqZWN0IGlzIGFscmVhZHkgc3RvcHBlZCBhbmQgZG9uJ3QgYWRkIGZyaWN0aW9uIGluXHJcbiAgICAvLyB0aGF0IGNhc2VcclxuICAgIGlmICggdGhpcy5mcmljdGlvblByb3BlcnR5LnZhbHVlID09PSAwIHx8IHNrYXRlclN0YXRlLmdldFNwZWVkKCkgPCAxRS0yICkge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCBtYWduaXR1ZGUgPSB0aGlzLmZyaWN0aW9uUHJvcGVydHkudmFsdWUgKiB0aGlzLmdldE5vcm1hbEZvcmNlKCBza2F0ZXJTdGF0ZSApLm1hZ25pdHVkZTtcclxuICAgICAgcmV0dXJuIG1hZ25pdHVkZSAqIE1hdGguc2luKCBza2F0ZXJTdGF0ZS5nZXRWZWxvY2l0eSgpLmFuZ2xlICsgTWF0aC5QSSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBub3JtYWwgZm9yY2UgKE5ld3RvbnMpIG9uIHRoZSBza2F0ZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXROb3JtYWxGb3JjZSggc2thdGVyU3RhdGUgKSB7XHJcbiAgICBza2F0ZXJTdGF0ZS5nZXRDdXJ2YXR1cmUoIGN1cnZhdHVyZVRlbXAyICk7XHJcbiAgICBjb25zdCByYWRpdXNPZkN1cnZhdHVyZSA9IE1hdGgubWluKCBjdXJ2YXR1cmVUZW1wMi5yLCAxMDAwMDAgKTtcclxuICAgIGNvbnN0IG5ldEZvcmNlUmFkaWFsID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICBuZXRGb3JjZVJhZGlhbC5hZGRYWSggMCwgc2thdGVyU3RhdGUubWFzcyAqIHNrYXRlclN0YXRlLmdyYXZpdHkgKTsvLyBncmF2aXR5XHJcbiAgICBsZXQgY3VydmF0dXJlRGlyZWN0aW9uID0gdGhpcy5nZXRDdXJ2YXR1cmVEaXJlY3Rpb24oIGN1cnZhdHVyZVRlbXAyLCBza2F0ZXJTdGF0ZS5wb3NpdGlvblgsIHNrYXRlclN0YXRlLnBvc2l0aW9uWSApO1xyXG5cclxuICAgIC8vIE9uIGEgZmxhdCBzdXJmYWNlLCBqdXN0IHVzZSB0aGUgcmFkaWFsIGNvbXBvbmVudCBvZiB0aGUgbmV0IGZvcmNlIGZvciB0aGUgbm9ybWFsLCBzZWUgIzM0NFxyXG4gICAgaWYgKCBpc05hTiggY3VydmF0dXJlRGlyZWN0aW9uLnggKSB8fCBpc05hTiggY3VydmF0dXJlRGlyZWN0aW9uLnkgKSApIHtcclxuICAgICAgY3VydmF0dXJlRGlyZWN0aW9uID0gbmV0Rm9yY2VSYWRpYWwubm9ybWFsaXplZCgpO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgbm9ybWFsRm9yY2UgPSBza2F0ZXJTdGF0ZS5tYXNzICogc2thdGVyU3RhdGUuZ2V0U3BlZWQoKSAqIHNrYXRlclN0YXRlLmdldFNwZWVkKCkgLyBNYXRoLmFicyggcmFkaXVzT2ZDdXJ2YXR1cmUgKSAtIG5ldEZvcmNlUmFkaWFsLmRvdCggY3VydmF0dXJlRGlyZWN0aW9uICk7XHJcbiAgICBkZWJ1ZyAmJiBkZWJ1Zyggbm9ybWFsRm9yY2UgKTtcclxuXHJcbiAgICBjb25zdCBuID0gVmVjdG9yMi5jcmVhdGVQb2xhciggbm9ybWFsRm9yY2UsIGN1cnZhdHVyZURpcmVjdGlvbi5hbmdsZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIG4ueCApLCAnbi54IHNob3VsZCBiZSBmaW5pdGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbi55ICksICduLnkgc2hvdWxkIGJlIGZpbml0ZScgKTtcclxuICAgIHJldHVybiBuO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXNlIGFuIEV1bGVyIGludGVncmF0aW9uIHN0ZXAgdG8gbW92ZSB0aGUgc2thdGVyIGFsb25nIHRoZSB0cmFjay4gVGhpcyBjb2RlIGlzIGluIGFuIGlubmVyIGxvb3Agb2YgdGhlIG1vZGVsXHJcbiAgICogcGh5c2ljcywgYW5kIGhhcyBiZWVuIGhlYXZpbHkgb3B0aW1pemVkLiBSZXR1cm5zIGEgbmV3IFNrYXRlclN0YXRlIGZvciB0aGlzLnNrYXRlci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gc2thdGVyU3RhdGVcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgc3RlcEV1bGVyKCBkdCwgc2thdGVyU3RhdGUgKSB7XHJcbiAgICBjb25zdCB0cmFjayA9IHNrYXRlclN0YXRlLnRyYWNrO1xyXG4gICAgY29uc3Qgb3JpZ0VuZXJneSA9IHNrYXRlclN0YXRlLmdldFRvdGFsRW5lcmd5KCk7XHJcbiAgICBjb25zdCBvcmlnTG9jWCA9IHNrYXRlclN0YXRlLnBvc2l0aW9uWDtcclxuICAgIGNvbnN0IG9yaWdMb2NZID0gc2thdGVyU3RhdGUucG9zaXRpb25ZO1xyXG4gICAgbGV0IHRoZXJtYWxFbmVyZ3kgPSBza2F0ZXJTdGF0ZS50aGVybWFsRW5lcmd5O1xyXG4gICAgbGV0IHBhcmFtZXRyaWNTcGVlZCA9IHNrYXRlclN0YXRlLnBhcmFtZXRyaWNTcGVlZDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBwYXJhbWV0cmljU3BlZWQgKSApO1xyXG4gICAgbGV0IHBhcmFtZXRyaWNQb3NpdGlvbiA9IHNrYXRlclN0YXRlLnBhcmFtZXRyaWNQb3NpdGlvbjtcclxuXHJcbiAgICAvLyBDb21wb25lbnQtd2lzZSBtYXRoIHRvIHByZXZlbnQgYWxsb2NhdGlvbnMsIHNlZSAjNTBcclxuICAgIGNvbnN0IG5ldEZvcmNlWCA9IHRoaXMuZ2V0TmV0Rm9yY2VXaXRob3V0Tm9ybWFsWCggc2thdGVyU3RhdGUgKTtcclxuICAgIGNvbnN0IG5ldEZvcmNlWSA9IHRoaXMuZ2V0TmV0Rm9yY2VXaXRob3V0Tm9ybWFsWSggc2thdGVyU3RhdGUgKTtcclxuICAgIGNvbnN0IG5ldEZvcmNlTWFnbml0dWRlID0gTWF0aC5zcXJ0KCBuZXRGb3JjZVggKiBuZXRGb3JjZVggKyBuZXRGb3JjZVkgKiBuZXRGb3JjZVkgKTtcclxuICAgIGNvbnN0IG5ldEZvcmNlQW5nbGUgPSBNYXRoLmF0YW4yKCBuZXRGb3JjZVksIG5ldEZvcmNlWCApO1xyXG5cclxuICAgIC8vIEdldCB0aGUgbmV0IGZvcmNlIGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHRyYWNrLiAgRG90IHByb2R1Y3QgaXMgYSAqIGIgKiBjb3ModGhldGEpXHJcbiAgICBjb25zdCBhID0gbmV0Rm9yY2VNYWduaXR1ZGUgKiBNYXRoLmNvcyggc2thdGVyU3RhdGUudHJhY2suZ2V0TW9kZWxBbmdsZUF0KCBwYXJhbWV0cmljUG9zaXRpb24gKSAtIG5ldEZvcmNlQW5nbGUgKSAvIHNrYXRlclN0YXRlLm1hc3M7XHJcblxyXG4gICAgcGFyYW1ldHJpY1NwZWVkICs9IGEgKiBkdDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBwYXJhbWV0cmljU3BlZWQgKSwgJ3BhcmFtZXRyaWNTcGVlZCBzaG91bGQgYmUgZmluaXRlJyApO1xyXG4gICAgcGFyYW1ldHJpY1Bvc2l0aW9uICs9IHRyYWNrLmdldFBhcmFtZXRyaWNEaXN0YW5jZSggcGFyYW1ldHJpY1Bvc2l0aW9uLCBwYXJhbWV0cmljU3BlZWQgKiBkdCArIDEgLyAyICogYSAqIGR0ICogZHQgKTtcclxuICAgIGNvbnN0IG5ld1BvaW50WCA9IHNrYXRlclN0YXRlLnRyYWNrLmdldFgoIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgbmV3UG9pbnRZID0gc2thdGVyU3RhdGUudHJhY2suZ2V0WSggcGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICBjb25zdCB1bml0UGFyYWxsZWxWZWN0b3IgPSBza2F0ZXJTdGF0ZS50cmFjay5nZXRVbml0UGFyYWxsZWxWZWN0b3IoIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgcGFyYWxsZWxVbml0WCA9IHVuaXRQYXJhbGxlbFZlY3Rvci54O1xyXG4gICAgY29uc3QgcGFyYWxsZWxVbml0WSA9IHVuaXRQYXJhbGxlbFZlY3Rvci55O1xyXG4gICAgbGV0IG5ld1ZlbG9jaXR5WCA9IHBhcmFsbGVsVW5pdFggKiBwYXJhbWV0cmljU3BlZWQ7XHJcbiAgICBsZXQgbmV3VmVsb2NpdHlZID0gcGFyYWxsZWxVbml0WSAqIHBhcmFtZXRyaWNTcGVlZDtcclxuXHJcbiAgICAvLyBFeHBvbmVudGlhbGx5IGRlY2F5IHRoZSB2ZWxvY2l0eSBpZiBhbHJlYWR5IG5lYXJseSB6ZXJvIGFuZCBvbiBhIGZsYXQgc2xvcGUsIHNlZSAjMTI5XHJcbiAgICBpZiAoIHBhcmFsbGVsVW5pdFggLyBwYXJhbGxlbFVuaXRZID4gNSAmJiBNYXRoLnNxcnQoIG5ld1ZlbG9jaXR5WCAqIG5ld1ZlbG9jaXR5WCArIG5ld1ZlbG9jaXR5WSAqIG5ld1ZlbG9jaXR5WSApIDwgMUUtMiApIHtcclxuICAgICAgbmV3VmVsb2NpdHlYIC89IDI7XHJcbiAgICAgIG5ld1ZlbG9jaXR5WSAvPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNob29zZSB2ZWxvY2l0eSBieSB1c2luZyB0aGUgdW5pdCBwYXJhbGxlbCB2ZWN0b3IgdG8gdGhlIHRyYWNrXHJcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHNrYXRlclN0YXRlLnVwZGF0ZVVVRFZlbG9jaXR5UG9zaXRpb24oIHBhcmFtZXRyaWNQb3NpdGlvbiwgcGFyYW1ldHJpY1NwZWVkLCBuZXdWZWxvY2l0eVgsIG5ld1ZlbG9jaXR5WSwgbmV3UG9pbnRYLCBuZXdQb2ludFkgKTtcclxuICAgIGlmICggdGhpcy5mcmljdGlvblByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuXHJcbiAgICAgIC8vIENvbXB1dGUgZnJpY3Rpb24gZm9yY2UgbWFnbml0dWRlIGNvbXBvbmVudC13aXNlIHRvIHByZXZlbnQgYWxsb2NhdGlvbnMsIHNlZSAjNTBcclxuICAgICAgY29uc3QgZnJpY3Rpb25Gb3JjZVggPSB0aGlzLmdldEZyaWN0aW9uRm9yY2VYKCBza2F0ZXJTdGF0ZSApO1xyXG4gICAgICBjb25zdCBmcmljdGlvbkZvcmNlWSA9IHRoaXMuZ2V0RnJpY3Rpb25Gb3JjZVkoIHNrYXRlclN0YXRlICk7XHJcbiAgICAgIGNvbnN0IGZyaWN0aW9uRm9yY2VNYWduaXR1ZGUgPSBNYXRoLnNxcnQoIGZyaWN0aW9uRm9yY2VYICogZnJpY3Rpb25Gb3JjZVggKyBmcmljdGlvbkZvcmNlWSAqIGZyaWN0aW9uRm9yY2VZICk7XHJcblxyXG4gICAgICBjb25zdCBuZXdQb2ludCA9IG5ldyBWZWN0b3IyKCBuZXdQb2ludFgsIG5ld1BvaW50WSApO1xyXG5cclxuICAgICAgY29uc3QgdGhlcm0gPSBmcmljdGlvbkZvcmNlTWFnbml0dWRlICogbmV3UG9pbnQuZGlzdGFuY2VYWSggb3JpZ0xvY1gsIG9yaWdMb2NZICk7XHJcbiAgICAgIHRoZXJtYWxFbmVyZ3kgKz0gdGhlcm07XHJcblxyXG4gICAgICBjb25zdCBuZXdUb3RhbEVuZXJneSA9IG5ld1N0YXRlLmdldFRvdGFsRW5lcmd5KCkgKyB0aGVybTtcclxuXHJcbiAgICAgIC8vIENvbnNlcnZlIGVuZXJneSwgYnV0IG9ubHkgaWYgdGhlIHVzZXIgaXMgbm90IGFkZGluZyBlbmVyZ3ksIHNlZSAjMTM1XHJcbiAgICAgIGlmICggdGhydXN0Lm1hZ25pdHVkZSA9PT0gMCAmJiAhdGhpcy50cmFja0NoYW5nZVBlbmRpbmcgKSB7XHJcbiAgICAgICAgaWYgKCBuZXdUb3RhbEVuZXJneSA8IG9yaWdFbmVyZ3kgKSB7XHJcbiAgICAgICAgICB0aGVybWFsRW5lcmd5ICs9IE1hdGguYWJzKCBuZXdUb3RhbEVuZXJneSAtIG9yaWdFbmVyZ3kgKTsvLyBhZGQgc29tZSB0aGVybWFsIHRvIGV4YWN0bHkgbWF0Y2hcclxuICAgICAgICAgIGlmICggTWF0aC5hYnMoIG5ld1RvdGFsRW5lcmd5IC0gb3JpZ0VuZXJneSApID4gMUUtNiApIHtcclxuICAgICAgICAgICAgZGVidWcgJiYgZGVidWcoIGBBZGRlZCB0aGVybWFsLCBkRT0ke25ld1N0YXRlLmdldFRvdGFsRW5lcmd5KCkgLSBvcmlnRW5lcmd5fWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBuZXdUb3RhbEVuZXJneSA+IG9yaWdFbmVyZ3kgKSB7XHJcbiAgICAgICAgICBpZiAoIE1hdGguYWJzKCBuZXdUb3RhbEVuZXJneSAtIG9yaWdFbmVyZ3kgKSA8IHRoZXJtICkge1xyXG4gICAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggJ2dhaW5lZCBlbmVyZ3ksIHJlbW92aW5nIHRoZXJtYWwgKFdvdWxkIGhhdmUgdG8gcmVtb3ZlIG1vcmUgdGhhbiB3ZSBnYWluZWQpJyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoZXJtYWxFbmVyZ3kgLT0gTWF0aC5hYnMoIG5ld1RvdGFsRW5lcmd5IC0gb3JpZ0VuZXJneSApO1xyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBuZXdUb3RhbEVuZXJneSAtIG9yaWdFbmVyZ3kgKSA+IDFFLTYgKSB7XHJcbiAgICAgICAgICAgICAgZGVidWcgJiYgZGVidWcoIGBSZW1vdmVkIHRoZXJtYWwsIGRFPSR7bmV3VG90YWxFbmVyZ3kgLSBvcmlnRW5lcmd5fWAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzY3JlcGFuY3kgd2l0aCBvcmlnaW5hbCB2ZXJzaW9uOiBvcmlnaW5hbCB2ZXJzaW9uIGFsbG93ZWQgZHJvcCBvZiB0aGVybWFsIGVuZXJneSBoZXJlLCB0byBiZSBmaXhlZCBpbiB0aGVcclxuICAgICAgLy8gaGV1cmlzdGljIHBhdGNoLiBXZSBoYXZlIGNsYW1wZWQgaXQgaGVyZSB0byBtYWtlIGl0IGFtZW5hYmxlIHRvIGEgc21hbGxlciBudW1iZXIgb2YgZXVsZXIgdXBkYXRlcyxcclxuICAgICAgLy8gdG8gaW1wcm92ZSBwZXJmb3JtYW5jZVxyXG4gICAgICByZXR1cm4gbmV3U3RhdGUudXBkYXRlVGhlcm1hbEVuZXJneSggTWF0aC5tYXgoIHRoZXJtYWxFbmVyZ3ksIHNrYXRlclN0YXRlLnRoZXJtYWxFbmVyZ3kgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgc2thdGVyIGFzIGl0IG1vdmVzIGFsb25nIHRoZSB0cmFjaywgYW5kIGZseSBvZmYgdGhlIHRyYWNrIGlmIGl0ICBnb2VzIG92ZXIgYSBqdW1wIG9mZiB0aGUgdHJhY2sncyBlbmQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIHN0ZXBUcmFjayggZHQsIHNrYXRlclN0YXRlICkge1xyXG5cclxuICAgIHNrYXRlclN0YXRlLmdldEN1cnZhdHVyZSggY3VydmF0dXJlVGVtcCApO1xyXG5cclxuICAgIGNvbnN0IGN1cnZhdHVyZURpcmVjdGlvblggPSB0aGlzLmdldEN1cnZhdHVyZURpcmVjdGlvblgoIGN1cnZhdHVyZVRlbXAsIHNrYXRlclN0YXRlLnBvc2l0aW9uWCwgc2thdGVyU3RhdGUucG9zaXRpb25ZICk7XHJcbiAgICBjb25zdCBjdXJ2YXR1cmVEaXJlY3Rpb25ZID0gdGhpcy5nZXRDdXJ2YXR1cmVEaXJlY3Rpb25ZKCBjdXJ2YXR1cmVUZW1wLCBza2F0ZXJTdGF0ZS5wb3NpdGlvblgsIHNrYXRlclN0YXRlLnBvc2l0aW9uWSApO1xyXG5cclxuICAgIGNvbnN0IHRyYWNrID0gc2thdGVyU3RhdGUudHJhY2s7XHJcblxyXG4gICAgY29uc3QgdW5pdE5vcm1hbFZlY3RvciA9IHRyYWNrLmdldFVuaXROb3JtYWxWZWN0b3IoIHNrYXRlclN0YXRlLnBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgY29uc3Qgc2lkZVZlY3RvclggPSBza2F0ZXJTdGF0ZS5vblRvcFNpZGVPZlRyYWNrID8gdW5pdE5vcm1hbFZlY3Rvci54IDogdW5pdE5vcm1hbFZlY3Rvci54ICogLTE7XHJcbiAgICBjb25zdCBzaWRlVmVjdG9yWSA9IHNrYXRlclN0YXRlLm9uVG9wU2lkZU9mVHJhY2sgPyB1bml0Tm9ybWFsVmVjdG9yLnkgOiB1bml0Tm9ybWFsVmVjdG9yLnkgKiAtMTtcclxuXHJcbiAgICAvLyBEb3QgcHJvZHVjdCB3cml0dGVuIG91dCBjb21wb25lbnQtd2lzZSB0byBhdm9pZCBhbGxvY2F0aW9ucywgc2VlICM1MFxyXG4gICAgY29uc3Qgb3V0c2lkZUNpcmNsZSA9IHNpZGVWZWN0b3JYICogY3VydmF0dXJlRGlyZWN0aW9uWCArIHNpZGVWZWN0b3JZICogY3VydmF0dXJlRGlyZWN0aW9uWSA8IDA7XHJcblxyXG4gICAgLy8gY29tcGFyZSBhIHRvIHYvcl4yIHRvIHNlZSBpZiBpdCBsZWF2ZXMgdGhlIHRyYWNrXHJcbiAgICBjb25zdCByID0gTWF0aC5hYnMoIGN1cnZhdHVyZVRlbXAuciApO1xyXG4gICAgY29uc3QgY2VudHJpcGV0YWxGb3JjZSA9IHNrYXRlclN0YXRlLm1hc3MgKiBza2F0ZXJTdGF0ZS5wYXJhbWV0cmljU3BlZWQgKiBza2F0ZXJTdGF0ZS5wYXJhbWV0cmljU3BlZWQgLyByO1xyXG5cclxuICAgIGNvbnN0IG5ldEZvcmNlV2l0aG91dE5vcm1hbFggPSB0aGlzLmdldE5ldEZvcmNlV2l0aG91dE5vcm1hbFgoIHNrYXRlclN0YXRlICk7XHJcbiAgICBjb25zdCBuZXRGb3JjZVdpdGhvdXROb3JtYWxZID0gdGhpcy5nZXROZXRGb3JjZVdpdGhvdXROb3JtYWxZKCBza2F0ZXJTdGF0ZSApO1xyXG5cclxuICAgIC8vIE5ldCBmb3JjZSBpbiB0aGUgcmFkaWFsIGRpcmVjdGlvbiBpcyB0aGUgZG90IHByb2R1Y3QuICBDb21wb25lbnQtd2lzZSB0byBhdm9pZCBhbGxvY2F0aW9ucywgc2VlICM1MFxyXG4gICAgY29uc3QgbmV0Rm9yY2VSYWRpYWwgPSBuZXRGb3JjZVdpdGhvdXROb3JtYWxYICogY3VydmF0dXJlRGlyZWN0aW9uWCArIG5ldEZvcmNlV2l0aG91dE5vcm1hbFkgKiBjdXJ2YXR1cmVEaXJlY3Rpb25ZO1xyXG5cclxuICAgIGNvbnN0IGxlYXZlVHJhY2sgPSAoIG5ldEZvcmNlUmFkaWFsIDwgY2VudHJpcGV0YWxGb3JjZSAmJiBvdXRzaWRlQ2lyY2xlICkgfHwgKCBuZXRGb3JjZVJhZGlhbCA+IGNlbnRyaXBldGFsRm9yY2UgJiYgIW91dHNpZGVDaXJjbGUgKTtcclxuXHJcbiAgICBpZiAoIGxlYXZlVHJhY2sgJiYgIXRoaXMuc3RpY2tpbmdUb1RyYWNrUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAvLyBMZWF2ZSB0aGUgdHJhY2suICBNYWtlIHN1cmUgdGhlIHZlbG9jaXR5IGlzIHBvaW50aW5nIGF3YXkgZnJvbSB0aGUgdHJhY2sgb3Iga2VlcCB0cmFjayBvZiBmcmFtZXMgYXdheSBmcm9tIHRoZVxyXG4gICAgICAvLyB0cmFjayBzbyBpdCBkb2Vzbid0IGltbWVkaWF0ZWx5IHJlY29sbGlkZS4gIE9yIHByb2plY3QgYSByYXkgYW5kIHNlZSBpZiBhIGNvbGxpc2lvbiBpcyBpbW1pbmVudD9cclxuICAgICAgY29uc3QgZnJlZVNrYXRlciA9IHNrYXRlclN0YXRlLmxlYXZlVHJhY2soKTtcclxuXHJcbiAgICAgIGRlYnVnQXR0YWNoRGV0YWNoICYmIGRlYnVnQXR0YWNoRGV0YWNoKCAnbGVmdCBtaWRkbGUgdHJhY2snLCBmcmVlU2thdGVyLnZlbG9jaXR5WCwgZnJlZVNrYXRlci52ZWxvY2l0eVkgKTtcclxuXHJcbiAgICAgIGNvbnN0IG51ZGdlZCA9IHRoaXMubnVkZ2UoIGZyZWVTa2F0ZXIsIHNpZGVWZWN0b3JYLCBzaWRlVmVjdG9yWSwgKzEgKTtcclxuXHJcbiAgICAgIC8vIFN0ZXAgYWZ0ZXIgc3dpdGNoaW5nIHRvIGZyZWUgZmFsbCwgc28gaXQgZG9lc24ndCBsb29rIGxpa2UgaXQgcGF1c2VzXHJcbiAgICAgIHJldHVybiB0aGlzLnN0ZXBGcmVlRmFsbCggZHQsIG51ZGdlZCwgdHJ1ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGxldCBuZXdTdGF0ZSA9IHNrYXRlclN0YXRlO1xyXG5cclxuICAgICAgLy8gRGlzY3JlcGFuY3kgd2l0aCBvcmlnaW5hbCB2ZXJzaW9uOiBvcmlnaW5hbCB2ZXJzaW9uIGhhZCAxMCBkaXZpc2lvbnMgaGVyZS4gIFdlIGhhdmUgcmVkdWNlZCBpdCB0byBtYWtlIGl0IG1vcmVcclxuICAgICAgLy8gc21vb3RoIGFuZCBsZXNzIEdDXHJcbiAgICAgIGNvbnN0IG51bURpdmlzaW9ucyA9IDQ7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bURpdmlzaW9uczsgaSsrICkge1xyXG4gICAgICAgIG5ld1N0YXRlID0gdGhpcy5zdGVwRXVsZXIoIGR0IC8gbnVtRGl2aXNpb25zLCBuZXdTdGF0ZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDb3JyZWN0IGVuZXJneVxyXG4gICAgICBjb25zdCBjb3JyZWN0ZWRTdGF0ZSA9IHRoaXMuY29ycmVjdEVuZXJneSggc2thdGVyU3RhdGUsIG5ld1N0YXRlICk7XHJcblxyXG4gICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBza2F0ZXIgaGFzIGxlZnQgdGhlIHRyYWNrXHJcbiAgICAgIGlmICggc2thdGVyU3RhdGUudHJhY2suaXNQYXJhbWV0ZXJJbkJvdW5kcyggY29ycmVjdGVkU3RhdGUucGFyYW1ldHJpY1Bvc2l0aW9uICkgKSB7XHJcblxyXG4gICAgICAgIC8vIFRvIHByZXZlbnQgbm9uLXBoeXNpY2FsIGJlaGF2aW9yIHdoZW4gdGhlIHNrYXRlciBcInBvcHNcIiBhYm92ZSBncm91bmQgYWZ0ZXIgbGVhdmluZyBhIHRyYWNrIHRoYXQgaGFzXHJcbiAgICAgICAgLy8gZm9yY2VkIGl0IHVuZGVyZ3JvdW5kLCB3ZSBzd2l0Y2ggdG8gZ3JvdW5kIGJlZm9yZSB0aGUgc2thdGVyIGNhbiBnbyBiZWxvdyBncm91bmQgaW4gdGhlIGZpcnN0IHBsYWNlLlxyXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIG9ubHkgaGFwcGVuIHdoaWxlIGRyYWdnaW5nIHRoZSB0cmFjaywgYXMgYWxsIHRyYWNrIHBvaW50cyBzaG91bGQgYmUgYWJvdmUgZ3JvdW5kIG90aGVyd2lzZS5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy80NVxyXG4gICAgICAgIGlmICggY29ycmVjdGVkU3RhdGUucG9zaXRpb25ZIDw9IDAgKSB7XHJcbiAgICAgICAgICBjb25zdCBncm91bmRQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCBjb3JyZWN0ZWRTdGF0ZS5wb3NpdGlvblgsIDAgKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnN3aXRjaFRvR3JvdW5kKCBjb3JyZWN0ZWRTdGF0ZSwgY29ycmVjdGVkU3RhdGUuZ2V0VG90YWxFbmVyZ3koKSwgZ3JvdW5kUG9zaXRpb24sIGNvcnJlY3RlZFN0YXRlLmdldFZlbG9jaXR5KCksIGR0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGNvcnJlY3RlZFN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gRmx5IG9mZiB0aGUgbGVmdCBvciByaWdodCBzaWRlIG9mIHRoZSB0cmFja1xyXG4gICAgICAgIC8vIE9mZiB0aGUgZWRnZSBvZiB0aGUgdHJhY2suICBJZiB0aGUgc2thdGVyIHRyYW5zaXRpb25zIGZyb20gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIDJuZCB0cmFjayBkaXJlY3RseSB0byB0aGVcclxuICAgICAgICAvLyBncm91bmQgdGhlbiBkbyBub3QgbG9zZSB0aGVybWFsIGVuZXJneSBkdXJpbmcgdGhlIHRyYW5zaXRpb24sIHNlZSAjMTY0XHJcbiAgICAgICAgaWYgKCBjb3JyZWN0ZWRTdGF0ZS5wYXJhbWV0cmljUG9zaXRpb24gPiBza2F0ZXJTdGF0ZS50cmFjay5tYXhQb2ludCAmJiBza2F0ZXJTdGF0ZS50cmFjay5zbG9wZVRvR3JvdW5kICkge1xyXG4gICAgICAgICAgbGV0IHJlc3VsdCA9IGNvcnJlY3RlZFN0YXRlLnN3aXRjaFRvR3JvdW5kKCBjb3JyZWN0ZWRTdGF0ZS50aGVybWFsRW5lcmd5LCBjb3JyZWN0ZWRTdGF0ZS5nZXRTcGVlZCgpLCAwLCBjb3JyZWN0ZWRTdGF0ZS5wb3NpdGlvblgsIDAgKTtcclxuXHJcbiAgICAgICAgICAvLyBBbGwgdHJhY2sgcG9pbnRzIGFyZSBhdCBvciBhYm92ZSBncm91bmQgc28gaXQgaXMgcG9zc2libGUgdGhhdCB3ZSB0b29rIHBvdGVudGlhbCBlbmVyZ3kgb3V0IG9mIHRoZS4gQWRkXHJcbiAgICAgICAgICAvLyB0byBraW5ldGljIGVuZXJneSB0byBjb21wZW5zYXRlXHJcbiAgICAgICAgICBjb25zdCBlbmVyZ3lEaWZmZXJlbmNlID0gcmVzdWx0LmdldFBvdGVudGlhbEVuZXJneSgpIC0gY29ycmVjdGVkU3RhdGUuZ2V0UG90ZW50aWFsRW5lcmd5KCk7XHJcbiAgICAgICAgICBpZiAoIGVuZXJneURpZmZlcmVuY2UgPCAwICkge1xyXG5cclxuICAgICAgICAgICAgLy8gYWRkIHRoZSBsb3N0IGVuZXJneSB0byBraW5ldGljIGVuZXJneSB0byBjb21wZW5zYXRlXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0tpbmV0aWNFbmVyZ3kgPSByZXN1bHQuZ2V0S2luZXRpY0VuZXJneSgpICsgLWVuZXJneURpZmZlcmVuY2U7XHJcblxyXG4gICAgICAgICAgICAvLyBuZXcgc2thdGVyIHNwZWVkIHdpbGwgYmUgc3BlZWQgZnJvbSBhZGp1c3RlZCBraW5ldGljIGVuZXJneVxyXG4gICAgICAgICAgICBjb25zdCBhZGp1c3RlZFNwZWVkID0gcmVzdWx0LmdldFNwZWVkRnJvbUVuZXJneSggbmV3S2luZXRpY0VuZXJneSApO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVzdG9yZSBkaXJlY3Rpb24gdG8gdmVsb2NpdHkgLSBzbG9wZXMgcG9pbnQgdG8gdGhlIHJpZ2h0LCBidXQganVzdCBpbiBjYXNlXHJcbiAgICAgICAgICAgIGNvbnN0IGNvcnJlY3RlZFYgPSByZXN1bHQudmVsb2NpdHlYID49IDAgPyBhZGp1c3RlZFNwZWVkIDogLWFkanVzdGVkU3BlZWQ7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC51cGRhdGVQb3NpdGlvbkFuZ2xlVXBWZWxvY2l0eSggcmVzdWx0LnBvc2l0aW9uWCwgcmVzdWx0LnBvc2l0aW9uWSwgMCwgdHJ1ZSwgY29ycmVjdGVkViwgMCApO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyBjb3JyZWN0aW9uIHNob3VsZCBwdXQgcmVzdWx0IGVuZXJneSB2ZXJ5IGNsb3NlIHRvIGNvcnJlY3RlZFN0YXRlIGVuZXJneVxyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVdGlscy5lcXVhbHNFcHNpbG9uKCByZXN1bHQuZ2V0VG90YWxFbmVyZ3koKSwgY29ycmVjdGVkU3RhdGUuZ2V0VG90YWxFbmVyZ3koKSwgMUUtNiApLCAnY29ycmVjdGlvbiBhZnRlciBzbG9wZSB0byBncm91bmQgY2hhbmdlZCB0b3RhbCBlbmVyZ3kgdG9vIG11Y2gnICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQ29ycmVjdCBhbnkgb3RoZXIgZW5lcmd5IGRpc2NyZXBhbmN5IHdoZW4gc3dpdGNoaW5nIHRvIHRoZSBncm91bmQsIHNlZSAjMzAxXHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb3JyZWN0RW5lcmd5KCBza2F0ZXJTdGF0ZSwgcmVzdWx0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZGVidWdBdHRhY2hEZXRhY2ggJiYgZGVidWdBdHRhY2hEZXRhY2goIGBsZWZ0IGVkZ2UgdHJhY2s6ICR7Y29ycmVjdGVkU3RhdGUucGFyYW1ldHJpY1Bvc2l0aW9ufSwgJHtza2F0ZXJTdGF0ZS50cmFjay5tYXhQb2ludH1gICk7XHJcblxyXG4gICAgICAgICAgLy8gVGhlcmUgaXMgYSBzaXR1YXRpb24gaW4gd2hpY2ggdGhlIGB1YCBvZiB0aGUgc2thdGVyIGV4Y2VlZHMgdGhlIHRyYWNrIGJvdW5kcyBiZWZvcmUgdGhlXHJcbiAgICAgICAgICAvLyBnZXRDbG9zZXN0UG9zaXRpb25BbmRQYXJhbWV0ZXIucGFyYW1ldHJpY1Bvc2l0aW9uIGRvZXMsIHdoaWNoIGNhbiBjYXVzZSB0aGUgc2thdGVyIHRvIGltbWVkaWF0ZWx5IHJlYXR0YWNoXHJcbiAgICAgICAgICAvLyBTbyBtYWtlIHN1cmUgdGhlIHNrYXRlciBpcyBmYXIgZW5vdWdoIGZyb20gdGhlIHRyYWNrIHNvIGl0IHdvbid0IHJlYXR0YWNoIHJpZ2h0IGF3YXksIHNlZSAjMTY3XHJcbiAgICAgICAgICBjb25zdCBmcmVlU2thdGVyU3RhdGUgPSBza2F0ZXJTdGF0ZS51cGRhdGVUcmFja1VEKCBudWxsLCAwICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgbnVkZ2VkU3RhdGUgPSB0aGlzLm51ZGdlKCBmcmVlU2thdGVyU3RhdGUsIHNpZGVWZWN0b3JYLCBzaWRlVmVjdG9yWSwgLTEgKTtcclxuXHJcbiAgICAgICAgICAvLyBTdGVwIGFmdGVyIHN3aXRjaGluZyB0byBmcmVlIGZhbGwsIHNvIGl0IGRvZXNuJ3QgbG9vayBsaWtlIGl0IHBhdXNlc1xyXG4gICAgICAgICAgY29uc3QgZnJlZUZhbGxTdGF0ZSA9IHRoaXMuc3RlcEZyZWVGYWxsKCBkdCwgbnVkZ2VkU3RhdGUsIHRydWUgKTtcclxuXHJcbiAgICAgICAgICAvLyBpZiBkdXJpbmcgdGhpcyBzdGVwIHdlIHN3aXRjaGVkIHRvIGdyb3VuZCwgcmVzdG9yZSB0aGUga2luZXRpYyBlbmVyZ3kgYW5kIGhvcml6b250YWwgdmVsb2NpdHkgcmF0aGVyXHJcbiAgICAgICAgICAvLyB0aGFuIHN0cmlraW5nIHRoZSBlYXJ0aFxyXG4gICAgICAgICAgaWYgKCBmcmVlRmFsbFN0YXRlLnBvc2l0aW9uWSA9PT0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3dpdGNoVG9Hcm91bmQoIGZyZWVGYWxsU3RhdGUsIGZyZWVGYWxsU3RhdGUuZ2V0VG90YWxFbmVyZ3koKSwgZnJlZUZhbGxTdGF0ZS5nZXRQb3NpdGlvbigpLCBudWRnZWRTdGF0ZS5nZXRWZWxvY2l0eSgpLCBkdCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmcmVlRmFsbFN0YXRlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB0aGUgc2thdGVyIGxlYXZlcyB0aGUgdHJhY2ssIGFkanVzdCB0aGUgcG9zaXRpb24gYW5kIHZlbG9jaXR5LiBUaGlzIHByZXZlbnRzIHRoZSBmb2xsb3dpbmcgcHJvYmxlbXM6XHJcbiAgICogMS4gV2hlbiBsZWF2aW5nIGZyb20gdGhlIHNpZGVzLCBhZGp1c3QgdGhlIHNrYXRlciB1bmRlciB0aGUgdHJhY2sgc28gaXQgd29uJ3QgaW1tZWRpYXRlbHkgcmUtY29sbGlkZS5cclxuICAgKiAyLiBXaGVuIGxlYXZpbmcgZnJvbSB0aGUgbWlkZGxlIG9mIHRoZSB0cmFjayAoc2F5IGdvaW5nIG92ZXIgYSBqdW1wIG9yIGZhbGxpbmcgdXBzaWRlLWRvd24gZnJvbSBhIGxvb3ApLFxyXG4gICAqIGFkanVzdCB0aGUgc2thdGVyIHNvIGl0IHdvbid0IGZhbGwgdGhyb3VnaCBvciByZS1jb2xsaWRlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBmcmVlU2thdGVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpZGVWZWN0b3JYXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpZGVWZWN0b3JZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpZ25cclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgbnVkZ2UoIGZyZWVTa2F0ZXIsIHNpZGVWZWN0b3JYLCBzaWRlVmVjdG9yWSwgc2lnbiApIHtcclxuXHJcbiAgICAvLyBhbmdsZSB0aGUgdmVsb2NpdHkgZG93biBhIGJpdCBhbmQgdW5kZXJzZXQgZnJvbSB0cmFjayBzbyB0aGF0IGl0IHdvbid0IGltbWVkaWF0ZWx5IHJlLWNvbGxpZGVcclxuICAgIC8vIE51ZGdlIHRoZSB2ZWxvY2l0eSBpbiB0aGUgJ3VwJyBkaXJlY3Rpb24gc28gdGhlIHNrYXRlciB3b24ndCBwYXNzIHRocm91Z2ggdGhlIHRyYWNrLCBzZWUgIzIwN1xyXG4gICAgY29uc3QgdmVsb2NpdHkgPSBuZXcgVmVjdG9yMiggZnJlZVNrYXRlci52ZWxvY2l0eVgsIGZyZWVTa2F0ZXIudmVsb2NpdHlZICk7XHJcbiAgICBjb25zdCB1cFZlY3RvciA9IG5ldyBWZWN0b3IyKCBzaWRlVmVjdG9yWCwgc2lkZVZlY3RvclkgKTtcclxuICAgIGlmICggdmVsb2NpdHkubWFnbml0dWRlID4gMCApIHtcclxuICAgICAgY29uc3QgYmxlbmRlZCA9IHZlbG9jaXR5Lm5vcm1hbGl6ZWQoKS5ibGVuZCggdXBWZWN0b3IsIDAuMDEgKiBzaWduICk7XHJcbiAgICAgIGlmICggYmxlbmRlZC5tYWduaXR1ZGUgPiAwICkge1xyXG4gICAgICAgIGNvbnN0IHJldmlzZWRWZWxvY2l0eSA9IGJsZW5kZWQubm9ybWFsaXplZCgpLnRpbWVzKCB2ZWxvY2l0eS5tYWduaXR1ZGUgKTtcclxuICAgICAgICBmcmVlU2thdGVyID0gZnJlZVNrYXRlci51cGRhdGVVRFZlbG9jaXR5KCAwLCByZXZpc2VkVmVsb2NpdHkueCwgcmV2aXNlZFZlbG9jaXR5LnkgKTtcclxuXHJcbiAgICAgICAgLy8gTnVkZ2UgdGhlIHBvc2l0aW9uIGF3YXkgZnJvbSB0aGUgdHJhY2ssIHNsaWdodGx5IHNpbmNlIGl0IHdhcyBwZXJmZWN0bHkgY2VudGVyZWQgb24gdGhlIHRyYWNrLCBzZWUgIzIxMlxyXG4gICAgICAgIC8vIE5vdGUgdGhpcyB3aWxsIGNoYW5nZSB0aGUgZW5lcmd5IG9mIHRoZSBza2F0ZXIsIGJ1dCBvbmx5IGJ5IGEgdGlueSBhbW91bnQgKHRoYXQgc2hvdWxkIGJlIHVuZGV0ZWN0YWJsZSBpbiB0aGVcclxuICAgICAgICAvLyBiYXIgY2hhcnQpXHJcbiAgICAgICAgY29uc3Qgb3JpZ1Bvc2l0aW9uID0gZnJlZVNrYXRlci5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gb3JpZ1Bvc2l0aW9uLnBsdXMoIHVwVmVjdG9yLnRpbWVzKCBzaWduICogMUUtNiApICk7XHJcbiAgICAgICAgZnJlZVNrYXRlciA9IGZyZWVTa2F0ZXIudXBkYXRlUG9zaXRpb24oIG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkgKTtcclxuXHJcbiAgICAgICAgZGVidWdBdHRhY2hEZXRhY2ggJiYgZGVidWdBdHRhY2hEZXRhY2goICduZXdkb3QnLCByZXZpc2VkVmVsb2NpdHkuZG90KCB1cFZlY3RvciApICk7XHJcbiAgICAgICAgcmV0dXJuIGZyZWVTa2F0ZXI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmcmVlU2thdGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJ5IHRvIG1hdGNoIHRoZSB0YXJnZXQgZW5lcmd5IGJ5IHJlZHVjaW5nIHRoZSB2ZWxvY2l0eSBvZiB0aGUgc2thdGVyU3RhdGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IHNrYXRlclN0YXRlXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gdGFyZ2V0U3RhdGVcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgY29ycmVjdEVuZXJneVJlZHVjZVZlbG9jaXR5KCBza2F0ZXJTdGF0ZSwgdGFyZ2V0U3RhdGUgKSB7XHJcblxyXG4gICAgLy8gTWFrZSBhIGNsb25lIHdlIGNhbiBtdXRhdGUgYW5kIHJldHVybiwgdG8gcHJvdGVjdCB0aGUgaW5wdXQgYXJndW1lbnRcclxuICAgIGNvbnN0IG5ld1NrYXRlclN0YXRlID0gdGFyZ2V0U3RhdGUuY29weSgpO1xyXG4gICAgY29uc3QgZTAgPSBza2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpO1xyXG4gICAgY29uc3QgbWFzcyA9IHNrYXRlclN0YXRlLm1hc3M7XHJcblxyXG4gICAgLy8gRmluZCB0aGUgZGlyZWN0aW9uIG9mIHZlbG9jaXR5LiAgVGhpcyBpcyBvbiB0aGUgdHJhY2sgdW5sZXNzIHRoZSBza2F0ZXIganVzdCBsZWZ0IHRoZSBcInNsb3BlXCIgdHJhY2tcclxuICAgIGNvbnN0IHVuaXQgPSBuZXdTa2F0ZXJTdGF0ZS50cmFjayA/IG5ld1NrYXRlclN0YXRlLnRyYWNrLmdldFVuaXRQYXJhbGxlbFZlY3RvciggbmV3U2thdGVyU3RhdGUucGFyYW1ldHJpY1Bvc2l0aW9uICkgOlxyXG4gICAgICAgICAgICAgICAgIG5ld1NrYXRlclN0YXRlLmdldFZlbG9jaXR5KCkubm9ybWFsaXplZCgpO1xyXG5cclxuICAgIC8vIEJpbmFyeSBzZWFyY2gsIGJ1dCBiYWlsIGFmdGVyIHRvbyBtYW55IGl0ZXJhdGlvbnNcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDEwMDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkdiA9ICggbmV3U2thdGVyU3RhdGUuZ2V0VG90YWxFbmVyZ3koKSAtIGUwICkgLyAoIG1hc3MgKiBuZXdTa2F0ZXJTdGF0ZS5wYXJhbWV0cmljU3BlZWQgKTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld1ZlbG9jaXR5ID0gbmV3U2thdGVyU3RhdGUucGFyYW1ldHJpY1NwZWVkIC0gZHY7XHJcblxyXG4gICAgICAvLyBXZSBjYW4ganVzdCBzZXQgdGhlIHN0YXRlIGRpcmVjdGx5IGluc3RlYWQgb2YgY2FsbGluZyB1cGRhdGUgc2luY2Ugd2UgYXJlIGtlZXBpbmcgYSBwcm90ZWN0ZWQgY2xvbmUgb2YgdGhlXHJcbiAgICAgIC8vIG5ld1NrYXRlclN0YXRlXHJcbiAgICAgIG5ld1NrYXRlclN0YXRlLnBhcmFtZXRyaWNTcGVlZCA9IG5ld1ZlbG9jaXR5O1xyXG4gICAgICBjb25zdCByZXN1bHQgPSB1bml0LnRpbWVzKCBuZXdWZWxvY2l0eSApO1xyXG4gICAgICBuZXdTa2F0ZXJTdGF0ZS52ZWxvY2l0eVggPSByZXN1bHQueDtcclxuICAgICAgbmV3U2thdGVyU3RhdGUudmVsb2NpdHlZID0gcmVzdWx0Lnk7XHJcblxyXG4gICAgICBpZiAoIFV0aWxzLmVxdWFsc0Vwc2lsb24oIGUwLCBuZXdTa2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICkgKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBuZXdTa2F0ZXJTdGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJpbmFyeSBzZWFyY2ggdG8gZmluZCB0aGUgcGFyYW1ldHJpYyBjb29yZGluYXRlIGFsb25nIHRoZSB0cmFjayB0aGF0IG1hdGNoZXMgdGhlIGUwIGVuZXJneS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gc2thdGVyU3RhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdTBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdTFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZTBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtU3RlcHNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIHNlYXJjaFNwbGluZUZvckVuZXJneSggc2thdGVyU3RhdGUsIHUwLCB1MSwgZTAsIG51bVN0ZXBzICkge1xyXG4gICAgY29uc3QgZGEgPSAoIHUxIC0gdTAgKSAvIG51bVN0ZXBzO1xyXG4gICAgbGV0IGJlc3RBbHBoYSA9ICggdTEgKyB1MCApIC8gMjtcclxuICAgIGNvbnN0IHAgPSBza2F0ZXJTdGF0ZS50cmFjay5nZXRQb2ludCggYmVzdEFscGhhICk7XHJcbiAgICBsZXQgYmVzdERFID0gc2thdGVyU3RhdGUudXBkYXRlUG9zaXRpb24oIHAueCwgcC55ICkuZ2V0VG90YWxFbmVyZ3koKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVN0ZXBzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHByb3Bvc2VkQWxwaGEgPSB1MCArIGRhICogaTtcclxuICAgICAgY29uc3QgcDIgPSBza2F0ZXJTdGF0ZS50cmFjay5nZXRQb2ludCggYmVzdEFscGhhICk7XHJcbiAgICAgIGNvbnN0IGUgPSBza2F0ZXJTdGF0ZS51cGRhdGVQb3NpdGlvbiggcDIueCwgcDIueSApLmdldFRvdGFsRW5lcmd5KCk7XHJcbiAgICAgIGlmICggTWF0aC5hYnMoIGUgLSBlMCApIDw9IE1hdGguYWJzKCBiZXN0REUgKSApIHtcclxuICAgICAgICBiZXN0REUgPSBlIC0gZTA7XHJcbiAgICAgICAgYmVzdEFscGhhID0gcHJvcG9zZWRBbHBoYTtcclxuICAgICAgfS8vIGNvbnRpbnVlIHRvIGZpbmQgYmVzdCB2YWx1ZSBjbG9zZXN0IHRvIHByb3Bvc2VkIHUsIGV2ZW4gaWYgc2V2ZXJhbCB2YWx1ZXMgZ2l2ZSBkRT0wLjBcclxuICAgIH1cclxuICAgIGRlYnVnICYmIGRlYnVnKCBgQWZ0ZXIgJHtudW1TdGVwc30gc3RlcHMsIG9yaWdBbHBoYT0ke3UwfSwgYmVzdEFscGhhPSR7YmVzdEFscGhhfSwgZEU9JHtiZXN0REV9YCApO1xyXG4gICAgcmV0dXJuIGJlc3RBbHBoYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgbnVtYmVyIG9mIGhldXJpc3RpYyBlbmVyZ3kgY29ycmVjdGlvbiBzdGVwcyB0byBlbnN1cmUgZW5lcmd5IGlzIGNvbnNlcnZlZCB3aGlsZSBrZWVwaW5nIHRoZSBtb3Rpb24gc21vb3RoIGFuZFxyXG4gICAqIGFjY3VyYXRlLiBDb3BpZWQgZnJvbSB0aGUgSmF2YSB2ZXJzaW9uIGRpcmVjdGx5ICh3aXRoIGEgZmV3IGRpZmZlcmVudCBtYWdpYyBudW1iZXJzKVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBza2F0ZXJTdGF0ZVxyXG4gICAqIEBwYXJhbSB7U2thdGVyU3RhdGV9IG5ld1N0YXRlXHJcbiAgICogQHJldHVybnMge1NrYXRlclN0YXRlfVxyXG4gICAqL1xyXG4gIGNvcnJlY3RFbmVyZ3koIHNrYXRlclN0YXRlLCBuZXdTdGF0ZSApIHtcclxuICAgIGlmICggdGhpcy50cmFja0NoYW5nZVBlbmRpbmcgKSB7XHJcbiAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHUwID0gc2thdGVyU3RhdGUucGFyYW1ldHJpY1Bvc2l0aW9uO1xyXG4gICAgY29uc3QgZTAgPSBza2F0ZXJTdGF0ZS5nZXRUb3RhbEVuZXJneSgpO1xyXG5cclxuICAgIGlmICggIWlzRmluaXRlKCBuZXdTdGF0ZS5nZXRUb3RhbEVuZXJneSgpICkgKSB7IHRocm93IG5ldyBFcnJvciggJ25vdCBmaW5pdGUnICk7fVxyXG4gICAgY29uc3QgZEUgPSBuZXdTdGF0ZS5nZXRUb3RhbEVuZXJneSgpIC0gZTA7XHJcbiAgICBpZiAoIE1hdGguYWJzKCBkRSApIDwgMUUtNiApIHtcclxuICAgICAgLy8gc21hbGwgZW5vdWdoXHJcbiAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIG5ld1N0YXRlLmdldFRvdGFsRW5lcmd5KCkgPiBlMCApIHtcclxuICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggJ0VuZXJneSB0b28gaGlnaCcgKTtcclxuXHJcbiAgICAgICAgLy8gY2FuIHdlIHJlZHVjZSB0aGUgdmVsb2NpdHkgZW5vdWdoP1xyXG4gICAgICAgIC8vIGFtb3VudCB3ZSBjb3VsZCByZWR1Y2UgdGhlIGVuZXJneSBpZiB3ZSBkZWxldGVkIGFsbCB0aGUga2luZXRpYyBlbmVyZ3k6XHJcbiAgICAgICAgaWYgKCBNYXRoLmFicyggbmV3U3RhdGUuZ2V0S2luZXRpY0VuZXJneSgpICkgPiBNYXRoLmFicyggZEUgKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjdXJyZW50IHJ1bGUgZm9yIHJlZHVjaW5nIHRoZSBlbmVyZ3kuICBCdXQgaW4gYSBmdXR1cmUgdmVyc2lvbiBtYXliZSBzaG91bGQgb25seSBkbyB0aGlzXHJcbiAgICAgICAgICAvLyBpZiBhbGwgdmVsb2NpdHkgaXMgbm90IGNvbnZlcnRlZD9cclxuICAgICAgICAgIGRlYnVnICYmIGRlYnVnKCAnQ291bGQgZml4IGFsbCBlbmVyZ3kgYnkgY2hhbmdpbmcgdmVsb2NpdHkuJyApO1xyXG4gICAgICAgICAgY29uc3QgY29ycmVjdGVkU3RhdGVBID0gdGhpcy5jb3JyZWN0RW5lcmd5UmVkdWNlVmVsb2NpdHkoIHNrYXRlclN0YXRlLCBuZXdTdGF0ZSApO1xyXG4gICAgICAgICAgZGVidWcgJiYgZGVidWcoIGBjaGFuZ2VkIHZlbG9jaXR5OiBkRT0ke2NvcnJlY3RlZFN0YXRlQS5nZXRUb3RhbEVuZXJneSgpIC0gZTB9YCApO1xyXG4gICAgICAgICAgaWYgKCAhVXRpbHMuZXF1YWxzRXBzaWxvbiggZTAsIGNvcnJlY3RlZFN0YXRlQS5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICkgKSB7XHJcbiAgICAgICAgICAgIGRlYnVnICYmIGRlYnVnKCAnRW5lcmd5IGVycm9yWzBdJyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNvcnJlY3RlZFN0YXRlQTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggJ05vdCBlbm91Z2ggS0UgdG8gZml4IHdpdGggdmVsb2NpdHkgYWxvbmU6IG5vcm1hbDonICk7XHJcbiAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggYGNoYW5nZWQgcG9zaXRpb24gdTogZEU9JHtuZXdTdGF0ZS5nZXRUb3RhbEVuZXJneSgpIC0gZTB9YCApO1xyXG4gICAgICAgICAgLy8gc2VhcmNoIGZvciBhIHBsYWNlIGJldHdlZW4gdSBhbmQgdTAgd2l0aCBhIGJldHRlciBlbmVyZ3lcclxuXHJcbiAgICAgICAgICBjb25zdCBudW1SZWN1cnNpdmVTZWFyY2hlcyA9IDEwO1xyXG4gICAgICAgICAgY29uc3QgcGFyYW1ldHJpY1Bvc2l0aW9uID0gbmV3U3RhdGUucGFyYW1ldHJpY1Bvc2l0aW9uO1xyXG4gICAgICAgICAgbGV0IGJlc3RBbHBoYSA9ICggcGFyYW1ldHJpY1Bvc2l0aW9uICsgdTAgKSAvIDIuMDtcclxuICAgICAgICAgIGxldCBkYSA9IE1hdGguYWJzKCAoIHBhcmFtZXRyaWNQb3NpdGlvbiAtIHUwICkgLyAyICk7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1SZWN1cnNpdmVTZWFyY2hlczsgaSsrICkge1xyXG4gICAgICAgICAgICBjb25zdCBudW1TdGVwcyA9IDEwO1xyXG4gICAgICAgICAgICBiZXN0QWxwaGEgPSB0aGlzLnNlYXJjaFNwbGluZUZvckVuZXJneSggbmV3U3RhdGUsIGJlc3RBbHBoYSAtIGRhLCBiZXN0QWxwaGEgKyBkYSwgZTAsIG51bVN0ZXBzICk7XHJcbiAgICAgICAgICAgIGRhID0gTWF0aC5hYnMoICggKCBiZXN0QWxwaGEgLSBkYSApIC0gKCBiZXN0QWxwaGEgKyBkYSApICkgLyBudW1TdGVwcyApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHBvaW50ID0gbmV3U3RhdGUudHJhY2suZ2V0UG9pbnQoIGJlc3RBbHBoYSApO1xyXG4gICAgICAgICAgY29uc3QgY29ycmVjdGVkU3RhdGUgPSBuZXdTdGF0ZS51cGRhdGVVUG9zaXRpb24oIGJlc3RBbHBoYSwgcG9pbnQueCwgcG9pbnQueSApO1xyXG4gICAgICAgICAgZGVidWcgJiYgZGVidWcoIGBjaGFuZ2VkIHBvc2l0aW9uIHU6IGRFPSR7Y29ycmVjdGVkU3RhdGUuZ2V0VG90YWxFbmVyZ3koKSAtIGUwfWAgKTtcclxuICAgICAgICAgIGlmICggIVV0aWxzLmVxdWFsc0Vwc2lsb24oIGUwLCBjb3JyZWN0ZWRTdGF0ZS5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBhbW91bnQgd2UgY291bGQgcmVkdWNlIHRoZSBlbmVyZ3kgaWYgd2UgZGVsZXRlZCBhbGwgdGhlIGtpbmV0aWMgZW5lcmd5OlxyXG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBjb3JyZWN0ZWRTdGF0ZS5nZXRLaW5ldGljRW5lcmd5KCkgKSA+IE1hdGguYWJzKCBkRSApICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBOT1RFOiBtYXliZSBzaG91bGQgb25seSBkbyB0aGlzIGlmIGFsbCB2ZWxvY2l0eSBpcyBub3QgY29udmVydGVkXHJcbiAgICAgICAgICAgICAgZGVidWcgJiYgZGVidWcoICdGaXhlZCBwb3NpdGlvbiBzb21lLCBzdGlsbCBuZWVkIHRvIGZpeCB2ZWxvY2l0eSBhcyB3ZWxsLicgKTtcclxuICAgICAgICAgICAgICBjb25zdCBjb3JyZWN0ZWRTdGF0ZTIgPSB0aGlzLmNvcnJlY3RFbmVyZ3lSZWR1Y2VWZWxvY2l0eSggc2thdGVyU3RhdGUsIGNvcnJlY3RlZFN0YXRlICk7XHJcbiAgICAgICAgICAgICAgaWYgKCAhVXRpbHMuZXF1YWxzRXBzaWxvbiggZTAsIGNvcnJlY3RlZFN0YXRlMi5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICkgKSB7XHJcbiAgICAgICAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggJ0NoYW5nZWQgcG9zaXRpb24gJiBWZWxvY2l0eSBhbmQgc3RpbGwgaGFkIGVuZXJneSBlcnJvcicgKTtcclxuICAgICAgICAgICAgICAgIGRlYnVnICYmIGRlYnVnKCAnRW5lcmd5IGVycm9yWzEyM10nICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBjb3JyZWN0ZWRTdGF0ZTI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFRoaXMgZXJyb3Igc2VlbXMgdG8gb2NjdXIgd2l0aCBmcmljdGlvbiB0dXJuZWQgb24gYXQgdGhlIHRvcCBvZiBhIGhpbGwsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmstYmFzaWNzL2lzc3Vlcy8xMjdcclxuICAgICAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggYENoYW5nZWQgcG9zaXRpb24sIHdhbnRlZCB0byBjaGFuZ2UgdmVsb2NpdHksIGJ1dCBkaWRuJ3QgaGF2ZSBlbm91Z2ggdG8gZml4IGl0Li4uLCBkRT0ke25ld1N0YXRlLmdldFRvdGFsRW5lcmd5KCkgLSBlMH1gICk7XHJcbiAgICAgICAgICAgICAgaWYgKCBuZXdTdGF0ZS50aGVybWFsRW5lcmd5ID4gc2thdGVyU3RhdGUudGhlcm1hbEVuZXJneSApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluY3JlYXNlZFRoZXJtYWxFbmVyZ3kgPSBuZXdTdGF0ZS50aGVybWFsRW5lcmd5IC0gc2thdGVyU3RhdGUudGhlcm1hbEVuZXJneTtcclxuICAgICAgICAgICAgICAgIGlmICggaW5jcmVhc2VkVGhlcm1hbEVuZXJneSA+IGRFICkge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCByZWR1Y2VkVGhlcm1hbEVuZXJneVN0YXRlID0gbmV3U3RhdGUudXBkYXRlVGhlcm1hbEVuZXJneSggbmV3U3RhdGUudGhlcm1hbEVuZXJneSAtIGRFICk7XHJcbiAgICAgICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIE1hdGguYWJzKCByZWR1Y2VkVGhlcm1hbEVuZXJneVN0YXRlLmdldFRvdGFsRW5lcmd5KCkgLSBlMCApIDwgMUUtNiwgJ2VuZXJneSBzaG91bGQgYmUgY29ycmVjdGVkJyApO1xyXG4gICAgICAgICAgICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggYENvcnJlY3RlZCBlbmVyZ3kgYnkgcmVkdWNpbmcgdGhlcm1hbCBvdmVyZXN0aW1hdGUke2RFfWAgKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlZHVjZWRUaGVybWFsRW5lcmd5U3RhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIFRha2UgYXMgbXVjaCB0aGVybWFsIGVuZXJneSBvdXQgYXMgcG9zc2libGVcclxuICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxUaGVybWFsRW5lcmd5U3RhdGUgPSBuZXdTdGF0ZS51cGRhdGVUaGVybWFsRW5lcmd5KCBza2F0ZXJTdGF0ZS50aGVybWFsRW5lcmd5ICk7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcnJlY3RlZFN0YXRlMyA9IHRoaXMuY29ycmVjdEVuZXJneVJlZHVjZVZlbG9jaXR5KCBza2F0ZXJTdGF0ZSwgb3JpZ2luYWxUaGVybWFsRW5lcmd5U3RhdGUgKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKCAhVXRpbHMuZXF1YWxzRXBzaWxvbiggZTAsIGNvcnJlY3RlZFN0YXRlMy5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVidWcgJiYgZGVidWcoICdDaGFuZ2VkIHBvc2l0aW9uICYgVmVsb2NpdHkgYW5kIHN0aWxsIGhhZCBlbmVyZ3kgZXJyb3IsIGVycm9yWzEyNF0nICk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvcnJlY3RlZFN0YXRlMztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGNvcnJlY3RlZFN0YXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY29ycmVjdGVkU3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggIWlzRmluaXRlKCBuZXdTdGF0ZS5nZXRUb3RhbEVuZXJneSgpICkgKSB7IHRocm93IG5ldyBFcnJvciggJ25vdCBmaW5pdGUnICk7fVxyXG4gICAgICAgIGRlYnVnICYmIGRlYnVnKCAnRW5lcmd5IHRvbyBsb3cnICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbmV3U3RhdGUudHJhY2ssICduZXdTdGF0ZSBtdXN0IGJlIHN0aWxsIGhhdmUgYSB0cmFjayBmb3IgdGhpcyBlbmVyZ3kgY29ycmVjdGlvbicgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdTdGF0ZS5wYXJhbWV0cmljU3BlZWQgIT09IDAsICdjb3JyZWN0aW9uIGFzc3VtZXMgdGhhdCB0aGVyZSBpcyBzb21lIGtpbmV0aWMgZW5lcmd5IHRvIGFkZCB0bycgKTtcclxuXHJcbiAgICAgICAgLy8gaW5jcmVhc2luZyB0aGUga2luZXRpYyBlbmVyZ3lcclxuICAgICAgICAvLyBDaG9vc2UgdGhlIGV4YWN0IHZlbG9jaXR5IGluIHRoZSBzYW1lIGRpcmVjdGlvbiBhcyBjdXJyZW50IHZlbG9jaXR5IHRvIGVuc3VyZSB0b3RhbCBlbmVyZ3kgY29uc2VydmVkLlxyXG4gICAgICAgIGNvbnN0IHZTcSA9IE1hdGguYWJzKCAyIC8gbmV3U3RhdGUubWFzcyAqICggZTAgLSBuZXdTdGF0ZS5nZXRQb3RlbnRpYWxFbmVyZ3koKSAtIG5ld1N0YXRlLnRoZXJtYWxFbmVyZ3kgKSApO1xyXG4gICAgICAgIGNvbnN0IHYgPSBNYXRoLnNxcnQoIHZTcSApO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdWZWxvY2l0eSA9IHYgKiAoIG5ld1N0YXRlLnBhcmFtZXRyaWNTcGVlZCA+IDAgPyArMSA6IC0xICk7XHJcbiAgICAgICAgY29uc3QgdW5pdFBhcmFsbGVsVmVjdG9yID0gbmV3U3RhdGUudHJhY2suZ2V0VW5pdFBhcmFsbGVsVmVjdG9yKCBuZXdTdGF0ZS5wYXJhbWV0cmljUG9zaXRpb24gKTtcclxuICAgICAgICBjb25zdCB1cGRhdGVkVmVsb2NpdHlYID0gdW5pdFBhcmFsbGVsVmVjdG9yLnggKiBuZXdWZWxvY2l0eTtcclxuICAgICAgICBjb25zdCB1cGRhdGVkVmVsb2NpdHlZID0gdW5pdFBhcmFsbGVsVmVjdG9yLnkgKiBuZXdWZWxvY2l0eTtcclxuICAgICAgICBjb25zdCBmaXhlZFN0YXRlID0gbmV3U3RhdGUudXBkYXRlVURWZWxvY2l0eSggbmV3VmVsb2NpdHksIHVwZGF0ZWRWZWxvY2l0eVgsIHVwZGF0ZWRWZWxvY2l0eVkgKTtcclxuICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggJ1NldCB2ZWxvY2l0eSB0byBtYXRjaCBlbmVyZ3ksIHdoZW4gZW5lcmd5IHdhcyBsb3c6ICcgKTtcclxuICAgICAgICBkZWJ1ZyAmJiBkZWJ1ZyggYElOQyBjaGFuZ2VkIHZlbG9jaXR5OiBkRT0ke2ZpeGVkU3RhdGUuZ2V0VG90YWxFbmVyZ3koKSAtIGUwfWAgKTtcclxuICAgICAgICBpZiAoICFVdGlscy5lcXVhbHNFcHNpbG9uKCBlMCwgZml4ZWRTdGF0ZS5nZXRUb3RhbEVuZXJneSgpLCAxRS04ICkgKSB7XHJcbiAgICAgICAgICBuZXcgRXJyb3IoICdFbmVyZ3kgZXJyb3JbMl0nICkucHJpbnRTdGFja1RyYWNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaXhlZFN0YXRlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBQRVJGT1JNQU5DRS9BTExPQ0FUSU9OIC0gdXNlcyBhIHJldXNhYmxlIE9iamVjdCBmb3IgY3VydmF0dXJlXHJcbiAgLyoqXHJcbiAgICogR2V0IGRpcmVjdGlvbiBvZiBjdXJ2YXR1cmUgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBTa2F0ZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJ2YXR1cmUgLSBSZXVzYWJsZSBPYmplY3QgZGVzY3JpYmluZyBjdXJ2YXR1cmUgKHJhZGl1cyBhbmQgcG9zaXRpb24pLCBzZWUgVHJhY2suZ2V0Q3VydmF0dXJlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHgyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkyXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0Q3VydmF0dXJlRGlyZWN0aW9uKCBjdXJ2YXR1cmUsIHgyLCB5MiApIHtcclxuICAgIGNvbnN0IHYgPSBuZXcgVmVjdG9yMiggY3VydmF0dXJlLnggLSB4MiwgY3VydmF0dXJlLnkgLSB5MiApO1xyXG4gICAgcmV0dXJuICggdi54ICE9PSAwIHx8IHYueSAhPT0gMCApID8gdi5ub3JtYWxpemVkKCkgOiB2O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB4IGNvbXBvbmVudCBvZiBkaXJlY3Rpb24gb2YgY3VydmF0dXJlIGF0IHRoZSBTa2F0ZXIncyBwb3NpdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGN1cnZhdHVyZSAtIFJldXNhYmxlIE9iamVjdCBkZXNjcmliaW5nIGN1cnZhdHVyZSwgc2VlIFRyYWNrLmdldEN1cnZhdHVyZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0Q3VydmF0dXJlRGlyZWN0aW9uWCggY3VydmF0dXJlLCB4MiwgeTIgKSB7XHJcbiAgICBjb25zdCB2eCA9IGN1cnZhdHVyZS54IC0geDI7XHJcbiAgICBjb25zdCB2eSA9IGN1cnZhdHVyZS55IC0geTI7XHJcbiAgICByZXR1cm4gKCB2eCAhPT0gMCB8fCB2eSAhPT0gMCApID8gdnggLyBNYXRoLnNxcnQoIHZ4ICogdnggKyB2eSAqIHZ5ICkgOiB2eDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgeSBjb21wb25lbnQgb2YgZGlyZWN0aW9uIG9mIGN1cnZhdHVyZSBhdCB0aGUgU2thdGVyJ3MgcG9zaXRpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJ2YXR1cmUgLSBSZXVzYWJsZSBPYmplY3QgZGVzY3JpYmluZyBjdXJ2YXR1cmUsIHNlZSBUcmFjay5nZXRDdXJ2YXR1cmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0geDJcclxuICAgKiBAcGFyYW0ge251bWJlcn0geTJcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEN1cnZhdHVyZURpcmVjdGlvblkoIGN1cnZhdHVyZSwgeDIsIHkyICkge1xyXG4gICAgY29uc3QgdnggPSBjdXJ2YXR1cmUueCAtIHgyO1xyXG4gICAgY29uc3QgdnkgPSBjdXJ2YXR1cmUueSAtIHkyO1xyXG4gICAgcmV0dXJuICggdnggIT09IDAgfHwgdnkgIT09IDAgKSA/IHZ5IC8gTWF0aC5zcXJ0KCB2eCAqIHZ4ICsgdnkgKiB2eSApIDogdnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHNrYXRlciBiYXNlZCBvbiB3aGljaCBzdGF0ZS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcGFyYW0ge1NrYXRlclN0YXRlfSBza2F0ZXJTdGF0ZVxyXG4gICAqIEByZXR1cm5zIHtTa2F0ZXJTdGF0ZX1cclxuICAgKi9cclxuICBzdGVwTW9kZWwoIGR0LCBza2F0ZXJTdGF0ZSApIHtcclxuXHJcbiAgICAvLyBpbmNyZW1lbnQgcnVubmluZyB0aW1lIC0gZG9uZSBpbiBzdGVwTW9kZWwgYmVjYXVzZSBkdCByZWZsZWN0cyB0aW1lU3BlZWRQcm9wZXJ0eSBoZXJlXHJcbiAgICB0aGlzLnN0b3B3YXRjaC5zdGVwKCBkdCApO1xyXG5cclxuICAgIGlmICggc2thdGVyU3RhdGUuZHJhZ2dpbmcgKSB7XHJcblxyXG4gICAgICAvLyBVc2VyIGlzIGRyYWdnaW5nIHRoZSBza2F0ZXIsIG5vdGhpbmcgdG8gdXBkYXRlIGhlcmVcclxuICAgICAgcmV0dXJuIHNrYXRlclN0YXRlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNrYXRlclN0YXRlLnRyYWNrICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwVHJhY2soIGR0LCBza2F0ZXJTdGF0ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNrYXRlclN0YXRlLnBvc2l0aW9uWSA8PSAwICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwR3JvdW5kKCBkdCwgc2thdGVyU3RhdGUgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBza2F0ZXJTdGF0ZS5wb3NpdGlvblkgPiAwICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwRnJlZUZhbGwoIGR0LCBza2F0ZXJTdGF0ZSwgZmFsc2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0ltcG9zc2libGUgY29uZGl0aW9uIGZvciBza2F0ZXIsIGNhblxcJ3Qgc3RlcCcgKTtcclxuICAgICAgcmV0dXJuIHNrYXRlclN0YXRlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRvIHRoZSBwbGFjZSBoZSB3YXMgbGFzdCByZWxlYXNlZCBieSB0aGUgdXNlci4gQWxzbyByZXN0b3JlcyB0aGUgdHJhY2sgdGhlIHNrYXRlciB3YXMgb24gc28gdGhlIGluaXRpYWxcclxuICAgKiBjb25kaXRpb25zIGFyZSB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXMgcmVsZWFzZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgcmV0dXJuU2thdGVyKCkge1xyXG5cclxuICAgIC8vIHJldHVybmluZyB0aGUgc2thdGVyIG1vdmVzIGl0IHRvIGEgbmV3IHBvc2l0aW9uIC0gc2lnbmlmeSB0aGF0IGl0IGlzIGJlaW5nIGNvbnRyb2xsZWQgb3V0c2lkZSBvZiB0aGUgcGh5c2ljYWxcclxuICAgIC8vIG1vZGVsXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQuc2thdGVyQ29udHJvbGxlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG5cclxuICAgIC8vIGlmIHRoZSBza2F0ZXIncyBvcmlnaW5hbCB0cmFjayBpcyBhdmFpbGFibGUsIHJlc3RvcmUgaGVyIHRvIGl0LCBzZWUgIzE0M1xyXG4gICAgY29uc3Qgb3JpZ2luYWxUcmFja0F2YWlsYWJsZSA9IF8uaW5jbHVkZXMoIHRoaXMuZ2V0UGh5c2ljYWxUcmFja3MoKSwgdGhpcy5za2F0ZXIuc3RhcnRpbmdUcmFja1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgICBpZiAoIG9yaWdpbmFsVHJhY2tBdmFpbGFibGUgKSB7XHJcbiAgICAgIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgPSB0aGlzLnNrYXRlci5zdGFydGluZ1RyYWNrUHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNrYXRlci5yZXR1cm5Ta2F0ZXIoKTtcclxuXHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQuc2thdGVyQ29udHJvbGxlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciB0aGVybWFsIGVuZXJneSBmcm9tIHRoZSBtb2RlbC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJUaGVybWFsKCkge1xyXG4gICAgdGhpcy5za2F0ZXIuY2xlYXJUaGVybWFsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIHRyYWNrcyBpbiB0aGUgbW9kZWwgdGhhdCBhcmUgbWFya2VkIGFzIHBoeXNpY2FsICh0aGV5IGNhbiBpbnRlcmFjdCB3aXRoIHRoZSBTa2F0ZXIgaW4gc29tZSB3YXkpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtUcmFja1tdfVxyXG4gICAqL1xyXG4gIGdldFBoeXNpY2FsVHJhY2tzKCkge1xyXG5cclxuICAgIC8vIFVzZSB2YW5pbGxhIGluc3RlYWQgb2YgbG9kYXNoIGZvciBzcGVlZCBzaW5jZSB0aGlzIGlzIGluIGFuIGlubmVyIGxvb3BcclxuICAgIGNvbnN0IHBoeXNpY2FsVHJhY2tzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRyYWNrcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdHJhY2sgPSB0aGlzLnRyYWNrcy5nZXQoIGkgKTtcclxuXHJcbiAgICAgIGlmICggdHJhY2sucGh5c2ljYWxQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBwaHlzaWNhbFRyYWNrcy5wdXNoKCB0cmFjayApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGh5c2ljYWxUcmFja3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIHRyYWNrcyB0aGF0IHRoZSBza2F0ZXIgY2Fubm90IGludGVyYWN0IHdpdGguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1RyYWNrW119XHJcbiAgICovXHJcbiAgZ2V0Tm9uUGh5c2ljYWxUcmFja3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFja3MuZmlsdGVyKCB0cmFjayA9PiAhdHJhY2sucGh5c2ljYWxQcm9wZXJ0eS5nZXQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgdHJhY2sgZnJvbSB0aGUgb2JzZXJ2YWJsZSBhcnJheSBvZiB0cmFja3MgYW5kIGRpc3Bvc2UgaXQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmFja30gdHJhY2tUb1JlbW92ZVxyXG4gICAqL1xyXG4gIHJlbW92ZUFuZERpc3Bvc2VUcmFjayggdHJhY2tUb1JlbW92ZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudHJhY2tzLmluY2x1ZGVzKCB0cmFja1RvUmVtb3ZlICksICd0cnlpbmcgdG8gcmVtb3ZlIHRyYWNrIHRoYXQgaXMgbm90IGluIHRoZSBsaXN0JyApO1xyXG4gICAgdGhpcy50cmFja3MucmVtb3ZlKCB0cmFja1RvUmVtb3ZlICk7XHJcbiAgICB0aGlzLnRyYWNrR3JvdXAuZGlzcG9zZUVsZW1lbnQoIHRyYWNrVG9SZW1vdmUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgd2hhdGV2ZXIgdHJhY2sgaXMgY29ubmVjdGVkIHRvIHRoZSBzcGVjaWZpZWQgdHJhY2sgYW5kIGpvaW4gdGhlbSB0b2dldGhlciB0byBhIG5ldyB0cmFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYWNrfSB0cmFja1xyXG4gICAqL1xyXG4gIGpvaW5UcmFja3MoIHRyYWNrICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhY2suYXR0YWNoYWJsZSwgJ3RyeWluZyB0byBqb2luIHRyYWNrcywgYnV0IHRyYWNrIGlzIG5vdCBhdHRhY2hhYmxlJyApO1xyXG5cclxuICAgIGNvbnN0IGNvbm5lY3RlZFBvaW50ID0gdHJhY2suZ2V0U25hcFRhcmdldCgpO1xyXG4gICAgY29uc3Qgb3RoZXJUcmFjayA9IF8uZmluZCggdGhpcy5nZXRQaHlzaWNhbFRyYWNrcygpLCB0cmFjayA9PiB0cmFjay5jb250YWluc0NvbnRyb2xQb2ludCggY29ubmVjdGVkUG9pbnQgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3RoZXJUcmFjaywgJ3RyeWluZyB0byBhdHRhY2ggdHJhY2tzLCBidXQgb3RoZXIgdHJhY2sgd2FzIG5vdCBmb3VuZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG90aGVyVHJhY2suYXR0YWNoYWJsZSwgJ3RyeWluZyB0byBqb2luIHRyYWNrcywgYnV0IG90aGVyIHRyYWNrIGlzIG5vdCBhdHRhY2hhYmxlJyApO1xyXG5cclxuICAgIHRoaXMuam9pblRyYWNrVG9UcmFjayggdHJhY2ssIG90aGVyVHJhY2sgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB1c2VyIGhhcyBwcmVzc2VkIHRoZSBcImRlbGV0ZVwiIGJ1dHRvbiBmb3IgdGhlIHNwZWNpZmllZCB0cmFjaydzIHNwZWNpZmllZCBjb250cm9sIHBvaW50LCBhbmQgaXQgc2hvdWxkIGJlXHJcbiAgICogZGVsZXRlZC4gSXQgc2hvdWxkIGJlIGFuIGlubmVyIHBvaW50IG9mIGEgdHJhY2sgKG5vdCBhbiBlbmQgcG9pbnQpLiBJZiB0aGVyZSB3ZXJlIG9ubHkgMiBwb2ludHMgb24gdGhlIHRyYWNrLFxyXG4gICAqIGp1c3QgZGVsZXRlIHRoZSBlbnRpcmUgdHJhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYWNrfSB0cmFja1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb250cm9sUG9pbnRJbmRleCBbZGVzY3JpcHRpb25dXHJcbiAgICovXHJcbiAgZGVsZXRlQ29udHJvbFBvaW50KCB0cmFjaywgY29udHJvbFBvaW50SW5kZXggKSB7XHJcblxyXG4gICAgdHJhY2sucmVtb3ZlRW1pdHRlci5lbWl0KCk7XHJcbiAgICB0aGlzLnJlbW92ZUFuZERpc3Bvc2VUcmFjayggdHJhY2sgKTtcclxuXHJcbiAgICBpZiAoIHRyYWNrLmNvbnRyb2xQb2ludHMubGVuZ3RoID4gMiApIHtcclxuICAgICAgY29uc3QgY29udHJvbFBvaW50VG9EZWxldGUgPSB0cmFjay5jb250cm9sUG9pbnRzWyBjb250cm9sUG9pbnRJbmRleCBdO1xyXG4gICAgICBjb25zdCBwb2ludHMgPSBfLndpdGhvdXQoIHRyYWNrLmNvbnRyb2xQb2ludHMsIGNvbnRyb2xQb2ludFRvRGVsZXRlICk7XHJcbiAgICAgIHRoaXMuY29udHJvbFBvaW50R3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNvbnRyb2xQb2ludFRvRGVsZXRlICk7XHJcbiAgICAgIGNvbnN0IG5ld1RyYWNrID0gdGhpcy50cmFja0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBwb2ludHMsIHRyYWNrLmdldFBhcmVudHNPclNlbGYoKSwgVHJhY2suRlVMTFlfSU5URVJBQ1RJVkVfT1BUSU9OUyApO1xyXG4gICAgICBuZXdUcmFjay5waHlzaWNhbFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgbmV3VHJhY2suZHJvcHBlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHNtb290aCBvdXQgdGhlIG5ldyB0cmFjaywgc2VlICMxNzdcclxuICAgICAgY29uc3Qgc21vb3RoaW5nUG9pbnQgPSBjb250cm9sUG9pbnRJbmRleCA+PSBuZXdUcmFjay5jb250cm9sUG9pbnRzLmxlbmd0aCA/IG5ld1RyYWNrLmNvbnRyb2xQb2ludHMubGVuZ3RoIC0gMSA6IGNvbnRyb2xQb2ludEluZGV4O1xyXG4gICAgICBuZXdUcmFjay5zbW9vdGgoIHNtb290aGluZ1BvaW50ICk7XHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIG5ldyB0cmFjayBkb2Vzbid0IGdvIHVuZGVyZ3JvdW5kIGFmdGVyIGEgY29udHJvbCBwb2ludCBpcyBkZWxldGVkLCBzZWUgIzE3NFxyXG4gICAgICBuZXdUcmFjay5idW1wQWJvdmVHcm91bmQoKTtcclxuXHJcbiAgICAgIHRoaXMudHJhY2tzLmFkZCggbmV3VHJhY2sgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gdGhlIGVudGlyZSB0cmFjayBpcyBkZWxldGVkLCBzbyB3ZSBtdXN0IGRpc3Bvc2UgdGhlIG90aGVyIGNvbnRyb2wgcG9pbnRzXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRyYWNrLmNvbnRyb2xQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY29udHJvbFBvaW50ID0gdHJhY2suY29udHJvbFBvaW50c1sgaSBdO1xyXG4gICAgICAgIHRoaXMuY29udHJvbFBvaW50R3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNvbnRyb2xQb2ludCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJpZ2dlciB0cmFjayBjaGFuZ2VkIGZpcnN0IHRvIHVwZGF0ZSB0aGUgZWRpdCBlbmFibGVkIHByb3BlcnRpZXNcclxuICAgIHRoaXMudHJhY2tDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHNrYXRlciB3YXMgb24gdHJhY2ssIHRoZW4gaGUgc2hvdWxkIGZhbGwgb2ZmXHJcbiAgICBpZiAoIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgPT09IHRyYWNrICkge1xyXG4gICAgICB0aGlzLnNrYXRlci50cmFja1Byb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB1c2VyIGhhcyBwcmVzc2VkIHRoZSBcImRlbGV0ZVwiIGJ1dHRvbiBmb3IgdGhlIHNwZWNpZmllZCB0cmFjaydzIHNwZWNpZmllZCBjb250cm9sIHBvaW50LCBhbmQgaXQgc2hvdWxkIGJlXHJcbiAgICogZGVsZXRlZC4gSXQgc2hvdWxkIGJlIGFuIGlubmVyIHBvaW50IG9mIGEgdHJhY2sgKG5vdCBhbiBlbmRwb2ludCkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmFja30gdHJhY2tcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY29udHJvbFBvaW50SW5kZXggLSBpbnRlZ2VyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1vZGVsQW5nbGVcclxuICAgKi9cclxuICBzcGxpdENvbnRyb2xQb2ludCggdHJhY2ssIGNvbnRyb2xQb2ludEluZGV4LCBtb2RlbEFuZ2xlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhY2suc3BsaXR0YWJsZSwgJ3RyeWluZyB0byBzcGxpdCBhIHRyYWNrIHRoYXQgaXMgbm90IHNwbGl0dGFibGUhJyApO1xyXG4gICAgY29uc3QgY29udHJvbFBvaW50VG9TcGxpdCA9IHRyYWNrLmNvbnRyb2xQb2ludHNbIGNvbnRyb2xQb2ludEluZGV4IF07XHJcblxyXG4gICAgY29uc3QgdmVjdG9yID0gVmVjdG9yMi5jcmVhdGVQb2xhciggMC41LCBtb2RlbEFuZ2xlICk7XHJcbiAgICBjb25zdCBuZXdQb2ludDEgPSB0aGlzLmNvbnRyb2xQb2ludEdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICB0cmFjay5jb250cm9sUG9pbnRzWyBjb250cm9sUG9pbnRJbmRleCBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueCAtIHZlY3Rvci54LFxyXG4gICAgICB0cmFjay5jb250cm9sUG9pbnRzWyBjb250cm9sUG9pbnRJbmRleCBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueSAtIHZlY3Rvci55XHJcbiAgICApO1xyXG4gICAgY29uc3QgbmV3UG9pbnQyID0gdGhpcy5jb250cm9sUG9pbnRHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgdHJhY2suY29udHJvbFBvaW50c1sgY29udHJvbFBvaW50SW5kZXggXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKyB2ZWN0b3IueCxcclxuICAgICAgdHJhY2suY29udHJvbFBvaW50c1sgY29udHJvbFBvaW50SW5kZXggXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyB2ZWN0b3IueVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBwb2ludHMxID0gdHJhY2suY29udHJvbFBvaW50cy5zbGljZSggMCwgY29udHJvbFBvaW50SW5kZXggKTtcclxuICAgIGNvbnN0IHBvaW50czIgPSB0cmFjay5jb250cm9sUG9pbnRzLnNsaWNlKCBjb250cm9sUG9pbnRJbmRleCArIDEsIHRyYWNrLmNvbnRyb2xQb2ludHMubGVuZ3RoICk7XHJcblxyXG4gICAgcG9pbnRzMS5wdXNoKCBuZXdQb2ludDEgKTtcclxuICAgIHBvaW50czIudW5zaGlmdCggbmV3UG9pbnQyICk7XHJcblxyXG4gICAgY29uc3QgbmV3VHJhY2sxID0gdGhpcy50cmFja0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBwb2ludHMxLCB0cmFjay5nZXRQYXJlbnRzT3JTZWxmKCksIFRyYWNrLkZVTExZX0lOVEVSQUNUSVZFX09QVElPTlMgKTtcclxuICAgIG5ld1RyYWNrMS5waHlzaWNhbFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIG5ld1RyYWNrMS5kcm9wcGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgY29uc3QgbmV3VHJhY2syID0gdGhpcy50cmFja0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBwb2ludHMyLCB0cmFjay5nZXRQYXJlbnRzT3JTZWxmKCksIFRyYWNrLkZVTExZX0lOVEVSQUNUSVZFX09QVElPTlMgKTtcclxuICAgIG5ld1RyYWNrMi5waHlzaWNhbFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIG5ld1RyYWNrMi5kcm9wcGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgIHRyYWNrLnJlbW92ZUVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgdGhpcy5yZW1vdmVBbmREaXNwb3NlVHJhY2soIHRyYWNrICk7XHJcblxyXG4gICAgdGhpcy50cmFja3MuYWRkKCBuZXdUcmFjazEgKTtcclxuICAgIHRoaXMudHJhY2tzLmFkZCggbmV3VHJhY2syICk7XHJcblxyXG4gICAgLy8gU21vb3RoIHRoZSBuZXcgdHJhY2tzLCBzZWUgIzE3N1xyXG4gICAgbmV3VHJhY2sxLnNtb290aCggY29udHJvbFBvaW50SW5kZXggLSAxICk7XHJcbiAgICBuZXdUcmFjazIuc21vb3RoKCAwICk7XHJcblxyXG4gICAgLy8gVHJpZ2dlciB0cmFjayBjaGFuZ2VkIGZpcnN0IHRvIHVwZGF0ZSB0aGUgZWRpdCBlbmFibGVkIHByb3BlcnRpZXNcclxuICAgIHRoaXMudHJhY2tDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHNrYXRlciB3YXMgb24gdHJhY2ssIHRoZW4gaGUgc2hvdWxkIGZhbGwgb2ZmLCBzZWUgIzk3XHJcbiAgICBpZiAoIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgPT09IHRyYWNrICkge1xyXG4gICAgICB0aGlzLnNrYXRlci50cmFja1Byb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBhIGNvbnRyb2wgcG9pbnQgd2FzIHNwbGl0IGFuZCB0aGF0IG1ha2VzIHRvbyBtYW55IFwibGl2ZVwiIGNvbnRyb2wgcG9pbnRzIHRvdGFsLCByZW1vdmUgYSBwaWVjZSBvZiB0cmFjayBmcm9tXHJcbiAgICAvLyB0aGUgdG9vbGJveCB0byBrZWVwIHRoZSB0b3RhbCBudW1iZXIgb2YgY29udHJvbCBwb2ludHMgbG93IGVub3VnaC5cclxuICAgIGlmICggdGhpcy5nZXROdW1iZXJPZkNvbnRyb2xQb2ludHMoKSA+IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cy5NQVhfTlVNQkVSX0NPTlRST0xfUE9JTlRTICkge1xyXG4gICAgICAvLyBmaW5kIGEgbm9ucGh5c2ljYWwgdHJhY2ssIHRoZW4gcmVtb3ZlIGl0XHJcblxyXG4gICAgICBjb25zdCB0cmFja1RvUmVtb3ZlID0gdGhpcy5nZXROb25QaHlzaWNhbFRyYWNrcygpWyAwIF07XHJcbiAgICAgIHRyYWNrVG9SZW1vdmUucmVtb3ZlRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIHRoaXMucmVtb3ZlQW5kRGlzcG9zZVRyYWNrKCB0cmFja1RvUmVtb3ZlICk7XHJcblxyXG4gICAgICB0cmFja1RvUmVtb3ZlLmRpc3Bvc2VDb250cm9sUG9pbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlzcG9zZSB0aGUgY29udHJvbCBwb2ludCBpdHNlbGZcclxuICAgIHRoaXMuY29udHJvbFBvaW50R3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNvbnRyb2xQb2ludFRvU3BsaXQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEpvaW4gdGhlIHNwZWNpZmllZCB0cmFja3MgdG9nZXRoZXIgaW50byBhIHNpbmdsZSBuZXcgdHJhY2sgYW5kIGRlbGV0ZSB0aGUgb2xkIHRyYWNrcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYSB7VHJhY2t9XHJcbiAgICogQHBhcmFtIGIge1RyYWNrfVxyXG4gICAqL1xyXG4gIGpvaW5UcmFja1RvVHJhY2soIGEsIGIgKSB7XHJcbiAgICBjb25zdCBwb2ludHMgPSBbXTtcclxuICAgIGxldCBpO1xyXG5cclxuICAgIGNvbnN0IGZpcnN0VHJhY2tGb3J3YXJkID0gKCkgPT4ge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGEuY29udHJvbFBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBwb2ludHMucHVzaCggYS5jb250cm9sUG9pbnRzWyBpIF0uY29weSggdGhpcyApICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjb25zdCBmaXJzdFRyYWNrQmFja3dhcmQgPSAoKSA9PiB7XHJcbiAgICAgIGZvciAoIGkgPSBhLmNvbnRyb2xQb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgcG9pbnRzLnB1c2goIGEuY29udHJvbFBvaW50c1sgaSBdLmNvcHkoIHRoaXMgKSApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3Qgc2Vjb25kVHJhY2tGb3J3YXJkID0gKCkgPT4ge1xyXG4gICAgICBmb3IgKCBpID0gMTsgaSA8IGIuY29udHJvbFBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBwb2ludHMucHVzaCggYi5jb250cm9sUG9pbnRzWyBpIF0uY29weSggdGhpcyApICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjb25zdCBzZWNvbmRUcmFja0JhY2t3YXJkID0gKCkgPT4ge1xyXG4gICAgICBmb3IgKCBpID0gYi5jb250cm9sUG9pbnRzLmxlbmd0aCAtIDI7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgIHBvaW50cy5wdXNoKCBiLmNvbnRyb2xQb2ludHNbIGkgXS5jb3B5KCB0aGlzICkgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBPbmx5IGluY2x1ZGUgb25lIGNvcHkgb2YgdGhlIHNuYXBwZWQgcG9pbnRcclxuICAgIC8vIEZvcndhcmQgRm9yd2FyZFxyXG4gICAgaWYgKCBhLmNvbnRyb2xQb2ludHNbIGEuY29udHJvbFBvaW50cy5sZW5ndGggLSAxIF0uc25hcFRhcmdldFByb3BlcnR5LnZhbHVlID09PSBiLmNvbnRyb2xQb2ludHNbIDAgXSApIHtcclxuICAgICAgZmlyc3RUcmFja0ZvcndhcmQoKTtcclxuICAgICAgc2Vjb25kVHJhY2tGb3J3YXJkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRm9yd2FyZCBCYWNrd2FyZFxyXG4gICAgZWxzZSBpZiAoIGEuY29udHJvbFBvaW50c1sgYS5jb250cm9sUG9pbnRzLmxlbmd0aCAtIDEgXS5zbmFwVGFyZ2V0UHJvcGVydHkudmFsdWUgPT09IGIuY29udHJvbFBvaW50c1sgYi5jb250cm9sUG9pbnRzLmxlbmd0aCAtIDEgXSApIHtcclxuICAgICAgZmlyc3RUcmFja0ZvcndhcmQoKTtcclxuICAgICAgc2Vjb25kVHJhY2tCYWNrd2FyZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJhY2t3YXJkIEZvcndhcmRcclxuICAgIGVsc2UgaWYgKCBhLmNvbnRyb2xQb2ludHNbIDAgXS5zbmFwVGFyZ2V0UHJvcGVydHkudmFsdWUgPT09IGIuY29udHJvbFBvaW50c1sgMCBdICkge1xyXG4gICAgICBmaXJzdFRyYWNrQmFja3dhcmQoKTtcclxuICAgICAgc2Vjb25kVHJhY2tGb3J3YXJkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQmFja3dhcmQgYmFja3dhcmRcclxuICAgIGVsc2UgaWYgKCBhLmNvbnRyb2xQb2ludHNbIDAgXS5zbmFwVGFyZ2V0UHJvcGVydHkudmFsdWUgPT09IGIuY29udHJvbFBvaW50c1sgYi5jb250cm9sUG9pbnRzLmxlbmd0aCAtIDEgXSApIHtcclxuICAgICAgZmlyc3RUcmFja0JhY2t3YXJkKCk7XHJcbiAgICAgIHNlY29uZFRyYWNrQmFja3dhcmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXdUcmFjayA9IHRoaXMudHJhY2tHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggcG9pbnRzLCBhLmdldFBhcmVudHNPclNlbGYoKS5jb25jYXQoIGIuZ2V0UGFyZW50c09yU2VsZigpICksIFRyYWNrLkZVTExZX0lOVEVSQUNUSVZFX09QVElPTlMgKTtcclxuICAgIG5ld1RyYWNrLnBoeXNpY2FsUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgbmV3VHJhY2suZHJvcHBlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICBhLmRpc3Bvc2VDb250cm9sUG9pbnRzKCk7XHJcbiAgICBhLnJlbW92ZUVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgaWYgKCB0aGlzLnRyYWNrcy5pbmNsdWRlcyggYSApICkge1xyXG4gICAgICB0aGlzLnJlbW92ZUFuZERpc3Bvc2VUcmFjayggYSApO1xyXG4gICAgfVxyXG5cclxuICAgIGIuZGlzcG9zZUNvbnRyb2xQb2ludHMoKTtcclxuICAgIGIucmVtb3ZlRW1pdHRlci5lbWl0KCk7XHJcbiAgICBpZiAoIHRoaXMudHJhY2tzLmluY2x1ZGVzKCBiICkgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQW5kRGlzcG9zZVRyYWNrKCBiICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2hlbiB0cmFja3MgYXJlIGpvaW5lZCwgYnVtcCB0aGUgbmV3IHRyYWNrIGFib3ZlIGdyb3VuZCBzbyB0aGUgeSB2YWx1ZSAoYW5kIHBvdGVudGlhbCBlbmVyZ3kpIGNhbm5vdCBnbyBuZWdhdGl2ZSxcclxuICAgIC8vIGFuZCBzbyBpdCB3b24ndCBtYWtlIHRoZSBcInJldHVybiBza2F0ZXJcIiBidXR0b24gZ2V0IGJpZ2dlciwgc2VlICMxNThcclxuICAgIG5ld1RyYWNrLmJ1bXBBYm92ZUdyb3VuZCgpO1xyXG4gICAgdGhpcy50cmFja3MuYWRkKCBuZXdUcmFjayApO1xyXG5cclxuICAgIC8vIE1vdmUgc2thdGVyIHRvIG5ldyB0cmFjayBpZiBoZSB3YXMgb24gdGhlIG9sZCB0cmFjaywgYnkgc2VhcmNoaW5nIGZvciB0aGUgYmVzdCBmaXQgcG9pbnQgb24gdGhlIG5ldyB0cmFja1xyXG4gICAgLy8gTm90ZTogRW5lcmd5IGlzIG5vdCBjb25zZXJ2ZWQgd2hlbiB0cmFja3Mgam9pbmVkIHNpbmNlIHRoZSB1c2VyIGhhcyBhZGRlZCBvciByZW1vdmVkIGVuZXJneSBmcm9tIHRoZSBzeXN0ZW1cclxuICAgIGlmICggdGhpcy5za2F0ZXIudHJhY2tQcm9wZXJ0eS52YWx1ZSA9PT0gYSB8fCB0aGlzLnNrYXRlci50cmFja1Byb3BlcnR5LnZhbHVlID09PSBiICkge1xyXG5cclxuICAgICAgY29uc3Qgb3JpZ2luYWxEaXJlY3Rpb25WZWN0b3IgPSB0aGlzLnNrYXRlci50cmFja1Byb3BlcnR5LnZhbHVlLmdldFVuaXRQYXJhbGxlbFZlY3RvciggdGhpcy5za2F0ZXIucGFyYW1ldHJpY1Bvc2l0aW9uUHJvcGVydHkudmFsdWUgKS50aW1lcyggdGhpcy5za2F0ZXIucGFyYW1ldHJpY1NwZWVkUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIHNrYXRlciBkaXJlY3Rpb24gc28gd2UgY2FuIHRvZ2dsZSB0aGUgJ3VwJyBmbGFnIGlmIHRoZSB0cmFjayBvcmllbnRhdGlvbiBjaGFuZ2VkXHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsTm9ybWFsID0gdGhpcy5za2F0ZXIudXBWZWN0b3I7XHJcbiAgICAgIGNvbnN0IHAgPSBuZXdUcmFjay5nZXRDbG9zZXN0UG9zaXRpb25BbmRQYXJhbWV0ZXIoIHRoaXMuc2thdGVyLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuY29weSgpICk7XHJcbiAgICAgIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgPSBuZXdUcmFjaztcclxuICAgICAgdGhpcy5za2F0ZXIucGFyYW1ldHJpY1Bvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwLnBhcmFtZXRyaWNQb3NpdGlvbjtcclxuICAgICAgY29uc3QgeDIgPSBuZXdUcmFjay5nZXRYKCBwLnBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgICBjb25zdCB5MiA9IG5ld1RyYWNrLmdldFkoIHAucGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICAgIHRoaXMuc2thdGVyLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggeDIsIHkyICk7XHJcbiAgICAgIHRoaXMuc2thdGVyLmFuZ2xlUHJvcGVydHkudmFsdWUgPSBuZXdUcmFjay5nZXRWaWV3QW5nbGVBdCggcC5wYXJhbWV0cmljUG9zaXRpb24gKSArICggdGhpcy5za2F0ZXIub25Ub3BTaWRlT2ZUcmFja1Byb3BlcnR5LnZhbHVlID8gMCA6IE1hdGguUEkgKTtcclxuXHJcbiAgICAgIC8vIFRyaWdnZXIgYW4gaW5pdGlhbCB1cGRhdGUgbm93IHNvIHdlIGNhbiBnZXQgdGhlIHJpZ2h0IHVwIHZlY3Rvciwgc2VlICMxNTBcclxuICAgICAgdGhpcy5za2F0ZXIudXBkYXRlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICBjb25zdCBuZXdOb3JtYWwgPSB0aGlzLnNrYXRlci51cFZlY3RvcjtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBza2F0ZXIgZmxpcHBlZCB1cHNpZGUgZG93biBiZWNhdXNlIHRoZSB0cmFjayBkaXJlY3Rpb25hbGl0eSBpcyBkaWZmZXJlbnQsIHRvZ2dsZSBoaXMgJ3VwJyBmbGFnXHJcbiAgICAgIGlmICggb3JpZ2luYWxOb3JtYWwuZG90KCBuZXdOb3JtYWwgKSA8IDAgKSB7XHJcbiAgICAgICAgdGhpcy5za2F0ZXIub25Ub3BTaWRlT2ZUcmFja1Byb3BlcnR5LnZhbHVlID0gIXRoaXMuc2thdGVyLm9uVG9wU2lkZU9mVHJhY2tQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB0aGlzLnNrYXRlci5hbmdsZVByb3BlcnR5LnZhbHVlID0gbmV3VHJhY2suZ2V0Vmlld0FuZ2xlQXQoIHAucGFyYW1ldHJpY1Bvc2l0aW9uICkgKyAoIHRoaXMuc2thdGVyLm9uVG9wU2lkZU9mVHJhY2tQcm9wZXJ0eS52YWx1ZSA/IDAgOiBNYXRoLlBJICk7XHJcbiAgICAgICAgdGhpcy5za2F0ZXIudXBkYXRlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB0aGUgc2thdGVyIGNoYW5nZWQgZGlyZWN0aW9uIG9mIG1vdGlvbiBiZWNhdXNlIG9mIHRoZSB0cmFjayBwb2xhcml0eSBjaGFuZ2UsIGZsaXAgdGhlIHBhcmFtZXRyaWMgdmVsb2NpdHlcclxuICAgICAgLy8gJ3BhcmFtZXRyaWNTcGVlZCcgdmFsdWUsIHNlZSAjMTgwXHJcbiAgICAgIGNvbnN0IG5ld0RpcmVjdGlvblZlY3RvciA9IHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUuZ2V0VW5pdFBhcmFsbGVsVmVjdG9yKCB0aGlzLnNrYXRlci5wYXJhbWV0cmljUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLnRpbWVzKCB0aGlzLnNrYXRlci5wYXJhbWV0cmljU3BlZWRQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICBkZWJ1Z0F0dGFjaERldGFjaCAmJiBkZWJ1Z0F0dGFjaERldGFjaCggbmV3RGlyZWN0aW9uVmVjdG9yLmRvdCggb3JpZ2luYWxEaXJlY3Rpb25WZWN0b3IgKSApO1xyXG4gICAgICBpZiAoIG5ld0RpcmVjdGlvblZlY3Rvci5kb3QoIG9yaWdpbmFsRGlyZWN0aW9uVmVjdG9yICkgPCAwICkge1xyXG4gICAgICAgIHRoaXMuc2thdGVyLnBhcmFtZXRyaWNTcGVlZFByb3BlcnR5LnZhbHVlID0gLXRoaXMuc2thdGVyLnBhcmFtZXRyaWNTcGVlZFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2hlbiBqb2luaW5nIHRyYWNrcywgc21vb3RoIG91dCB0aGUgbmV3IHRyYWNrLCBidXQgd2l0aG91dCBtb3ZpbmcgdGhlIHBvaW50IHRoYXQgam9pbmVkIHRoZSB0cmFja3MsIHNlZSAjMTc3ICMyMzhcclxuICAgIG5ld1RyYWNrLnNtb290aFBvaW50T2ZIaWdoZXN0Q3VydmF0dXJlKCBbXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBhIHRyYWNrIGlzIGRyYWdnZWQgb3IgYSBjb250cm9sIHBvaW50IGlzIG1vdmVkLCB1cGRhdGUgdGhlIHNrYXRlcidzIGVuZXJneSAoaWYgdGhlIHNpbSB3YXMgcGF1c2VkKSwgc2luY2VcclxuICAgKiBpdCB3b3VsZG4ndCBiZSBoYW5kbGVkIGluIHRoZSB1cGRhdGUgbG9vcC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYWNrfSB0cmFja1xyXG4gICAqL1xyXG4gIHRyYWNrTW9kaWZpZWQoIHRyYWNrICkge1xyXG4gICAgaWYgKCB0aGlzLnBhdXNlZFByb3BlcnR5LnZhbHVlICYmIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgPT09IHRyYWNrICkge1xyXG4gICAgICB0aGlzLnNrYXRlci51cGRhdGVFbmVyZ3koKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGbGFnIHRoZSB0cmFjayBhcyBoYXZpbmcgY2hhbmdlZCAqdGhpcyBmcmFtZSogc28gZW5lcmd5IGRvZXNuJ3QgbmVlZCB0byBiZSBjb25zZXJ2ZWQgZHVyaW5nIHRoaXMgZnJhbWUsIHNlZSAjMTI3XHJcbiAgICB0aGlzLnRyYWNrQ2hhbmdlUGVuZGluZyA9IHRydWU7XHJcblxyXG4gICAgLy8gZW1pdCBhIG1lc3NhZ2UgaW5kaWNhdGluZyB0aGF0IHRoZSB0cmFjayBoYXMgY2hhbmdlZCBpbiBzb21lIHdheVxyXG4gICAgdGhpcy50cmFja0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHBoeXNpY2FsIGNvbnRyb2wgcG9pbnRzIChjb250cm9sIHBvaW50cyBhdHRhY2hlZCB0byBhIHRyYWNrIHRoYXQgdGhlIFNrYXRlciBjYW4gaW50ZXJhY3Qgd2l0aClcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE51bWJlck9mUGh5c2ljYWxDb250cm9sUG9pbnRzKCkge1xyXG4gICAgY29uc3QgbnVtYmVyT2ZQb2ludHNJbkVhY2hUcmFjayA9IF8ubWFwKCB0aGlzLmdldFBoeXNpY2FsVHJhY2tzKCksIHRyYWNrID0+IHtyZXR1cm4gdHJhY2suY29udHJvbFBvaW50cy5sZW5ndGg7fSApO1xyXG4gICAgcmV0dXJuIF8ucmVkdWNlKCBudW1iZXJPZlBvaW50c0luRWFjaFRyYWNrLCAoIG1lbW8sIG51bSApID0+IG1lbW8gKyBudW0sIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIGFsbCBjb250cm9sIHBvaW50cyBmb3IgdGhpcyBtb2RlbCdzIHRyYWNrcyAoaW5jbHVkaW5nIHRob3NlIHRoYXQgYXJlIG5vdCBwaHlzaWNhbCwgbGlrZVxyXG4gICAqIG9uZXMgaW4gdGhlIHRvb2xib3gpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXROdW1iZXJPZkNvbnRyb2xQb2ludHMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFja3MucmVkdWNlKCAoIHRvdGFsLCB0cmFjayApID0+IHRvdGFsICsgdHJhY2suY29udHJvbFBvaW50cy5sZW5ndGgsIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExvZ2ljIHRvIGRldGVybWluZSB3aGV0aGVyIGEgY29udHJvbCBwb2ludCBjYW4gYmUgYWRkZWQgYnkgY3V0dGluZyBhIHRyYWNrJ3MgY29udHJvbCBwb2ludCBpbiB0d28uIFRoaXNcclxuICAgKiBpcyBmZWFzaWJsZSBpZiB0aGUgbnVtYmVyIG9mIGNvbnRyb2wgcG9pbnRzIGluIHRoZSBwbGF5IGFyZWEgYWJvdmUgZ3JvdW5kIGlzIGxlc3MgdGhhbiBtYXhpbXVtIG51bWJlci5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjYW5DdXRUcmFja0NvbnRyb2xQb2ludCgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldE51bWJlck9mUGh5c2ljYWxDb250cm9sUG9pbnRzKCkgPCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuTUFYX05VTUJFUl9DT05UUk9MX1BPSU5UUztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIG1vZGVsIGNvbnRhaW5zIGEgdHJhY2sgc28gdGhhdCBpbnB1dCBsaXN0ZW5lcnMgZm9yIGRldGFjaGVkIGVsZW1lbnRzIGNhbid0IGNyZWF0ZSBidWdzLlxyXG4gICAqIFNlZSAjMjMwXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmFja30gdHJhY2tcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb250YWluc1RyYWNrKCB0cmFjayApIHtcclxuICAgIHJldHVybiB0aGlzLnRyYWNrcy5pbmNsdWRlcyggdHJhY2sgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBieSBwaGV0LWlvIHRvIGNsZWFyIG91dCB0aGUgbW9kZWwgc3RhdGUgYmVmb3JlIHJlc3RvcmluZyBjaGlsZCB0cmFja3MuXHJcbiAgICogQHB1YmxpYyAocGhldC1pbylcclxuICAgKi9cclxuICByZW1vdmVBbGxUcmFja3MoKSB7XHJcbiAgICB3aGlsZSAoIHRoaXMudHJhY2tzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGNvbnN0IHRyYWNrID0gdGhpcy50cmFja3MuZ2V0KCAwICk7XHJcbiAgICAgIHRyYWNrLmRpc3Bvc2VDb250cm9sUG9pbnRzKCk7XHJcbiAgICAgIHRoaXMucmVtb3ZlQW5kRGlzcG9zZVRyYWNrKCB0cmFjayApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBwb2ludCBpcyBob3Jpem9udGFsbHkgY29udGFpbmVkIHdpdGhpbiB0aGUgYm91bmRzIHJhbmdlLCBhbmQgYW55d2hlcmVcclxuICogYmVsb3cgdGhlIG1heGltdW0gWSB2YWx1ZS4gVmlzdWFsbHksIHRoaXMgd2lsbCBiZSBhYm92ZSBzaW5jZSB5IGlzIGludmVydGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gKiBAcGFyYW0ge251bWJlcn0geFxyXG4gKiBAcGFyYW0ge251bWJlcn0geVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGNvbnRhaW5zQWJvdmUgPSAoIGJvdW5kcywgeCwgeSApID0+IHtcclxuICByZXR1cm4gYm91bmRzLm1pblggPD0geCAmJiB4IDw9IGJvdW5kcy5tYXhYICYmIHkgPD0gYm91bmRzLm1heFk7XHJcbn07XHJcblxyXG5FbmVyZ3lTa2F0ZVBhcmtNb2RlbC5FbmVyZ3lTa2F0ZVBhcmtNb2RlbElPID0gbmV3IElPVHlwZSggJ0VuZXJneVNrYXRlUGFya01vZGVsSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBFbmVyZ3lTa2F0ZVBhcmtNb2RlbCxcclxuICBkb2N1bWVudGF0aW9uOiAnVGhlIG1vZGVsIGZvciB0aGUgU2thdGUgUGFyay4nXHJcbn0gKTtcclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0VuZXJneVNrYXRlUGFya01vZGVsJywgRW5lcmd5U2thdGVQYXJrTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgRW5lcmd5U2thdGVQYXJrTW9kZWw7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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