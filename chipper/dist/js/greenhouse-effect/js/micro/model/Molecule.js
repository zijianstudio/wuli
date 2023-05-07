// Copyright 2021-2022, University of Colorado Boulder

/**
 * Base type for molecules.  This, by its nature, is essentially a composition of other objects, generally atoms and
 * atomic bonds.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import Atom from './atoms/Atom.js';
import AtomicBond from './atoms/AtomicBond.js';
import MicroPhoton from './MicroPhoton.js';
import NullPhotonAbsorptionStrategy from './NullPhotonAbsorptionStrategy.js';

// constants
const PHOTON_EMISSION_SPEED = 3000; // Picometers per second.
const PHOTON_ABSORPTION_DISTANCE = 100; // Distance where the molecule begins to query photon for absorption.
const VIBRATION_FREQUENCY = 5; // Cycles per second of sim time.
const ROTATION_RATE = 1.1; // Revolutions per second of sim time.
const ABSORPTION_HYSTERESIS_TIME = 0.2; // seconds
const PASS_THROUGH_PHOTON_LIST_SIZE = 10; // Size of list which tracks photons not absorbed due to random probability.

// utility method used for serialization
function serializeArray(array) {
  const serializedArray = [];
  array.forEach(arrayElement => {
    serializedArray.push(arrayElement.toStateObject());
  });
  return serializedArray;
}

// utility method for finding atom with the specified ID in a list
function findAtomWithID(atomArray, id) {
  for (let i = 0; i < atomArray.length; i++) {
    if (atomArray[i].uniqueID === id) {
      return atomArray[i];
    }
  }

  // ID not found
  return null;
}
class Molecule {
  /**
   * Constructor for a molecule.
   *
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      initialPosition: Vector2.ZERO,
      isForIcon: false,
      tandem: Tandem.OPTIONAL // not needed when part of the selection radio buttons.
    }, options);

    // TODO (phet-io): Should this be an assertion?  Why is this here?
    options.tandem = Tandem.OPTIONAL;
    this.highElectronicEnergyStateProperty = new BooleanProperty(false, !options.isForIcon ? {
      tandem: options.tandem.createTandem('highElectronicEnergyStateProperty'),
      // Instrumentation requested in https://github.com/phetsims/phet-io-wrappers/issues/53
      phetioState: false // Too tricky to load dynamic particle state in the state wrapper, and not enough benefit.  Opt out for now.
    } : {});
    this.centerOfGravityProperty = new Vector2Property(options.initialPosition);

    // Atoms and bonds that form this molecule.
    this.atoms = []; // @private Elements are of type Atoms
    this.atomicBonds = []; // @private Elements are of type AtomicBonds

    // Structure of the molecule in terms of offsets from the center of gravity.  These indicate the atom's position in
    // the "relaxed" (i.e. non-vibrating), non-rotated state.
    this.initialAtomCogOffsets = {}; // @private Object contains keys of the atom's uniqueID and values of type Vector2

    // Vibration offsets - these represent the amount of deviation from the initial (a.k.a relaxed) configuration for
    // each molecule.
    this.vibrationAtomOffsets = {}; // @private Object contains keys of the atom's uniqueID and values of type Vector2

    //  Map containing the atoms which compose this molecule.  Allows us to call on each atom by their unique ID.
    this.atomsByID = {}; // @private Objects contains keys of the atom's uniqueID, and values of type atom.

    // @public Velocity for this molecule.
    this.velocity = new Vector2(0, 0);

    // Map that matches photon wavelengths to photon absorption strategies. The strategies contained in this structure
    // define whether the molecule can absorb a given photon and, if it does absorb it, how it will react.
    // Object will contain keys of type Number and values of type PhotonAbsorptionStrategy
    this.mapWavelengthToAbsorptionStrategy = {}; // @private

    // Currently active photon absorption strategy, active because a photon was absorbed that activated it.
    // @public
    this.activePhotonAbsorptionStrategy = new NullPhotonAbsorptionStrategy(this);

    // Variable that prevents reabsorption for a while after emitting a photon.
    // @private
    this.absorptionHysteresisCountdownTime = 0;

    // The "pass through photon list" keeps track of photons that were not absorbed due to random probability
    // (essentially a simulation of quantum properties).  If this molecule has no absorption strategy for the photon,
    // it is also added to this list. This is needed since the absorption of a given photon will likely be tested at
    // many time steps as the photon moves past the molecule, and we don't want to keep deciding about the same photon.
    // Array will have size PASS_THROUGH_PHOTON_LIST_SIZE with type MicroPhoton.
    // @private
    this.passThroughPhotonList = [];

    // @public {NumberProperty} - The current point within this molecule's vibration sequence.
    this.currentVibrationRadiansProperty = new NumberProperty(0);

    // The amount of rotation currently applied to this molecule.  This is relative to its original, non-rotated state.
    this.currentRotationRadians = 0; // @public

    // @public - Boolean values that track whether the molecule is vibrating or rotating.
    this.vibratingProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('vibratingProperty'),
      phetioState: false // Too tricky to load dynamic particle state in the state wrapper, and not enough benefit.  Opt out for now.
    });

    this.rotatingProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('rotatingProperty'),
      phetioState: false // Too tricky to load dynamic particle state in the state wrapper, and not enough benefit.  Opt out for now.
    });

    // Controls the direction of rotation.
    this.rotationDirectionClockwiseProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('rotationDirectionClockwiseProperty'),
      phetioState: false // Too tricky to load dynamic particle state in the state wrapper, and not enough benefit.  Opt out for now.
    });

    // @public {DerivedProperty.<boolean>} - whether or not the molecule is "stretching" or "contracting" in its vibration.
    this.isStretchingProperty = new DerivedProperty([this.currentVibrationRadiansProperty], vibrationRadians => {
      // more displacement with -sin( vibrationRadians ) and so when the slope of that function is negative
      // (derivative of sin is cos) the atoms are expanding
      return Math.cos(vibrationRadians) < 0;
    });

    // @public, set by PhotonAbsorptionModel
    this.photonGroup = null;

    // @public (read-only) {Emitter} - emitter for when a photon is absorbed
    this.photonAbsorbedEmitter = new Emitter({
      parameters: [{
        valueType: MicroPhoton
      }]
    });

    // @public (read-only) {Emitter} - emitter for when a photon is emitted
    this.photonEmittedEmitter = new Emitter({
      parameters: [{
        valueType: MicroPhoton
      }]
    });

    // @public {Emitter} - emitter for when a photon passes through the molecule without absorptions
    this.photonPassedThroughEmitter = new Emitter({
      parameters: [{
        valueType: MicroPhoton
      }]
    });

    // @public Emitter for 'brokeApart' event, when a molecule breaks into two new molecules
    this.brokeApartEmitter = new Emitter({
      parameters: [{
        valueType: Molecule
      }, {
        valueType: Molecule
      }]
    });
  }

  /**
   * Reset the molecule.  Any photons that have been absorbed are forgotten, and any vibration is reset.
   * @public
   **/
  reset() {
    this.highElectronicEnergyStateProperty.reset();
    this.centerOfGravityProperty.reset();
    this.activePhotonAbsorptionStrategy.reset();
    this.activePhotonAbsorptionStrategy = new NullPhotonAbsorptionStrategy(this);
    this.absorptionHysteresisCountdownTime = 0;
    this.vibratingProperty.reset();
    this.rotatingProperty.reset();
    this.rotationDirectionClockwiseProperty.reset();
    this.setRotation(0);
    this.setVibration(0);
  }

  /**
   * These properties are owned by this molecule so they can be disposed directly.
   * @public
   */
  dispose() {
    this.vibratingProperty.dispose();
    this.rotatingProperty.dispose();
    this.rotationDirectionClockwiseProperty.dispose();
    this.highElectronicEnergyStateProperty.dispose();
    this.photonEmittedEmitter.dispose();
    this.photonPassedThroughEmitter.dispose();
  }

  /**
   * Set the photon absorption strategy for this molecule for a given photon wavelength.
   * @public
   *
   * @param {number} wavelength - wavelength attributed to this absorption strategy.
   * @param {PhotonAbsorptionStrategy} strategy
   */
  setPhotonAbsorptionStrategy(wavelength, strategy) {
    this.mapWavelengthToAbsorptionStrategy[wavelength] = strategy;
  }

  /**
   * Get the absorption strategy for this molecule for the provided wavelength. Note that this does NOT return
   * the active absorption strategy after an absorption.
   * @public
   *
   * @param {number|null} wavelength - null if there is no strategy for the wavelength
   */
  getPhotonAbsorptionStrategyForWavelength(wavelength) {
    return this.mapWavelengthToAbsorptionStrategy[wavelength] || null;
  }

  /**
   * Checks to see if a photon has been absorbed.
   * @public
   *
   * @returns {boolean}
   */
  isPhotonAbsorbed() {
    // If there is an active non-null photon absorption strategy, it indicates that a photon has been absorbed.
    return !(this.activePhotonAbsorptionStrategy instanceof NullPhotonAbsorptionStrategy);
  }

  /**
   * Add an initial offset from the molecule's Center of Gravity (COG). The offset is "initial" because this is where
   * the atom should be when it is not vibrating or rotating.
   * @protected
   *
   * @param {Atom || CarbonAtom || HydrogenAtom || NitrogenAtom || OxygenAtom} atom
   * @param {Vector2} offset - Initial COG offset for when atom is not vibrating or rotating.
   */
  addInitialAtomCogOffset(atom, offset) {
    // Check that the specified atom is a part of this molecule.  While it would probably work to add the offsets
    // first and the atoms later, that's not how the sim was designed, so this is some enforcement of the "add the
    // atoms first" policy.
    assert && assert(this.atoms.indexOf(atom) >= 0);
    this.initialAtomCogOffsets[atom.uniqueID] = offset;
  }

  /**
   * Get the initial offset from the molecule's center of gravity (COG) for the specified atom.
   * @public
   *
   * @param {Atom} atom
   * @returns {Vector2}
   **/
  getInitialAtomCogOffset(atom) {
    if (!(atom.uniqueID in this.initialAtomCogOffsets)) {
      console.log(' - Warning: Attempt to get initial COG offset for atom that is not in molecule.');
    }
    return this.initialAtomCogOffsets[atom.uniqueID];
  }

  /**
   * Get the current vibration offset from the molecule's center of gravity (COG) for the specified molecule.
   * @public
   *
   * @param {Atom} atom
   * @returns {Vector2} - Vector representing position of vibration offset from molecule's center of gravity.
   */
  getVibrationAtomOffset(atom) {
    if (!(atom.uniqueID in this.vibrationAtomOffsets)) {
      console.log(' - Warning: Attempt to get vibrational COG offset for atom that is not in molecule.');
    }
    return this.vibrationAtomOffsets[atom.uniqueID];
  }

  /**
   * Advance the molecule one step in time.
   * @public
   *
   * @param {number} dt - delta time, in seconds
   **/
  step(dt) {
    this.activePhotonAbsorptionStrategy.step(dt);

    // Not equal to zero, because that case is covered when checking to emit the photon.
    if (this.absorptionHysteresisCountdownTime > 0) {
      this.absorptionHysteresisCountdownTime -= dt;
    }
    if (this.vibratingProperty.get()) {
      this.advanceVibration(dt * VIBRATION_FREQUENCY * 2 * Math.PI);
    }
    if (this.rotatingProperty.get()) {
      const directionMultiplier = this.rotationDirectionClockwiseProperty.get() ? -1 : 1;
      this.rotate(dt * ROTATION_RATE * 2 * Math.PI * directionMultiplier);
    }

    // Do any linear movement that is required.
    this.setCenterOfGravityPos(this.centerOfGravityProperty.get().x + this.velocity.x * dt, this.centerOfGravityProperty.get().y + this.velocity.y * dt);
  }

  /**
   * Create a new Vector2 describing the position of this molecule's center of gravity.
   * @public
   *
   * @returns {Vector2}
   **/
  getCenterOfGravityPos() {
    return new Vector2(this.centerOfGravityProperty.get().x, this.centerOfGravityProperty.get().y);
  }

  /**
   * Set the position of this molecule by specifying the center of gravity.  This will be unique to each molecule's
   * configuration, and it will cause the individual molecules to be located such that the center of gravity is in
   * the specified position.  The relative orientation of the atoms that comprise the molecules will not be changed.
   * @public
   *
   * @param {number} x - the x position to set
   * @param {number} y - the y position to set
   **/
  setCenterOfGravityPos(x, y) {
    if (this.centerOfGravityProperty.get().x !== x || this.centerOfGravityProperty.get().y !== y) {
      this.centerOfGravityProperty.set(new Vector2(x, y));
      this.updateAtomPositions();
    }
  }

  /**
   * Set the position of this molecule by specifying the center of gravity. Allows passing a Vector2 into
   * setCenterOfGravityPos.
   * @public
   *
   * @param {Vector2} centerOfGravityPos - A vector representing the desired position for this molecule.
   **/
  setCenterOfGravityPosVec(centerOfGravityPos) {
    this.setCenterOfGravityPos(centerOfGravityPos.x, centerOfGravityPos.y);
  }

  /**
   * Placeholder for setVibration function.  This should be implemented in descendant molecules that have vibration
   * strategies.
   * @public
   *
   * @param {number} vibrationRadians
   */
  setVibration(vibrationRadians) {
    // Implements no vibration by default, override in descendant classes as needed.
    this.currentVibrationRadiansProperty.set(vibrationRadians);
  }

  /**
   * Advance the vibration by the prescribed radians.
   * @private
   *
   * @param {number} deltaRadians - Change of vibration angle in radians.
   **/
  advanceVibration(deltaRadians) {
    this.currentVibrationRadiansProperty.set(this.currentVibrationRadiansProperty.get() + deltaRadians);
    this.setVibration(this.currentVibrationRadiansProperty.get());
  }

  /**
   * Rotate the molecule about the center of gravity by the specified number of radians.
   * @public
   *
   * @param {number} deltaRadians - Change in radians of the Molecule's angle about the center of Gravity.
   **/
  rotate(deltaRadians) {
    this.setRotation((this.currentRotationRadians + deltaRadians) % (Math.PI * 2));
  }

  /**
   * Set the rotation angle of the Molecule in radians.
   * @public
   *
   * @param {number} radians
   **/
  setRotation(radians) {
    if (radians !== this.currentRotationRadians) {
      this.currentRotationRadians = radians;
      this.updateAtomPositions();
    }
  }

  /**
   * Cause the molecule to dissociate, i.e. to break apart.
   * @public
   **/
  breakApart() {
    console.error(' Error: breakApart invoked on a molecule for which the action is not implemented.');
    assert && assert(false);
  }

  /**
   * Mark a photon for passing through the molecule.  This means that the photon will not interact with the molecule.
   * @public
   *
   * @param {MicroPhoton} photon - The photon to be passed through.
   **/
  markPhotonForPassThrough(photon) {
    if (this.passThroughPhotonList.length >= PASS_THROUGH_PHOTON_LIST_SIZE) {
      // Make room for this photon be deleting the oldest one.
      this.passThroughPhotonList.shift();
    }
    this.passThroughPhotonList.push(photon);
  }

  /**
   * Determine if a photon is marked to be passed through this molecule.
   * @public
   *
   * @param {MicroPhoton} photon
   * @returns {boolean}
   **/
  isPhotonMarkedForPassThrough(photon) {
    // Use indexOf to see if the photon exists in the list. If the photon is not in the list, indexOf will return -1.
    return this.passThroughPhotonList.indexOf(photon) > -1;
  }

  /**
   * Create a new array containing the atoms which compose this molecule.
   * @public
   *
   * @returns {Array.<Atom>} - Array containing the atoms which compose this molecule.
   **/
  getAtoms() {
    return this.atoms.slice(0);
  }

  /**
   * Create a new array containing this Molecules atomic bonds.
   * @public
   *
   * @returns {Array.<AtomicBond>} - Array containing the atomic bonds constructing this molecule.
   **/
  getAtomicBonds() {
    return this.atomicBonds.slice(0);
  }

  /**
   * Decide whether or not to absorb the offered photon.  If the photon is absorbed, the matching absorption strategy
   * is set so that it can control the molecule's post-absorption behavior.
   * @public
   *
   * @param {MicroPhoton} photon - the photon offered for absorption
   * @returns {boolean} absorbPhoton
   **/
  queryAbsorbPhoton(photon) {
    let absorbPhoton = false;

    // TODO: Need to determine if the photon as passed through and emit here.

    if (this.absorptionHysteresisCountdownTime <= 0 && photon.positionProperty.get().distance(this.getCenterOfGravityPos()) < PHOTON_ABSORPTION_DISTANCE && !this.isPhotonMarkedForPassThrough(photon)) {
      // The circumstances for absorption are correct, but do we have an absorption strategy for this photon's
      // wavelength?
      const candidateAbsorptionStrategy = this.mapWavelengthToAbsorptionStrategy[photon.wavelength];
      if (candidateAbsorptionStrategy !== undefined && !this.isPhotonAbsorbed()) {
        // Yes, there is a strategy available for this wavelength. Ask it if it wants the photon.
        if (candidateAbsorptionStrategy.queryAndAbsorbPhoton(photon)) {
          // It does want it, so consider the photon absorbed.
          absorbPhoton = true;
          this.activePhotonAbsorptionStrategy = candidateAbsorptionStrategy;
          this.activePhotonAbsorptionStrategy.queryAndAbsorbPhoton(photon);
          this.photonAbsorbedEmitter.emit(photon);
        } else {
          // We have the decision logic once for whether a photon should be absorbed, so it is not queried a second
          // time.
          this.markPhotonForPassThrough(photon);
        }
      } else {
        this.markPhotonForPassThrough(photon);
      }

      // broadcast that it was decided that this photon should pass through the molecule - only done if the photon
      // was close enough
      if (!absorbPhoton) {
        this.photonPassedThroughEmitter.emit(photon);
      }
    }
    return absorbPhoton;
  }

  /**
   * Add an atom to the list of atoms which compose this molecule.
   * @public
   *
   * @param {Atom} atom - The atom to be added
   **/
  addAtom(atom) {
    this.atoms.push(atom);
    this.initialAtomCogOffsets[atom.uniqueID] = new Vector2(0, 0);
    this.vibrationAtomOffsets[atom.uniqueID] = new Vector2(0, 0);
    this.atomsByID[atom.uniqueID] = atom;
  }

  /**
   * Add an atomic bond to this Molecule's list of atomic bonds.
   * @public
   *
   * @param {AtomicBond} atomicBond - The atomic bond to be added.
   **/
  addAtomicBond(atomicBond) {
    this.atomicBonds.push(atomicBond);
  }

  /**
   * Emit a photon of the specified wavelength in a random direction.
   * @public
   *
   * @param {number} wavelength - The photon to be emitted.
   **/
  emitPhoton(wavelength) {
    const photonToEmit = this.photonGroup.createNextElement(wavelength);
    const emissionAngle = dotRandom.nextDouble() * Math.PI * 2;
    photonToEmit.setVelocity(PHOTON_EMISSION_SPEED * Math.cos(emissionAngle), PHOTON_EMISSION_SPEED * Math.sin(emissionAngle));
    const centerOfGravityPosRef = this.centerOfGravityProperty.get();
    photonToEmit.position = new Vector2(centerOfGravityPosRef.x, centerOfGravityPosRef.y);
    this.absorptionHysteresisCountdownTime = ABSORPTION_HYSTERESIS_TIME;
    this.photonEmittedEmitter.emit(photonToEmit);
  }

  /**
   * Returns true if the atoms the molecule 'vibration' is represented by stretching. If false, vibration is represented
   * with bending.
   * @public
   *
   * @returns {boolean}
   */
  vibratesByStretching() {
    return this.atoms.length <= 2;
  }

  /**
   * Update the positions of all atoms that comprise this molecule based on the current center of gravity and the
   * offset for each atom.
   * @public
   **/
  updateAtomPositions() {
    for (const uniqueID in this.initialAtomCogOffsets) {
      if (this.initialAtomCogOffsets.hasOwnProperty(uniqueID)) {
        const atomOffset = new Vector2(this.initialAtomCogOffsets[uniqueID].x, this.initialAtomCogOffsets[uniqueID].y);
        // Add the vibration, if any exists.
        atomOffset.add(this.vibrationAtomOffsets[uniqueID]);
        // Rotate.
        atomOffset.rotate(this.currentRotationRadians);
        // Set position based on combination of offset and current center
        // of gravity.
        this.atomsByID[uniqueID].positionProperty.set(new Vector2(this.centerOfGravityProperty.get().x + atomOffset.x, this.centerOfGravityProperty.get().y + atomOffset.y));
      }
    }
  }

  /**
   * Initialize the offsets from the center of gravity for each atom within this molecule.  This should be in the
   * 'relaxed' (i.e. non-vibrating) state.
   * @protected
   * @abstract
   */
  initializeAtomOffsets() {
    throw new Error('initializeAtomOffsets should be implemented in descendant molecules.');
  }

  // serialization support
  // @public
  toStateObject() {
    // This serializes the minimum set of attributes necessary to deserialize when provided back.  I (jblanco) am not
    // absolutely certain that this is everything needed, so feel free to add some of the other attributes if needed.
    return {
      highElectronicEnergyState: this.highElectronicEnergyStateProperty.get(),
      centerOfGravity: this.centerOfGravityProperty.get().toStateObject(),
      atoms: serializeArray(this.atoms),
      atomicBonds: serializeArray(this.atomicBonds),
      velocity: this.velocity.toStateObject(),
      absorptionHysteresisCountdownTime: this.absorptionHysteresisCountdownTime,
      currentVibrationRadians: this.currentVibrationRadiansProperty.get(),
      currentRotationRadians: this.currentRotationRadians
    };
  }

  // deserialization support
  // @public
  static fromStateObject(stateObject) {
    // Create a molecule that is basically blank.
    const molecule = new Molecule();

    // Fill in the straightforward stuff
    molecule.highElectronicEnergyStateProperty.set(stateObject.highElectronicEnergyState);
    molecule.centerOfGravityProperty.set(Vector2.fromStateObject(stateObject.centerOfGravity));
    molecule.velocity = Vector2.fromStateObject(stateObject.velocity);
    molecule.absorptionHysteresisCountdownTime = stateObject.absorptionHysteresisCountdownTime;
    molecule.currentVibrationRadiansProperty.set(stateObject.currentVibrationRadians);
    molecule.currentRotationRadians = stateObject.currentRotationRadians;

    // add the atoms
    molecule.atoms = _.map(stateObject.atoms, atom => Atom.fromStateObject(atom));

    // add the bonds
    stateObject.atomicBonds.forEach(bondStateObject => {
      const atom1 = findAtomWithID(molecule.atoms, bondStateObject.atom1ID);
      const atom2 = findAtomWithID(molecule.atoms, bondStateObject.atom2ID);
      assert && assert(atom1 && atom2, 'Error: Couldn\'t match atom ID in bond with atoms in molecule');
      molecule.addAtomicBond(new AtomicBond(atom1, atom2, {
        bondCount: bondStateObject.bondCount
      }));
    });
    return molecule;
  }
}
greenhouseEffect.register('Molecule', Molecule);

