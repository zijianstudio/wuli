// Copyright 2020-2023, University of Colorado Boulder

/**
 * Contains multiple buckets of different types of atoms and a kit play area for dropping the atoms. There is only one
 * "active" kit at a time, which is regulated by toggling the carousel pages. Active kits have their buckets and kit
 * play area's visible for interaction
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../../phet-core/js/cleanArray.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
import LewisDotModel from './LewisDotModel.js';
import Molecule from './Molecule.js';
import MoleculeList from './MoleculeList.js';
import MoleculeStructure from './MoleculeStructure.js';
let kitIdCounter = 0;
class Kit {
  /**
   * @param {CollectionLayout} collectionLayout
   * @param {Array.<Bucket>} buckets
   */
  constructor(collectionLayout, buckets) {
    // @public {number}
    this.id = kitIdCounter++;

    // @public {ObservableArrayDef.<Atom2>}
    this.atomsInPlayArea = createObservableArray();

    // @public {Property.<Atom|null>} Atom that has been clicked by user. Used for triggering cut targets for breaking bonds
    this.selectedAtomProperty = new Property(null);

    // @public {BooleanProperty} Whether this kit is the present kit being displayed and interacted with
    this.activeProperty = new BooleanProperty(false);

    // @public {BooleanProperty} Whether this kit is visible
    this.visibleProperty = new BooleanProperty(false);

    // @public {Emitter} - Called with a single parameter molecule
    this.addedMoleculeEmitter = new Emitter({
      parameters: [{
        valueType: Molecule
      }]
    });
    this.removedMoleculeEmitter = new Emitter({
      parameters: [{
        valueType: Molecule
      }]
    });

    // @public {Array.<Atom2>} Master list of atoms (in and out of buckets), but not ones in collection boxes
    this.atoms = [];

    // @public {Array.<Atom2>} atoms in the collection box
    this.atomsInCollectionBox = [];

    // @public {Array.<Molecule>} molecules in the play area
    this.molecules = [];

    // @public {LewisDotModel|null} Created later, lewis-dot connections between atoms on the play area
    this.lewisDotModel = null;

    // @public {Array.<Bucket>}
    this.buckets = buckets;

    // @public {CollectionLayout}
    this.collectionLayout = collectionLayout;

    // Rest the kit and adjust the bucket layout
    this.reset();
    this.layoutBuckets(buckets);

    // Add a molecule to the kit whenever we add an atom to the play area.
    this.atomsInPlayArea.addItemAddedListener(atom => {
      // Add a molecule to the kit with our newly added atom
      const molecule = new Molecule();
      molecule.addAtom(atom);
      this.addMolecule(molecule);
    });
  }

  /**
   * @public
   */
  reset() {
    // not resetting visible, since that is not handled by us
    this.selectedAtomProperty.reset();

    // send out notifications for all removed molecules
    this.molecules.slice().forEach(this.removeMolecule.bind(this));

    // put everything back in buckets
    this.atoms.concat(this.atomsInCollectionBox).forEach(atom => {
      // reset the actual atom
      atom.reset();

      // THEN place it so we overwrite its "bad" position and destination info
      this.getBucketForElement(atom.element).placeAtom(atom, true);
    });

    // if reset kit ignores collection boxes, add in other atoms that are equivalent to how the bucket started
    // NOTE: right now, the actual atom models move back to the buckets even though the virtual "molecule" says in the box. consider moving it!

    // wipe our internal state
    cleanArray(this.atoms);
    cleanArray(this.atomsInCollectionBox);
    this.atomsInPlayArea.reset();
    this.lewisDotModel = new LewisDotModel();
    cleanArray(this.molecules);

    // keep track of all atoms in our kit
    this.buckets.forEach(bucket => {
      this.atoms = this.atoms.concat(bucket.getParticleList());
      bucket.getParticleList().forEach(atom => {
        this.lewisDotModel.addAtom(atom);
      });

      // Set the bucket to its filled state.
      bucket.setToFullState();
    });
  }

  /**
   * Adjust the layout of the buckets along with moving their atoms to the correct positions
   *
   * @param {Array.<Bucket>} buckets
   * @public
   */
  layoutBuckets(buckets) {
    let usedWidth = 0;
    const bucketBounds = Bounds2.NOTHING.copy(); // considered mutable, used to calculate the center bounds of a bucket AND its atoms

    // lays out all of the buckets from the left to right
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (i !== 0) {
        usedWidth += Kit.bucketPadding;
      }

      // include both the bucket's shape and its atoms in our bounds, so we can properly center the group
      bucketBounds.includeBounds(bucket.containerShape.bounds);
      bucket.getParticleList().forEach(atom => {
        const atomPosition = atom.positionProperty.value;
        bucketBounds.includeBounds(new Bounds2(atomPosition.x - atom.covalentRadius, atomPosition.y - atom.covalentRadius, atomPosition.x + atom.covalentRadius, atomPosition.y + atom.covalentRadius));
      });
      bucket.position = new Vector2(usedWidth, 0);
      usedWidth += bucket.width;
    }

    // centers the buckets horizontally within the kit
    buckets.forEach(bucket => {
      // also note: this moves the atoms also!
      bucket.position = new Vector2(bucket.position.x - usedWidth / 2 + bucket.width / 2, bucketBounds.centerY);
    });
  }

  /**
   * Returns the bucket for a given element
   * @param {Element} element
   *
   * @private
   * @returns {Bucket}
   */
  getBucketForElement(element) {
    const elementBucket = _.find(this.buckets, bucket => {
      return bucket.element.isSameElement(element);
    });
    assert && assert(elementBucket, 'Element does not have an associated bucket.');
    return elementBucket;
  }

  /**
   * Returns kit bounds within the collection layout
   *
   * @public
   * @returns {Bounds2}
   */
  get availableKitBounds() {
    return this.collectionLayout.availableKitBounds;
  }

  /**
   * Returns play area bounds within the collection layout
   * @public
   *
   * @returns {Bounds2}
   */
  get availablePlayAreaBounds() {
    return this.collectionLayout.availablePlayAreaBounds;
  }

  /**
   * Called when an atom is dropped within either the play area OR the kit area. This will NOT be called for molecules
   * dropped into the collection area successfully
   *
   * @param {Atom2} atom - The dropped atom.
   * @param {boolean} droppedInKitArea - The dropped atom.
   * @public
   */
  atomDropped(atom, droppedInKitArea) {
    const molecule = this.getMolecule(atom);

    // dropped on kit, put it in a bucket
    if (droppedInKitArea) {
      this.recycleMoleculeIntoBuckets(molecule);
    } else {
      // dropped in play area
      if (molecule) {
        this.attemptToBondMolecule(molecule);
        this.separateMoleculeDestinations();
      }
    }
  }

  /**
   * Called when a molecule is dragged (successfully) into a collection box
   *
   * @param {Molecule} molecule
   * @param {CollectionBox} box
   * @public
   */
  moleculePutInCollectionBox(molecule, box) {
    if (BAMQueryParameters.logData) {
      console.log(`You have collected: ${box.moleculeType.commonName}`);
    }
    this.removeMolecule(molecule);
    molecule.atoms.forEach(atom => {
      this.atoms.splice(this.atoms.indexOf(atom), 1);
      this.atomsInCollectionBox.push(atom);
      atom.visibleProperty.value = false;

      // Atoms in the CollectionBox shouldn't be in the play area.
      this.atomsInPlayArea.remove(atom);
    });
    box.addMolecule(molecule);
  }

  /**
   * Returns whether or not this atom registered in any of the molecule structures
   * @param {Atom2} atom
   * @public
   *
   * @returns {boolean}
   */
  isAtomInPlay(atom) {
    return this.getMolecule(atom) !== null;
  }

  /**
   * Return the molecule of a given atom. This can return a molecule with only one atom and zero bonds (single atom).
   * @param {Atom2} atom
   * @public
   *
   * @returns {Molecule|null}
   */
  getMolecule(atom) {
    // Note: (performance) seems like this could be a bottleneck? faster ways?
    const numMolecules = this.molecules.length;
    for (let i = 0; i < numMolecules; i++) {
      const molecule = this.molecules[i];
      const numAtoms = molecule.atoms.length;
      for (let j = 0; j < numAtoms; j++) {
        const otherAtom = molecule.atoms[j];
        if (otherAtom === atom) {
          return molecule;
        }
      }
    }
    return null;
  }

  /**
   * Breaks apart a molecule into separate atoms that remain in the play area
   *
   * @param {Molecule} molecule - the molecule to break
   * @public
   */
  breakMolecule(molecule) {
    const createdMolecules = [];
    this.removeMolecule(molecule);
    molecule.atoms.forEach(atom => {
      // Break the current molecule and create a new molecule for each atom
      this.lewisDotModel.breakBondsOfAtom(atom);
      const newMolecule = new Molecule();
      newMolecule.addAtom(atom);
      this.addMolecule(newMolecule);
      createdMolecules.push(molecule);
    });

    // Separate all the molecules, including the newly created molecules.
    this.separateMoleculeDestinations();
  }

  /**
   * Breaks a bond between two atoms in a molecule.
   * @param {Atom2} a - Atom A
   * @param {Atom2} b - Atom B
   *
   * @public
   */
  breakBond(a, b) {
    // get our old and new molecule structures
    const oldMolecule = this.getMolecule(a);
    const newMolecules = MoleculeStructure.getMoleculesFromBrokenBond(oldMolecule, oldMolecule.getBond(a, b), new Molecule(), new Molecule());

    // break the bond in our lewis dot model
    this.lewisDotModel.breakBond(a, b);

    // remove the old one, add the new ones (firing listeners)
    this.removeMolecule(oldMolecule);
    newMolecules.forEach(this.addMolecule.bind(this));

    // push the new separate molecules away
    this.separateMoleculeDestinations();
  }

  /**
   * Return the direction of the bond between two atoms
   * @param {Atom2} a - An atom A
   * @param {Atom2} b - An atom B
   *
   * @public
   * @returns {Direction}
   */
  getBondDirection(a, b) {
    return this.lewisDotModel.getBondDirection(a, b);
  }

  /**
   * Checks if all of the buckets in the kit are filled.
   *
   * @public
   * @returns {boolean}
   */
  allBucketsFilled() {
    let allBucketsFilled = true;
    this.buckets.forEach(bucket => {
      if (!bucket.isFull()) {
        allBucketsFilled = false;
      }
    });
    return allBucketsFilled;
  }

  /**
   * Add a molecule to this kit
   * @param {Molecule} molecule
   *
   * @public
   */
  addMolecule(molecule) {
    this.molecules.push(molecule);
    this.addedMoleculeEmitter.emit(molecule);
  }

  /**
   * Remove a molecule from this kit
   * @param {Molecule} molecule
   *
   * @public
   */
  removeMolecule(molecule) {
    arrayRemove(this.molecules, molecule);
    this.removedMoleculeEmitter.emit(molecule);
  }

  /**
   * Takes an atom that was in a bucket and hooks it up within our structural model. It allocates a molecule for the
   * atom, and then attempts to bond with it.
   * @param {Atom2} atom
   *
   * @public
   */
  addAtomToPlay(atom) {
    // add the atoms to our models
    const molecule = new Molecule();
    molecule.addAtom(atom);
    this.addMolecule(molecule);

    // attempt to bond
    this.attemptToBondMolecule(molecule);
  }

  /**
   * Returns whether or not the atom is contained in any of this kit's buckets
   * @param {Atom2} atom
   * @private
   *
   * @returns {boolean}
   */
  isContainedInBucket(atom) {
    return _.some(this.buckets, bucket => {
      return bucket.containsParticle(atom);
    });
  }

  /**
   * Takes an atom, invalidates the structural bonds it may have, and puts it in the correct bucket
   * @param {Atom2} atom - the atom to recycle
   * @param {boolean} animate Whether we should display animation
   *
   * @private
   */
  recycleAtomIntoBuckets(atom, animate) {
    this.lewisDotModel.breakBondsOfAtom(atom);
    this.atomsInPlayArea.remove(atom);
    const bucket = this.getBucketForElement(atom.element);
    bucket.addParticleNearestOpen(atom, animate);
    if (!bucket.particleList.includes(atom)) {
      bucket.particleList.push(atom);
    }
  }

  /**
   * Recycles an entire molecule by invalidating its bonds and putting its atoms into their respective buckets
   * @param {Molecule} molecule
   *
   * @private
   */
  recycleMoleculeIntoBuckets(molecule) {
    molecule.atoms.forEach(atom => {
      this.recycleAtomIntoBuckets(atom, true);
    });
    this.removeMolecule(molecule);
  }

  /**
   * Add padding to the molecule bounds.
   * @param {Bounds2} bounds
   *
   * @private
   * @returns {Bounds2}
   */
  padMoleculeBounds(bounds) {
    const halfPadding = Kit.interMoleculePadding / 2;
    return Bounds2.rect(bounds.x - halfPadding, bounds.y - halfPadding, bounds.width + Kit.interMoleculePadding, bounds.height + Kit.interMoleculePadding);
  }

  /**
   * Update atom destinations so that separate molecules will be separated visually
   *
   * @private
   */
  separateMoleculeDestinations() {
    let maxIterations = 200;
    const pushAmount = 10; // how much to push two molecules away
    const availablePlayAreaBounds = this.collectionLayout.availablePlayAreaBounds;
    const numMolecules = this.molecules.length;
    let foundOverlap = true;
    while (foundOverlap && maxIterations-- >= 0) {
      foundOverlap = false;
      for (let i = 0; i < numMolecules; i++) {
        const a = this.molecules[i];
        let aBounds = this.padMoleculeBounds(a.destinationBounds);

        // push it away from the outsides
        if (aBounds.minX < availablePlayAreaBounds.minX) {
          a.shiftDestination(new Vector2(availablePlayAreaBounds.minX - aBounds.minX, 0));
          aBounds = this.padMoleculeBounds(a.destinationBounds);
        }
        if (aBounds.maxX > availablePlayAreaBounds.maxX) {
          a.shiftDestination(new Vector2(availablePlayAreaBounds.maxX - aBounds.maxX, 0));
          aBounds = this.padMoleculeBounds(a.destinationBounds);
        }
        if (aBounds.minY < availablePlayAreaBounds.minY) {
          a.shiftDestination(new Vector2(0, availablePlayAreaBounds.minY - aBounds.minY));
          aBounds = this.padMoleculeBounds(a.destinationBounds);
        }
        if (aBounds.maxY > availablePlayAreaBounds.maxY) {
          a.shiftDestination(new Vector2(0, availablePlayAreaBounds.maxY - aBounds.maxY));
        }

        // then separate it from other molecules
        for (let k = 0; k < numMolecules; k++) {
          const b = this.molecules[k];
          if (a.moleculeId >= b.moleculeId) {
            // this removes the case where a == b, and will make sure we don't run the following code twice for (a,b) and (b,a)
            continue;
          }
          const bBounds = this.padMoleculeBounds(b.destinationBounds);
          if (aBounds.intersectsBounds(bBounds)) {
            foundOverlap = true;

            // get perturbed centers. this is so that if two molecules have the exact same centers, we will push them away
            const aCenter = aBounds.center.add(new Vector2(dotRandom.nextDouble() - 0.5, dotRandom.nextDouble() - 0.5));
            const bCenter = bBounds.center.add(new Vector2(dotRandom.nextDouble() - 0.5, dotRandom.nextDouble() - 0.5));

            // delta from center of A to center of B, scaled to half of our push amount.
            const delta = bCenter.minus(aCenter).normalized().times(pushAmount);

            // how hard B should be pushed (A will be pushed (1-pushRatio)). Heuristic, power is to make the ratio not too skewed
            // this is done so that heavier molecules will be pushed less, while lighter ones will be pushed more
            const pushPower = 1;
            const pushRatio = Math.pow(a.getApproximateMolecularWeight(), pushPower) / (Math.pow(a.getApproximateMolecularWeight(), pushPower) + Math.pow(b.getApproximateMolecularWeight(), pushPower));

            // push B by the pushRatio
            b.shiftDestination(delta.times(pushRatio));

            // push A the opposite way, by (1 - pushRatio)
            const delta1 = delta.times(-1 * (1 - pushRatio));
            a.shiftDestination(delta1);
            aBounds = this.padMoleculeBounds(a.destinationBounds);
          }
        }
      }
    }
  }

  /**
   * Bonds one atom to another, and handles the corresponding structural changes between molecules.
   * @param {Atom2} a - An atom A
   * @param {Direction} dirAtoB - The direction from A that the bond will go in (for lewis-dot structure)
   * @param {Atom2} b - An atom B
   *
   * @private
   */
  bond(a, dirAtoB, b) {
    this.lewisDotModel.bond(a, dirAtoB, b);
    const molA = this.getMolecule(a);
    const molB = this.getMolecule(b);
    if (molA === molB) {
      throw new Error('WARNING: loop or other invalid structure detected in a molecule');
    }
    const newMolecule = MoleculeStructure.getCombinedMoleculeFromBond(molA, molB, a, b, new Molecule());
    this.removeMolecule(molA);
    this.removeMolecule(molB);
    this.addMolecule(newMolecule);

    /*---------------------------------------------------------------------------*
     * bonding diagnostics and sanity checks
     *----------------------------------------------------------------------------*/

    if (BAMQueryParameters.logData) {
      const serializedForm = this.getMolecule(a).toSerial2();
      console.log(`created structure: ${serializedForm}`);
    }
    const structure = this.getMolecule(a);
    if (structure.atoms.length > 2) {
      structure.bonds.forEach(bond => {
        if (bond.a.hasSameElement(bond.b) && bond.a.symbol === 'H') {
          console.log('WARNING: Hydrogen bonded to another hydrogen in a molecule which is not diatomic hydrogen');
        }
      });
    }
  }

  /**
   * @param {Atom2} a - An atom A
   * @param {Atom2} b - An atom B
   * @private
   *
   * @returns {MoleculeStructure}
   */
  getPossibleMoleculeStructureFromBond(a, b) {
    const molA = this.getMolecule(a);
    const molB = this.getMolecule(b);
    assert && assert(molA !== molB);
    return MoleculeStructure.getCombinedMoleculeFromBond(molA, molB, a, b, new Molecule());
  }

  /**
   * Attempt to bond a molecule to another molecule based on the open bonding options
   * @param {Molecule} molecule - A molecule that should attempt to bind to other molecules
   * @private
   *
   * @returns {boolean}
   */
  attemptToBondMolecule(molecule) {
    let bestBondingOption = null; // {BondingOption|null}
    let bestDistanceFromIdealPosition = Number.POSITIVE_INFINITY;
    let atomsOverlap = false;

    // for each atom in our molecule, we try to see if it can bond to other atoms
    molecule.atoms.forEach(ourAtom => {
      // all other atoms
      this.atoms.forEach(otherAtom => {
        // disallow loops in an already-connected molecule
        if (this.getMolecule(otherAtom) === molecule) {
          return; // continue, in the inner loop
        }

        // don't bond to something in a bucket!
        if (!this.isContainedInBucket(otherAtom)) {
          // sanity check, and run it through our molecule structure model to see if it would be allowable
          if (otherAtom === ourAtom || !this.canBond(ourAtom, otherAtom)) {
            return; // continue, in the inner loop
          }

          this.lewisDotModel.getOpenDirections(otherAtom).forEach(otherDirection => {
            const direction = otherDirection.opposite;
            if (!_.includes(this.lewisDotModel.getOpenDirections(ourAtom), direction)) {
              // the spot on otherAtom was open, but the corresponding spot on our main atom was not
              return; // continue, in the inner loop
            }

            // check the lewis dot model to make sure we wouldn't have two "overlapping" atoms that aren't both hydrogen
            if (!this.lewisDotModel.willAllowBond(ourAtom, direction, otherAtom)) {
              return; // continue, in the inner loop
            }

            const bondingOption = new BondingOption(otherAtom, otherDirection, ourAtom);
            const distance = ourAtom.positionProperty.value.distance(bondingOption.idealPosition);
            if (distance < bestDistanceFromIdealPosition) {
              bestBondingOption = bondingOption;
              bestDistanceFromIdealPosition = distance;
            }
            if (ourAtom.positionBounds.intersectsBounds(otherAtom.positionBounds)) {
              atomsOverlap = true;
            }
          });
        }
      });
    });

    // if our closest bond is too far and our atoms don't overlap, then ignore it
    const isBondingInvalid = (bestBondingOption === null || bestDistanceFromIdealPosition > Kit.bondDistanceThreshold) && !atomsOverlap;
    if (isBondingInvalid) {
      this.separateMoleculeDestinations();
      return false;
    }

    // cause all atoms in the molecule to move to that position
    const delta = bestBondingOption.idealPosition.minus(bestBondingOption.b.positionProperty.value);
    this.getMolecule(bestBondingOption.b).atoms.forEach(atomInMolecule => {
      atomInMolecule.setPositionAndDestination(atomInMolecule.positionProperty.value.plus(delta));
    });

    // we now will bond the atom
    this.bond(bestBondingOption.a, bestBondingOption.direction, bestBondingOption.b); // model bonding
    return true;
  }

  /**
   * Returns if two atoms can create a bond
   * @param {Atom2} a - An atom A
   * @param {Atom2} b - An atom B
   *
   * @private
   * @returns {boolean}
   */
  canBond(a, b) {
    return this.getMolecule(a) !== this.getMolecule(b) && this.isAllowedStructure(this.getPossibleMoleculeStructureFromBond(a, b)) && this.collectionLayout.availablePlayAreaBounds.containsPoint(a.positionProperty.value) && this.collectionLayout.availablePlayAreaBounds.containsPoint(b.positionProperty.value);
  }

  /**
   * Checks if the molecule structure is found within our molecule data
   * @param {MoleculeStructure} moleculeStructure
   * @private
   *
   * @returns {boolean}
   */
  isAllowedStructure(moleculeStructure) {
    return moleculeStructure.atoms.length < 2 || MoleculeList.getMasterInstance().isAllowedStructure(moleculeStructure);
  }
}

