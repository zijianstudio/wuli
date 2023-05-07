// Copyright 2014-2023, University of Colorado Boulder

/**
 * This is the main class for the model portion of the first two screens of the "States of Matter" simulation.  Its
 * primary purpose is to simulate a set of molecules that are interacting with one another based on the attraction and
 * repulsion that is described by the Lennard-Jones potential equation.
 *
 * Each instance of this class maintains a set of data that represents a normalized model in which all atoms that
 * comprise each molecule - and often it is just one atom per molecule - are assumed to have a diameter of 1, since this
 * allows for very quick calculations, and also a set of data for atoms that have the actual diameter of the atoms being
 * simulated (e.g. Argon). Throughout the comments and in the variable naming the terms "normalized data set" (or
 * sometimes simply "normalized set") and "model data set" are used for this date, respectively.  When the simulation is
 * running, the normalized data set is updated first, since that is where the hardcore calculations are performed, and
 * then the model data set is synchronized with the normalized data.  It is the model data set that is monitored by the
 * view components that actually display the molecule positions to the user.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import PhaseStateEnum from '../PhaseStateEnum.js';
import SOMConstants from '../SOMConstants.js';
import SubstanceType from '../SubstanceType.js';
import AtomType from './AtomType.js';
import DiatomicAtomPositionUpdater from './engine/DiatomicAtomPositionUpdater.js';
import DiatomicPhaseStateChanger from './engine/DiatomicPhaseStateChanger.js';
import DiatomicVerletAlgorithm from './engine/DiatomicVerletAlgorithm.js';
import AndersenThermostat from './engine/kinetic/AndersenThermostat.js';
import IsokineticThermostat from './engine/kinetic/IsokineticThermostat.js';
import MonatomicAtomPositionUpdater from './engine/MonatomicAtomPositionUpdater.js';
import MonatomicPhaseStateChanger from './engine/MonatomicPhaseStateChanger.js';
import MonatomicVerletAlgorithm from './engine/MonatomicVerletAlgorithm.js';
import WaterAtomPositionUpdater from './engine/WaterAtomPositionUpdater.js';
import WaterPhaseStateChanger from './engine/WaterPhaseStateChanger.js';
import WaterVerletAlgorithm from './engine/WaterVerletAlgorithm.js';
import MoleculeForceAndMotionDataSet from './MoleculeForceAndMotionDataSet.js';
import MovingAverage from './MovingAverage.js';
import HydrogenAtom from './particle/HydrogenAtom.js';
import ScaledAtom from './particle/ScaledAtom.js';

//---------------------------------------------------------------------------------------------------------------------
// constants
//---------------------------------------------------------------------------------------------------------------------

// general constants
const CONTAINER_WIDTH = 10000; // in picometers
const CONTAINER_INITIAL_HEIGHT = 10000; // in picometers
const DEFAULT_SUBSTANCE = SubstanceType.NEON;
const MAX_TEMPERATURE = 50.0;
const MIN_TEMPERATURE = 0.00001;
const NOMINAL_GRAVITATIONAL_ACCEL = -0.045;
const TEMPERATURE_CHANGE_RATE = 0.07; // empirically determined to make temperate change at a reasonable rate
const INJECTED_MOLECULE_SPEED = 2.0; // in normalized model units per second, empirically determined to look reasonable
const INJECTED_MOLECULE_ANGLE_SPREAD = Math.PI * 0.25; // in radians, empirically determined to look reasonable
const INJECTION_POINT_HORIZ_PROPORTION = 0.00;
const INJECTION_POINT_VERT_PROPORTION = 0.25;

// constants related to how time steps are handled
const PARTICLE_SPEED_UP_FACTOR = 4; // empirically determined to make the particles move at a speed that looks reasonable
const MAX_PARTICLE_MOTION_TIME_STEP = 0.025; // max time step that model can handle, empirically determined

// constants that define the normalized temperatures used for the various states
const SOLID_TEMPERATURE = SOMConstants.SOLID_TEMPERATURE;
const LIQUID_TEMPERATURE = SOMConstants.LIQUID_TEMPERATURE;
const GAS_TEMPERATURE = SOMConstants.GAS_TEMPERATURE;
const INITIAL_TEMPERATURE = SOLID_TEMPERATURE;
const APPROACHING_ABSOLUTE_ZERO_TEMPERATURE = SOLID_TEMPERATURE * 0.85;

// parameters to control rates of change of the container size
const MAX_CONTAINER_EXPAND_RATE = 1500; // in model units per second
const POST_EXPLOSION_CONTAINER_EXPANSION_RATE = 9000; // in model units per second

// Range for deciding if the temperature is near the current set point. The units are internal model units.
const TEMPERATURE_CLOSENESS_RANGE = 0.15;

// Values used for converting from model temperature to the temperature for a given substance.
const NEON_TRIPLE_POINT_IN_KELVIN = SOMConstants.NEON_TRIPLE_POINT_IN_KELVIN;
const NEON_CRITICAL_POINT_IN_KELVIN = SOMConstants.NEON_CRITICAL_POINT_IN_KELVIN;
const ARGON_TRIPLE_POINT_IN_KELVIN = SOMConstants.ARGON_TRIPLE_POINT_IN_KELVIN;
const ARGON_CRITICAL_POINT_IN_KELVIN = SOMConstants.ARGON_CRITICAL_POINT_IN_KELVIN;
const O2_TRIPLE_POINT_IN_KELVIN = SOMConstants.O2_TRIPLE_POINT_IN_KELVIN;
const O2_CRITICAL_POINT_IN_KELVIN = SOMConstants.O2_CRITICAL_POINT_IN_KELVIN;
const WATER_TRIPLE_POINT_IN_KELVIN = SOMConstants.WATER_TRIPLE_POINT_IN_KELVIN;
const WATER_CRITICAL_POINT_IN_KELVIN = SOMConstants.WATER_CRITICAL_POINT_IN_KELVIN;

// The following values are used for temperature conversion for the adjustable molecule.  These are somewhat
// arbitrary, since in the real world the values would change if epsilon were changed.  They have been chosen to be
// similar to argon, because the default epsilon value is half of the allowable range, and this value ends up being
// similar to argon.
const ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN = 75;
const ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN = 140;

// Time value used to prevent molecule injections from being too close together so that they don't overlap after
// injection and cause high initial velocities.
const MOLECULE_INJECTION_HOLDOFF_TIME = 0.25; // seconds, empirically determined
const MAX_MOLECULES_QUEUED_FOR_INJECTION = 3;
class MultipleParticleModel extends PhetioObject {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      validSubstances: SubstanceType.VALUES
    }, options);
    super({
      tandem: tandem,
      phetioType: MultipleParticleModel.MultipleParticleModelIO
    });

    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties
    //-----------------------------------------------------------------------------------------------------------------

    // @public (read-write)
    this.substanceProperty = new EnumerationDeprecatedProperty(SubstanceType, DEFAULT_SUBSTANCE, {
      validValues: options.validSubstances,
      tandem: tandem.createTandem('substanceProperty'),
      phetioState: false
    });

    // @public (read-only)
    this.containerHeightProperty = new NumberProperty(CONTAINER_INITIAL_HEIGHT, {
      tandem: tandem.createTandem('containerHeightProperty'),
      phetioState: false,
      phetioReadOnly: true,
      phetioDocumentation: 'The height of the particle container, in picometers.',
      units: 'pm'
    });

    // @public (read-only)
    this.isExplodedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isExplodedProperty'),
      phetioState: false,
      phetioReadOnly: true
    });

    // @public (read-write)
    this.temperatureSetPointProperty = new NumberProperty(INITIAL_TEMPERATURE, {
      tandem: tandem.createTandem('temperatureSetPointProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'In internal model units, solid = 0.15, liquid = 0.34, gas = 1.'
    });

    // @public (read-only)
    this.pressureProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('pressureProperty'),
      phetioReadOnly: true,
      units: 'atm'
    });

    // @public (read-write)
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty')
    });

    // @public (read-write)
    this.heatingCoolingAmountProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('heatingCoolingAmountProperty'),
      phetioState: false,
      range: new Range(-1, 1)
    });

    // @public (read-write) - the number of molecules that should be in the simulation.  This is used primarily for
    // injecting new molecules, and when this number is increased, internal model state is adjusted to match.
    this.targetNumberOfMoleculesProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('targetNumberOfMoleculesProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'This value represents the number of particles being simulated, not the number of particles in the container.'
    });

    // @public (read-only)
    this.maxNumberOfMoleculesProperty = new NumberProperty(SOMConstants.MAX_NUM_ATOMS);

    // @private {NumberProperty}
    this.numMoleculesQueuedForInjectionProperty = new NumberProperty(0);

    // @public (read-only) - indicates whether injection of additional molecules is allowed
    this.isInjectionAllowedProperty = new DerivedProperty([this.isPlayingProperty, this.numMoleculesQueuedForInjectionProperty, this.isExplodedProperty, this.maxNumberOfMoleculesProperty, this.targetNumberOfMoleculesProperty], (isPlaying, numberOfMoleculesQueuedForInjection, isExploded, maxNumberOfMoleculesProperty, targetNumberOfMolecules) => {
      return isPlaying && numberOfMoleculesQueuedForInjection < MAX_MOLECULES_QUEUED_FOR_INJECTION && !isExploded && targetNumberOfMolecules < maxNumberOfMoleculesProperty;
    });

    // @public (listen-only) - fires when a reset occurs
    this.resetEmitter = new Emitter();

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // @public (read-only) {ObservableArrayDef.<ScaledAtom>} - array of scaled (i.e. non-normalized) atoms
    this.scaledAtoms = createObservableArray();

    // @public {MoleculeForceAndMotionDataSet} - data set containing information about the position, motion, and force
    // for the normalized atoms
    this.moleculeDataSet = null;

    // @public (read-only) {number} - various non-property attributes
    this.normalizedContainerWidth = CONTAINER_WIDTH / this.particleDiameter;
    this.gravitationalAcceleration = NOMINAL_GRAVITATIONAL_ACCEL;

    // @public (read-only) {number} - normalized version of the container height, changes as the lid position changes
    this.normalizedContainerHeight = this.containerHeightProperty.get() / this.particleDiameter;

    // @public (read-only) {number} - normalized version of the TOTAL container height regardless of the lid position
    this.normalizedTotalContainerHeight = this.containerHeightProperty.get / this.particleDiameter;

    // @protected - normalized velocity at which lid is moving in y direction
    this.normalizedLidVelocityY = 0;

    // @protected (read-only) {Vector2} - the location where new molecules are injected, in normalized coordinates
    this.injectionPoint = Vector2.ZERO.copy();

    // @private, various internal model variables
    this.particleDiameter = 1;
    this.minModelTemperature = null;
    this.residualTime = 0;
    this.moleculeInjectionHoldoffTimer = 0;
    this.heightChangeThisStep = 0;
    this.moleculeInjectedThisStep = false;

    // @private, strategy patterns that are applied to the data set
    this.atomPositionUpdater = null;
    this.phaseStateChanger = null;
    this.isoKineticThermostat = null;
    this.andersenThermostat = null;

    // @protected
    this.moleculeForceAndMotionCalculator = null;

    // @private - moving average calculator that tracks the average difference between the calculated and target temperatures
    this.averageTemperatureDifference = new MovingAverage(10);

    //-----------------------------------------------------------------------------------------------------------------
    // other initialization
    //-----------------------------------------------------------------------------------------------------------------

    // listen for changes to the substance being simulated and update the internals as needed
    this.substanceProperty.link(substance => {
      this.handleSubstanceChanged(substance);
    });

    // listen for changes to the non-normalized container size and update the normalized dimensions
    this.containerHeightProperty.link(this.updateNormalizedContainerDimensions.bind(this));

    // listen for new molecules being added (generally from the pump)
    this.targetNumberOfMoleculesProperty.lazyLink(targetNumberOfMolecules => {
      assert && assert(targetNumberOfMolecules <= this.maxNumberOfMoleculesProperty.value, 'target number of molecules set above max allowed');
      const currentNumberOfMolecules = Math.floor(this.moleculeDataSet.numberOfAtoms / this.moleculeDataSet.atomsPerMolecule);
      const numberOfMoleculesToAdd = targetNumberOfMolecules - (currentNumberOfMolecules + this.numMoleculesQueuedForInjectionProperty.value);
      for (let i = 0; i < numberOfMoleculesToAdd; i++) {
        this.queueMoleculeForInjection();
      }
    });

    // @public (read-only) - the model temperature in Kelvin, derived from the temperature set point in model units
    this.temperatureInKelvinProperty = new DerivedProperty([this.temperatureSetPointProperty, this.substanceProperty, this.targetNumberOfMoleculesProperty], () => this.getTemperatureInKelvin(), {
      units: 'K',
      phetioValueType: NullableIO(NumberIO),
      tandem: tandem.createTandem('temperatureInKelvinProperty'),
      phetReadOnly: true
    });
  }

  /**
   * @param {number} newTemperature
   * @public
   */
  setTemperature(newTemperature) {
    if (newTemperature > MAX_TEMPERATURE) {
      this.temperatureSetPointProperty.set(MAX_TEMPERATURE);
    } else if (newTemperature < MIN_TEMPERATURE) {
      this.temperatureSetPointProperty.set(MIN_TEMPERATURE);
    } else {
      this.temperatureSetPointProperty.set(newTemperature);
    }
    if (this.isoKineticThermostat !== null) {
      this.isoKineticThermostat.targetTemperature = newTemperature;
    }
    if (this.andersenThermostat !== null) {
      this.andersenThermostat.targetTemperature = newTemperature;
    }
  }

  /**
   * Get the current temperature in degrees Kelvin.  The calculations done are dependent on the type of molecule
   * selected.  The values and ranges used in this method were derived from information provided by Paul Beale, dept
   * of Physics, University of Colorado Boulder.  If no atoms are in the container, this returns null.
   * @returns {number|null}
   * @private
   */
  getTemperatureInKelvin() {
    if (this.scaledAtoms.length === 0) {
      // temperature is reported as null if there are no atoms since the temperature is meaningless in that case
      return null;
    }
    let temperatureInKelvin;
    let triplePointInKelvin = 0;
    let criticalPointInKelvin = 0;
    let triplePointInModelUnits = 0;
    let criticalPointInModelUnits = 0;
    switch (this.substanceProperty.get()) {
      case SubstanceType.NEON:
        triplePointInKelvin = NEON_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = NEON_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        break;
      case SubstanceType.ARGON:
        triplePointInKelvin = ARGON_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = ARGON_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        break;
      case SubstanceType.ADJUSTABLE_ATOM:
        triplePointInKelvin = ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        break;
      case SubstanceType.WATER:
        triplePointInKelvin = WATER_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = WATER_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_WATER_MODEL_TEMPERATURE;
        break;
      case SubstanceType.DIATOMIC_OXYGEN:
        triplePointInKelvin = O2_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = O2_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_DIATOMIC_MODEL_TEMPERATURE;
        break;
      default:
        throw new Error('unsupported substance');
      // should never happen, debug if it does
    }

    if (this.temperatureSetPointProperty.get() <= this.minModelTemperature) {
      // we treat anything below the minimum temperature as absolute zero
      temperatureInKelvin = 0;
    } else if (this.temperatureSetPointProperty.get() < triplePointInModelUnits) {
      temperatureInKelvin = this.temperatureSetPointProperty.get() * triplePointInKelvin / triplePointInModelUnits;
      if (temperatureInKelvin < 0.5) {
        // Don't return zero - or anything that would round to it - as a value until we actually reach the minimum
        // internal temperature.
        temperatureInKelvin = 0.5;
      }
    } else if (this.temperatureSetPointProperty.get() < criticalPointInModelUnits) {
      const slope = (criticalPointInKelvin - triplePointInKelvin) / (criticalPointInModelUnits - triplePointInModelUnits);
      const offset = triplePointInKelvin - slope * triplePointInModelUnits;
      temperatureInKelvin = this.temperatureSetPointProperty.get() * slope + offset;
    } else {
      temperatureInKelvin = this.temperatureSetPointProperty.get() * criticalPointInKelvin / criticalPointInModelUnits;
    }
    return temperatureInKelvin;
  }

  /**
   * Get the pressure value which is being calculated by the model and is not adjusted to represent any "real" units
   * (such as atmospheres).
   * @returns {number}
   * @public
   */
  getModelPressure() {
    return this.moleculeForceAndMotionCalculator.pressureProperty.get();
  }

  /**
   * handler that sets up the various portions of the model to support the newly selected substance
   * @param {SubstanceType} substance
   * @protected
   */
  handleSubstanceChanged(substance) {
    assert && assert(substance === SubstanceType.DIATOMIC_OXYGEN || substance === SubstanceType.NEON || substance === SubstanceType.ARGON || substance === SubstanceType.WATER || substance === SubstanceType.ADJUSTABLE_ATOM, 'unsupported substance');

    // Retain the current phase so that we can set the atoms back to this phase once they have been created and
    // initialized.
    const phase = this.mapTemperatureToPhase();

    // remove all atoms
    this.removeAllAtoms();

    // Reinitialize the model parameters.
    this.initializeModelParameters();

    // Set the model parameters that are dependent upon the substance being simulated.
    switch (substance) {
      case SubstanceType.DIATOMIC_OXYGEN:
        this.particleDiameter = SOMConstants.OXYGEN_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE / O2_TRIPLE_POINT_IN_KELVIN;
        break;
      case SubstanceType.NEON:
        this.particleDiameter = SOMConstants.NEON_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / NEON_TRIPLE_POINT_IN_KELVIN;
        break;
      case SubstanceType.ARGON:
        this.particleDiameter = SOMConstants.ARGON_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / ARGON_TRIPLE_POINT_IN_KELVIN;
        break;
      case SubstanceType.WATER:
        // Use a radius value that is artificially large, because the educators have requested that water look
        // "spaced out" so that users can see the crystal structure better, and so that the solid form will look
        // larger (since water expands when frozen).
        this.particleDiameter = SOMConstants.OXYGEN_RADIUS * 2.9;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE / WATER_TRIPLE_POINT_IN_KELVIN;
        break;
      case SubstanceType.ADJUSTABLE_ATOM:
        this.particleDiameter = SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
        break;
      default:
        throw new Error('unsupported substance');
      // should never happen, debug if it does
    }

    // Reset the container height.
    this.containerHeightProperty.reset();

    // Make sure the normalized container dimensions are correct for the substance and the current non-normalize size.
    this.updateNormalizedContainerDimensions();

    // Adjust the injection point based on the new particle diameter.  These are using the normalized coordinate values.
    this.injectionPoint.setXY(CONTAINER_WIDTH / this.particleDiameter * INJECTION_POINT_HORIZ_PROPORTION, CONTAINER_INITIAL_HEIGHT / this.particleDiameter * INJECTION_POINT_VERT_PROPORTION);

    // Add the atoms and set their initial positions.
    this.initializeAtoms(phase);

    // Reset the moving average of temperature differences.
    this.averageTemperatureDifference.reset();

    // Set the number of molecules and range for the current substance.
    const atomsPerMolecule = this.moleculeDataSet.atomsPerMolecule;
    this.targetNumberOfMoleculesProperty.set(Math.floor(this.moleculeDataSet.numberOfAtoms / atomsPerMolecule));
    this.maxNumberOfMoleculesProperty.set(Math.floor(SOMConstants.MAX_NUM_ATOMS / atomsPerMolecule));
  }

  /**
   *  @private
   */
  updatePressure() {
    this.pressureProperty.set(this.getPressureInAtmospheres());
  }

  /**
   * @public
   */
  reset() {
    const substanceAtStartOfReset = this.substanceProperty.get();

    // reset observable properties
    this.containerHeightProperty.reset();
    this.isExplodedProperty.reset();
    this.temperatureSetPointProperty.reset();
    this.pressureProperty.reset();
    this.substanceProperty.reset();
    this.isPlayingProperty.reset();
    this.heatingCoolingAmountProperty.reset();

    // reset thermostats
    this.isoKineticThermostat.clearAccumulatedBias();
    this.andersenThermostat.clearAccumulatedBias();

    // if the substance wasn't changed during reset, so some additional work is necessary
    if (substanceAtStartOfReset === this.substanceProperty.get()) {
      this.removeAllAtoms();
      this.containerHeightProperty.reset();
      this.initializeAtoms(PhaseStateEnum.SOLID);
    }

    // other reset
    this.gravitationalAcceleration = NOMINAL_GRAVITATIONAL_ACCEL;
    this.resetEmitter.emit();
  }

  /**
   * Set the phase of the molecules in the simulation.
   * @param {number} phaseSate
   * @public
   */
  setPhase(phaseSate) {
    assert && assert(phaseSate === PhaseStateEnum.SOLID || phaseSate === PhaseStateEnum.LIQUID || phaseSate === PhaseStateEnum.GAS, 'invalid phase state specified');
    this.phaseStateChanger.setPhase(phaseSate);
    this.syncAtomPositions();
  }

  /**
   * Sets the amount of heating or cooling that the system is undergoing.
   * @param {number} normalizedHeatingCoolingAmount - Normalized amount of heating or cooling that the system is
   * undergoing, ranging from -1 to +1.
   * @public
   */
  setHeatingCoolingAmount(normalizedHeatingCoolingAmount) {
    assert && assert(normalizedHeatingCoolingAmount <= 1.0 && normalizedHeatingCoolingAmount >= -1.0);
    this.heatingCoolingAmountProperty.set(normalizedHeatingCoolingAmount);
  }

  /**
   * Inject a new molecule of the current type.  This method actually queues it for injection, actual injection
   * occurs during model steps.  Be aware that this silently ignores the injection request if the model is not in a
   * state to support injection.
   * @private
   */
  queueMoleculeForInjection() {
    this.numMoleculesQueuedForInjectionProperty.set(this.numMoleculesQueuedForInjectionProperty.value + 1);
  }

  /**
   * Inject a new molecule of the current type into the model. This uses the current temperature to assign an initial
   * velocity.
   * @private
   */
  injectMolecule() {
    assert && assert(this.numMoleculesQueuedForInjectionProperty.value > 0, 'this method should not be called when nothing is queued for injection');
    assert && assert(this.moleculeDataSet.getNumberOfRemainingSlots() > 0, 'injection attempted when there is no room in the data set');

    // Choose an injection angle with some amount of randomness.
    const injectionAngle = (dotRandom.nextDouble() - 0.5) * INJECTED_MOLECULE_ANGLE_SPREAD;

    // Set the molecule's velocity.
    const xVel = Math.cos(injectionAngle) * INJECTED_MOLECULE_SPEED;
    const yVel = Math.sin(injectionAngle) * INJECTED_MOLECULE_SPEED;

    // Set the rotational velocity to a random value within a range (will be ignored for single atom cases).
    const moleculeRotationRate = (dotRandom.nextDouble() - 0.5) * (Math.PI / 4);

    // Set the position(s) of the atom(s).
    const atomsPerMolecule = this.moleculeDataSet.atomsPerMolecule;
    const moleculeCenterOfMassPosition = this.injectionPoint.copy();
    const moleculeVelocity = new Vector2(xVel, yVel);
    const atomPositions = [];
    for (let i = 0; i < atomsPerMolecule; i++) {
      atomPositions[i] = Vector2.ZERO;
    }

    // Add the newly created molecule to the data set.
    this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate, true);
    if (atomsPerMolecule > 1) {
      // randomize the rotational angle of multi-atom molecules
      this.moleculeDataSet.moleculeRotationAngles[this.moleculeDataSet.getNumberOfMolecules() - 1] = dotRandom.nextDouble() * 2 * Math.PI;
    }

    // Position the atoms that comprise the molecules.
    this.atomPositionUpdater.updateAtomPositions(this.moleculeDataSet);

    // add the non-normalized atoms
    this.addAtomsForCurrentSubstance(1);
    this.syncAtomPositions();
    this.moleculeInjectedThisStep = true;
    this.numMoleculesQueuedForInjectionProperty.set(this.numMoleculesQueuedForInjectionProperty.value - 1);
  }

  /**
   * add non-normalized atoms for the specified number of molecules of the current substance
   * @param {number} numMolecules
   * @private
   */
  addAtomsForCurrentSubstance(numMolecules) {
    _.times(numMolecules, () => {
      switch (this.substanceProperty.value) {
        case SubstanceType.ARGON:
          this.scaledAtoms.push(new ScaledAtom(AtomType.ARGON, 0, 0));
          break;
        case SubstanceType.NEON:
          this.scaledAtoms.push(new ScaledAtom(AtomType.NEON, 0, 0));
          break;
        case SubstanceType.ADJUSTABLE_ATOM:
          this.scaledAtoms.push(new ScaledAtom(AtomType.ADJUSTABLE, 0, 0));
          break;
        case SubstanceType.DIATOMIC_OXYGEN:
          this.scaledAtoms.push(new ScaledAtom(AtomType.OXYGEN, 0, 0));
          this.scaledAtoms.push(new ScaledAtom(AtomType.OXYGEN, 0, 0));
          break;
        case SubstanceType.WATER:
          this.scaledAtoms.push(new ScaledAtom(AtomType.OXYGEN, 0, 0));
          this.scaledAtoms.push(new HydrogenAtom(0, 0, true));
          this.scaledAtoms.push(new HydrogenAtom(0, 0, dotRandom.nextDouble() > 0.5));
          break;
        default:
          this.scaledAtoms.push(new ScaledAtom(AtomType.NEON, 0, 0));
          break;
      }
    });
  }

  /**
   *  @private
   */
  removeAllAtoms() {
    // Get rid of any existing atoms from the model set.
    this.scaledAtoms.clear();

    // Get rid of the normalized atoms too.
    this.moleculeDataSet = null;
  }

  /**
   * Initialize the normalized and non-normalized data sets by calling the appropriate initialization routine, which
   * will set positions, velocities, etc.
   * @param {number} phase - phase of atoms
   * @public
   */
  initializeAtoms(phase) {
    // Initialize the atoms.
    switch (this.substanceProperty.get()) {
      case SubstanceType.DIATOMIC_OXYGEN:
        this.initializeDiatomic(this.substanceProperty.get(), phase);
        break;
      case SubstanceType.NEON:
        this.initializeMonatomic(this.substanceProperty.get(), phase);
        break;
      case SubstanceType.ARGON:
        this.initializeMonatomic(this.substanceProperty.get(), phase);
        break;
      case SubstanceType.ADJUSTABLE_ATOM:
        this.initializeMonatomic(this.substanceProperty.get(), phase);
        break;
      case SubstanceType.WATER:
        this.initializeTriatomic(this.substanceProperty.get(), phase);
        break;
      default:
        throw new Error('unsupported substance');
      // should never happen, debug if it does
    }

    // This is needed in case we were switching from another molecule that was under pressure.
    this.updatePressure();
  }

  /**
   * @private
   */
  initializeModelParameters() {
    // Initialize the system parameters.
    this.gravitationalAcceleration = NOMINAL_GRAVITATIONAL_ACCEL;
    this.heatingCoolingAmountProperty.reset();
    this.temperatureSetPointProperty.reset();
    this.isExplodedProperty.reset();
  }

  /**
   * Reduce the upward motion of the molecules.  This is generally done to reduce some behavior that is sometimes seen
   * where the molecules float rapidly upwards after being heated.
   * @param {number} dt
   * @private
   */
  dampUpwardMotion(dt) {
    for (let i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++) {
      if (this.moleculeDataSet.moleculeVelocities[i].y > 0) {
        this.moleculeDataSet.moleculeVelocities[i].y *= 1 - dt * 0.9;
      }
    }
  }

  /**
   * Update the normalized full-size container dimensions based on the current particle diameter.
   * @private
   */
  updateNormalizedContainerDimensions() {
    this.normalizedContainerWidth = CONTAINER_WIDTH / this.particleDiameter;

    // The non-normalized height will keep increasing after the container explodes, so we need to limit it here.
    const nonNormalizedContainerHeight = Math.min(this.containerHeightProperty.value, CONTAINER_INITIAL_HEIGHT);
    this.normalizedContainerHeight = nonNormalizedContainerHeight / this.particleDiameter;
    this.normalizedTotalContainerHeight = nonNormalizedContainerHeight / this.particleDiameter;
  }

  /**
   * Step the model.
   * @param {number} dt - delta time, in seconds
   * @public
   */
  stepInTime(dt) {
    this.moleculeInjectedThisStep = false;

    // update the size of the container, which can be affected by exploding or other external factors
    this.updateContainerSize(dt);

    // Record the pressure to see if it changes.
    const pressureBeforeAlgorithm = this.getModelPressure();

    // Calculate the amount of time to advance the particle engine.  This is based purely on aesthetics - we looked at
    // the particle motion and tweaked the multiplier until we felt that it looked good.
    const particleMotionAdvancementTime = dt * PARTICLE_SPEED_UP_FACTOR;

    // Determine the number of model steps and the size of the time step.
    let numParticleEngineSteps = 1;
    let particleMotionTimeStep;
    if (particleMotionAdvancementTime > MAX_PARTICLE_MOTION_TIME_STEP) {
      particleMotionTimeStep = MAX_PARTICLE_MOTION_TIME_STEP;
      numParticleEngineSteps = Math.floor(particleMotionAdvancementTime / MAX_PARTICLE_MOTION_TIME_STEP);
      this.residualTime = particleMotionAdvancementTime - numParticleEngineSteps * particleMotionTimeStep;
    } else {
      particleMotionTimeStep = particleMotionAdvancementTime;
    }
    if (this.residualTime > particleMotionTimeStep) {
      numParticleEngineSteps++;
      this.residualTime -= particleMotionTimeStep;
    }

    // Inject a new molecule if there is one ready and it isn't too soon after a previous injection.  This is done
    // before execution of the Verlet algorithm so that its velocity will be taken into account when the temperature
    // is calculated.
    if (this.numMoleculesQueuedForInjectionProperty.value > 0 && this.moleculeInjectionHoldoffTimer === 0) {
      this.injectMolecule();
      this.moleculeInjectionHoldoffTimer = MOLECULE_INJECTION_HOLDOFF_TIME;
    } else if (this.moleculeInjectionHoldoffTimer > 0) {
      this.moleculeInjectionHoldoffTimer = Math.max(this.moleculeInjectionHoldoffTimer - dt, 0);
    }

    // Execute the Verlet algorithm, a.k.a. the "particle engine", in order to determine the new atom positions.
    for (let i = 0; i < numParticleEngineSteps; i++) {
      this.moleculeForceAndMotionCalculator.updateForcesAndMotion(particleMotionTimeStep);
    }

    // Sync up the positions of the normalized molecules (the molecule data set) with the atoms being monitored by the
    // view (the model data set).
    this.syncAtomPositions();

    // run the thermostat to keep particle energies from getting out of hand
    this.runThermostat();

    // If the pressure changed, update it.
    if (this.getModelPressure() !== pressureBeforeAlgorithm) {
      this.updatePressure();
    }

    // Adjust the temperature set point if needed.
    const currentTemperature = this.temperatureSetPointProperty.get(); // convenience variable
    if (this.heatingCoolingAmountProperty.get() !== 0) {
      let newTemperature;
      if (currentTemperature < APPROACHING_ABSOLUTE_ZERO_TEMPERATURE && this.heatingCoolingAmountProperty.get() < 0) {
        // The temperature adjusts more slowly as we begin to approach absolute zero so that all the molecules have
        // time to reach the bottom of the container.  This is not linear - the rate of change slows as we get closer,
        // to zero degrees Kelvin, which is somewhat real world-ish.
        const adjustmentFactor = Math.pow(currentTemperature / APPROACHING_ABSOLUTE_ZERO_TEMPERATURE, 1.35 // exponent chosen empirically to be as small as possible and still get all molecules to bottom before absolute zero
        );

        newTemperature = currentTemperature + this.heatingCoolingAmountProperty.get() * TEMPERATURE_CHANGE_RATE * dt * adjustmentFactor;
      } else {
        const temperatureChange = this.heatingCoolingAmountProperty.get() * TEMPERATURE_CHANGE_RATE * dt;
        newTemperature = Math.min(currentTemperature + temperatureChange, MAX_TEMPERATURE);
      }

      // Prevent the substance from floating up too rapidly when heated.
      if (currentTemperature < LIQUID_TEMPERATURE && this.heatingCoolingAmountProperty.get() > 0) {
        // This is necessary to prevent the substance from floating up when heated from absolute zero.
        this.dampUpwardMotion(dt);
      }

      // Jump to the minimum model temperature if the substance has reached absolute zero.
      if (this.heatingCoolingAmountProperty.get() <= 0 && this.getTemperatureInKelvin() === 0 && newTemperature > MIN_TEMPERATURE) {
        // Absolute zero has been reached for this substance.  Set the temperature to the minimum allowed value to
        // minimize motion in the molecules.
        newTemperature = MIN_TEMPERATURE;
      }

      // record the new set point
      this.temperatureSetPointProperty.set(newTemperature);
      this.isoKineticThermostat.targetTemperature = newTemperature;
      this.andersenThermostat.targetTemperature = newTemperature;
    }
  }

  /**
   * @param {number} dt - time in seconds
   * @protected
   */
  updateContainerSize(dt) {
    if (this.isExplodedProperty.value) {
      // The lid is blowing off the container - increase the container size until the lid is well off the screen.
      this.heightChangeThisStep = POST_EXPLOSION_CONTAINER_EXPANSION_RATE * dt;
      if (this.containerHeightProperty.get() < CONTAINER_INITIAL_HEIGHT * 3) {
        this.containerHeightProperty.set(this.containerHeightProperty.get() + POST_EXPLOSION_CONTAINER_EXPANSION_RATE * dt);
      }
    } else {
      // no changes to the height in this step
      this.heightChangeThisStep = 0;
      this.normalizedLidVelocityY = 0;
    }
  }

  /**
   * main step function, called by the PhET framework
   * @param {number} dt
   * @public
   */
  step(dt) {
    if (this.isPlayingProperty.get()) {
      this.stepInTime(dt);
    }
  }

  /**
   * Run the appropriate thermostat based on the settings and the state of the simulation.  This serves to either
   * maintain the particle motions in a range that corresponds to a steady temperature or to increase or decrease the
   * particle motion if the user is heating or cooling the substance.
   * @private
   */
  runThermostat() {
    if (this.isExplodedProperty.get()) {
      // Don't bother to run any thermostat if the lid is blown off - just let those little molecules run free!
      return;
    }
    const calculatedTemperature = this.moleculeForceAndMotionCalculator.calculatedTemperature;
    const temperatureSetPoint = this.temperatureSetPointProperty.get();
    let temperatureAdjustmentNeeded = false;
    let thermostatRunThisStep = null;
    if (this.heatingCoolingAmountProperty.get() > 0 && calculatedTemperature < temperatureSetPoint || this.heatingCoolingAmountProperty.get() < 0 && calculatedTemperature > temperatureSetPoint || Math.abs(calculatedTemperature - temperatureSetPoint) > TEMPERATURE_CLOSENESS_RANGE) {
      temperatureAdjustmentNeeded = true;
    }
    if (this.moleculeInjectedThisStep) {
      // A molecule was injected this step.  By design, only one can be injected in a single step, so we use the
      // attributes of the most recently added molecule to figure out how much the temperature set point should be
      // adjusted. No thermostat is run on this step - it will kick in on the next step.
      const numMolecules = this.moleculeDataSet.getNumberOfMolecules();
      const injectedParticleTemperature = 2 / 3 * this.moleculeDataSet.getMoleculeKineticEnergy(numMolecules - 1);
      const newTemperature = temperatureSetPoint * (numMolecules - 1) / numMolecules + injectedParticleTemperature / numMolecules;
      this.setTemperature(newTemperature);
    } else if (this.moleculeForceAndMotionCalculator.lidChangedParticleVelocity) {
      // The velocity of one or more molecules was changed through interaction with the lid.  Since this can change
      // the total kinetic energy of the molecules in the system, no thermostat is run.  Instead, the temperature is
      // determined by looking at the kinetic energy of the molecules, and that value is used to determine the new
      // system temperature set point.  However, sometimes the calculation can return some unexpected results,
      // probably due to some of the energy being tied up in potential rather than kinetic energy, so there are some
      // constraints here. See https://github.com/phetsims/states-of-matter/issues/169 for more information.
      if (this.heightChangeThisStep > 0 && calculatedTemperature < temperatureSetPoint || this.heightChangeThisStep < 0 && calculatedTemperature > temperatureSetPoint) {
        // Set the target temperature to the calculated value adjusted by the average error that has been recorded.
        // This adjustment is necessary because otherwise big, or strange, temperature changes can occur.
        this.setTemperature(calculatedTemperature + this.averageTemperatureDifference.average);
      }

      // Clear the flag for the next time through.
      this.moleculeForceAndMotionCalculator.lidChangedParticleVelocity = false;
    } else if (temperatureAdjustmentNeeded || temperatureSetPoint > LIQUID_TEMPERATURE || temperatureSetPoint < SOLID_TEMPERATURE / 5) {
      // If this is the first run of this thermostat in a while, clear its accumulated biases
      if (this.thermostatRunPreviousStep !== this.isoKineticThermostat) {
        this.isoKineticThermostat.clearAccumulatedBias();
      }

      // Use the isokinetic thermostat.
      this.isoKineticThermostat.adjustTemperature(calculatedTemperature);
      thermostatRunThisStep = this.isoKineticThermostat;
    } else if (!temperatureAdjustmentNeeded) {
      // If this is the first run of this thermostat in a while, clear its accumulated biases
      if (this.thermostatRunPreviousStep !== this.andersenThermostat) {
        this.andersenThermostat.clearAccumulatedBias();
      }

      // The temperature isn't changing and it is within a certain range where the Andersen thermostat works better.
      // This is done for purely visual reasons - it looks better than the isokinetic in these circumstances.
      this.andersenThermostat.adjustTemperature();
      thermostatRunThisStep = this.andersenThermostat;
    }

    // Note that there will be some circumstances in which no thermostat is run.  This is intentional.

    // @private - keep track of which thermostat was run since this is used in some cases to reset thermostat state
    this.thermostatRunPreviousStep = thermostatRunThisStep;

    // Update the average difference between the set point and the calculated temperature, but only if nothing has
    // happened that may have affected the calculated value or the set point.
    if (!temperatureAdjustmentNeeded && !this.moleculeInjectedThisStep && !this.lidChangedParticleVelocity) {
      this.averageTemperatureDifference.addValue(temperatureSetPoint - calculatedTemperature);
    }
  }

  /**
   * Initialize the various model components to handle a simulation in which all the molecules are single atoms.
   * @param {number} substance
   * @param {number} phase
   * @private
   */
  initializeDiatomic(substance, phase) {
    // Verify that a valid molecule ID was provided.
    assert && assert(substance === SubstanceType.DIATOMIC_OXYGEN);

    // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
    // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
    // can fit depends on the size of the individual atom.
    let numberOfAtoms = Math.pow(Utils.roundSymmetric(CONTAINER_WIDTH / (SOMConstants.OXYGEN_RADIUS * 2.1 * 3)), 2);
    if (numberOfAtoms % 2 !== 0) {
      numberOfAtoms--;
    }

    // Create the normalized data set for the one-atom-per-molecule case.
    this.moleculeDataSet = new MoleculeForceAndMotionDataSet(2);

    // Create the strategies that will work on this data set.
    this.phaseStateChanger = new DiatomicPhaseStateChanger(this);
    this.atomPositionUpdater = DiatomicAtomPositionUpdater;
    this.moleculeForceAndMotionCalculator = new DiatomicVerletAlgorithm(this);
    this.isoKineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
    this.andersenThermostat = new AndersenThermostat(this.moleculeDataSet, this.minModelTemperature);
    const numberOfMolecules = numberOfAtoms / 2;
    const atomPositionInVector = new Vector2(0, 0);
    const atomPositions = [];
    atomPositions[0] = atomPositionInVector;
    atomPositions[1] = atomPositionInVector;

    // Create the individual atoms and add them to the data set.
    for (let i = 0; i < numberOfMolecules; i++) {
      // Create the molecule.
      const moleculeCenterOfMassPosition = new Vector2(0, 0);
      const moleculeVelocity = new Vector2(0, 0);

      // Add the atom to the data set.
      this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true);

      // Add atoms to model set.
      this.scaledAtoms.push(new ScaledAtom(AtomType.OXYGEN, 0, 0));
      this.scaledAtoms.push(new ScaledAtom(AtomType.OXYGEN, 0, 0));
    }
    this.targetNumberOfMoleculesProperty.set(this.moleculeDataSet.numberOfMolecules);

    // Initialize the atom positions according the to requested phase.
    this.setPhase(phase);
  }

  /**
   * Initialize the various model components to handle a simulation in which each molecule consists of three atoms,
   * e.g. water.
   * @param {number} substance
   * @param {number} phase
   * @private
   */
  initializeTriatomic(substance, phase) {
    // Only water is supported so far.
    assert && assert(substance === SubstanceType.WATER);

    // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
    // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
    // can fit depends on the size of the individual atom.
    const waterMoleculeDiameter = SOMConstants.OXYGEN_RADIUS * 2.1;
    const moleculesAcrossBottom = Utils.roundSymmetric(CONTAINER_WIDTH / (waterMoleculeDiameter * 1.2));
    const numberOfMolecules = Math.pow(moleculesAcrossBottom / 3, 2);

    // Create the normalized data set for the one-atom-per-molecule case.
    this.moleculeDataSet = new MoleculeForceAndMotionDataSet(3);

    // Create the strategies that will work on this data set.
    this.phaseStateChanger = new WaterPhaseStateChanger(this);
    this.atomPositionUpdater = WaterAtomPositionUpdater;
    this.moleculeForceAndMotionCalculator = new WaterVerletAlgorithm(this);
    this.isoKineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
    this.andersenThermostat = new AndersenThermostat(this.moleculeDataSet, this.minModelTemperature);

    // Create the individual atoms and add them to the data set.
    const atomPositionInVector = new Vector2(0, 0);
    const atomPositions = [];
    atomPositions[0] = atomPositionInVector;
    atomPositions[1] = atomPositionInVector;
    atomPositions[2] = atomPositionInVector;
    for (let i = 0; i < numberOfMolecules; i++) {
      // Create the molecule.
      const moleculeCenterOfMassPosition = new Vector2(0, 0);
      const moleculeVelocity = new Vector2(0, 0);

      // Add the atom to the data set.
      this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true);

      // Add atoms to model set.
      this.scaledAtoms.push(new ScaledAtom(AtomType.OXYGEN, 0, 0));
      this.scaledAtoms.push(new HydrogenAtom(0, 0, true));

      // In order to look more varied, some of the hydrogen atoms are set up to render behind the oxygen atom and
      // some to render in front of it.
      this.scaledAtoms.push(new HydrogenAtom(0, 0, i % 2 === 0));
    }
    this.targetNumberOfMoleculesProperty.set(this.moleculeDataSet.numberOfMolecules);

    // Initialize the atom positions according the to requested phase.
    this.setPhase(phase);
  }

  /**
   * Initialize the various model components to handle a simulation in which all the molecules are single atoms.
   * @param {SubstanceType} substance
   * @param {number} phase
   * @private
   */
  initializeMonatomic(substance, phase) {
    // Verify that a valid molecule ID was provided.
    assert && assert(substance === SubstanceType.ADJUSTABLE_ATOM || substance === SubstanceType.NEON || substance === SubstanceType.ARGON);

    // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
    // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
    // can fit depends on the size of the individual.
    let particleDiameter;
    if (substance === SubstanceType.NEON) {
      particleDiameter = SOMConstants.NEON_RADIUS * 2;
    } else if (substance === SubstanceType.ARGON) {
      particleDiameter = SOMConstants.ARGON_RADIUS * 2;
    } else if (substance === SubstanceType.ADJUSTABLE_ATOM) {
      particleDiameter = SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2;
    } else {
      // Force it to neon.
      substance = SubstanceType.NEON;
      particleDiameter = SOMConstants.NEON_RADIUS * 2;
    }

    // Initialize the number of atoms assuming that the solid form, when made into a square, will consume about 1/3
    // the width of the container.
    const numberOfAtoms = Math.pow(Utils.roundSymmetric(CONTAINER_WIDTH / (particleDiameter * 1.05 * 3)), 2);

    // Create the normalized data set for the one-atom-per-molecule case.
    this.moleculeDataSet = new MoleculeForceAndMotionDataSet(1);

    // Create the strategies that will work on this data set.
    this.phaseStateChanger = new MonatomicPhaseStateChanger(this);
    this.atomPositionUpdater = MonatomicAtomPositionUpdater;
    this.moleculeForceAndMotionCalculator = new MonatomicVerletAlgorithm(this);
    this.isoKineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
    this.andersenThermostat = new AndersenThermostat(this.moleculeDataSet, this.minModelTemperature);

    // Create the individual atoms and add them to the data set.
    const atomPositions = [];
    atomPositions.push(new Vector2(0, 0));
    for (let i = 0; i < numberOfAtoms; i++) {
      // Create the atom.
      const moleculeCenterOfMassPosition = new Vector2(0, 0);
      const moleculeVelocity = new Vector2(0, 0);
      // Add the atom to the data set.
      this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true);

      // Add atom to model set.
      let atom;
      if (substance === SubstanceType.NEON) {
        atom = new ScaledAtom(AtomType.NEON, 0, 0);
      } else if (substance === SubstanceType.ARGON) {
        atom = new ScaledAtom(AtomType.ARGON, 0, 0);
      } else if (substance === SubstanceType.ADJUSTABLE_ATOM) {
        atom = new ScaledAtom(AtomType.ADJUSTABLE, 0, 0);
      } else {
        atom = new ScaledAtom(AtomType.NEON, 0, 0);
      }
      this.scaledAtoms.push(atom);
    }
    this.targetNumberOfMoleculesProperty.set(this.moleculeDataSet.numberOfMolecules);

    // Initialize the atom positions according the to requested phase.
    this.setPhase(phase);
  }

  /**
   * Set the positions of the non-normalized molecules based on the positions of the normalized ones.
   * @private
   */
  syncAtomPositions() {
    assert && assert(this.moleculeDataSet.numberOfAtoms === this.scaledAtoms.length, `Inconsistent number of normalized versus non-normalized atoms, ${this.moleculeDataSet.numberOfAtoms}, ${this.scaledAtoms.length}`);
    const positionMultiplier = this.particleDiameter;
    const atomPositions = this.moleculeDataSet.atomPositions;

    // use a C-style loop for optimal performance
    for (let i = 0; i < this.scaledAtoms.length; i++) {
      this.scaledAtoms.get(i).setPosition(atomPositions[i].x * positionMultiplier, atomPositions[i].y * positionMultiplier);
    }
  }

  /**
   * Take the internal pressure value and convert it to atmospheres.  In the original Java version of this sim the
   * conversion multiplier was dependent upon the type of molecule in order to be somewhat realistic.  However, this
   * was problematic, since it would cause the container to explode at different pressure readings.  A single
   * multiplier is now used, which is perhaps less realistic, but works better in practice.  Please see
   * https://github.com/phetsims/states-of-matter/issues/124 for more information.
   * @returns {number}
   * @public
   */
  getPressureInAtmospheres() {
    return 5 * this.getModelPressure(); // multiplier empirically determined
  }

  /**
   * Return a phase value based on the current temperature.
   * @return{number}
   * @private
   */
  mapTemperatureToPhase() {
    let phase;
    if (this.temperatureSetPointProperty.get() < SOLID_TEMPERATURE + (LIQUID_TEMPERATURE - SOLID_TEMPERATURE) / 2) {
      phase = PhaseStateEnum.SOLID;
    } else if (this.temperatureSetPointProperty.get() < LIQUID_TEMPERATURE + (GAS_TEMPERATURE - LIQUID_TEMPERATURE) / 2) {
      phase = PhaseStateEnum.LIQUID;
    } else {
      phase = PhaseStateEnum.GAS;
    }
    return phase;
  }

  /**
   * This method is used for an external entity to notify the model that it should explode.
   * @param {boolean} isExploded
   * @public
   */
  setContainerExploded(isExploded) {
    if (this.isExplodedProperty.get() !== isExploded) {
      this.isExplodedProperty.set(isExploded);
      if (!isExploded) {
        this.containerHeightProperty.reset();
      }
    }
  }

  /**
   * Return the lid to the container.  It only makes sense to call this after the container has exploded, otherwise it
   * has no effect.
   * @public
   */
  returnLid() {
    // state checking
    assert && assert(this.isExplodedProperty.get(), 'attempt to return lid when container hadn\'t exploded');
    if (!this.isExplodedProperty.get()) {
      // ignore request if container hasn't exploded
      return;
    }

    // Remove any molecules that are outside of the container.  We work with the normalized molecules/atoms for this.
    let numMoleculesOutsideContainer = 0;
    let firstOutsideMoleculeIndex;
    do {
      for (firstOutsideMoleculeIndex = 0; firstOutsideMoleculeIndex < this.moleculeDataSet.getNumberOfMolecules(); firstOutsideMoleculeIndex++) {
        const pos = this.moleculeDataSet.getMoleculeCenterOfMassPositions()[firstOutsideMoleculeIndex];
        if (pos.x < 0 || pos.x > this.normalizedContainerWidth || pos.y < 0 || pos.y > CONTAINER_INITIAL_HEIGHT / this.particleDiameter) {
          // This molecule is outside of the container.
          break;
        }
      }
      if (firstOutsideMoleculeIndex < this.moleculeDataSet.getNumberOfMolecules()) {
        // Remove the molecule that was found.
        this.moleculeDataSet.removeMolecule(firstOutsideMoleculeIndex);
        numMoleculesOutsideContainer++;
      }
    } while (firstOutsideMoleculeIndex !== this.moleculeDataSet.getNumberOfMolecules());

    // Remove enough of the non-normalized molecules so that we have the same number as the normalized.  They don't
    // have to be the same atoms since the normalized and non-normalized atoms are explicitly synced up during each
    // model step.
    for (let i = 0; i < numMoleculesOutsideContainer * this.moleculeDataSet.getAtomsPerMolecule(); i++) {
      this.scaledAtoms.pop();
    }

    // Set the container to be unexploded.
    this.setContainerExploded(false);

    // Set the phase to be gas, since otherwise the extremely high kinetic energy of the molecules causes an
    // unreasonably high temperature for the molecules that remain in the container. Doing this generally cools them
    // down into a more manageable state.
    if (numMoleculesOutsideContainer > 0 && this.moleculeForceAndMotionCalculator.calculatedTemperature > GAS_TEMPERATURE) {
      this.phaseStateChanger.setPhase(PhaseStateEnum.GAS);
    }

    // Sync up the property that tracks the number of molecules - mostly for the purposes of injecting new molecules -
    // with the new value.
    this.targetNumberOfMoleculesProperty.set(this.moleculeDataSet.numberOfMolecules);
  }

  /**
   * serialize this instance for phet-io
   * @returns {Object}
   * @public - for phet-io support only
   */
  toStateObject() {
    return {
      _substance: EnumerationIO(SubstanceType).toStateObject(this.substanceProperty.value),
      _isExploded: this.isExplodedProperty.value,
      _containerHeight: this.containerHeightProperty.value,
      _gravitationalAcceleration: this.gravitationalAcceleration,
      _normalizedLidVelocityY: this.normalizedLidVelocityY,
      _heatingCoolingAmount: this.heatingCoolingAmountProperty.value,
      _moleculeDataSet: MoleculeForceAndMotionDataSet.MoleculeForceAndMotionDataSetIO.toStateObject(this.moleculeDataSet),
      _isoKineticThermostatState: this.isoKineticThermostat.toStateObject(),
      _andersenThermostatState: this.andersenThermostat.toStateObject(),
      _moleculeForcesAndMotionCalculatorPressure: this.moleculeForceAndMotionCalculator.pressureProperty.value
    };
  }

  /**
   * Set the state of this instance for phet-io
   * @param {Object} stateObject
   * @public
   * @override
   */
  applyState(stateObject) {
    required(stateObject);

    // Setting the substance initializes a bunch of model parameters, so this is done first, then other items that may
    // have been affected are set.
    this.substanceProperty.set(EnumerationIO(SubstanceType).fromStateObject(stateObject._substance));

    // Set properties that may have been updated by setting the substance.
    this.isExplodedProperty.set(stateObject._isExploded);
    this.containerHeightProperty.set(stateObject._containerHeight);
    this.heatingCoolingAmountProperty.set(stateObject._heatingCoolingAmount);
    this.gravitationalAcceleration = stateObject._gravitationalAcceleration;
    this.normalizedLidVelocityY = stateObject._normalizedLidVelocityY;
    this.isoKineticThermostat.setState(stateObject._isoKineticThermostatState);
    this.andersenThermostat.setState(stateObject._andersenThermostatState);

    // Set the molecule data set.  This includes all the positions, velocities, etc. for the particles.
    this.moleculeDataSet.setState(stateObject._moleculeDataSet);

    // Preset the pressure in the accumulator that tracks it so that it doesn't have to start from zero.
    this.moleculeForceAndMotionCalculator.presetPressure(stateObject._moleculeForcesAndMotionCalculatorPressure);

    // Make sure that we have the right number of scaled (i.e. non-normalized) atoms.
    const numberOfNormalizedMolecules = this.moleculeDataSet.numberOfMolecules;
    const numberOfNonNormalizedMolecules = this.scaledAtoms.length / this.moleculeDataSet.atomsPerMolecule;
    if (numberOfNormalizedMolecules > numberOfNonNormalizedMolecules) {
      this.addAtomsForCurrentSubstance(numberOfNormalizedMolecules - numberOfNonNormalizedMolecules);
    } else if (numberOfNonNormalizedMolecules > numberOfNormalizedMolecules) {
      _.times((numberOfNonNormalizedMolecules - numberOfNormalizedMolecules) * this.moleculeDataSet.atomsPerMolecule, () => {
        this.scaledAtoms.pop();
      });
    }

    // Clear the injection counter - all atoms and molecules should be accounted for at this point.
    this.numMoleculesQueuedForInjectionProperty.reset();

    // Synchronize the positions of the scaled atoms to the normalized data set.
    this.syncAtomPositions();
  }
}