// @public {number} - distance from the molecule to query a photon for absorption, in picometers
Molecule.PHOTON_ABSORPTION_DISTANCE = PHOTON_ABSORPTION_DISTANCE;
Molecule.MoleculeIO = new IOType('MoleculeIO', {
  valueType: Molecule,
  toStateObject: molecule => molecule.toStateObject(),
  fromStateObject: Molecule.fromStateObject,
  stateSchema: {
    highElectronicEnergyState: BooleanIO,
    centerOfGravity: Vector2.Vector2IO,
    // TODO: https://github.com/phetsims/greenhouse-effect/issues/40 more specific schema
    atoms: ArrayIO(ObjectLiteralIO),
    atomicBonds: ArrayIO(ObjectLiteralIO),
    velocity: Vector2.Vector2IO,
    absorptionHysteresisCountdownTime: NumberIO,
    currentVibrationRadians: NumberIO,
    currentRotationRadians: NumberIO
  }
});
export default Molecule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJkb3RSYW5kb20iLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJUYW5kZW0iLCJBcnJheUlPIiwiQm9vbGVhbklPIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJPYmplY3RMaXRlcmFsSU8iLCJncmVlbmhvdXNlRWZmZWN0IiwiQXRvbSIsIkF0b21pY0JvbmQiLCJNaWNyb1Bob3RvbiIsIk51bGxQaG90b25BYnNvcnB0aW9uU3RyYXRlZ3kiLCJQSE9UT05fRU1JU1NJT05fU1BFRUQiLCJQSE9UT05fQUJTT1JQVElPTl9ESVNUQU5DRSIsIlZJQlJBVElPTl9GUkVRVUVOQ1kiLCJST1RBVElPTl9SQVRFIiwiQUJTT1JQVElPTl9IWVNURVJFU0lTX1RJTUUiLCJQQVNTX1RIUk9VR0hfUEhPVE9OX0xJU1RfU0laRSIsInNlcmlhbGl6ZUFycmF5IiwiYXJyYXkiLCJzZXJpYWxpemVkQXJyYXkiLCJmb3JFYWNoIiwiYXJyYXlFbGVtZW50IiwicHVzaCIsInRvU3RhdGVPYmplY3QiLCJmaW5kQXRvbVdpdGhJRCIsImF0b21BcnJheSIsImlkIiwiaSIsImxlbmd0aCIsInVuaXF1ZUlEIiwiTW9sZWN1bGUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbml0aWFsUG9zaXRpb24iLCJaRVJPIiwiaXNGb3JJY29uIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJoaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9TdGF0ZSIsImNlbnRlck9mR3Jhdml0eVByb3BlcnR5IiwiYXRvbXMiLCJhdG9taWNCb25kcyIsImluaXRpYWxBdG9tQ29nT2Zmc2V0cyIsInZpYnJhdGlvbkF0b21PZmZzZXRzIiwiYXRvbXNCeUlEIiwidmVsb2NpdHkiLCJtYXBXYXZlbGVuZ3RoVG9BYnNvcnB0aW9uU3RyYXRlZ3kiLCJhY3RpdmVQaG90b25BYnNvcnB0aW9uU3RyYXRlZ3kiLCJhYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWUiLCJwYXNzVGhyb3VnaFBob3Rvbkxpc3QiLCJjdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5IiwiY3VycmVudFJvdGF0aW9uUmFkaWFucyIsInZpYnJhdGluZ1Byb3BlcnR5Iiwicm90YXRpbmdQcm9wZXJ0eSIsInJvdGF0aW9uRGlyZWN0aW9uQ2xvY2t3aXNlUHJvcGVydHkiLCJpc1N0cmV0Y2hpbmdQcm9wZXJ0eSIsInZpYnJhdGlvblJhZGlhbnMiLCJNYXRoIiwiY29zIiwicGhvdG9uR3JvdXAiLCJwaG90b25BYnNvcmJlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwicGhvdG9uRW1pdHRlZEVtaXR0ZXIiLCJwaG90b25QYXNzZWRUaHJvdWdoRW1pdHRlciIsImJyb2tlQXBhcnRFbWl0dGVyIiwicmVzZXQiLCJzZXRSb3RhdGlvbiIsInNldFZpYnJhdGlvbiIsImRpc3Bvc2UiLCJzZXRQaG90b25BYnNvcnB0aW9uU3RyYXRlZ3kiLCJ3YXZlbGVuZ3RoIiwic3RyYXRlZ3kiLCJnZXRQaG90b25BYnNvcnB0aW9uU3RyYXRlZ3lGb3JXYXZlbGVuZ3RoIiwiaXNQaG90b25BYnNvcmJlZCIsImFkZEluaXRpYWxBdG9tQ29nT2Zmc2V0IiwiYXRvbSIsIm9mZnNldCIsImFzc2VydCIsImluZGV4T2YiLCJnZXRJbml0aWFsQXRvbUNvZ09mZnNldCIsImNvbnNvbGUiLCJsb2ciLCJnZXRWaWJyYXRpb25BdG9tT2Zmc2V0Iiwic3RlcCIsImR0IiwiZ2V0IiwiYWR2YW5jZVZpYnJhdGlvbiIsIlBJIiwiZGlyZWN0aW9uTXVsdGlwbGllciIsInJvdGF0ZSIsInNldENlbnRlck9mR3Jhdml0eVBvcyIsIngiLCJ5IiwiZ2V0Q2VudGVyT2ZHcmF2aXR5UG9zIiwic2V0IiwidXBkYXRlQXRvbVBvc2l0aW9ucyIsInNldENlbnRlck9mR3Jhdml0eVBvc1ZlYyIsImNlbnRlck9mR3Jhdml0eVBvcyIsImRlbHRhUmFkaWFucyIsInJhZGlhbnMiLCJicmVha0FwYXJ0IiwiZXJyb3IiLCJtYXJrUGhvdG9uRm9yUGFzc1Rocm91Z2giLCJwaG90b24iLCJzaGlmdCIsImlzUGhvdG9uTWFya2VkRm9yUGFzc1Rocm91Z2giLCJnZXRBdG9tcyIsInNsaWNlIiwiZ2V0QXRvbWljQm9uZHMiLCJxdWVyeUFic29yYlBob3RvbiIsImFic29yYlBob3RvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJkaXN0YW5jZSIsImNhbmRpZGF0ZUFic29ycHRpb25TdHJhdGVneSIsInVuZGVmaW5lZCIsInF1ZXJ5QW5kQWJzb3JiUGhvdG9uIiwiZW1pdCIsImFkZEF0b20iLCJhZGRBdG9taWNCb25kIiwiYXRvbWljQm9uZCIsImVtaXRQaG90b24iLCJwaG90b25Ub0VtaXQiLCJjcmVhdGVOZXh0RWxlbWVudCIsImVtaXNzaW9uQW5nbGUiLCJuZXh0RG91YmxlIiwic2V0VmVsb2NpdHkiLCJzaW4iLCJjZW50ZXJPZkdyYXZpdHlQb3NSZWYiLCJwb3NpdGlvbiIsInZpYnJhdGVzQnlTdHJldGNoaW5nIiwiaGFzT3duUHJvcGVydHkiLCJhdG9tT2Zmc2V0IiwiYWRkIiwiaW5pdGlhbGl6ZUF0b21PZmZzZXRzIiwiRXJyb3IiLCJoaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlIiwiY2VudGVyT2ZHcmF2aXR5IiwiY3VycmVudFZpYnJhdGlvblJhZGlhbnMiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsIm1vbGVjdWxlIiwiXyIsIm1hcCIsImJvbmRTdGF0ZU9iamVjdCIsImF0b20xIiwiYXRvbTFJRCIsImF0b20yIiwiYXRvbTJJRCIsImJvbmRDb3VudCIsInJlZ2lzdGVyIiwiTW9sZWN1bGVJTyIsInN0YXRlU2NoZW1hIiwiVmVjdG9yMklPIl0sInNvdXJjZXMiOlsiTW9sZWN1bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSB0eXBlIGZvciBtb2xlY3VsZXMuICBUaGlzLCBieSBpdHMgbmF0dXJlLCBpcyBlc3NlbnRpYWxseSBhIGNvbXBvc2l0aW9uIG9mIG90aGVyIG9iamVjdHMsIGdlbmVyYWxseSBhdG9tcyBhbmRcclxuICogYXRvbWljIGJvbmRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBPYmplY3RMaXRlcmFsSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL09iamVjdExpdGVyYWxJTy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgQXRvbSBmcm9tICcuL2F0b21zL0F0b20uanMnO1xyXG5pbXBvcnQgQXRvbWljQm9uZCBmcm9tICcuL2F0b21zL0F0b21pY0JvbmQuanMnO1xyXG5pbXBvcnQgTWljcm9QaG90b24gZnJvbSAnLi9NaWNyb1Bob3Rvbi5qcyc7XHJcbmltcG9ydCBOdWxsUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5IGZyb20gJy4vTnVsbFBob3RvbkFic29ycHRpb25TdHJhdGVneS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUEhPVE9OX0VNSVNTSU9OX1NQRUVEID0gMzAwMDsgLy8gUGljb21ldGVycyBwZXIgc2Vjb25kLlxyXG5jb25zdCBQSE9UT05fQUJTT1JQVElPTl9ESVNUQU5DRSA9IDEwMDsgLy8gRGlzdGFuY2Ugd2hlcmUgdGhlIG1vbGVjdWxlIGJlZ2lucyB0byBxdWVyeSBwaG90b24gZm9yIGFic29ycHRpb24uXHJcbmNvbnN0IFZJQlJBVElPTl9GUkVRVUVOQ1kgPSA1OyAgLy8gQ3ljbGVzIHBlciBzZWNvbmQgb2Ygc2ltIHRpbWUuXHJcbmNvbnN0IFJPVEFUSU9OX1JBVEUgPSAxLjE7ICAvLyBSZXZvbHV0aW9ucyBwZXIgc2Vjb25kIG9mIHNpbSB0aW1lLlxyXG5jb25zdCBBQlNPUlBUSU9OX0hZU1RFUkVTSVNfVElNRSA9IDAuMjsgLy8gc2Vjb25kc1xyXG5jb25zdCBQQVNTX1RIUk9VR0hfUEhPVE9OX0xJU1RfU0laRSA9IDEwOyAvLyBTaXplIG9mIGxpc3Qgd2hpY2ggdHJhY2tzIHBob3RvbnMgbm90IGFic29yYmVkIGR1ZSB0byByYW5kb20gcHJvYmFiaWxpdHkuXHJcblxyXG4vLyB1dGlsaXR5IG1ldGhvZCB1c2VkIGZvciBzZXJpYWxpemF0aW9uXHJcbmZ1bmN0aW9uIHNlcmlhbGl6ZUFycmF5KCBhcnJheSApIHtcclxuICBjb25zdCBzZXJpYWxpemVkQXJyYXkgPSBbXTtcclxuICBhcnJheS5mb3JFYWNoKCBhcnJheUVsZW1lbnQgPT4ge1xyXG4gICAgc2VyaWFsaXplZEFycmF5LnB1c2goIGFycmF5RWxlbWVudC50b1N0YXRlT2JqZWN0KCkgKTtcclxuICB9ICk7XHJcbiAgcmV0dXJuIHNlcmlhbGl6ZWRBcnJheTtcclxufVxyXG5cclxuLy8gdXRpbGl0eSBtZXRob2QgZm9yIGZpbmRpbmcgYXRvbSB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaW4gYSBsaXN0XHJcbmZ1bmN0aW9uIGZpbmRBdG9tV2l0aElEKCBhdG9tQXJyYXksIGlkICkge1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGF0b21BcnJheS5sZW5ndGg7IGkrKyApIHtcclxuICAgIGlmICggYXRvbUFycmF5WyBpIF0udW5pcXVlSUQgPT09IGlkICkge1xyXG4gICAgICByZXR1cm4gYXRvbUFycmF5WyBpIF07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBJRCBub3QgZm91bmRcclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuY2xhc3MgTW9sZWN1bGUge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgYSBtb2xlY3VsZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaW5pdGlhbFBvc2l0aW9uOiBWZWN0b3IyLlpFUk8sXHJcbiAgICAgIGlzRm9ySWNvbjogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMIC8vIG5vdCBuZWVkZWQgd2hlbiBwYXJ0IG9mIHRoZSBzZWxlY3Rpb24gcmFkaW8gYnV0dG9ucy5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUT0RPIChwaGV0LWlvKTogU2hvdWxkIHRoaXMgYmUgYW4gYXNzZXJ0aW9uPyAgV2h5IGlzIHRoaXMgaGVyZT9cclxuICAgIG9wdGlvbnMudGFuZGVtID0gVGFuZGVtLk9QVElPTkFMO1xyXG5cclxuICAgIHRoaXMuaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsICFvcHRpb25zLmlzRm9ySWNvbiA/IHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdoaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlUHJvcGVydHknICksIC8vIEluc3RydW1lbnRhdGlvbiByZXF1ZXN0ZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8td3JhcHBlcnMvaXNzdWVzLzUzXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSAvLyBUb28gdHJpY2t5IHRvIGxvYWQgZHluYW1pYyBwYXJ0aWNsZSBzdGF0ZSBpbiB0aGUgc3RhdGUgd3JhcHBlciwgYW5kIG5vdCBlbm91Z2ggYmVuZWZpdC4gIE9wdCBvdXQgZm9yIG5vdy5cclxuICAgIH0gOiB7fSApO1xyXG5cclxuICAgIHRoaXMuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBvcHRpb25zLmluaXRpYWxQb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIEF0b21zIGFuZCBib25kcyB0aGF0IGZvcm0gdGhpcyBtb2xlY3VsZS5cclxuICAgIHRoaXMuYXRvbXMgPSBbXTsgLy8gQHByaXZhdGUgRWxlbWVudHMgYXJlIG9mIHR5cGUgQXRvbXNcclxuICAgIHRoaXMuYXRvbWljQm9uZHMgPSBbXTsgLy8gQHByaXZhdGUgRWxlbWVudHMgYXJlIG9mIHR5cGUgQXRvbWljQm9uZHNcclxuXHJcbiAgICAvLyBTdHJ1Y3R1cmUgb2YgdGhlIG1vbGVjdWxlIGluIHRlcm1zIG9mIG9mZnNldHMgZnJvbSB0aGUgY2VudGVyIG9mIGdyYXZpdHkuICBUaGVzZSBpbmRpY2F0ZSB0aGUgYXRvbSdzIHBvc2l0aW9uIGluXHJcbiAgICAvLyB0aGUgXCJyZWxheGVkXCIgKGkuZS4gbm9uLXZpYnJhdGluZyksIG5vbi1yb3RhdGVkIHN0YXRlLlxyXG4gICAgdGhpcy5pbml0aWFsQXRvbUNvZ09mZnNldHMgPSB7fTsgLy8gQHByaXZhdGUgT2JqZWN0IGNvbnRhaW5zIGtleXMgb2YgdGhlIGF0b20ncyB1bmlxdWVJRCBhbmQgdmFsdWVzIG9mIHR5cGUgVmVjdG9yMlxyXG5cclxuICAgIC8vIFZpYnJhdGlvbiBvZmZzZXRzIC0gdGhlc2UgcmVwcmVzZW50IHRoZSBhbW91bnQgb2YgZGV2aWF0aW9uIGZyb20gdGhlIGluaXRpYWwgKGEuay5hIHJlbGF4ZWQpIGNvbmZpZ3VyYXRpb24gZm9yXHJcbiAgICAvLyBlYWNoIG1vbGVjdWxlLlxyXG4gICAgdGhpcy52aWJyYXRpb25BdG9tT2Zmc2V0cyA9IHt9OyAvLyBAcHJpdmF0ZSBPYmplY3QgY29udGFpbnMga2V5cyBvZiB0aGUgYXRvbSdzIHVuaXF1ZUlEIGFuZCB2YWx1ZXMgb2YgdHlwZSBWZWN0b3IyXHJcblxyXG4gICAgLy8gIE1hcCBjb250YWluaW5nIHRoZSBhdG9tcyB3aGljaCBjb21wb3NlIHRoaXMgbW9sZWN1bGUuICBBbGxvd3MgdXMgdG8gY2FsbCBvbiBlYWNoIGF0b20gYnkgdGhlaXIgdW5pcXVlIElELlxyXG4gICAgdGhpcy5hdG9tc0J5SUQgPSB7fTsgIC8vIEBwcml2YXRlIE9iamVjdHMgY29udGFpbnMga2V5cyBvZiB0aGUgYXRvbSdzIHVuaXF1ZUlELCBhbmQgdmFsdWVzIG9mIHR5cGUgYXRvbS5cclxuXHJcbiAgICAvLyBAcHVibGljIFZlbG9jaXR5IGZvciB0aGlzIG1vbGVjdWxlLlxyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgLy8gTWFwIHRoYXQgbWF0Y2hlcyBwaG90b24gd2F2ZWxlbmd0aHMgdG8gcGhvdG9uIGFic29ycHRpb24gc3RyYXRlZ2llcy4gVGhlIHN0cmF0ZWdpZXMgY29udGFpbmVkIGluIHRoaXMgc3RydWN0dXJlXHJcbiAgICAvLyBkZWZpbmUgd2hldGhlciB0aGUgbW9sZWN1bGUgY2FuIGFic29yYiBhIGdpdmVuIHBob3RvbiBhbmQsIGlmIGl0IGRvZXMgYWJzb3JiIGl0LCBob3cgaXQgd2lsbCByZWFjdC5cclxuICAgIC8vIE9iamVjdCB3aWxsIGNvbnRhaW4ga2V5cyBvZiB0eXBlIE51bWJlciBhbmQgdmFsdWVzIG9mIHR5cGUgUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5XHJcbiAgICB0aGlzLm1hcFdhdmVsZW5ndGhUb0Fic29ycHRpb25TdHJhdGVneSA9IHt9OyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEN1cnJlbnRseSBhY3RpdmUgcGhvdG9uIGFic29ycHRpb24gc3RyYXRlZ3ksIGFjdGl2ZSBiZWNhdXNlIGEgcGhvdG9uIHdhcyBhYnNvcmJlZCB0aGF0IGFjdGl2YXRlZCBpdC5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuYWN0aXZlUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5ID0gbmV3IE51bGxQaG90b25BYnNvcnB0aW9uU3RyYXRlZ3koIHRoaXMgKTtcclxuXHJcbiAgICAvLyBWYXJpYWJsZSB0aGF0IHByZXZlbnRzIHJlYWJzb3JwdGlvbiBmb3IgYSB3aGlsZSBhZnRlciBlbWl0dGluZyBhIHBob3Rvbi5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmFic29ycHRpb25IeXN0ZXJlc2lzQ291bnRkb3duVGltZSA9IDA7XHJcblxyXG4gICAgLy8gVGhlIFwicGFzcyB0aHJvdWdoIHBob3RvbiBsaXN0XCIga2VlcHMgdHJhY2sgb2YgcGhvdG9ucyB0aGF0IHdlcmUgbm90IGFic29yYmVkIGR1ZSB0byByYW5kb20gcHJvYmFiaWxpdHlcclxuICAgIC8vIChlc3NlbnRpYWxseSBhIHNpbXVsYXRpb24gb2YgcXVhbnR1bSBwcm9wZXJ0aWVzKS4gIElmIHRoaXMgbW9sZWN1bGUgaGFzIG5vIGFic29ycHRpb24gc3RyYXRlZ3kgZm9yIHRoZSBwaG90b24sXHJcbiAgICAvLyBpdCBpcyBhbHNvIGFkZGVkIHRvIHRoaXMgbGlzdC4gVGhpcyBpcyBuZWVkZWQgc2luY2UgdGhlIGFic29ycHRpb24gb2YgYSBnaXZlbiBwaG90b24gd2lsbCBsaWtlbHkgYmUgdGVzdGVkIGF0XHJcbiAgICAvLyBtYW55IHRpbWUgc3RlcHMgYXMgdGhlIHBob3RvbiBtb3ZlcyBwYXN0IHRoZSBtb2xlY3VsZSwgYW5kIHdlIGRvbid0IHdhbnQgdG8ga2VlcCBkZWNpZGluZyBhYm91dCB0aGUgc2FtZSBwaG90b24uXHJcbiAgICAvLyBBcnJheSB3aWxsIGhhdmUgc2l6ZSBQQVNTX1RIUk9VR0hfUEhPVE9OX0xJU1RfU0laRSB3aXRoIHR5cGUgTWljcm9QaG90b24uXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5wYXNzVGhyb3VnaFBob3Rvbkxpc3QgPSBbXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBUaGUgY3VycmVudCBwb2ludCB3aXRoaW4gdGhpcyBtb2xlY3VsZSdzIHZpYnJhdGlvbiBzZXF1ZW5jZS5cclxuICAgIHRoaXMuY3VycmVudFZpYnJhdGlvblJhZGlhbnNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIFRoZSBhbW91bnQgb2Ygcm90YXRpb24gY3VycmVudGx5IGFwcGxpZWQgdG8gdGhpcyBtb2xlY3VsZS4gIFRoaXMgaXMgcmVsYXRpdmUgdG8gaXRzIG9yaWdpbmFsLCBub24tcm90YXRlZCBzdGF0ZS5cclxuICAgIHRoaXMuY3VycmVudFJvdGF0aW9uUmFkaWFucyA9IDA7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBAcHVibGljIC0gQm9vbGVhbiB2YWx1ZXMgdGhhdCB0cmFjayB3aGV0aGVyIHRoZSBtb2xlY3VsZSBpcyB2aWJyYXRpbmcgb3Igcm90YXRpbmcuXHJcbiAgICB0aGlzLnZpYnJhdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWJyYXRpbmdQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlIC8vIFRvbyB0cmlja3kgdG8gbG9hZCBkeW5hbWljIHBhcnRpY2xlIHN0YXRlIGluIHRoZSBzdGF0ZSB3cmFwcGVyLCBhbmQgbm90IGVub3VnaCBiZW5lZml0LiAgT3B0IG91dCBmb3Igbm93LlxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5yb3RhdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyb3RhdGluZ1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UgLy8gVG9vIHRyaWNreSB0byBsb2FkIGR5bmFtaWMgcGFydGljbGUgc3RhdGUgaW4gdGhlIHN0YXRlIHdyYXBwZXIsIGFuZCBub3QgZW5vdWdoIGJlbmVmaXQuICBPcHQgb3V0IGZvciBub3cuXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIGRpcmVjdGlvbiBvZiByb3RhdGlvbi5cclxuICAgIHRoaXMucm90YXRpb25EaXJlY3Rpb25DbG9ja3dpc2VQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyb3RhdGlvbkRpcmVjdGlvbkNsb2Nrd2lzZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UgLy8gVG9vIHRyaWNreSB0byBsb2FkIGR5bmFtaWMgcGFydGljbGUgc3RhdGUgaW4gdGhlIHN0YXRlIHdyYXBwZXIsIGFuZCBub3QgZW5vdWdoIGJlbmVmaXQuICBPcHQgb3V0IGZvciBub3cuXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RGVyaXZlZFByb3BlcnR5Ljxib29sZWFuPn0gLSB3aGV0aGVyIG9yIG5vdCB0aGUgbW9sZWN1bGUgaXMgXCJzdHJldGNoaW5nXCIgb3IgXCJjb250cmFjdGluZ1wiIGluIGl0cyB2aWJyYXRpb24uXHJcbiAgICB0aGlzLmlzU3RyZXRjaGluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmN1cnJlbnRWaWJyYXRpb25SYWRpYW5zUHJvcGVydHkgXSwgdmlicmF0aW9uUmFkaWFucyA9PiB7XHJcblxyXG4gICAgICAvLyBtb3JlIGRpc3BsYWNlbWVudCB3aXRoIC1zaW4oIHZpYnJhdGlvblJhZGlhbnMgKSBhbmQgc28gd2hlbiB0aGUgc2xvcGUgb2YgdGhhdCBmdW5jdGlvbiBpcyBuZWdhdGl2ZVxyXG4gICAgICAvLyAoZGVyaXZhdGl2ZSBvZiBzaW4gaXMgY29zKSB0aGUgYXRvbXMgYXJlIGV4cGFuZGluZ1xyXG4gICAgICByZXR1cm4gTWF0aC5jb3MoIHZpYnJhdGlvblJhZGlhbnMgKSA8IDA7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYywgc2V0IGJ5IFBob3RvbkFic29ycHRpb25Nb2RlbFxyXG4gICAgdGhpcy5waG90b25Hcm91cCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RW1pdHRlcn0gLSBlbWl0dGVyIGZvciB3aGVuIGEgcGhvdG9uIGlzIGFic29yYmVkXHJcbiAgICB0aGlzLnBob3RvbkFic29yYmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IE1pY3JvUGhvdG9uIH0gXSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RW1pdHRlcn0gLSBlbWl0dGVyIGZvciB3aGVuIGEgcGhvdG9uIGlzIGVtaXR0ZWRcclxuICAgIHRoaXMucGhvdG9uRW1pdHRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBNaWNyb1Bob3RvbiB9IF0gfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VtaXR0ZXJ9IC0gZW1pdHRlciBmb3Igd2hlbiBhIHBob3RvbiBwYXNzZXMgdGhyb3VnaCB0aGUgbW9sZWN1bGUgd2l0aG91dCBhYnNvcnB0aW9uc1xyXG4gICAgdGhpcy5waG90b25QYXNzZWRUaHJvdWdoRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IE1pY3JvUGhvdG9uIH0gXSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBFbWl0dGVyIGZvciAnYnJva2VBcGFydCcgZXZlbnQsIHdoZW4gYSBtb2xlY3VsZSBicmVha3MgaW50byB0d28gbmV3IG1vbGVjdWxlc1xyXG4gICAgdGhpcy5icm9rZUFwYXJ0RW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IHZhbHVlVHlwZTogTW9sZWN1bGUgfSxcclxuICAgICAgICB7IHZhbHVlVHlwZTogTW9sZWN1bGUgfVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgbW9sZWN1bGUuICBBbnkgcGhvdG9ucyB0aGF0IGhhdmUgYmVlbiBhYnNvcmJlZCBhcmUgZm9yZ290dGVuLCBhbmQgYW55IHZpYnJhdGlvbiBpcyByZXNldC5cclxuICAgKiBAcHVibGljXHJcbiAgICoqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5oaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYWN0aXZlUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFjdGl2ZVBob3RvbkFic29ycHRpb25TdHJhdGVneSA9IG5ldyBOdWxsUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5KCB0aGlzICk7XHJcbiAgICB0aGlzLmFic29ycHRpb25IeXN0ZXJlc2lzQ291bnRkb3duVGltZSA9IDA7XHJcbiAgICB0aGlzLnZpYnJhdGluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJvdGF0aW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucm90YXRpb25EaXJlY3Rpb25DbG9ja3dpc2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zZXRSb3RhdGlvbiggMCApO1xyXG4gICAgdGhpcy5zZXRWaWJyYXRpb24oIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZXNlIHByb3BlcnRpZXMgYXJlIG93bmVkIGJ5IHRoaXMgbW9sZWN1bGUgc28gdGhleSBjYW4gYmUgZGlzcG9zZWQgZGlyZWN0bHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnZpYnJhdGluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMucm90YXRpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnJvdGF0aW9uRGlyZWN0aW9uQ2xvY2t3aXNlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5oaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5waG90b25FbWl0dGVkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnBob3RvblBhc3NlZFRocm91Z2hFbWl0dGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgcGhvdG9uIGFic29ycHRpb24gc3RyYXRlZ3kgZm9yIHRoaXMgbW9sZWN1bGUgZm9yIGEgZ2l2ZW4gcGhvdG9uIHdhdmVsZW5ndGguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdhdmVsZW5ndGggLSB3YXZlbGVuZ3RoIGF0dHJpYnV0ZWQgdG8gdGhpcyBhYnNvcnB0aW9uIHN0cmF0ZWd5LlxyXG4gICAqIEBwYXJhbSB7UGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5fSBzdHJhdGVneVxyXG4gICAqL1xyXG4gIHNldFBob3RvbkFic29ycHRpb25TdHJhdGVneSggd2F2ZWxlbmd0aCwgc3RyYXRlZ3kgKSB7XHJcbiAgICB0aGlzLm1hcFdhdmVsZW5ndGhUb0Fic29ycHRpb25TdHJhdGVneVsgd2F2ZWxlbmd0aCBdID0gc3RyYXRlZ3k7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFic29ycHRpb24gc3RyYXRlZ3kgZm9yIHRoaXMgbW9sZWN1bGUgZm9yIHRoZSBwcm92aWRlZCB3YXZlbGVuZ3RoLiBOb3RlIHRoYXQgdGhpcyBkb2VzIE5PVCByZXR1cm5cclxuICAgKiB0aGUgYWN0aXZlIGFic29ycHRpb24gc3RyYXRlZ3kgYWZ0ZXIgYW4gYWJzb3JwdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcnxudWxsfSB3YXZlbGVuZ3RoIC0gbnVsbCBpZiB0aGVyZSBpcyBubyBzdHJhdGVneSBmb3IgdGhlIHdhdmVsZW5ndGhcclxuICAgKi9cclxuICBnZXRQaG90b25BYnNvcnB0aW9uU3RyYXRlZ3lGb3JXYXZlbGVuZ3RoKCB3YXZlbGVuZ3RoICkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFwV2F2ZWxlbmd0aFRvQWJzb3JwdGlvblN0cmF0ZWd5WyB3YXZlbGVuZ3RoIF0gfHwgbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB0byBzZWUgaWYgYSBwaG90b24gaGFzIGJlZW4gYWJzb3JiZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNQaG90b25BYnNvcmJlZCgpIHtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBhY3RpdmUgbm9uLW51bGwgcGhvdG9uIGFic29ycHRpb24gc3RyYXRlZ3ksIGl0IGluZGljYXRlcyB0aGF0IGEgcGhvdG9uIGhhcyBiZWVuIGFic29yYmVkLlxyXG4gICAgcmV0dXJuICEoIHRoaXMuYWN0aXZlUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5IGluc3RhbmNlb2YgTnVsbFBob3RvbkFic29ycHRpb25TdHJhdGVneSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGFuIGluaXRpYWwgb2Zmc2V0IGZyb20gdGhlIG1vbGVjdWxlJ3MgQ2VudGVyIG9mIEdyYXZpdHkgKENPRykuIFRoZSBvZmZzZXQgaXMgXCJpbml0aWFsXCIgYmVjYXVzZSB0aGlzIGlzIHdoZXJlXHJcbiAgICogdGhlIGF0b20gc2hvdWxkIGJlIHdoZW4gaXQgaXMgbm90IHZpYnJhdGluZyBvciByb3RhdGluZy5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0F0b20gfHwgQ2FyYm9uQXRvbSB8fCBIeWRyb2dlbkF0b20gfHwgTml0cm9nZW5BdG9tIHx8IE94eWdlbkF0b219IGF0b21cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IG9mZnNldCAtIEluaXRpYWwgQ09HIG9mZnNldCBmb3Igd2hlbiBhdG9tIGlzIG5vdCB2aWJyYXRpbmcgb3Igcm90YXRpbmcuXHJcbiAgICovXHJcbiAgYWRkSW5pdGlhbEF0b21Db2dPZmZzZXQoIGF0b20sIG9mZnNldCApIHtcclxuICAgIC8vIENoZWNrIHRoYXQgdGhlIHNwZWNpZmllZCBhdG9tIGlzIGEgcGFydCBvZiB0aGlzIG1vbGVjdWxlLiAgV2hpbGUgaXQgd291bGQgcHJvYmFibHkgd29yayB0byBhZGQgdGhlIG9mZnNldHNcclxuICAgIC8vIGZpcnN0IGFuZCB0aGUgYXRvbXMgbGF0ZXIsIHRoYXQncyBub3QgaG93IHRoZSBzaW0gd2FzIGRlc2lnbmVkLCBzbyB0aGlzIGlzIHNvbWUgZW5mb3JjZW1lbnQgb2YgdGhlIFwiYWRkIHRoZVxyXG4gICAgLy8gYXRvbXMgZmlyc3RcIiBwb2xpY3kuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmF0b21zLmluZGV4T2YoIGF0b20gKSA+PSAwICk7XHJcbiAgICB0aGlzLmluaXRpYWxBdG9tQ29nT2Zmc2V0c1sgYXRvbS51bmlxdWVJRCBdID0gb2Zmc2V0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBpbml0aWFsIG9mZnNldCBmcm9tIHRoZSBtb2xlY3VsZSdzIGNlbnRlciBvZiBncmF2aXR5IChDT0cpIGZvciB0aGUgc3BlY2lmaWVkIGF0b20uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBdG9tfSBhdG9tXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICoqL1xyXG4gIGdldEluaXRpYWxBdG9tQ29nT2Zmc2V0KCBhdG9tICkge1xyXG4gICAgaWYgKCAhKCBhdG9tLnVuaXF1ZUlEIGluIHRoaXMuaW5pdGlhbEF0b21Db2dPZmZzZXRzICkgKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCAnIC0gV2FybmluZzogQXR0ZW1wdCB0byBnZXQgaW5pdGlhbCBDT0cgb2Zmc2V0IGZvciBhdG9tIHRoYXQgaXMgbm90IGluIG1vbGVjdWxlLicgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmluaXRpYWxBdG9tQ29nT2Zmc2V0c1sgYXRvbS51bmlxdWVJRCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjdXJyZW50IHZpYnJhdGlvbiBvZmZzZXQgZnJvbSB0aGUgbW9sZWN1bGUncyBjZW50ZXIgb2YgZ3Jhdml0eSAoQ09HKSBmb3IgdGhlIHNwZWNpZmllZCBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0F0b219IGF0b21cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gLSBWZWN0b3IgcmVwcmVzZW50aW5nIHBvc2l0aW9uIG9mIHZpYnJhdGlvbiBvZmZzZXQgZnJvbSBtb2xlY3VsZSdzIGNlbnRlciBvZiBncmF2aXR5LlxyXG4gICAqL1xyXG4gIGdldFZpYnJhdGlvbkF0b21PZmZzZXQoIGF0b20gKSB7XHJcbiAgICBpZiAoICEoIGF0b20udW5pcXVlSUQgaW4gdGhpcy52aWJyYXRpb25BdG9tT2Zmc2V0cyApICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggJyAtIFdhcm5pbmc6IEF0dGVtcHQgdG8gZ2V0IHZpYnJhdGlvbmFsIENPRyBvZmZzZXQgZm9yIGF0b20gdGhhdCBpcyBub3QgaW4gbW9sZWN1bGUuJyApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudmlicmF0aW9uQXRvbU9mZnNldHNbIGF0b20udW5pcXVlSUQgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkdmFuY2UgdGhlIG1vbGVjdWxlIG9uZSBzdGVwIGluIHRpbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZGVsdGEgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuYWN0aXZlUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5LnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgLy8gTm90IGVxdWFsIHRvIHplcm8sIGJlY2F1c2UgdGhhdCBjYXNlIGlzIGNvdmVyZWQgd2hlbiBjaGVja2luZyB0byBlbWl0IHRoZSBwaG90b24uXHJcbiAgICBpZiAoIHRoaXMuYWJzb3JwdGlvbkh5c3RlcmVzaXNDb3VudGRvd25UaW1lID4gMCApIHtcclxuICAgICAgdGhpcy5hYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWUgLT0gZHQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnZpYnJhdGluZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICB0aGlzLmFkdmFuY2VWaWJyYXRpb24oIGR0ICogVklCUkFUSU9OX0ZSRVFVRU5DWSAqIDIgKiBNYXRoLlBJICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnJvdGF0aW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIGNvbnN0IGRpcmVjdGlvbk11bHRpcGxpZXIgPSB0aGlzLnJvdGF0aW9uRGlyZWN0aW9uQ2xvY2t3aXNlUHJvcGVydHkuZ2V0KCkgPyAtMSA6IDE7XHJcbiAgICAgIHRoaXMucm90YXRlKCBkdCAqIFJPVEFUSU9OX1JBVEUgKiAyICogTWF0aC5QSSAqIGRpcmVjdGlvbk11bHRpcGxpZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEbyBhbnkgbGluZWFyIG1vdmVtZW50IHRoYXQgaXMgcmVxdWlyZWQuXHJcbiAgICB0aGlzLnNldENlbnRlck9mR3Jhdml0eVBvcyhcclxuICAgICAgdGhpcy5jZW50ZXJPZkdyYXZpdHlQcm9wZXJ0eS5nZXQoKS54ICsgdGhpcy52ZWxvY2l0eS54ICogZHQsXHJcbiAgICAgIHRoaXMuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkuZ2V0KCkueSArIHRoaXMudmVsb2NpdHkueSAqIGR0XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IFZlY3RvcjIgZGVzY3JpYmluZyB0aGUgcG9zaXRpb24gb2YgdGhpcyBtb2xlY3VsZSdzIGNlbnRlciBvZiBncmF2aXR5LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqKi9cclxuICBnZXRDZW50ZXJPZkdyYXZpdHlQb3MoKSB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkuZ2V0KCkueCwgdGhpcy5jZW50ZXJPZkdyYXZpdHlQcm9wZXJ0eS5nZXQoKS55ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgbW9sZWN1bGUgYnkgc3BlY2lmeWluZyB0aGUgY2VudGVyIG9mIGdyYXZpdHkuICBUaGlzIHdpbGwgYmUgdW5pcXVlIHRvIGVhY2ggbW9sZWN1bGUnc1xyXG4gICAqIGNvbmZpZ3VyYXRpb24sIGFuZCBpdCB3aWxsIGNhdXNlIHRoZSBpbmRpdmlkdWFsIG1vbGVjdWxlcyB0byBiZSBsb2NhdGVkIHN1Y2ggdGhhdCB0aGUgY2VudGVyIG9mIGdyYXZpdHkgaXMgaW5cclxuICAgKiB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uLiAgVGhlIHJlbGF0aXZlIG9yaWVudGF0aW9uIG9mIHRoZSBhdG9tcyB0aGF0IGNvbXByaXNlIHRoZSBtb2xlY3VsZXMgd2lsbCBub3QgYmUgY2hhbmdlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHRoZSB4IHBvc2l0aW9uIHRvIHNldFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gdGhlIHkgcG9zaXRpb24gdG8gc2V0XHJcbiAgICoqL1xyXG4gIHNldENlbnRlck9mR3Jhdml0eVBvcyggeCwgeSApIHtcclxuICAgIGlmICggdGhpcy5jZW50ZXJPZkdyYXZpdHlQcm9wZXJ0eS5nZXQoKS54ICE9PSB4IHx8IHRoaXMuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkuZ2V0KCkueSAhPT0geSApIHtcclxuICAgICAgdGhpcy5jZW50ZXJPZkdyYXZpdHlQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB4LCB5ICkgKTtcclxuICAgICAgdGhpcy51cGRhdGVBdG9tUG9zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgbW9sZWN1bGUgYnkgc3BlY2lmeWluZyB0aGUgY2VudGVyIG9mIGdyYXZpdHkuIEFsbG93cyBwYXNzaW5nIGEgVmVjdG9yMiBpbnRvXHJcbiAgICogc2V0Q2VudGVyT2ZHcmF2aXR5UG9zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gY2VudGVyT2ZHcmF2aXR5UG9zIC0gQSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBkZXNpcmVkIHBvc2l0aW9uIGZvciB0aGlzIG1vbGVjdWxlLlxyXG4gICAqKi9cclxuICBzZXRDZW50ZXJPZkdyYXZpdHlQb3NWZWMoIGNlbnRlck9mR3Jhdml0eVBvcyApIHtcclxuICAgIHRoaXMuc2V0Q2VudGVyT2ZHcmF2aXR5UG9zKCBjZW50ZXJPZkdyYXZpdHlQb3MueCwgY2VudGVyT2ZHcmF2aXR5UG9zLnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBsYWNlaG9sZGVyIGZvciBzZXRWaWJyYXRpb24gZnVuY3Rpb24uICBUaGlzIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IG1vbGVjdWxlcyB0aGF0IGhhdmUgdmlicmF0aW9uXHJcbiAgICogc3RyYXRlZ2llcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmlicmF0aW9uUmFkaWFuc1xyXG4gICAqL1xyXG4gIHNldFZpYnJhdGlvbiggdmlicmF0aW9uUmFkaWFucyApIHtcclxuICAgIC8vIEltcGxlbWVudHMgbm8gdmlicmF0aW9uIGJ5IGRlZmF1bHQsIG92ZXJyaWRlIGluIGRlc2NlbmRhbnQgY2xhc3NlcyBhcyBuZWVkZWQuXHJcbiAgICB0aGlzLmN1cnJlbnRWaWJyYXRpb25SYWRpYW5zUHJvcGVydHkuc2V0KCB2aWJyYXRpb25SYWRpYW5zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlIHRoZSB2aWJyYXRpb24gYnkgdGhlIHByZXNjcmliZWQgcmFkaWFucy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhUmFkaWFucyAtIENoYW5nZSBvZiB2aWJyYXRpb24gYW5nbGUgaW4gcmFkaWFucy5cclxuICAgKiovXHJcbiAgYWR2YW5jZVZpYnJhdGlvbiggZGVsdGFSYWRpYW5zICkge1xyXG4gICAgdGhpcy5jdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5LnNldCggdGhpcy5jdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5LmdldCgpICsgZGVsdGFSYWRpYW5zICk7XHJcbiAgICB0aGlzLnNldFZpYnJhdGlvbiggdGhpcy5jdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3RhdGUgdGhlIG1vbGVjdWxlIGFib3V0IHRoZSBjZW50ZXIgb2YgZ3Jhdml0eSBieSB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiByYWRpYW5zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YVJhZGlhbnMgLSBDaGFuZ2UgaW4gcmFkaWFucyBvZiB0aGUgTW9sZWN1bGUncyBhbmdsZSBhYm91dCB0aGUgY2VudGVyIG9mIEdyYXZpdHkuXHJcbiAgICoqL1xyXG4gIHJvdGF0ZSggZGVsdGFSYWRpYW5zICkge1xyXG4gICAgdGhpcy5zZXRSb3RhdGlvbiggKCB0aGlzLmN1cnJlbnRSb3RhdGlvblJhZGlhbnMgKyBkZWx0YVJhZGlhbnMgKSAlICggTWF0aC5QSSAqIDIgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSByb3RhdGlvbiBhbmdsZSBvZiB0aGUgTW9sZWN1bGUgaW4gcmFkaWFucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaWFuc1xyXG4gICAqKi9cclxuICBzZXRSb3RhdGlvbiggcmFkaWFucyApIHtcclxuICAgIGlmICggcmFkaWFucyAhPT0gdGhpcy5jdXJyZW50Um90YXRpb25SYWRpYW5zICkge1xyXG4gICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvblJhZGlhbnMgPSByYWRpYW5zO1xyXG4gICAgICB0aGlzLnVwZGF0ZUF0b21Qb3NpdGlvbnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhdXNlIHRoZSBtb2xlY3VsZSB0byBkaXNzb2NpYXRlLCBpLmUuIHRvIGJyZWFrIGFwYXJ0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiovXHJcbiAgYnJlYWtBcGFydCgpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoICcgRXJyb3I6IGJyZWFrQXBhcnQgaW52b2tlZCBvbiBhIG1vbGVjdWxlIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIG5vdCBpbXBsZW1lbnRlZC4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFyayBhIHBob3RvbiBmb3IgcGFzc2luZyB0aHJvdWdoIHRoZSBtb2xlY3VsZS4gIFRoaXMgbWVhbnMgdGhhdCB0aGUgcGhvdG9uIHdpbGwgbm90IGludGVyYWN0IHdpdGggdGhlIG1vbGVjdWxlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWljcm9QaG90b259IHBob3RvbiAtIFRoZSBwaG90b24gdG8gYmUgcGFzc2VkIHRocm91Z2guXHJcbiAgICoqL1xyXG4gIG1hcmtQaG90b25Gb3JQYXNzVGhyb3VnaCggcGhvdG9uICkge1xyXG4gICAgaWYgKCB0aGlzLnBhc3NUaHJvdWdoUGhvdG9uTGlzdC5sZW5ndGggPj0gUEFTU19USFJPVUdIX1BIT1RPTl9MSVNUX1NJWkUgKSB7XHJcbiAgICAgIC8vIE1ha2Ugcm9vbSBmb3IgdGhpcyBwaG90b24gYmUgZGVsZXRpbmcgdGhlIG9sZGVzdCBvbmUuXHJcbiAgICAgIHRoaXMucGFzc1Rocm91Z2hQaG90b25MaXN0LnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhc3NUaHJvdWdoUGhvdG9uTGlzdC5wdXNoKCBwaG90b24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiBhIHBob3RvbiBpcyBtYXJrZWQgdG8gYmUgcGFzc2VkIHRocm91Z2ggdGhpcyBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01pY3JvUGhvdG9ufSBwaG90b25cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiovXHJcbiAgaXNQaG90b25NYXJrZWRGb3JQYXNzVGhyb3VnaCggcGhvdG9uICkge1xyXG4gICAgLy8gVXNlIGluZGV4T2YgdG8gc2VlIGlmIHRoZSBwaG90b24gZXhpc3RzIGluIHRoZSBsaXN0LiBJZiB0aGUgcGhvdG9uIGlzIG5vdCBpbiB0aGUgbGlzdCwgaW5kZXhPZiB3aWxsIHJldHVybiAtMS5cclxuICAgIHJldHVybiB0aGlzLnBhc3NUaHJvdWdoUGhvdG9uTGlzdC5pbmRleE9mKCBwaG90b24gKSA+IC0xO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IGFycmF5IGNvbnRhaW5pbmcgdGhlIGF0b21zIHdoaWNoIGNvbXBvc2UgdGhpcyBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEF0b20+fSAtIEFycmF5IGNvbnRhaW5pbmcgdGhlIGF0b21zIHdoaWNoIGNvbXBvc2UgdGhpcyBtb2xlY3VsZS5cclxuICAgKiovXHJcbiAgZ2V0QXRvbXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdG9tcy5zbGljZSggMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IGFycmF5IGNvbnRhaW5pbmcgdGhpcyBNb2xlY3VsZXMgYXRvbWljIGJvbmRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48QXRvbWljQm9uZD59IC0gQXJyYXkgY29udGFpbmluZyB0aGUgYXRvbWljIGJvbmRzIGNvbnN0cnVjdGluZyB0aGlzIG1vbGVjdWxlLlxyXG4gICAqKi9cclxuICBnZXRBdG9taWNCb25kcygpIHtcclxuICAgIHJldHVybiB0aGlzLmF0b21pY0JvbmRzLnNsaWNlKCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWNpZGUgd2hldGhlciBvciBub3QgdG8gYWJzb3JiIHRoZSBvZmZlcmVkIHBob3Rvbi4gIElmIHRoZSBwaG90b24gaXMgYWJzb3JiZWQsIHRoZSBtYXRjaGluZyBhYnNvcnB0aW9uIHN0cmF0ZWd5XHJcbiAgICogaXMgc2V0IHNvIHRoYXQgaXQgY2FuIGNvbnRyb2wgdGhlIG1vbGVjdWxlJ3MgcG9zdC1hYnNvcnB0aW9uIGJlaGF2aW9yLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWljcm9QaG90b259IHBob3RvbiAtIHRoZSBwaG90b24gb2ZmZXJlZCBmb3IgYWJzb3JwdGlvblxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBhYnNvcmJQaG90b25cclxuICAgKiovXHJcbiAgcXVlcnlBYnNvcmJQaG90b24oIHBob3RvbiApIHtcclxuXHJcbiAgICBsZXQgYWJzb3JiUGhvdG9uID0gZmFsc2U7XHJcblxyXG4gICAgLy8gVE9ETzogTmVlZCB0byBkZXRlcm1pbmUgaWYgdGhlIHBob3RvbiBhcyBwYXNzZWQgdGhyb3VnaCBhbmQgZW1pdCBoZXJlLlxyXG5cclxuICAgIGlmICggdGhpcy5hYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWUgPD0gMCAmJlxyXG4gICAgICAgICBwaG90b24ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggdGhpcy5nZXRDZW50ZXJPZkdyYXZpdHlQb3MoKSApIDwgUEhPVE9OX0FCU09SUFRJT05fRElTVEFOQ0UgJiZcclxuICAgICAgICAgIXRoaXMuaXNQaG90b25NYXJrZWRGb3JQYXNzVGhyb3VnaCggcGhvdG9uICkgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgY2lyY3Vtc3RhbmNlcyBmb3IgYWJzb3JwdGlvbiBhcmUgY29ycmVjdCwgYnV0IGRvIHdlIGhhdmUgYW4gYWJzb3JwdGlvbiBzdHJhdGVneSBmb3IgdGhpcyBwaG90b24nc1xyXG4gICAgICAvLyB3YXZlbGVuZ3RoP1xyXG4gICAgICBjb25zdCBjYW5kaWRhdGVBYnNvcnB0aW9uU3RyYXRlZ3kgPSB0aGlzLm1hcFdhdmVsZW5ndGhUb0Fic29ycHRpb25TdHJhdGVneVsgcGhvdG9uLndhdmVsZW5ndGggXTtcclxuICAgICAgaWYgKCBjYW5kaWRhdGVBYnNvcnB0aW9uU3RyYXRlZ3kgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5pc1Bob3RvbkFic29yYmVkKCkgKSB7XHJcblxyXG4gICAgICAgIC8vIFllcywgdGhlcmUgaXMgYSBzdHJhdGVneSBhdmFpbGFibGUgZm9yIHRoaXMgd2F2ZWxlbmd0aC4gQXNrIGl0IGlmIGl0IHdhbnRzIHRoZSBwaG90b24uXHJcbiAgICAgICAgaWYgKCBjYW5kaWRhdGVBYnNvcnB0aW9uU3RyYXRlZ3kucXVlcnlBbmRBYnNvcmJQaG90b24oIHBob3RvbiApICkge1xyXG5cclxuICAgICAgICAgIC8vIEl0IGRvZXMgd2FudCBpdCwgc28gY29uc2lkZXIgdGhlIHBob3RvbiBhYnNvcmJlZC5cclxuICAgICAgICAgIGFic29yYlBob3RvbiA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZVBob3RvbkFic29ycHRpb25TdHJhdGVneSA9IGNhbmRpZGF0ZUFic29ycHRpb25TdHJhdGVneTtcclxuICAgICAgICAgIHRoaXMuYWN0aXZlUGhvdG9uQWJzb3JwdGlvblN0cmF0ZWd5LnF1ZXJ5QW5kQWJzb3JiUGhvdG9uKCBwaG90b24gKTtcclxuICAgICAgICAgIHRoaXMucGhvdG9uQWJzb3JiZWRFbWl0dGVyLmVtaXQoIHBob3RvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBXZSBoYXZlIHRoZSBkZWNpc2lvbiBsb2dpYyBvbmNlIGZvciB3aGV0aGVyIGEgcGhvdG9uIHNob3VsZCBiZSBhYnNvcmJlZCwgc28gaXQgaXMgbm90IHF1ZXJpZWQgYSBzZWNvbmRcclxuICAgICAgICAgIC8vIHRpbWUuXHJcbiAgICAgICAgICB0aGlzLm1hcmtQaG90b25Gb3JQYXNzVGhyb3VnaCggcGhvdG9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICB0aGlzLm1hcmtQaG90b25Gb3JQYXNzVGhyb3VnaCggcGhvdG9uICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGJyb2FkY2FzdCB0aGF0IGl0IHdhcyBkZWNpZGVkIHRoYXQgdGhpcyBwaG90b24gc2hvdWxkIHBhc3MgdGhyb3VnaCB0aGUgbW9sZWN1bGUgLSBvbmx5IGRvbmUgaWYgdGhlIHBob3RvblxyXG4gICAgICAvLyB3YXMgY2xvc2UgZW5vdWdoXHJcbiAgICAgIGlmICggIWFic29yYlBob3RvbiApIHtcclxuICAgICAgICB0aGlzLnBob3RvblBhc3NlZFRocm91Z2hFbWl0dGVyLmVtaXQoIHBob3RvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFic29yYlBob3RvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhdG9tIHRvIHRoZSBsaXN0IG9mIGF0b21zIHdoaWNoIGNvbXBvc2UgdGhpcyBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0F0b219IGF0b20gLSBUaGUgYXRvbSB0byBiZSBhZGRlZFxyXG4gICAqKi9cclxuICBhZGRBdG9tKCBhdG9tICkge1xyXG4gICAgdGhpcy5hdG9tcy5wdXNoKCBhdG9tICk7XHJcbiAgICB0aGlzLmluaXRpYWxBdG9tQ29nT2Zmc2V0c1sgYXRvbS51bmlxdWVJRCBdID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMudmlicmF0aW9uQXRvbU9mZnNldHNbIGF0b20udW5pcXVlSUQgXSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICB0aGlzLmF0b21zQnlJRFsgYXRvbS51bmlxdWVJRCBdID0gYXRvbTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhdG9taWMgYm9uZCB0byB0aGlzIE1vbGVjdWxlJ3MgbGlzdCBvZiBhdG9taWMgYm9uZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBdG9taWNCb25kfSBhdG9taWNCb25kIC0gVGhlIGF0b21pYyBib25kIHRvIGJlIGFkZGVkLlxyXG4gICAqKi9cclxuICBhZGRBdG9taWNCb25kKCBhdG9taWNCb25kICkge1xyXG4gICAgdGhpcy5hdG9taWNCb25kcy5wdXNoKCBhdG9taWNCb25kICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbWl0IGEgcGhvdG9uIG9mIHRoZSBzcGVjaWZpZWQgd2F2ZWxlbmd0aCBpbiBhIHJhbmRvbSBkaXJlY3Rpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdhdmVsZW5ndGggLSBUaGUgcGhvdG9uIHRvIGJlIGVtaXR0ZWQuXHJcbiAgICoqL1xyXG4gIGVtaXRQaG90b24oIHdhdmVsZW5ndGggKSB7XHJcbiAgICBjb25zdCBwaG90b25Ub0VtaXQgPSB0aGlzLnBob3Rvbkdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCB3YXZlbGVuZ3RoICk7XHJcbiAgICBjb25zdCBlbWlzc2lvbkFuZ2xlID0gZG90UmFuZG9tLm5leHREb3VibGUoKSAqIE1hdGguUEkgKiAyO1xyXG4gICAgcGhvdG9uVG9FbWl0LnNldFZlbG9jaXR5KCBQSE9UT05fRU1JU1NJT05fU1BFRUQgKiBNYXRoLmNvcyggZW1pc3Npb25BbmdsZSApLFxyXG4gICAgICAoIFBIT1RPTl9FTUlTU0lPTl9TUEVFRCAqIE1hdGguc2luKCBlbWlzc2lvbkFuZ2xlICkgKSApO1xyXG4gICAgY29uc3QgY2VudGVyT2ZHcmF2aXR5UG9zUmVmID0gdGhpcy5jZW50ZXJPZkdyYXZpdHlQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHBob3RvblRvRW1pdC5wb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCBjZW50ZXJPZkdyYXZpdHlQb3NSZWYueCwgY2VudGVyT2ZHcmF2aXR5UG9zUmVmLnkgKTtcclxuICAgIHRoaXMuYWJzb3JwdGlvbkh5c3RlcmVzaXNDb3VudGRvd25UaW1lID0gQUJTT1JQVElPTl9IWVNURVJFU0lTX1RJTUU7XHJcbiAgICB0aGlzLnBob3RvbkVtaXR0ZWRFbWl0dGVyLmVtaXQoIHBob3RvblRvRW1pdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhdG9tcyB0aGUgbW9sZWN1bGUgJ3ZpYnJhdGlvbicgaXMgcmVwcmVzZW50ZWQgYnkgc3RyZXRjaGluZy4gSWYgZmFsc2UsIHZpYnJhdGlvbiBpcyByZXByZXNlbnRlZFxyXG4gICAqIHdpdGggYmVuZGluZy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB2aWJyYXRlc0J5U3RyZXRjaGluZygpIHtcclxuICAgIHJldHVybiB0aGlzLmF0b21zLmxlbmd0aCA8PSAyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBwb3NpdGlvbnMgb2YgYWxsIGF0b21zIHRoYXQgY29tcHJpc2UgdGhpcyBtb2xlY3VsZSBiYXNlZCBvbiB0aGUgY3VycmVudCBjZW50ZXIgb2YgZ3Jhdml0eSBhbmQgdGhlXHJcbiAgICogb2Zmc2V0IGZvciBlYWNoIGF0b20uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqKi9cclxuICB1cGRhdGVBdG9tUG9zaXRpb25zKCkge1xyXG5cclxuICAgIGZvciAoIGNvbnN0IHVuaXF1ZUlEIGluIHRoaXMuaW5pdGlhbEF0b21Db2dPZmZzZXRzICkge1xyXG4gICAgICBpZiAoIHRoaXMuaW5pdGlhbEF0b21Db2dPZmZzZXRzLmhhc093blByb3BlcnR5KCB1bmlxdWVJRCApICkge1xyXG4gICAgICAgIGNvbnN0IGF0b21PZmZzZXQgPSBuZXcgVmVjdG9yMiggdGhpcy5pbml0aWFsQXRvbUNvZ09mZnNldHNbIHVuaXF1ZUlEIF0ueCwgdGhpcy5pbml0aWFsQXRvbUNvZ09mZnNldHNbIHVuaXF1ZUlEIF0ueSApO1xyXG4gICAgICAgIC8vIEFkZCB0aGUgdmlicmF0aW9uLCBpZiBhbnkgZXhpc3RzLlxyXG4gICAgICAgIGF0b21PZmZzZXQuYWRkKCB0aGlzLnZpYnJhdGlvbkF0b21PZmZzZXRzWyB1bmlxdWVJRCBdICk7XHJcbiAgICAgICAgLy8gUm90YXRlLlxyXG4gICAgICAgIGF0b21PZmZzZXQucm90YXRlKCB0aGlzLmN1cnJlbnRSb3RhdGlvblJhZGlhbnMgKTtcclxuICAgICAgICAvLyBTZXQgcG9zaXRpb24gYmFzZWQgb24gY29tYmluYXRpb24gb2Ygb2Zmc2V0IGFuZCBjdXJyZW50IGNlbnRlclxyXG4gICAgICAgIC8vIG9mIGdyYXZpdHkuXHJcbiAgICAgICAgdGhpcy5hdG9tc0J5SURbIHVuaXF1ZUlEIF0ucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB0aGlzLmNlbnRlck9mR3Jhdml0eVByb3BlcnR5LmdldCgpLnggKyBhdG9tT2Zmc2V0LngsIHRoaXMuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkuZ2V0KCkueSArIGF0b21PZmZzZXQueSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgdGhlIG9mZnNldHMgZnJvbSB0aGUgY2VudGVyIG9mIGdyYXZpdHkgZm9yIGVhY2ggYXRvbSB3aXRoaW4gdGhpcyBtb2xlY3VsZS4gIFRoaXMgc2hvdWxkIGJlIGluIHRoZVxyXG4gICAqICdyZWxheGVkJyAoaS5lLiBub24tdmlicmF0aW5nKSBzdGF0ZS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQGFic3RyYWN0XHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZUF0b21PZmZzZXRzKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnaW5pdGlhbGl6ZUF0b21PZmZzZXRzIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IG1vbGVjdWxlcy4nICk7XHJcbiAgfVxyXG5cclxuICAvLyBzZXJpYWxpemF0aW9uIHN1cHBvcnRcclxuICAvLyBAcHVibGljXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIC8vIFRoaXMgc2VyaWFsaXplcyB0aGUgbWluaW11bSBzZXQgb2YgYXR0cmlidXRlcyBuZWNlc3NhcnkgdG8gZGVzZXJpYWxpemUgd2hlbiBwcm92aWRlZCBiYWNrLiAgSSAoamJsYW5jbykgYW0gbm90XHJcbiAgICAvLyBhYnNvbHV0ZWx5IGNlcnRhaW4gdGhhdCB0aGlzIGlzIGV2ZXJ5dGhpbmcgbmVlZGVkLCBzbyBmZWVsIGZyZWUgdG8gYWRkIHNvbWUgb2YgdGhlIG90aGVyIGF0dHJpYnV0ZXMgaWYgbmVlZGVkLlxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZTogdGhpcy5oaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIGNlbnRlck9mR3Jhdml0eTogdGhpcy5jZW50ZXJPZkdyYXZpdHlQcm9wZXJ0eS5nZXQoKS50b1N0YXRlT2JqZWN0KCksXHJcbiAgICAgIGF0b21zOiBzZXJpYWxpemVBcnJheSggdGhpcy5hdG9tcyApLFxyXG4gICAgICBhdG9taWNCb25kczogc2VyaWFsaXplQXJyYXkoIHRoaXMuYXRvbWljQm9uZHMgKSxcclxuICAgICAgdmVsb2NpdHk6IHRoaXMudmVsb2NpdHkudG9TdGF0ZU9iamVjdCgpLFxyXG4gICAgICBhYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWU6IHRoaXMuYWJzb3JwdGlvbkh5c3RlcmVzaXNDb3VudGRvd25UaW1lLFxyXG4gICAgICBjdXJyZW50VmlicmF0aW9uUmFkaWFuczogdGhpcy5jdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5LmdldCgpLFxyXG4gICAgICBjdXJyZW50Um90YXRpb25SYWRpYW5zOiB0aGlzLmN1cnJlbnRSb3RhdGlvblJhZGlhbnNcclxuICAgIH07XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gZGVzZXJpYWxpemF0aW9uIHN1cHBvcnRcclxuICAvLyBAcHVibGljXHJcbiAgc3RhdGljIGZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKSB7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbW9sZWN1bGUgdGhhdCBpcyBiYXNpY2FsbHkgYmxhbmsuXHJcbiAgICBjb25zdCBtb2xlY3VsZSA9IG5ldyBNb2xlY3VsZSgpO1xyXG5cclxuICAgIC8vIEZpbGwgaW4gdGhlIHN0cmFpZ2h0Zm9yd2FyZCBzdHVmZlxyXG4gICAgbW9sZWN1bGUuaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5LnNldCggc3RhdGVPYmplY3QuaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZSApO1xyXG4gICAgbW9sZWN1bGUuY2VudGVyT2ZHcmF2aXR5UHJvcGVydHkuc2V0KCBWZWN0b3IyLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuY2VudGVyT2ZHcmF2aXR5ICkgKTtcclxuICAgIG1vbGVjdWxlLnZlbG9jaXR5ID0gVmVjdG9yMi5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LnZlbG9jaXR5ICk7XHJcbiAgICBtb2xlY3VsZS5hYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWUgPSBzdGF0ZU9iamVjdC5hYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWU7XHJcbiAgICBtb2xlY3VsZS5jdXJyZW50VmlicmF0aW9uUmFkaWFuc1Byb3BlcnR5LnNldCggc3RhdGVPYmplY3QuY3VycmVudFZpYnJhdGlvblJhZGlhbnMgKTtcclxuICAgIG1vbGVjdWxlLmN1cnJlbnRSb3RhdGlvblJhZGlhbnMgPSBzdGF0ZU9iamVjdC5jdXJyZW50Um90YXRpb25SYWRpYW5zO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgYXRvbXNcclxuICAgIG1vbGVjdWxlLmF0b21zID0gXy5tYXAoIHN0YXRlT2JqZWN0LmF0b21zLCBhdG9tID0+IEF0b20uZnJvbVN0YXRlT2JqZWN0KCBhdG9tICkgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGJvbmRzXHJcbiAgICBzdGF0ZU9iamVjdC5hdG9taWNCb25kcy5mb3JFYWNoKCBib25kU3RhdGVPYmplY3QgPT4ge1xyXG4gICAgICBjb25zdCBhdG9tMSA9IGZpbmRBdG9tV2l0aElEKCBtb2xlY3VsZS5hdG9tcywgYm9uZFN0YXRlT2JqZWN0LmF0b20xSUQgKTtcclxuICAgICAgY29uc3QgYXRvbTIgPSBmaW5kQXRvbVdpdGhJRCggbW9sZWN1bGUuYXRvbXMsIGJvbmRTdGF0ZU9iamVjdC5hdG9tMklEICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGF0b20xICYmIGF0b20yLCAnRXJyb3I6IENvdWxkblxcJ3QgbWF0Y2ggYXRvbSBJRCBpbiBib25kIHdpdGggYXRvbXMgaW4gbW9sZWN1bGUnICk7XHJcbiAgICAgIG1vbGVjdWxlLmFkZEF0b21pY0JvbmQoIG5ldyBBdG9taWNCb25kKCBhdG9tMSwgYXRvbTIsIHsgYm9uZENvdW50OiBib25kU3RhdGVPYmplY3QuYm9uZENvdW50IH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBtb2xlY3VsZTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdNb2xlY3VsZScsIE1vbGVjdWxlICk7XHJcblxyXG4vLyBAcHVibGljIHtudW1iZXJ9IC0gZGlzdGFuY2UgZnJvbSB0aGUgbW9sZWN1bGUgdG8gcXVlcnkgYSBwaG90b24gZm9yIGFic29ycHRpb24sIGluIHBpY29tZXRlcnNcclxuTW9sZWN1bGUuUEhPVE9OX0FCU09SUFRJT05fRElTVEFOQ0UgPSBQSE9UT05fQUJTT1JQVElPTl9ESVNUQU5DRTtcclxuXHJcbk1vbGVjdWxlLk1vbGVjdWxlSU8gPSBuZXcgSU9UeXBlKCAnTW9sZWN1bGVJTycsIHtcclxuICB2YWx1ZVR5cGU6IE1vbGVjdWxlLFxyXG4gIHRvU3RhdGVPYmplY3Q6IG1vbGVjdWxlID0+IG1vbGVjdWxlLnRvU3RhdGVPYmplY3QoKSxcclxuICBmcm9tU3RhdGVPYmplY3Q6IE1vbGVjdWxlLmZyb21TdGF0ZU9iamVjdCxcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZTogQm9vbGVhbklPLFxyXG4gICAgY2VudGVyT2ZHcmF2aXR5OiBWZWN0b3IyLlZlY3RvcjJJTyxcclxuXHJcbiAgICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JlZW5ob3VzZS1lZmZlY3QvaXNzdWVzLzQwIG1vcmUgc3BlY2lmaWMgc2NoZW1hXHJcbiAgICBhdG9tczogQXJyYXlJTyggT2JqZWN0TGl0ZXJhbElPICksXHJcbiAgICBhdG9taWNCb25kczogQXJyYXlJTyggT2JqZWN0TGl0ZXJhbElPICksXHJcbiAgICB2ZWxvY2l0eTogVmVjdG9yMi5WZWN0b3IySU8sXHJcbiAgICBhYnNvcnB0aW9uSHlzdGVyZXNpc0NvdW50ZG93blRpbWU6IE51bWJlcklPLFxyXG4gICAgY3VycmVudFZpYnJhdGlvblJhZGlhbnM6IE51bWJlcklPLFxyXG4gICAgY3VycmVudFJvdGF0aW9uUmFkaWFuczogTnVtYmVySU9cclxuICB9XHJcbn0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vbGVjdWxlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FB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