// A bond option from A to B. B would be moved to the position near A to bond.
class BondingOption {
  /**
   * @param {Atom2} a - An atom A
   * @param {Direction} direction
   * @param {Atom2} b - An atom b
   */
  constructor(a, direction, b) {
    // @public {Atom2}
    this.a = a;

    // @public {Direction}
    this.direction = direction;

    // @public {Atom2}
    this.b = b;

    // @private {Vector2} The position the atom should be placed
    this.idealPosition = a.positionProperty.value.plus(direction.vector.times(a.covalentRadius + b.covalentRadius));
  }
}

// @private {BondingOption} Available bonding option
Kit.BondingOption = BondingOption;

// @private {number} Determines how close a molecule needs to be to attempt to bond
Kit.bondDistanceThreshold = 100;

// @private {number} Distance between each bucket
Kit.bucketPadding = 50;

// @private {number} Determines how far away to separate the molecules from each other
Kit.interMoleculePadding = 100;
buildAMolecule.register('Kit', Kit);
export default Kit;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiZG90UmFuZG9tIiwiVmVjdG9yMiIsImFycmF5UmVtb3ZlIiwiY2xlYW5BcnJheSIsImJ1aWxkQU1vbGVjdWxlIiwiQkFNUXVlcnlQYXJhbWV0ZXJzIiwiTGV3aXNEb3RNb2RlbCIsIk1vbGVjdWxlIiwiTW9sZWN1bGVMaXN0IiwiTW9sZWN1bGVTdHJ1Y3R1cmUiLCJraXRJZENvdW50ZXIiLCJLaXQiLCJjb25zdHJ1Y3RvciIsImNvbGxlY3Rpb25MYXlvdXQiLCJidWNrZXRzIiwiaWQiLCJhdG9tc0luUGxheUFyZWEiLCJzZWxlY3RlZEF0b21Qcm9wZXJ0eSIsImFjdGl2ZVByb3BlcnR5IiwidmlzaWJsZVByb3BlcnR5IiwiYWRkZWRNb2xlY3VsZUVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwicmVtb3ZlZE1vbGVjdWxlRW1pdHRlciIsImF0b21zIiwiYXRvbXNJbkNvbGxlY3Rpb25Cb3giLCJtb2xlY3VsZXMiLCJsZXdpc0RvdE1vZGVsIiwicmVzZXQiLCJsYXlvdXRCdWNrZXRzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhdG9tIiwibW9sZWN1bGUiLCJhZGRBdG9tIiwiYWRkTW9sZWN1bGUiLCJzbGljZSIsImZvckVhY2giLCJyZW1vdmVNb2xlY3VsZSIsImJpbmQiLCJjb25jYXQiLCJnZXRCdWNrZXRGb3JFbGVtZW50IiwiZWxlbWVudCIsInBsYWNlQXRvbSIsImJ1Y2tldCIsImdldFBhcnRpY2xlTGlzdCIsInNldFRvRnVsbFN0YXRlIiwidXNlZFdpZHRoIiwiYnVja2V0Qm91bmRzIiwiTk9USElORyIsImNvcHkiLCJpIiwibGVuZ3RoIiwiYnVja2V0UGFkZGluZyIsImluY2x1ZGVCb3VuZHMiLCJjb250YWluZXJTaGFwZSIsImJvdW5kcyIsImF0b21Qb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsIngiLCJjb3ZhbGVudFJhZGl1cyIsInkiLCJwb3NpdGlvbiIsIndpZHRoIiwiY2VudGVyWSIsImVsZW1lbnRCdWNrZXQiLCJfIiwiZmluZCIsImlzU2FtZUVsZW1lbnQiLCJhc3NlcnQiLCJhdmFpbGFibGVLaXRCb3VuZHMiLCJhdmFpbGFibGVQbGF5QXJlYUJvdW5kcyIsImF0b21Ecm9wcGVkIiwiZHJvcHBlZEluS2l0QXJlYSIsImdldE1vbGVjdWxlIiwicmVjeWNsZU1vbGVjdWxlSW50b0J1Y2tldHMiLCJhdHRlbXB0VG9Cb25kTW9sZWN1bGUiLCJzZXBhcmF0ZU1vbGVjdWxlRGVzdGluYXRpb25zIiwibW9sZWN1bGVQdXRJbkNvbGxlY3Rpb25Cb3giLCJib3giLCJsb2dEYXRhIiwiY29uc29sZSIsImxvZyIsIm1vbGVjdWxlVHlwZSIsImNvbW1vbk5hbWUiLCJzcGxpY2UiLCJpbmRleE9mIiwicHVzaCIsInJlbW92ZSIsImlzQXRvbUluUGxheSIsIm51bU1vbGVjdWxlcyIsIm51bUF0b21zIiwiaiIsIm90aGVyQXRvbSIsImJyZWFrTW9sZWN1bGUiLCJjcmVhdGVkTW9sZWN1bGVzIiwiYnJlYWtCb25kc09mQXRvbSIsIm5ld01vbGVjdWxlIiwiYnJlYWtCb25kIiwiYSIsImIiLCJvbGRNb2xlY3VsZSIsIm5ld01vbGVjdWxlcyIsImdldE1vbGVjdWxlc0Zyb21Ccm9rZW5Cb25kIiwiZ2V0Qm9uZCIsImdldEJvbmREaXJlY3Rpb24iLCJhbGxCdWNrZXRzRmlsbGVkIiwiaXNGdWxsIiwiZW1pdCIsImFkZEF0b21Ub1BsYXkiLCJpc0NvbnRhaW5lZEluQnVja2V0Iiwic29tZSIsImNvbnRhaW5zUGFydGljbGUiLCJyZWN5Y2xlQXRvbUludG9CdWNrZXRzIiwiYW5pbWF0ZSIsImFkZFBhcnRpY2xlTmVhcmVzdE9wZW4iLCJwYXJ0aWNsZUxpc3QiLCJpbmNsdWRlcyIsInBhZE1vbGVjdWxlQm91bmRzIiwiaGFsZlBhZGRpbmciLCJpbnRlck1vbGVjdWxlUGFkZGluZyIsInJlY3QiLCJoZWlnaHQiLCJtYXhJdGVyYXRpb25zIiwicHVzaEFtb3VudCIsImZvdW5kT3ZlcmxhcCIsImFCb3VuZHMiLCJkZXN0aW5hdGlvbkJvdW5kcyIsIm1pblgiLCJzaGlmdERlc3RpbmF0aW9uIiwibWF4WCIsIm1pblkiLCJtYXhZIiwiayIsIm1vbGVjdWxlSWQiLCJiQm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsImFDZW50ZXIiLCJjZW50ZXIiLCJhZGQiLCJuZXh0RG91YmxlIiwiYkNlbnRlciIsImRlbHRhIiwibWludXMiLCJub3JtYWxpemVkIiwidGltZXMiLCJwdXNoUG93ZXIiLCJwdXNoUmF0aW8iLCJNYXRoIiwicG93IiwiZ2V0QXBwcm94aW1hdGVNb2xlY3VsYXJXZWlnaHQiLCJkZWx0YTEiLCJib25kIiwiZGlyQXRvQiIsIm1vbEEiLCJtb2xCIiwiRXJyb3IiLCJnZXRDb21iaW5lZE1vbGVjdWxlRnJvbUJvbmQiLCJzZXJpYWxpemVkRm9ybSIsInRvU2VyaWFsMiIsInN0cnVjdHVyZSIsImJvbmRzIiwiaGFzU2FtZUVsZW1lbnQiLCJzeW1ib2wiLCJnZXRQb3NzaWJsZU1vbGVjdWxlU3RydWN0dXJlRnJvbUJvbmQiLCJiZXN0Qm9uZGluZ09wdGlvbiIsImJlc3REaXN0YW5jZUZyb21JZGVhbFBvc2l0aW9uIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJhdG9tc092ZXJsYXAiLCJvdXJBdG9tIiwiY2FuQm9uZCIsImdldE9wZW5EaXJlY3Rpb25zIiwib3RoZXJEaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJvcHBvc2l0ZSIsIndpbGxBbGxvd0JvbmQiLCJib25kaW5nT3B0aW9uIiwiQm9uZGluZ09wdGlvbiIsImRpc3RhbmNlIiwiaWRlYWxQb3NpdGlvbiIsInBvc2l0aW9uQm91bmRzIiwiaXNCb25kaW5nSW52YWxpZCIsImJvbmREaXN0YW5jZVRocmVzaG9sZCIsImF0b21Jbk1vbGVjdWxlIiwic2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiIsInBsdXMiLCJpc0FsbG93ZWRTdHJ1Y3R1cmUiLCJjb250YWluc1BvaW50IiwibW9sZWN1bGVTdHJ1Y3R1cmUiLCJnZXRNYXN0ZXJJbnN0YW5jZSIsInZlY3RvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiS2l0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRhaW5zIG11bHRpcGxlIGJ1Y2tldHMgb2YgZGlmZmVyZW50IHR5cGVzIG9mIGF0b21zIGFuZCBhIGtpdCBwbGF5IGFyZWEgZm9yIGRyb3BwaW5nIHRoZSBhdG9tcy4gVGhlcmUgaXMgb25seSBvbmVcclxuICogXCJhY3RpdmVcIiBraXQgYXQgYSB0aW1lLCB3aGljaCBpcyByZWd1bGF0ZWQgYnkgdG9nZ2xpbmcgdGhlIGNhcm91c2VsIHBhZ2VzLiBBY3RpdmUga2l0cyBoYXZlIHRoZWlyIGJ1Y2tldHMgYW5kIGtpdFxyXG4gKiBwbGF5IGFyZWEncyB2aXNpYmxlIGZvciBpbnRlcmFjdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IGJ1aWxkQU1vbGVjdWxlIGZyb20gJy4uLy4uL2J1aWxkQU1vbGVjdWxlLmpzJztcclxuaW1wb3J0IEJBTVF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9CQU1RdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgTGV3aXNEb3RNb2RlbCBmcm9tICcuL0xld2lzRG90TW9kZWwuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGUgZnJvbSAnLi9Nb2xlY3VsZS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZUxpc3QgZnJvbSAnLi9Nb2xlY3VsZUxpc3QuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTdHJ1Y3R1cmUgZnJvbSAnLi9Nb2xlY3VsZVN0cnVjdHVyZS5qcyc7XHJcblxyXG5sZXQga2l0SWRDb3VudGVyID0gMDtcclxuXHJcbmNsYXNzIEtpdCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uTGF5b3V0fSBjb2xsZWN0aW9uTGF5b3V0XHJcbiAgICogQHBhcmFtIHtBcnJheS48QnVja2V0Pn0gYnVja2V0c1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb2xsZWN0aW9uTGF5b3V0LCBidWNrZXRzICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuaWQgPSBraXRJZENvdW50ZXIrKztcclxuXHJcbiAgICAvLyBAcHVibGljIHtPYnNlcnZhYmxlQXJyYXlEZWYuPEF0b20yPn1cclxuICAgIHRoaXMuYXRvbXNJblBsYXlBcmVhID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPEF0b218bnVsbD59IEF0b20gdGhhdCBoYXMgYmVlbiBjbGlja2VkIGJ5IHVzZXIuIFVzZWQgZm9yIHRyaWdnZXJpbmcgY3V0IHRhcmdldHMgZm9yIGJyZWFraW5nIGJvbmRzXHJcbiAgICB0aGlzLnNlbGVjdGVkQXRvbVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Qm9vbGVhblByb3BlcnR5fSBXaGV0aGVyIHRoaXMga2l0IGlzIHRoZSBwcmVzZW50IGtpdCBiZWluZyBkaXNwbGF5ZWQgYW5kIGludGVyYWN0ZWQgd2l0aFxyXG4gICAgdGhpcy5hY3RpdmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Qm9vbGVhblByb3BlcnR5fSBXaGV0aGVyIHRoaXMga2l0IGlzIHZpc2libGVcclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfSAtIENhbGxlZCB3aXRoIGEgc2luZ2xlIHBhcmFtZXRlciBtb2xlY3VsZVxyXG4gICAgdGhpcy5hZGRlZE1vbGVjdWxlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IE1vbGVjdWxlIH0gXSB9ICk7XHJcbiAgICB0aGlzLnJlbW92ZWRNb2xlY3VsZUVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBNb2xlY3VsZSB9IF0gfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxBdG9tMj59IE1hc3RlciBsaXN0IG9mIGF0b21zIChpbiBhbmQgb3V0IG9mIGJ1Y2tldHMpLCBidXQgbm90IG9uZXMgaW4gY29sbGVjdGlvbiBib3hlc1xyXG4gICAgdGhpcy5hdG9tcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxBdG9tMj59IGF0b21zIGluIHRoZSBjb2xsZWN0aW9uIGJveFxyXG4gICAgdGhpcy5hdG9tc0luQ29sbGVjdGlvbkJveCA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxNb2xlY3VsZT59IG1vbGVjdWxlcyBpbiB0aGUgcGxheSBhcmVhXHJcbiAgICB0aGlzLm1vbGVjdWxlcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0xld2lzRG90TW9kZWx8bnVsbH0gQ3JlYXRlZCBsYXRlciwgbGV3aXMtZG90IGNvbm5lY3Rpb25zIGJldHdlZW4gYXRvbXMgb24gdGhlIHBsYXkgYXJlYVxyXG4gICAgdGhpcy5sZXdpc0RvdE1vZGVsID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48QnVja2V0Pn1cclxuICAgIHRoaXMuYnVja2V0cyA9IGJ1Y2tldHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Q29sbGVjdGlvbkxheW91dH1cclxuICAgIHRoaXMuY29sbGVjdGlvbkxheW91dCA9IGNvbGxlY3Rpb25MYXlvdXQ7XHJcblxyXG4gICAgLy8gUmVzdCB0aGUga2l0IGFuZCBhZGp1c3QgdGhlIGJ1Y2tldCBsYXlvdXRcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICAgIHRoaXMubGF5b3V0QnVja2V0cyggYnVja2V0cyApO1xyXG5cclxuICAgIC8vIEFkZCBhIG1vbGVjdWxlIHRvIHRoZSBraXQgd2hlbmV2ZXIgd2UgYWRkIGFuIGF0b20gdG8gdGhlIHBsYXkgYXJlYS5cclxuICAgIHRoaXMuYXRvbXNJblBsYXlBcmVhLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhdG9tID0+IHtcclxuXHJcbiAgICAgIC8vIEFkZCBhIG1vbGVjdWxlIHRvIHRoZSBraXQgd2l0aCBvdXIgbmV3bHkgYWRkZWQgYXRvbVxyXG4gICAgICBjb25zdCBtb2xlY3VsZSA9IG5ldyBNb2xlY3VsZSgpO1xyXG4gICAgICBtb2xlY3VsZS5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICAgIHRoaXMuYWRkTW9sZWN1bGUoIG1vbGVjdWxlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICAvLyBub3QgcmVzZXR0aW5nIHZpc2libGUsIHNpbmNlIHRoYXQgaXMgbm90IGhhbmRsZWQgYnkgdXNcclxuICAgIHRoaXMuc2VsZWN0ZWRBdG9tUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBzZW5kIG91dCBub3RpZmljYXRpb25zIGZvciBhbGwgcmVtb3ZlZCBtb2xlY3VsZXNcclxuICAgIHRoaXMubW9sZWN1bGVzLnNsaWNlKCkuZm9yRWFjaCggdGhpcy5yZW1vdmVNb2xlY3VsZS5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICAvLyBwdXQgZXZlcnl0aGluZyBiYWNrIGluIGJ1Y2tldHNcclxuICAgIHRoaXMuYXRvbXMuY29uY2F0KCB0aGlzLmF0b21zSW5Db2xsZWN0aW9uQm94ICkuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIC8vIHJlc2V0IHRoZSBhY3R1YWwgYXRvbVxyXG4gICAgICBhdG9tLnJlc2V0KCk7XHJcblxyXG4gICAgICAvLyBUSEVOIHBsYWNlIGl0IHNvIHdlIG92ZXJ3cml0ZSBpdHMgXCJiYWRcIiBwb3NpdGlvbiBhbmQgZGVzdGluYXRpb24gaW5mb1xyXG4gICAgICB0aGlzLmdldEJ1Y2tldEZvckVsZW1lbnQoIGF0b20uZWxlbWVudCApLnBsYWNlQXRvbSggYXRvbSwgdHJ1ZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGlmIHJlc2V0IGtpdCBpZ25vcmVzIGNvbGxlY3Rpb24gYm94ZXMsIGFkZCBpbiBvdGhlciBhdG9tcyB0aGF0IGFyZSBlcXVpdmFsZW50IHRvIGhvdyB0aGUgYnVja2V0IHN0YXJ0ZWRcclxuICAgIC8vIE5PVEU6IHJpZ2h0IG5vdywgdGhlIGFjdHVhbCBhdG9tIG1vZGVscyBtb3ZlIGJhY2sgdG8gdGhlIGJ1Y2tldHMgZXZlbiB0aG91Z2ggdGhlIHZpcnR1YWwgXCJtb2xlY3VsZVwiIHNheXMgaW4gdGhlIGJveC4gY29uc2lkZXIgbW92aW5nIGl0IVxyXG5cclxuICAgIC8vIHdpcGUgb3VyIGludGVybmFsIHN0YXRlXHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLmF0b21zICk7XHJcbiAgICBjbGVhbkFycmF5KCB0aGlzLmF0b21zSW5Db2xsZWN0aW9uQm94ICk7XHJcbiAgICB0aGlzLmF0b21zSW5QbGF5QXJlYS5yZXNldCgpO1xyXG4gICAgdGhpcy5sZXdpc0RvdE1vZGVsID0gbmV3IExld2lzRG90TW9kZWwoKTtcclxuICAgIGNsZWFuQXJyYXkoIHRoaXMubW9sZWN1bGVzICk7XHJcblxyXG4gICAgLy8ga2VlcCB0cmFjayBvZiBhbGwgYXRvbXMgaW4gb3VyIGtpdFxyXG4gICAgdGhpcy5idWNrZXRzLmZvckVhY2goIGJ1Y2tldCA9PiB7XHJcbiAgICAgIHRoaXMuYXRvbXMgPSB0aGlzLmF0b21zLmNvbmNhdCggYnVja2V0LmdldFBhcnRpY2xlTGlzdCgpICk7XHJcblxyXG4gICAgICBidWNrZXQuZ2V0UGFydGljbGVMaXN0KCkuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgICAgdGhpcy5sZXdpc0RvdE1vZGVsLmFkZEF0b20oIGF0b20gKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSBidWNrZXQgdG8gaXRzIGZpbGxlZCBzdGF0ZS5cclxuICAgICAgYnVja2V0LnNldFRvRnVsbFN0YXRlKCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGp1c3QgdGhlIGxheW91dCBvZiB0aGUgYnVja2V0cyBhbG9uZyB3aXRoIG1vdmluZyB0aGVpciBhdG9tcyB0byB0aGUgY29ycmVjdCBwb3NpdGlvbnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEJ1Y2tldD59IGJ1Y2tldHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbGF5b3V0QnVja2V0cyggYnVja2V0cyApIHtcclxuICAgIGxldCB1c2VkV2lkdGggPSAwO1xyXG4gICAgY29uc3QgYnVja2V0Qm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTsgLy8gY29uc2lkZXJlZCBtdXRhYmxlLCB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgY2VudGVyIGJvdW5kcyBvZiBhIGJ1Y2tldCBBTkQgaXRzIGF0b21zXHJcblxyXG4gICAgLy8gbGF5cyBvdXQgYWxsIG9mIHRoZSBidWNrZXRzIGZyb20gdGhlIGxlZnQgdG8gcmlnaHRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJ1Y2tldHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJ1Y2tldCA9IGJ1Y2tldHNbIGkgXTtcclxuICAgICAgaWYgKCBpICE9PSAwICkge1xyXG4gICAgICAgIHVzZWRXaWR0aCArPSBLaXQuYnVja2V0UGFkZGluZztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaW5jbHVkZSBib3RoIHRoZSBidWNrZXQncyBzaGFwZSBhbmQgaXRzIGF0b21zIGluIG91ciBib3VuZHMsIHNvIHdlIGNhbiBwcm9wZXJseSBjZW50ZXIgdGhlIGdyb3VwXHJcbiAgICAgIGJ1Y2tldEJvdW5kcy5pbmNsdWRlQm91bmRzKCBidWNrZXQuY29udGFpbmVyU2hhcGUuYm91bmRzICk7XHJcbiAgICAgIGJ1Y2tldC5nZXRQYXJ0aWNsZUxpc3QoKS5mb3JFYWNoKCBhdG9tID0+IHtcclxuICAgICAgICBjb25zdCBhdG9tUG9zaXRpb24gPSBhdG9tLnBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgYnVja2V0Qm91bmRzLmluY2x1ZGVCb3VuZHMoIG5ldyBCb3VuZHMyKCBhdG9tUG9zaXRpb24ueCAtIGF0b20uY292YWxlbnRSYWRpdXMsIGF0b21Qb3NpdGlvbi55IC0gYXRvbS5jb3ZhbGVudFJhZGl1cyxcclxuICAgICAgICAgIGF0b21Qb3NpdGlvbi54ICsgYXRvbS5jb3ZhbGVudFJhZGl1cywgYXRvbVBvc2l0aW9uLnkgKyBhdG9tLmNvdmFsZW50UmFkaXVzICkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBidWNrZXQucG9zaXRpb24gPSBuZXcgVmVjdG9yMiggdXNlZFdpZHRoLCAwICk7XHJcbiAgICAgIHVzZWRXaWR0aCArPSBidWNrZXQud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2VudGVycyB0aGUgYnVja2V0cyBob3Jpem9udGFsbHkgd2l0aGluIHRoZSBraXRcclxuICAgIGJ1Y2tldHMuZm9yRWFjaCggYnVja2V0ID0+IHtcclxuXHJcbiAgICAgIC8vIGFsc28gbm90ZTogdGhpcyBtb3ZlcyB0aGUgYXRvbXMgYWxzbyFcclxuICAgICAgYnVja2V0LnBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIGJ1Y2tldC5wb3NpdGlvbi54IC0gdXNlZFdpZHRoIC8gMiArIGJ1Y2tldC53aWR0aCAvIDIsIGJ1Y2tldEJvdW5kcy5jZW50ZXJZICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBidWNrZXQgZm9yIGEgZ2l2ZW4gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7QnVja2V0fVxyXG4gICAqL1xyXG4gIGdldEJ1Y2tldEZvckVsZW1lbnQoIGVsZW1lbnQgKSB7XHJcbiAgICBjb25zdCBlbGVtZW50QnVja2V0ID0gXy5maW5kKCB0aGlzLmJ1Y2tldHMsIGJ1Y2tldCA9PiB7XHJcbiAgICAgIHJldHVybiBidWNrZXQuZWxlbWVudC5pc1NhbWVFbGVtZW50KCBlbGVtZW50ICk7XHJcbiAgICB9ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbGVtZW50QnVja2V0LCAnRWxlbWVudCBkb2VzIG5vdCBoYXZlIGFuIGFzc29jaWF0ZWQgYnVja2V0LicgKTtcclxuICAgIHJldHVybiBlbGVtZW50QnVja2V0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBraXQgYm91bmRzIHdpdGhpbiB0aGUgY29sbGVjdGlvbiBsYXlvdXRcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBnZXQgYXZhaWxhYmxlS2l0Qm91bmRzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbkxheW91dC5hdmFpbGFibGVLaXRCb3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHBsYXkgYXJlYSBib3VuZHMgd2l0aGluIHRoZSBjb2xsZWN0aW9uIGxheW91dFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIGdldCBhdmFpbGFibGVQbGF5QXJlYUJvdW5kcygpIHtcclxuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25MYXlvdXQuYXZhaWxhYmxlUGxheUFyZWFCb3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhbiBhdG9tIGlzIGRyb3BwZWQgd2l0aGluIGVpdGhlciB0aGUgcGxheSBhcmVhIE9SIHRoZSBraXQgYXJlYS4gVGhpcyB3aWxsIE5PVCBiZSBjYWxsZWQgZm9yIG1vbGVjdWxlc1xyXG4gICAqIGRyb3BwZWQgaW50byB0aGUgY29sbGVjdGlvbiBhcmVhIHN1Y2Nlc3NmdWxseVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYXRvbSAtIFRoZSBkcm9wcGVkIGF0b20uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBkcm9wcGVkSW5LaXRBcmVhIC0gVGhlIGRyb3BwZWQgYXRvbS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYXRvbURyb3BwZWQoIGF0b20sIGRyb3BwZWRJbktpdEFyZWEgKSB7XHJcbiAgICBjb25zdCBtb2xlY3VsZSA9IHRoaXMuZ2V0TW9sZWN1bGUoIGF0b20gKTtcclxuXHJcbiAgICAvLyBkcm9wcGVkIG9uIGtpdCwgcHV0IGl0IGluIGEgYnVja2V0XHJcbiAgICBpZiAoIGRyb3BwZWRJbktpdEFyZWEgKSB7XHJcbiAgICAgIHRoaXMucmVjeWNsZU1vbGVjdWxlSW50b0J1Y2tldHMoIG1vbGVjdWxlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIGRyb3BwZWQgaW4gcGxheSBhcmVhXHJcbiAgICAgIGlmICggbW9sZWN1bGUgKSB7XHJcbiAgICAgICAgdGhpcy5hdHRlbXB0VG9Cb25kTW9sZWN1bGUoIG1vbGVjdWxlICk7XHJcbiAgICAgICAgdGhpcy5zZXBhcmF0ZU1vbGVjdWxlRGVzdGluYXRpb25zKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgbW9sZWN1bGUgaXMgZHJhZ2dlZCAoc3VjY2Vzc2Z1bGx5KSBpbnRvIGEgY29sbGVjdGlvbiBib3hcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uQm94fSBib3hcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbW9sZWN1bGVQdXRJbkNvbGxlY3Rpb25Cb3goIG1vbGVjdWxlLCBib3ggKSB7XHJcbiAgICBpZiAoIEJBTVF1ZXJ5UGFyYW1ldGVycy5sb2dEYXRhICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggYFlvdSBoYXZlIGNvbGxlY3RlZDogJHtib3gubW9sZWN1bGVUeXBlLmNvbW1vbk5hbWV9YCApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yZW1vdmVNb2xlY3VsZSggbW9sZWN1bGUgKTtcclxuICAgIG1vbGVjdWxlLmF0b21zLmZvckVhY2goIGF0b20gPT4ge1xyXG4gICAgICB0aGlzLmF0b21zLnNwbGljZSggdGhpcy5hdG9tcy5pbmRleE9mKCBhdG9tICksIDEgKTtcclxuICAgICAgdGhpcy5hdG9tc0luQ29sbGVjdGlvbkJveC5wdXNoKCBhdG9tICk7XHJcbiAgICAgIGF0b20udmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBBdG9tcyBpbiB0aGUgQ29sbGVjdGlvbkJveCBzaG91bGRuJ3QgYmUgaW4gdGhlIHBsYXkgYXJlYS5cclxuICAgICAgdGhpcy5hdG9tc0luUGxheUFyZWEucmVtb3ZlKCBhdG9tICk7XHJcbiAgICB9ICk7XHJcbiAgICBib3guYWRkTW9sZWN1bGUoIG1vbGVjdWxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoaXMgYXRvbSByZWdpc3RlcmVkIGluIGFueSBvZiB0aGUgbW9sZWN1bGUgc3RydWN0dXJlc1xyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGF0b21cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0F0b21JblBsYXkoIGF0b20gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRNb2xlY3VsZSggYXRvbSApICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRoZSBtb2xlY3VsZSBvZiBhIGdpdmVuIGF0b20uIFRoaXMgY2FuIHJldHVybiBhIG1vbGVjdWxlIHdpdGggb25seSBvbmUgYXRvbSBhbmQgemVybyBib25kcyAoc2luZ2xlIGF0b20pLlxyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGF0b21cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TW9sZWN1bGV8bnVsbH1cclxuICAgKi9cclxuICBnZXRNb2xlY3VsZSggYXRvbSApIHtcclxuICAgIC8vIE5vdGU6IChwZXJmb3JtYW5jZSkgc2VlbXMgbGlrZSB0aGlzIGNvdWxkIGJlIGEgYm90dGxlbmVjaz8gZmFzdGVyIHdheXM/XHJcbiAgICBjb25zdCBudW1Nb2xlY3VsZXMgPSB0aGlzLm1vbGVjdWxlcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1Nb2xlY3VsZXM7IGkrKyApIHtcclxuICAgICAgY29uc3QgbW9sZWN1bGUgPSB0aGlzLm1vbGVjdWxlc1sgaSBdO1xyXG5cclxuICAgICAgY29uc3QgbnVtQXRvbXMgPSBtb2xlY3VsZS5hdG9tcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IG51bUF0b21zOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3Qgb3RoZXJBdG9tID0gbW9sZWN1bGUuYXRvbXNbIGogXTtcclxuICAgICAgICBpZiAoIG90aGVyQXRvbSA9PT0gYXRvbSApIHtcclxuICAgICAgICAgIHJldHVybiBtb2xlY3VsZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnJlYWtzIGFwYXJ0IGEgbW9sZWN1bGUgaW50byBzZXBhcmF0ZSBhdG9tcyB0aGF0IHJlbWFpbiBpbiB0aGUgcGxheSBhcmVhXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZSAtIHRoZSBtb2xlY3VsZSB0byBicmVha1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBicmVha01vbGVjdWxlKCBtb2xlY3VsZSApIHtcclxuICAgIGNvbnN0IGNyZWF0ZWRNb2xlY3VsZXMgPSBbXTtcclxuICAgIHRoaXMucmVtb3ZlTW9sZWN1bGUoIG1vbGVjdWxlICk7XHJcbiAgICBtb2xlY3VsZS5hdG9tcy5mb3JFYWNoKCBhdG9tID0+IHtcclxuXHJcbiAgICAgIC8vIEJyZWFrIHRoZSBjdXJyZW50IG1vbGVjdWxlIGFuZCBjcmVhdGUgYSBuZXcgbW9sZWN1bGUgZm9yIGVhY2ggYXRvbVxyXG4gICAgICB0aGlzLmxld2lzRG90TW9kZWwuYnJlYWtCb25kc09mQXRvbSggYXRvbSApO1xyXG4gICAgICBjb25zdCBuZXdNb2xlY3VsZSA9IG5ldyBNb2xlY3VsZSgpO1xyXG4gICAgICBuZXdNb2xlY3VsZS5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICAgIHRoaXMuYWRkTW9sZWN1bGUoIG5ld01vbGVjdWxlICk7XHJcbiAgICAgIGNyZWF0ZWRNb2xlY3VsZXMucHVzaCggbW9sZWN1bGUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXBhcmF0ZSBhbGwgdGhlIG1vbGVjdWxlcywgaW5jbHVkaW5nIHRoZSBuZXdseSBjcmVhdGVkIG1vbGVjdWxlcy5cclxuICAgIHRoaXMuc2VwYXJhdGVNb2xlY3VsZURlc3RpbmF0aW9ucygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnJlYWtzIGEgYm9uZCBiZXR3ZWVuIHR3byBhdG9tcyBpbiBhIG1vbGVjdWxlLlxyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGEgLSBBdG9tIEFcclxuICAgKiBAcGFyYW0ge0F0b20yfSBiIC0gQXRvbSBCXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYnJlYWtCb25kKCBhLCBiICkge1xyXG5cclxuICAgIC8vIGdldCBvdXIgb2xkIGFuZCBuZXcgbW9sZWN1bGUgc3RydWN0dXJlc1xyXG4gICAgY29uc3Qgb2xkTW9sZWN1bGUgPSB0aGlzLmdldE1vbGVjdWxlKCBhICk7XHJcbiAgICBjb25zdCBuZXdNb2xlY3VsZXMgPSBNb2xlY3VsZVN0cnVjdHVyZS5nZXRNb2xlY3VsZXNGcm9tQnJva2VuQm9uZCggb2xkTW9sZWN1bGUsIG9sZE1vbGVjdWxlLmdldEJvbmQoIGEsIGIgKSwgbmV3IE1vbGVjdWxlKCksIG5ldyBNb2xlY3VsZSgpICk7XHJcblxyXG4gICAgLy8gYnJlYWsgdGhlIGJvbmQgaW4gb3VyIGxld2lzIGRvdCBtb2RlbFxyXG4gICAgdGhpcy5sZXdpc0RvdE1vZGVsLmJyZWFrQm9uZCggYSwgYiApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgb2xkIG9uZSwgYWRkIHRoZSBuZXcgb25lcyAoZmlyaW5nIGxpc3RlbmVycylcclxuICAgIHRoaXMucmVtb3ZlTW9sZWN1bGUoIG9sZE1vbGVjdWxlICk7XHJcbiAgICBuZXdNb2xlY3VsZXMuZm9yRWFjaCggdGhpcy5hZGRNb2xlY3VsZS5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICAvLyBwdXNoIHRoZSBuZXcgc2VwYXJhdGUgbW9sZWN1bGVzIGF3YXlcclxuICAgIHRoaXMuc2VwYXJhdGVNb2xlY3VsZURlc3RpbmF0aW9ucygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIHRoZSBkaXJlY3Rpb24gb2YgdGhlIGJvbmQgYmV0d2VlbiB0d28gYXRvbXNcclxuICAgKiBAcGFyYW0ge0F0b20yfSBhIC0gQW4gYXRvbSBBXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYiAtIEFuIGF0b20gQlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtEaXJlY3Rpb259XHJcbiAgICovXHJcbiAgZ2V0Qm9uZERpcmVjdGlvbiggYSwgYiApIHtcclxuICAgIHJldHVybiB0aGlzLmxld2lzRG90TW9kZWwuZ2V0Qm9uZERpcmVjdGlvbiggYSwgYiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIGFsbCBvZiB0aGUgYnVja2V0cyBpbiB0aGUga2l0IGFyZSBmaWxsZWQuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgYWxsQnVja2V0c0ZpbGxlZCgpIHtcclxuICAgIGxldCBhbGxCdWNrZXRzRmlsbGVkID0gdHJ1ZTtcclxuICAgIHRoaXMuYnVja2V0cy5mb3JFYWNoKCBidWNrZXQgPT4ge1xyXG4gICAgICBpZiAoICFidWNrZXQuaXNGdWxsKCkgKSB7XHJcbiAgICAgICAgYWxsQnVja2V0c0ZpbGxlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gYWxsQnVja2V0c0ZpbGxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIG1vbGVjdWxlIHRvIHRoaXMga2l0XHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRNb2xlY3VsZSggbW9sZWN1bGUgKSB7XHJcbiAgICB0aGlzLm1vbGVjdWxlcy5wdXNoKCBtb2xlY3VsZSApO1xyXG4gICAgdGhpcy5hZGRlZE1vbGVjdWxlRW1pdHRlci5lbWl0KCBtb2xlY3VsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGEgbW9sZWN1bGUgZnJvbSB0aGlzIGtpdFxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlTW9sZWN1bGUoIG1vbGVjdWxlICkge1xyXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMubW9sZWN1bGVzLCBtb2xlY3VsZSApO1xyXG4gICAgdGhpcy5yZW1vdmVkTW9sZWN1bGVFbWl0dGVyLmVtaXQoIG1vbGVjdWxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlcyBhbiBhdG9tIHRoYXQgd2FzIGluIGEgYnVja2V0IGFuZCBob29rcyBpdCB1cCB3aXRoaW4gb3VyIHN0cnVjdHVyYWwgbW9kZWwuIEl0IGFsbG9jYXRlcyBhIG1vbGVjdWxlIGZvciB0aGVcclxuICAgKiBhdG9tLCBhbmQgdGhlbiBhdHRlbXB0cyB0byBib25kIHdpdGggaXQuXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYXRvbVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZEF0b21Ub1BsYXkoIGF0b20gKSB7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBhdG9tcyB0byBvdXIgbW9kZWxzXHJcbiAgICBjb25zdCBtb2xlY3VsZSA9IG5ldyBNb2xlY3VsZSgpO1xyXG4gICAgbW9sZWN1bGUuYWRkQXRvbSggYXRvbSApO1xyXG5cclxuICAgIHRoaXMuYWRkTW9sZWN1bGUoIG1vbGVjdWxlICk7XHJcblxyXG4gICAgLy8gYXR0ZW1wdCB0byBib25kXHJcbiAgICB0aGlzLmF0dGVtcHRUb0JvbmRNb2xlY3VsZSggbW9sZWN1bGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGF0b20gaXMgY29udGFpbmVkIGluIGFueSBvZiB0aGlzIGtpdCdzIGJ1Y2tldHNcclxuICAgKiBAcGFyYW0ge0F0b20yfSBhdG9tXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzQ29udGFpbmVkSW5CdWNrZXQoIGF0b20gKSB7XHJcbiAgICByZXR1cm4gXy5zb21lKCB0aGlzLmJ1Y2tldHMsIGJ1Y2tldCA9PiB7XHJcbiAgICAgIHJldHVybiBidWNrZXQuY29udGFpbnNQYXJ0aWNsZSggYXRvbSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZXMgYW4gYXRvbSwgaW52YWxpZGF0ZXMgdGhlIHN0cnVjdHVyYWwgYm9uZHMgaXQgbWF5IGhhdmUsIGFuZCBwdXRzIGl0IGluIHRoZSBjb3JyZWN0IGJ1Y2tldFxyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGF0b20gLSB0aGUgYXRvbSB0byByZWN5Y2xlXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbmltYXRlIFdoZXRoZXIgd2Ugc2hvdWxkIGRpc3BsYXkgYW5pbWF0aW9uXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlY3ljbGVBdG9tSW50b0J1Y2tldHMoIGF0b20sIGFuaW1hdGUgKSB7XHJcbiAgICB0aGlzLmxld2lzRG90TW9kZWwuYnJlYWtCb25kc09mQXRvbSggYXRvbSApO1xyXG4gICAgdGhpcy5hdG9tc0luUGxheUFyZWEucmVtb3ZlKCBhdG9tICk7XHJcbiAgICBjb25zdCBidWNrZXQgPSB0aGlzLmdldEJ1Y2tldEZvckVsZW1lbnQoIGF0b20uZWxlbWVudCApO1xyXG4gICAgYnVja2V0LmFkZFBhcnRpY2xlTmVhcmVzdE9wZW4oIGF0b20sIGFuaW1hdGUgKTtcclxuICAgIGlmICggIWJ1Y2tldC5wYXJ0aWNsZUxpc3QuaW5jbHVkZXMoIGF0b20gKSApIHtcclxuICAgICAgYnVja2V0LnBhcnRpY2xlTGlzdC5wdXNoKCBhdG9tICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWN5Y2xlcyBhbiBlbnRpcmUgbW9sZWN1bGUgYnkgaW52YWxpZGF0aW5nIGl0cyBib25kcyBhbmQgcHV0dGluZyBpdHMgYXRvbXMgaW50byB0aGVpciByZXNwZWN0aXZlIGJ1Y2tldHNcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZVxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZWN5Y2xlTW9sZWN1bGVJbnRvQnVja2V0cyggbW9sZWN1bGUgKSB7XHJcbiAgICBtb2xlY3VsZS5hdG9tcy5mb3JFYWNoKCBhdG9tID0+IHtcclxuICAgICAgdGhpcy5yZWN5Y2xlQXRvbUludG9CdWNrZXRzKCBhdG9tLCB0cnVlICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnJlbW92ZU1vbGVjdWxlKCBtb2xlY3VsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHBhZGRpbmcgdG8gdGhlIG1vbGVjdWxlIGJvdW5kcy5cclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBwYWRNb2xlY3VsZUJvdW5kcyggYm91bmRzICkge1xyXG4gICAgY29uc3QgaGFsZlBhZGRpbmcgPSBLaXQuaW50ZXJNb2xlY3VsZVBhZGRpbmcgLyAyO1xyXG4gICAgcmV0dXJuIEJvdW5kczIucmVjdCggYm91bmRzLnggLSBoYWxmUGFkZGluZywgYm91bmRzLnkgLSBoYWxmUGFkZGluZywgYm91bmRzLndpZHRoICsgS2l0LmludGVyTW9sZWN1bGVQYWRkaW5nLCBib3VuZHMuaGVpZ2h0ICsgS2l0LmludGVyTW9sZWN1bGVQYWRkaW5nICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgYXRvbSBkZXN0aW5hdGlvbnMgc28gdGhhdCBzZXBhcmF0ZSBtb2xlY3VsZXMgd2lsbCBiZSBzZXBhcmF0ZWQgdmlzdWFsbHlcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2VwYXJhdGVNb2xlY3VsZURlc3RpbmF0aW9ucygpIHtcclxuICAgIGxldCBtYXhJdGVyYXRpb25zID0gMjAwO1xyXG4gICAgY29uc3QgcHVzaEFtb3VudCA9IDEwOyAvLyBob3cgbXVjaCB0byBwdXNoIHR3byBtb2xlY3VsZXMgYXdheVxyXG4gICAgY29uc3QgYXZhaWxhYmxlUGxheUFyZWFCb3VuZHMgPSB0aGlzLmNvbGxlY3Rpb25MYXlvdXQuYXZhaWxhYmxlUGxheUFyZWFCb3VuZHM7XHJcbiAgICBjb25zdCBudW1Nb2xlY3VsZXMgPSB0aGlzLm1vbGVjdWxlcy5sZW5ndGg7XHJcblxyXG4gICAgbGV0IGZvdW5kT3ZlcmxhcCA9IHRydWU7XHJcbiAgICB3aGlsZSAoIGZvdW5kT3ZlcmxhcCAmJiBtYXhJdGVyYXRpb25zLS0gPj0gMCApIHtcclxuICAgICAgZm91bmRPdmVybGFwID0gZmFsc2U7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bU1vbGVjdWxlczsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGEgPSB0aGlzLm1vbGVjdWxlc1sgaSBdO1xyXG5cclxuICAgICAgICBsZXQgYUJvdW5kcyA9IHRoaXMucGFkTW9sZWN1bGVCb3VuZHMoIGEuZGVzdGluYXRpb25Cb3VuZHMgKTtcclxuXHJcbiAgICAgICAgLy8gcHVzaCBpdCBhd2F5IGZyb20gdGhlIG91dHNpZGVzXHJcbiAgICAgICAgaWYgKCBhQm91bmRzLm1pblggPCBhdmFpbGFibGVQbGF5QXJlYUJvdW5kcy5taW5YICkge1xyXG4gICAgICAgICAgYS5zaGlmdERlc3RpbmF0aW9uKCBuZXcgVmVjdG9yMiggYXZhaWxhYmxlUGxheUFyZWFCb3VuZHMubWluWCAtIGFCb3VuZHMubWluWCwgMCApICk7XHJcbiAgICAgICAgICBhQm91bmRzID0gdGhpcy5wYWRNb2xlY3VsZUJvdW5kcyggYS5kZXN0aW5hdGlvbkJvdW5kcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGFCb3VuZHMubWF4WCA+IGF2YWlsYWJsZVBsYXlBcmVhQm91bmRzLm1heFggKSB7XHJcbiAgICAgICAgICBhLnNoaWZ0RGVzdGluYXRpb24oIG5ldyBWZWN0b3IyKCBhdmFpbGFibGVQbGF5QXJlYUJvdW5kcy5tYXhYIC0gYUJvdW5kcy5tYXhYLCAwICkgKTtcclxuICAgICAgICAgIGFCb3VuZHMgPSB0aGlzLnBhZE1vbGVjdWxlQm91bmRzKCBhLmRlc3RpbmF0aW9uQm91bmRzICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggYUJvdW5kcy5taW5ZIDwgYXZhaWxhYmxlUGxheUFyZWFCb3VuZHMubWluWSApIHtcclxuICAgICAgICAgIGEuc2hpZnREZXN0aW5hdGlvbiggbmV3IFZlY3RvcjIoIDAsIGF2YWlsYWJsZVBsYXlBcmVhQm91bmRzLm1pblkgLSBhQm91bmRzLm1pblkgKSApO1xyXG4gICAgICAgICAgYUJvdW5kcyA9IHRoaXMucGFkTW9sZWN1bGVCb3VuZHMoIGEuZGVzdGluYXRpb25Cb3VuZHMgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBhQm91bmRzLm1heFkgPiBhdmFpbGFibGVQbGF5QXJlYUJvdW5kcy5tYXhZICkge1xyXG4gICAgICAgICAgYS5zaGlmdERlc3RpbmF0aW9uKCBuZXcgVmVjdG9yMiggMCwgYXZhaWxhYmxlUGxheUFyZWFCb3VuZHMubWF4WSAtIGFCb3VuZHMubWF4WSApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB0aGVuIHNlcGFyYXRlIGl0IGZyb20gb3RoZXIgbW9sZWN1bGVzXHJcbiAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgbnVtTW9sZWN1bGVzOyBrKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBiID0gdGhpcy5tb2xlY3VsZXNbIGsgXTtcclxuXHJcbiAgICAgICAgICBpZiAoIGEubW9sZWN1bGVJZCA+PSBiLm1vbGVjdWxlSWQgKSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMgcmVtb3ZlcyB0aGUgY2FzZSB3aGVyZSBhID09IGIsIGFuZCB3aWxsIG1ha2Ugc3VyZSB3ZSBkb24ndCBydW4gdGhlIGZvbGxvd2luZyBjb2RlIHR3aWNlIGZvciAoYSxiKSBhbmQgKGIsYSlcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBiQm91bmRzID0gdGhpcy5wYWRNb2xlY3VsZUJvdW5kcyggYi5kZXN0aW5hdGlvbkJvdW5kcyApO1xyXG4gICAgICAgICAgaWYgKCBhQm91bmRzLmludGVyc2VjdHNCb3VuZHMoIGJCb3VuZHMgKSApIHtcclxuICAgICAgICAgICAgZm91bmRPdmVybGFwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdldCBwZXJ0dXJiZWQgY2VudGVycy4gdGhpcyBpcyBzbyB0aGF0IGlmIHR3byBtb2xlY3VsZXMgaGF2ZSB0aGUgZXhhY3Qgc2FtZSBjZW50ZXJzLCB3ZSB3aWxsIHB1c2ggdGhlbSBhd2F5XHJcbiAgICAgICAgICAgIGNvbnN0IGFDZW50ZXIgPSBhQm91bmRzLmNlbnRlci5hZGQoIG5ldyBWZWN0b3IyKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIC0gMC41LCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIC0gMC41ICkgKTtcclxuICAgICAgICAgICAgY29uc3QgYkNlbnRlciA9IGJCb3VuZHMuY2VudGVyLmFkZCggbmV3IFZlY3RvcjIoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUsIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgLSAwLjUgKSApO1xyXG5cclxuICAgICAgICAgICAgLy8gZGVsdGEgZnJvbSBjZW50ZXIgb2YgQSB0byBjZW50ZXIgb2YgQiwgc2NhbGVkIHRvIGhhbGYgb2Ygb3VyIHB1c2ggYW1vdW50LlxyXG4gICAgICAgICAgICBjb25zdCBkZWx0YSA9IGJDZW50ZXIubWludXMoIGFDZW50ZXIgKS5ub3JtYWxpemVkKCkudGltZXMoIHB1c2hBbW91bnQgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGhvdyBoYXJkIEIgc2hvdWxkIGJlIHB1c2hlZCAoQSB3aWxsIGJlIHB1c2hlZCAoMS1wdXNoUmF0aW8pKS4gSGV1cmlzdGljLCBwb3dlciBpcyB0byBtYWtlIHRoZSByYXRpbyBub3QgdG9vIHNrZXdlZFxyXG4gICAgICAgICAgICAvLyB0aGlzIGlzIGRvbmUgc28gdGhhdCBoZWF2aWVyIG1vbGVjdWxlcyB3aWxsIGJlIHB1c2hlZCBsZXNzLCB3aGlsZSBsaWdodGVyIG9uZXMgd2lsbCBiZSBwdXNoZWQgbW9yZVxyXG4gICAgICAgICAgICBjb25zdCBwdXNoUG93ZXIgPSAxO1xyXG4gICAgICAgICAgICBjb25zdCBwdXNoUmF0aW8gPSBNYXRoLnBvdyggYS5nZXRBcHByb3hpbWF0ZU1vbGVjdWxhcldlaWdodCgpLCBwdXNoUG93ZXIgKSAvICggTWF0aC5wb3coIGEuZ2V0QXBwcm94aW1hdGVNb2xlY3VsYXJXZWlnaHQoKSwgcHVzaFBvd2VyICkgKyBNYXRoLnBvdyggYi5nZXRBcHByb3hpbWF0ZU1vbGVjdWxhcldlaWdodCgpLCBwdXNoUG93ZXIgKSApO1xyXG5cclxuICAgICAgICAgICAgLy8gcHVzaCBCIGJ5IHRoZSBwdXNoUmF0aW9cclxuICAgICAgICAgICAgYi5zaGlmdERlc3RpbmF0aW9uKCBkZWx0YS50aW1lcyggcHVzaFJhdGlvICkgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHB1c2ggQSB0aGUgb3Bwb3NpdGUgd2F5LCBieSAoMSAtIHB1c2hSYXRpbylcclxuICAgICAgICAgICAgY29uc3QgZGVsdGExID0gZGVsdGEudGltZXMoIC0xICogKCAxIC0gcHVzaFJhdGlvICkgKTtcclxuICAgICAgICAgICAgYS5zaGlmdERlc3RpbmF0aW9uKCBkZWx0YTEgKTtcclxuXHJcbiAgICAgICAgICAgIGFCb3VuZHMgPSB0aGlzLnBhZE1vbGVjdWxlQm91bmRzKCBhLmRlc3RpbmF0aW9uQm91bmRzICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCb25kcyBvbmUgYXRvbSB0byBhbm90aGVyLCBhbmQgaGFuZGxlcyB0aGUgY29ycmVzcG9uZGluZyBzdHJ1Y3R1cmFsIGNoYW5nZXMgYmV0d2VlbiBtb2xlY3VsZXMuXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYSAtIEFuIGF0b20gQVxyXG4gICAqIEBwYXJhbSB7RGlyZWN0aW9ufSBkaXJBdG9CIC0gVGhlIGRpcmVjdGlvbiBmcm9tIEEgdGhhdCB0aGUgYm9uZCB3aWxsIGdvIGluIChmb3IgbGV3aXMtZG90IHN0cnVjdHVyZSlcclxuICAgKiBAcGFyYW0ge0F0b20yfSBiIC0gQW4gYXRvbSBCXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGJvbmQoIGEsIGRpckF0b0IsIGIgKSB7XHJcbiAgICB0aGlzLmxld2lzRG90TW9kZWwuYm9uZCggYSwgZGlyQXRvQiwgYiApO1xyXG4gICAgY29uc3QgbW9sQSA9IHRoaXMuZ2V0TW9sZWN1bGUoIGEgKTtcclxuICAgIGNvbnN0IG1vbEIgPSB0aGlzLmdldE1vbGVjdWxlKCBiICk7XHJcbiAgICBpZiAoIG1vbEEgPT09IG1vbEIgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ1dBUk5JTkc6IGxvb3Agb3Igb3RoZXIgaW52YWxpZCBzdHJ1Y3R1cmUgZGV0ZWN0ZWQgaW4gYSBtb2xlY3VsZScgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXdNb2xlY3VsZSA9IE1vbGVjdWxlU3RydWN0dXJlLmdldENvbWJpbmVkTW9sZWN1bGVGcm9tQm9uZCggbW9sQSwgbW9sQiwgYSwgYiwgbmV3IE1vbGVjdWxlKCkgKTtcclxuXHJcbiAgICB0aGlzLnJlbW92ZU1vbGVjdWxlKCBtb2xBICk7XHJcbiAgICB0aGlzLnJlbW92ZU1vbGVjdWxlKCBtb2xCICk7XHJcbiAgICB0aGlzLmFkZE1vbGVjdWxlKCBuZXdNb2xlY3VsZSApO1xyXG5cclxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAgICogYm9uZGluZyBkaWFnbm9zdGljcyBhbmQgc2FuaXR5IGNoZWNrc1xyXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgICBpZiAoIEJBTVF1ZXJ5UGFyYW1ldGVycy5sb2dEYXRhICkge1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVkRm9ybSA9IHRoaXMuZ2V0TW9sZWN1bGUoIGEgKS50b1NlcmlhbDIoKTtcclxuICAgICAgY29uc29sZS5sb2coIGBjcmVhdGVkIHN0cnVjdHVyZTogJHtzZXJpYWxpemVkRm9ybX1gICk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzdHJ1Y3R1cmUgPSB0aGlzLmdldE1vbGVjdWxlKCBhICk7XHJcbiAgICBpZiAoIHN0cnVjdHVyZS5hdG9tcy5sZW5ndGggPiAyICkge1xyXG4gICAgICBzdHJ1Y3R1cmUuYm9uZHMuZm9yRWFjaCggYm9uZCA9PiB7XHJcbiAgICAgICAgaWYgKCBib25kLmEuaGFzU2FtZUVsZW1lbnQoIGJvbmQuYiApICYmIGJvbmQuYS5zeW1ib2wgPT09ICdIJyApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCAnV0FSTklORzogSHlkcm9nZW4gYm9uZGVkIHRvIGFub3RoZXIgaHlkcm9nZW4gaW4gYSBtb2xlY3VsZSB3aGljaCBpcyBub3QgZGlhdG9taWMgaHlkcm9nZW4nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0F0b20yfSBhIC0gQW4gYXRvbSBBXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYiAtIEFuIGF0b20gQlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TW9sZWN1bGVTdHJ1Y3R1cmV9XHJcbiAgICovXHJcbiAgZ2V0UG9zc2libGVNb2xlY3VsZVN0cnVjdHVyZUZyb21Cb25kKCBhLCBiICkge1xyXG4gICAgY29uc3QgbW9sQSA9IHRoaXMuZ2V0TW9sZWN1bGUoIGEgKTtcclxuICAgIGNvbnN0IG1vbEIgPSB0aGlzLmdldE1vbGVjdWxlKCBiICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2xBICE9PSBtb2xCICk7XHJcblxyXG4gICAgcmV0dXJuIE1vbGVjdWxlU3RydWN0dXJlLmdldENvbWJpbmVkTW9sZWN1bGVGcm9tQm9uZCggbW9sQSwgbW9sQiwgYSwgYiwgbmV3IE1vbGVjdWxlKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHQgdG8gYm9uZCBhIG1vbGVjdWxlIHRvIGFub3RoZXIgbW9sZWN1bGUgYmFzZWQgb24gdGhlIG9wZW4gYm9uZGluZyBvcHRpb25zXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGUgLSBBIG1vbGVjdWxlIHRoYXQgc2hvdWxkIGF0dGVtcHQgdG8gYmluZCB0byBvdGhlciBtb2xlY3VsZXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgYXR0ZW1wdFRvQm9uZE1vbGVjdWxlKCBtb2xlY3VsZSApIHtcclxuICAgIGxldCBiZXN0Qm9uZGluZ09wdGlvbiA9IG51bGw7IC8vIHtCb25kaW5nT3B0aW9ufG51bGx9XHJcbiAgICBsZXQgYmVzdERpc3RhbmNlRnJvbUlkZWFsUG9zaXRpb24gPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgYXRvbXNPdmVybGFwID0gZmFsc2U7XHJcblxyXG4gICAgLy8gZm9yIGVhY2ggYXRvbSBpbiBvdXIgbW9sZWN1bGUsIHdlIHRyeSB0byBzZWUgaWYgaXQgY2FuIGJvbmQgdG8gb3RoZXIgYXRvbXNcclxuICAgIG1vbGVjdWxlLmF0b21zLmZvckVhY2goIG91ckF0b20gPT4ge1xyXG5cclxuICAgICAgLy8gYWxsIG90aGVyIGF0b21zXHJcbiAgICAgIHRoaXMuYXRvbXMuZm9yRWFjaCggb3RoZXJBdG9tID0+IHtcclxuXHJcbiAgICAgICAgLy8gZGlzYWxsb3cgbG9vcHMgaW4gYW4gYWxyZWFkeS1jb25uZWN0ZWQgbW9sZWN1bGVcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0TW9sZWN1bGUoIG90aGVyQXRvbSApID09PSBtb2xlY3VsZSApIHtcclxuICAgICAgICAgIHJldHVybjsgLy8gY29udGludWUsIGluIHRoZSBpbm5lciBsb29wXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkb24ndCBib25kIHRvIHNvbWV0aGluZyBpbiBhIGJ1Y2tldCFcclxuICAgICAgICBpZiAoICF0aGlzLmlzQ29udGFpbmVkSW5CdWNrZXQoIG90aGVyQXRvbSApICkge1xyXG5cclxuICAgICAgICAgIC8vIHNhbml0eSBjaGVjaywgYW5kIHJ1biBpdCB0aHJvdWdoIG91ciBtb2xlY3VsZSBzdHJ1Y3R1cmUgbW9kZWwgdG8gc2VlIGlmIGl0IHdvdWxkIGJlIGFsbG93YWJsZVxyXG4gICAgICAgICAgaWYgKCBvdGhlckF0b20gPT09IG91ckF0b20gfHwgIXRoaXMuY2FuQm9uZCggb3VyQXRvbSwgb3RoZXJBdG9tICkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gY29udGludWUsIGluIHRoZSBpbm5lciBsb29wXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5sZXdpc0RvdE1vZGVsLmdldE9wZW5EaXJlY3Rpb25zKCBvdGhlckF0b20gKS5mb3JFYWNoKCBvdGhlckRpcmVjdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IG90aGVyRGlyZWN0aW9uLm9wcG9zaXRlO1xyXG4gICAgICAgICAgICBpZiAoICFfLmluY2x1ZGVzKCB0aGlzLmxld2lzRG90TW9kZWwuZ2V0T3BlbkRpcmVjdGlvbnMoIG91ckF0b20gKSwgZGlyZWN0aW9uICkgKSB7XHJcbiAgICAgICAgICAgICAgLy8gdGhlIHNwb3Qgb24gb3RoZXJBdG9tIHdhcyBvcGVuLCBidXQgdGhlIGNvcnJlc3BvbmRpbmcgc3BvdCBvbiBvdXIgbWFpbiBhdG9tIHdhcyBub3RcclxuICAgICAgICAgICAgICByZXR1cm47IC8vIGNvbnRpbnVlLCBpbiB0aGUgaW5uZXIgbG9vcFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBjaGVjayB0aGUgbGV3aXMgZG90IG1vZGVsIHRvIG1ha2Ugc3VyZSB3ZSB3b3VsZG4ndCBoYXZlIHR3byBcIm92ZXJsYXBwaW5nXCIgYXRvbXMgdGhhdCBhcmVuJ3QgYm90aCBoeWRyb2dlblxyXG4gICAgICAgICAgICBpZiAoICF0aGlzLmxld2lzRG90TW9kZWwud2lsbEFsbG93Qm9uZCggb3VyQXRvbSwgZGlyZWN0aW9uLCBvdGhlckF0b20gKSApIHtcclxuICAgICAgICAgICAgICByZXR1cm47IC8vIGNvbnRpbnVlLCBpbiB0aGUgaW5uZXIgbG9vcFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBib25kaW5nT3B0aW9uID0gbmV3IEJvbmRpbmdPcHRpb24oIG90aGVyQXRvbSwgb3RoZXJEaXJlY3Rpb24sIG91ckF0b20gKTtcclxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBvdXJBdG9tLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZGlzdGFuY2UoIGJvbmRpbmdPcHRpb24uaWRlYWxQb3NpdGlvbiApO1xyXG4gICAgICAgICAgICBpZiAoIGRpc3RhbmNlIDwgYmVzdERpc3RhbmNlRnJvbUlkZWFsUG9zaXRpb24gKSB7XHJcbiAgICAgICAgICAgICAgYmVzdEJvbmRpbmdPcHRpb24gPSBib25kaW5nT3B0aW9uO1xyXG4gICAgICAgICAgICAgIGJlc3REaXN0YW5jZUZyb21JZGVhbFBvc2l0aW9uID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICggb3VyQXRvbS5wb3NpdGlvbkJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBvdGhlckF0b20ucG9zaXRpb25Cb3VuZHMgKSApIHtcclxuICAgICAgICAgICAgICBhdG9tc092ZXJsYXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaWYgb3VyIGNsb3Nlc3QgYm9uZCBpcyB0b28gZmFyIGFuZCBvdXIgYXRvbXMgZG9uJ3Qgb3ZlcmxhcCwgdGhlbiBpZ25vcmUgaXRcclxuICAgIGNvbnN0IGlzQm9uZGluZ0ludmFsaWQgPSAoIGJlc3RCb25kaW5nT3B0aW9uID09PSBudWxsIHx8IGJlc3REaXN0YW5jZUZyb21JZGVhbFBvc2l0aW9uID4gS2l0LmJvbmREaXN0YW5jZVRocmVzaG9sZCApICYmICFhdG9tc092ZXJsYXA7XHJcblxyXG4gICAgaWYgKCBpc0JvbmRpbmdJbnZhbGlkICkge1xyXG4gICAgICB0aGlzLnNlcGFyYXRlTW9sZWN1bGVEZXN0aW5hdGlvbnMoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhdXNlIGFsbCBhdG9tcyBpbiB0aGUgbW9sZWN1bGUgdG8gbW92ZSB0byB0aGF0IHBvc2l0aW9uXHJcbiAgICBjb25zdCBkZWx0YSA9IGJlc3RCb25kaW5nT3B0aW9uLmlkZWFsUG9zaXRpb24ubWludXMoIGJlc3RCb25kaW5nT3B0aW9uLmIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy5nZXRNb2xlY3VsZSggYmVzdEJvbmRpbmdPcHRpb24uYiApLmF0b21zLmZvckVhY2goIGF0b21Jbk1vbGVjdWxlID0+IHtcclxuICAgICAgYXRvbUluTW9sZWN1bGUuc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiggYXRvbUluTW9sZWN1bGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBkZWx0YSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2Ugbm93IHdpbGwgYm9uZCB0aGUgYXRvbVxyXG4gICAgdGhpcy5ib25kKCBiZXN0Qm9uZGluZ09wdGlvbi5hLCBiZXN0Qm9uZGluZ09wdGlvbi5kaXJlY3Rpb24sIGJlc3RCb25kaW5nT3B0aW9uLmIgKTsgLy8gbW9kZWwgYm9uZGluZ1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGlmIHR3byBhdG9tcyBjYW4gY3JlYXRlIGEgYm9uZFxyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGEgLSBBbiBhdG9tIEFcclxuICAgKiBAcGFyYW0ge0F0b20yfSBiIC0gQW4gYXRvbSBCXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNhbkJvbmQoIGEsIGIgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRNb2xlY3VsZSggYSApICE9PSB0aGlzLmdldE1vbGVjdWxlKCBiICkgJiZcclxuICAgICAgICAgICB0aGlzLmlzQWxsb3dlZFN0cnVjdHVyZSggdGhpcy5nZXRQb3NzaWJsZU1vbGVjdWxlU3RydWN0dXJlRnJvbUJvbmQoIGEsIGIgKSApICYmXHJcbiAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uTGF5b3V0LmF2YWlsYWJsZVBsYXlBcmVhQm91bmRzLmNvbnRhaW5zUG9pbnQoIGEucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICYmXHJcbiAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uTGF5b3V0LmF2YWlsYWJsZVBsYXlBcmVhQm91bmRzLmNvbnRhaW5zUG9pbnQoIGIucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIHRoZSBtb2xlY3VsZSBzdHJ1Y3R1cmUgaXMgZm91bmQgd2l0aGluIG91ciBtb2xlY3VsZSBkYXRhXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVN0cnVjdHVyZX0gbW9sZWN1bGVTdHJ1Y3R1cmVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNBbGxvd2VkU3RydWN0dXJlKCBtb2xlY3VsZVN0cnVjdHVyZSApIHtcclxuICAgIHJldHVybiBtb2xlY3VsZVN0cnVjdHVyZS5hdG9tcy5sZW5ndGggPCAyIHx8XHJcbiAgICAgICAgICAgTW9sZWN1bGVMaXN0LmdldE1hc3Rlckluc3RhbmNlKCkuaXNBbGxvd2VkU3RydWN0dXJlKCBtb2xlY3VsZVN0cnVjdHVyZSApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQSBib25kIG9wdGlvbiBmcm9tIEEgdG8gQi4gQiB3b3VsZCBiZSBtb3ZlZCB0byB0aGUgcG9zaXRpb24gbmVhciBBIHRvIGJvbmQuXHJcbmNsYXNzIEJvbmRpbmdPcHRpb24ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGEgLSBBbiBhdG9tIEFcclxuICAgKiBAcGFyYW0ge0RpcmVjdGlvbn0gZGlyZWN0aW9uXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYiAtIEFuIGF0b20gYlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBhLCBkaXJlY3Rpb24sIGIgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXRvbTJ9XHJcbiAgICB0aGlzLmEgPSBhO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0RpcmVjdGlvbn1cclxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0F0b20yfVxyXG4gICAgdGhpcy5iID0gYjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn0gVGhlIHBvc2l0aW9uIHRoZSBhdG9tIHNob3VsZCBiZSBwbGFjZWRcclxuICAgIHRoaXMuaWRlYWxQb3NpdGlvbiA9IGEucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBkaXJlY3Rpb24udmVjdG9yLnRpbWVzKCBhLmNvdmFsZW50UmFkaXVzICsgYi5jb3ZhbGVudFJhZGl1cyApICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAcHJpdmF0ZSB7Qm9uZGluZ09wdGlvbn0gQXZhaWxhYmxlIGJvbmRpbmcgb3B0aW9uXHJcbktpdC5Cb25kaW5nT3B0aW9uID0gQm9uZGluZ09wdGlvbjtcclxuXHJcbi8vIEBwcml2YXRlIHtudW1iZXJ9IERldGVybWluZXMgaG93IGNsb3NlIGEgbW9sZWN1bGUgbmVlZHMgdG8gYmUgdG8gYXR0ZW1wdCB0byBib25kXHJcbktpdC5ib25kRGlzdGFuY2VUaHJlc2hvbGQgPSAxMDA7XHJcblxyXG4vLyBAcHJpdmF0ZSB7bnVtYmVyfSBEaXN0YW5jZSBiZXR3ZWVuIGVhY2ggYnVja2V0XHJcbktpdC5idWNrZXRQYWRkaW5nID0gNTA7XHJcblxyXG4vLyBAcHJpdmF0ZSB7bnVtYmVyfSBEZXRlcm1pbmVzIGhvdyBmYXIgYXdheSB0byBzZXBhcmF0ZSB0aGUgbW9sZWN1bGVzIGZyb20gZWFjaCBvdGhlclxyXG5LaXQuaW50ZXJNb2xlY3VsZVBhZGRpbmcgPSAxMDA7XHJcblxyXG5idWlsZEFNb2xlY3VsZS5yZWdpc3RlciggJ0tpdCcsIEtpdCApO1xyXG5leHBvcnQgZGVmYXVsdCBLaXQ7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9B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