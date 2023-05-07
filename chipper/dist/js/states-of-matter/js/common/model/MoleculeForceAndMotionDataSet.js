// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class defines a data set that is used to specify the positions, motions, and external forces for a collection of
 * molecules.  The data is organized as several parallel arrays where the index of a molecule is used to obtain the
 * various data values for that molecule.  This organizational approach was used to optimize performance of the
 * algorithm that makes use of this data.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import required from '../../../../phet-core/js/required.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import Float64ArrayIO from '../../../../tandem/js/types/Float64ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';
import WaterMoleculeStructure from './engine/WaterMoleculeStructure.js';

// constants
const ArrayIONullableIOVector2IO = ArrayIO(NullableIO(Vector2.Vector2IO));
const ArrayIOBooleanIO = ArrayIO(BooleanIO);
class MoleculeForceAndMotionDataSet {
  /**
   * This creates the data set with the capacity to hold the maximum number of atoms/molecules, but does not create the
   * individual data for them.  That must be done explicitly through other calls.
   * @param {number} atomsPerMolecule
   */
  constructor(atomsPerMolecule) {
    // @public (read-only) - attributes that describe the data set as a whole
    this.numberOfAtoms = 0;
    this.numberOfMolecules = 0;

    // @public (read-only) - attributes that apply to all elements of the data set
    this.atomsPerMolecule = atomsPerMolecule;

    // convenience variable
    const maxNumMolecules = Math.floor(SOMConstants.MAX_NUM_ATOMS / atomsPerMolecule);

    // @public Attributes of the individual molecules and the atoms that comprise them.
    this.atomPositions = new Array(SOMConstants.MAX_NUM_ATOMS);
    this.moleculeCenterOfMassPositions = new Array(maxNumMolecules);
    this.moleculeVelocities = new Array(maxNumMolecules);
    this.moleculeForces = new Array(maxNumMolecules);
    this.nextMoleculeForces = new Array(maxNumMolecules);
    this.insideContainer = new Array(maxNumMolecules);

    // Populate with null for vectors and false for booleans because PhET-iO cannot serialize undefined.
    for (let i = 0; i < SOMConstants.MAX_NUM_ATOMS; i++) {
      this.atomPositions[i] = null;
      if (i < maxNumMolecules) {
        this.moleculeCenterOfMassPositions[i] = null;
        this.moleculeVelocities[i] = null;
        this.moleculeForces[i] = null;
        this.nextMoleculeForces[i] = null;
        this.insideContainer[i] = false;
      }
    }

    // @public - Note that some of the following are not used in the monatomic case, but need to be here for compatibility.
    this.moleculeRotationAngles = new Float64Array(maxNumMolecules);
    this.moleculeRotationRates = new Float64Array(maxNumMolecules);
    this.moleculeTorques = new Float64Array(maxNumMolecules);
    this.nextMoleculeTorques = new Float64Array(maxNumMolecules);
    for (let i = 0; i < SOMConstants.MAX_NUM_ATOMS / this.atomsPerMolecule; i++) {
      this.moleculeRotationAngles[i] = 0;
      this.moleculeRotationRates[i] = 0;
      this.moleculeTorques[i] = 0;
      this.nextMoleculeTorques[i] = 0;
    }

    // Set default values.
    if (atomsPerMolecule === 1) {
      this.moleculeMass = 1;
      this.moleculeRotationalInertia = 0;
    } else if (atomsPerMolecule === 2) {
      this.moleculeMass = 2; // Two molecules, assumed to be the same.
      this.moleculeRotationalInertia = this.moleculeMass * Math.pow(SOMConstants.DIATOMIC_PARTICLE_DISTANCE, 2) / 2;
    } else if (atomsPerMolecule === 3) {
      // NOTE: These settings only work for water, since that is the only supported triatomic molecule at the time of
      // this writing (Nov 2008).  If other 3-atom molecules are added, this will need to be changed.
      this.moleculeMass = 1.5; // Three molecules, one relatively heavy and two light
      this.moleculeRotationalInertia = WaterMoleculeStructure.rotationalInertia;
    }
  }

  /**
   * get the total kinetic energy of the particles in this data set
   * @public
   */
  getTotalKineticEnergy() {
    let translationalKineticEnergy = 0;
    let rotationalKineticEnergy = 0;
    const particleMass = this.moleculeMass;
    const numberOfParticles = this.getNumberOfMolecules();
    let i;
    if (this.atomsPerMolecule > 1) {
      // Include rotational inertia in the calculation.
      const rotationalInertia = this.getMoleculeRotationalInertia();
      for (i = 0; i < numberOfParticles; i++) {
        translationalKineticEnergy += 0.5 * particleMass * (Math.pow(this.moleculeVelocities[i].x, 2) + Math.pow(this.moleculeVelocities[i].y, 2));
        rotationalKineticEnergy += 0.5 * rotationalInertia * Math.pow(this.moleculeRotationRates[i], 2);
      }
    } else {
      for (i = 0; i < this.getNumberOfMolecules(); i++) {
        // For single-atom molecules only translational kinetic energy is used.
        translationalKineticEnergy += 0.5 * particleMass * (Math.pow(this.moleculeVelocities[i].x, 2) + Math.pow(this.moleculeVelocities[i].y, 2));
      }
    }
    return translationalKineticEnergy + rotationalKineticEnergy;
  }

  /**
   * @returns {number}
   * @public
   */
  getTemperature() {
    // The formula for kinetic energy in an ideal gas is used here with Boltzmann's constant normalized, i.e. equal to 1.
    return 2 / 3 * this.getTotalKineticEnergy() / this.getNumberOfMolecules();
  }

  /**
   * @returns {number}
   * @public
   */
  getNumberOfMolecules() {
    return this.numberOfAtoms / this.atomsPerMolecule;
  }

  /**
   * @returns {number}
   * @public
   */
  getMoleculeRotationalInertia() {
    return this.moleculeRotationalInertia;
  }

  /**
   * @returns {number}
   * @public
   */
  getMoleculeMass() {
    return this.moleculeMass;
  }

  /**
   * get the kinetic energy of the specified molecule
   * @param moleculeIndex
   * @public
   */
  getMoleculeKineticEnergy(moleculeIndex) {
    assert && assert(moleculeIndex >= 0 && moleculeIndex < this.numberOfMolecules);
    const translationalKineticEnergy = 0.5 * this.moleculeMass * (Math.pow(this.moleculeVelocities[moleculeIndex].x, 2) + Math.pow(this.moleculeVelocities[moleculeIndex].y, 2));
    const rotationalKineticEnergy = 0.5 * this.moleculeRotationalInertia * Math.pow(this.moleculeRotationRates[moleculeIndex], 2);
    return translationalKineticEnergy + rotationalKineticEnergy;
  }

  /**
   * Returns a value indicating how many more molecules can be added.
   * @returns {number}
   * @public
   */
  getNumberOfRemainingSlots() {
    return Math.floor(SOMConstants.MAX_NUM_ATOMS / this.atomsPerMolecule) - this.numberOfAtoms / this.atomsPerMolecule;
  }

  /**
   * @returns {number}
   * @public
   */
  getAtomsPerMolecule() {
    return this.atomsPerMolecule;
  }

  /**
   * @returns {Array}
   * @public
   */
  getAtomPositions() {
    return this.atomPositions;
  }

