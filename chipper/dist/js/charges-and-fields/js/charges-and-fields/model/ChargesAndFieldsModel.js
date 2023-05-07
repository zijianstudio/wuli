// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargedParticle from './ChargedParticle.js';
import ElectricFieldSensor from './ElectricFieldSensor.js';
import ElectricPotentialLine from './ElectricPotentialLine.js';
import ElectricPotentialSensor from './ElectricPotentialSensor.js';
import MeasuringTape from './MeasuringTape.js';
import ModelElement from './ModelElement.js';

// constants
const GRID_MINOR_SPACING = ChargesAndFieldsConstants.GRID_MAJOR_SPACING / ChargesAndFieldsConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
const K_CONSTANT = ChargesAndFieldsConstants.K_CONSTANT;
const HEIGHT = ChargesAndFieldsConstants.HEIGHT;
const WIDTH = ChargesAndFieldsConstants.WIDTH;

// To avoid bugs, do not try to compute E-field at length scales smaller than MIN_DISTANCE_SCALE
const MIN_DISTANCE_SCALE = 1e-9;

// TODO: why is this phet-io instrumented?
class ChargesAndFieldsModel extends PhetioObject {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    super({
      tandem: tandem,
      phetioState: false
    });

    // @public (read-write) {function} - supplied by the view to indicate when the charges and sensors panel is visible
    // used to determine if charges can be dropped in the toolbox, see https://github.com/phetsims/phet-io/issues/915
    this.isChargesAndSensorsPanelDisplayed = null;

    // For performance reasons there are two visibility properties that are strongly tied to the model hence the reason they appear here.
    // The other visibility properties can be found in the ChargesAndFieldsScreenView file