// static constants
MultipleParticleModel.PARTICLE_CONTAINER_WIDTH = CONTAINER_WIDTH;
MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT = CONTAINER_INITIAL_HEIGHT;
MultipleParticleModel.MAX_CONTAINER_EXPAND_RATE = MAX_CONTAINER_EXPAND_RATE;
MultipleParticleModel.MultipleParticleModelIO = new IOType('MultipleParticleModelIO', {
  valueType: MultipleParticleModel,
  documentation: 'multiple particle model that simulates interactions that lead to phase-like behavior',
  toStateObject: multipleParticleModel => multipleParticleModel.toStateObject(),
  applyState: (multipleParticleModel, state) => multipleParticleModel.applyState(state),
  stateSchema: {
    _substance: EnumerationIO(SubstanceType),
    _isExploded: BooleanIO,
    _containerHeight: NumberIO,
    _gravitationalAcceleration: NumberIO,
    _normalizedLidVelocityY: NumberIO,
    _heatingCoolingAmount: NumberIO,
    _moleculeDataSet: MoleculeForceAndMotionDataSet.MoleculeForceAndMotionDataSetIO,
    _isoKineticThermostatState: IsokineticThermostat.IsoKineticThermostatIO,
    _andersenThermostatState: AndersenThermostat.AndersenThermostatIO,
    _moleculeForcesAndMotionCalculatorPressure: NumberIO
  }
});
statesOfMatter.register('MultipleParticleModel', MultipleParticleModel);
export default MultipleParticleModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJyZXF1aXJlZCIsIlBoZXRpb09iamVjdCIsIkJvb2xlYW5JTyIsIkVudW1lcmF0aW9uSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJzdGF0ZXNPZk1hdHRlciIsIlBoYXNlU3RhdGVFbnVtIiwiU09NQ29uc3RhbnRzIiwiU3Vic3RhbmNlVHlwZSIsIkF0b21UeXBlIiwiRGlhdG9taWNBdG9tUG9zaXRpb25VcGRhdGVyIiwiRGlhdG9taWNQaGFzZVN0YXRlQ2hhbmdlciIsIkRpYXRvbWljVmVybGV0QWxnb3JpdGhtIiwiQW5kZXJzZW5UaGVybW9zdGF0IiwiSXNva2luZXRpY1RoZXJtb3N0YXQiLCJNb25hdG9taWNBdG9tUG9zaXRpb25VcGRhdGVyIiwiTW9uYXRvbWljUGhhc2VTdGF0ZUNoYW5nZXIiLCJNb25hdG9taWNWZXJsZXRBbGdvcml0aG0iLCJXYXRlckF0b21Qb3NpdGlvblVwZGF0ZXIiLCJXYXRlclBoYXNlU3RhdGVDaGFuZ2VyIiwiV2F0ZXJWZXJsZXRBbGdvcml0aG0iLCJNb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldCIsIk1vdmluZ0F2ZXJhZ2UiLCJIeWRyb2dlbkF0b20iLCJTY2FsZWRBdG9tIiwiQ09OVEFJTkVSX1dJRFRIIiwiQ09OVEFJTkVSX0lOSVRJQUxfSEVJR0hUIiwiREVGQVVMVF9TVUJTVEFOQ0UiLCJORU9OIiwiTUFYX1RFTVBFUkFUVVJFIiwiTUlOX1RFTVBFUkFUVVJFIiwiTk9NSU5BTF9HUkFWSVRBVElPTkFMX0FDQ0VMIiwiVEVNUEVSQVRVUkVfQ0hBTkdFX1JBVEUiLCJJTkpFQ1RFRF9NT0xFQ1VMRV9TUEVFRCIsIklOSkVDVEVEX01PTEVDVUxFX0FOR0xFX1NQUkVBRCIsIk1hdGgiLCJQSSIsIklOSkVDVElPTl9QT0lOVF9IT1JJWl9QUk9QT1JUSU9OIiwiSU5KRUNUSU9OX1BPSU5UX1ZFUlRfUFJPUE9SVElPTiIsIlBBUlRJQ0xFX1NQRUVEX1VQX0ZBQ1RPUiIsIk1BWF9QQVJUSUNMRV9NT1RJT05fVElNRV9TVEVQIiwiU09MSURfVEVNUEVSQVRVUkUiLCJMSVFVSURfVEVNUEVSQVRVUkUiLCJHQVNfVEVNUEVSQVRVUkUiLCJJTklUSUFMX1RFTVBFUkFUVVJFIiwiQVBQUk9BQ0hJTkdfQUJTT0xVVEVfWkVST19URU1QRVJBVFVSRSIsIk1BWF9DT05UQUlORVJfRVhQQU5EX1JBVEUiLCJQT1NUX0VYUExPU0lPTl9DT05UQUlORVJfRVhQQU5TSU9OX1JBVEUiLCJURU1QRVJBVFVSRV9DTE9TRU5FU1NfUkFOR0UiLCJORU9OX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU4iLCJORU9OX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTiIsIkFSR09OX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU4iLCJBUkdPTl9DUklUSUNBTF9QT0lOVF9JTl9LRUxWSU4iLCJPMl9UUklQTEVfUE9JTlRfSU5fS0VMVklOIiwiTzJfQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOIiwiV0FURVJfVFJJUExFX1BPSU5UX0lOX0tFTFZJTiIsIldBVEVSX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTiIsIkFESlVTVEFCTEVfQVRPTV9UUklQTEVfUE9JTlRfSU5fS0VMVklOIiwiQURKVVNUQUJMRV9BVE9NX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTiIsIk1PTEVDVUxFX0lOSkVDVElPTl9IT0xET0ZGX1RJTUUiLCJNQVhfTU9MRUNVTEVTX1FVRVVFRF9GT1JfSU5KRUNUSU9OIiwiTXVsdGlwbGVQYXJ0aWNsZU1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwidmFsaWRTdWJzdGFuY2VzIiwiVkFMVUVTIiwicGhldGlvVHlwZSIsIk11bHRpcGxlUGFydGljbGVNb2RlbElPIiwic3Vic3RhbmNlUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1N0YXRlIiwiY29udGFpbmVySGVpZ2h0UHJvcGVydHkiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ1bml0cyIsImlzRXhwbG9kZWRQcm9wZXJ0eSIsInRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eSIsInByZXNzdXJlUHJvcGVydHkiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsImhlYXRpbmdDb29saW5nQW1vdW50UHJvcGVydHkiLCJyYW5nZSIsInRhcmdldE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHkiLCJtYXhOdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5IiwiTUFYX05VTV9BVE9NUyIsIm51bU1vbGVjdWxlc1F1ZXVlZEZvckluamVjdGlvblByb3BlcnR5IiwiaXNJbmplY3Rpb25BbGxvd2VkUHJvcGVydHkiLCJpc1BsYXlpbmciLCJudW1iZXJPZk1vbGVjdWxlc1F1ZXVlZEZvckluamVjdGlvbiIsImlzRXhwbG9kZWQiLCJ0YXJnZXROdW1iZXJPZk1vbGVjdWxlcyIsInJlc2V0RW1pdHRlciIsInNjYWxlZEF0b21zIiwibW9sZWN1bGVEYXRhU2V0Iiwibm9ybWFsaXplZENvbnRhaW5lcldpZHRoIiwicGFydGljbGVEaWFtZXRlciIsImdyYXZpdGF0aW9uYWxBY2NlbGVyYXRpb24iLCJub3JtYWxpemVkQ29udGFpbmVySGVpZ2h0IiwiZ2V0Iiwibm9ybWFsaXplZFRvdGFsQ29udGFpbmVySGVpZ2h0Iiwibm9ybWFsaXplZExpZFZlbG9jaXR5WSIsImluamVjdGlvblBvaW50IiwiWkVSTyIsImNvcHkiLCJtaW5Nb2RlbFRlbXBlcmF0dXJlIiwicmVzaWR1YWxUaW1lIiwibW9sZWN1bGVJbmplY3Rpb25Ib2xkb2ZmVGltZXIiLCJoZWlnaHRDaGFuZ2VUaGlzU3RlcCIsIm1vbGVjdWxlSW5qZWN0ZWRUaGlzU3RlcCIsImF0b21Qb3NpdGlvblVwZGF0ZXIiLCJwaGFzZVN0YXRlQ2hhbmdlciIsImlzb0tpbmV0aWNUaGVybW9zdGF0IiwiYW5kZXJzZW5UaGVybW9zdGF0IiwibW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IiLCJhdmVyYWdlVGVtcGVyYXR1cmVEaWZmZXJlbmNlIiwibGluayIsInN1YnN0YW5jZSIsImhhbmRsZVN1YnN0YW5jZUNoYW5nZWQiLCJ1cGRhdGVOb3JtYWxpemVkQ29udGFpbmVyRGltZW5zaW9ucyIsImJpbmQiLCJsYXp5TGluayIsImFzc2VydCIsInZhbHVlIiwiY3VycmVudE51bWJlck9mTW9sZWN1bGVzIiwiZmxvb3IiLCJudW1iZXJPZkF0b21zIiwiYXRvbXNQZXJNb2xlY3VsZSIsIm51bWJlck9mTW9sZWN1bGVzVG9BZGQiLCJpIiwicXVldWVNb2xlY3VsZUZvckluamVjdGlvbiIsInRlbXBlcmF0dXJlSW5LZWx2aW5Qcm9wZXJ0eSIsImdldFRlbXBlcmF0dXJlSW5LZWx2aW4iLCJwaGV0aW9WYWx1ZVR5cGUiLCJwaGV0UmVhZE9ubHkiLCJzZXRUZW1wZXJhdHVyZSIsIm5ld1RlbXBlcmF0dXJlIiwic2V0IiwidGFyZ2V0VGVtcGVyYXR1cmUiLCJsZW5ndGgiLCJ0ZW1wZXJhdHVyZUluS2VsdmluIiwidHJpcGxlUG9pbnRJbktlbHZpbiIsImNyaXRpY2FsUG9pbnRJbktlbHZpbiIsInRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzIiwiY3JpdGljYWxQb2ludEluTW9kZWxVbml0cyIsIlRSSVBMRV9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkUiLCJDUklUSUNBTF9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkUiLCJBUkdPTiIsIkFESlVTVEFCTEVfQVRPTSIsIldBVEVSIiwiVFJJUExFX1BPSU5UX1dBVEVSX01PREVMX1RFTVBFUkFUVVJFIiwiQ1JJVElDQUxfUE9JTlRfV0FURVJfTU9ERUxfVEVNUEVSQVRVUkUiLCJESUFUT01JQ19PWFlHRU4iLCJUUklQTEVfUE9JTlRfRElBVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkUiLCJDUklUSUNBTF9QT0lOVF9ESUFUT01JQ19NT0RFTF9URU1QRVJBVFVSRSIsIkVycm9yIiwic2xvcGUiLCJvZmZzZXQiLCJnZXRNb2RlbFByZXNzdXJlIiwicGhhc2UiLCJtYXBUZW1wZXJhdHVyZVRvUGhhc2UiLCJyZW1vdmVBbGxBdG9tcyIsImluaXRpYWxpemVNb2RlbFBhcmFtZXRlcnMiLCJPWFlHRU5fUkFESVVTIiwiTkVPTl9SQURJVVMiLCJBUkdPTl9SQURJVVMiLCJBREpVU1RBQkxFX0FUVFJBQ1RJT05fREVGQVVMVF9SQURJVVMiLCJyZXNldCIsInNldFhZIiwiaW5pdGlhbGl6ZUF0b21zIiwidXBkYXRlUHJlc3N1cmUiLCJnZXRQcmVzc3VyZUluQXRtb3NwaGVyZXMiLCJzdWJzdGFuY2VBdFN0YXJ0T2ZSZXNldCIsImNsZWFyQWNjdW11bGF0ZWRCaWFzIiwiU09MSUQiLCJlbWl0Iiwic2V0UGhhc2UiLCJwaGFzZVNhdGUiLCJMSVFVSUQiLCJHQVMiLCJzeW5jQXRvbVBvc2l0aW9ucyIsInNldEhlYXRpbmdDb29saW5nQW1vdW50Iiwibm9ybWFsaXplZEhlYXRpbmdDb29saW5nQW1vdW50IiwiaW5qZWN0TW9sZWN1bGUiLCJnZXROdW1iZXJPZlJlbWFpbmluZ1Nsb3RzIiwiaW5qZWN0aW9uQW5nbGUiLCJuZXh0RG91YmxlIiwieFZlbCIsImNvcyIsInlWZWwiLCJzaW4iLCJtb2xlY3VsZVJvdGF0aW9uUmF0ZSIsIm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb24iLCJtb2xlY3VsZVZlbG9jaXR5IiwiYXRvbVBvc2l0aW9ucyIsImFkZE1vbGVjdWxlIiwibW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyIsImdldE51bWJlck9mTW9sZWN1bGVzIiwidXBkYXRlQXRvbVBvc2l0aW9ucyIsImFkZEF0b21zRm9yQ3VycmVudFN1YnN0YW5jZSIsIm51bU1vbGVjdWxlcyIsIl8iLCJ0aW1lcyIsInB1c2giLCJBREpVU1RBQkxFIiwiT1hZR0VOIiwiY2xlYXIiLCJpbml0aWFsaXplRGlhdG9taWMiLCJpbml0aWFsaXplTW9uYXRvbWljIiwiaW5pdGlhbGl6ZVRyaWF0b21pYyIsImRhbXBVcHdhcmRNb3Rpb24iLCJkdCIsIm1vbGVjdWxlVmVsb2NpdGllcyIsInkiLCJub25Ob3JtYWxpemVkQ29udGFpbmVySGVpZ2h0IiwibWluIiwic3RlcEluVGltZSIsInVwZGF0ZUNvbnRhaW5lclNpemUiLCJwcmVzc3VyZUJlZm9yZUFsZ29yaXRobSIsInBhcnRpY2xlTW90aW9uQWR2YW5jZW1lbnRUaW1lIiwibnVtUGFydGljbGVFbmdpbmVTdGVwcyIsInBhcnRpY2xlTW90aW9uVGltZVN0ZXAiLCJtYXgiLCJ1cGRhdGVGb3JjZXNBbmRNb3Rpb24iLCJydW5UaGVybW9zdGF0IiwiY3VycmVudFRlbXBlcmF0dXJlIiwiYWRqdXN0bWVudEZhY3RvciIsInBvdyIsInRlbXBlcmF0dXJlQ2hhbmdlIiwic3RlcCIsImNhbGN1bGF0ZWRUZW1wZXJhdHVyZSIsInRlbXBlcmF0dXJlU2V0UG9pbnQiLCJ0ZW1wZXJhdHVyZUFkanVzdG1lbnROZWVkZWQiLCJ0aGVybW9zdGF0UnVuVGhpc1N0ZXAiLCJhYnMiLCJpbmplY3RlZFBhcnRpY2xlVGVtcGVyYXR1cmUiLCJnZXRNb2xlY3VsZUtpbmV0aWNFbmVyZ3kiLCJsaWRDaGFuZ2VkUGFydGljbGVWZWxvY2l0eSIsImF2ZXJhZ2UiLCJ0aGVybW9zdGF0UnVuUHJldmlvdXNTdGVwIiwiYWRqdXN0VGVtcGVyYXR1cmUiLCJhZGRWYWx1ZSIsInJvdW5kU3ltbWV0cmljIiwibnVtYmVyT2ZNb2xlY3VsZXMiLCJhdG9tUG9zaXRpb25JblZlY3RvciIsIndhdGVyTW9sZWN1bGVEaWFtZXRlciIsIm1vbGVjdWxlc0Fjcm9zc0JvdHRvbSIsImF0b20iLCJwb3NpdGlvbk11bHRpcGxpZXIiLCJzZXRQb3NpdGlvbiIsIngiLCJzZXRDb250YWluZXJFeHBsb2RlZCIsInJldHVybkxpZCIsIm51bU1vbGVjdWxlc091dHNpZGVDb250YWluZXIiLCJmaXJzdE91dHNpZGVNb2xlY3VsZUluZGV4IiwicG9zIiwiZ2V0TW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnMiLCJyZW1vdmVNb2xlY3VsZSIsImdldEF0b21zUGVyTW9sZWN1bGUiLCJwb3AiLCJ0b1N0YXRlT2JqZWN0IiwiX3N1YnN0YW5jZSIsIl9pc0V4cGxvZGVkIiwiX2NvbnRhaW5lckhlaWdodCIsIl9ncmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uIiwiX25vcm1hbGl6ZWRMaWRWZWxvY2l0eVkiLCJfaGVhdGluZ0Nvb2xpbmdBbW91bnQiLCJfbW9sZWN1bGVEYXRhU2V0IiwiTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXRJTyIsIl9pc29LaW5ldGljVGhlcm1vc3RhdFN0YXRlIiwiX2FuZGVyc2VuVGhlcm1vc3RhdFN0YXRlIiwiX21vbGVjdWxlRm9yY2VzQW5kTW90aW9uQ2FsY3VsYXRvclByZXNzdXJlIiwiYXBwbHlTdGF0ZSIsInN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0Iiwic2V0U3RhdGUiLCJwcmVzZXRQcmVzc3VyZSIsIm51bWJlck9mTm9ybWFsaXplZE1vbGVjdWxlcyIsIm51bWJlck9mTm9uTm9ybWFsaXplZE1vbGVjdWxlcyIsIlBBUlRJQ0xFX0NPTlRBSU5FUl9XSURUSCIsIlBBUlRJQ0xFX0NPTlRBSU5FUl9JTklUSUFMX0hFSUdIVCIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJtdWx0aXBsZVBhcnRpY2xlTW9kZWwiLCJzdGF0ZSIsInN0YXRlU2NoZW1hIiwiSXNvS2luZXRpY1RoZXJtb3N0YXRJTyIsIkFuZGVyc2VuVGhlcm1vc3RhdElPIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNdWx0aXBsZVBhcnRpY2xlTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpcyB0aGUgbWFpbiBjbGFzcyBmb3IgdGhlIG1vZGVsIHBvcnRpb24gb2YgdGhlIGZpcnN0IHR3byBzY3JlZW5zIG9mIHRoZSBcIlN0YXRlcyBvZiBNYXR0ZXJcIiBzaW11bGF0aW9uLiAgSXRzXHJcbiAqIHByaW1hcnkgcHVycG9zZSBpcyB0byBzaW11bGF0ZSBhIHNldCBvZiBtb2xlY3VsZXMgdGhhdCBhcmUgaW50ZXJhY3Rpbmcgd2l0aCBvbmUgYW5vdGhlciBiYXNlZCBvbiB0aGUgYXR0cmFjdGlvbiBhbmRcclxuICogcmVwdWxzaW9uIHRoYXQgaXMgZGVzY3JpYmVkIGJ5IHRoZSBMZW5uYXJkLUpvbmVzIHBvdGVudGlhbCBlcXVhdGlvbi5cclxuICpcclxuICogRWFjaCBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIG1haW50YWlucyBhIHNldCBvZiBkYXRhIHRoYXQgcmVwcmVzZW50cyBhIG5vcm1hbGl6ZWQgbW9kZWwgaW4gd2hpY2ggYWxsIGF0b21zIHRoYXRcclxuICogY29tcHJpc2UgZWFjaCBtb2xlY3VsZSAtIGFuZCBvZnRlbiBpdCBpcyBqdXN0IG9uZSBhdG9tIHBlciBtb2xlY3VsZSAtIGFyZSBhc3N1bWVkIHRvIGhhdmUgYSBkaWFtZXRlciBvZiAxLCBzaW5jZSB0aGlzXHJcbiAqIGFsbG93cyBmb3IgdmVyeSBxdWljayBjYWxjdWxhdGlvbnMsIGFuZCBhbHNvIGEgc2V0IG9mIGRhdGEgZm9yIGF0b21zIHRoYXQgaGF2ZSB0aGUgYWN0dWFsIGRpYW1ldGVyIG9mIHRoZSBhdG9tcyBiZWluZ1xyXG4gKiBzaW11bGF0ZWQgKGUuZy4gQXJnb24pLiBUaHJvdWdob3V0IHRoZSBjb21tZW50cyBhbmQgaW4gdGhlIHZhcmlhYmxlIG5hbWluZyB0aGUgdGVybXMgXCJub3JtYWxpemVkIGRhdGEgc2V0XCIgKG9yXHJcbiAqIHNvbWV0aW1lcyBzaW1wbHkgXCJub3JtYWxpemVkIHNldFwiKSBhbmQgXCJtb2RlbCBkYXRhIHNldFwiIGFyZSB1c2VkIGZvciB0aGlzIGRhdGUsIHJlc3BlY3RpdmVseS4gIFdoZW4gdGhlIHNpbXVsYXRpb24gaXNcclxuICogcnVubmluZywgdGhlIG5vcm1hbGl6ZWQgZGF0YSBzZXQgaXMgdXBkYXRlZCBmaXJzdCwgc2luY2UgdGhhdCBpcyB3aGVyZSB0aGUgaGFyZGNvcmUgY2FsY3VsYXRpb25zIGFyZSBwZXJmb3JtZWQsIGFuZFxyXG4gKiB0aGVuIHRoZSBtb2RlbCBkYXRhIHNldCBpcyBzeW5jaHJvbml6ZWQgd2l0aCB0aGUgbm9ybWFsaXplZCBkYXRhLiAgSXQgaXMgdGhlIG1vZGVsIGRhdGEgc2V0IHRoYXQgaXMgbW9uaXRvcmVkIGJ5IHRoZVxyXG4gKiB2aWV3IGNvbXBvbmVudHMgdGhhdCBhY3R1YWxseSBkaXNwbGF5IHRoZSBtb2xlY3VsZSBwb3NpdGlvbnMgdG8gdGhlIHVzZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYXJvbiBEYXZpc1xyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHJlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9yZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9FbnVtZXJhdGlvbklPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuaW1wb3J0IFBoYXNlU3RhdGVFbnVtIGZyb20gJy4uL1BoYXNlU3RhdGVFbnVtLmpzJztcclxuaW1wb3J0IFNPTUNvbnN0YW50cyBmcm9tICcuLi9TT01Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgU3Vic3RhbmNlVHlwZSBmcm9tICcuLi9TdWJzdGFuY2VUeXBlLmpzJztcclxuaW1wb3J0IEF0b21UeXBlIGZyb20gJy4vQXRvbVR5cGUuanMnO1xyXG5pbXBvcnQgRGlhdG9taWNBdG9tUG9zaXRpb25VcGRhdGVyIGZyb20gJy4vZW5naW5lL0RpYXRvbWljQXRvbVBvc2l0aW9uVXBkYXRlci5qcyc7XHJcbmltcG9ydCBEaWF0b21pY1BoYXNlU3RhdGVDaGFuZ2VyIGZyb20gJy4vZW5naW5lL0RpYXRvbWljUGhhc2VTdGF0ZUNoYW5nZXIuanMnO1xyXG5pbXBvcnQgRGlhdG9taWNWZXJsZXRBbGdvcml0aG0gZnJvbSAnLi9lbmdpbmUvRGlhdG9taWNWZXJsZXRBbGdvcml0aG0uanMnO1xyXG5pbXBvcnQgQW5kZXJzZW5UaGVybW9zdGF0IGZyb20gJy4vZW5naW5lL2tpbmV0aWMvQW5kZXJzZW5UaGVybW9zdGF0LmpzJztcclxuaW1wb3J0IElzb2tpbmV0aWNUaGVybW9zdGF0IGZyb20gJy4vZW5naW5lL2tpbmV0aWMvSXNva2luZXRpY1RoZXJtb3N0YXQuanMnO1xyXG5pbXBvcnQgTW9uYXRvbWljQXRvbVBvc2l0aW9uVXBkYXRlciBmcm9tICcuL2VuZ2luZS9Nb25hdG9taWNBdG9tUG9zaXRpb25VcGRhdGVyLmpzJztcclxuaW1wb3J0IE1vbmF0b21pY1BoYXNlU3RhdGVDaGFuZ2VyIGZyb20gJy4vZW5naW5lL01vbmF0b21pY1BoYXNlU3RhdGVDaGFuZ2VyLmpzJztcclxuaW1wb3J0IE1vbmF0b21pY1ZlcmxldEFsZ29yaXRobSBmcm9tICcuL2VuZ2luZS9Nb25hdG9taWNWZXJsZXRBbGdvcml0aG0uanMnO1xyXG5pbXBvcnQgV2F0ZXJBdG9tUG9zaXRpb25VcGRhdGVyIGZyb20gJy4vZW5naW5lL1dhdGVyQXRvbVBvc2l0aW9uVXBkYXRlci5qcyc7XHJcbmltcG9ydCBXYXRlclBoYXNlU3RhdGVDaGFuZ2VyIGZyb20gJy4vZW5naW5lL1dhdGVyUGhhc2VTdGF0ZUNoYW5nZXIuanMnO1xyXG5pbXBvcnQgV2F0ZXJWZXJsZXRBbGdvcml0aG0gZnJvbSAnLi9lbmdpbmUvV2F0ZXJWZXJsZXRBbGdvcml0aG0uanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQgZnJvbSAnLi9Nb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldC5qcyc7XHJcbmltcG9ydCBNb3ZpbmdBdmVyYWdlIGZyb20gJy4vTW92aW5nQXZlcmFnZS5qcyc7XHJcbmltcG9ydCBIeWRyb2dlbkF0b20gZnJvbSAnLi9wYXJ0aWNsZS9IeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgU2NhbGVkQXRvbSBmcm9tICcuL3BhcnRpY2xlL1NjYWxlZEF0b20uanMnO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gY29uc3RhbnRzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vLyBnZW5lcmFsIGNvbnN0YW50c1xyXG5jb25zdCBDT05UQUlORVJfV0lEVEggPSAxMDAwMDsgLy8gaW4gcGljb21ldGVyc1xyXG5jb25zdCBDT05UQUlORVJfSU5JVElBTF9IRUlHSFQgPSAxMDAwMDsgIC8vIGluIHBpY29tZXRlcnNcclxuY29uc3QgREVGQVVMVF9TVUJTVEFOQ0UgPSBTdWJzdGFuY2VUeXBlLk5FT047XHJcbmNvbnN0IE1BWF9URU1QRVJBVFVSRSA9IDUwLjA7XHJcbmNvbnN0IE1JTl9URU1QRVJBVFVSRSA9IDAuMDAwMDE7XHJcbmNvbnN0IE5PTUlOQUxfR1JBVklUQVRJT05BTF9BQ0NFTCA9IC0wLjA0NTtcclxuY29uc3QgVEVNUEVSQVRVUkVfQ0hBTkdFX1JBVEUgPSAwLjA3OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIG1ha2UgdGVtcGVyYXRlIGNoYW5nZSBhdCBhIHJlYXNvbmFibGUgcmF0ZVxyXG5jb25zdCBJTkpFQ1RFRF9NT0xFQ1VMRV9TUEVFRCA9IDIuMDsgLy8gaW4gbm9ybWFsaXplZCBtb2RlbCB1bml0cyBwZXIgc2Vjb25kLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGxvb2sgcmVhc29uYWJsZVxyXG5jb25zdCBJTkpFQ1RFRF9NT0xFQ1VMRV9BTkdMRV9TUFJFQUQgPSBNYXRoLlBJICogMC4yNTsgLy8gaW4gcmFkaWFucywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBsb29rIHJlYXNvbmFibGVcclxuY29uc3QgSU5KRUNUSU9OX1BPSU5UX0hPUklaX1BST1BPUlRJT04gPSAwLjAwO1xyXG5jb25zdCBJTkpFQ1RJT05fUE9JTlRfVkVSVF9QUk9QT1JUSU9OID0gMC4yNTtcclxuXHJcbi8vIGNvbnN0YW50cyByZWxhdGVkIHRvIGhvdyB0aW1lIHN0ZXBzIGFyZSBoYW5kbGVkXHJcbmNvbnN0IFBBUlRJQ0xFX1NQRUVEX1VQX0ZBQ1RPUiA9IDQ7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbWFrZSB0aGUgcGFydGljbGVzIG1vdmUgYXQgYSBzcGVlZCB0aGF0IGxvb2tzIHJlYXNvbmFibGVcclxuY29uc3QgTUFYX1BBUlRJQ0xFX01PVElPTl9USU1FX1NURVAgPSAwLjAyNTsgLy8gbWF4IHRpbWUgc3RlcCB0aGF0IG1vZGVsIGNhbiBoYW5kbGUsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbi8vIGNvbnN0YW50cyB0aGF0IGRlZmluZSB0aGUgbm9ybWFsaXplZCB0ZW1wZXJhdHVyZXMgdXNlZCBmb3IgdGhlIHZhcmlvdXMgc3RhdGVzXHJcbmNvbnN0IFNPTElEX1RFTVBFUkFUVVJFID0gU09NQ29uc3RhbnRzLlNPTElEX1RFTVBFUkFUVVJFO1xyXG5jb25zdCBMSVFVSURfVEVNUEVSQVRVUkUgPSBTT01Db25zdGFudHMuTElRVUlEX1RFTVBFUkFUVVJFO1xyXG5jb25zdCBHQVNfVEVNUEVSQVRVUkUgPSBTT01Db25zdGFudHMuR0FTX1RFTVBFUkFUVVJFO1xyXG5jb25zdCBJTklUSUFMX1RFTVBFUkFUVVJFID0gU09MSURfVEVNUEVSQVRVUkU7XHJcbmNvbnN0IEFQUFJPQUNISU5HX0FCU09MVVRFX1pFUk9fVEVNUEVSQVRVUkUgPSBTT0xJRF9URU1QRVJBVFVSRSAqIDAuODU7XHJcblxyXG4vLyBwYXJhbWV0ZXJzIHRvIGNvbnRyb2wgcmF0ZXMgb2YgY2hhbmdlIG9mIHRoZSBjb250YWluZXIgc2l6ZVxyXG5jb25zdCBNQVhfQ09OVEFJTkVSX0VYUEFORF9SQVRFID0gMTUwMDsgLy8gaW4gbW9kZWwgdW5pdHMgcGVyIHNlY29uZFxyXG5jb25zdCBQT1NUX0VYUExPU0lPTl9DT05UQUlORVJfRVhQQU5TSU9OX1JBVEUgPSA5MDAwOyAvLyBpbiBtb2RlbCB1bml0cyBwZXIgc2Vjb25kXHJcblxyXG4vLyBSYW5nZSBmb3IgZGVjaWRpbmcgaWYgdGhlIHRlbXBlcmF0dXJlIGlzIG5lYXIgdGhlIGN1cnJlbnQgc2V0IHBvaW50LiBUaGUgdW5pdHMgYXJlIGludGVybmFsIG1vZGVsIHVuaXRzLlxyXG5jb25zdCBURU1QRVJBVFVSRV9DTE9TRU5FU1NfUkFOR0UgPSAwLjE1O1xyXG5cclxuLy8gVmFsdWVzIHVzZWQgZm9yIGNvbnZlcnRpbmcgZnJvbSBtb2RlbCB0ZW1wZXJhdHVyZSB0byB0aGUgdGVtcGVyYXR1cmUgZm9yIGEgZ2l2ZW4gc3Vic3RhbmNlLlxyXG5jb25zdCBORU9OX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU4gPSBTT01Db25zdGFudHMuTkVPTl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG5jb25zdCBORU9OX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTiA9IFNPTUNvbnN0YW50cy5ORU9OX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTjtcclxuY29uc3QgQVJHT05fVFJJUExFX1BPSU5UX0lOX0tFTFZJTiA9IFNPTUNvbnN0YW50cy5BUkdPTl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG5jb25zdCBBUkdPTl9DUklUSUNBTF9QT0lOVF9JTl9LRUxWSU4gPSBTT01Db25zdGFudHMuQVJHT05fQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOO1xyXG5jb25zdCBPMl9UUklQTEVfUE9JTlRfSU5fS0VMVklOID0gU09NQ29uc3RhbnRzLk8yX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU47XHJcbmNvbnN0IE8yX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTiA9IFNPTUNvbnN0YW50cy5PMl9DUklUSUNBTF9QT0lOVF9JTl9LRUxWSU47XHJcbmNvbnN0IFdBVEVSX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU4gPSBTT01Db25zdGFudHMuV0FURVJfVFJJUExFX1BPSU5UX0lOX0tFTFZJTjtcclxuY29uc3QgV0FURVJfQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOID0gU09NQ29uc3RhbnRzLldBVEVSX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTjtcclxuXHJcbi8vIFRoZSBmb2xsb3dpbmcgdmFsdWVzIGFyZSB1c2VkIGZvciB0ZW1wZXJhdHVyZSBjb252ZXJzaW9uIGZvciB0aGUgYWRqdXN0YWJsZSBtb2xlY3VsZS4gIFRoZXNlIGFyZSBzb21ld2hhdFxyXG4vLyBhcmJpdHJhcnksIHNpbmNlIGluIHRoZSByZWFsIHdvcmxkIHRoZSB2YWx1ZXMgd291bGQgY2hhbmdlIGlmIGVwc2lsb24gd2VyZSBjaGFuZ2VkLiAgVGhleSBoYXZlIGJlZW4gY2hvc2VuIHRvIGJlXHJcbi8vIHNpbWlsYXIgdG8gYXJnb24sIGJlY2F1c2UgdGhlIGRlZmF1bHQgZXBzaWxvbiB2YWx1ZSBpcyBoYWxmIG9mIHRoZSBhbGxvd2FibGUgcmFuZ2UsIGFuZCB0aGlzIHZhbHVlIGVuZHMgdXAgYmVpbmdcclxuLy8gc2ltaWxhciB0byBhcmdvbi5cclxuY29uc3QgQURKVVNUQUJMRV9BVE9NX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU4gPSA3NTtcclxuY29uc3QgQURKVVNUQUJMRV9BVE9NX0NSSVRJQ0FMX1BPSU5UX0lOX0tFTFZJTiA9IDE0MDtcclxuXHJcbi8vIFRpbWUgdmFsdWUgdXNlZCB0byBwcmV2ZW50IG1vbGVjdWxlIGluamVjdGlvbnMgZnJvbSBiZWluZyB0b28gY2xvc2UgdG9nZXRoZXIgc28gdGhhdCB0aGV5IGRvbid0IG92ZXJsYXAgYWZ0ZXJcclxuLy8gaW5qZWN0aW9uIGFuZCBjYXVzZSBoaWdoIGluaXRpYWwgdmVsb2NpdGllcy5cclxuY29uc3QgTU9MRUNVTEVfSU5KRUNUSU9OX0hPTERPRkZfVElNRSA9IDAuMjU7IC8vIHNlY29uZHMsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgTUFYX01PTEVDVUxFU19RVUVVRURfRk9SX0lOSkVDVElPTiA9IDM7XHJcblxyXG5jbGFzcyBNdWx0aXBsZVBhcnRpY2xlTW9kZWwgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHZhbGlkU3Vic3RhbmNlczogU3Vic3RhbmNlVHlwZS5WQUxVRVNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvVHlwZTogTXVsdGlwbGVQYXJ0aWNsZU1vZGVsLk11bHRpcGxlUGFydGljbGVNb2RlbElPXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gb2JzZXJ2YWJsZSBtb2RlbCBwcm9wZXJ0aWVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMuc3Vic3RhbmNlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIFN1YnN0YW5jZVR5cGUsIERFRkFVTFRfU1VCU1RBTkNFLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBvcHRpb25zLnZhbGlkU3Vic3RhbmNlcyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3Vic3RhbmNlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuY29udGFpbmVySGVpZ2h0UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIENPTlRBSU5FUl9JTklUSUFMX0hFSUdIVCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250YWluZXJIZWlnaHRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBoZWlnaHQgb2YgdGhlIHBhcnRpY2xlIGNvbnRhaW5lciwgaW4gcGljb21ldGVycy4nLFxyXG4gICAgICB1bml0czogJ3BtJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuaXNFeHBsb2RlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNFeHBsb2RlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSlcclxuICAgIHRoaXMudGVtcGVyYXR1cmVTZXRQb2ludFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBJTklUSUFMX1RFTVBFUkFUVVJFLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdJbiBpbnRlcm5hbCBtb2RlbCB1bml0cywgc29saWQgPSAwLjE1LCBsaXF1aWQgPSAwLjM0LCBnYXMgPSAxLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnByZXNzdXJlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlc3N1cmVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAnYXRtJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpXHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc1BsYXlpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpXHJcbiAgICB0aGlzLmhlYXRpbmdDb29saW5nQW1vdW50UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAtMSwgMSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC13cml0ZSkgLSB0aGUgbnVtYmVyIG9mIG1vbGVjdWxlcyB0aGF0IHNob3VsZCBiZSBpbiB0aGUgc2ltdWxhdGlvbi4gIFRoaXMgaXMgdXNlZCBwcmltYXJpbHkgZm9yXHJcbiAgICAvLyBpbmplY3RpbmcgbmV3IG1vbGVjdWxlcywgYW5kIHdoZW4gdGhpcyBudW1iZXIgaXMgaW5jcmVhc2VkLCBpbnRlcm5hbCBtb2RlbCBzdGF0ZSBpcyBhZGp1c3RlZCB0byBtYXRjaC5cclxuICAgIHRoaXMudGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0YXJnZXROdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgdmFsdWUgcmVwcmVzZW50cyB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcyBiZWluZyBzaW11bGF0ZWQsIG5vdCB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcyBpbiB0aGUgY29udGFpbmVyLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLm1heE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIFNPTUNvbnN0YW50cy5NQVhfTlVNX0FUT01TICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy5udW1Nb2xlY3VsZXNRdWV1ZWRGb3JJbmplY3Rpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBpbmRpY2F0ZXMgd2hldGhlciBpbmplY3Rpb24gb2YgYWRkaXRpb25hbCBtb2xlY3VsZXMgaXMgYWxsb3dlZFxyXG4gICAgdGhpcy5pc0luamVjdGlvbkFsbG93ZWRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFtcclxuICAgICAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LFxyXG4gICAgICAgIHRoaXMubnVtTW9sZWN1bGVzUXVldWVkRm9ySW5qZWN0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5pc0V4cGxvZGVkUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5tYXhOdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5LFxyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICAoIGlzUGxheWluZywgbnVtYmVyT2ZNb2xlY3VsZXNRdWV1ZWRGb3JJbmplY3Rpb24sIGlzRXhwbG9kZWQsIG1heE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHksIHRhcmdldE51bWJlck9mTW9sZWN1bGVzICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBpc1BsYXlpbmcgJiZcclxuICAgICAgICAgICAgICAgbnVtYmVyT2ZNb2xlY3VsZXNRdWV1ZWRGb3JJbmplY3Rpb24gPCBNQVhfTU9MRUNVTEVTX1FVRVVFRF9GT1JfSU5KRUNUSU9OICYmXHJcbiAgICAgICAgICAgICAgICFpc0V4cGxvZGVkICYmXHJcbiAgICAgICAgICAgICAgIHRhcmdldE51bWJlck9mTW9sZWN1bGVzIDwgbWF4TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChsaXN0ZW4tb25seSkgLSBmaXJlcyB3aGVuIGEgcmVzZXQgb2NjdXJzXHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gb3RoZXIgbW9kZWwgYXR0cmlidXRlc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge09ic2VydmFibGVBcnJheURlZi48U2NhbGVkQXRvbT59IC0gYXJyYXkgb2Ygc2NhbGVkIChpLmUuIG5vbi1ub3JtYWxpemVkKSBhdG9tc1xyXG4gICAgdGhpcy5zY2FsZWRBdG9tcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0fSAtIGRhdGEgc2V0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHBvc2l0aW9uLCBtb3Rpb24sIGFuZCBmb3JjZVxyXG4gICAgLy8gZm9yIHRoZSBub3JtYWxpemVkIGF0b21zXHJcbiAgICB0aGlzLm1vbGVjdWxlRGF0YVNldCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfSAtIHZhcmlvdXMgbm9uLXByb3BlcnR5IGF0dHJpYnV0ZXNcclxuICAgIHRoaXMubm9ybWFsaXplZENvbnRhaW5lcldpZHRoID0gQ09OVEFJTkVSX1dJRFRIIC8gdGhpcy5wYXJ0aWNsZURpYW1ldGVyO1xyXG4gICAgdGhpcy5ncmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uID0gTk9NSU5BTF9HUkFWSVRBVElPTkFMX0FDQ0VMO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGNvbnRhaW5lciBoZWlnaHQsIGNoYW5nZXMgYXMgdGhlIGxpZCBwb3NpdGlvbiBjaGFuZ2VzXHJcbiAgICB0aGlzLm5vcm1hbGl6ZWRDb250YWluZXJIZWlnaHQgPSB0aGlzLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LmdldCgpIC8gdGhpcy5wYXJ0aWNsZURpYW1ldGVyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIFRPVEFMIGNvbnRhaW5lciBoZWlnaHQgcmVnYXJkbGVzcyBvZiB0aGUgbGlkIHBvc2l0aW9uXHJcbiAgICB0aGlzLm5vcm1hbGl6ZWRUb3RhbENvbnRhaW5lckhlaWdodCA9IHRoaXMuY29udGFpbmVySGVpZ2h0UHJvcGVydHkuZ2V0IC8gdGhpcy5wYXJ0aWNsZURpYW1ldGVyO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgLSBub3JtYWxpemVkIHZlbG9jaXR5IGF0IHdoaWNoIGxpZCBpcyBtb3ZpbmcgaW4geSBkaXJlY3Rpb25cclxuICAgIHRoaXMubm9ybWFsaXplZExpZFZlbG9jaXR5WSA9IDA7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCAocmVhZC1vbmx5KSB7VmVjdG9yMn0gLSB0aGUgbG9jYXRpb24gd2hlcmUgbmV3IG1vbGVjdWxlcyBhcmUgaW5qZWN0ZWQsIGluIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZXNcclxuICAgIHRoaXMuaW5qZWN0aW9uUG9pbnQgPSBWZWN0b3IyLlpFUk8uY29weSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlLCB2YXJpb3VzIGludGVybmFsIG1vZGVsIHZhcmlhYmxlc1xyXG4gICAgdGhpcy5wYXJ0aWNsZURpYW1ldGVyID0gMTtcclxuICAgIHRoaXMubWluTW9kZWxUZW1wZXJhdHVyZSA9IG51bGw7XHJcbiAgICB0aGlzLnJlc2lkdWFsVGltZSA9IDA7XHJcbiAgICB0aGlzLm1vbGVjdWxlSW5qZWN0aW9uSG9sZG9mZlRpbWVyID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0Q2hhbmdlVGhpc1N0ZXAgPSAwO1xyXG4gICAgdGhpcy5tb2xlY3VsZUluamVjdGVkVGhpc1N0ZXAgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSwgc3RyYXRlZ3kgcGF0dGVybnMgdGhhdCBhcmUgYXBwbGllZCB0byB0aGUgZGF0YSBzZXRcclxuICAgIHRoaXMuYXRvbVBvc2l0aW9uVXBkYXRlciA9IG51bGw7XHJcbiAgICB0aGlzLnBoYXNlU3RhdGVDaGFuZ2VyID0gbnVsbDtcclxuICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQgPSBudWxsO1xyXG4gICAgdGhpcy5hbmRlcnNlblRoZXJtb3N0YXQgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWRcclxuICAgIHRoaXMubW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbW92aW5nIGF2ZXJhZ2UgY2FsY3VsYXRvciB0aGF0IHRyYWNrcyB0aGUgYXZlcmFnZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGNhbGN1bGF0ZWQgYW5kIHRhcmdldCB0ZW1wZXJhdHVyZXNcclxuICAgIHRoaXMuYXZlcmFnZVRlbXBlcmF0dXJlRGlmZmVyZW5jZSA9IG5ldyBNb3ZpbmdBdmVyYWdlKCAxMCApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG90aGVyIGluaXRpYWxpemF0aW9uXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBzdWJzdGFuY2UgYmVpbmcgc2ltdWxhdGVkIGFuZCB1cGRhdGUgdGhlIGludGVybmFscyBhcyBuZWVkZWRcclxuICAgIHRoaXMuc3Vic3RhbmNlUHJvcGVydHkubGluayggc3Vic3RhbmNlID0+IHtcclxuICAgICAgdGhpcy5oYW5kbGVTdWJzdGFuY2VDaGFuZ2VkKCBzdWJzdGFuY2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIG5vbi1ub3JtYWxpemVkIGNvbnRhaW5lciBzaXplIGFuZCB1cGRhdGUgdGhlIG5vcm1hbGl6ZWQgZGltZW5zaW9uc1xyXG4gICAgdGhpcy5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZU5vcm1hbGl6ZWRDb250YWluZXJEaW1lbnNpb25zLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIC8vIGxpc3RlbiBmb3IgbmV3IG1vbGVjdWxlcyBiZWluZyBhZGRlZCAoZ2VuZXJhbGx5IGZyb20gdGhlIHB1bXApXHJcbiAgICB0aGlzLnRhcmdldE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHkubGF6eUxpbmsoIHRhcmdldE51bWJlck9mTW9sZWN1bGVzID0+IHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgdGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXMgPD0gdGhpcy5tYXhOdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICd0YXJnZXQgbnVtYmVyIG9mIG1vbGVjdWxlcyBzZXQgYWJvdmUgbWF4IGFsbG93ZWQnXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjb25zdCBjdXJyZW50TnVtYmVyT2ZNb2xlY3VsZXMgPSBNYXRoLmZsb29yKFxyXG4gICAgICAgIHRoaXMubW9sZWN1bGVEYXRhU2V0Lm51bWJlck9mQXRvbXMgLyB0aGlzLm1vbGVjdWxlRGF0YVNldC5hdG9tc1Blck1vbGVjdWxlXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjb25zdCBudW1iZXJPZk1vbGVjdWxlc1RvQWRkID0gdGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXMgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBjdXJyZW50TnVtYmVyT2ZNb2xlY3VsZXMgKyB0aGlzLm51bU1vbGVjdWxlc1F1ZXVlZEZvckluamVjdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZk1vbGVjdWxlc1RvQWRkOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5xdWV1ZU1vbGVjdWxlRm9ySW5qZWN0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdGhlIG1vZGVsIHRlbXBlcmF0dXJlIGluIEtlbHZpbiwgZGVyaXZlZCBmcm9tIHRoZSB0ZW1wZXJhdHVyZSBzZXQgcG9pbnQgaW4gbW9kZWwgdW5pdHNcclxuICAgIHRoaXMudGVtcGVyYXR1cmVJbktlbHZpblByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eSwgdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eSwgdGhpcy50YXJnZXROdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5IF0sXHJcbiAgICAgICgpID0+IHRoaXMuZ2V0VGVtcGVyYXR1cmVJbktlbHZpbigpLFxyXG4gICAgICB7XHJcbiAgICAgICAgdW5pdHM6ICdLJyxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIE51bWJlcklPICksXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGVtcGVyYXR1cmVJbktlbHZpblByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRSZWFkT25seTogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1RlbXBlcmF0dXJlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFRlbXBlcmF0dXJlKCBuZXdUZW1wZXJhdHVyZSApIHtcclxuXHJcbiAgICBpZiAoIG5ld1RlbXBlcmF0dXJlID4gTUFYX1RFTVBFUkFUVVJFICkge1xyXG4gICAgICB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5zZXQoIE1BWF9URU1QRVJBVFVSRSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5ld1RlbXBlcmF0dXJlIDwgTUlOX1RFTVBFUkFUVVJFICkge1xyXG4gICAgICB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5zZXQoIE1JTl9URU1QRVJBVFVSRSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMudGVtcGVyYXR1cmVTZXRQb2ludFByb3BlcnR5LnNldCggbmV3VGVtcGVyYXR1cmUgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQgIT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQudGFyZ2V0VGVtcGVyYXR1cmUgPSBuZXdUZW1wZXJhdHVyZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuYW5kZXJzZW5UaGVybW9zdGF0ICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLmFuZGVyc2VuVGhlcm1vc3RhdC50YXJnZXRUZW1wZXJhdHVyZSA9IG5ld1RlbXBlcmF0dXJlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjdXJyZW50IHRlbXBlcmF0dXJlIGluIGRlZ3JlZXMgS2VsdmluLiAgVGhlIGNhbGN1bGF0aW9ucyBkb25lIGFyZSBkZXBlbmRlbnQgb24gdGhlIHR5cGUgb2YgbW9sZWN1bGVcclxuICAgKiBzZWxlY3RlZC4gIFRoZSB2YWx1ZXMgYW5kIHJhbmdlcyB1c2VkIGluIHRoaXMgbWV0aG9kIHdlcmUgZGVyaXZlZCBmcm9tIGluZm9ybWF0aW9uIHByb3ZpZGVkIGJ5IFBhdWwgQmVhbGUsIGRlcHRcclxuICAgKiBvZiBQaHlzaWNzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXIuICBJZiBubyBhdG9tcyBhcmUgaW4gdGhlIGNvbnRhaW5lciwgdGhpcyByZXR1cm5zIG51bGwuXHJcbiAgICogQHJldHVybnMge251bWJlcnxudWxsfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0VGVtcGVyYXR1cmVJbktlbHZpbigpIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuc2NhbGVkQXRvbXMubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgLy8gdGVtcGVyYXR1cmUgaXMgcmVwb3J0ZWQgYXMgbnVsbCBpZiB0aGVyZSBhcmUgbm8gYXRvbXMgc2luY2UgdGhlIHRlbXBlcmF0dXJlIGlzIG1lYW5pbmdsZXNzIGluIHRoYXQgY2FzZVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdGVtcGVyYXR1cmVJbktlbHZpbjtcclxuICAgIGxldCB0cmlwbGVQb2ludEluS2VsdmluID0gMDtcclxuICAgIGxldCBjcml0aWNhbFBvaW50SW5LZWx2aW4gPSAwO1xyXG4gICAgbGV0IHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzID0gMDtcclxuICAgIGxldCBjcml0aWNhbFBvaW50SW5Nb2RlbFVuaXRzID0gMDtcclxuXHJcbiAgICBzd2l0Y2goIHRoaXMuc3Vic3RhbmNlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuTkVPTjpcclxuICAgICAgICB0cmlwbGVQb2ludEluS2VsdmluID0gTkVPTl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIGNyaXRpY2FsUG9pbnRJbktlbHZpbiA9IE5FT05fQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLlRSSVBMRV9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgY3JpdGljYWxQb2ludEluTW9kZWxVbml0cyA9IFNPTUNvbnN0YW50cy5DUklUSUNBTF9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuQVJHT046XHJcbiAgICAgICAgdHJpcGxlUG9pbnRJbktlbHZpbiA9IEFSR09OX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU47XHJcbiAgICAgICAgY3JpdGljYWxQb2ludEluS2VsdmluID0gQVJHT05fQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLlRSSVBMRV9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgY3JpdGljYWxQb2ludEluTW9kZWxVbml0cyA9IFNPTUNvbnN0YW50cy5DUklUSUNBTF9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuQURKVVNUQUJMRV9BVE9NOlxyXG4gICAgICAgIHRyaXBsZVBvaW50SW5LZWx2aW4gPSBBREpVU1RBQkxFX0FUT01fVFJJUExFX1BPSU5UX0lOX0tFTFZJTjtcclxuICAgICAgICBjcml0aWNhbFBvaW50SW5LZWx2aW4gPSBBREpVU1RBQkxFX0FUT01fQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLlRSSVBMRV9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgY3JpdGljYWxQb2ludEluTW9kZWxVbml0cyA9IFNPTUNvbnN0YW50cy5DUklUSUNBTF9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuV0FURVI6XHJcbiAgICAgICAgdHJpcGxlUG9pbnRJbktlbHZpbiA9IFdBVEVSX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU47XHJcbiAgICAgICAgY3JpdGljYWxQb2ludEluS2VsdmluID0gV0FURVJfQ1JJVElDQUxfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLlRSSVBMRV9QT0lOVF9XQVRFUl9NT0RFTF9URU1QRVJBVFVSRTtcclxuICAgICAgICBjcml0aWNhbFBvaW50SW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLkNSSVRJQ0FMX1BPSU5UX1dBVEVSX01PREVMX1RFTVBFUkFUVVJFO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLkRJQVRPTUlDX09YWUdFTjpcclxuICAgICAgICB0cmlwbGVQb2ludEluS2VsdmluID0gTzJfVFJJUExFX1BPSU5UX0lOX0tFTFZJTjtcclxuICAgICAgICBjcml0aWNhbFBvaW50SW5LZWx2aW4gPSBPMl9DUklUSUNBTF9QT0lOVF9JTl9LRUxWSU47XHJcbiAgICAgICAgdHJpcGxlUG9pbnRJbk1vZGVsVW5pdHMgPSBTT01Db25zdGFudHMuVFJJUExFX1BPSU5UX0RJQVRPTUlDX01PREVMX1RFTVBFUkFUVVJFO1xyXG4gICAgICAgIGNyaXRpY2FsUG9pbnRJbk1vZGVsVW5pdHMgPSBTT01Db25zdGFudHMuQ1JJVElDQUxfUE9JTlRfRElBVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ3Vuc3VwcG9ydGVkIHN1YnN0YW5jZScgKTsgLy8gc2hvdWxkIG5ldmVyIGhhcHBlbiwgZGVidWcgaWYgaXQgZG9lc1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy50ZW1wZXJhdHVyZVNldFBvaW50UHJvcGVydHkuZ2V0KCkgPD0gdGhpcy5taW5Nb2RlbFRlbXBlcmF0dXJlICkge1xyXG5cclxuICAgICAgLy8gd2UgdHJlYXQgYW55dGhpbmcgYmVsb3cgdGhlIG1pbmltdW0gdGVtcGVyYXR1cmUgYXMgYWJzb2x1dGUgemVyb1xyXG4gICAgICB0ZW1wZXJhdHVyZUluS2VsdmluID0gMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKSA8IHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzICkge1xyXG4gICAgICB0ZW1wZXJhdHVyZUluS2VsdmluID0gdGhpcy50ZW1wZXJhdHVyZVNldFBvaW50UHJvcGVydHkuZ2V0KCkgKiB0cmlwbGVQb2ludEluS2VsdmluIC8gdHJpcGxlUG9pbnRJbk1vZGVsVW5pdHM7XHJcblxyXG4gICAgICBpZiAoIHRlbXBlcmF0dXJlSW5LZWx2aW4gPCAwLjUgKSB7XHJcblxyXG4gICAgICAgIC8vIERvbid0IHJldHVybiB6ZXJvIC0gb3IgYW55dGhpbmcgdGhhdCB3b3VsZCByb3VuZCB0byBpdCAtIGFzIGEgdmFsdWUgdW50aWwgd2UgYWN0dWFsbHkgcmVhY2ggdGhlIG1pbmltdW1cclxuICAgICAgICAvLyBpbnRlcm5hbCB0ZW1wZXJhdHVyZS5cclxuICAgICAgICB0ZW1wZXJhdHVyZUluS2VsdmluID0gMC41O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy50ZW1wZXJhdHVyZVNldFBvaW50UHJvcGVydHkuZ2V0KCkgPCBjcml0aWNhbFBvaW50SW5Nb2RlbFVuaXRzICkge1xyXG4gICAgICBjb25zdCBzbG9wZSA9ICggY3JpdGljYWxQb2ludEluS2VsdmluIC0gdHJpcGxlUG9pbnRJbktlbHZpbiApIC9cclxuICAgICAgICAgICAgICAgICAgICAoIGNyaXRpY2FsUG9pbnRJbk1vZGVsVW5pdHMgLSB0cmlwbGVQb2ludEluTW9kZWxVbml0cyApO1xyXG4gICAgICBjb25zdCBvZmZzZXQgPSB0cmlwbGVQb2ludEluS2VsdmluIC0gKCBzbG9wZSAqIHRyaXBsZVBvaW50SW5Nb2RlbFVuaXRzICk7XHJcbiAgICAgIHRlbXBlcmF0dXJlSW5LZWx2aW4gPSB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKSAqIHNsb3BlICsgb2Zmc2V0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRlbXBlcmF0dXJlSW5LZWx2aW4gPSB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKSAqIGNyaXRpY2FsUG9pbnRJbktlbHZpbiAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcml0aWNhbFBvaW50SW5Nb2RlbFVuaXRzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRlbXBlcmF0dXJlSW5LZWx2aW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHByZXNzdXJlIHZhbHVlIHdoaWNoIGlzIGJlaW5nIGNhbGN1bGF0ZWQgYnkgdGhlIG1vZGVsIGFuZCBpcyBub3QgYWRqdXN0ZWQgdG8gcmVwcmVzZW50IGFueSBcInJlYWxcIiB1bml0c1xyXG4gICAqIChzdWNoIGFzIGF0bW9zcGhlcmVzKS5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNb2RlbFByZXNzdXJlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IucHJlc3N1cmVQcm9wZXJ0eS5nZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGhhbmRsZXIgdGhhdCBzZXRzIHVwIHRoZSB2YXJpb3VzIHBvcnRpb25zIG9mIHRoZSBtb2RlbCB0byBzdXBwb3J0IHRoZSBuZXdseSBzZWxlY3RlZCBzdWJzdGFuY2VcclxuICAgKiBAcGFyYW0ge1N1YnN0YW5jZVR5cGV9IHN1YnN0YW5jZVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBoYW5kbGVTdWJzdGFuY2VDaGFuZ2VkKCBzdWJzdGFuY2UgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLkRJQVRPTUlDX09YWUdFTiB8fFxyXG4gICAgICBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuTkVPTiB8fFxyXG4gICAgICBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuQVJHT04gfHxcclxuICAgICAgc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLldBVEVSIHx8XHJcbiAgICAgIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5BREpVU1RBQkxFX0FUT00sXHJcbiAgICAgICd1bnN1cHBvcnRlZCBzdWJzdGFuY2UnXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFJldGFpbiB0aGUgY3VycmVudCBwaGFzZSBzbyB0aGF0IHdlIGNhbiBzZXQgdGhlIGF0b21zIGJhY2sgdG8gdGhpcyBwaGFzZSBvbmNlIHRoZXkgaGF2ZSBiZWVuIGNyZWF0ZWQgYW5kXHJcbiAgICAvLyBpbml0aWFsaXplZC5cclxuICAgIGNvbnN0IHBoYXNlID0gdGhpcy5tYXBUZW1wZXJhdHVyZVRvUGhhc2UoKTtcclxuXHJcbiAgICAvLyByZW1vdmUgYWxsIGF0b21zXHJcbiAgICB0aGlzLnJlbW92ZUFsbEF0b21zKCk7XHJcblxyXG4gICAgLy8gUmVpbml0aWFsaXplIHRoZSBtb2RlbCBwYXJhbWV0ZXJzLlxyXG4gICAgdGhpcy5pbml0aWFsaXplTW9kZWxQYXJhbWV0ZXJzKCk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBtb2RlbCBwYXJhbWV0ZXJzIHRoYXQgYXJlIGRlcGVuZGVudCB1cG9uIHRoZSBzdWJzdGFuY2UgYmVpbmcgc2ltdWxhdGVkLlxyXG4gICAgc3dpdGNoKCBzdWJzdGFuY2UgKSB7XHJcblxyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuRElBVE9NSUNfT1hZR0VOOlxyXG4gICAgICAgIHRoaXMucGFydGljbGVEaWFtZXRlciA9IFNPTUNvbnN0YW50cy5PWFlHRU5fUkFESVVTICogMjtcclxuICAgICAgICB0aGlzLm1pbk1vZGVsVGVtcGVyYXR1cmUgPSAwLjUgKiBTT01Db25zdGFudHMuVFJJUExFX1BPSU5UX0RJQVRPTUlDX01PREVMX1RFTVBFUkFUVVJFIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPMl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLk5FT046XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZURpYW1ldGVyID0gU09NQ29uc3RhbnRzLk5FT05fUkFESVVTICogMjtcclxuICAgICAgICB0aGlzLm1pbk1vZGVsVGVtcGVyYXR1cmUgPSAwLjUgKiBTT01Db25zdGFudHMuVFJJUExFX1BPSU5UX01PTkFUT01JQ19NT0RFTF9URU1QRVJBVFVSRSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTkVPTl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLkFSR09OOlxyXG4gICAgICAgIHRoaXMucGFydGljbGVEaWFtZXRlciA9IFNPTUNvbnN0YW50cy5BUkdPTl9SQURJVVMgKiAyO1xyXG4gICAgICAgIHRoaXMubWluTW9kZWxUZW1wZXJhdHVyZSA9IDAuNSAqIFNPTUNvbnN0YW50cy5UUklQTEVfUE9JTlRfTU9OQVRPTUlDX01PREVMX1RFTVBFUkFUVVJFIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBUkdPTl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLldBVEVSOlxyXG5cclxuICAgICAgICAvLyBVc2UgYSByYWRpdXMgdmFsdWUgdGhhdCBpcyBhcnRpZmljaWFsbHkgbGFyZ2UsIGJlY2F1c2UgdGhlIGVkdWNhdG9ycyBoYXZlIHJlcXVlc3RlZCB0aGF0IHdhdGVyIGxvb2tcclxuICAgICAgICAvLyBcInNwYWNlZCBvdXRcIiBzbyB0aGF0IHVzZXJzIGNhbiBzZWUgdGhlIGNyeXN0YWwgc3RydWN0dXJlIGJldHRlciwgYW5kIHNvIHRoYXQgdGhlIHNvbGlkIGZvcm0gd2lsbCBsb29rXHJcbiAgICAgICAgLy8gbGFyZ2VyIChzaW5jZSB3YXRlciBleHBhbmRzIHdoZW4gZnJvemVuKS5cclxuICAgICAgICB0aGlzLnBhcnRpY2xlRGlhbWV0ZXIgPSBTT01Db25zdGFudHMuT1hZR0VOX1JBRElVUyAqIDIuOTtcclxuICAgICAgICB0aGlzLm1pbk1vZGVsVGVtcGVyYXR1cmUgPSAwLjUgKiBTT01Db25zdGFudHMuVFJJUExFX1BPSU5UX1dBVEVSX01PREVMX1RFTVBFUkFUVVJFIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXQVRFUl9UUklQTEVfUE9JTlRfSU5fS0VMVklOO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLkFESlVTVEFCTEVfQVRPTTpcclxuICAgICAgICB0aGlzLnBhcnRpY2xlRGlhbWV0ZXIgPSBTT01Db25zdGFudHMuQURKVVNUQUJMRV9BVFRSQUNUSU9OX0RFRkFVTFRfUkFESVVTICogMjtcclxuICAgICAgICB0aGlzLm1pbk1vZGVsVGVtcGVyYXR1cmUgPSAwLjUgKiBTT01Db25zdGFudHMuVFJJUExFX1BPSU5UX01PTkFUT01JQ19NT0RFTF9URU1QRVJBVFVSRSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQURKVVNUQUJMRV9BVE9NX1RSSVBMRV9QT0lOVF9JTl9LRUxWSU47XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ3Vuc3VwcG9ydGVkIHN1YnN0YW5jZScgKTsgLy8gc2hvdWxkIG5ldmVyIGhhcHBlbiwgZGVidWcgaWYgaXQgZG9lc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBjb250YWluZXIgaGVpZ2h0LlxyXG4gICAgdGhpcy5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgbm9ybWFsaXplZCBjb250YWluZXIgZGltZW5zaW9ucyBhcmUgY29ycmVjdCBmb3IgdGhlIHN1YnN0YW5jZSBhbmQgdGhlIGN1cnJlbnQgbm9uLW5vcm1hbGl6ZSBzaXplLlxyXG4gICAgdGhpcy51cGRhdGVOb3JtYWxpemVkQ29udGFpbmVyRGltZW5zaW9ucygpO1xyXG5cclxuICAgIC8vIEFkanVzdCB0aGUgaW5qZWN0aW9uIHBvaW50IGJhc2VkIG9uIHRoZSBuZXcgcGFydGljbGUgZGlhbWV0ZXIuICBUaGVzZSBhcmUgdXNpbmcgdGhlIG5vcm1hbGl6ZWQgY29vcmRpbmF0ZSB2YWx1ZXMuXHJcbiAgICB0aGlzLmluamVjdGlvblBvaW50LnNldFhZKFxyXG4gICAgICBDT05UQUlORVJfV0lEVEggLyB0aGlzLnBhcnRpY2xlRGlhbWV0ZXIgKiBJTkpFQ1RJT05fUE9JTlRfSE9SSVpfUFJPUE9SVElPTixcclxuICAgICAgQ09OVEFJTkVSX0lOSVRJQUxfSEVJR0hUIC8gdGhpcy5wYXJ0aWNsZURpYW1ldGVyICogSU5KRUNUSU9OX1BPSU5UX1ZFUlRfUFJPUE9SVElPTlxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGF0b21zIGFuZCBzZXQgdGhlaXIgaW5pdGlhbCBwb3NpdGlvbnMuXHJcbiAgICB0aGlzLmluaXRpYWxpemVBdG9tcyggcGhhc2UgKTtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgbW92aW5nIGF2ZXJhZ2Ugb2YgdGVtcGVyYXR1cmUgZGlmZmVyZW5jZXMuXHJcbiAgICB0aGlzLmF2ZXJhZ2VUZW1wZXJhdHVyZURpZmZlcmVuY2UucmVzZXQoKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIG51bWJlciBvZiBtb2xlY3VsZXMgYW5kIHJhbmdlIGZvciB0aGUgY3VycmVudCBzdWJzdGFuY2UuXHJcbiAgICBjb25zdCBhdG9tc1Blck1vbGVjdWxlID0gdGhpcy5tb2xlY3VsZURhdGFTZXQuYXRvbXNQZXJNb2xlY3VsZTtcclxuICAgIHRoaXMudGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eS5zZXQoIE1hdGguZmxvb3IoIHRoaXMubW9sZWN1bGVEYXRhU2V0Lm51bWJlck9mQXRvbXMgLyBhdG9tc1Blck1vbGVjdWxlICkgKTtcclxuICAgIHRoaXMubWF4TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eS5zZXQoIE1hdGguZmxvb3IoIFNPTUNvbnN0YW50cy5NQVhfTlVNX0FUT01TIC8gYXRvbXNQZXJNb2xlY3VsZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAgQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVQcmVzc3VyZSgpIHtcclxuICAgIHRoaXMucHJlc3N1cmVQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0UHJlc3N1cmVJbkF0bW9zcGhlcmVzKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuXHJcbiAgICBjb25zdCBzdWJzdGFuY2VBdFN0YXJ0T2ZSZXNldCA9IHRoaXMuc3Vic3RhbmNlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gcmVzZXQgb2JzZXJ2YWJsZSBwcm9wZXJ0aWVzXHJcbiAgICB0aGlzLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzRXhwbG9kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVNldFBvaW50UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHJlc3N1cmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5oZWF0aW5nQ29vbGluZ0Ftb3VudFByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgLy8gcmVzZXQgdGhlcm1vc3RhdHNcclxuICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQuY2xlYXJBY2N1bXVsYXRlZEJpYXMoKTtcclxuICAgIHRoaXMuYW5kZXJzZW5UaGVybW9zdGF0LmNsZWFyQWNjdW11bGF0ZWRCaWFzKCk7XHJcblxyXG4gICAgLy8gaWYgdGhlIHN1YnN0YW5jZSB3YXNuJ3QgY2hhbmdlZCBkdXJpbmcgcmVzZXQsIHNvIHNvbWUgYWRkaXRpb25hbCB3b3JrIGlzIG5lY2Vzc2FyeVxyXG4gICAgaWYgKCBzdWJzdGFuY2VBdFN0YXJ0T2ZSZXNldCA9PT0gdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVBbGxBdG9tcygpO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZUF0b21zKCBQaGFzZVN0YXRlRW51bS5TT0xJRCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG90aGVyIHJlc2V0XHJcbiAgICB0aGlzLmdyYXZpdGF0aW9uYWxBY2NlbGVyYXRpb24gPSBOT01JTkFMX0dSQVZJVEFUSU9OQUxfQUNDRUw7XHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBoYXNlIG9mIHRoZSBtb2xlY3VsZXMgaW4gdGhlIHNpbXVsYXRpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBoYXNlU2F0ZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRQaGFzZSggcGhhc2VTYXRlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgcGhhc2VTYXRlID09PSBQaGFzZVN0YXRlRW51bS5TT0xJRCB8fCBwaGFzZVNhdGUgPT09IFBoYXNlU3RhdGVFbnVtLkxJUVVJRCB8fCBwaGFzZVNhdGUgPT09IFBoYXNlU3RhdGVFbnVtLkdBUyxcclxuICAgICAgJ2ludmFsaWQgcGhhc2Ugc3RhdGUgc3BlY2lmaWVkJ1xyXG4gICAgKTtcclxuICAgIHRoaXMucGhhc2VTdGF0ZUNoYW5nZXIuc2V0UGhhc2UoIHBoYXNlU2F0ZSApO1xyXG4gICAgdGhpcy5zeW5jQXRvbVBvc2l0aW9ucygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgYW1vdW50IG9mIGhlYXRpbmcgb3IgY29vbGluZyB0aGF0IHRoZSBzeXN0ZW0gaXMgdW5kZXJnb2luZy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbm9ybWFsaXplZEhlYXRpbmdDb29saW5nQW1vdW50IC0gTm9ybWFsaXplZCBhbW91bnQgb2YgaGVhdGluZyBvciBjb29saW5nIHRoYXQgdGhlIHN5c3RlbSBpc1xyXG4gICAqIHVuZGVyZ29pbmcsIHJhbmdpbmcgZnJvbSAtMSB0byArMS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0SGVhdGluZ0Nvb2xpbmdBbW91bnQoIG5vcm1hbGl6ZWRIZWF0aW5nQ29vbGluZ0Ftb3VudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggbm9ybWFsaXplZEhlYXRpbmdDb29saW5nQW1vdW50IDw9IDEuMCApICYmICggbm9ybWFsaXplZEhlYXRpbmdDb29saW5nQW1vdW50ID49IC0xLjAgKSApO1xyXG4gICAgdGhpcy5oZWF0aW5nQ29vbGluZ0Ftb3VudFByb3BlcnR5LnNldCggbm9ybWFsaXplZEhlYXRpbmdDb29saW5nQW1vdW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbmplY3QgYSBuZXcgbW9sZWN1bGUgb2YgdGhlIGN1cnJlbnQgdHlwZS4gIFRoaXMgbWV0aG9kIGFjdHVhbGx5IHF1ZXVlcyBpdCBmb3IgaW5qZWN0aW9uLCBhY3R1YWwgaW5qZWN0aW9uXHJcbiAgICogb2NjdXJzIGR1cmluZyBtb2RlbCBzdGVwcy4gIEJlIGF3YXJlIHRoYXQgdGhpcyBzaWxlbnRseSBpZ25vcmVzIHRoZSBpbmplY3Rpb24gcmVxdWVzdCBpZiB0aGUgbW9kZWwgaXMgbm90IGluIGFcclxuICAgKiBzdGF0ZSB0byBzdXBwb3J0IGluamVjdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHF1ZXVlTW9sZWN1bGVGb3JJbmplY3Rpb24oKSB7XHJcbiAgICB0aGlzLm51bU1vbGVjdWxlc1F1ZXVlZEZvckluamVjdGlvblByb3BlcnR5LnNldCggdGhpcy5udW1Nb2xlY3VsZXNRdWV1ZWRGb3JJbmplY3Rpb25Qcm9wZXJ0eS52YWx1ZSArIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluamVjdCBhIG5ldyBtb2xlY3VsZSBvZiB0aGUgY3VycmVudCB0eXBlIGludG8gdGhlIG1vZGVsLiBUaGlzIHVzZXMgdGhlIGN1cnJlbnQgdGVtcGVyYXR1cmUgdG8gYXNzaWduIGFuIGluaXRpYWxcclxuICAgKiB2ZWxvY2l0eS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGluamVjdE1vbGVjdWxlKCkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRoaXMubnVtTW9sZWN1bGVzUXVldWVkRm9ySW5qZWN0aW9uUHJvcGVydHkudmFsdWUgPiAwLFxyXG4gICAgICAndGhpcyBtZXRob2Qgc2hvdWxkIG5vdCBiZSBjYWxsZWQgd2hlbiBub3RoaW5nIGlzIHF1ZXVlZCBmb3IgaW5qZWN0aW9uJ1xyXG4gICAgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5nZXROdW1iZXJPZlJlbWFpbmluZ1Nsb3RzKCkgPiAwLFxyXG4gICAgICAnaW5qZWN0aW9uIGF0dGVtcHRlZCB3aGVuIHRoZXJlIGlzIG5vIHJvb20gaW4gdGhlIGRhdGEgc2V0J1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBDaG9vc2UgYW4gaW5qZWN0aW9uIGFuZ2xlIHdpdGggc29tZSBhbW91bnQgb2YgcmFuZG9tbmVzcy5cclxuICAgIGNvbnN0IGluamVjdGlvbkFuZ2xlID0gKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIC0gMC41ICkgKiBJTkpFQ1RFRF9NT0xFQ1VMRV9BTkdMRV9TUFJFQUQ7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBtb2xlY3VsZSdzIHZlbG9jaXR5LlxyXG4gICAgY29uc3QgeFZlbCA9IE1hdGguY29zKCBpbmplY3Rpb25BbmdsZSApICogSU5KRUNURURfTU9MRUNVTEVfU1BFRUQ7XHJcbiAgICBjb25zdCB5VmVsID0gTWF0aC5zaW4oIGluamVjdGlvbkFuZ2xlICkgKiBJTkpFQ1RFRF9NT0xFQ1VMRV9TUEVFRDtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHJvdGF0aW9uYWwgdmVsb2NpdHkgdG8gYSByYW5kb20gdmFsdWUgd2l0aGluIGEgcmFuZ2UgKHdpbGwgYmUgaWdub3JlZCBmb3Igc2luZ2xlIGF0b20gY2FzZXMpLlxyXG4gICAgY29uc3QgbW9sZWN1bGVSb3RhdGlvblJhdGUgPSAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSAqICggTWF0aC5QSSAvIDQgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHBvc2l0aW9uKHMpIG9mIHRoZSBhdG9tKHMpLlxyXG4gICAgY29uc3QgYXRvbXNQZXJNb2xlY3VsZSA9IHRoaXMubW9sZWN1bGVEYXRhU2V0LmF0b21zUGVyTW9sZWN1bGU7XHJcbiAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uID0gdGhpcy5pbmplY3Rpb25Qb2ludC5jb3B5KCk7XHJcbiAgICBjb25zdCBtb2xlY3VsZVZlbG9jaXR5ID0gbmV3IFZlY3RvcjIoIHhWZWwsIHlWZWwgKTtcclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbnMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGF0b21zUGVyTW9sZWN1bGU7IGkrKyApIHtcclxuICAgICAgYXRvbVBvc2l0aW9uc1sgaSBdID0gVmVjdG9yMi5aRVJPO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgbmV3bHkgY3JlYXRlZCBtb2xlY3VsZSB0byB0aGUgZGF0YSBzZXQuXHJcbiAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5hZGRNb2xlY3VsZShcclxuICAgICAgYXRvbVBvc2l0aW9ucyxcclxuICAgICAgbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbixcclxuICAgICAgbW9sZWN1bGVWZWxvY2l0eSxcclxuICAgICAgbW9sZWN1bGVSb3RhdGlvblJhdGUsXHJcbiAgICAgIHRydWVcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCBhdG9tc1Blck1vbGVjdWxlID4gMSApIHtcclxuXHJcbiAgICAgIC8vIHJhbmRvbWl6ZSB0aGUgcm90YXRpb25hbCBhbmdsZSBvZiBtdWx0aS1hdG9tIG1vbGVjdWxlc1xyXG4gICAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZVJvdGF0aW9uQW5nbGVzWyB0aGlzLm1vbGVjdWxlRGF0YVNldC5nZXROdW1iZXJPZk1vbGVjdWxlcygpIC0gMSBdID1cclxuICAgICAgICBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMiAqIE1hdGguUEk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9zaXRpb24gdGhlIGF0b21zIHRoYXQgY29tcHJpc2UgdGhlIG1vbGVjdWxlcy5cclxuICAgIHRoaXMuYXRvbVBvc2l0aW9uVXBkYXRlci51cGRhdGVBdG9tUG9zaXRpb25zKCB0aGlzLm1vbGVjdWxlRGF0YVNldCApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgbm9uLW5vcm1hbGl6ZWQgYXRvbXNcclxuICAgIHRoaXMuYWRkQXRvbXNGb3JDdXJyZW50U3Vic3RhbmNlKCAxICk7XHJcblxyXG4gICAgdGhpcy5zeW5jQXRvbVBvc2l0aW9ucygpO1xyXG5cclxuICAgIHRoaXMubW9sZWN1bGVJbmplY3RlZFRoaXNTdGVwID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLm51bU1vbGVjdWxlc1F1ZXVlZEZvckluamVjdGlvblByb3BlcnR5LnNldCggdGhpcy5udW1Nb2xlY3VsZXNRdWV1ZWRGb3JJbmplY3Rpb25Qcm9wZXJ0eS52YWx1ZSAtIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFkZCBub24tbm9ybWFsaXplZCBhdG9tcyBmb3IgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgbW9sZWN1bGVzIG9mIHRoZSBjdXJyZW50IHN1YnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Nb2xlY3VsZXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZEF0b21zRm9yQ3VycmVudFN1YnN0YW5jZSggbnVtTW9sZWN1bGVzICkge1xyXG5cclxuICAgIF8udGltZXMoIG51bU1vbGVjdWxlcywgKCkgPT4ge1xyXG5cclxuICAgICAgc3dpdGNoKCB0aGlzLnN1YnN0YW5jZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuQVJHT046XHJcbiAgICAgICAgICB0aGlzLnNjYWxlZEF0b21zLnB1c2goIG5ldyBTY2FsZWRBdG9tKCBBdG9tVHlwZS5BUkdPTiwgMCwgMCApICk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLk5FT046XHJcbiAgICAgICAgICB0aGlzLnNjYWxlZEF0b21zLnB1c2goIG5ldyBTY2FsZWRBdG9tKCBBdG9tVHlwZS5ORU9OLCAwLCAwICkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuQURKVVNUQUJMRV9BVE9NOlxyXG4gICAgICAgICAgdGhpcy5zY2FsZWRBdG9tcy5wdXNoKCBuZXcgU2NhbGVkQXRvbSggQXRvbVR5cGUuQURKVVNUQUJMRSwgMCwgMCApICk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLkRJQVRPTUlDX09YWUdFTjpcclxuICAgICAgICAgIHRoaXMuc2NhbGVkQXRvbXMucHVzaCggbmV3IFNjYWxlZEF0b20oIEF0b21UeXBlLk9YWUdFTiwgMCwgMCApICk7XHJcbiAgICAgICAgICB0aGlzLnNjYWxlZEF0b21zLnB1c2goIG5ldyBTY2FsZWRBdG9tKCBBdG9tVHlwZS5PWFlHRU4sIDAsIDAgKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgU3Vic3RhbmNlVHlwZS5XQVRFUjpcclxuICAgICAgICAgIHRoaXMuc2NhbGVkQXRvbXMucHVzaCggbmV3IFNjYWxlZEF0b20oIEF0b21UeXBlLk9YWUdFTiwgMCwgMCApICk7XHJcbiAgICAgICAgICB0aGlzLnNjYWxlZEF0b21zLnB1c2goIG5ldyBIeWRyb2dlbkF0b20oIDAsIDAsIHRydWUgKSApO1xyXG4gICAgICAgICAgdGhpcy5zY2FsZWRBdG9tcy5wdXNoKCBuZXcgSHlkcm9nZW5BdG9tKCAwLCAwLCBkb3RSYW5kb20ubmV4dERvdWJsZSgpID4gMC41ICkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhpcy5zY2FsZWRBdG9tcy5wdXNoKCBuZXcgU2NhbGVkQXRvbSggQXRvbVR5cGUuTkVPTiwgMCwgMCApICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVtb3ZlQWxsQXRvbXMoKSB7XHJcblxyXG4gICAgLy8gR2V0IHJpZCBvZiBhbnkgZXhpc3RpbmcgYXRvbXMgZnJvbSB0aGUgbW9kZWwgc2V0LlxyXG4gICAgdGhpcy5zY2FsZWRBdG9tcy5jbGVhcigpO1xyXG5cclxuICAgIC8vIEdldCByaWQgb2YgdGhlIG5vcm1hbGl6ZWQgYXRvbXMgdG9vLlxyXG4gICAgdGhpcy5tb2xlY3VsZURhdGFTZXQgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZSB0aGUgbm9ybWFsaXplZCBhbmQgbm9uLW5vcm1hbGl6ZWQgZGF0YSBzZXRzIGJ5IGNhbGxpbmcgdGhlIGFwcHJvcHJpYXRlIGluaXRpYWxpemF0aW9uIHJvdXRpbmUsIHdoaWNoXHJcbiAgICogd2lsbCBzZXQgcG9zaXRpb25zLCB2ZWxvY2l0aWVzLCBldGMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBoYXNlIC0gcGhhc2Ugb2YgYXRvbXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZUF0b21zKCBwaGFzZSApIHtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBhdG9tcy5cclxuICAgIHN3aXRjaCggdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLkRJQVRPTUlDX09YWUdFTjpcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVEaWF0b21pYyggdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eS5nZXQoKSwgcGhhc2UgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLk5FT046XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTW9uYXRvbWljKCB0aGlzLnN1YnN0YW5jZVByb3BlcnR5LmdldCgpLCBwaGFzZSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuQVJHT046XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTW9uYXRvbWljKCB0aGlzLnN1YnN0YW5jZVByb3BlcnR5LmdldCgpLCBwaGFzZSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFN1YnN0YW5jZVR5cGUuQURKVVNUQUJMRV9BVE9NOlxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZU1vbmF0b21pYyggdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eS5nZXQoKSwgcGhhc2UgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBTdWJzdGFuY2VUeXBlLldBVEVSOlxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVRyaWF0b21pYyggdGhpcy5zdWJzdGFuY2VQcm9wZXJ0eS5nZXQoKSwgcGhhc2UgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICd1bnN1cHBvcnRlZCBzdWJzdGFuY2UnICk7IC8vIHNob3VsZCBuZXZlciBoYXBwZW4sIGRlYnVnIGlmIGl0IGRvZXNcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCBpbiBjYXNlIHdlIHdlcmUgc3dpdGNoaW5nIGZyb20gYW5vdGhlciBtb2xlY3VsZSB0aGF0IHdhcyB1bmRlciBwcmVzc3VyZS5cclxuICAgIHRoaXMudXBkYXRlUHJlc3N1cmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZU1vZGVsUGFyYW1ldGVycygpIHtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBzeXN0ZW0gcGFyYW1ldGVycy5cclxuICAgIHRoaXMuZ3Jhdml0YXRpb25hbEFjY2VsZXJhdGlvbiA9IE5PTUlOQUxfR1JBVklUQVRJT05BTF9BQ0NFTDtcclxuICAgIHRoaXMuaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVNldFBvaW50UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNFeHBsb2RlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWR1Y2UgdGhlIHVwd2FyZCBtb3Rpb24gb2YgdGhlIG1vbGVjdWxlcy4gIFRoaXMgaXMgZ2VuZXJhbGx5IGRvbmUgdG8gcmVkdWNlIHNvbWUgYmVoYXZpb3IgdGhhdCBpcyBzb21ldGltZXMgc2VlblxyXG4gICAqIHdoZXJlIHRoZSBtb2xlY3VsZXMgZmxvYXQgcmFwaWRseSB1cHdhcmRzIGFmdGVyIGJlaW5nIGhlYXRlZC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGRhbXBVcHdhcmRNb3Rpb24oIGR0ICkge1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCk7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLm1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZVZlbG9jaXRpZXNbIGkgXS55ID4gMCApIHtcclxuICAgICAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5tb2xlY3VsZVZlbG9jaXRpZXNbIGkgXS55ICo9IDEgLSAoIGR0ICogMC45ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgbm9ybWFsaXplZCBmdWxsLXNpemUgY29udGFpbmVyIGRpbWVuc2lvbnMgYmFzZWQgb24gdGhlIGN1cnJlbnQgcGFydGljbGUgZGlhbWV0ZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVOb3JtYWxpemVkQ29udGFpbmVyRGltZW5zaW9ucygpIHtcclxuICAgIHRoaXMubm9ybWFsaXplZENvbnRhaW5lcldpZHRoID0gQ09OVEFJTkVSX1dJRFRIIC8gdGhpcy5wYXJ0aWNsZURpYW1ldGVyO1xyXG5cclxuICAgIC8vIFRoZSBub24tbm9ybWFsaXplZCBoZWlnaHQgd2lsbCBrZWVwIGluY3JlYXNpbmcgYWZ0ZXIgdGhlIGNvbnRhaW5lciBleHBsb2Rlcywgc28gd2UgbmVlZCB0byBsaW1pdCBpdCBoZXJlLlxyXG4gICAgY29uc3Qgbm9uTm9ybWFsaXplZENvbnRhaW5lckhlaWdodCA9IE1hdGgubWluKCB0aGlzLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LnZhbHVlLCBDT05UQUlORVJfSU5JVElBTF9IRUlHSFQgKTtcclxuICAgIHRoaXMubm9ybWFsaXplZENvbnRhaW5lckhlaWdodCA9IG5vbk5vcm1hbGl6ZWRDb250YWluZXJIZWlnaHQgLyB0aGlzLnBhcnRpY2xlRGlhbWV0ZXI7XHJcbiAgICB0aGlzLm5vcm1hbGl6ZWRUb3RhbENvbnRhaW5lckhlaWdodCA9IG5vbk5vcm1hbGl6ZWRDb250YWluZXJIZWlnaHQgLyB0aGlzLnBhcnRpY2xlRGlhbWV0ZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIHRoZSBtb2RlbC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBkZWx0YSB0aW1lLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXBJblRpbWUoIGR0ICkge1xyXG5cclxuICAgIHRoaXMubW9sZWN1bGVJbmplY3RlZFRoaXNTdGVwID0gZmFsc2U7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBzaXplIG9mIHRoZSBjb250YWluZXIsIHdoaWNoIGNhbiBiZSBhZmZlY3RlZCBieSBleHBsb2Rpbmcgb3Igb3RoZXIgZXh0ZXJuYWwgZmFjdG9yc1xyXG4gICAgdGhpcy51cGRhdGVDb250YWluZXJTaXplKCBkdCApO1xyXG5cclxuICAgIC8vIFJlY29yZCB0aGUgcHJlc3N1cmUgdG8gc2VlIGlmIGl0IGNoYW5nZXMuXHJcbiAgICBjb25zdCBwcmVzc3VyZUJlZm9yZUFsZ29yaXRobSA9IHRoaXMuZ2V0TW9kZWxQcmVzc3VyZSgpO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgYW1vdW50IG9mIHRpbWUgdG8gYWR2YW5jZSB0aGUgcGFydGljbGUgZW5naW5lLiAgVGhpcyBpcyBiYXNlZCBwdXJlbHkgb24gYWVzdGhldGljcyAtIHdlIGxvb2tlZCBhdFxyXG4gICAgLy8gdGhlIHBhcnRpY2xlIG1vdGlvbiBhbmQgdHdlYWtlZCB0aGUgbXVsdGlwbGllciB1bnRpbCB3ZSBmZWx0IHRoYXQgaXQgbG9va2VkIGdvb2QuXHJcbiAgICBjb25zdCBwYXJ0aWNsZU1vdGlvbkFkdmFuY2VtZW50VGltZSA9IGR0ICogUEFSVElDTEVfU1BFRURfVVBfRkFDVE9SO1xyXG5cclxuICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIG1vZGVsIHN0ZXBzIGFuZCB0aGUgc2l6ZSBvZiB0aGUgdGltZSBzdGVwLlxyXG4gICAgbGV0IG51bVBhcnRpY2xlRW5naW5lU3RlcHMgPSAxO1xyXG4gICAgbGV0IHBhcnRpY2xlTW90aW9uVGltZVN0ZXA7XHJcbiAgICBpZiAoIHBhcnRpY2xlTW90aW9uQWR2YW5jZW1lbnRUaW1lID4gTUFYX1BBUlRJQ0xFX01PVElPTl9USU1FX1NURVAgKSB7XHJcbiAgICAgIHBhcnRpY2xlTW90aW9uVGltZVN0ZXAgPSBNQVhfUEFSVElDTEVfTU9USU9OX1RJTUVfU1RFUDtcclxuICAgICAgbnVtUGFydGljbGVFbmdpbmVTdGVwcyA9IE1hdGguZmxvb3IoIHBhcnRpY2xlTW90aW9uQWR2YW5jZW1lbnRUaW1lIC8gTUFYX1BBUlRJQ0xFX01PVElPTl9USU1FX1NURVAgKTtcclxuICAgICAgdGhpcy5yZXNpZHVhbFRpbWUgPSBwYXJ0aWNsZU1vdGlvbkFkdmFuY2VtZW50VGltZSAtICggbnVtUGFydGljbGVFbmdpbmVTdGVwcyAqIHBhcnRpY2xlTW90aW9uVGltZVN0ZXAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBwYXJ0aWNsZU1vdGlvblRpbWVTdGVwID0gcGFydGljbGVNb3Rpb25BZHZhbmNlbWVudFRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnJlc2lkdWFsVGltZSA+IHBhcnRpY2xlTW90aW9uVGltZVN0ZXAgKSB7XHJcbiAgICAgIG51bVBhcnRpY2xlRW5naW5lU3RlcHMrKztcclxuICAgICAgdGhpcy5yZXNpZHVhbFRpbWUgLT0gcGFydGljbGVNb3Rpb25UaW1lU3RlcDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbmplY3QgYSBuZXcgbW9sZWN1bGUgaWYgdGhlcmUgaXMgb25lIHJlYWR5IGFuZCBpdCBpc24ndCB0b28gc29vbiBhZnRlciBhIHByZXZpb3VzIGluamVjdGlvbi4gIFRoaXMgaXMgZG9uZVxyXG4gICAgLy8gYmVmb3JlIGV4ZWN1dGlvbiBvZiB0aGUgVmVybGV0IGFsZ29yaXRobSBzbyB0aGF0IGl0cyB2ZWxvY2l0eSB3aWxsIGJlIHRha2VuIGludG8gYWNjb3VudCB3aGVuIHRoZSB0ZW1wZXJhdHVyZVxyXG4gICAgLy8gaXMgY2FsY3VsYXRlZC5cclxuICAgIGlmICggdGhpcy5udW1Nb2xlY3VsZXNRdWV1ZWRGb3JJbmplY3Rpb25Qcm9wZXJ0eS52YWx1ZSA+IDAgJiYgdGhpcy5tb2xlY3VsZUluamVjdGlvbkhvbGRvZmZUaW1lciA9PT0gMCApIHtcclxuICAgICAgdGhpcy5pbmplY3RNb2xlY3VsZSgpO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlSW5qZWN0aW9uSG9sZG9mZlRpbWVyID0gTU9MRUNVTEVfSU5KRUNUSU9OX0hPTERPRkZfVElNRTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLm1vbGVjdWxlSW5qZWN0aW9uSG9sZG9mZlRpbWVyID4gMCApIHtcclxuICAgICAgdGhpcy5tb2xlY3VsZUluamVjdGlvbkhvbGRvZmZUaW1lciA9IE1hdGgubWF4KCB0aGlzLm1vbGVjdWxlSW5qZWN0aW9uSG9sZG9mZlRpbWVyIC0gZHQsIDAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBFeGVjdXRlIHRoZSBWZXJsZXQgYWxnb3JpdGhtLCBhLmsuYS4gdGhlIFwicGFydGljbGUgZW5naW5lXCIsIGluIG9yZGVyIHRvIGRldGVybWluZSB0aGUgbmV3IGF0b20gcG9zaXRpb25zLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtUGFydGljbGVFbmdpbmVTdGVwczsgaSsrICkge1xyXG4gICAgICB0aGlzLm1vbGVjdWxlRm9yY2VBbmRNb3Rpb25DYWxjdWxhdG9yLnVwZGF0ZUZvcmNlc0FuZE1vdGlvbiggcGFydGljbGVNb3Rpb25UaW1lU3RlcCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN5bmMgdXAgdGhlIHBvc2l0aW9ucyBvZiB0aGUgbm9ybWFsaXplZCBtb2xlY3VsZXMgKHRoZSBtb2xlY3VsZSBkYXRhIHNldCkgd2l0aCB0aGUgYXRvbXMgYmVpbmcgbW9uaXRvcmVkIGJ5IHRoZVxyXG4gICAgLy8gdmlldyAodGhlIG1vZGVsIGRhdGEgc2V0KS5cclxuICAgIHRoaXMuc3luY0F0b21Qb3NpdGlvbnMoKTtcclxuXHJcbiAgICAvLyBydW4gdGhlIHRoZXJtb3N0YXQgdG8ga2VlcCBwYXJ0aWNsZSBlbmVyZ2llcyBmcm9tIGdldHRpbmcgb3V0IG9mIGhhbmRcclxuICAgIHRoaXMucnVuVGhlcm1vc3RhdCgpO1xyXG5cclxuICAgIC8vIElmIHRoZSBwcmVzc3VyZSBjaGFuZ2VkLCB1cGRhdGUgaXQuXHJcbiAgICBpZiAoIHRoaXMuZ2V0TW9kZWxQcmVzc3VyZSgpICE9PSBwcmVzc3VyZUJlZm9yZUFsZ29yaXRobSApIHtcclxuICAgICAgdGhpcy51cGRhdGVQcmVzc3VyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkanVzdCB0aGUgdGVtcGVyYXR1cmUgc2V0IHBvaW50IGlmIG5lZWRlZC5cclxuICAgIGNvbnN0IGN1cnJlbnRUZW1wZXJhdHVyZSA9IHRoaXMudGVtcGVyYXR1cmVTZXRQb2ludFByb3BlcnR5LmdldCgpOyAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZVxyXG4gICAgaWYgKCB0aGlzLmhlYXRpbmdDb29saW5nQW1vdW50UHJvcGVydHkuZ2V0KCkgIT09IDAgKSB7XHJcblxyXG4gICAgICBsZXQgbmV3VGVtcGVyYXR1cmU7XHJcblxyXG4gICAgICBpZiAoIGN1cnJlbnRUZW1wZXJhdHVyZSA8IEFQUFJPQUNISU5HX0FCU09MVVRFX1pFUk9fVEVNUEVSQVRVUkUgJiZcclxuICAgICAgICAgICB0aGlzLmhlYXRpbmdDb29saW5nQW1vdW50UHJvcGVydHkuZ2V0KCkgPCAwICkge1xyXG5cclxuICAgICAgICAvLyBUaGUgdGVtcGVyYXR1cmUgYWRqdXN0cyBtb3JlIHNsb3dseSBhcyB3ZSBiZWdpbiB0byBhcHByb2FjaCBhYnNvbHV0ZSB6ZXJvIHNvIHRoYXQgYWxsIHRoZSBtb2xlY3VsZXMgaGF2ZVxyXG4gICAgICAgIC8vIHRpbWUgdG8gcmVhY2ggdGhlIGJvdHRvbSBvZiB0aGUgY29udGFpbmVyLiAgVGhpcyBpcyBub3QgbGluZWFyIC0gdGhlIHJhdGUgb2YgY2hhbmdlIHNsb3dzIGFzIHdlIGdldCBjbG9zZXIsXHJcbiAgICAgICAgLy8gdG8gemVybyBkZWdyZWVzIEtlbHZpbiwgd2hpY2ggaXMgc29tZXdoYXQgcmVhbCB3b3JsZC1pc2guXHJcbiAgICAgICAgY29uc3QgYWRqdXN0bWVudEZhY3RvciA9IE1hdGgucG93KFxyXG4gICAgICAgICAgY3VycmVudFRlbXBlcmF0dXJlIC8gQVBQUk9BQ0hJTkdfQUJTT0xVVEVfWkVST19URU1QRVJBVFVSRSxcclxuICAgICAgICAgIDEuMzUgLy8gZXhwb25lbnQgY2hvc2VuIGVtcGlyaWNhbGx5IHRvIGJlIGFzIHNtYWxsIGFzIHBvc3NpYmxlIGFuZCBzdGlsbCBnZXQgYWxsIG1vbGVjdWxlcyB0byBib3R0b20gYmVmb3JlIGFic29sdXRlIHplcm9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBuZXdUZW1wZXJhdHVyZSA9IGN1cnJlbnRUZW1wZXJhdHVyZSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYXRpbmdDb29saW5nQW1vdW50UHJvcGVydHkuZ2V0KCkgKiBURU1QRVJBVFVSRV9DSEFOR0VfUkFURSAqIGR0ICogYWRqdXN0bWVudEZhY3RvcjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCB0ZW1wZXJhdHVyZUNoYW5nZSA9IHRoaXMuaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eS5nZXQoKSAqIFRFTVBFUkFUVVJFX0NIQU5HRV9SQVRFICogZHQ7XHJcbiAgICAgICAgbmV3VGVtcGVyYXR1cmUgPSBNYXRoLm1pbiggY3VycmVudFRlbXBlcmF0dXJlICsgdGVtcGVyYXR1cmVDaGFuZ2UsIE1BWF9URU1QRVJBVFVSRSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQcmV2ZW50IHRoZSBzdWJzdGFuY2UgZnJvbSBmbG9hdGluZyB1cCB0b28gcmFwaWRseSB3aGVuIGhlYXRlZC5cclxuICAgICAgaWYgKCBjdXJyZW50VGVtcGVyYXR1cmUgPCBMSVFVSURfVEVNUEVSQVRVUkUgJiYgdGhpcy5oZWF0aW5nQ29vbGluZ0Ftb3VudFByb3BlcnR5LmdldCgpID4gMCApIHtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBpcyBuZWNlc3NhcnkgdG8gcHJldmVudCB0aGUgc3Vic3RhbmNlIGZyb20gZmxvYXRpbmcgdXAgd2hlbiBoZWF0ZWQgZnJvbSBhYnNvbHV0ZSB6ZXJvLlxyXG4gICAgICAgIHRoaXMuZGFtcFVwd2FyZE1vdGlvbiggZHQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSnVtcCB0byB0aGUgbWluaW11bSBtb2RlbCB0ZW1wZXJhdHVyZSBpZiB0aGUgc3Vic3RhbmNlIGhhcyByZWFjaGVkIGFic29sdXRlIHplcm8uXHJcbiAgICAgIGlmICggdGhpcy5oZWF0aW5nQ29vbGluZ0Ftb3VudFByb3BlcnR5LmdldCgpIDw9IDAgJiZcclxuICAgICAgICAgICB0aGlzLmdldFRlbXBlcmF0dXJlSW5LZWx2aW4oKSA9PT0gMCAmJlxyXG4gICAgICAgICAgIG5ld1RlbXBlcmF0dXJlID4gTUlOX1RFTVBFUkFUVVJFICkge1xyXG5cclxuICAgICAgICAvLyBBYnNvbHV0ZSB6ZXJvIGhhcyBiZWVuIHJlYWNoZWQgZm9yIHRoaXMgc3Vic3RhbmNlLiAgU2V0IHRoZSB0ZW1wZXJhdHVyZSB0byB0aGUgbWluaW11bSBhbGxvd2VkIHZhbHVlIHRvXHJcbiAgICAgICAgLy8gbWluaW1pemUgbW90aW9uIGluIHRoZSBtb2xlY3VsZXMuXHJcbiAgICAgICAgbmV3VGVtcGVyYXR1cmUgPSBNSU5fVEVNUEVSQVRVUkU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlY29yZCB0aGUgbmV3IHNldCBwb2ludFxyXG4gICAgICB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5zZXQoIG5ld1RlbXBlcmF0dXJlICk7XHJcbiAgICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQudGFyZ2V0VGVtcGVyYXR1cmUgPSBuZXdUZW1wZXJhdHVyZTtcclxuICAgICAgdGhpcy5hbmRlcnNlblRoZXJtb3N0YXQudGFyZ2V0VGVtcGVyYXR1cmUgPSBuZXdUZW1wZXJhdHVyZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICB1cGRhdGVDb250YWluZXJTaXplKCBkdCApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNFeHBsb2RlZFByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gVGhlIGxpZCBpcyBibG93aW5nIG9mZiB0aGUgY29udGFpbmVyIC0gaW5jcmVhc2UgdGhlIGNvbnRhaW5lciBzaXplIHVudGlsIHRoZSBsaWQgaXMgd2VsbCBvZmYgdGhlIHNjcmVlbi5cclxuICAgICAgdGhpcy5oZWlnaHRDaGFuZ2VUaGlzU3RlcCA9IFBPU1RfRVhQTE9TSU9OX0NPTlRBSU5FUl9FWFBBTlNJT05fUkFURSAqIGR0O1xyXG4gICAgICBpZiAoIHRoaXMuY29udGFpbmVySGVpZ2h0UHJvcGVydHkuZ2V0KCkgPCBDT05UQUlORVJfSU5JVElBTF9IRUlHSFQgKiAzICkge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVySGVpZ2h0UHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgdGhpcy5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5nZXQoKSArIFBPU1RfRVhQTE9TSU9OX0NPTlRBSU5FUl9FWFBBTlNJT05fUkFURSAqIGR0XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBubyBjaGFuZ2VzIHRvIHRoZSBoZWlnaHQgaW4gdGhpcyBzdGVwXHJcbiAgICAgIHRoaXMuaGVpZ2h0Q2hhbmdlVGhpc1N0ZXAgPSAwO1xyXG4gICAgICB0aGlzLm5vcm1hbGl6ZWRMaWRWZWxvY2l0eVkgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWFpbiBzdGVwIGZ1bmN0aW9uLCBjYWxsZWQgYnkgdGhlIFBoRVQgZnJhbWV3b3JrXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgaWYgKCB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICB0aGlzLnN0ZXBJblRpbWUoIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSdW4gdGhlIGFwcHJvcHJpYXRlIHRoZXJtb3N0YXQgYmFzZWQgb24gdGhlIHNldHRpbmdzIGFuZCB0aGUgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb24uICBUaGlzIHNlcnZlcyB0byBlaXRoZXJcclxuICAgKiBtYWludGFpbiB0aGUgcGFydGljbGUgbW90aW9ucyBpbiBhIHJhbmdlIHRoYXQgY29ycmVzcG9uZHMgdG8gYSBzdGVhZHkgdGVtcGVyYXR1cmUgb3IgdG8gaW5jcmVhc2Ugb3IgZGVjcmVhc2UgdGhlXHJcbiAgICogcGFydGljbGUgbW90aW9uIGlmIHRoZSB1c2VyIGlzIGhlYXRpbmcgb3IgY29vbGluZyB0aGUgc3Vic3RhbmNlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcnVuVGhlcm1vc3RhdCgpIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNFeHBsb2RlZFByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gRG9uJ3QgYm90aGVyIHRvIHJ1biBhbnkgdGhlcm1vc3RhdCBpZiB0aGUgbGlkIGlzIGJsb3duIG9mZiAtIGp1c3QgbGV0IHRob3NlIGxpdHRsZSBtb2xlY3VsZXMgcnVuIGZyZWUhXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYWxjdWxhdGVkVGVtcGVyYXR1cmUgPSB0aGlzLm1vbGVjdWxlRm9yY2VBbmRNb3Rpb25DYWxjdWxhdG9yLmNhbGN1bGF0ZWRUZW1wZXJhdHVyZTtcclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlU2V0UG9pbnQgPSB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGxldCB0ZW1wZXJhdHVyZUFkanVzdG1lbnROZWVkZWQgPSBmYWxzZTtcclxuICAgIGxldCB0aGVybW9zdGF0UnVuVGhpc1N0ZXAgPSBudWxsO1xyXG5cclxuICAgIGlmICggdGhpcy5oZWF0aW5nQ29vbGluZ0Ftb3VudFByb3BlcnR5LmdldCgpID4gMCAmJiBjYWxjdWxhdGVkVGVtcGVyYXR1cmUgPCB0ZW1wZXJhdHVyZVNldFBvaW50IHx8XHJcbiAgICAgICAgIHRoaXMuaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eS5nZXQoKSA8IDAgJiYgY2FsY3VsYXRlZFRlbXBlcmF0dXJlID4gdGVtcGVyYXR1cmVTZXRQb2ludCB8fFxyXG4gICAgICAgICBNYXRoLmFicyggY2FsY3VsYXRlZFRlbXBlcmF0dXJlIC0gdGVtcGVyYXR1cmVTZXRQb2ludCApID4gVEVNUEVSQVRVUkVfQ0xPU0VORVNTX1JBTkdFICkge1xyXG4gICAgICB0ZW1wZXJhdHVyZUFkanVzdG1lbnROZWVkZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5tb2xlY3VsZUluamVjdGVkVGhpc1N0ZXAgKSB7XHJcblxyXG4gICAgICAvLyBBIG1vbGVjdWxlIHdhcyBpbmplY3RlZCB0aGlzIHN0ZXAuICBCeSBkZXNpZ24sIG9ubHkgb25lIGNhbiBiZSBpbmplY3RlZCBpbiBhIHNpbmdsZSBzdGVwLCBzbyB3ZSB1c2UgdGhlXHJcbiAgICAgIC8vIGF0dHJpYnV0ZXMgb2YgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgbW9sZWN1bGUgdG8gZmlndXJlIG91dCBob3cgbXVjaCB0aGUgdGVtcGVyYXR1cmUgc2V0IHBvaW50IHNob3VsZCBiZVxyXG4gICAgICAvLyBhZGp1c3RlZC4gTm8gdGhlcm1vc3RhdCBpcyBydW4gb24gdGhpcyBzdGVwIC0gaXQgd2lsbCBraWNrIGluIG9uIHRoZSBuZXh0IHN0ZXAuXHJcbiAgICAgIGNvbnN0IG51bU1vbGVjdWxlcyA9IHRoaXMubW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCk7XHJcbiAgICAgIGNvbnN0IGluamVjdGVkUGFydGljbGVUZW1wZXJhdHVyZSA9ICggMiAvIDMgKSAqIHRoaXMubW9sZWN1bGVEYXRhU2V0LmdldE1vbGVjdWxlS2luZXRpY0VuZXJneSggbnVtTW9sZWN1bGVzIC0gMSApO1xyXG4gICAgICBjb25zdCBuZXdUZW1wZXJhdHVyZSA9IHRlbXBlcmF0dXJlU2V0UG9pbnQgKiAoIG51bU1vbGVjdWxlcyAtIDEgKSAvIG51bU1vbGVjdWxlcyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRQYXJ0aWNsZVRlbXBlcmF0dXJlIC8gbnVtTW9sZWN1bGVzO1xyXG4gICAgICB0aGlzLnNldFRlbXBlcmF0dXJlKCBuZXdUZW1wZXJhdHVyZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IubGlkQ2hhbmdlZFBhcnRpY2xlVmVsb2NpdHkgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgdmVsb2NpdHkgb2Ygb25lIG9yIG1vcmUgbW9sZWN1bGVzIHdhcyBjaGFuZ2VkIHRocm91Z2ggaW50ZXJhY3Rpb24gd2l0aCB0aGUgbGlkLiAgU2luY2UgdGhpcyBjYW4gY2hhbmdlXHJcbiAgICAgIC8vIHRoZSB0b3RhbCBraW5ldGljIGVuZXJneSBvZiB0aGUgbW9sZWN1bGVzIGluIHRoZSBzeXN0ZW0sIG5vIHRoZXJtb3N0YXQgaXMgcnVuLiAgSW5zdGVhZCwgdGhlIHRlbXBlcmF0dXJlIGlzXHJcbiAgICAgIC8vIGRldGVybWluZWQgYnkgbG9va2luZyBhdCB0aGUga2luZXRpYyBlbmVyZ3kgb2YgdGhlIG1vbGVjdWxlcywgYW5kIHRoYXQgdmFsdWUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG5ld1xyXG4gICAgICAvLyBzeXN0ZW0gdGVtcGVyYXR1cmUgc2V0IHBvaW50LiAgSG93ZXZlciwgc29tZXRpbWVzIHRoZSBjYWxjdWxhdGlvbiBjYW4gcmV0dXJuIHNvbWUgdW5leHBlY3RlZCByZXN1bHRzLFxyXG4gICAgICAvLyBwcm9iYWJseSBkdWUgdG8gc29tZSBvZiB0aGUgZW5lcmd5IGJlaW5nIHRpZWQgdXAgaW4gcG90ZW50aWFsIHJhdGhlciB0aGFuIGtpbmV0aWMgZW5lcmd5LCBzbyB0aGVyZSBhcmUgc29tZVxyXG4gICAgICAvLyBjb25zdHJhaW50cyBoZXJlLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N0YXRlcy1vZi1tYXR0ZXIvaXNzdWVzLzE2OSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgICAgaWYgKCB0aGlzLmhlaWdodENoYW5nZVRoaXNTdGVwID4gMCAmJiBjYWxjdWxhdGVkVGVtcGVyYXR1cmUgPCB0ZW1wZXJhdHVyZVNldFBvaW50IHx8XHJcbiAgICAgICAgICAgdGhpcy5oZWlnaHRDaGFuZ2VUaGlzU3RlcCA8IDAgJiYgY2FsY3VsYXRlZFRlbXBlcmF0dXJlID4gdGVtcGVyYXR1cmVTZXRQb2ludCApIHtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSB0YXJnZXQgdGVtcGVyYXR1cmUgdG8gdGhlIGNhbGN1bGF0ZWQgdmFsdWUgYWRqdXN0ZWQgYnkgdGhlIGF2ZXJhZ2UgZXJyb3IgdGhhdCBoYXMgYmVlbiByZWNvcmRlZC5cclxuICAgICAgICAvLyBUaGlzIGFkanVzdG1lbnQgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugb3RoZXJ3aXNlIGJpZywgb3Igc3RyYW5nZSwgdGVtcGVyYXR1cmUgY2hhbmdlcyBjYW4gb2NjdXIuXHJcbiAgICAgICAgdGhpcy5zZXRUZW1wZXJhdHVyZSggY2FsY3VsYXRlZFRlbXBlcmF0dXJlICsgdGhpcy5hdmVyYWdlVGVtcGVyYXR1cmVEaWZmZXJlbmNlLmF2ZXJhZ2UgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2xlYXIgdGhlIGZsYWcgZm9yIHRoZSBuZXh0IHRpbWUgdGhyb3VnaC5cclxuICAgICAgdGhpcy5tb2xlY3VsZUZvcmNlQW5kTW90aW9uQ2FsY3VsYXRvci5saWRDaGFuZ2VkUGFydGljbGVWZWxvY2l0eSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRlbXBlcmF0dXJlQWRqdXN0bWVudE5lZWRlZCB8fFxyXG4gICAgICAgICAgICAgIHRlbXBlcmF0dXJlU2V0UG9pbnQgPiBMSVFVSURfVEVNUEVSQVRVUkUgfHxcclxuICAgICAgICAgICAgICB0ZW1wZXJhdHVyZVNldFBvaW50IDwgU09MSURfVEVNUEVSQVRVUkUgLyA1ICkge1xyXG5cclxuICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgcnVuIG9mIHRoaXMgdGhlcm1vc3RhdCBpbiBhIHdoaWxlLCBjbGVhciBpdHMgYWNjdW11bGF0ZWQgYmlhc2VzXHJcbiAgICAgIGlmICggdGhpcy50aGVybW9zdGF0UnVuUHJldmlvdXNTdGVwICE9PSB0aGlzLmlzb0tpbmV0aWNUaGVybW9zdGF0ICkge1xyXG4gICAgICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQuY2xlYXJBY2N1bXVsYXRlZEJpYXMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXNlIHRoZSBpc29raW5ldGljIHRoZXJtb3N0YXQuXHJcbiAgICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQuYWRqdXN0VGVtcGVyYXR1cmUoIGNhbGN1bGF0ZWRUZW1wZXJhdHVyZSApO1xyXG4gICAgICB0aGVybW9zdGF0UnVuVGhpc1N0ZXAgPSB0aGlzLmlzb0tpbmV0aWNUaGVybW9zdGF0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoICF0ZW1wZXJhdHVyZUFkanVzdG1lbnROZWVkZWQgKSB7XHJcblxyXG4gICAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBydW4gb2YgdGhpcyB0aGVybW9zdGF0IGluIGEgd2hpbGUsIGNsZWFyIGl0cyBhY2N1bXVsYXRlZCBiaWFzZXNcclxuICAgICAgaWYgKCB0aGlzLnRoZXJtb3N0YXRSdW5QcmV2aW91c1N0ZXAgIT09IHRoaXMuYW5kZXJzZW5UaGVybW9zdGF0ICkge1xyXG4gICAgICAgIHRoaXMuYW5kZXJzZW5UaGVybW9zdGF0LmNsZWFyQWNjdW11bGF0ZWRCaWFzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRoZSB0ZW1wZXJhdHVyZSBpc24ndCBjaGFuZ2luZyBhbmQgaXQgaXMgd2l0aGluIGEgY2VydGFpbiByYW5nZSB3aGVyZSB0aGUgQW5kZXJzZW4gdGhlcm1vc3RhdCB3b3JrcyBiZXR0ZXIuXHJcbiAgICAgIC8vIFRoaXMgaXMgZG9uZSBmb3IgcHVyZWx5IHZpc3VhbCByZWFzb25zIC0gaXQgbG9va3MgYmV0dGVyIHRoYW4gdGhlIGlzb2tpbmV0aWMgaW4gdGhlc2UgY2lyY3Vtc3RhbmNlcy5cclxuICAgICAgdGhpcy5hbmRlcnNlblRoZXJtb3N0YXQuYWRqdXN0VGVtcGVyYXR1cmUoKTtcclxuICAgICAgdGhlcm1vc3RhdFJ1blRoaXNTdGVwID0gdGhpcy5hbmRlcnNlblRoZXJtb3N0YXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm90ZSB0aGF0IHRoZXJlIHdpbGwgYmUgc29tZSBjaXJjdW1zdGFuY2VzIGluIHdoaWNoIG5vIHRoZXJtb3N0YXQgaXMgcnVuLiAgVGhpcyBpcyBpbnRlbnRpb25hbC5cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGtlZXAgdHJhY2sgb2Ygd2hpY2ggdGhlcm1vc3RhdCB3YXMgcnVuIHNpbmNlIHRoaXMgaXMgdXNlZCBpbiBzb21lIGNhc2VzIHRvIHJlc2V0IHRoZXJtb3N0YXQgc3RhdGVcclxuICAgIHRoaXMudGhlcm1vc3RhdFJ1blByZXZpb3VzU3RlcCA9IHRoZXJtb3N0YXRSdW5UaGlzU3RlcDtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGF2ZXJhZ2UgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBzZXQgcG9pbnQgYW5kIHRoZSBjYWxjdWxhdGVkIHRlbXBlcmF0dXJlLCBidXQgb25seSBpZiBub3RoaW5nIGhhc1xyXG4gICAgLy8gaGFwcGVuZWQgdGhhdCBtYXkgaGF2ZSBhZmZlY3RlZCB0aGUgY2FsY3VsYXRlZCB2YWx1ZSBvciB0aGUgc2V0IHBvaW50LlxyXG4gICAgaWYgKCAhdGVtcGVyYXR1cmVBZGp1c3RtZW50TmVlZGVkICYmICF0aGlzLm1vbGVjdWxlSW5qZWN0ZWRUaGlzU3RlcCAmJiAhdGhpcy5saWRDaGFuZ2VkUGFydGljbGVWZWxvY2l0eSApIHtcclxuICAgICAgdGhpcy5hdmVyYWdlVGVtcGVyYXR1cmVEaWZmZXJlbmNlLmFkZFZhbHVlKCB0ZW1wZXJhdHVyZVNldFBvaW50IC0gY2FsY3VsYXRlZFRlbXBlcmF0dXJlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSB2YXJpb3VzIG1vZGVsIGNvbXBvbmVudHMgdG8gaGFuZGxlIGEgc2ltdWxhdGlvbiBpbiB3aGljaCBhbGwgdGhlIG1vbGVjdWxlcyBhcmUgc2luZ2xlIGF0b21zLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdWJzdGFuY2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGhhc2VcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGluaXRpYWxpemVEaWF0b21pYyggc3Vic3RhbmNlLCBwaGFzZSApIHtcclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCBhIHZhbGlkIG1vbGVjdWxlIElEIHdhcyBwcm92aWRlZC5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLkRJQVRPTUlDX09YWUdFTiApICk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgYXRvbXMvbW9sZWN1bGVzIHRvIGNyZWF0ZS4gIFRoaXMgd2lsbCBiZSBhIGN1YmUgKHJlYWxseSBhIHNxdWFyZSwgc2luY2UgaXQncyAyRCwgYnV0XHJcbiAgICAvLyB5b3UgZ2V0IHRoZSBpZGVhKSB0aGF0IHRha2VzIHVwIGEgZml4ZWQgYW1vdW50IG9mIHRoZSBib3R0b20gb2YgdGhlIGNvbnRhaW5lciwgc28gdGhlIG51bWJlciBvZiBtb2xlY3VsZXMgdGhhdFxyXG4gICAgLy8gY2FuIGZpdCBkZXBlbmRzIG9uIHRoZSBzaXplIG9mIHRoZSBpbmRpdmlkdWFsIGF0b20uXHJcbiAgICBsZXQgbnVtYmVyT2ZBdG9tcyA9IE1hdGgucG93KCBVdGlscy5yb3VuZFN5bW1ldHJpYyggQ09OVEFJTkVSX1dJRFRIIC8gKCAoIFNPTUNvbnN0YW50cy5PWFlHRU5fUkFESVVTICogMi4xICkgKiAzICkgKSwgMiApO1xyXG4gICAgaWYgKCBudW1iZXJPZkF0b21zICUgMiAhPT0gMCApIHtcclxuICAgICAgbnVtYmVyT2ZBdG9tcy0tO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbm9ybWFsaXplZCBkYXRhIHNldCBmb3IgdGhlIG9uZS1hdG9tLXBlci1tb2xlY3VsZSBjYXNlLlxyXG4gICAgdGhpcy5tb2xlY3VsZURhdGFTZXQgPSBuZXcgTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQoIDIgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHN0cmF0ZWdpZXMgdGhhdCB3aWxsIHdvcmsgb24gdGhpcyBkYXRhIHNldC5cclxuICAgIHRoaXMucGhhc2VTdGF0ZUNoYW5nZXIgPSBuZXcgRGlhdG9taWNQaGFzZVN0YXRlQ2hhbmdlciggdGhpcyApO1xyXG4gICAgdGhpcy5hdG9tUG9zaXRpb25VcGRhdGVyID0gRGlhdG9taWNBdG9tUG9zaXRpb25VcGRhdGVyO1xyXG4gICAgdGhpcy5tb2xlY3VsZUZvcmNlQW5kTW90aW9uQ2FsY3VsYXRvciA9IG5ldyBEaWF0b21pY1ZlcmxldEFsZ29yaXRobSggdGhpcyApO1xyXG4gICAgdGhpcy5pc29LaW5ldGljVGhlcm1vc3RhdCA9IG5ldyBJc29raW5ldGljVGhlcm1vc3RhdCggdGhpcy5tb2xlY3VsZURhdGFTZXQsIHRoaXMubWluTW9kZWxUZW1wZXJhdHVyZSApO1xyXG4gICAgdGhpcy5hbmRlcnNlblRoZXJtb3N0YXQgPSBuZXcgQW5kZXJzZW5UaGVybW9zdGF0KCB0aGlzLm1vbGVjdWxlRGF0YVNldCwgdGhpcy5taW5Nb2RlbFRlbXBlcmF0dXJlICk7XHJcblxyXG4gICAgY29uc3QgbnVtYmVyT2ZNb2xlY3VsZXMgPSBudW1iZXJPZkF0b21zIC8gMjtcclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbkluVmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbnMgPSBbXTtcclxuICAgIGF0b21Qb3NpdGlvbnNbIDAgXSA9IGF0b21Qb3NpdGlvbkluVmVjdG9yO1xyXG4gICAgYXRvbVBvc2l0aW9uc1sgMSBdID0gYXRvbVBvc2l0aW9uSW5WZWN0b3I7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBpbmRpdmlkdWFsIGF0b21zIGFuZCBhZGQgdGhlbSB0byB0aGUgZGF0YSBzZXQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZk1vbGVjdWxlczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBtb2xlY3VsZS5cclxuICAgICAgY29uc3QgbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICAgIGNvbnN0IG1vbGVjdWxlVmVsb2NpdHkgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBhdG9tIHRvIHRoZSBkYXRhIHNldC5cclxuICAgICAgdGhpcy5tb2xlY3VsZURhdGFTZXQuYWRkTW9sZWN1bGUoIGF0b21Qb3NpdGlvbnMsIG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb24sIG1vbGVjdWxlVmVsb2NpdHksIDAsIHRydWUgKTtcclxuXHJcbiAgICAgIC8vIEFkZCBhdG9tcyB0byBtb2RlbCBzZXQuXHJcbiAgICAgIHRoaXMuc2NhbGVkQXRvbXMucHVzaCggbmV3IFNjYWxlZEF0b20oIEF0b21UeXBlLk9YWUdFTiwgMCwgMCApICk7XHJcbiAgICAgIHRoaXMuc2NhbGVkQXRvbXMucHVzaCggbmV3IFNjYWxlZEF0b20oIEF0b21UeXBlLk9YWUdFTiwgMCwgMCApICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50YXJnZXROdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5LnNldCggdGhpcy5tb2xlY3VsZURhdGFTZXQubnVtYmVyT2ZNb2xlY3VsZXMgKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBhdG9tIHBvc2l0aW9ucyBhY2NvcmRpbmcgdGhlIHRvIHJlcXVlc3RlZCBwaGFzZS5cclxuICAgIHRoaXMuc2V0UGhhc2UoIHBoYXNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSB2YXJpb3VzIG1vZGVsIGNvbXBvbmVudHMgdG8gaGFuZGxlIGEgc2ltdWxhdGlvbiBpbiB3aGljaCBlYWNoIG1vbGVjdWxlIGNvbnNpc3RzIG9mIHRocmVlIGF0b21zLFxyXG4gICAqIGUuZy4gd2F0ZXIuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwaGFzZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZVRyaWF0b21pYyggc3Vic3RhbmNlLCBwaGFzZSApIHtcclxuXHJcbiAgICAvLyBPbmx5IHdhdGVyIGlzIHN1cHBvcnRlZCBzbyBmYXIuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5XQVRFUiApICk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgYXRvbXMvbW9sZWN1bGVzIHRvIGNyZWF0ZS4gIFRoaXMgd2lsbCBiZSBhIGN1YmUgKHJlYWxseSBhIHNxdWFyZSwgc2luY2UgaXQncyAyRCwgYnV0XHJcbiAgICAvLyB5b3UgZ2V0IHRoZSBpZGVhKSB0aGF0IHRha2VzIHVwIGEgZml4ZWQgYW1vdW50IG9mIHRoZSBib3R0b20gb2YgdGhlIGNvbnRhaW5lciwgc28gdGhlIG51bWJlciBvZiBtb2xlY3VsZXMgdGhhdFxyXG4gICAgLy8gY2FuIGZpdCBkZXBlbmRzIG9uIHRoZSBzaXplIG9mIHRoZSBpbmRpdmlkdWFsIGF0b20uXHJcbiAgICBjb25zdCB3YXRlck1vbGVjdWxlRGlhbWV0ZXIgPSBTT01Db25zdGFudHMuT1hZR0VOX1JBRElVUyAqIDIuMTtcclxuICAgIGNvbnN0IG1vbGVjdWxlc0Fjcm9zc0JvdHRvbSA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBDT05UQUlORVJfV0lEVEggLyAoIHdhdGVyTW9sZWN1bGVEaWFtZXRlciAqIDEuMiApICk7XHJcbiAgICBjb25zdCBudW1iZXJPZk1vbGVjdWxlcyA9IE1hdGgucG93KCBtb2xlY3VsZXNBY3Jvc3NCb3R0b20gLyAzLCAyICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBub3JtYWxpemVkIGRhdGEgc2V0IGZvciB0aGUgb25lLWF0b20tcGVyLW1vbGVjdWxlIGNhc2UuXHJcbiAgICB0aGlzLm1vbGVjdWxlRGF0YVNldCA9IG5ldyBNb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldCggMyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgc3RyYXRlZ2llcyB0aGF0IHdpbGwgd29yayBvbiB0aGlzIGRhdGEgc2V0LlxyXG4gICAgdGhpcy5waGFzZVN0YXRlQ2hhbmdlciA9IG5ldyBXYXRlclBoYXNlU3RhdGVDaGFuZ2VyKCB0aGlzICk7XHJcbiAgICB0aGlzLmF0b21Qb3NpdGlvblVwZGF0ZXIgPSBXYXRlckF0b21Qb3NpdGlvblVwZGF0ZXI7XHJcbiAgICB0aGlzLm1vbGVjdWxlRm9yY2VBbmRNb3Rpb25DYWxjdWxhdG9yID0gbmV3IFdhdGVyVmVybGV0QWxnb3JpdGhtKCB0aGlzICk7XHJcbiAgICB0aGlzLmlzb0tpbmV0aWNUaGVybW9zdGF0ID0gbmV3IElzb2tpbmV0aWNUaGVybW9zdGF0KCB0aGlzLm1vbGVjdWxlRGF0YVNldCwgdGhpcy5taW5Nb2RlbFRlbXBlcmF0dXJlICk7XHJcbiAgICB0aGlzLmFuZGVyc2VuVGhlcm1vc3RhdCA9IG5ldyBBbmRlcnNlblRoZXJtb3N0YXQoIHRoaXMubW9sZWN1bGVEYXRhU2V0LCB0aGlzLm1pbk1vZGVsVGVtcGVyYXR1cmUgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGluZGl2aWR1YWwgYXRvbXMgYW5kIGFkZCB0aGVtIHRvIHRoZSBkYXRhIHNldC5cclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbkluVmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbnMgPSBbXTtcclxuICAgIGF0b21Qb3NpdGlvbnNbIDAgXSA9IGF0b21Qb3NpdGlvbkluVmVjdG9yO1xyXG4gICAgYXRvbVBvc2l0aW9uc1sgMSBdID0gYXRvbVBvc2l0aW9uSW5WZWN0b3I7XHJcbiAgICBhdG9tUG9zaXRpb25zWyAyIF0gPSBhdG9tUG9zaXRpb25JblZlY3RvcjtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mTW9sZWN1bGVzOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGhlIG1vbGVjdWxlLlxyXG4gICAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgICAgY29uc3QgbW9sZWN1bGVWZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGF0b20gdG8gdGhlIGRhdGEgc2V0LlxyXG4gICAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5hZGRNb2xlY3VsZSggYXRvbVBvc2l0aW9ucywgbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbiwgbW9sZWN1bGVWZWxvY2l0eSwgMCwgdHJ1ZSApO1xyXG5cclxuICAgICAgLy8gQWRkIGF0b21zIHRvIG1vZGVsIHNldC5cclxuICAgICAgdGhpcy5zY2FsZWRBdG9tcy5wdXNoKCBuZXcgU2NhbGVkQXRvbSggQXRvbVR5cGUuT1hZR0VOLCAwLCAwICkgKTtcclxuICAgICAgdGhpcy5zY2FsZWRBdG9tcy5wdXNoKCBuZXcgSHlkcm9nZW5BdG9tKCAwLCAwLCB0cnVlICkgKTtcclxuXHJcbiAgICAgIC8vIEluIG9yZGVyIHRvIGxvb2sgbW9yZSB2YXJpZWQsIHNvbWUgb2YgdGhlIGh5ZHJvZ2VuIGF0b21zIGFyZSBzZXQgdXAgdG8gcmVuZGVyIGJlaGluZCB0aGUgb3h5Z2VuIGF0b20gYW5kXHJcbiAgICAgIC8vIHNvbWUgdG8gcmVuZGVyIGluIGZyb250IG9mIGl0LlxyXG4gICAgICB0aGlzLnNjYWxlZEF0b21zLnB1c2goIG5ldyBIeWRyb2dlbkF0b20oIDAsIDAsICggaSAlIDIgPT09IDAgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50YXJnZXROdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5LnNldCggdGhpcy5tb2xlY3VsZURhdGFTZXQubnVtYmVyT2ZNb2xlY3VsZXMgKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIHRoZSBhdG9tIHBvc2l0aW9ucyBhY2NvcmRpbmcgdGhlIHRvIHJlcXVlc3RlZCBwaGFzZS5cclxuICAgIHRoaXMuc2V0UGhhc2UoIHBoYXNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSB2YXJpb3VzIG1vZGVsIGNvbXBvbmVudHMgdG8gaGFuZGxlIGEgc2ltdWxhdGlvbiBpbiB3aGljaCBhbGwgdGhlIG1vbGVjdWxlcyBhcmUgc2luZ2xlIGF0b21zLlxyXG4gICAqIEBwYXJhbSB7U3Vic3RhbmNlVHlwZX0gc3Vic3RhbmNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBoYXNlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpbml0aWFsaXplTW9uYXRvbWljKCBzdWJzdGFuY2UsIHBoYXNlICkge1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGF0IGEgdmFsaWQgbW9sZWN1bGUgSUQgd2FzIHByb3ZpZGVkLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLkFESlVTVEFCTEVfQVRPTSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLk5FT04gfHxcclxuICAgICAgICAgICAgICAgICAgICAgIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5BUkdPTiApO1xyXG5cclxuICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGF0b21zL21vbGVjdWxlcyB0byBjcmVhdGUuICBUaGlzIHdpbGwgYmUgYSBjdWJlIChyZWFsbHkgYSBzcXVhcmUsIHNpbmNlIGl0J3MgMkQsIGJ1dFxyXG4gICAgLy8geW91IGdldCB0aGUgaWRlYSkgdGhhdCB0YWtlcyB1cCBhIGZpeGVkIGFtb3VudCBvZiB0aGUgYm90dG9tIG9mIHRoZSBjb250YWluZXIsIHNvIHRoZSBudW1iZXIgb2YgbW9sZWN1bGVzIHRoYXRcclxuICAgIC8vIGNhbiBmaXQgZGVwZW5kcyBvbiB0aGUgc2l6ZSBvZiB0aGUgaW5kaXZpZHVhbC5cclxuICAgIGxldCBwYXJ0aWNsZURpYW1ldGVyO1xyXG4gICAgaWYgKCBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuTkVPTiApIHtcclxuICAgICAgcGFydGljbGVEaWFtZXRlciA9IFNPTUNvbnN0YW50cy5ORU9OX1JBRElVUyAqIDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLkFSR09OICkge1xyXG4gICAgICBwYXJ0aWNsZURpYW1ldGVyID0gU09NQ29uc3RhbnRzLkFSR09OX1JBRElVUyAqIDI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLkFESlVTVEFCTEVfQVRPTSApIHtcclxuICAgICAgcGFydGljbGVEaWFtZXRlciA9IFNPTUNvbnN0YW50cy5BREpVU1RBQkxFX0FUVFJBQ1RJT05fREVGQVVMVF9SQURJVVMgKiAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBGb3JjZSBpdCB0byBuZW9uLlxyXG4gICAgICBzdWJzdGFuY2UgPSBTdWJzdGFuY2VUeXBlLk5FT047XHJcbiAgICAgIHBhcnRpY2xlRGlhbWV0ZXIgPSBTT01Db25zdGFudHMuTkVPTl9SQURJVVMgKiAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdGhlIG51bWJlciBvZiBhdG9tcyBhc3N1bWluZyB0aGF0IHRoZSBzb2xpZCBmb3JtLCB3aGVuIG1hZGUgaW50byBhIHNxdWFyZSwgd2lsbCBjb25zdW1lIGFib3V0IDEvM1xyXG4gICAgLy8gdGhlIHdpZHRoIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICBjb25zdCBudW1iZXJPZkF0b21zID0gTWF0aC5wb3coIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBDT05UQUlORVJfV0lEVEggLyAoICggcGFydGljbGVEaWFtZXRlciAqIDEuMDUgKSAqIDMgKSApLCAyICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBub3JtYWxpemVkIGRhdGEgc2V0IGZvciB0aGUgb25lLWF0b20tcGVyLW1vbGVjdWxlIGNhc2UuXHJcbiAgICB0aGlzLm1vbGVjdWxlRGF0YVNldCA9IG5ldyBNb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldCggMSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgc3RyYXRlZ2llcyB0aGF0IHdpbGwgd29yayBvbiB0aGlzIGRhdGEgc2V0LlxyXG4gICAgdGhpcy5waGFzZVN0YXRlQ2hhbmdlciA9IG5ldyBNb25hdG9taWNQaGFzZVN0YXRlQ2hhbmdlciggdGhpcyApO1xyXG4gICAgdGhpcy5hdG9tUG9zaXRpb25VcGRhdGVyID0gTW9uYXRvbWljQXRvbVBvc2l0aW9uVXBkYXRlcjtcclxuICAgIHRoaXMubW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IgPSBuZXcgTW9uYXRvbWljVmVybGV0QWxnb3JpdGhtKCB0aGlzICk7XHJcbiAgICB0aGlzLmlzb0tpbmV0aWNUaGVybW9zdGF0ID0gbmV3IElzb2tpbmV0aWNUaGVybW9zdGF0KCB0aGlzLm1vbGVjdWxlRGF0YVNldCwgdGhpcy5taW5Nb2RlbFRlbXBlcmF0dXJlICk7XHJcbiAgICB0aGlzLmFuZGVyc2VuVGhlcm1vc3RhdCA9IG5ldyBBbmRlcnNlblRoZXJtb3N0YXQoIHRoaXMubW9sZWN1bGVEYXRhU2V0LCB0aGlzLm1pbk1vZGVsVGVtcGVyYXR1cmUgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGluZGl2aWR1YWwgYXRvbXMgYW5kIGFkZCB0aGVtIHRvIHRoZSBkYXRhIHNldC5cclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbnMgPSBbXTtcclxuICAgIGF0b21Qb3NpdGlvbnMucHVzaCggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZBdG9tczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBhdG9tLlxyXG4gICAgICBjb25zdCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgICAgY29uc3QgbW9sZWN1bGVWZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICAgIC8vIEFkZCB0aGUgYXRvbSB0byB0aGUgZGF0YSBzZXQuXHJcbiAgICAgIHRoaXMubW9sZWN1bGVEYXRhU2V0LmFkZE1vbGVjdWxlKCBhdG9tUG9zaXRpb25zLCBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uLCBtb2xlY3VsZVZlbG9jaXR5LCAwLCB0cnVlICk7XHJcblxyXG4gICAgICAvLyBBZGQgYXRvbSB0byBtb2RlbCBzZXQuXHJcbiAgICAgIGxldCBhdG9tO1xyXG4gICAgICBpZiAoIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5ORU9OICkge1xyXG4gICAgICAgIGF0b20gPSBuZXcgU2NhbGVkQXRvbSggQXRvbVR5cGUuTkVPTiwgMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuQVJHT04gKSB7XHJcbiAgICAgICAgYXRvbSA9IG5ldyBTY2FsZWRBdG9tKCBBdG9tVHlwZS5BUkdPTiwgMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuQURKVVNUQUJMRV9BVE9NICkge1xyXG4gICAgICAgIGF0b20gPSBuZXcgU2NhbGVkQXRvbSggQXRvbVR5cGUuQURKVVNUQUJMRSwgMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGF0b20gPSBuZXcgU2NhbGVkQXRvbSggQXRvbVR5cGUuTkVPTiwgMCwgMCApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuc2NhbGVkQXRvbXMucHVzaCggYXRvbSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eS5zZXQoIHRoaXMubW9sZWN1bGVEYXRhU2V0Lm51bWJlck9mTW9sZWN1bGVzICk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgYXRvbSBwb3NpdGlvbnMgYWNjb3JkaW5nIHRoZSB0byByZXF1ZXN0ZWQgcGhhc2UuXHJcbiAgICB0aGlzLnNldFBoYXNlKCBwaGFzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBwb3NpdGlvbnMgb2YgdGhlIG5vbi1ub3JtYWxpemVkIG1vbGVjdWxlcyBiYXNlZCBvbiB0aGUgcG9zaXRpb25zIG9mIHRoZSBub3JtYWxpemVkIG9uZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzeW5jQXRvbVBvc2l0aW9ucygpIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1vbGVjdWxlRGF0YVNldC5udW1iZXJPZkF0b21zID09PSB0aGlzLnNjYWxlZEF0b21zLmxlbmd0aCxcclxuICAgICAgYEluY29uc2lzdGVudCBudW1iZXIgb2Ygbm9ybWFsaXplZCB2ZXJzdXMgbm9uLW5vcm1hbGl6ZWQgYXRvbXMsICR7XHJcbiAgICAgICAgdGhpcy5tb2xlY3VsZURhdGFTZXQubnVtYmVyT2ZBdG9tc30sICR7dGhpcy5zY2FsZWRBdG9tcy5sZW5ndGh9YFxyXG4gICAgKTtcclxuICAgIGNvbnN0IHBvc2l0aW9uTXVsdGlwbGllciA9IHRoaXMucGFydGljbGVEaWFtZXRlcjtcclxuICAgIGNvbnN0IGF0b21Qb3NpdGlvbnMgPSB0aGlzLm1vbGVjdWxlRGF0YVNldC5hdG9tUG9zaXRpb25zO1xyXG5cclxuICAgIC8vIHVzZSBhIEMtc3R5bGUgbG9vcCBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zY2FsZWRBdG9tcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5zY2FsZWRBdG9tcy5nZXQoIGkgKS5zZXRQb3NpdGlvbihcclxuICAgICAgICBhdG9tUG9zaXRpb25zWyBpIF0ueCAqIHBvc2l0aW9uTXVsdGlwbGllcixcclxuICAgICAgICBhdG9tUG9zaXRpb25zWyBpIF0ueSAqIHBvc2l0aW9uTXVsdGlwbGllclxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZSB0aGUgaW50ZXJuYWwgcHJlc3N1cmUgdmFsdWUgYW5kIGNvbnZlcnQgaXQgdG8gYXRtb3NwaGVyZXMuICBJbiB0aGUgb3JpZ2luYWwgSmF2YSB2ZXJzaW9uIG9mIHRoaXMgc2ltIHRoZVxyXG4gICAqIGNvbnZlcnNpb24gbXVsdGlwbGllciB3YXMgZGVwZW5kZW50IHVwb24gdGhlIHR5cGUgb2YgbW9sZWN1bGUgaW4gb3JkZXIgdG8gYmUgc29tZXdoYXQgcmVhbGlzdGljLiAgSG93ZXZlciwgdGhpc1xyXG4gICAqIHdhcyBwcm9ibGVtYXRpYywgc2luY2UgaXQgd291bGQgY2F1c2UgdGhlIGNvbnRhaW5lciB0byBleHBsb2RlIGF0IGRpZmZlcmVudCBwcmVzc3VyZSByZWFkaW5ncy4gIEEgc2luZ2xlXHJcbiAgICogbXVsdGlwbGllciBpcyBub3cgdXNlZCwgd2hpY2ggaXMgcGVyaGFwcyBsZXNzIHJlYWxpc3RpYywgYnV0IHdvcmtzIGJldHRlciBpbiBwcmFjdGljZS4gIFBsZWFzZSBzZWVcclxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3RhdGVzLW9mLW1hdHRlci9pc3N1ZXMvMTI0IGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFByZXNzdXJlSW5BdG1vc3BoZXJlcygpIHtcclxuICAgIHJldHVybiA1ICogdGhpcy5nZXRNb2RlbFByZXNzdXJlKCk7IC8vIG11bHRpcGxpZXIgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGEgcGhhc2UgdmFsdWUgYmFzZWQgb24gdGhlIGN1cnJlbnQgdGVtcGVyYXR1cmUuXHJcbiAgICogQHJldHVybntudW1iZXJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtYXBUZW1wZXJhdHVyZVRvUGhhc2UoKSB7XHJcbiAgICBsZXQgcGhhc2U7XHJcbiAgICBpZiAoIHRoaXMudGVtcGVyYXR1cmVTZXRQb2ludFByb3BlcnR5LmdldCgpIDwgU09MSURfVEVNUEVSQVRVUkUgKyAoICggTElRVUlEX1RFTVBFUkFUVVJFIC0gU09MSURfVEVNUEVSQVRVUkUgKSAvIDIgKSApIHtcclxuICAgICAgcGhhc2UgPSBQaGFzZVN0YXRlRW51bS5TT0xJRDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eS5nZXQoKSA8IExJUVVJRF9URU1QRVJBVFVSRSArICggKCBHQVNfVEVNUEVSQVRVUkUgLSBMSVFVSURfVEVNUEVSQVRVUkUgKSAvIDIgKSApIHtcclxuICAgICAgcGhhc2UgPSBQaGFzZVN0YXRlRW51bS5MSVFVSUQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcGhhc2UgPSBQaGFzZVN0YXRlRW51bS5HQVM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBoYXNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBmb3IgYW4gZXh0ZXJuYWwgZW50aXR5IHRvIG5vdGlmeSB0aGUgbW9kZWwgdGhhdCBpdCBzaG91bGQgZXhwbG9kZS5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRXhwbG9kZWRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0Q29udGFpbmVyRXhwbG9kZWQoIGlzRXhwbG9kZWQgKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNFeHBsb2RlZFByb3BlcnR5LmdldCgpICE9PSBpc0V4cGxvZGVkICkge1xyXG4gICAgICB0aGlzLmlzRXhwbG9kZWRQcm9wZXJ0eS5zZXQoIGlzRXhwbG9kZWQgKTtcclxuICAgICAgaWYgKCAhaXNFeHBsb2RlZCApIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0aGUgbGlkIHRvIHRoZSBjb250YWluZXIuICBJdCBvbmx5IG1ha2VzIHNlbnNlIHRvIGNhbGwgdGhpcyBhZnRlciB0aGUgY29udGFpbmVyIGhhcyBleHBsb2RlZCwgb3RoZXJ3aXNlIGl0XHJcbiAgICogaGFzIG5vIGVmZmVjdC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmV0dXJuTGlkKCkge1xyXG5cclxuICAgIC8vIHN0YXRlIGNoZWNraW5nXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzRXhwbG9kZWRQcm9wZXJ0eS5nZXQoKSwgJ2F0dGVtcHQgdG8gcmV0dXJuIGxpZCB3aGVuIGNvbnRhaW5lciBoYWRuXFwndCBleHBsb2RlZCcgKTtcclxuICAgIGlmICggIXRoaXMuaXNFeHBsb2RlZFByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gaWdub3JlIHJlcXVlc3QgaWYgY29udGFpbmVyIGhhc24ndCBleHBsb2RlZFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFueSBtb2xlY3VsZXMgdGhhdCBhcmUgb3V0c2lkZSBvZiB0aGUgY29udGFpbmVyLiAgV2Ugd29yayB3aXRoIHRoZSBub3JtYWxpemVkIG1vbGVjdWxlcy9hdG9tcyBmb3IgdGhpcy5cclxuICAgIGxldCBudW1Nb2xlY3VsZXNPdXRzaWRlQ29udGFpbmVyID0gMDtcclxuICAgIGxldCBmaXJzdE91dHNpZGVNb2xlY3VsZUluZGV4O1xyXG4gICAgZG8ge1xyXG4gICAgICBmb3IgKCBmaXJzdE91dHNpZGVNb2xlY3VsZUluZGV4ID0gMDsgZmlyc3RPdXRzaWRlTW9sZWN1bGVJbmRleCA8IHRoaXMubW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCk7XHJcbiAgICAgICAgICAgIGZpcnN0T3V0c2lkZU1vbGVjdWxlSW5kZXgrKyApIHtcclxuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLm1vbGVjdWxlRGF0YVNldC5nZXRNb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucygpWyBmaXJzdE91dHNpZGVNb2xlY3VsZUluZGV4IF07XHJcbiAgICAgICAgaWYgKCBwb3MueCA8IDAgfHxcclxuICAgICAgICAgICAgIHBvcy54ID4gdGhpcy5ub3JtYWxpemVkQ29udGFpbmVyV2lkdGggfHxcclxuICAgICAgICAgICAgIHBvcy55IDwgMCB8fFxyXG4gICAgICAgICAgICAgcG9zLnkgPiBDT05UQUlORVJfSU5JVElBTF9IRUlHSFQgLyB0aGlzLnBhcnRpY2xlRGlhbWV0ZXIgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhpcyBtb2xlY3VsZSBpcyBvdXRzaWRlIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBmaXJzdE91dHNpZGVNb2xlY3VsZUluZGV4IDwgdGhpcy5tb2xlY3VsZURhdGFTZXQuZ2V0TnVtYmVyT2ZNb2xlY3VsZXMoKSApIHtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBtb2xlY3VsZSB0aGF0IHdhcyBmb3VuZC5cclxuICAgICAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5yZW1vdmVNb2xlY3VsZSggZmlyc3RPdXRzaWRlTW9sZWN1bGVJbmRleCApO1xyXG4gICAgICAgIG51bU1vbGVjdWxlc091dHNpZGVDb250YWluZXIrKztcclxuICAgICAgfVxyXG4gICAgfSB3aGlsZSAoIGZpcnN0T3V0c2lkZU1vbGVjdWxlSW5kZXggIT09IHRoaXMubW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCkgKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgZW5vdWdoIG9mIHRoZSBub24tbm9ybWFsaXplZCBtb2xlY3VsZXMgc28gdGhhdCB3ZSBoYXZlIHRoZSBzYW1lIG51bWJlciBhcyB0aGUgbm9ybWFsaXplZC4gIFRoZXkgZG9uJ3RcclxuICAgIC8vIGhhdmUgdG8gYmUgdGhlIHNhbWUgYXRvbXMgc2luY2UgdGhlIG5vcm1hbGl6ZWQgYW5kIG5vbi1ub3JtYWxpemVkIGF0b21zIGFyZSBleHBsaWNpdGx5IHN5bmNlZCB1cCBkdXJpbmcgZWFjaFxyXG4gICAgLy8gbW9kZWwgc3RlcC5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bU1vbGVjdWxlc091dHNpZGVDb250YWluZXIgKiB0aGlzLm1vbGVjdWxlRGF0YVNldC5nZXRBdG9tc1Blck1vbGVjdWxlKCk7IGkrKyApIHtcclxuICAgICAgdGhpcy5zY2FsZWRBdG9tcy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgdGhlIGNvbnRhaW5lciB0byBiZSB1bmV4cGxvZGVkLlxyXG4gICAgdGhpcy5zZXRDb250YWluZXJFeHBsb2RlZCggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHBoYXNlIHRvIGJlIGdhcywgc2luY2Ugb3RoZXJ3aXNlIHRoZSBleHRyZW1lbHkgaGlnaCBraW5ldGljIGVuZXJneSBvZiB0aGUgbW9sZWN1bGVzIGNhdXNlcyBhblxyXG4gICAgLy8gdW5yZWFzb25hYmx5IGhpZ2ggdGVtcGVyYXR1cmUgZm9yIHRoZSBtb2xlY3VsZXMgdGhhdCByZW1haW4gaW4gdGhlIGNvbnRhaW5lci4gRG9pbmcgdGhpcyBnZW5lcmFsbHkgY29vbHMgdGhlbVxyXG4gICAgLy8gZG93biBpbnRvIGEgbW9yZSBtYW5hZ2VhYmxlIHN0YXRlLlxyXG4gICAgaWYgKCBudW1Nb2xlY3VsZXNPdXRzaWRlQ29udGFpbmVyID4gMCAmJiB0aGlzLm1vbGVjdWxlRm9yY2VBbmRNb3Rpb25DYWxjdWxhdG9yLmNhbGN1bGF0ZWRUZW1wZXJhdHVyZSA+IEdBU19URU1QRVJBVFVSRSApIHtcclxuICAgICAgdGhpcy5waGFzZVN0YXRlQ2hhbmdlci5zZXRQaGFzZSggUGhhc2VTdGF0ZUVudW0uR0FTICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3luYyB1cCB0aGUgcHJvcGVydHkgdGhhdCB0cmFja3MgdGhlIG51bWJlciBvZiBtb2xlY3VsZXMgLSBtb3N0bHkgZm9yIHRoZSBwdXJwb3NlcyBvZiBpbmplY3RpbmcgbmV3IG1vbGVjdWxlcyAtXHJcbiAgICAvLyB3aXRoIHRoZSBuZXcgdmFsdWUuXHJcbiAgICB0aGlzLnRhcmdldE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHkuc2V0KCB0aGlzLm1vbGVjdWxlRGF0YVNldC5udW1iZXJPZk1vbGVjdWxlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2VyaWFsaXplIHRoaXMgaW5zdGFuY2UgZm9yIHBoZXQtaW9cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG4gICAqIEBwdWJsaWMgLSBmb3IgcGhldC1pbyBzdXBwb3J0IG9ubHlcclxuICAgKi9cclxuICB0b1N0YXRlT2JqZWN0KCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgX3N1YnN0YW5jZTogRW51bWVyYXRpb25JTyggU3Vic3RhbmNlVHlwZSApLnRvU3RhdGVPYmplY3QoIHRoaXMuc3Vic3RhbmNlUHJvcGVydHkudmFsdWUgKSxcclxuICAgICAgX2lzRXhwbG9kZWQ6IHRoaXMuaXNFeHBsb2RlZFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBfY29udGFpbmVySGVpZ2h0OiB0aGlzLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBfZ3Jhdml0YXRpb25hbEFjY2VsZXJhdGlvbjogdGhpcy5ncmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uLFxyXG4gICAgICBfbm9ybWFsaXplZExpZFZlbG9jaXR5WTogdGhpcy5ub3JtYWxpemVkTGlkVmVsb2NpdHlZLFxyXG4gICAgICBfaGVhdGluZ0Nvb2xpbmdBbW91bnQ6IHRoaXMuaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgX21vbGVjdWxlRGF0YVNldDogTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQuTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXRJTy50b1N0YXRlT2JqZWN0KCB0aGlzLm1vbGVjdWxlRGF0YVNldCApLFxyXG4gICAgICBfaXNvS2luZXRpY1RoZXJtb3N0YXRTdGF0ZTogdGhpcy5pc29LaW5ldGljVGhlcm1vc3RhdC50b1N0YXRlT2JqZWN0KCksXHJcbiAgICAgIF9hbmRlcnNlblRoZXJtb3N0YXRTdGF0ZTogdGhpcy5hbmRlcnNlblRoZXJtb3N0YXQudG9TdGF0ZU9iamVjdCgpLFxyXG4gICAgICBfbW9sZWN1bGVGb3JjZXNBbmRNb3Rpb25DYWxjdWxhdG9yUHJlc3N1cmU6IHRoaXMubW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IucHJlc3N1cmVQcm9wZXJ0eS52YWx1ZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgc3RhdGUgb2YgdGhpcyBpbnN0YW5jZSBmb3IgcGhldC1pb1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZU9iamVjdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBhcHBseVN0YXRlKCBzdGF0ZU9iamVjdCApIHtcclxuICAgIHJlcXVpcmVkKCBzdGF0ZU9iamVjdCApO1xyXG5cclxuICAgIC8vIFNldHRpbmcgdGhlIHN1YnN0YW5jZSBpbml0aWFsaXplcyBhIGJ1bmNoIG9mIG1vZGVsIHBhcmFtZXRlcnMsIHNvIHRoaXMgaXMgZG9uZSBmaXJzdCwgdGhlbiBvdGhlciBpdGVtcyB0aGF0IG1heVxyXG4gICAgLy8gaGF2ZSBiZWVuIGFmZmVjdGVkIGFyZSBzZXQuXHJcbiAgICB0aGlzLnN1YnN0YW5jZVByb3BlcnR5LnNldCggRW51bWVyYXRpb25JTyggU3Vic3RhbmNlVHlwZSApLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuX3N1YnN0YW5jZSApICk7XHJcblxyXG4gICAgLy8gU2V0IHByb3BlcnRpZXMgdGhhdCBtYXkgaGF2ZSBiZWVuIHVwZGF0ZWQgYnkgc2V0dGluZyB0aGUgc3Vic3RhbmNlLlxyXG4gICAgdGhpcy5pc0V4cGxvZGVkUHJvcGVydHkuc2V0KCBzdGF0ZU9iamVjdC5faXNFeHBsb2RlZCApO1xyXG4gICAgdGhpcy5jb250YWluZXJIZWlnaHRQcm9wZXJ0eS5zZXQoIHN0YXRlT2JqZWN0Ll9jb250YWluZXJIZWlnaHQgKTtcclxuICAgIHRoaXMuaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eS5zZXQoIHN0YXRlT2JqZWN0Ll9oZWF0aW5nQ29vbGluZ0Ftb3VudCApO1xyXG4gICAgdGhpcy5ncmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uID0gc3RhdGVPYmplY3QuX2dyYXZpdGF0aW9uYWxBY2NlbGVyYXRpb247XHJcbiAgICB0aGlzLm5vcm1hbGl6ZWRMaWRWZWxvY2l0eVkgPSBzdGF0ZU9iamVjdC5fbm9ybWFsaXplZExpZFZlbG9jaXR5WTtcclxuICAgIHRoaXMuaXNvS2luZXRpY1RoZXJtb3N0YXQuc2V0U3RhdGUoIHN0YXRlT2JqZWN0Ll9pc29LaW5ldGljVGhlcm1vc3RhdFN0YXRlICk7XHJcbiAgICB0aGlzLmFuZGVyc2VuVGhlcm1vc3RhdC5zZXRTdGF0ZSggc3RhdGVPYmplY3QuX2FuZGVyc2VuVGhlcm1vc3RhdFN0YXRlICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBtb2xlY3VsZSBkYXRhIHNldC4gIFRoaXMgaW5jbHVkZXMgYWxsIHRoZSBwb3NpdGlvbnMsIHZlbG9jaXRpZXMsIGV0Yy4gZm9yIHRoZSBwYXJ0aWNsZXMuXHJcbiAgICB0aGlzLm1vbGVjdWxlRGF0YVNldC5zZXRTdGF0ZSggc3RhdGVPYmplY3QuX21vbGVjdWxlRGF0YVNldCApO1xyXG5cclxuICAgIC8vIFByZXNldCB0aGUgcHJlc3N1cmUgaW4gdGhlIGFjY3VtdWxhdG9yIHRoYXQgdHJhY2tzIGl0IHNvIHRoYXQgaXQgZG9lc24ndCBoYXZlIHRvIHN0YXJ0IGZyb20gemVyby5cclxuICAgIHRoaXMubW9sZWN1bGVGb3JjZUFuZE1vdGlvbkNhbGN1bGF0b3IucHJlc2V0UHJlc3N1cmUoIHN0YXRlT2JqZWN0Ll9tb2xlY3VsZUZvcmNlc0FuZE1vdGlvbkNhbGN1bGF0b3JQcmVzc3VyZSApO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHdlIGhhdmUgdGhlIHJpZ2h0IG51bWJlciBvZiBzY2FsZWQgKGkuZS4gbm9uLW5vcm1hbGl6ZWQpIGF0b21zLlxyXG4gICAgY29uc3QgbnVtYmVyT2ZOb3JtYWxpemVkTW9sZWN1bGVzID0gdGhpcy5tb2xlY3VsZURhdGFTZXQubnVtYmVyT2ZNb2xlY3VsZXM7XHJcbiAgICBjb25zdCBudW1iZXJPZk5vbk5vcm1hbGl6ZWRNb2xlY3VsZXMgPSB0aGlzLnNjYWxlZEF0b21zLmxlbmd0aCAvIHRoaXMubW9sZWN1bGVEYXRhU2V0LmF0b21zUGVyTW9sZWN1bGU7XHJcbiAgICBpZiAoIG51bWJlck9mTm9ybWFsaXplZE1vbGVjdWxlcyA+IG51bWJlck9mTm9uTm9ybWFsaXplZE1vbGVjdWxlcyApIHtcclxuICAgICAgdGhpcy5hZGRBdG9tc0ZvckN1cnJlbnRTdWJzdGFuY2UoIG51bWJlck9mTm9ybWFsaXplZE1vbGVjdWxlcyAtIG51bWJlck9mTm9uTm9ybWFsaXplZE1vbGVjdWxlcyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG51bWJlck9mTm9uTm9ybWFsaXplZE1vbGVjdWxlcyA+IG51bWJlck9mTm9ybWFsaXplZE1vbGVjdWxlcyApIHtcclxuICAgICAgXy50aW1lcyhcclxuICAgICAgICAoIG51bWJlck9mTm9uTm9ybWFsaXplZE1vbGVjdWxlcyAtIG51bWJlck9mTm9ybWFsaXplZE1vbGVjdWxlcyApICogdGhpcy5tb2xlY3VsZURhdGFTZXQuYXRvbXNQZXJNb2xlY3VsZSxcclxuICAgICAgICAoKSA9PiB7dGhpcy5zY2FsZWRBdG9tcy5wb3AoKTt9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xlYXIgdGhlIGluamVjdGlvbiBjb3VudGVyIC0gYWxsIGF0b21zIGFuZCBtb2xlY3VsZXMgc2hvdWxkIGJlIGFjY291bnRlZCBmb3IgYXQgdGhpcyBwb2ludC5cclxuICAgIHRoaXMubnVtTW9sZWN1bGVzUXVldWVkRm9ySW5qZWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBTeW5jaHJvbml6ZSB0aGUgcG9zaXRpb25zIG9mIHRoZSBzY2FsZWQgYXRvbXMgdG8gdGhlIG5vcm1hbGl6ZWQgZGF0YSBzZXQuXHJcbiAgICB0aGlzLnN5bmNBdG9tUG9zaXRpb25zKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzdGF0aWMgY29uc3RhbnRzXHJcbk11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfV0lEVEggPSBDT05UQUlORVJfV0lEVEg7XHJcbk11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfSU5JVElBTF9IRUlHSFQgPSBDT05UQUlORVJfSU5JVElBTF9IRUlHSFQ7XHJcbk11bHRpcGxlUGFydGljbGVNb2RlbC5NQVhfQ09OVEFJTkVSX0VYUEFORF9SQVRFID0gTUFYX0NPTlRBSU5FUl9FWFBBTkRfUkFURTtcclxuXHJcbk11bHRpcGxlUGFydGljbGVNb2RlbC5NdWx0aXBsZVBhcnRpY2xlTW9kZWxJTyA9IG5ldyBJT1R5cGUoICdNdWx0aXBsZVBhcnRpY2xlTW9kZWxJTycsIHtcclxuICB2YWx1ZVR5cGU6IE11bHRpcGxlUGFydGljbGVNb2RlbCxcclxuICBkb2N1bWVudGF0aW9uOiAnbXVsdGlwbGUgcGFydGljbGUgbW9kZWwgdGhhdCBzaW11bGF0ZXMgaW50ZXJhY3Rpb25zIHRoYXQgbGVhZCB0byBwaGFzZS1saWtlIGJlaGF2aW9yJyxcclxuICB0b1N0YXRlT2JqZWN0OiBtdWx0aXBsZVBhcnRpY2xlTW9kZWwgPT4gbXVsdGlwbGVQYXJ0aWNsZU1vZGVsLnRvU3RhdGVPYmplY3QoKSxcclxuICBhcHBseVN0YXRlOiAoIG11bHRpcGxlUGFydGljbGVNb2RlbCwgc3RhdGUgKSA9PiBtdWx0aXBsZVBhcnRpY2xlTW9kZWwuYXBwbHlTdGF0ZSggc3RhdGUgKSxcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgX3N1YnN0YW5jZTogRW51bWVyYXRpb25JTyggU3Vic3RhbmNlVHlwZSApLFxyXG4gICAgX2lzRXhwbG9kZWQ6IEJvb2xlYW5JTyxcclxuICAgIF9jb250YWluZXJIZWlnaHQ6IE51bWJlcklPLFxyXG4gICAgX2dyYXZpdGF0aW9uYWxBY2NlbGVyYXRpb246IE51bWJlcklPLFxyXG4gICAgX25vcm1hbGl6ZWRMaWRWZWxvY2l0eVk6IE51bWJlcklPLFxyXG4gICAgX2hlYXRpbmdDb29saW5nQW1vdW50OiBOdW1iZXJJTyxcclxuICAgIF9tb2xlY3VsZURhdGFTZXQ6IE1vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0Lk1vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0SU8sXHJcbiAgICBfaXNvS2luZXRpY1RoZXJtb3N0YXRTdGF0ZTogSXNva2luZXRpY1RoZXJtb3N0YXQuSXNvS2luZXRpY1RoZXJtb3N0YXRJTyxcclxuICAgIF9hbmRlcnNlblRoZXJtb3N0YXRTdGF0ZTogQW5kZXJzZW5UaGVybW9zdGF0LkFuZGVyc2VuVGhlcm1vc3RhdElPLFxyXG4gICAgX21vbGVjdWxlRm9yY2VzQW5kTW90aW9uQ2FsY3VsYXRvclByZXNzdXJlOiBOdW1iZXJJT1xyXG4gIH1cclxufSApO1xyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdNdWx0aXBsZVBhcnRpY2xlTW9kZWwnLCBNdWx0aXBsZVBhcnRpY2xlTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTXVsdGlwbGVQYXJ0aWNsZU1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyw2QkFBNkIs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