  /**
   * @returns {number|}
   * @public
   */
  getNumberOfAtoms() {
    return this.numberOfAtoms;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeCenterOfMassPositions() {
    return this.moleculeCenterOfMassPositions;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeVelocities() {
    return this.moleculeVelocities;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeForces() {
    return this.moleculeForces;
  }

  /**
   * @returns {Array}
   * @public
   */
  getNextMoleculeForces() {
    return this.nextMoleculeForces;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeRotationAngles() {
    return this.moleculeRotationAngles;
  }

  /**
   * @param {[]}rotationAngles
   * @public
   */
  setMoleculeRotationAngles(rotationAngles) {
    this.moleculeRotationAngles = rotationAngles;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeRotationRates() {
    return this.moleculeRotationRates;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeTorques() {
    return this.moleculeTorques;
  }

  /**
   * @returns {Array}
   * @public
   */
  getNextMoleculeTorques() {
    return this.nextMoleculeTorques;
  }

  /**
   * Add a new molecule to the model.  The molecule must have been created and initialized before being added.
   * @param {Array.<Vector2>} atomPositions
   * @param {Vector2} moleculeCenterOfMassPosition
   * @param {Vector2} moleculeVelocity
   * @param {number} moleculeRotationRate
   * @param {boolean} insideContainer
   * @returns {boolean} true if able to add, false if not.
   * @public
   */
  addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate, insideContainer) {
    // error checking
    assert && assert(this.getNumberOfRemainingSlots() > 0, 'no space left in molecule data set');
    if (this.getNumberOfRemainingSlots() === 0) {
      return false;
    }

    // Add the information for this molecule to the data set.
    for (let i = 0; i < this.atomsPerMolecule; i++) {
      this.atomPositions[i + this.numberOfAtoms] = atomPositions[i].copy();
    }
    const numberOfMolecules = this.numberOfAtoms / this.atomsPerMolecule;
    this.moleculeCenterOfMassPositions[numberOfMolecules] = moleculeCenterOfMassPosition;
    this.moleculeVelocities[numberOfMolecules] = moleculeVelocity;
    this.moleculeRotationRates[numberOfMolecules] = moleculeRotationRate;
    this.insideContainer[numberOfMolecules] = insideContainer;

    // Allocate memory for the information that is not specified.
    this.moleculeForces[numberOfMolecules] = new Vector2(0, 0);
    this.nextMoleculeForces[numberOfMolecules] = new Vector2(0, 0);

    // Increment the counts of atoms and molecules.
    this.numberOfAtoms += this.atomsPerMolecule;
    this.numberOfMolecules++;
    return true;
  }

  /**
   * Remove the molecule at the designated index.  This also removes all atoms and forces associated with the molecule
   * and shifts the various arrays to compensate.
   * <p/>
   * This is fairly compute intensive, and should be used sparingly.  This was originally created to support the
   * feature where the lid is returned and any molecules outside of the container disappear.
   * @param {number} moleculeIndex
   * @public
   */
  removeMolecule(moleculeIndex) {
    assert && assert(moleculeIndex < this.numberOfAtoms / this.atomsPerMolecule, 'molecule index out of range');
    let i;

    // Handle all data arrays that are maintained on a per-molecule basis.
    for (i = moleculeIndex; i < this.numberOfAtoms / this.atomsPerMolecule - 1; i++) {
      // Shift the data in each array forward one slot.
      this.moleculeCenterOfMassPositions[i] = this.moleculeCenterOfMassPositions[i + 1];
      this.moleculeVelocities[i] = this.moleculeVelocities[i + 1];
      this.moleculeForces[i] = this.moleculeForces[i + 1];
      this.nextMoleculeForces[i] = this.nextMoleculeForces[i + 1];
      this.moleculeRotationAngles[i] = this.moleculeRotationAngles[i + 1];
      this.moleculeRotationRates[i] = this.moleculeRotationRates[i + 1];
      this.moleculeTorques[i] = this.moleculeTorques[i + 1];
      this.nextMoleculeTorques[i] = this.nextMoleculeTorques[i + 1];
    }

    // Handle all data arrays that are maintained on a per-atom basis.
    for (i = moleculeIndex * this.atomsPerMolecule; i < this.numberOfAtoms - this.atomsPerMolecule; i += this.atomsPerMolecule) {
      for (let j = 0; j < this.atomsPerMolecule; j++) {
        this.atomPositions[i + j] = this.atomPositions[i + this.atomsPerMolecule + j];
      }
    }

    // Reduce the counts.
    this.numberOfAtoms -= this.atomsPerMolecule;
    this.numberOfMolecules--;
  }

  /**
   * serialize this instance for phet-io
   * @returns {Object}
   * @public - for phet-io support only
   */
  toStateObject() {
    return {
      atomsPerMolecule: this.atomsPerMolecule,
      numberOfAtoms: this.numberOfAtoms,
      numberOfMolecules: this.numberOfMolecules,
      moleculeMass: this.moleculeMass,
      moleculeRotationalInertia: this.moleculeRotationalInertia,
      // arrays
      atomPositions: ArrayIONullableIOVector2IO.toStateObject(this.atomPositions),
      moleculeCenterOfMassPositions: ArrayIONullableIOVector2IO.toStateObject(this.moleculeCenterOfMassPositions),
      moleculeVelocities: ArrayIONullableIOVector2IO.toStateObject(this.moleculeVelocities),
      moleculeForces: ArrayIONullableIOVector2IO.toStateObject(this.moleculeForces),
      nextMoleculeForces: ArrayIONullableIOVector2IO.toStateObject(this.nextMoleculeForces),
      insideContainer: ArrayIOBooleanIO.toStateObject(this.insideContainer),
      moleculeRotationAngles: Float64ArrayIO.toStateObject(this.moleculeRotationAngles),
      moleculeRotationRates: Float64ArrayIO.toStateObject(this.moleculeRotationRates),
      moleculeTorques: Float64ArrayIO.toStateObject(this.moleculeTorques),
      nextMoleculeTorques: Float64ArrayIO.toStateObject(this.nextMoleculeTorques)
    };
  }

  /**
   * Set the state of this instance for phet-io.  This is used for phet-io, but not directly by the PhetioStateEngine -
   * it is instead called during explicit de-serialization.
   * @param {Object} stateObject - returned from toStateObject
   * @public
   */
  setState(stateObject) {
    required(stateObject);

    // single values that pertain to the entire data set
    this.numberOfAtoms = stateObject.numberOfAtoms;
    this.numberOfMolecules = stateObject.numberOfMolecules;
    this.moleculeMass = stateObject.moleculeMass;
    this.moleculeRotationalInertia = stateObject.moleculeRotationalInertia;
    this.atomsPerMolecule = stateObject.atomsPerMolecule;

    // arrays - copy the values rather than overwriting any references
    const atomPositions = ArrayIONullableIOVector2IO.fromStateObject(stateObject.atomPositions);
    for (let i = 0; i < this.numberOfAtoms; i++) {
      this.atomPositions[i] = atomPositions[i];
    }
    const moleculeCenterOfMassPositions = ArrayIONullableIOVector2IO.fromStateObject(stateObject.moleculeCenterOfMassPositions);
    const moleculeVelocities = ArrayIONullableIOVector2IO.fromStateObject(stateObject.moleculeVelocities);
    const moleculeForces = ArrayIONullableIOVector2IO.fromStateObject(stateObject.moleculeForces);
    const nextMoleculeForces = ArrayIONullableIOVector2IO.fromStateObject(stateObject.nextMoleculeForces);
    const moleculeRotationAngles = Float64ArrayIO.fromStateObject(stateObject.moleculeRotationAngles);
    const moleculeRotationRates = Float64ArrayIO.fromStateObject(stateObject.moleculeRotationRates);
    const moleculeTorques = Float64ArrayIO.fromStateObject(stateObject.moleculeTorques);
    const insideContainer = ArrayIOBooleanIO.fromStateObject(stateObject.insideContainer);
    for (let i = 0; i < this.numberOfMolecules; i++) {
      this.moleculeCenterOfMassPositions[i] = moleculeCenterOfMassPositions[i];
      this.moleculeVelocities[i] = moleculeVelocities[i];
      this.moleculeForces[i] = moleculeForces[i];
      this.nextMoleculeForces[i] = nextMoleculeForces[i];
      this.moleculeRotationAngles[i] = moleculeRotationAngles[i];
      this.moleculeRotationRates[i] = moleculeRotationRates[i];
      this.moleculeTorques[i] = moleculeTorques[i];
      this.insideContainer[i] = insideContainer[i];
    }
  }

  /**
   * Dump this data set's information in a way that can then be incorporated into a phase state changer that needs to
   * use fixed positions, velocities, etc. to set the state of a substance.  This was created in order to come up with
   * good initial configurations instead of using an algorithmically generated ones, which can look unnatural.  See
   * https://github.com/phetsims/states-of-matter/issues/212.  To use this, set a debugger at a point in the code
   * where the substance is in the desired position, call this from the command line, and then incorporate the output
   * into the appropriate phase state changer object (e.g. WaterPhaseStateChanger).  Some hand-tweaking is generally
   * necessary.
   * @public
   */
  dump() {
    let i;
    const numMolecules = this.numberOfMolecules;
    console.log('moleculeCenterOfMassPositions:');
    console.log('[');
    for (i = 0; i < numMolecules; i++) {
      const comPos = this.moleculeCenterOfMassPositions[i];
      console.log('{', 'x: ', Utils.toFixed(comPos.x, 3), ', y: ', Utils.toFixed(comPos.y, 3), '}');
    }
    console.log('],');
    console.log('moleculeVelocities:');
    console.log('[');
    for (i = 0; i < numMolecules; i++) {
      const vel = this.moleculeVelocities[i];
      console.log('{', 'x: ', Utils.toFixed(vel.x, 3), ', y: ', Utils.toFixed(vel.y, 3), '}');
    }
    console.log('],');
    console.log('moleculeRotationAngles:');
    console.log('[');
    for (i = 0; i < numMolecules; i++) {
      const angle = this.moleculeRotationAngles[i];
      console.log(Utils.toFixed(angle, 3), ',');
    }
    console.log('],');
    console.log('moleculeRotationRates:');
    console.log('[');
    for (i = 0; i < numMolecules; i++) {
      const rate = this.moleculeRotationRates[i];
      console.log(Utils.toFixed(rate, 3), ',');
    }
    console.log('],');
  }
}

// IO Type for MoleculeForceAndMotionDataSet, uses "data type" serialization where `fromStateObject returns a new
// instance.
MoleculeForceAndMotionDataSet.MoleculeForceAndMotionDataSetIO = new IOType('MoleculeForceAndMotionDataSetIO', {
  valueType: MoleculeForceAndMotionDataSet,
  documentation: 'particle data set',
  toStateObject: moleculeForceAndMotionDataSet => moleculeForceAndMotionDataSet.toStateObject(),
  stateSchema: {
    atomsPerMolecule: NumberIO,
    numberOfAtoms: NumberIO,
    numberOfMolecules: NumberIO,
    moleculeMass: NumberIO,
    moleculeRotationalInertia: NumberIO,
    // arrays
    atomPositions: ArrayIONullableIOVector2IO,
    moleculeCenterOfMassPositions: ArrayIONullableIOVector2IO,
    moleculeVelocities: ArrayIONullableIOVector2IO,
    moleculeForces: ArrayIONullableIOVector2IO,
    nextMoleculeForces: ArrayIONullableIOVector2IO,
    insideContainer: ArrayIOBooleanIO,
    moleculeRotationAngles: Float64ArrayIO,
    moleculeRotationRates: Float64ArrayIO,
    moleculeTorques: Float64ArrayIO,
    nextMoleculeTorques: Float64ArrayIO
  }
});
statesOfMatter.register('MoleculeForceAndMotionDataSet', MoleculeForceAndMotionDataSet);
export default MoleculeForceAndMotionDataSet;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJyZXF1aXJlZCIsIkFycmF5SU8iLCJCb29sZWFuSU8iLCJGbG9hdDY0QXJyYXlJTyIsIklPVHlwZSIsIk51bGxhYmxlSU8iLCJOdW1iZXJJTyIsInN0YXRlc09mTWF0dGVyIiwiU09NQ29uc3RhbnRzIiwiV2F0ZXJNb2xlY3VsZVN0cnVjdHVyZSIsIkFycmF5SU9OdWxsYWJsZUlPVmVjdG9yMklPIiwiVmVjdG9yMklPIiwiQXJyYXlJT0Jvb2xlYW5JTyIsIk1vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0IiwiY29uc3RydWN0b3IiLCJhdG9tc1Blck1vbGVjdWxlIiwibnVtYmVyT2ZBdG9tcyIsIm51bWJlck9mTW9sZWN1bGVzIiwibWF4TnVtTW9sZWN1bGVzIiwiTWF0aCIsImZsb29yIiwiTUFYX05VTV9BVE9NUyIsImF0b21Qb3NpdGlvbnMiLCJBcnJheSIsIm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zIiwibW9sZWN1bGVWZWxvY2l0aWVzIiwibW9sZWN1bGVGb3JjZXMiLCJuZXh0TW9sZWN1bGVGb3JjZXMiLCJpbnNpZGVDb250YWluZXIiLCJpIiwibW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyIsIkZsb2F0NjRBcnJheSIsIm1vbGVjdWxlUm90YXRpb25SYXRlcyIsIm1vbGVjdWxlVG9ycXVlcyIsIm5leHRNb2xlY3VsZVRvcnF1ZXMiLCJtb2xlY3VsZU1hc3MiLCJtb2xlY3VsZVJvdGF0aW9uYWxJbmVydGlhIiwicG93IiwiRElBVE9NSUNfUEFSVElDTEVfRElTVEFOQ0UiLCJyb3RhdGlvbmFsSW5lcnRpYSIsImdldFRvdGFsS2luZXRpY0VuZXJneSIsInRyYW5zbGF0aW9uYWxLaW5ldGljRW5lcmd5Iiwicm90YXRpb25hbEtpbmV0aWNFbmVyZ3kiLCJwYXJ0aWNsZU1hc3MiLCJudW1iZXJPZlBhcnRpY2xlcyIsImdldE51bWJlck9mTW9sZWN1bGVzIiwiZ2V0TW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYSIsIngiLCJ5IiwiZ2V0VGVtcGVyYXR1cmUiLCJnZXRNb2xlY3VsZU1hc3MiLCJnZXRNb2xlY3VsZUtpbmV0aWNFbmVyZ3kiLCJtb2xlY3VsZUluZGV4IiwiYXNzZXJ0IiwiZ2V0TnVtYmVyT2ZSZW1haW5pbmdTbG90cyIsImdldEF0b21zUGVyTW9sZWN1bGUiLCJnZXRBdG9tUG9zaXRpb25zIiwiZ2V0TnVtYmVyT2ZBdG9tcyIsImdldE1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zIiwiZ2V0TW9sZWN1bGVWZWxvY2l0aWVzIiwiZ2V0TW9sZWN1bGVGb3JjZXMiLCJnZXROZXh0TW9sZWN1bGVGb3JjZXMiLCJnZXRNb2xlY3VsZVJvdGF0aW9uQW5nbGVzIiwic2V0TW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyIsInJvdGF0aW9uQW5nbGVzIiwiZ2V0TW9sZWN1bGVSb3RhdGlvblJhdGVzIiwiZ2V0TW9sZWN1bGVUb3JxdWVzIiwiZ2V0TmV4dE1vbGVjdWxlVG9ycXVlcyIsImFkZE1vbGVjdWxlIiwibW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbiIsIm1vbGVjdWxlVmVsb2NpdHkiLCJtb2xlY3VsZVJvdGF0aW9uUmF0ZSIsImNvcHkiLCJyZW1vdmVNb2xlY3VsZSIsImoiLCJ0b1N0YXRlT2JqZWN0Iiwic2V0U3RhdGUiLCJzdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsImR1bXAiLCJudW1Nb2xlY3VsZXMiLCJjb25zb2xlIiwibG9nIiwiY29tUG9zIiwidG9GaXhlZCIsInZlbCIsImFuZ2xlIiwicmF0ZSIsIk1vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0SU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwibW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyBkZWZpbmVzIGEgZGF0YSBzZXQgdGhhdCBpcyB1c2VkIHRvIHNwZWNpZnkgdGhlIHBvc2l0aW9ucywgbW90aW9ucywgYW5kIGV4dGVybmFsIGZvcmNlcyBmb3IgYSBjb2xsZWN0aW9uIG9mXHJcbiAqIG1vbGVjdWxlcy4gIFRoZSBkYXRhIGlzIG9yZ2FuaXplZCBhcyBzZXZlcmFsIHBhcmFsbGVsIGFycmF5cyB3aGVyZSB0aGUgaW5kZXggb2YgYSBtb2xlY3VsZSBpcyB1c2VkIHRvIG9idGFpbiB0aGVcclxuICogdmFyaW91cyBkYXRhIHZhbHVlcyBmb3IgdGhhdCBtb2xlY3VsZS4gIFRoaXMgb3JnYW5pemF0aW9uYWwgYXBwcm9hY2ggd2FzIHVzZWQgdG8gb3B0aW1pemUgcGVyZm9ybWFuY2Ugb2YgdGhlXHJcbiAqIGFsZ29yaXRobSB0aGF0IG1ha2VzIHVzZSBvZiB0aGlzIGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYXJvbiBEYXZpc1xyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHJlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9yZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcclxuaW1wb3J0IEZsb2F0NjRBcnJheUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9GbG9hdDY0QXJyYXlJTy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBzdGF0ZXNPZk1hdHRlciBmcm9tICcuLi8uLi9zdGF0ZXNPZk1hdHRlci5qcyc7XHJcbmltcG9ydCBTT01Db25zdGFudHMgZnJvbSAnLi4vU09NQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFdhdGVyTW9sZWN1bGVTdHJ1Y3R1cmUgZnJvbSAnLi9lbmdpbmUvV2F0ZXJNb2xlY3VsZVN0cnVjdHVyZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQXJyYXlJT051bGxhYmxlSU9WZWN0b3IySU8gPSBBcnJheUlPKCBOdWxsYWJsZUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApICk7XHJcbmNvbnN0IEFycmF5SU9Cb29sZWFuSU8gPSBBcnJheUlPKCBCb29sZWFuSU8gKTtcclxuXHJcbmNsYXNzIE1vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBjcmVhdGVzIHRoZSBkYXRhIHNldCB3aXRoIHRoZSBjYXBhY2l0eSB0byBob2xkIHRoZSBtYXhpbXVtIG51bWJlciBvZiBhdG9tcy9tb2xlY3VsZXMsIGJ1dCBkb2VzIG5vdCBjcmVhdGUgdGhlXHJcbiAgICogaW5kaXZpZHVhbCBkYXRhIGZvciB0aGVtLiAgVGhhdCBtdXN0IGJlIGRvbmUgZXhwbGljaXRseSB0aHJvdWdoIG90aGVyIGNhbGxzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhdG9tc1Blck1vbGVjdWxlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGF0b21zUGVyTW9sZWN1bGUgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGF0dHJpYnV0ZXMgdGhhdCBkZXNjcmliZSB0aGUgZGF0YSBzZXQgYXMgYSB3aG9sZVxyXG4gICAgdGhpcy5udW1iZXJPZkF0b21zID0gMDtcclxuICAgIHRoaXMubnVtYmVyT2ZNb2xlY3VsZXMgPSAwO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBhdHRyaWJ1dGVzIHRoYXQgYXBwbHkgdG8gYWxsIGVsZW1lbnRzIG9mIHRoZSBkYXRhIHNldFxyXG4gICAgdGhpcy5hdG9tc1Blck1vbGVjdWxlID0gYXRvbXNQZXJNb2xlY3VsZTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZVxyXG4gICAgY29uc3QgbWF4TnVtTW9sZWN1bGVzID0gTWF0aC5mbG9vciggU09NQ29uc3RhbnRzLk1BWF9OVU1fQVRPTVMgLyBhdG9tc1Blck1vbGVjdWxlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBBdHRyaWJ1dGVzIG9mIHRoZSBpbmRpdmlkdWFsIG1vbGVjdWxlcyBhbmQgdGhlIGF0b21zIHRoYXQgY29tcHJpc2UgdGhlbS5cclxuICAgIHRoaXMuYXRvbVBvc2l0aW9ucyA9IG5ldyBBcnJheSggU09NQ29uc3RhbnRzLk1BWF9OVU1fQVRPTVMgKTtcclxuICAgIHRoaXMubW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnMgPSBuZXcgQXJyYXkoIG1heE51bU1vbGVjdWxlcyApO1xyXG4gICAgdGhpcy5tb2xlY3VsZVZlbG9jaXRpZXMgPSBuZXcgQXJyYXkoIG1heE51bU1vbGVjdWxlcyApO1xyXG4gICAgdGhpcy5tb2xlY3VsZUZvcmNlcyA9IG5ldyBBcnJheSggbWF4TnVtTW9sZWN1bGVzICk7XHJcbiAgICB0aGlzLm5leHRNb2xlY3VsZUZvcmNlcyA9IG5ldyBBcnJheSggbWF4TnVtTW9sZWN1bGVzICk7XHJcbiAgICB0aGlzLmluc2lkZUNvbnRhaW5lciA9IG5ldyBBcnJheSggbWF4TnVtTW9sZWN1bGVzICk7XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgd2l0aCBudWxsIGZvciB2ZWN0b3JzIGFuZCBmYWxzZSBmb3IgYm9vbGVhbnMgYmVjYXVzZSBQaEVULWlPIGNhbm5vdCBzZXJpYWxpemUgdW5kZWZpbmVkLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgU09NQ29uc3RhbnRzLk1BWF9OVU1fQVRPTVM7IGkrKyApIHtcclxuICAgICAgdGhpcy5hdG9tUG9zaXRpb25zWyBpIF0gPSBudWxsO1xyXG4gICAgICBpZiAoIGkgPCBtYXhOdW1Nb2xlY3VsZXMgKSB7XHJcbiAgICAgICAgdGhpcy5tb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uc1sgaSBdID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1vbGVjdWxlVmVsb2NpdGllc1sgaSBdID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1vbGVjdWxlRm9yY2VzWyBpIF0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMubmV4dE1vbGVjdWxlRm9yY2VzWyBpIF0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaW5zaWRlQ29udGFpbmVyWyBpIF0gPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBOb3RlIHRoYXQgc29tZSBvZiB0aGUgZm9sbG93aW5nIGFyZSBub3QgdXNlZCBpbiB0aGUgbW9uYXRvbWljIGNhc2UsIGJ1dCBuZWVkIHRvIGJlIGhlcmUgZm9yIGNvbXBhdGliaWxpdHkuXHJcbiAgICB0aGlzLm1vbGVjdWxlUm90YXRpb25BbmdsZXMgPSBuZXcgRmxvYXQ2NEFycmF5KCBtYXhOdW1Nb2xlY3VsZXMgKTtcclxuICAgIHRoaXMubW9sZWN1bGVSb3RhdGlvblJhdGVzID0gbmV3IEZsb2F0NjRBcnJheSggbWF4TnVtTW9sZWN1bGVzICk7XHJcbiAgICB0aGlzLm1vbGVjdWxlVG9ycXVlcyA9IG5ldyBGbG9hdDY0QXJyYXkoIG1heE51bU1vbGVjdWxlcyApO1xyXG4gICAgdGhpcy5uZXh0TW9sZWN1bGVUb3JxdWVzID0gbmV3IEZsb2F0NjRBcnJheSggbWF4TnVtTW9sZWN1bGVzICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBTT01Db25zdGFudHMuTUFYX05VTV9BVE9NUyAvIHRoaXMuYXRvbXNQZXJNb2xlY3VsZTsgaSsrICkge1xyXG4gICAgICB0aGlzLm1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXSA9IDA7XHJcbiAgICAgIHRoaXMubW9sZWN1bGVSb3RhdGlvblJhdGVzWyBpIF0gPSAwO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlVG9ycXVlc1sgaSBdID0gMDtcclxuICAgICAgdGhpcy5uZXh0TW9sZWN1bGVUb3JxdWVzWyBpIF0gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlcy5cclxuICAgIGlmICggYXRvbXNQZXJNb2xlY3VsZSA9PT0gMSApIHtcclxuICAgICAgdGhpcy5tb2xlY3VsZU1hc3MgPSAxO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlUm90YXRpb25hbEluZXJ0aWEgPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGF0b21zUGVyTW9sZWN1bGUgPT09IDIgKSB7XHJcbiAgICAgIHRoaXMubW9sZWN1bGVNYXNzID0gMjsgLy8gVHdvIG1vbGVjdWxlcywgYXNzdW1lZCB0byBiZSB0aGUgc2FtZS5cclxuICAgICAgdGhpcy5tb2xlY3VsZVJvdGF0aW9uYWxJbmVydGlhID0gdGhpcy5tb2xlY3VsZU1hc3MgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyggU09NQ29uc3RhbnRzLkRJQVRPTUlDX1BBUlRJQ0xFX0RJU1RBTkNFLCAyICkgLyAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGF0b21zUGVyTW9sZWN1bGUgPT09IDMgKSB7XHJcbiAgICAgIC8vIE5PVEU6IFRoZXNlIHNldHRpbmdzIG9ubHkgd29yayBmb3Igd2F0ZXIsIHNpbmNlIHRoYXQgaXMgdGhlIG9ubHkgc3VwcG9ydGVkIHRyaWF0b21pYyBtb2xlY3VsZSBhdCB0aGUgdGltZSBvZlxyXG4gICAgICAvLyB0aGlzIHdyaXRpbmcgKE5vdiAyMDA4KS4gIElmIG90aGVyIDMtYXRvbSBtb2xlY3VsZXMgYXJlIGFkZGVkLCB0aGlzIHdpbGwgbmVlZCB0byBiZSBjaGFuZ2VkLlxyXG4gICAgICB0aGlzLm1vbGVjdWxlTWFzcyA9IDEuNTsgLy8gVGhyZWUgbW9sZWN1bGVzLCBvbmUgcmVsYXRpdmVseSBoZWF2eSBhbmQgdHdvIGxpZ2h0XHJcbiAgICAgIHRoaXMubW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYSA9IFdhdGVyTW9sZWN1bGVTdHJ1Y3R1cmUucm90YXRpb25hbEluZXJ0aWE7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIHRvdGFsIGtpbmV0aWMgZW5lcmd5IG9mIHRoZSBwYXJ0aWNsZXMgaW4gdGhpcyBkYXRhIHNldFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUb3RhbEtpbmV0aWNFbmVyZ3koKSB7XHJcblxyXG4gICAgbGV0IHRyYW5zbGF0aW9uYWxLaW5ldGljRW5lcmd5ID0gMDtcclxuICAgIGxldCByb3RhdGlvbmFsS2luZXRpY0VuZXJneSA9IDA7XHJcbiAgICBjb25zdCBwYXJ0aWNsZU1hc3MgPSB0aGlzLm1vbGVjdWxlTWFzcztcclxuICAgIGNvbnN0IG51bWJlck9mUGFydGljbGVzID0gdGhpcy5nZXROdW1iZXJPZk1vbGVjdWxlcygpO1xyXG4gICAgbGV0IGk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmF0b21zUGVyTW9sZWN1bGUgPiAxICkge1xyXG5cclxuICAgICAgLy8gSW5jbHVkZSByb3RhdGlvbmFsIGluZXJ0aWEgaW4gdGhlIGNhbGN1bGF0aW9uLlxyXG4gICAgICBjb25zdCByb3RhdGlvbmFsSW5lcnRpYSA9IHRoaXMuZ2V0TW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYSgpO1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IG51bWJlck9mUGFydGljbGVzOyBpKysgKSB7XHJcbiAgICAgICAgdHJhbnNsYXRpb25hbEtpbmV0aWNFbmVyZ3kgKz0gMC41ICogcGFydGljbGVNYXNzICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIE1hdGgucG93KCB0aGlzLm1vbGVjdWxlVmVsb2NpdGllc1sgaSBdLngsIDIgKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyggdGhpcy5tb2xlY3VsZVZlbG9jaXRpZXNbIGkgXS55LCAyICkgKTtcclxuICAgICAgICByb3RhdGlvbmFsS2luZXRpY0VuZXJneSArPSAwLjUgKiByb3RhdGlvbmFsSW5lcnRpYSAqIE1hdGgucG93KCB0aGlzLm1vbGVjdWxlUm90YXRpb25SYXRlc1sgaSBdLCAyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuZ2V0TnVtYmVyT2ZNb2xlY3VsZXMoKTsgaSsrICkge1xyXG5cclxuICAgICAgICAvLyBGb3Igc2luZ2xlLWF0b20gbW9sZWN1bGVzIG9ubHkgdHJhbnNsYXRpb25hbCBraW5ldGljIGVuZXJneSBpcyB1c2VkLlxyXG4gICAgICAgIHRyYW5zbGF0aW9uYWxLaW5ldGljRW5lcmd5ICs9IDAuNSAqIHBhcnRpY2xlTWFzcyAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBNYXRoLnBvdyggdGhpcy5tb2xlY3VsZVZlbG9jaXRpZXNbIGkgXS54LCAyICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5wb3coIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzWyBpIF0ueSwgMiApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJhbnNsYXRpb25hbEtpbmV0aWNFbmVyZ3kgKyByb3RhdGlvbmFsS2luZXRpY0VuZXJneTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFRlbXBlcmF0dXJlKCkge1xyXG5cclxuICAgIC8vIFRoZSBmb3JtdWxhIGZvciBraW5ldGljIGVuZXJneSBpbiBhbiBpZGVhbCBnYXMgaXMgdXNlZCBoZXJlIHdpdGggQm9sdHptYW5uJ3MgY29uc3RhbnQgbm9ybWFsaXplZCwgaS5lLiBlcXVhbCB0byAxLlxyXG4gICAgcmV0dXJuICggMiAvIDMgKSAqIHRoaXMuZ2V0VG90YWxLaW5ldGljRW5lcmd5KCkgLyB0aGlzLmdldE51bWJlck9mTW9sZWN1bGVzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROdW1iZXJPZk1vbGVjdWxlcygpIHtcclxuICAgIHJldHVybiB0aGlzLm51bWJlck9mQXRvbXMgLyB0aGlzLmF0b21zUGVyTW9sZWN1bGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNb2xlY3VsZVJvdGF0aW9uYWxJbmVydGlhKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlTWFzcygpIHtcclxuICAgIHJldHVybiB0aGlzLm1vbGVjdWxlTWFzcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUga2luZXRpYyBlbmVyZ3kgb2YgdGhlIHNwZWNpZmllZCBtb2xlY3VsZVxyXG4gICAqIEBwYXJhbSBtb2xlY3VsZUluZGV4XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlS2luZXRpY0VuZXJneSggbW9sZWN1bGVJbmRleCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vbGVjdWxlSW5kZXggPj0gMCAmJiBtb2xlY3VsZUluZGV4IDwgdGhpcy5udW1iZXJPZk1vbGVjdWxlcyApO1xyXG4gICAgY29uc3QgdHJhbnNsYXRpb25hbEtpbmV0aWNFbmVyZ3kgPSAwLjUgKiB0aGlzLm1vbGVjdWxlTWFzcyAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggTWF0aC5wb3coIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzWyBtb2xlY3VsZUluZGV4IF0ueCwgMiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyggdGhpcy5tb2xlY3VsZVZlbG9jaXRpZXNbIG1vbGVjdWxlSW5kZXggXS55LCAyICkgKTtcclxuICAgIGNvbnN0IHJvdGF0aW9uYWxLaW5ldGljRW5lcmd5ID0gMC41ICogdGhpcy5tb2xlY3VsZVJvdGF0aW9uYWxJbmVydGlhICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5wb3coIHRoaXMubW9sZWN1bGVSb3RhdGlvblJhdGVzWyBtb2xlY3VsZUluZGV4IF0sIDIgKTtcclxuICAgIHJldHVybiB0cmFuc2xhdGlvbmFsS2luZXRpY0VuZXJneSArIHJvdGF0aW9uYWxLaW5ldGljRW5lcmd5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgaG93IG1hbnkgbW9yZSBtb2xlY3VsZXMgY2FuIGJlIGFkZGVkLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE51bWJlck9mUmVtYWluaW5nU2xvdHMoKSB7XHJcbiAgICByZXR1cm4gKCBNYXRoLmZsb29yKCBTT01Db25zdGFudHMuTUFYX05VTV9BVE9NUyAvIHRoaXMuYXRvbXNQZXJNb2xlY3VsZSApIC1cclxuICAgICAgICAgICAgICggdGhpcy5udW1iZXJPZkF0b21zIC8gdGhpcy5hdG9tc1Blck1vbGVjdWxlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEF0b21zUGVyTW9sZWN1bGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdG9tc1Blck1vbGVjdWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBdG9tUG9zaXRpb25zKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXRvbVBvc2l0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ8fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROdW1iZXJPZkF0b21zKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubnVtYmVyT2ZBdG9tcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TW9sZWN1bGVWZWxvY2l0aWVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNb2xlY3VsZUZvcmNlcygpIHtcclxuICAgIHJldHVybiB0aGlzLm1vbGVjdWxlRm9yY2VzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROZXh0TW9sZWN1bGVGb3JjZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5uZXh0TW9sZWN1bGVGb3JjZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlUm90YXRpb25BbmdsZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2xlY3VsZVJvdGF0aW9uQW5nbGVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtbXX1yb3RhdGlvbkFuZ2xlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRNb2xlY3VsZVJvdGF0aW9uQW5nbGVzKCByb3RhdGlvbkFuZ2xlcyApIHtcclxuICAgIHRoaXMubW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyA9IHJvdGF0aW9uQW5nbGVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRNb2xlY3VsZVJvdGF0aW9uUmF0ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2xlY3VsZVJvdGF0aW9uUmF0ZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlVG9ycXVlcygpIHtcclxuICAgIHJldHVybiB0aGlzLm1vbGVjdWxlVG9ycXVlcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TmV4dE1vbGVjdWxlVG9ycXVlcygpIHtcclxuICAgIHJldHVybiB0aGlzLm5leHRNb2xlY3VsZVRvcnF1ZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBuZXcgbW9sZWN1bGUgdG8gdGhlIG1vZGVsLiAgVGhlIG1vbGVjdWxlIG11c3QgaGF2ZSBiZWVuIGNyZWF0ZWQgYW5kIGluaXRpYWxpemVkIGJlZm9yZSBiZWluZyBhZGRlZC5cclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gYXRvbVBvc2l0aW9uc1xyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gbW9sZWN1bGVWZWxvY2l0eVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtb2xlY3VsZVJvdGF0aW9uUmF0ZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5zaWRlQ29udGFpbmVyXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYWJsZSB0byBhZGQsIGZhbHNlIGlmIG5vdC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkTW9sZWN1bGUoIGF0b21Qb3NpdGlvbnMsIG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb24sIG1vbGVjdWxlVmVsb2NpdHksIG1vbGVjdWxlUm90YXRpb25SYXRlLCBpbnNpZGVDb250YWluZXIgKSB7XHJcblxyXG4gICAgLy8gZXJyb3IgY2hlY2tpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ2V0TnVtYmVyT2ZSZW1haW5pbmdTbG90cygpID4gMCwgJ25vIHNwYWNlIGxlZnQgaW4gbW9sZWN1bGUgZGF0YSBzZXQnICk7XHJcbiAgICBpZiAoIHRoaXMuZ2V0TnVtYmVyT2ZSZW1haW5pbmdTbG90cygpID09PSAwICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBpbmZvcm1hdGlvbiBmb3IgdGhpcyBtb2xlY3VsZSB0byB0aGUgZGF0YSBzZXQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmF0b21zUGVyTW9sZWN1bGU7IGkrKyApIHtcclxuICAgICAgdGhpcy5hdG9tUG9zaXRpb25zWyBpICsgdGhpcy5udW1iZXJPZkF0b21zIF0gPSBhdG9tUG9zaXRpb25zWyBpIF0uY29weSgpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbnVtYmVyT2ZNb2xlY3VsZXMgPSB0aGlzLm51bWJlck9mQXRvbXMgLyB0aGlzLmF0b21zUGVyTW9sZWN1bGU7XHJcbiAgICB0aGlzLm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBudW1iZXJPZk1vbGVjdWxlcyBdID0gbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbjtcclxuICAgIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzWyBudW1iZXJPZk1vbGVjdWxlcyBdID0gbW9sZWN1bGVWZWxvY2l0eTtcclxuICAgIHRoaXMubW9sZWN1bGVSb3RhdGlvblJhdGVzWyBudW1iZXJPZk1vbGVjdWxlcyBdID0gbW9sZWN1bGVSb3RhdGlvblJhdGU7XHJcbiAgICB0aGlzLmluc2lkZUNvbnRhaW5lclsgbnVtYmVyT2ZNb2xlY3VsZXMgXSA9IGluc2lkZUNvbnRhaW5lcjtcclxuXHJcbiAgICAvLyBBbGxvY2F0ZSBtZW1vcnkgZm9yIHRoZSBpbmZvcm1hdGlvbiB0aGF0IGlzIG5vdCBzcGVjaWZpZWQuXHJcbiAgICB0aGlzLm1vbGVjdWxlRm9yY2VzWyBudW1iZXJPZk1vbGVjdWxlcyBdID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMubmV4dE1vbGVjdWxlRm9yY2VzWyBudW1iZXJPZk1vbGVjdWxlcyBdID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICAvLyBJbmNyZW1lbnQgdGhlIGNvdW50cyBvZiBhdG9tcyBhbmQgbW9sZWN1bGVzLlxyXG4gICAgdGhpcy5udW1iZXJPZkF0b21zICs9IHRoaXMuYXRvbXNQZXJNb2xlY3VsZTtcclxuICAgIHRoaXMubnVtYmVyT2ZNb2xlY3VsZXMrKztcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGUgbW9sZWN1bGUgYXQgdGhlIGRlc2lnbmF0ZWQgaW5kZXguICBUaGlzIGFsc28gcmVtb3ZlcyBhbGwgYXRvbXMgYW5kIGZvcmNlcyBhc3NvY2lhdGVkIHdpdGggdGhlIG1vbGVjdWxlXHJcbiAgICogYW5kIHNoaWZ0cyB0aGUgdmFyaW91cyBhcnJheXMgdG8gY29tcGVuc2F0ZS5cclxuICAgKiA8cC8+XHJcbiAgICogVGhpcyBpcyBmYWlybHkgY29tcHV0ZSBpbnRlbnNpdmUsIGFuZCBzaG91bGQgYmUgdXNlZCBzcGFyaW5nbHkuICBUaGlzIHdhcyBvcmlnaW5hbGx5IGNyZWF0ZWQgdG8gc3VwcG9ydCB0aGVcclxuICAgKiBmZWF0dXJlIHdoZXJlIHRoZSBsaWQgaXMgcmV0dXJuZWQgYW5kIGFueSBtb2xlY3VsZXMgb3V0c2lkZSBvZiB0aGUgY29udGFpbmVyIGRpc2FwcGVhci5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbW9sZWN1bGVJbmRleFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVNb2xlY3VsZSggbW9sZWN1bGVJbmRleCApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2xlY3VsZUluZGV4IDwgdGhpcy5udW1iZXJPZkF0b21zIC8gdGhpcy5hdG9tc1Blck1vbGVjdWxlLCAnbW9sZWN1bGUgaW5kZXggb3V0IG9mIHJhbmdlJyApO1xyXG5cclxuICAgIGxldCBpO1xyXG5cclxuICAgIC8vIEhhbmRsZSBhbGwgZGF0YSBhcnJheXMgdGhhdCBhcmUgbWFpbnRhaW5lZCBvbiBhIHBlci1tb2xlY3VsZSBiYXNpcy5cclxuICAgIGZvciAoIGkgPSBtb2xlY3VsZUluZGV4OyBpIDwgdGhpcy5udW1iZXJPZkF0b21zIC8gdGhpcy5hdG9tc1Blck1vbGVjdWxlIC0gMTsgaSsrICkge1xyXG4gICAgICAvLyBTaGlmdCB0aGUgZGF0YSBpbiBlYWNoIGFycmF5IGZvcndhcmQgb25lIHNsb3QuXHJcbiAgICAgIHRoaXMubW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgXSA9IHRoaXMubW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgKyAxIF07XHJcbiAgICAgIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzWyBpIF0gPSB0aGlzLm1vbGVjdWxlVmVsb2NpdGllc1sgaSArIDEgXTtcclxuICAgICAgdGhpcy5tb2xlY3VsZUZvcmNlc1sgaSBdID0gdGhpcy5tb2xlY3VsZUZvcmNlc1sgaSArIDEgXTtcclxuICAgICAgdGhpcy5uZXh0TW9sZWN1bGVGb3JjZXNbIGkgXSA9IHRoaXMubmV4dE1vbGVjdWxlRm9yY2VzWyBpICsgMSBdO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXSA9IHRoaXMubW9sZWN1bGVSb3RhdGlvbkFuZ2xlc1sgaSArIDEgXTtcclxuICAgICAgdGhpcy5tb2xlY3VsZVJvdGF0aW9uUmF0ZXNbIGkgXSA9IHRoaXMubW9sZWN1bGVSb3RhdGlvblJhdGVzWyBpICsgMSBdO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlVG9ycXVlc1sgaSBdID0gdGhpcy5tb2xlY3VsZVRvcnF1ZXNbIGkgKyAxIF07XHJcbiAgICAgIHRoaXMubmV4dE1vbGVjdWxlVG9ycXVlc1sgaSBdID0gdGhpcy5uZXh0TW9sZWN1bGVUb3JxdWVzWyBpICsgMSBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBhbGwgZGF0YSBhcnJheXMgdGhhdCBhcmUgbWFpbnRhaW5lZCBvbiBhIHBlci1hdG9tIGJhc2lzLlxyXG4gICAgZm9yICggaSA9IG1vbGVjdWxlSW5kZXggKiB0aGlzLmF0b21zUGVyTW9sZWN1bGU7IGkgPCAoIHRoaXMubnVtYmVyT2ZBdG9tcyAtIHRoaXMuYXRvbXNQZXJNb2xlY3VsZSApO1xyXG4gICAgICAgICAgaSArPSB0aGlzLmF0b21zUGVyTW9sZWN1bGUgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuYXRvbXNQZXJNb2xlY3VsZTsgaisrICkge1xyXG4gICAgICAgIHRoaXMuYXRvbVBvc2l0aW9uc1sgaSArIGogXSA9IHRoaXMuYXRvbVBvc2l0aW9uc1sgaSArIHRoaXMuYXRvbXNQZXJNb2xlY3VsZSArIGogXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlZHVjZSB0aGUgY291bnRzLlxyXG4gICAgdGhpcy5udW1iZXJPZkF0b21zIC09IHRoaXMuYXRvbXNQZXJNb2xlY3VsZTtcclxuICAgIHRoaXMubnVtYmVyT2ZNb2xlY3VsZXMtLTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNlcmlhbGl6ZSB0aGlzIGluc3RhbmNlIGZvciBwaGV0LWlvXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKiBAcHVibGljIC0gZm9yIHBoZXQtaW8gc3VwcG9ydCBvbmx5XHJcbiAgICovXHJcbiAgdG9TdGF0ZU9iamVjdCgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGF0b21zUGVyTW9sZWN1bGU6IHRoaXMuYXRvbXNQZXJNb2xlY3VsZSxcclxuICAgICAgbnVtYmVyT2ZBdG9tczogdGhpcy5udW1iZXJPZkF0b21zLFxyXG4gICAgICBudW1iZXJPZk1vbGVjdWxlczogdGhpcy5udW1iZXJPZk1vbGVjdWxlcyxcclxuICAgICAgbW9sZWN1bGVNYXNzOiB0aGlzLm1vbGVjdWxlTWFzcyxcclxuICAgICAgbW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYTogdGhpcy5tb2xlY3VsZVJvdGF0aW9uYWxJbmVydGlhLFxyXG5cclxuICAgICAgLy8gYXJyYXlzXHJcbiAgICAgIGF0b21Qb3NpdGlvbnM6IEFycmF5SU9OdWxsYWJsZUlPVmVjdG9yMklPLnRvU3RhdGVPYmplY3QoIHRoaXMuYXRvbVBvc2l0aW9ucyApLFxyXG4gICAgICBtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uczogQXJyYXlJT051bGxhYmxlSU9WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy5tb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9ucyApLFxyXG4gICAgICBtb2xlY3VsZVZlbG9jaXRpZXM6IEFycmF5SU9OdWxsYWJsZUlPVmVjdG9yMklPLnRvU3RhdGVPYmplY3QoIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzICksXHJcbiAgICAgIG1vbGVjdWxlRm9yY2VzOiBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTy50b1N0YXRlT2JqZWN0KCB0aGlzLm1vbGVjdWxlRm9yY2VzICksXHJcbiAgICAgIG5leHRNb2xlY3VsZUZvcmNlczogQXJyYXlJT051bGxhYmxlSU9WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy5uZXh0TW9sZWN1bGVGb3JjZXMgKSxcclxuICAgICAgaW5zaWRlQ29udGFpbmVyOiBBcnJheUlPQm9vbGVhbklPLnRvU3RhdGVPYmplY3QoIHRoaXMuaW5zaWRlQ29udGFpbmVyICksXHJcbiAgICAgIG1vbGVjdWxlUm90YXRpb25BbmdsZXM6IEZsb2F0NjRBcnJheUlPLnRvU3RhdGVPYmplY3QoIHRoaXMubW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyApLFxyXG4gICAgICBtb2xlY3VsZVJvdGF0aW9uUmF0ZXM6IEZsb2F0NjRBcnJheUlPLnRvU3RhdGVPYmplY3QoIHRoaXMubW9sZWN1bGVSb3RhdGlvblJhdGVzICksXHJcbiAgICAgIG1vbGVjdWxlVG9ycXVlczogRmxvYXQ2NEFycmF5SU8udG9TdGF0ZU9iamVjdCggdGhpcy5tb2xlY3VsZVRvcnF1ZXMgKSxcclxuICAgICAgbmV4dE1vbGVjdWxlVG9ycXVlczogRmxvYXQ2NEFycmF5SU8udG9TdGF0ZU9iamVjdCggdGhpcy5uZXh0TW9sZWN1bGVUb3JxdWVzIClcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHN0YXRlIG9mIHRoaXMgaW5zdGFuY2UgZm9yIHBoZXQtaW8uICBUaGlzIGlzIHVzZWQgZm9yIHBoZXQtaW8sIGJ1dCBub3QgZGlyZWN0bHkgYnkgdGhlIFBoZXRpb1N0YXRlRW5naW5lIC1cclxuICAgKiBpdCBpcyBpbnN0ZWFkIGNhbGxlZCBkdXJpbmcgZXhwbGljaXQgZGUtc2VyaWFsaXphdGlvbi5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGVPYmplY3QgLSByZXR1cm5lZCBmcm9tIHRvU3RhdGVPYmplY3RcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0U3RhdGUoIHN0YXRlT2JqZWN0ICkge1xyXG4gICAgcmVxdWlyZWQoIHN0YXRlT2JqZWN0ICk7XHJcblxyXG4gICAgLy8gc2luZ2xlIHZhbHVlcyB0aGF0IHBlcnRhaW4gdG8gdGhlIGVudGlyZSBkYXRhIHNldFxyXG4gICAgdGhpcy5udW1iZXJPZkF0b21zID0gc3RhdGVPYmplY3QubnVtYmVyT2ZBdG9tcztcclxuICAgIHRoaXMubnVtYmVyT2ZNb2xlY3VsZXMgPSBzdGF0ZU9iamVjdC5udW1iZXJPZk1vbGVjdWxlcztcclxuICAgIHRoaXMubW9sZWN1bGVNYXNzID0gc3RhdGVPYmplY3QubW9sZWN1bGVNYXNzO1xyXG4gICAgdGhpcy5tb2xlY3VsZVJvdGF0aW9uYWxJbmVydGlhID0gc3RhdGVPYmplY3QubW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYTtcclxuICAgIHRoaXMuYXRvbXNQZXJNb2xlY3VsZSA9IHN0YXRlT2JqZWN0LmF0b21zUGVyTW9sZWN1bGU7XHJcblxyXG4gICAgLy8gYXJyYXlzIC0gY29weSB0aGUgdmFsdWVzIHJhdGhlciB0aGFuIG92ZXJ3cml0aW5nIGFueSByZWZlcmVuY2VzXHJcbiAgICBjb25zdCBhdG9tUG9zaXRpb25zID0gQXJyYXlJT051bGxhYmxlSU9WZWN0b3IySU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5hdG9tUG9zaXRpb25zICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mQXRvbXM7IGkrKyApIHtcclxuICAgICAgdGhpcy5hdG9tUG9zaXRpb25zWyBpIF0gPSBhdG9tUG9zaXRpb25zWyBpIF07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnMgPSBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zICk7XHJcbiAgICBjb25zdCBtb2xlY3VsZVZlbG9jaXRpZXMgPSBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1vbGVjdWxlVmVsb2NpdGllcyApO1xyXG4gICAgY29uc3QgbW9sZWN1bGVGb3JjZXMgPSBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1vbGVjdWxlRm9yY2VzICk7XHJcbiAgICBjb25zdCBuZXh0TW9sZWN1bGVGb3JjZXMgPSBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm5leHRNb2xlY3VsZUZvcmNlcyApO1xyXG4gICAgY29uc3QgbW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyA9IEZsb2F0NjRBcnJheUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyApO1xyXG4gICAgY29uc3QgbW9sZWN1bGVSb3RhdGlvblJhdGVzID0gRmxvYXQ2NEFycmF5SU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5tb2xlY3VsZVJvdGF0aW9uUmF0ZXMgKTtcclxuICAgIGNvbnN0IG1vbGVjdWxlVG9ycXVlcyA9IEZsb2F0NjRBcnJheUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubW9sZWN1bGVUb3JxdWVzICk7XHJcbiAgICBjb25zdCBpbnNpZGVDb250YWluZXIgPSBBcnJheUlPQm9vbGVhbklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuaW5zaWRlQ29udGFpbmVyICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mTW9sZWN1bGVzOyBpKysgKSB7XHJcbiAgICAgIHRoaXMubW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgXSA9IG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBpIF07XHJcbiAgICAgIHRoaXMubW9sZWN1bGVWZWxvY2l0aWVzWyBpIF0gPSBtb2xlY3VsZVZlbG9jaXRpZXNbIGkgXTtcclxuICAgICAgdGhpcy5tb2xlY3VsZUZvcmNlc1sgaSBdID0gbW9sZWN1bGVGb3JjZXNbIGkgXTtcclxuICAgICAgdGhpcy5uZXh0TW9sZWN1bGVGb3JjZXNbIGkgXSA9IG5leHRNb2xlY3VsZUZvcmNlc1sgaSBdO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXSA9IG1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXTtcclxuICAgICAgdGhpcy5tb2xlY3VsZVJvdGF0aW9uUmF0ZXNbIGkgXSA9IG1vbGVjdWxlUm90YXRpb25SYXRlc1sgaSBdO1xyXG4gICAgICB0aGlzLm1vbGVjdWxlVG9ycXVlc1sgaSBdID0gbW9sZWN1bGVUb3JxdWVzWyBpIF07XHJcbiAgICAgIHRoaXMuaW5zaWRlQ29udGFpbmVyWyBpIF0gPSBpbnNpZGVDb250YWluZXJbIGkgXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIER1bXAgdGhpcyBkYXRhIHNldCdzIGluZm9ybWF0aW9uIGluIGEgd2F5IHRoYXQgY2FuIHRoZW4gYmUgaW5jb3Jwb3JhdGVkIGludG8gYSBwaGFzZSBzdGF0ZSBjaGFuZ2VyIHRoYXQgbmVlZHMgdG9cclxuICAgKiB1c2UgZml4ZWQgcG9zaXRpb25zLCB2ZWxvY2l0aWVzLCBldGMuIHRvIHNldCB0aGUgc3RhdGUgb2YgYSBzdWJzdGFuY2UuICBUaGlzIHdhcyBjcmVhdGVkIGluIG9yZGVyIHRvIGNvbWUgdXAgd2l0aFxyXG4gICAqIGdvb2QgaW5pdGlhbCBjb25maWd1cmF0aW9ucyBpbnN0ZWFkIG9mIHVzaW5nIGFuIGFsZ29yaXRobWljYWxseSBnZW5lcmF0ZWQgb25lcywgd2hpY2ggY2FuIGxvb2sgdW5uYXR1cmFsLiAgU2VlXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N0YXRlcy1vZi1tYXR0ZXIvaXNzdWVzLzIxMi4gIFRvIHVzZSB0aGlzLCBzZXQgYSBkZWJ1Z2dlciBhdCBhIHBvaW50IGluIHRoZSBjb2RlXHJcbiAgICogd2hlcmUgdGhlIHN1YnN0YW5jZSBpcyBpbiB0aGUgZGVzaXJlZCBwb3NpdGlvbiwgY2FsbCB0aGlzIGZyb20gdGhlIGNvbW1hbmQgbGluZSwgYW5kIHRoZW4gaW5jb3Jwb3JhdGUgdGhlIG91dHB1dFxyXG4gICAqIGludG8gdGhlIGFwcHJvcHJpYXRlIHBoYXNlIHN0YXRlIGNoYW5nZXIgb2JqZWN0IChlLmcuIFdhdGVyUGhhc2VTdGF0ZUNoYW5nZXIpLiAgU29tZSBoYW5kLXR3ZWFraW5nIGlzIGdlbmVyYWxseVxyXG4gICAqIG5lY2Vzc2FyeS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZHVtcCgpIHtcclxuXHJcbiAgICBsZXQgaTtcclxuICAgIGNvbnN0IG51bU1vbGVjdWxlcyA9IHRoaXMubnVtYmVyT2ZNb2xlY3VsZXM7XHJcblxyXG4gICAgY29uc29sZS5sb2coICdtb2xlY3VsZUNlbnRlck9mTWFzc1Bvc2l0aW9uczonICk7XHJcbiAgICBjb25zb2xlLmxvZyggJ1snICk7XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IG51bU1vbGVjdWxlczsgaSsrICkge1xyXG4gICAgICBjb25zdCBjb21Qb3MgPSB0aGlzLm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zWyBpIF07XHJcbiAgICAgIGNvbnNvbGUubG9nKCAneycsICd4OiAnLCBVdGlscy50b0ZpeGVkKCBjb21Qb3MueCwgMyApLCAnLCB5OiAnLCBVdGlscy50b0ZpeGVkKCBjb21Qb3MueSwgMyApLCAnfScgKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKCAnXSwnICk7XHJcblxyXG4gICAgY29uc29sZS5sb2coICdtb2xlY3VsZVZlbG9jaXRpZXM6JyApO1xyXG4gICAgY29uc29sZS5sb2coICdbJyApO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCBudW1Nb2xlY3VsZXM7IGkrKyApIHtcclxuICAgICAgY29uc3QgdmVsID0gdGhpcy5tb2xlY3VsZVZlbG9jaXRpZXNbIGkgXTtcclxuICAgICAgY29uc29sZS5sb2coICd7JywgJ3g6ICcsIFV0aWxzLnRvRml4ZWQoIHZlbC54LCAzICksICcsIHk6ICcsIFV0aWxzLnRvRml4ZWQoIHZlbC55LCAzICksICd9JyApO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coICddLCcgKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyggJ21vbGVjdWxlUm90YXRpb25BbmdsZXM6JyApO1xyXG4gICAgY29uc29sZS5sb2coICdbJyApO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCBudW1Nb2xlY3VsZXM7IGkrKyApIHtcclxuICAgICAgY29uc3QgYW5nbGUgPSB0aGlzLm1vbGVjdWxlUm90YXRpb25BbmdsZXNbIGkgXTtcclxuICAgICAgY29uc29sZS5sb2coIFV0aWxzLnRvRml4ZWQoIGFuZ2xlLCAzICksICcsJyApO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coICddLCcgKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyggJ21vbGVjdWxlUm90YXRpb25SYXRlczonICk7XHJcbiAgICBjb25zb2xlLmxvZyggJ1snICk7XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IG51bU1vbGVjdWxlczsgaSsrICkge1xyXG4gICAgICBjb25zdCByYXRlID0gdGhpcy5tb2xlY3VsZVJvdGF0aW9uUmF0ZXNbIGkgXTtcclxuICAgICAgY29uc29sZS5sb2coIFV0aWxzLnRvRml4ZWQoIHJhdGUsIDMgKSwgJywnICk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyggJ10sJyApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gSU8gVHlwZSBmb3IgTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQsIHVzZXMgXCJkYXRhIHR5cGVcIiBzZXJpYWxpemF0aW9uIHdoZXJlIGBmcm9tU3RhdGVPYmplY3QgcmV0dXJucyBhIG5ld1xyXG4vLyBpbnN0YW5jZS5cclxuTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQuTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXRJTyA9IG5ldyBJT1R5cGUoICdNb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldElPJywge1xyXG4gIHZhbHVlVHlwZTogTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ3BhcnRpY2xlIGRhdGEgc2V0JyxcclxuICB0b1N0YXRlT2JqZWN0OiBtb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldCA9PiBtb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldC50b1N0YXRlT2JqZWN0KCksXHJcbiAgc3RhdGVTY2hlbWE6IHtcclxuICAgIGF0b21zUGVyTW9sZWN1bGU6IE51bWJlcklPLFxyXG4gICAgbnVtYmVyT2ZBdG9tczogTnVtYmVySU8sXHJcbiAgICBudW1iZXJPZk1vbGVjdWxlczogTnVtYmVySU8sXHJcbiAgICBtb2xlY3VsZU1hc3M6IE51bWJlcklPLFxyXG4gICAgbW9sZWN1bGVSb3RhdGlvbmFsSW5lcnRpYTogTnVtYmVySU8sXHJcblxyXG4gICAgLy8gYXJyYXlzXHJcbiAgICBhdG9tUG9zaXRpb25zOiBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTyxcclxuICAgIG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zOiBBcnJheUlPTnVsbGFibGVJT1ZlY3RvcjJJTyxcclxuICAgIG1vbGVjdWxlVmVsb2NpdGllczogQXJyYXlJT051bGxhYmxlSU9WZWN0b3IySU8sXHJcbiAgICBtb2xlY3VsZUZvcmNlczogQXJyYXlJT051bGxhYmxlSU9WZWN0b3IySU8sXHJcbiAgICBuZXh0TW9sZWN1bGVGb3JjZXM6IEFycmF5SU9OdWxsYWJsZUlPVmVjdG9yMklPLFxyXG4gICAgaW5zaWRlQ29udGFpbmVyOiBBcnJheUlPQm9vbGVhbklPLFxyXG4gICAgbW9sZWN1bGVSb3RhdGlvbkFuZ2xlczogRmxvYXQ2NEFycmF5SU8sXHJcbiAgICBtb2xlY3VsZVJvdGF0aW9uUmF0ZXM6IEZsb2F0NjRBcnJheUlPLFxyXG4gICAgbW9sZWN1bGVUb3JxdWVzOiBGbG9hdDY0QXJyYXlJTyxcclxuICAgIG5leHRNb2xlY3VsZVRvcnF1ZXM6IEZsb2F0NjRBcnJheUlPXHJcbiAgfVxyXG59ICk7XHJcblxyXG5zdGF0ZXNPZk1hdHRlci5yZWdpc3RlciggJ01vbGVjdWxlRm9yY2VBbmRNb3Rpb25EYXRhU2V0JywgTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGVGb3JjZUFuZE1vdGlvbkRhdGFTZXQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxPQUFPQyxPQUFPLE1BQU0sd0NBQXdDO0FBQzVELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsY0FBYyxNQUFNLCtDQUErQztBQUMxRSxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFVBQVUsTUFBTSwyQ0FBMkM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DOztBQUV2RTtBQUNBLE1BQU1DLDBCQUEwQixHQUFHVCxPQUFPLENBQUVJLFVBQVUsQ0FBRU4sT0FBTyxDQUFDWSxTQUFVLENBQUUsQ0FBQztBQUM3RSxNQUFNQyxnQkFBZ0IsR0FBR1gsT0FBTyxDQUFFQyxT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