    // @public {Property.<boolean>} control the visibility of a grid of arrows representing the local electric field
    this.isElectricFieldVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isElectricFieldVisibleProperty')
    });

    // @public {Property.<boolean>} controls the color shading in the fill of the electric field arrows
    this.isElectricFieldDirectionOnlyProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isElectricFieldDirectionOnlyProperty')
    });

    // @public {Property.<boolean>} control the visibility of the electric potential field, a.k.a. rectangular grid
    this.isElectricPotentialVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isElectricPotentialVisibleProperty')
    });

    // @public {Property.<boolean>} control the visibility of many numerical values ( e field sensors, electricPotential lines, etc)
    this.areValuesVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('areValuesVisibleProperty')
    });

    // @public {Property.<boolean>} control the visibility of the simple grid with minor and major axes
    this.isGridVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isGridVisibleProperty')
    });

    // @public {Property.<boolean>} should we snap the position of model elements to the grid (minor or major)
    this.snapToGridProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('snapToGridProperty')
    });

    // @public {Property.<boolean>} is there at least one active charged particle on the board
    this.isPlayAreaChargedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isPlayAreaChargedProperty')
    });

    // @public {Property.<boolean>} whether adding positive charges is allowed (and displayed) in general
    this.allowNewPositiveChargesProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('allowNewPositiveChargesProperty')
    });

    // @public {Property.<boolean>} whether adding negative charges is allowed (and displayed) in general
    this.allowNewNegativeChargesProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('allowNewNegativeChargesProperty')
    });

    // @public {Property.<boolean>} whether adding electric field sensors is allowed (and displayed) in general
    this.allowNewElectricFieldSensorsProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('allowNewElectricFieldSensorsProperty')
    });

    // @public {Property.<Bounds2>} in meters
    this.chargesAndSensorsEnclosureBoundsProperty = new Property(new Bounds2(-1.25, -2.30, 1.25, -1.70), {
      tandem: tandem.createTandem('chargesAndSensorsEnclosureBoundsProperty'),
      phetioValueType: Bounds2.Bounds2IO
    });

    //----------------------------------------------------------------------------------------
    // Initialize variables
    //----------------------------------------------------------------------------------------

    this.isResetting = false; // is the model being reset, necessary flag to address performance issues in the reset process

    // @public read-only
    this.bounds = new Bounds2(-WIDTH / 2, -HEIGHT / 2, WIDTH / 2, HEIGHT / 2); // bounds of the model (for the nominal view)

    // @public read-only
    this.enlargedBounds = new Bounds2(-1.5 * WIDTH / 2, -HEIGHT / 2, 1.5 * WIDTH / 2, 3 * HEIGHT / 2); // bounds of the model (for the enlarged view)

    // @public {PhetioGroup.<ChargedParticle>} group of draggable electric charges
    this.chargedParticleGroup = new PhetioGroup((tandem, charge, initialPosition) => {
      const chargedParticle = new ChargedParticle(charge, initialPosition, {
        tandem: tandem
      });
      chargedParticle.returnedToOriginEmitter.addListener(() => this.chargedParticleGroup.disposeElement(chargedParticle));
      return chargedParticle;
    }, [1, Vector2.ZERO], {
      tandem: tandem.createTandem('chargedParticleGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(ChargedParticle.ChargedParticleIO),
      phetioDynamicElementName: 'particle'
    });
    const chargedParticleGroup = this.chargedParticleGroup;

    // Observable array of all active electric charges (i.e. isActive is true for the chargeParticle(s) in this array)
    // This is the relevant array to calculate the electric field, and electric potential
    // @public {ObservableArrayDef.<ChargedParticle>}
    this.activeChargedParticles = createObservableArray({
      phetioType: createObservableArray.ObservableArrayIO(ChargedParticle.ChargedParticleIO)
    });

    // @public {PhetioGroup.<ElectricFieldSensor>} Observable group of electric field sensors
    this.electricFieldSensorGroup = new PhetioGroup((tandem, initialPosition) => {
      const sensor = new ElectricFieldSensor(this.getElectricField.bind(this), initialPosition, tandem);
      sensor.returnedToOriginEmitter.addListener(() => this.electricFieldSensorGroup.disposeElement(sensor));
      return sensor;
    }, [Vector2.ZERO], {
      tandem: tandem.createTandem('electricFieldSensorGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(ModelElement.ModelElementIO)
    }); // {ObservableArrayDef.<ElectricFieldSensor>}
    const electricFieldSensorGroup = this.electricFieldSensorGroup;

    // @public - electric potential sensor
    this.electricPotentialSensor = new ElectricPotentialSensor(this.getElectricPotential.bind(this), tandem.createTandem('electricPotentialSensor'));
    this.measuringTape = new MeasuringTape(tandem.createTandem('measuringTape'));

    // @public - emits whenever the charge model changes, i.e. charges added/removed/moved
    this.chargeConfigurationChangedEmitter = new Emitter();

    // @public read-only {PhetioGroup.<ElectricPotentialLine>} group of electric potential lines
    this.electricPotentialLineGroup = new PhetioGroup((tandem, position) => {
      assert && assert(position instanceof Vector2, 'position should be Vector2');
      assert && assert(tandem instanceof Tandem, 'tandem should be a Tandem');

      // for chaining and for PhET-iO restore state
      return new ElectricPotentialLine(this, position, tandem);
    }, [this.electricPotentialSensor.positionProperty.get()], {
      tandem: tandem.createTandem('electricPotentialLineGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(ElectricPotentialLine.ElectricPotentialLineIO)
    });

    //----------------------------------------------------------------------------------------
    //
    // Hook up all the listeners the model
    //
    //----------------------------------------------------------------------------------------

    this.snapToGridProperty.link(snapToGrid => {
      if (snapToGrid) {
        this.snapAllElements();
      }
    });

    //------------------------
    // AddItem Added Listener on the charged Particles Observable Array
    //------------------------

    // the following logic is the crux of the simulation
    this.chargedParticleGroup.elementCreatedEmitter.addListener(addedChargedParticle => {
      const userControlledListener = isUserControlled => {
        // determine if the charge particle is no longer controlled by the user and is inside the enclosure
        if (!isUserControlled &&
        // only drop in if the toolbox is showing (may be hidden by phet-io)
        this.isChargesAndSensorsPanelDisplayed && this.isChargesAndSensorsPanelDisplayed() && this.chargesAndSensorsEnclosureBoundsProperty.get().containsPoint(addedChargedParticle.positionProperty.get())) {
          addedChargedParticle.isActiveProperty.set(false); // charge is no longer active, (effectively) equivalent to set its model charge to zero
          addedChargedParticle.animate(); // animate the charge to its destination position
        }
      };

      addedChargedParticle.isUserControlledProperty.link(userControlledListener);
      const isActiveListener = isActive => {
        // clear all electricPotential lines, i.e. remove all elements from the electricPotentialLineGroup
        this.clearElectricPotentialLines();
        if (isActive) {
          // add particle to the activeChargedParticle observable array
          // use for the webGlNode
          this.activeChargedParticles.push(addedChargedParticle);
        } else {
          // remove particle from the activeChargeParticle array
          this.activeChargedParticles.remove(addedChargedParticle);
        }
        // update the status of the isPlayAreaCharged,  to find is there is at least one active charge particle on board
        this.updateIsPlayAreaCharged();

        // update the two grid sensors (if they are set to visible), the electric fields sensors and the electricPotential sensor
        this.updateAllSensors();
        this.chargeConfigurationChangedEmitter.emit();
      };
      addedChargedParticle.isActiveProperty.lazyLink(isActiveListener);

      // position and oldPosition refer to a charged particle
      const positionListener = (position, oldPosition) => {
        this.updateIsPlayAreaCharged();

        // verify that the charge isActive before doing any charge-dependent updates to the model
        if (addedChargedParticle.isActiveProperty.get()) {
          // remove electricPotential lines when the position of a charged particle changes and the charge isActive
          this.clearElectricPotentialLines();

          // update the electricPotential and electricField sensors
          this.updateAllSensors();
        } // end of if (isActive) statement
        this.chargeConfigurationChangedEmitter.emit();
      };
      addedChargedParticle.positionProperty.link(positionListener);

      // remove listeners when a chargedParticle is removed
      chargedParticleGroup.elementDisposedEmitter.addListener(function removalListener(removedChargeParticle) {
        if (removedChargeParticle === addedChargedParticle) {
          addedChargedParticle.isUserControlledProperty.unlink(userControlledListener);
          addedChargedParticle.isActiveProperty.unlink(isActiveListener);
          addedChargedParticle.positionProperty.unlink(positionListener);
          chargedParticleGroup.elementDisposedEmitter.removeListener(removalListener);
        }
      });
    });

    //------------------------
    // AddItem Removed Listener on the charged Particles Observable Array
    //------------------------

    this.chargedParticleGroup.elementDisposedEmitter.addListener(removedChargeParticle => {
      // check that the particle was active before updating charge dependent model components
      if (removedChargeParticle.isActiveProperty.get() && !this.isResetting) {
        // Remove electricPotential lines
        this.clearElectricPotentialLines();

        // Update all the visible sensors
        this.updateAllSensors();
      }

      // remove particle from the activeChargedParticles array
      if (this.activeChargedParticles.includes(removedChargeParticle)) {
        this.activeChargedParticles.remove(removedChargeParticle);
      }

      // update the property isPlayAreaCharged to see if is there at least one active charge on the board
      this.updateIsPlayAreaCharged();
      this.chargeConfigurationChangedEmitter.emit();
    });

    //------------------------
    // AddItem Added Listener on the electric Field Sensors Observable Array
    //------------------------

    this.electricFieldSensorGroup.elementCreatedEmitter.addListener(addedElectricFieldSensor => {
      // Listener for sensor position changes
      const positionListener = position => {
        addedElectricFieldSensor.electricField = this.getElectricField(position);
      };

      // update the Electric Field Sensors upon a change of its own position
      addedElectricFieldSensor.positionProperty.link(positionListener);
      const userControlledListener = isUserControlled => {
        // determine if the sensor is no longer controlled by the user and is inside the enclosure
        if (!isUserControlled &&
        // only drop in if the toolbox is showing (maybe hidden by phet-io)
        this.isChargesAndSensorsPanelDisplayed && this.isChargesAndSensorsPanelDisplayed() && this.chargesAndSensorsEnclosureBoundsProperty.get().containsPoint(addedElectricFieldSensor.positionProperty.get())) {
          addedElectricFieldSensor.isActiveProperty.set(false);
          addedElectricFieldSensor.animate();
        }
      };
      addedElectricFieldSensor.isUserControlledProperty.link(userControlledListener);

      // remove listeners when an electricFieldSensor is removed
      electricFieldSensorGroup.elementDisposedEmitter.addListener(function removalListener(removedElectricFieldSensor) {
        if (removedElectricFieldSensor === addedElectricFieldSensor) {
          addedElectricFieldSensor.isUserControlledProperty.unlink(userControlledListener);
          addedElectricFieldSensor.positionProperty.unlink(positionListener);
          electricFieldSensorGroup.elementDisposedEmitter.removeListener(removalListener);
        }
      });
    });
  }

  /**
   * Reset function
   * @public
   */
  reset() {
    // we want to avoid the cost of constantly re-updating the grids when clearing chargedParticleGroup
    // so we set the flag isResetting to true.
    this.isResetting = true;
    this.isElectricFieldVisibleProperty.reset();
    this.isElectricFieldDirectionOnlyProperty.reset();
    this.isElectricPotentialVisibleProperty.reset();
    this.areValuesVisibleProperty.reset();
    this.isGridVisibleProperty.reset();
    this.isPlayAreaChargedProperty.reset();
    this.allowNewPositiveChargesProperty.reset();
    this.allowNewNegativeChargesProperty.reset();
    this.allowNewElectricFieldSensorsProperty.reset();
    this.chargesAndSensorsEnclosureBoundsProperty.reset();
    this.chargedParticleGroup.clear(); // clear all the charges
    this.activeChargedParticles.clear(); // clear all the active charges
    this.electricFieldSensorGroup.clear(); // clear all the electric field sensors
    this.electricPotentialLineGroup.clear(); // clear the electricPotential 'lines'
    this.electricPotentialSensor.reset(); // reposition the electricPotentialSensor
    this.measuringTape.reset();
    this.isResetting = false; // done with the resetting process
  }

  /**
   * Adds a positive charge to the model, and returns it.
   * @public
   *
   * @param {Vector2} initialPosition
   * @returns {ChargedParticle}
   */
  addPositiveCharge(initialPosition) {
    return this.chargedParticleGroup.createNextElement(1, initialPosition);
  }

  /**
   * Adds a negative charge to the model, and returns it.
   * @public
   *
   * @param {Vector2} initialPosition
   * @returns {ChargedParticle}
   */
  addNegativeCharge(initialPosition) {
    return this.chargedParticleGroup.createNextElement(-1, initialPosition);
  }

  /**
   * Adds an electric field sensor to the model, and returns it.
   * @param {Vector2} initialPosition
   * @public
   */
  addElectricFieldSensor(initialPosition) {
    return this.electricFieldSensorGroup.createNextElement(initialPosition);
  }

  /**
   * Function that determines if there is at least one active and "uncompensated" charge
   * on the board. If this is not the case, it implies that the E-field is zero everywhere
   * (see https://github.com/phetsims/charges-and-fields/issues/46)
   * @private
   */
  updateIsPlayAreaCharged() {
    let netElectricCharge = 0; // {number} Total electric charge on screen
    let numberActiveChargedParticles = 0; // {number} Total active charged particles on screen

    this.activeChargedParticles.forEach(chargedParticle => {
      numberActiveChargedParticles++;
      netElectricCharge += chargedParticle.charge;
    });

    // If net charge is nonzero, there must be an electric field (by Gauss's law)
    if (netElectricCharge !== 0) {
      this.isPlayAreaChargedProperty.set(true);
    }

    // No charged particles on screen, hence no electric field
    else if (numberActiveChargedParticles === 0) {
      this.isPlayAreaChargedProperty.set(false);
    }

    // If this is a pair, it must be a +- pair. If charges are co-located, don't show field.
    else if (numberActiveChargedParticles === 2) {
      // {boolean} indicator for a co-located pair
      const colocated = this.activeChargedParticles.get(1).positionProperty.get().minus(this.activeChargedParticles.get(0).positionProperty.get()).magnitude < MIN_DISTANCE_SCALE;
      this.isPlayAreaChargedProperty.set(!colocated);
      if (colocated) {
        this.electricField = Vector2.ZERO;
      }
    }

    // Check for two compensating pairs
    else if (numberActiveChargedParticles === 4) {
      const positiveChargePositionArray = [];
      const negativeChargePositionArray = [];
      this.activeChargedParticles.forEach(chargedParticle => {
        if (chargedParticle.charge === 1) {
          positiveChargePositionArray.push(chargedParticle.positionProperty.get());
        } else {
          negativeChargePositionArray.push(chargedParticle.positionProperty.get());
        }
      });
      if (negativeChargePositionArray[0].equals(positiveChargePositionArray[0]) && negativeChargePositionArray[1].equals(positiveChargePositionArray[1]) || negativeChargePositionArray[0].equals(positiveChargePositionArray[1]) && negativeChargePositionArray[1].equals(positiveChargePositionArray[0])) {
        this.isPlayAreaChargedProperty.set(false);
        this.electricField = Vector2.ZERO;
      } else {
        this.isPlayAreaChargedProperty.set(true);
      }
    }
    // for more than six charges
    else {
      // there are cases with six charges (and above) that can be compensated
      // however it is quite expensive to make this type of check as well as
      // incredibly unlikely to be the case in the first place.
      this.isPlayAreaChargedProperty.set(true);
    }
  }

  /**
   * Update all sensors
   * @private
   */
  updateAllSensors() {
    this.electricPotentialSensor.update();
    for (let i = 0; i < this.electricFieldSensorGroup.count; i++) {
      this.electricFieldSensorGroup.getElement(i).update();
    }
  }

  /**
   * Return the electric field (a vector) at the given position
   * @private
   * @param {Vector2} position - position of sensor
   * @returns {Vector2} electricField
   */
  getElectricField(position) {
    const electricField = new Vector2(0, 0);
    this.activeChargedParticles.forEach(chargedParticle => {
      const distanceSquared = chargedParticle.positionProperty.get().distanceSquared(position);

      // Avoid bugs stemming from large or infinite fields (#82, #84, #85).
      // Assign the E-field an angle of zero and a magnitude well above the maximum allowed value.
      if (distanceSquared < MIN_DISTANCE_SCALE) {
        electricField.x = 10 * ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE;
        electricField.y = 0;
        return;
      }
      const distancePowerCube = Math.pow(distanceSquared, 1.5);

      // For performance reasons, we don't want to generate more vector allocations
      const electricFieldContribution = {
        x: (position.x - chargedParticle.positionProperty.get().x) * chargedParticle.charge / distancePowerCube,
        y: (position.y - chargedParticle.positionProperty.get().y) * chargedParticle.charge / distancePowerCube
      };
      electricField.add(electricFieldContribution);
    });
    electricField.multiplyScalar(K_CONSTANT); // prefactor depends on units
    return electricField;
  }

  /**
   * Return the electric potential at the given position due to the configuration of charges on the board.
   * @public read-Only
   * @param {Vector2} position
   * @returns {number} electricPotential
   */
  getElectricPotential(position) {
    let electricPotential = 0;
    if (!this.isPlayAreaChargedProperty.get()) {
      return electricPotential;
    }
    const netChargeOnSite = this.getCharge(position); // the net charge at position

    if (netChargeOnSite > 0) {
      return Number.POSITIVE_INFINITY;
    } else if (netChargeOnSite < 0) {
      return Number.NEGATIVE_INFINITY;
    } else {
      this.activeChargedParticles.forEach(chargedParticle => {
        const distance = chargedParticle.positionProperty.get().distance(position);
        if (distance > 0) {
          electricPotential += chargedParticle.charge / distance;
        }
      });
      electricPotential *= K_CONSTANT; // prefactor depends on units
      return electricPotential;
    }
  }

  /**
   * get local charge at this position
   * @private
   * @param {Vector2} position
   * @returns {number}
   */
  getCharge(position) {
    let charge = 0;
    this.activeChargedParticles.forEach(chargedParticle => {
      if (chargedParticle.positionProperty.value.equals(position)) {
        charge += chargedParticle.charge;
      }
    });
    return charge;
  }

  /**
   * @private
   *
   * @param {Vector2} position
   * @returns {boolean}
   */
  canAddElectricPotentialLine(position) {
    // Do not try to add an equipotential line if there are no charges.
    if (!this.isPlayAreaChargedProperty.get()) {
      return false;
    }

    // If we are too close to a charged particle, also bail out.
    // in model coordinates, should be less than the radius (in the view) of a charged particle
    const isTooCloseToParticle = this.activeChargedParticles.some(chargedParticle => chargedParticle.positionProperty.get().distance(position) < 0.03);
    return !isTooCloseToParticle;
  }

  /**
   * Push an electricPotentialLine to an observable array
   * The drawing of the electricPotential line is handled in the view (ElectricPotentialLineView)
   * @public
   * @param {Vector2} [position] - optional argument: starting point to calculate the electricPotential line
   */
  addElectricPotentialLine(position = this.electricPotentialSensor.positionProperty.get() // use the Potential Sensor as default position
  ) {
    // TODO: perhaps we want this, but it seems like isPlayAreaChargedProperty is not being kept up and in sync.
    // assert && assert( !this.isPlayAreaChargedProperty.get() );

    // Do not try to add an equipotential line if there are no charges.
    if (!this.isPlayAreaChargedProperty.get()) {
      return;
    }

    // If we are too close to a charged particle, also bail out.
    // in model coordinates, should be less than the radius (in the view) of a charged particle
    const isTooCloseToParticle = this.activeChargedParticles.some(chargedParticle => chargedParticle.positionProperty.get().distance(position) < 0.03);
    if (isTooCloseToParticle) {
      return;
    }
    this.electricPotentialLineGroup.createNextElement(position);
  }

  /**
   * Push many electric Potential Lines to an observable array
   * The drawing of the electric Potential Lines is handled in the view.
   * @param {number} numberOfLines
   * USED IN DEBUGGING MODE
   * @public
   */
  addManyElectricPotentialLines(numberOfLines) {
    for (let i = 0; i < numberOfLines; i++) {
      const position = new Vector2(WIDTH * (dotRandom.nextDouble() - 0.5), HEIGHT * (dotRandom.nextDouble() - 0.5)); // a random position on the graph

      this.canAddElectricPotentialLine(position) && this.addElectricPotentialLine(position);
    }
  }

  /**
   * Function that clears the Equipotential Lines Observable Array
   * @public
   */
  clearElectricPotentialLines() {
    // Clear lines without disrupting phet-io state
    if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
      this.electricPotentialLineGroup.clear({
        resetIndex: false
      });
    }
  }

  /**
   * snap the position to the minor gridlines
   * @param {Property.<Vector2>} positionProperty
   * @public
   */
  snapToGridLines(positionProperty) {
    if (this.snapToGridProperty.value && this.isGridVisibleProperty.value) {
      positionProperty.set(positionProperty.get().dividedScalar(GRID_MINOR_SPACING).roundedSymmetric().timesScalar(GRID_MINOR_SPACING));
    }
  }

  /**
   * @private
   */
  snapAllElements() {
    this.activeChargedParticles.forEach(chargedParticle => this.snapToGridLines(chargedParticle.positionProperty));
    this.electricFieldSensorGroup.forEach(electricFieldSensor => this.snapToGridLines(electricFieldSensor.positionProperty));
    this.snapToGridLines(this.electricPotentialSensor.positionProperty);
    this.snapToGridLines(this.measuringTape.basePositionProperty);
    this.snapToGridLines(this.measuringTape.tipPositionProperty);
  }
}
chargesAndFields.register('ChargesAndFieldsModel', ChargesAndFieldsModel);
export default ChargesAndFieldsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiZG90UmFuZG9tIiwiVmVjdG9yMiIsIlBoZXRpb0dyb3VwIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiY2hhcmdlc0FuZEZpZWxkcyIsIkNoYXJnZXNBbmRGaWVsZHNDb25zdGFudHMiLCJDaGFyZ2VkUGFydGljbGUiLCJFbGVjdHJpY0ZpZWxkU2Vuc29yIiwiRWxlY3RyaWNQb3RlbnRpYWxMaW5lIiwiRWxlY3RyaWNQb3RlbnRpYWxTZW5zb3IiLCJNZWFzdXJpbmdUYXBlIiwiTW9kZWxFbGVtZW50IiwiR1JJRF9NSU5PUl9TUEFDSU5HIiwiR1JJRF9NQUpPUl9TUEFDSU5HIiwiTUlOT1JfR1JJRExJTkVTX1BFUl9NQUpPUl9HUklETElORSIsIktfQ09OU1RBTlQiLCJIRUlHSFQiLCJXSURUSCIsIk1JTl9ESVNUQU5DRV9TQ0FMRSIsIkNoYXJnZXNBbmRGaWVsZHNNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwicGhldGlvU3RhdGUiLCJpc0NoYXJnZXNBbmRTZW5zb3JzUGFuZWxEaXNwbGF5ZWQiLCJpc0VsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJpc0VsZWN0cmljRmllbGREaXJlY3Rpb25Pbmx5UHJvcGVydHkiLCJpc0VsZWN0cmljUG90ZW50aWFsVmlzaWJsZVByb3BlcnR5IiwiYXJlVmFsdWVzVmlzaWJsZVByb3BlcnR5IiwiaXNHcmlkVmlzaWJsZVByb3BlcnR5Iiwic25hcFRvR3JpZFByb3BlcnR5IiwiaXNQbGF5QXJlYUNoYXJnZWRQcm9wZXJ0eSIsImFsbG93TmV3UG9zaXRpdmVDaGFyZ2VzUHJvcGVydHkiLCJhbGxvd05ld05lZ2F0aXZlQ2hhcmdlc1Byb3BlcnR5IiwiYWxsb3dOZXdFbGVjdHJpY0ZpZWxkU2Vuc29yc1Byb3BlcnR5IiwiY2hhcmdlc0FuZFNlbnNvcnNFbmNsb3N1cmVCb3VuZHNQcm9wZXJ0eSIsInBoZXRpb1ZhbHVlVHlwZSIsIkJvdW5kczJJTyIsImlzUmVzZXR0aW5nIiwiYm91bmRzIiwiZW5sYXJnZWRCb3VuZHMiLCJjaGFyZ2VkUGFydGljbGVHcm91cCIsImNoYXJnZSIsImluaXRpYWxQb3NpdGlvbiIsImNoYXJnZWRQYXJ0aWNsZSIsInJldHVybmVkVG9PcmlnaW5FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlRWxlbWVudCIsIlpFUk8iLCJwaGV0aW9UeXBlIiwiUGhldGlvR3JvdXBJTyIsIkNoYXJnZWRQYXJ0aWNsZUlPIiwicGhldGlvRHluYW1pY0VsZW1lbnROYW1lIiwiYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyIsIk9ic2VydmFibGVBcnJheUlPIiwiZWxlY3RyaWNGaWVsZFNlbnNvckdyb3VwIiwic2Vuc29yIiwiZ2V0RWxlY3RyaWNGaWVsZCIsImJpbmQiLCJNb2RlbEVsZW1lbnRJTyIsImVsZWN0cmljUG90ZW50aWFsU2Vuc29yIiwiZ2V0RWxlY3RyaWNQb3RlbnRpYWwiLCJtZWFzdXJpbmdUYXBlIiwiY2hhcmdlQ29uZmlndXJhdGlvbkNoYW5nZWRFbWl0dGVyIiwiZWxlY3RyaWNQb3RlbnRpYWxMaW5lR3JvdXAiLCJwb3NpdGlvbiIsImFzc2VydCIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJFbGVjdHJpY1BvdGVudGlhbExpbmVJTyIsImxpbmsiLCJzbmFwVG9HcmlkIiwic25hcEFsbEVsZW1lbnRzIiwiZWxlbWVudENyZWF0ZWRFbWl0dGVyIiwiYWRkZWRDaGFyZ2VkUGFydGljbGUiLCJ1c2VyQ29udHJvbGxlZExpc3RlbmVyIiwiaXNVc2VyQ29udHJvbGxlZCIsImNvbnRhaW5zUG9pbnQiLCJpc0FjdGl2ZVByb3BlcnR5Iiwic2V0IiwiYW5pbWF0ZSIsImlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImlzQWN0aXZlTGlzdGVuZXIiLCJpc0FjdGl2ZSIsImNsZWFyRWxlY3RyaWNQb3RlbnRpYWxMaW5lcyIsInB1c2giLCJyZW1vdmUiLCJ1cGRhdGVJc1BsYXlBcmVhQ2hhcmdlZCIsInVwZGF0ZUFsbFNlbnNvcnMiLCJlbWl0IiwibGF6eUxpbmsiLCJwb3NpdGlvbkxpc3RlbmVyIiwib2xkUG9zaXRpb24iLCJlbGVtZW50RGlzcG9zZWRFbWl0dGVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZENoYXJnZVBhcnRpY2xlIiwidW5saW5rIiwicmVtb3ZlTGlzdGVuZXIiLCJpbmNsdWRlcyIsImFkZGVkRWxlY3RyaWNGaWVsZFNlbnNvciIsImVsZWN0cmljRmllbGQiLCJyZW1vdmVkRWxlY3RyaWNGaWVsZFNlbnNvciIsInJlc2V0IiwiY2xlYXIiLCJhZGRQb3NpdGl2ZUNoYXJnZSIsImNyZWF0ZU5leHRFbGVtZW50IiwiYWRkTmVnYXRpdmVDaGFyZ2UiLCJhZGRFbGVjdHJpY0ZpZWxkU2Vuc29yIiwibmV0RWxlY3RyaWNDaGFyZ2UiLCJudW1iZXJBY3RpdmVDaGFyZ2VkUGFydGljbGVzIiwiZm9yRWFjaCIsImNvbG9jYXRlZCIsIm1pbnVzIiwibWFnbml0dWRlIiwicG9zaXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5IiwibmVnYXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5IiwiZXF1YWxzIiwidXBkYXRlIiwiaSIsImNvdW50IiwiZ2V0RWxlbWVudCIsImRpc3RhbmNlU3F1YXJlZCIsIngiLCJNQVhfRUZJRUxEX01BR05JVFVERSIsInkiLCJkaXN0YW5jZVBvd2VyQ3ViZSIsIk1hdGgiLCJwb3ciLCJlbGVjdHJpY0ZpZWxkQ29udHJpYnV0aW9uIiwiYWRkIiwibXVsdGlwbHlTY2FsYXIiLCJlbGVjdHJpY1BvdGVudGlhbCIsIm5ldENoYXJnZU9uU2l0ZSIsImdldENoYXJnZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJkaXN0YW5jZSIsInZhbHVlIiwiY2FuQWRkRWxlY3RyaWNQb3RlbnRpYWxMaW5lIiwiaXNUb29DbG9zZVRvUGFydGljbGUiLCJzb21lIiwiYWRkRWxlY3RyaWNQb3RlbnRpYWxMaW5lIiwiYWRkTWFueUVsZWN0cmljUG90ZW50aWFsTGluZXMiLCJudW1iZXJPZkxpbmVzIiwibmV4dERvdWJsZSIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJyZXNldEluZGV4Iiwic25hcFRvR3JpZExpbmVzIiwiZGl2aWRlZFNjYWxhciIsInJvdW5kZWRTeW1tZXRyaWMiLCJ0aW1lc1NjYWxhciIsImVsZWN0cmljRmllbGRTZW5zb3IiLCJiYXNlUG9zaXRpb25Qcm9wZXJ0eSIsInRpcFBvc2l0aW9uUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYXJnZXNBbmRGaWVsZHNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBvZiB0aGUgY2hhcmdlcyBhbmQgZmllbGRzIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFBoZXRpb0dyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9Hcm91cC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBjaGFyZ2VzQW5kRmllbGRzIGZyb20gJy4uLy4uL2NoYXJnZXNBbmRGaWVsZHMuanMnO1xyXG5pbXBvcnQgQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cyBmcm9tICcuLi9DaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENoYXJnZWRQYXJ0aWNsZSBmcm9tICcuL0NoYXJnZWRQYXJ0aWNsZS5qcyc7XHJcbmltcG9ydCBFbGVjdHJpY0ZpZWxkU2Vuc29yIGZyb20gJy4vRWxlY3RyaWNGaWVsZFNlbnNvci5qcyc7XHJcbmltcG9ydCBFbGVjdHJpY1BvdGVudGlhbExpbmUgZnJvbSAnLi9FbGVjdHJpY1BvdGVudGlhbExpbmUuanMnO1xyXG5pbXBvcnQgRWxlY3RyaWNQb3RlbnRpYWxTZW5zb3IgZnJvbSAnLi9FbGVjdHJpY1BvdGVudGlhbFNlbnNvci5qcyc7XHJcbmltcG9ydCBNZWFzdXJpbmdUYXBlIGZyb20gJy4vTWVhc3VyaW5nVGFwZS5qcyc7XHJcbmltcG9ydCBNb2RlbEVsZW1lbnQgZnJvbSAnLi9Nb2RlbEVsZW1lbnQuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEdSSURfTUlOT1JfU1BBQ0lORyA9IENoYXJnZXNBbmRGaWVsZHNDb25zdGFudHMuR1JJRF9NQUpPUl9TUEFDSU5HIC8gQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cy5NSU5PUl9HUklETElORVNfUEVSX01BSk9SX0dSSURMSU5FO1xyXG5jb25zdCBLX0NPTlNUQU5UID0gQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cy5LX0NPTlNUQU5UO1xyXG5jb25zdCBIRUlHSFQgPSBDaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLkhFSUdIVDtcclxuY29uc3QgV0lEVEggPSBDaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLldJRFRIO1xyXG5cclxuLy8gVG8gYXZvaWQgYnVncywgZG8gbm90IHRyeSB0byBjb21wdXRlIEUtZmllbGQgYXQgbGVuZ3RoIHNjYWxlcyBzbWFsbGVyIHRoYW4gTUlOX0RJU1RBTkNFX1NDQUxFXHJcbmNvbnN0IE1JTl9ESVNUQU5DRV9TQ0FMRSA9IDFlLTk7XHJcblxyXG4vLyBUT0RPOiB3aHkgaXMgdGhpcyBwaGV0LWlvIGluc3RydW1lbnRlZD9cclxuY2xhc3MgQ2hhcmdlc0FuZEZpZWxkc01vZGVsIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIHtmdW5jdGlvbn0gLSBzdXBwbGllZCBieSB0aGUgdmlldyB0byBpbmRpY2F0ZSB3aGVuIHRoZSBjaGFyZ2VzIGFuZCBzZW5zb3JzIHBhbmVsIGlzIHZpc2libGVcclxuICAgIC8vIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIGNoYXJnZXMgY2FuIGJlIGRyb3BwZWQgaW4gdGhlIHRvb2xib3gsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvOTE1XHJcbiAgICB0aGlzLmlzQ2hhcmdlc0FuZFNlbnNvcnNQYW5lbERpc3BsYXllZCA9IG51bGw7XHJcblxyXG4gICAgLy8gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgdGhlcmUgYXJlIHR3byB2aXNpYmlsaXR5IHByb3BlcnRpZXMgdGhhdCBhcmUgc3Ryb25nbHkgdGllZCB0byB0aGUgbW9kZWwgaGVuY2UgdGhlIHJlYXNvbiB0aGV5IGFwcGVhciBoZXJlLlxyXG4gICAgLy8gVGhlIG90aGVyIHZpc2liaWxpdHkgcHJvcGVydGllcyBjYW4gYmUgZm91bmQgaW4gdGhlIENoYXJnZXNBbmRGaWVsZHNTY3JlZW5WaWV3IGZpbGVcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGNvbnRyb2wgdGhlIHZpc2liaWxpdHkgb2YgYSBncmlkIG9mIGFycm93cyByZXByZXNlbnRpbmcgdGhlIGxvY2FsIGVsZWN0cmljIGZpZWxkXHJcbiAgICB0aGlzLmlzRWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNFbGVjdHJpY0ZpZWxkVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBjb250cm9scyB0aGUgY29sb3Igc2hhZGluZyBpbiB0aGUgZmlsbCBvZiB0aGUgZWxlY3RyaWMgZmllbGQgYXJyb3dzXHJcbiAgICB0aGlzLmlzRWxlY3RyaWNGaWVsZERpcmVjdGlvbk9ubHlQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzRWxlY3RyaWNGaWVsZERpcmVjdGlvbk9ubHlQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZWxlY3RyaWMgcG90ZW50aWFsIGZpZWxkLCBhLmsuYS4gcmVjdGFuZ3VsYXIgZ3JpZFxyXG4gICAgdGhpcy5pc0VsZWN0cmljUG90ZW50aWFsVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNFbGVjdHJpY1BvdGVudGlhbFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBvZiBtYW55IG51bWVyaWNhbCB2YWx1ZXMgKCBlIGZpZWxkIHNlbnNvcnMsIGVsZWN0cmljUG90ZW50aWFsIGxpbmVzLCBldGMpXHJcbiAgICB0aGlzLmFyZVZhbHVlc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FyZVZhbHVlc1Zpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgc2ltcGxlIGdyaWQgd2l0aCBtaW5vciBhbmQgbWFqb3IgYXhlc1xyXG4gICAgdGhpcy5pc0dyaWRWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc0dyaWRWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNob3VsZCB3ZSBzbmFwIHRoZSBwb3NpdGlvbiBvZiBtb2RlbCBlbGVtZW50cyB0byB0aGUgZ3JpZCAobWlub3Igb3IgbWFqb3IpXHJcbiAgICB0aGlzLnNuYXBUb0dyaWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NuYXBUb0dyaWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gaXMgdGhlcmUgYXQgbGVhc3Qgb25lIGFjdGl2ZSBjaGFyZ2VkIHBhcnRpY2xlIG9uIHRoZSBib2FyZFxyXG4gICAgdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNQbGF5QXJlYUNoYXJnZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gd2hldGhlciBhZGRpbmcgcG9zaXRpdmUgY2hhcmdlcyBpcyBhbGxvd2VkIChhbmQgZGlzcGxheWVkKSBpbiBnZW5lcmFsXHJcbiAgICB0aGlzLmFsbG93TmV3UG9zaXRpdmVDaGFyZ2VzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FsbG93TmV3UG9zaXRpdmVDaGFyZ2VzUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHdoZXRoZXIgYWRkaW5nIG5lZ2F0aXZlIGNoYXJnZXMgaXMgYWxsb3dlZCAoYW5kIGRpc3BsYXllZCkgaW4gZ2VuZXJhbFxyXG4gICAgdGhpcy5hbGxvd05ld05lZ2F0aXZlQ2hhcmdlc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbGxvd05ld05lZ2F0aXZlQ2hhcmdlc1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSB3aGV0aGVyIGFkZGluZyBlbGVjdHJpYyBmaWVsZCBzZW5zb3JzIGlzIGFsbG93ZWQgKGFuZCBkaXNwbGF5ZWQpIGluIGdlbmVyYWxcclxuICAgIHRoaXMuYWxsb3dOZXdFbGVjdHJpY0ZpZWxkU2Vuc29yc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbGxvd05ld0VsZWN0cmljRmllbGRTZW5zb3JzUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Qm91bmRzMj59IGluIG1ldGVyc1xyXG4gICAgdGhpcy5jaGFyZ2VzQW5kU2Vuc29yc0VuY2xvc3VyZUJvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KFxyXG4gICAgICBuZXcgQm91bmRzMiggLTEuMjUsIC0yLjMwLCAxLjI1LCAtMS43MCApLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhcmdlc0FuZFNlbnNvcnNFbmNsb3N1cmVCb3VuZHNQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IEJvdW5kczIuQm91bmRzMklPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEluaXRpYWxpemUgdmFyaWFibGVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB0aGlzLmlzUmVzZXR0aW5nID0gZmFsc2U7IC8vIGlzIHRoZSBtb2RlbCBiZWluZyByZXNldCwgbmVjZXNzYXJ5IGZsYWcgdG8gYWRkcmVzcyBwZXJmb3JtYW5jZSBpc3N1ZXMgaW4gdGhlIHJlc2V0IHByb2Nlc3NcclxuXHJcbiAgICAvLyBAcHVibGljIHJlYWQtb25seVxyXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMiggLVdJRFRIIC8gMiwgLUhFSUdIVCAvIDIsIFdJRFRIIC8gMiwgSEVJR0hUIC8gMiApOyAvLyBib3VuZHMgb2YgdGhlIG1vZGVsIChmb3IgdGhlIG5vbWluYWwgdmlldylcclxuXHJcbiAgICAvLyBAcHVibGljIHJlYWQtb25seVxyXG4gICAgdGhpcy5lbmxhcmdlZEJvdW5kcyA9IG5ldyBCb3VuZHMyKCAtMS41ICogV0lEVEggLyAyLCAtSEVJR0hUIC8gMiwgMS41ICogV0lEVEggLyAyLCAzICogSEVJR0hUIC8gMiApOyAvLyBib3VuZHMgb2YgdGhlIG1vZGVsIChmb3IgdGhlIGVubGFyZ2VkIHZpZXcpXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGhldGlvR3JvdXAuPENoYXJnZWRQYXJ0aWNsZT59IGdyb3VwIG9mIGRyYWdnYWJsZSBlbGVjdHJpYyBjaGFyZ2VzXHJcbiAgICB0aGlzLmNoYXJnZWRQYXJ0aWNsZUdyb3VwID0gbmV3IFBoZXRpb0dyb3VwKCAoIHRhbmRlbSwgY2hhcmdlLCBpbml0aWFsUG9zaXRpb24gKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNoYXJnZWRQYXJ0aWNsZSA9IG5ldyBDaGFyZ2VkUGFydGljbGUoIGNoYXJnZSwgaW5pdGlhbFBvc2l0aW9uLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgICAgfSApO1xyXG4gICAgICBjaGFyZ2VkUGFydGljbGUucmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMuY2hhcmdlZFBhcnRpY2xlR3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNoYXJnZWRQYXJ0aWNsZSApICk7XHJcbiAgICAgIHJldHVybiBjaGFyZ2VkUGFydGljbGU7XHJcbiAgICB9LCBbIDEsIFZlY3RvcjIuWkVSTyBdLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NoYXJnZWRQYXJ0aWNsZUdyb3VwJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBDaGFyZ2VkUGFydGljbGUuQ2hhcmdlZFBhcnRpY2xlSU8gKSxcclxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lOiAncGFydGljbGUnXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjaGFyZ2VkUGFydGljbGVHcm91cCA9IHRoaXMuY2hhcmdlZFBhcnRpY2xlR3JvdXA7XHJcblxyXG4gICAgLy8gT2JzZXJ2YWJsZSBhcnJheSBvZiBhbGwgYWN0aXZlIGVsZWN0cmljIGNoYXJnZXMgKGkuZS4gaXNBY3RpdmUgaXMgdHJ1ZSBmb3IgdGhlIGNoYXJnZVBhcnRpY2xlKHMpIGluIHRoaXMgYXJyYXkpXHJcbiAgICAvLyBUaGlzIGlzIHRoZSByZWxldmFudCBhcnJheSB0byBjYWxjdWxhdGUgdGhlIGVsZWN0cmljIGZpZWxkLCBhbmQgZWxlY3RyaWMgcG90ZW50aWFsXHJcbiAgICAvLyBAcHVibGljIHtPYnNlcnZhYmxlQXJyYXlEZWYuPENoYXJnZWRQYXJ0aWNsZT59XHJcbiAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgcGhldGlvVHlwZTogY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPKCBDaGFyZ2VkUGFydGljbGUuQ2hhcmdlZFBhcnRpY2xlSU8gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1BoZXRpb0dyb3VwLjxFbGVjdHJpY0ZpZWxkU2Vuc29yPn0gT2JzZXJ2YWJsZSBncm91cCBvZiBlbGVjdHJpYyBmaWVsZCBzZW5zb3JzXHJcbiAgICB0aGlzLmVsZWN0cmljRmllbGRTZW5zb3JHcm91cCA9IG5ldyBQaGV0aW9Hcm91cCggKCB0YW5kZW0sIGluaXRpYWxQb3NpdGlvbiApID0+IHtcclxuICAgICAgY29uc3Qgc2Vuc29yID0gbmV3IEVsZWN0cmljRmllbGRTZW5zb3IoIHRoaXMuZ2V0RWxlY3RyaWNGaWVsZC5iaW5kKCB0aGlzICksIGluaXRpYWxQb3NpdGlvbiwgdGFuZGVtICk7XHJcbiAgICAgIHNlbnNvci5yZXR1cm5lZFRvT3JpZ2luRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdGhpcy5lbGVjdHJpY0ZpZWxkU2Vuc29yR3JvdXAuZGlzcG9zZUVsZW1lbnQoIHNlbnNvciApICk7XHJcbiAgICAgIHJldHVybiBzZW5zb3I7XHJcbiAgICB9LCBbIFZlY3RvcjIuWkVSTyBdLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cmljRmllbGRTZW5zb3JHcm91cCcgKSxcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTW9kZWxFbGVtZW50Lk1vZGVsRWxlbWVudElPIClcclxuICAgIH0gKTsgLy8ge09ic2VydmFibGVBcnJheURlZi48RWxlY3RyaWNGaWVsZFNlbnNvcj59XHJcbiAgICBjb25zdCBlbGVjdHJpY0ZpZWxkU2Vuc29yR3JvdXAgPSB0aGlzLmVsZWN0cmljRmllbGRTZW5zb3JHcm91cDtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZWxlY3RyaWMgcG90ZW50aWFsIHNlbnNvclxyXG4gICAgdGhpcy5lbGVjdHJpY1BvdGVudGlhbFNlbnNvciA9IG5ldyBFbGVjdHJpY1BvdGVudGlhbFNlbnNvciggdGhpcy5nZXRFbGVjdHJpY1BvdGVudGlhbC5iaW5kKCB0aGlzICksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJpY1BvdGVudGlhbFNlbnNvcicgKSApO1xyXG5cclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZSA9IG5ldyBNZWFzdXJpbmdUYXBlKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyaW5nVGFwZScgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBlbWl0cyB3aGVuZXZlciB0aGUgY2hhcmdlIG1vZGVsIGNoYW5nZXMsIGkuZS4gY2hhcmdlcyBhZGRlZC9yZW1vdmVkL21vdmVkXHJcbiAgICB0aGlzLmNoYXJnZUNvbmZpZ3VyYXRpb25DaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyByZWFkLW9ubHkge1BoZXRpb0dyb3VwLjxFbGVjdHJpY1BvdGVudGlhbExpbmU+fSBncm91cCBvZiBlbGVjdHJpYyBwb3RlbnRpYWwgbGluZXNcclxuICAgIHRoaXMuZWxlY3RyaWNQb3RlbnRpYWxMaW5lR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoICggdGFuZGVtLCBwb3NpdGlvbiApID0+IHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvc2l0aW9uIGluc3RhbmNlb2YgVmVjdG9yMiwgJ3Bvc2l0aW9uIHNob3VsZCBiZSBWZWN0b3IyJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YW5kZW0gaW5zdGFuY2VvZiBUYW5kZW0sICd0YW5kZW0gc2hvdWxkIGJlIGEgVGFuZGVtJyApO1xyXG5cclxuICAgICAgLy8gZm9yIGNoYWluaW5nIGFuZCBmb3IgUGhFVC1pTyByZXN0b3JlIHN0YXRlXHJcbiAgICAgIHJldHVybiBuZXcgRWxlY3RyaWNQb3RlbnRpYWxMaW5lKCB0aGlzLCBwb3NpdGlvbiwgdGFuZGVtICk7XHJcbiAgICB9LCBbIHRoaXMuZWxlY3RyaWNQb3RlbnRpYWxTZW5zb3IucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSBdLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cmljUG90ZW50aWFsTGluZUdyb3VwJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBFbGVjdHJpY1BvdGVudGlhbExpbmUuRWxlY3RyaWNQb3RlbnRpYWxMaW5lSU8gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy9cclxuICAgIC8vIEhvb2sgdXAgYWxsIHRoZSBsaXN0ZW5lcnMgdGhlIG1vZGVsXHJcbiAgICAvL1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdGhpcy5zbmFwVG9HcmlkUHJvcGVydHkubGluayggc25hcFRvR3JpZCA9PiB7XHJcbiAgICAgIGlmICggc25hcFRvR3JpZCApIHtcclxuICAgICAgICB0aGlzLnNuYXBBbGxFbGVtZW50cygpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEFkZEl0ZW0gQWRkZWQgTGlzdGVuZXIgb24gdGhlIGNoYXJnZWQgUGFydGljbGVzIE9ic2VydmFibGUgQXJyYXlcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gdGhlIGZvbGxvd2luZyBsb2dpYyBpcyB0aGUgY3J1eCBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgdGhpcy5jaGFyZ2VkUGFydGljbGVHcm91cC5lbGVtZW50Q3JlYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGFkZGVkQ2hhcmdlZFBhcnRpY2xlID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHVzZXJDb250cm9sbGVkTGlzdGVuZXIgPSBpc1VzZXJDb250cm9sbGVkID0+IHtcclxuXHJcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRoZSBjaGFyZ2UgcGFydGljbGUgaXMgbm8gbG9uZ2VyIGNvbnRyb2xsZWQgYnkgdGhlIHVzZXIgYW5kIGlzIGluc2lkZSB0aGUgZW5jbG9zdXJlXHJcbiAgICAgICAgaWYgKCAhaXNVc2VyQ29udHJvbGxlZCAmJlxyXG5cclxuICAgICAgICAgICAgIC8vIG9ubHkgZHJvcCBpbiBpZiB0aGUgdG9vbGJveCBpcyBzaG93aW5nIChtYXkgYmUgaGlkZGVuIGJ5IHBoZXQtaW8pXHJcbiAgICAgICAgICAgICB0aGlzLmlzQ2hhcmdlc0FuZFNlbnNvcnNQYW5lbERpc3BsYXllZCAmJiB0aGlzLmlzQ2hhcmdlc0FuZFNlbnNvcnNQYW5lbERpc3BsYXllZCgpICYmXHJcbiAgICAgICAgICAgICB0aGlzLmNoYXJnZXNBbmRTZW5zb3JzRW5jbG9zdXJlQm91bmRzUHJvcGVydHkuZ2V0KCkuY29udGFpbnNQb2ludCggYWRkZWRDaGFyZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUuaXNBY3RpdmVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7IC8vIGNoYXJnZSBpcyBubyBsb25nZXIgYWN0aXZlLCAoZWZmZWN0aXZlbHkpIGVxdWl2YWxlbnQgdG8gc2V0IGl0cyBtb2RlbCBjaGFyZ2UgdG8gemVyb1xyXG4gICAgICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUuYW5pbWF0ZSgpOyAvLyBhbmltYXRlIHRoZSBjaGFyZ2UgdG8gaXRzIGRlc3RpbmF0aW9uIHBvc2l0aW9uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzQWN0aXZlTGlzdGVuZXIgPSBpc0FjdGl2ZSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGNsZWFyIGFsbCBlbGVjdHJpY1BvdGVudGlhbCBsaW5lcywgaS5lLiByZW1vdmUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIGVsZWN0cmljUG90ZW50aWFsTGluZUdyb3VwXHJcbiAgICAgICAgdGhpcy5jbGVhckVsZWN0cmljUG90ZW50aWFsTGluZXMoKTtcclxuXHJcbiAgICAgICAgaWYgKCBpc0FjdGl2ZSApIHtcclxuICAgICAgICAgIC8vIGFkZCBwYXJ0aWNsZSB0byB0aGUgYWN0aXZlQ2hhcmdlZFBhcnRpY2xlIG9ic2VydmFibGUgYXJyYXlcclxuICAgICAgICAgIC8vIHVzZSBmb3IgdGhlIHdlYkdsTm9kZVxyXG4gICAgICAgICAgdGhpcy5hY3RpdmVDaGFyZ2VkUGFydGljbGVzLnB1c2goIGFkZGVkQ2hhcmdlZFBhcnRpY2xlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gcmVtb3ZlIHBhcnRpY2xlIGZyb20gdGhlIGFjdGl2ZUNoYXJnZVBhcnRpY2xlIGFycmF5XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMucmVtb3ZlKCBhZGRlZENoYXJnZWRQYXJ0aWNsZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB1cGRhdGUgdGhlIHN0YXR1cyBvZiB0aGUgaXNQbGF5QXJlYUNoYXJnZWQsICB0byBmaW5kIGlzIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBhY3RpdmUgY2hhcmdlIHBhcnRpY2xlIG9uIGJvYXJkXHJcbiAgICAgICAgdGhpcy51cGRhdGVJc1BsYXlBcmVhQ2hhcmdlZCgpO1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgdGhlIHR3byBncmlkIHNlbnNvcnMgKGlmIHRoZXkgYXJlIHNldCB0byB2aXNpYmxlKSwgdGhlIGVsZWN0cmljIGZpZWxkcyBzZW5zb3JzIGFuZCB0aGUgZWxlY3RyaWNQb3RlbnRpYWwgc2Vuc29yXHJcbiAgICAgICAgdGhpcy51cGRhdGVBbGxTZW5zb3JzKCk7XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VDb25maWd1cmF0aW9uQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUuaXNBY3RpdmVQcm9wZXJ0eS5sYXp5TGluayggaXNBY3RpdmVMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gcG9zaXRpb24gYW5kIG9sZFBvc2l0aW9uIHJlZmVyIHRvIGEgY2hhcmdlZCBwYXJ0aWNsZVxyXG4gICAgICBjb25zdCBwb3NpdGlvbkxpc3RlbmVyID0gKCBwb3NpdGlvbiwgb2xkUG9zaXRpb24gKSA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlSXNQbGF5QXJlYUNoYXJnZWQoKTtcclxuXHJcbiAgICAgICAgLy8gdmVyaWZ5IHRoYXQgdGhlIGNoYXJnZSBpc0FjdGl2ZSBiZWZvcmUgZG9pbmcgYW55IGNoYXJnZS1kZXBlbmRlbnQgdXBkYXRlcyB0byB0aGUgbW9kZWxcclxuICAgICAgICBpZiAoIGFkZGVkQ2hhcmdlZFBhcnRpY2xlLmlzQWN0aXZlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVtb3ZlIGVsZWN0cmljUG90ZW50aWFsIGxpbmVzIHdoZW4gdGhlIHBvc2l0aW9uIG9mIGEgY2hhcmdlZCBwYXJ0aWNsZSBjaGFuZ2VzIGFuZCB0aGUgY2hhcmdlIGlzQWN0aXZlXHJcbiAgICAgICAgICB0aGlzLmNsZWFyRWxlY3RyaWNQb3RlbnRpYWxMaW5lcygpO1xyXG5cclxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgZWxlY3RyaWNQb3RlbnRpYWwgYW5kIGVsZWN0cmljRmllbGQgc2Vuc29yc1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVBbGxTZW5zb3JzKCk7XHJcblxyXG4gICAgICAgIH0gLy8gZW5kIG9mIGlmIChpc0FjdGl2ZSkgc3RhdGVtZW50XHJcbiAgICAgICAgdGhpcy5jaGFyZ2VDb25maWd1cmF0aW9uQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbkxpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIHdoZW4gYSBjaGFyZ2VkUGFydGljbGUgaXMgcmVtb3ZlZFxyXG4gICAgICBjaGFyZ2VkUGFydGljbGVHcm91cC5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBmdW5jdGlvbiByZW1vdmFsTGlzdGVuZXIoIHJlbW92ZWRDaGFyZ2VQYXJ0aWNsZSApIHtcclxuICAgICAgICBpZiAoIHJlbW92ZWRDaGFyZ2VQYXJ0aWNsZSA9PT0gYWRkZWRDaGFyZ2VkUGFydGljbGUgKSB7XHJcbiAgICAgICAgICBhZGRlZENoYXJnZWRQYXJ0aWNsZS5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCB1c2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcbiAgICAgICAgICBhZGRlZENoYXJnZWRQYXJ0aWNsZS5pc0FjdGl2ZVByb3BlcnR5LnVubGluayggaXNBY3RpdmVMaXN0ZW5lciApO1xyXG4gICAgICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHBvc2l0aW9uTGlzdGVuZXIgKTtcclxuICAgICAgICAgIGNoYXJnZWRQYXJ0aWNsZUdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBZGRJdGVtIFJlbW92ZWQgTGlzdGVuZXIgb24gdGhlIGNoYXJnZWQgUGFydGljbGVzIE9ic2VydmFibGUgQXJyYXlcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdGhpcy5jaGFyZ2VkUGFydGljbGVHcm91cC5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCByZW1vdmVkQ2hhcmdlUGFydGljbGUgPT4ge1xyXG4gICAgICAvLyBjaGVjayB0aGF0IHRoZSBwYXJ0aWNsZSB3YXMgYWN0aXZlIGJlZm9yZSB1cGRhdGluZyBjaGFyZ2UgZGVwZW5kZW50IG1vZGVsIGNvbXBvbmVudHNcclxuICAgICAgaWYgKCByZW1vdmVkQ2hhcmdlUGFydGljbGUuaXNBY3RpdmVQcm9wZXJ0eS5nZXQoKSAmJiAhdGhpcy5pc1Jlc2V0dGluZyApIHtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGVsZWN0cmljUG90ZW50aWFsIGxpbmVzXHJcbiAgICAgICAgdGhpcy5jbGVhckVsZWN0cmljUG90ZW50aWFsTGluZXMoKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGFsbCB0aGUgdmlzaWJsZSBzZW5zb3JzXHJcbiAgICAgICAgdGhpcy51cGRhdGVBbGxTZW5zb3JzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlbW92ZSBwYXJ0aWNsZSBmcm9tIHRoZSBhY3RpdmVDaGFyZ2VkUGFydGljbGVzIGFycmF5XHJcbiAgICAgIGlmICggdGhpcy5hY3RpdmVDaGFyZ2VkUGFydGljbGVzLmluY2x1ZGVzKCByZW1vdmVkQ2hhcmdlUGFydGljbGUgKSApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMucmVtb3ZlKCByZW1vdmVkQ2hhcmdlUGFydGljbGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBwcm9wZXJ0eSBpc1BsYXlBcmVhQ2hhcmdlZCB0byBzZWUgaWYgaXMgdGhlcmUgYXQgbGVhc3Qgb25lIGFjdGl2ZSBjaGFyZ2Ugb24gdGhlIGJvYXJkXHJcbiAgICAgIHRoaXMudXBkYXRlSXNQbGF5QXJlYUNoYXJnZWQoKTtcclxuICAgICAgdGhpcy5jaGFyZ2VDb25maWd1cmF0aW9uQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBZGRJdGVtIEFkZGVkIExpc3RlbmVyIG9uIHRoZSBlbGVjdHJpYyBGaWVsZCBTZW5zb3JzIE9ic2VydmFibGUgQXJyYXlcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdGhpcy5lbGVjdHJpY0ZpZWxkU2Vuc29yR3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBhZGRlZEVsZWN0cmljRmllbGRTZW5zb3IgPT4ge1xyXG5cclxuICAgICAgLy8gTGlzdGVuZXIgZm9yIHNlbnNvciBwb3NpdGlvbiBjaGFuZ2VzXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uTGlzdGVuZXIgPSBwb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgYWRkZWRFbGVjdHJpY0ZpZWxkU2Vuc29yLmVsZWN0cmljRmllbGQgPSB0aGlzLmdldEVsZWN0cmljRmllbGQoIHBvc2l0aW9uICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIEVsZWN0cmljIEZpZWxkIFNlbnNvcnMgdXBvbiBhIGNoYW5nZSBvZiBpdHMgb3duIHBvc2l0aW9uXHJcbiAgICAgIGFkZGVkRWxlY3RyaWNGaWVsZFNlbnNvci5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGNvbnN0IHVzZXJDb250cm9sbGVkTGlzdGVuZXIgPSBpc1VzZXJDb250cm9sbGVkID0+IHtcclxuXHJcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRoZSBzZW5zb3IgaXMgbm8gbG9uZ2VyIGNvbnRyb2xsZWQgYnkgdGhlIHVzZXIgYW5kIGlzIGluc2lkZSB0aGUgZW5jbG9zdXJlXHJcbiAgICAgICAgaWYgKCAhaXNVc2VyQ29udHJvbGxlZCAmJlxyXG5cclxuICAgICAgICAgICAgIC8vIG9ubHkgZHJvcCBpbiBpZiB0aGUgdG9vbGJveCBpcyBzaG93aW5nIChtYXliZSBoaWRkZW4gYnkgcGhldC1pbylcclxuICAgICAgICAgICAgIHRoaXMuaXNDaGFyZ2VzQW5kU2Vuc29yc1BhbmVsRGlzcGxheWVkICYmIHRoaXMuaXNDaGFyZ2VzQW5kU2Vuc29yc1BhbmVsRGlzcGxheWVkKCkgJiZcclxuICAgICAgICAgICAgIHRoaXMuY2hhcmdlc0FuZFNlbnNvcnNFbmNsb3N1cmVCb3VuZHNQcm9wZXJ0eS5nZXQoKS5jb250YWluc1BvaW50KCBhZGRlZEVsZWN0cmljRmllbGRTZW5zb3IucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgICAgYWRkZWRFbGVjdHJpY0ZpZWxkU2Vuc29yLmlzQWN0aXZlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgICAgYWRkZWRFbGVjdHJpY0ZpZWxkU2Vuc29yLmFuaW1hdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBhZGRlZEVsZWN0cmljRmllbGRTZW5zb3IuaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnMgd2hlbiBhbiBlbGVjdHJpY0ZpZWxkU2Vuc29yIGlzIHJlbW92ZWRcclxuICAgICAgZWxlY3RyaWNGaWVsZFNlbnNvckdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZEVsZWN0cmljRmllbGRTZW5zb3IgKSB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkRWxlY3RyaWNGaWVsZFNlbnNvciA9PT0gYWRkZWRFbGVjdHJpY0ZpZWxkU2Vuc29yICkge1xyXG4gICAgICAgICAgYWRkZWRFbGVjdHJpY0ZpZWxkU2Vuc29yLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS51bmxpbmsoIHVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuICAgICAgICAgIGFkZGVkRWxlY3RyaWNGaWVsZFNlbnNvci5wb3NpdGlvblByb3BlcnR5LnVubGluayggcG9zaXRpb25MaXN0ZW5lciApO1xyXG4gICAgICAgICAgZWxlY3RyaWNGaWVsZFNlbnNvckdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgZnVuY3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICAvLyB3ZSB3YW50IHRvIGF2b2lkIHRoZSBjb3N0IG9mIGNvbnN0YW50bHkgcmUtdXBkYXRpbmcgdGhlIGdyaWRzIHdoZW4gY2xlYXJpbmcgY2hhcmdlZFBhcnRpY2xlR3JvdXBcclxuICAgIC8vIHNvIHdlIHNldCB0aGUgZmxhZyBpc1Jlc2V0dGluZyB0byB0cnVlLlxyXG4gICAgdGhpcy5pc1Jlc2V0dGluZyA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5pc0VsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNFbGVjdHJpY0ZpZWxkRGlyZWN0aW9uT25seVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzRWxlY3RyaWNQb3RlbnRpYWxWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYXJlVmFsdWVzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzR3JpZFZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFsbG93TmV3UG9zaXRpdmVDaGFyZ2VzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYWxsb3dOZXdOZWdhdGl2ZUNoYXJnZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hbGxvd05ld0VsZWN0cmljRmllbGRTZW5zb3JzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2hhcmdlc0FuZFNlbnNvcnNFbmNsb3N1cmVCb3VuZHNQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMuY2hhcmdlZFBhcnRpY2xlR3JvdXAuY2xlYXIoKTsgLy8gY2xlYXIgYWxsIHRoZSBjaGFyZ2VzXHJcbiAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMuY2xlYXIoKTsgLy8gY2xlYXIgYWxsIHRoZSBhY3RpdmUgY2hhcmdlc1xyXG4gICAgdGhpcy5lbGVjdHJpY0ZpZWxkU2Vuc29yR3JvdXAuY2xlYXIoKTsgLy8gY2xlYXIgYWxsIHRoZSBlbGVjdHJpYyBmaWVsZCBzZW5zb3JzXHJcbiAgICB0aGlzLmVsZWN0cmljUG90ZW50aWFsTGluZUdyb3VwLmNsZWFyKCk7IC8vIGNsZWFyIHRoZSBlbGVjdHJpY1BvdGVudGlhbCAnbGluZXMnXHJcbiAgICB0aGlzLmVsZWN0cmljUG90ZW50aWFsU2Vuc29yLnJlc2V0KCk7IC8vIHJlcG9zaXRpb24gdGhlIGVsZWN0cmljUG90ZW50aWFsU2Vuc29yXHJcbiAgICB0aGlzLm1lYXN1cmluZ1RhcGUucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLmlzUmVzZXR0aW5nID0gZmFsc2U7IC8vIGRvbmUgd2l0aCB0aGUgcmVzZXR0aW5nIHByb2Nlc3NcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBwb3NpdGl2ZSBjaGFyZ2UgdG8gdGhlIG1vZGVsLCBhbmQgcmV0dXJucyBpdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEByZXR1cm5zIHtDaGFyZ2VkUGFydGljbGV9XHJcbiAgICovXHJcbiAgYWRkUG9zaXRpdmVDaGFyZ2UoIGluaXRpYWxQb3NpdGlvbiApIHtcclxuICAgIHJldHVybiB0aGlzLmNoYXJnZWRQYXJ0aWNsZUdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCAxLCBpbml0aWFsUG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBuZWdhdGl2ZSBjaGFyZ2UgdG8gdGhlIG1vZGVsLCBhbmQgcmV0dXJucyBpdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEByZXR1cm5zIHtDaGFyZ2VkUGFydGljbGV9XHJcbiAgICovXHJcbiAgYWRkTmVnYXRpdmVDaGFyZ2UoIGluaXRpYWxQb3NpdGlvbiApIHtcclxuICAgIHJldHVybiB0aGlzLmNoYXJnZWRQYXJ0aWNsZUdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCAtMSwgaW5pdGlhbFBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGFuIGVsZWN0cmljIGZpZWxkIHNlbnNvciB0byB0aGUgbW9kZWwsIGFuZCByZXR1cm5zIGl0LlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbFBvc2l0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZEVsZWN0cmljRmllbGRTZW5zb3IoIGluaXRpYWxQb3NpdGlvbiApIHtcclxuICAgIHJldHVybiB0aGlzLmVsZWN0cmljRmllbGRTZW5zb3JHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggaW5pdGlhbFBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IGRldGVybWluZXMgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGFjdGl2ZSBhbmQgXCJ1bmNvbXBlbnNhdGVkXCIgY2hhcmdlXHJcbiAgICogb24gdGhlIGJvYXJkLiBJZiB0aGlzIGlzIG5vdCB0aGUgY2FzZSwgaXQgaW1wbGllcyB0aGF0IHRoZSBFLWZpZWxkIGlzIHplcm8gZXZlcnl3aGVyZVxyXG4gICAqIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoYXJnZXMtYW5kLWZpZWxkcy9pc3N1ZXMvNDYpXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVJc1BsYXlBcmVhQ2hhcmdlZCgpIHtcclxuICAgIGxldCBuZXRFbGVjdHJpY0NoYXJnZSA9IDA7IC8vIHtudW1iZXJ9IFRvdGFsIGVsZWN0cmljIGNoYXJnZSBvbiBzY3JlZW5cclxuICAgIGxldCBudW1iZXJBY3RpdmVDaGFyZ2VkUGFydGljbGVzID0gMDsgLy8ge251bWJlcn0gVG90YWwgYWN0aXZlIGNoYXJnZWQgcGFydGljbGVzIG9uIHNjcmVlblxyXG5cclxuICAgIHRoaXMuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcy5mb3JFYWNoKCBjaGFyZ2VkUGFydGljbGUgPT4ge1xyXG4gICAgICBudW1iZXJBY3RpdmVDaGFyZ2VkUGFydGljbGVzKys7XHJcbiAgICAgIG5ldEVsZWN0cmljQ2hhcmdlICs9IGNoYXJnZWRQYXJ0aWNsZS5jaGFyZ2U7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSWYgbmV0IGNoYXJnZSBpcyBub256ZXJvLCB0aGVyZSBtdXN0IGJlIGFuIGVsZWN0cmljIGZpZWxkIChieSBHYXVzcydzIGxhdylcclxuICAgIGlmICggbmV0RWxlY3RyaWNDaGFyZ2UgIT09IDAgKSB7XHJcbiAgICAgIHRoaXMuaXNQbGF5QXJlYUNoYXJnZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBObyBjaGFyZ2VkIHBhcnRpY2xlcyBvbiBzY3JlZW4sIGhlbmNlIG5vIGVsZWN0cmljIGZpZWxkXHJcbiAgICBlbHNlIGlmICggbnVtYmVyQWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyA9PT0gMCApIHtcclxuICAgICAgdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGlzIGlzIGEgcGFpciwgaXQgbXVzdCBiZSBhICstIHBhaXIuIElmIGNoYXJnZXMgYXJlIGNvLWxvY2F0ZWQsIGRvbid0IHNob3cgZmllbGQuXHJcbiAgICBlbHNlIGlmICggbnVtYmVyQWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyA9PT0gMiApIHtcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSBpbmRpY2F0b3IgZm9yIGEgY28tbG9jYXRlZCBwYWlyXHJcbiAgICAgIGNvbnN0IGNvbG9jYXRlZCA9IHRoaXMuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcy5nZXQoIDEgKS5wb3NpdGlvblByb3BlcnR5LmdldCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLm1pbnVzKCB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMuZ2V0KCAwICkucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hZ25pdHVkZSA8IE1JTl9ESVNUQU5DRV9TQ0FMRTtcclxuXHJcbiAgICAgIHRoaXMuaXNQbGF5QXJlYUNoYXJnZWRQcm9wZXJ0eS5zZXQoICFjb2xvY2F0ZWQgKTtcclxuXHJcbiAgICAgIGlmICggY29sb2NhdGVkICkge1xyXG4gICAgICAgIHRoaXMuZWxlY3RyaWNGaWVsZCA9IFZlY3RvcjIuWkVSTztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciB0d28gY29tcGVuc2F0aW5nIHBhaXJzXHJcbiAgICBlbHNlIGlmICggbnVtYmVyQWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyA9PT0gNCApIHtcclxuICAgICAgY29uc3QgcG9zaXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5ID0gW107XHJcbiAgICAgIGNvbnN0IG5lZ2F0aXZlQ2hhcmdlUG9zaXRpb25BcnJheSA9IFtdO1xyXG4gICAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMuZm9yRWFjaCggY2hhcmdlZFBhcnRpY2xlID0+IHtcclxuICAgICAgICBpZiAoIGNoYXJnZWRQYXJ0aWNsZS5jaGFyZ2UgPT09IDEgKSB7XHJcbiAgICAgICAgICBwb3NpdGl2ZUNoYXJnZVBvc2l0aW9uQXJyYXkucHVzaCggY2hhcmdlZFBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBuZWdhdGl2ZUNoYXJnZVBvc2l0aW9uQXJyYXkucHVzaCggY2hhcmdlZFBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICAoIG5lZ2F0aXZlQ2hhcmdlUG9zaXRpb25BcnJheVsgMCBdLmVxdWFscyggcG9zaXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5WyAwIF0gKSAmJlxyXG4gICAgICAgICAgbmVnYXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5WyAxIF0uZXF1YWxzKCBwb3NpdGl2ZUNoYXJnZVBvc2l0aW9uQXJyYXlbIDEgXSApICkgfHxcclxuICAgICAgICAoIG5lZ2F0aXZlQ2hhcmdlUG9zaXRpb25BcnJheVsgMCBdLmVxdWFscyggcG9zaXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5WyAxIF0gKSAmJlxyXG4gICAgICAgICAgbmVnYXRpdmVDaGFyZ2VQb3NpdGlvbkFycmF5WyAxIF0uZXF1YWxzKCBwb3NpdGl2ZUNoYXJnZVBvc2l0aW9uQXJyYXlbIDAgXSApICkgKSB7XHJcbiAgICAgICAgdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmVsZWN0cmljRmllbGQgPSBWZWN0b3IyLlpFUk87XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBmb3IgbW9yZSB0aGFuIHNpeCBjaGFyZ2VzXHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gdGhlcmUgYXJlIGNhc2VzIHdpdGggc2l4IGNoYXJnZXMgKGFuZCBhYm92ZSkgdGhhdCBjYW4gYmUgY29tcGVuc2F0ZWRcclxuICAgICAgLy8gaG93ZXZlciBpdCBpcyBxdWl0ZSBleHBlbnNpdmUgdG8gbWFrZSB0aGlzIHR5cGUgb2YgY2hlY2sgYXMgd2VsbCBhc1xyXG4gICAgICAvLyBpbmNyZWRpYmx5IHVubGlrZWx5IHRvIGJlIHRoZSBjYXNlIGluIHRoZSBmaXJzdCBwbGFjZS5cclxuICAgICAgdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIGFsbCBzZW5zb3JzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVBbGxTZW5zb3JzKCkge1xyXG4gICAgdGhpcy5lbGVjdHJpY1BvdGVudGlhbFNlbnNvci51cGRhdGUoKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZWxlY3RyaWNGaWVsZFNlbnNvckdyb3VwLmNvdW50OyBpKysgKSB7XHJcbiAgICAgIHRoaXMuZWxlY3RyaWNGaWVsZFNlbnNvckdyb3VwLmdldEVsZW1lbnQoIGkgKS51cGRhdGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0aGUgZWxlY3RyaWMgZmllbGQgKGEgdmVjdG9yKSBhdCB0aGUgZ2l2ZW4gcG9zaXRpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gLSBwb3NpdGlvbiBvZiBzZW5zb3JcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gZWxlY3RyaWNGaWVsZFxyXG4gICAqL1xyXG4gIGdldEVsZWN0cmljRmllbGQoIHBvc2l0aW9uICkge1xyXG4gICAgY29uc3QgZWxlY3RyaWNGaWVsZCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgdGhpcy5hY3RpdmVDaGFyZ2VkUGFydGljbGVzLmZvckVhY2goIGNoYXJnZWRQYXJ0aWNsZSA9PiB7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlU3F1YXJlZCA9IGNoYXJnZWRQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlU3F1YXJlZCggcG9zaXRpb24gKTtcclxuXHJcbiAgICAgIC8vIEF2b2lkIGJ1Z3Mgc3RlbW1pbmcgZnJvbSBsYXJnZSBvciBpbmZpbml0ZSBmaWVsZHMgKCM4MiwgIzg0LCAjODUpLlxyXG4gICAgICAvLyBBc3NpZ24gdGhlIEUtZmllbGQgYW4gYW5nbGUgb2YgemVybyBhbmQgYSBtYWduaXR1ZGUgd2VsbCBhYm92ZSB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxyXG4gICAgICBpZiAoIGRpc3RhbmNlU3F1YXJlZCA8IE1JTl9ESVNUQU5DRV9TQ0FMRSApIHtcclxuICAgICAgICBlbGVjdHJpY0ZpZWxkLnggPSAxMCAqIENoYXJnZXNBbmRGaWVsZHNDb25zdGFudHMuTUFYX0VGSUVMRF9NQUdOSVRVREU7XHJcbiAgICAgICAgZWxlY3RyaWNGaWVsZC55ID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlUG93ZXJDdWJlID0gTWF0aC5wb3coIGRpc3RhbmNlU3F1YXJlZCwgMS41ICk7XHJcblxyXG4gICAgICAvLyBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgd2UgZG9uJ3Qgd2FudCB0byBnZW5lcmF0ZSBtb3JlIHZlY3RvciBhbGxvY2F0aW9uc1xyXG4gICAgICBjb25zdCBlbGVjdHJpY0ZpZWxkQ29udHJpYnV0aW9uID0ge1xyXG4gICAgICAgIHg6ICggcG9zaXRpb24ueCAtIGNoYXJnZWRQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKSAqICggY2hhcmdlZFBhcnRpY2xlLmNoYXJnZSApIC8gZGlzdGFuY2VQb3dlckN1YmUsXHJcbiAgICAgICAgeTogKCBwb3NpdGlvbi55IC0gY2hhcmdlZFBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSApICogKCBjaGFyZ2VkUGFydGljbGUuY2hhcmdlICkgLyBkaXN0YW5jZVBvd2VyQ3ViZVxyXG4gICAgICB9O1xyXG4gICAgICBlbGVjdHJpY0ZpZWxkLmFkZCggZWxlY3RyaWNGaWVsZENvbnRyaWJ1dGlvbiApO1xyXG4gICAgfSApO1xyXG4gICAgZWxlY3RyaWNGaWVsZC5tdWx0aXBseVNjYWxhciggS19DT05TVEFOVCApOyAvLyBwcmVmYWN0b3IgZGVwZW5kcyBvbiB1bml0c1xyXG4gICAgcmV0dXJuIGVsZWN0cmljRmllbGQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gdGhlIGVsZWN0cmljIHBvdGVudGlhbCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gZHVlIHRvIHRoZSBjb25maWd1cmF0aW9uIG9mIGNoYXJnZXMgb24gdGhlIGJvYXJkLlxyXG4gICAqIEBwdWJsaWMgcmVhZC1Pbmx5XHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGVsZWN0cmljUG90ZW50aWFsXHJcbiAgICovXHJcbiAgZ2V0RWxlY3RyaWNQb3RlbnRpYWwoIHBvc2l0aW9uICkge1xyXG4gICAgbGV0IGVsZWN0cmljUG90ZW50aWFsID0gMDtcclxuXHJcbiAgICBpZiAoICF0aGlzLmlzUGxheUFyZWFDaGFyZ2VkUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHJldHVybiBlbGVjdHJpY1BvdGVudGlhbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXRDaGFyZ2VPblNpdGUgPSB0aGlzLmdldENoYXJnZSggcG9zaXRpb24gKTsgLy8gdGhlIG5ldCBjaGFyZ2UgYXQgcG9zaXRpb25cclxuXHJcbiAgICBpZiAoIG5ldENoYXJnZU9uU2l0ZSA+IDAgKSB7XHJcbiAgICAgIHJldHVybiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbmV0Q2hhcmdlT25TaXRlIDwgMCApIHtcclxuICAgICAgcmV0dXJuIE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMuZm9yRWFjaCggY2hhcmdlZFBhcnRpY2xlID0+IHtcclxuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IGNoYXJnZWRQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBwb3NpdGlvbiApO1xyXG5cclxuICAgICAgICBpZiAoIGRpc3RhbmNlID4gMCApIHtcclxuICAgICAgICAgIGVsZWN0cmljUG90ZW50aWFsICs9ICggY2hhcmdlZFBhcnRpY2xlLmNoYXJnZSApIC8gZGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBlbGVjdHJpY1BvdGVudGlhbCAqPSBLX0NPTlNUQU5UOyAvLyBwcmVmYWN0b3IgZGVwZW5kcyBvbiB1bml0c1xyXG4gICAgICByZXR1cm4gZWxlY3RyaWNQb3RlbnRpYWw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgbG9jYWwgY2hhcmdlIGF0IHRoaXMgcG9zaXRpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldENoYXJnZSggcG9zaXRpb24gKSB7XHJcbiAgICBsZXQgY2hhcmdlID0gMDtcclxuICAgIHRoaXMuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcy5mb3JFYWNoKCBjaGFyZ2VkUGFydGljbGUgPT4ge1xyXG4gICAgICBpZiAoIGNoYXJnZWRQYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmVxdWFscyggcG9zaXRpb24gKSApIHtcclxuICAgICAgICBjaGFyZ2UgKz0gY2hhcmdlZFBhcnRpY2xlLmNoYXJnZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGNoYXJnZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY2FuQWRkRWxlY3RyaWNQb3RlbnRpYWxMaW5lKCBwb3NpdGlvbiApIHtcclxuXHJcblxyXG4gICAgLy8gRG8gbm90IHRyeSB0byBhZGQgYW4gZXF1aXBvdGVudGlhbCBsaW5lIGlmIHRoZXJlIGFyZSBubyBjaGFyZ2VzLlxyXG4gICAgaWYgKCAhdGhpcy5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgd2UgYXJlIHRvbyBjbG9zZSB0byBhIGNoYXJnZWQgcGFydGljbGUsIGFsc28gYmFpbCBvdXQuXHJcbiAgICAvLyBpbiBtb2RlbCBjb29yZGluYXRlcywgc2hvdWxkIGJlIGxlc3MgdGhhbiB0aGUgcmFkaXVzIChpbiB0aGUgdmlldykgb2YgYSBjaGFyZ2VkIHBhcnRpY2xlXHJcbiAgICBjb25zdCBpc1Rvb0Nsb3NlVG9QYXJ0aWNsZSA9IHRoaXMuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcy5zb21lKFxyXG4gICAgICBjaGFyZ2VkUGFydGljbGUgPT4gY2hhcmdlZFBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHBvc2l0aW9uICkgPCAwLjAzXHJcbiAgICApO1xyXG4gICAgcmV0dXJuICFpc1Rvb0Nsb3NlVG9QYXJ0aWNsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1c2ggYW4gZWxlY3RyaWNQb3RlbnRpYWxMaW5lIHRvIGFuIG9ic2VydmFibGUgYXJyYXlcclxuICAgKiBUaGUgZHJhd2luZyBvZiB0aGUgZWxlY3RyaWNQb3RlbnRpYWwgbGluZSBpcyBoYW5kbGVkIGluIHRoZSB2aWV3IChFbGVjdHJpY1BvdGVudGlhbExpbmVWaWV3KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IFtwb3NpdGlvbl0gLSBvcHRpb25hbCBhcmd1bWVudDogc3RhcnRpbmcgcG9pbnQgdG8gY2FsY3VsYXRlIHRoZSBlbGVjdHJpY1BvdGVudGlhbCBsaW5lXHJcbiAgICovXHJcbiAgYWRkRWxlY3RyaWNQb3RlbnRpYWxMaW5lKFxyXG4gICAgcG9zaXRpb24gPSB0aGlzLmVsZWN0cmljUG90ZW50aWFsU2Vuc29yLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgLy8gdXNlIHRoZSBQb3RlbnRpYWwgU2Vuc29yIGFzIGRlZmF1bHQgcG9zaXRpb25cclxuICApIHtcclxuXHJcbiAgICAvLyBUT0RPOiBwZXJoYXBzIHdlIHdhbnQgdGhpcywgYnV0IGl0IHNlZW1zIGxpa2UgaXNQbGF5QXJlYUNoYXJnZWRQcm9wZXJ0eSBpcyBub3QgYmVpbmcga2VwdCB1cCBhbmQgaW4gc3luYy5cclxuICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzUGxheUFyZWFDaGFyZ2VkUHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICAvLyBEbyBub3QgdHJ5IHRvIGFkZCBhbiBlcXVpcG90ZW50aWFsIGxpbmUgaWYgdGhlcmUgYXJlIG5vIGNoYXJnZXMuXHJcbiAgICBpZiAoICF0aGlzLmlzUGxheUFyZWFDaGFyZ2VkUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgdG9vIGNsb3NlIHRvIGEgY2hhcmdlZCBwYXJ0aWNsZSwgYWxzbyBiYWlsIG91dC5cclxuICAgIC8vIGluIG1vZGVsIGNvb3JkaW5hdGVzLCBzaG91bGQgYmUgbGVzcyB0aGFuIHRoZSByYWRpdXMgKGluIHRoZSB2aWV3KSBvZiBhIGNoYXJnZWQgcGFydGljbGVcclxuICAgIGNvbnN0IGlzVG9vQ2xvc2VUb1BhcnRpY2xlID0gdGhpcy5hY3RpdmVDaGFyZ2VkUGFydGljbGVzLnNvbWUoXHJcbiAgICAgIGNoYXJnZWRQYXJ0aWNsZSA9PiBjaGFyZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggcG9zaXRpb24gKSA8IDAuMDNcclxuICAgICk7XHJcbiAgICBpZiAoIGlzVG9vQ2xvc2VUb1BhcnRpY2xlICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmVsZWN0cmljUG90ZW50aWFsTGluZUdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBwb3NpdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHVzaCBtYW55IGVsZWN0cmljIFBvdGVudGlhbCBMaW5lcyB0byBhbiBvYnNlcnZhYmxlIGFycmF5XHJcbiAgICogVGhlIGRyYXdpbmcgb2YgdGhlIGVsZWN0cmljIFBvdGVudGlhbCBMaW5lcyBpcyBoYW5kbGVkIGluIHRoZSB2aWV3LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJPZkxpbmVzXHJcbiAgICogVVNFRCBJTiBERUJVR0dJTkcgTU9ERVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRNYW55RWxlY3RyaWNQb3RlbnRpYWxMaW5lcyggbnVtYmVyT2ZMaW5lcyApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mTGluZXM7IGkrKyApIHtcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgVmVjdG9yMihcclxuICAgICAgICBXSURUSCAqICggZG90UmFuZG9tLm5leHREb3VibGUoKSAtIDAuNSApLFxyXG4gICAgICAgIEhFSUdIVCAqICggZG90UmFuZG9tLm5leHREb3VibGUoKSAtIDAuNSApICk7IC8vIGEgcmFuZG9tIHBvc2l0aW9uIG9uIHRoZSBncmFwaFxyXG5cclxuICAgICAgdGhpcy5jYW5BZGRFbGVjdHJpY1BvdGVudGlhbExpbmUoIHBvc2l0aW9uICkgJiYgdGhpcy5hZGRFbGVjdHJpY1BvdGVudGlhbExpbmUoIHBvc2l0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IGNsZWFycyB0aGUgRXF1aXBvdGVudGlhbCBMaW5lcyBPYnNlcnZhYmxlIEFycmF5XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNsZWFyRWxlY3RyaWNQb3RlbnRpYWxMaW5lcygpIHtcclxuXHJcbiAgICAvLyBDbGVhciBsaW5lcyB3aXRob3V0IGRpc3J1cHRpbmcgcGhldC1pbyBzdGF0ZVxyXG4gICAgaWYgKCAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5lbGVjdHJpY1BvdGVudGlhbExpbmVHcm91cC5jbGVhciggeyByZXNldEluZGV4OiBmYWxzZSB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzbmFwIHRoZSBwb3NpdGlvbiB0byB0aGUgbWlub3IgZ3JpZGxpbmVzXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48VmVjdG9yMj59IHBvc2l0aW9uUHJvcGVydHlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc25hcFRvR3JpZExpbmVzKCBwb3NpdGlvblByb3BlcnR5ICkge1xyXG4gICAgaWYgKCB0aGlzLnNuYXBUb0dyaWRQcm9wZXJ0eS52YWx1ZSAmJiB0aGlzLmlzR3JpZFZpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHBvc2l0aW9uUHJvcGVydHkuZ2V0KClcclxuICAgICAgICAuZGl2aWRlZFNjYWxhciggR1JJRF9NSU5PUl9TUEFDSU5HIClcclxuICAgICAgICAucm91bmRlZFN5bW1ldHJpYygpXHJcbiAgICAgICAgLnRpbWVzU2NhbGFyKCBHUklEX01JTk9SX1NQQUNJTkcgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzbmFwQWxsRWxlbWVudHMoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMuZm9yRWFjaCggY2hhcmdlZFBhcnRpY2xlID0+IHRoaXMuc25hcFRvR3JpZExpbmVzKCBjaGFyZ2VkUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eSApICk7XHJcbiAgICB0aGlzLmVsZWN0cmljRmllbGRTZW5zb3JHcm91cC5mb3JFYWNoKCBlbGVjdHJpY0ZpZWxkU2Vuc29yID0+IHRoaXMuc25hcFRvR3JpZExpbmVzKCBlbGVjdHJpY0ZpZWxkU2Vuc29yLnBvc2l0aW9uUHJvcGVydHkgKSApO1xyXG5cclxuICAgIHRoaXMuc25hcFRvR3JpZExpbmVzKCB0aGlzLmVsZWN0cmljUG90ZW50aWFsU2Vuc29yLnBvc2l0aW9uUHJvcGVydHkgKTtcclxuICAgIHRoaXMuc25hcFRvR3JpZExpbmVzKCB0aGlzLm1lYXN1cmluZ1RhcGUuYmFzZVBvc2l0aW9uUHJvcGVydHkgKTtcclxuICAgIHRoaXMuc25hcFRvR3JpZExpbmVzKCB0aGlzLm1lYXN1cmluZ1RhcGUudGlwUG9zaXRpb25Qcm9wZXJ0eSApO1xyXG4gIH1cclxufVxyXG5cclxuY2hhcmdlc0FuZEZpZWxkcy5yZWdpc3RlciggJ0NoYXJnZXNBbmRGaWVsZHNNb2RlbCcsIENoYXJnZXNBbmRGaWVsZHNNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBDaGFyZ2VzQW5kRmllbGRzTW9kZWw7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsV0FBVyxNQUFNLHNDQUFzQztBQUM5RCxPQUFPQyxZQUFZLE1BQU0sdUNBQXVDO0FBQ2hFLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQztBQUN2RSxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFDOUQsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThC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