// Copyright 2013-2021, University of Colorado Boulder

/**
 * Base type of model of a single-atom-centered molecule which has a certain number of pair groups
 * surrounding it. Concrete sub-types should implement the methods documented at the start of the prototype.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesQueryParameters from '../MoleculeShapesQueryParameters.js';
import Bond from './Bond.js';
import LocalShape from './LocalShape.js';
import PairGroup from './PairGroup.js';
import VSEPRConfiguration from './VSEPRConfiguration.js';

// Adding in maximum numbers of pairs, see https://github.com/phetsims/special-ops/issues/190
const maxConnectionsProperty = new NumberProperty(MoleculeShapesQueryParameters.maxConnections, {
  range: new Range(0, 6),
  tandem: Tandem.GLOBAL_MODEL.createTandem('maxConnectionsProperty'),
  numberType: 'Integer'
});
function addToEndOfArray(array, item, addToFront) {
  if (addToFront) {
    array.unshift(item);
  } else {
    array.push(item);
  }
}
class Molecule {
  /*
   * @param {boolean} isReal - Whether the molecule has real angles, or is based on a model.
   */
  constructor(isReal) {
    // @public {boolean} - Whether this molecule is based on real angles or on a model.
    this.isReal = isReal;

    // @public {Array.<PairGroup>} - all of the pair groups, with lone pairs first
    this.groups = [];

    // @public {Array.<Bond.<PairGroup>>} - bonds between pair groups. for lone pairs, this doesn't mean an actual molecular bond,
    // so we just have order 0. Lone-pair 'bonds' are listed first.
    this.bonds = [];

    // Cached subsets of groups (changed on modifications) that we need to iterate through without GC with lone pairs
    // first
    this.atoms = []; // @public {Array.<PairGroup>} - !isLonePair
    this.lonePairs = []; // @public {Array.<PairGroup>} - isLonePair
    this.radialGroups = []; // @public {Array.<PairGroup>} - bonded with centralAtom
    this.radialAtoms = []; // @public {Array.<PairGroup>} - !isLonePair, bonded with centralAtom
    this.radialLonePairs = []; // @public {Array.<PairGroup>} - isLonePair, bonded with centralAtom

    this.centralAtom = null; // @public {PairGroup} - Will be filled in later.

    this.lastMidpoint = null; // @public {Vector3|null} - The last bond-angle midpoint for a 2-atom system globally

    // @public {Emitter}
    this.bondAddedEmitter = new Emitter({
      parameters: [{
        valueType: Bond
      }]
    });
    this.bondRemovedEmitter = new Emitter({
      parameters: [{
        valueType: Bond
      }]
    });
    this.bondChangedEmitter = new Emitter({
      parameters: [{
        valueType: Bond
      }]
    });
    this.groupAddedEmitter = new Emitter({
      parameters: [{
        valueType: PairGroup
      }]
    });
    this.groupRemovedEmitter = new Emitter({
      parameters: [{
        valueType: PairGroup
      }]
    });
    this.groupChangedEmitter = new Emitter({
      parameters: [{
        valueType: PairGroup
      }]
    });

    // composite events
    this.bondAddedEmitter.addListener(bond => this.bondChangedEmitter.emit(bond));
    this.bondRemovedEmitter.addListener(bond => this.bondChangedEmitter.emit(bond));
    this.groupAddedEmitter.addListener(group => this.groupChangedEmitter.emit(group));
    this.groupRemovedEmitter.addListener(group => this.groupChangedEmitter.emit(group));
  }

  /**
   * Gets the ideal orientations for the bonds around an atom.
   * @public
   * @abstract
   *
   * @param {PairGroup} atom
   * @returns {LocalShape}
   */
  getLocalShape(atom) {
    throw new Error('abstract method');
  }

  /**
   * @public
   * @abstract
   * @returns {number|undefined} if applicable
   */
  getMaximumBondLength() {
    throw new Error('abstract method');
  }

  /**
   * Step function for the physics
   * @public
   *
   * @param {number} dt
   */
  update(dt) {
    const numGroups = this.groups.length;
    for (let i = 0; i < numGroups; i++) {
      const group = this.groups[i];

      // ignore processing on the central atom
      if (group === this.centralAtom) {
        continue;
      }
      const parentBond = this.getParentBond(group);
      const parentGroup = parentBond.getOtherAtom(group);

      // store the old distance before stepping in time
      const oldDistance = group.positionProperty.value.distance(parentGroup.positionProperty.value);
      group.stepForward(dt);
      group.attractToIdealDistance(dt, oldDistance, parentBond);
    }
  }

  /**
   * Given a pair group, return an array of all bonds connected to that pair group.
   * @public
   *
   * @param {PairGroup} group
   * @returns {Array.<Bond.<PairGroup>>}
   */
  getBondsAround(group) {
    // all bonds to the pair group, if specified
    return _.filter(this.bonds, bond => bond.contains(group));
  }

  /**
   * Given a pair group, return an array of all pair groups connected to it by a bond.
   * @public
   *
   * @param {PairGroup} group
   * @returns {Array.<PairGroup>}
   */
  getNeighbors(group) {
    return _.map(this.getBondsAround(group), bond => bond.getOtherAtom(group));
  }

  /**
   * Return the number of neighbors returned by getNeighbors(), but more efficiently.
   * @public
   *
   * @param {PairGroup} group
   * @returns {number}
   */
  getNeighborCount(group) {
    let count = 0;
    for (let i = 0; i < this.bonds.length; i++) {
      if (this.bonds[i].contains(group)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Configuration for the center of the molecule.
   * @public
   *
   * @returns {VSEPRConfiguration}
   */
  getCentralVSEPRConfiguration() {
    return VSEPRConfiguration.getConfiguration(this.radialAtoms.length, this.radialLonePairs.length);
  }

  /**
   * Given a pair group, return the bond (if it exists) from it to the central atom (or an atom bonded to the central
   * atom), OR null.
   * @public
   *
   * @param {PairGroup} group
   * @returns {Bond.<PairGroup> | null}
   */
  getParentBond(group) {
    // assumes we have simple atoms (star-shaped) with terminal lone pairs
    if (group.isLonePair) {
      return this.getBondsAround(group)[0];
    } else {
      const centralAtom = this.centralAtom;
      const result = _.filter(this.getBondsAround(group), bond => bond.getOtherAtom(group) === centralAtom)[0];
      return result || null;
    }
  }

  /**
   * Given a pair group, return the pair group closer to the center of the molecule,
   * equivalent to getParentBond( x ).getOtherAtom( x );
   * @public
   *
   * @param {PairGroup} group
   * @returns {PairGroup}
   */
  getParent(group) {
    return this.getParentBond(group).getOtherAtom(group);
  }

  /**
   * Adds in the central atom.
   * @public
   *
   * @param {PairGroup} group
   */
  addCentralAtom(group) {
    this.centralAtom = group;
    this.addGroup(group, true);
    group.isCentralAtom = true;
  }

  /**
   * Adds a "child" pair group to the molecule, along with a bond between it and a parent pair group.
   * @public
   *
   * @param {PairGroup} group
   * @param {PairGroup} parent
   * @param {number} bondOrder - 0 for lone pairs.
   * @param {number} [bondLength] - Length of the bond.
   */
  addGroupAndBond(group, parent, bondOrder, bondLength) {
    // add the group, but delay notifications (inconsistent state)
    this.addGroup(group, false);
    bondLength = bondLength || group.positionProperty.value.minus(parent.positionProperty.value).magnitude;

    // add the bond after the group so we can reference things properly
    this.addBond(new Bond(group, parent, bondOrder, bondLength));

    // notify after bond added, so we don't send notifications in an inconsistent state
    this.groupAddedEmitter.emit(group);
  }

  /**
   * Adds a pair group to the molecule, with an option of whether to modify or not.
   * @public
   *
   * @param {PairGroup} group
   * @param {boolean} notify - Whether notifications should be sent out for the corresponding event.
   */
  addGroup(group, notify) {
    // always add the central group first
    assert && assert(this.centralAtom !== null);
    addToEndOfArray(this.groups, group, group.isLonePair);
    if (group.isLonePair) {
      addToEndOfArray(this.lonePairs, group, group.isLonePair);
    } else {
      addToEndOfArray(this.atoms, group, group.isLonePair);
    }

    // notify
    if (notify) {
      this.groupAddedEmitter.emit(group);
    }
  }

  /**
   * Adds a bond to the molecule.
   * @public
   *
   * @param {Bond.<PairGroup>}
   */
  addBond(bond) {
    const isLonePairBond = bond.order === 0;
    addToEndOfArray(this.bonds, bond, isLonePairBond);
    if (bond.contains(this.centralAtom)) {
      const group = bond.getOtherAtom(this.centralAtom);
      addToEndOfArray(this.radialGroups, group, isLonePairBond);
      if (group.isLonePair) {
        addToEndOfArray(this.radialLonePairs, group, isLonePairBond);
      } else {
        addToEndOfArray(this.radialAtoms, group, isLonePairBond);
      }
    }
    this.bondAddedEmitter.emit(bond);
  }

  /**
   * Removes a bond to the molecule.
   * @public
   *
   * @param {Bond.<PairGroup>}
   */
  removeBond(bond) {
    arrayRemove(this.bonds, bond);
    if (bond.contains(this.centralAtom)) {
      const group = bond.getOtherAtom(this.centralAtom);
      arrayRemove(this.radialGroups, group);
      if (group.isLonePair) {
        arrayRemove(this.radialLonePairs, group);
      } else {
        arrayRemove(this.radialAtoms, group);
      }
    }
    this.bondRemovedEmitter.emit(bond);
  }

  /**
   * Removes a pair group from the molecule (and any attached bonds)
   * @public
   *
   * @param {PairGroup}
   */
  removeGroup(group) {
    let i;
    assert && assert(this.centralAtom !== group);

    // remove all of its bonds first
    const bondList = this.getBondsAround(group);
    for (i = 0; i < bondList.length; i++) {
      this.removeBond(bondList[i]);
    }
    arrayRemove(this.groups, group);
    if (group.isLonePair) {
      arrayRemove(this.lonePairs, group);
    } else {
      arrayRemove(this.atoms, group);
    }

    // notify
    this.groupRemovedEmitter.emit(group);
    for (i = 0; i < bondList.length; i++) {
      // delayed notification for bond removal
      this.bondRemovedEmitter.emit(bondList[i]);
    }
  }

  /**
   * Removes all pair groups (and thus bonds) from the molecule.
   * @public
   */
  removeAllGroups() {
    const groupsCopy = this.groups.slice();
    for (let i = 0; i < groupsCopy.length; i++) {
      if (groupsCopy[i] !== this.centralAtom) {
        this.removeGroup(groupsCopy[i]);
      }
    }
  }

  /**
   * Returns an array of unit vectors (orientations) corresponding to the ideal geometry for the shape of our
   * central atom.
   * @public
   *
   * returns {Array.<Vector3>}
   */
  getCorrespondingIdealGeometryVectors() {
    return this.getCentralVSEPRConfiguration().electronGeometry.unitVectors;
  }

  /**
   * Whether a pair group of the specified bond order can be added, or whether this molecule would go over its pair
   * limit.
   * @public
   *
   * @param {number> bondOrder - Bond order of potential pair group to add (0 for lone pair)
   * @returns {boolean}
   */
  wouldAllowBondOrder(bondOrder) {
    return this.radialGroups.length < maxConnectionsProperty.value;
  }

  /**
   * Returns an array of all lone pairs that are not directly connected to our central atom.
   * @public
   *
   * @param {Array.<PairGroup>}
   */
  getDistantLonePairs() {
    const closeLonePairs = this.radialLonePairs;
    return _.filter(this.lonePairs, lonePair => !_.includes(closeLonePairs, lonePair));
  }

  /**
   * Returns a LocalShape object that represents the ideal shape (layout) of bonds around a specific atom, and that
   * can be used to apply attraction/repulsion forces to converge to that shape.
   * @public
   *
   * @param {PairGroup} atom
   * @returns {LocalShape}
   */
  getLocalVSEPRShape(atom) {
    const groups = this.getNeighbors(atom);

    // count lone pairs
    let numLonePairs = 0;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].isLonePair) {
        numLonePairs++;
      }
    }
    const numAtoms = groups.length - numLonePairs;
    return new LocalShape(LocalShape.vseprPermutations(groups), atom, groups, VSEPRConfiguration.getConfiguration(numAtoms, numLonePairs).electronGeometry.unitVectors);
  }

  /**
   * Given a pair group attached to the central atom, return its ideal distance from the central atom.
   * @public
   *
   * @param {PairGroup} group
   * @returns {number}
   */
  getIdealDistanceFromCenter(group) {
    // this only works on pair groups adjacent to the central atom
    const bond = this.getParentBond(group);
    assert && assert(bond.contains(this.centralAtom));
    return group.isLonePair ? PairGroup.LONE_PAIR_DISTANCE : bond.length;
  }

  /**
   * Given an atom attached to the central atom, add a certain quantity of lone pairs (and bonds) around it, in proper
   * initial orientations.
   * @public
   *
   * @param {PairGroup} atom
   * @param {number} quantity
   */
  addTerminalLonePairs(atom, quantity) {
    const pairConfig = VSEPRConfiguration.getConfiguration(1, quantity);
    const lonePairOrientations = pairConfig.electronGeometry.unitVectors;

    // we want to rotate the ideal configuration of lone pairs to the atom's orientation
    const matrix = Matrix3.rotateAToB(lonePairOrientations[lonePairOrientations.length - 1].negated(), atom.orientation);
    for (let i = 0; i < quantity; i++) {
      // mapped into our coordinates
      const lonePairOrientation = matrix.timesVector3(lonePairOrientations[i]);
      this.addGroupAndBond(new PairGroup(atom.positionProperty.value.plus(lonePairOrientation.times(PairGroup.LONE_PAIR_DISTANCE)), true), atom, 0);
    }
  }
}

// @abstract {boolean} - Whether the Molecule is considered 'real', or is just a 'model'.
Molecule.prototype.isReal = false;

// @public {Property.<number>}
Molecule.maxConnectionsProperty = maxConnectionsProperty;
moleculeShapes.register('Molecule', Molecule);
export default Molecule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJNYXRyaXgzIiwiUmFuZ2UiLCJhcnJheVJlbW92ZSIsIlRhbmRlbSIsIm1vbGVjdWxlU2hhcGVzIiwiTW9sZWN1bGVTaGFwZXNRdWVyeVBhcmFtZXRlcnMiLCJCb25kIiwiTG9jYWxTaGFwZSIsIlBhaXJHcm91cCIsIlZTRVBSQ29uZmlndXJhdGlvbiIsIm1heENvbm5lY3Rpb25zUHJvcGVydHkiLCJtYXhDb25uZWN0aW9ucyIsInJhbmdlIiwidGFuZGVtIiwiR0xPQkFMX01PREVMIiwiY3JlYXRlVGFuZGVtIiwibnVtYmVyVHlwZSIsImFkZFRvRW5kT2ZBcnJheSIsImFycmF5IiwiaXRlbSIsImFkZFRvRnJvbnQiLCJ1bnNoaWZ0IiwicHVzaCIsIk1vbGVjdWxlIiwiY29uc3RydWN0b3IiLCJpc1JlYWwiLCJncm91cHMiLCJib25kcyIsImF0b21zIiwibG9uZVBhaXJzIiwicmFkaWFsR3JvdXBzIiwicmFkaWFsQXRvbXMiLCJyYWRpYWxMb25lUGFpcnMiLCJjZW50cmFsQXRvbSIsImxhc3RNaWRwb2ludCIsImJvbmRBZGRlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiYm9uZFJlbW92ZWRFbWl0dGVyIiwiYm9uZENoYW5nZWRFbWl0dGVyIiwiZ3JvdXBBZGRlZEVtaXR0ZXIiLCJncm91cFJlbW92ZWRFbWl0dGVyIiwiZ3JvdXBDaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiYm9uZCIsImVtaXQiLCJncm91cCIsImdldExvY2FsU2hhcGUiLCJhdG9tIiwiRXJyb3IiLCJnZXRNYXhpbXVtQm9uZExlbmd0aCIsInVwZGF0ZSIsImR0IiwibnVtR3JvdXBzIiwibGVuZ3RoIiwiaSIsInBhcmVudEJvbmQiLCJnZXRQYXJlbnRCb25kIiwicGFyZW50R3JvdXAiLCJnZXRPdGhlckF0b20iLCJvbGREaXN0YW5jZSIsInBvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsImRpc3RhbmNlIiwic3RlcEZvcndhcmQiLCJhdHRyYWN0VG9JZGVhbERpc3RhbmNlIiwiZ2V0Qm9uZHNBcm91bmQiLCJfIiwiZmlsdGVyIiwiY29udGFpbnMiLCJnZXROZWlnaGJvcnMiLCJtYXAiLCJnZXROZWlnaGJvckNvdW50IiwiY291bnQiLCJnZXRDZW50cmFsVlNFUFJDb25maWd1cmF0aW9uIiwiZ2V0Q29uZmlndXJhdGlvbiIsImlzTG9uZVBhaXIiLCJyZXN1bHQiLCJnZXRQYXJlbnQiLCJhZGRDZW50cmFsQXRvbSIsImFkZEdyb3VwIiwiaXNDZW50cmFsQXRvbSIsImFkZEdyb3VwQW5kQm9uZCIsInBhcmVudCIsImJvbmRPcmRlciIsImJvbmRMZW5ndGgiLCJtaW51cyIsIm1hZ25pdHVkZSIsImFkZEJvbmQiLCJub3RpZnkiLCJhc3NlcnQiLCJpc0xvbmVQYWlyQm9uZCIsIm9yZGVyIiwicmVtb3ZlQm9uZCIsInJlbW92ZUdyb3VwIiwiYm9uZExpc3QiLCJyZW1vdmVBbGxHcm91cHMiLCJncm91cHNDb3B5Iiwic2xpY2UiLCJnZXRDb3JyZXNwb25kaW5nSWRlYWxHZW9tZXRyeVZlY3RvcnMiLCJlbGVjdHJvbkdlb21ldHJ5IiwidW5pdFZlY3RvcnMiLCJ3b3VsZEFsbG93Qm9uZE9yZGVyIiwiZ2V0RGlzdGFudExvbmVQYWlycyIsImNsb3NlTG9uZVBhaXJzIiwibG9uZVBhaXIiLCJpbmNsdWRlcyIsImdldExvY2FsVlNFUFJTaGFwZSIsIm51bUxvbmVQYWlycyIsIm51bUF0b21zIiwidnNlcHJQZXJtdXRhdGlvbnMiLCJnZXRJZGVhbERpc3RhbmNlRnJvbUNlbnRlciIsIkxPTkVfUEFJUl9ESVNUQU5DRSIsImFkZFRlcm1pbmFsTG9uZVBhaXJzIiwicXVhbnRpdHkiLCJwYWlyQ29uZmlnIiwibG9uZVBhaXJPcmllbnRhdGlvbnMiLCJtYXRyaXgiLCJyb3RhdGVBVG9CIiwibmVnYXRlZCIsIm9yaWVudGF0aW9uIiwibG9uZVBhaXJPcmllbnRhdGlvbiIsInRpbWVzVmVjdG9yMyIsInBsdXMiLCJ0aW1lcyIsInByb3RvdHlwZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSB0eXBlIG9mIG1vZGVsIG9mIGEgc2luZ2xlLWF0b20tY2VudGVyZWQgbW9sZWN1bGUgd2hpY2ggaGFzIGEgY2VydGFpbiBudW1iZXIgb2YgcGFpciBncm91cHNcclxuICogc3Vycm91bmRpbmcgaXQuIENvbmNyZXRlIHN1Yi10eXBlcyBzaG91bGQgaW1wbGVtZW50IHRoZSBtZXRob2RzIGRvY3VtZW50ZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBwcm90b3R5cGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vTW9sZWN1bGVTaGFwZXNRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgQm9uZCBmcm9tICcuL0JvbmQuanMnO1xyXG5pbXBvcnQgTG9jYWxTaGFwZSBmcm9tICcuL0xvY2FsU2hhcGUuanMnO1xyXG5pbXBvcnQgUGFpckdyb3VwIGZyb20gJy4vUGFpckdyb3VwLmpzJztcclxuaW1wb3J0IFZTRVBSQ29uZmlndXJhdGlvbiBmcm9tICcuL1ZTRVBSQ29uZmlndXJhdGlvbi5qcyc7XHJcblxyXG4vLyBBZGRpbmcgaW4gbWF4aW11bSBudW1iZXJzIG9mIHBhaXJzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NwZWNpYWwtb3BzL2lzc3Vlcy8xOTBcclxuY29uc3QgbWF4Q29ubmVjdGlvbnNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggTW9sZWN1bGVTaGFwZXNRdWVyeVBhcmFtZXRlcnMubWF4Q29ubmVjdGlvbnMsIHtcclxuICByYW5nZTogbmV3IFJhbmdlKCAwLCA2ICksXHJcbiAgdGFuZGVtOiBUYW5kZW0uR0xPQkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ21heENvbm5lY3Rpb25zUHJvcGVydHknICksXHJcbiAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbn0gKTtcclxuXHJcbmZ1bmN0aW9uIGFkZFRvRW5kT2ZBcnJheSggYXJyYXksIGl0ZW0sIGFkZFRvRnJvbnQgKSB7XHJcbiAgaWYgKCBhZGRUb0Zyb250ICkge1xyXG4gICAgYXJyYXkudW5zaGlmdCggaXRlbSApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGFycmF5LnB1c2goIGl0ZW0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIE1vbGVjdWxlIHtcclxuICAvKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSZWFsIC0gV2hldGhlciB0aGUgbW9sZWN1bGUgaGFzIHJlYWwgYW5nbGVzLCBvciBpcyBiYXNlZCBvbiBhIG1vZGVsLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpc1JlYWwgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMgbW9sZWN1bGUgaXMgYmFzZWQgb24gcmVhbCBhbmdsZXMgb3Igb24gYSBtb2RlbC5cclxuICAgIHRoaXMuaXNSZWFsID0gaXNSZWFsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxQYWlyR3JvdXA+fSAtIGFsbCBvZiB0aGUgcGFpciBncm91cHMsIHdpdGggbG9uZSBwYWlycyBmaXJzdFxyXG4gICAgdGhpcy5ncm91cHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48Qm9uZC48UGFpckdyb3VwPj59IC0gYm9uZHMgYmV0d2VlbiBwYWlyIGdyb3Vwcy4gZm9yIGxvbmUgcGFpcnMsIHRoaXMgZG9lc24ndCBtZWFuIGFuIGFjdHVhbCBtb2xlY3VsYXIgYm9uZCxcclxuICAgIC8vIHNvIHdlIGp1c3QgaGF2ZSBvcmRlciAwLiBMb25lLXBhaXIgJ2JvbmRzJyBhcmUgbGlzdGVkIGZpcnN0LlxyXG4gICAgdGhpcy5ib25kcyA9IFtdO1xyXG5cclxuICAgIC8vIENhY2hlZCBzdWJzZXRzIG9mIGdyb3VwcyAoY2hhbmdlZCBvbiBtb2RpZmljYXRpb25zKSB0aGF0IHdlIG5lZWQgdG8gaXRlcmF0ZSB0aHJvdWdoIHdpdGhvdXQgR0Mgd2l0aCBsb25lIHBhaXJzXHJcbiAgICAvLyBmaXJzdFxyXG4gICAgdGhpcy5hdG9tcyA9IFtdOyAvLyBAcHVibGljIHtBcnJheS48UGFpckdyb3VwPn0gLSAhaXNMb25lUGFpclxyXG4gICAgdGhpcy5sb25lUGFpcnMgPSBbXTsgLy8gQHB1YmxpYyB7QXJyYXkuPFBhaXJHcm91cD59IC0gaXNMb25lUGFpclxyXG4gICAgdGhpcy5yYWRpYWxHcm91cHMgPSBbXTsgLy8gQHB1YmxpYyB7QXJyYXkuPFBhaXJHcm91cD59IC0gYm9uZGVkIHdpdGggY2VudHJhbEF0b21cclxuICAgIHRoaXMucmFkaWFsQXRvbXMgPSBbXTsgLy8gQHB1YmxpYyB7QXJyYXkuPFBhaXJHcm91cD59IC0gIWlzTG9uZVBhaXIsIGJvbmRlZCB3aXRoIGNlbnRyYWxBdG9tXHJcbiAgICB0aGlzLnJhZGlhbExvbmVQYWlycyA9IFtdOyAvLyBAcHVibGljIHtBcnJheS48UGFpckdyb3VwPn0gLSBpc0xvbmVQYWlyLCBib25kZWQgd2l0aCBjZW50cmFsQXRvbVxyXG5cclxuICAgIHRoaXMuY2VudHJhbEF0b20gPSBudWxsOyAvLyBAcHVibGljIHtQYWlyR3JvdXB9IC0gV2lsbCBiZSBmaWxsZWQgaW4gbGF0ZXIuXHJcblxyXG4gICAgdGhpcy5sYXN0TWlkcG9pbnQgPSBudWxsOyAvLyBAcHVibGljIHtWZWN0b3IzfG51bGx9IC0gVGhlIGxhc3QgYm9uZC1hbmdsZSBtaWRwb2ludCBmb3IgYSAyLWF0b20gc3lzdGVtIGdsb2JhbGx5XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RW1pdHRlcn1cclxuICAgIHRoaXMuYm9uZEFkZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IEJvbmQgfSBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJvbmRSZW1vdmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IEJvbmQgfSBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJvbmRDaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IEJvbmQgfSBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmdyb3VwQWRkZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogUGFpckdyb3VwIH0gXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ncm91cFJlbW92ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogUGFpckdyb3VwIH0gXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ncm91cENoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogUGFpckdyb3VwIH0gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNvbXBvc2l0ZSBldmVudHNcclxuICAgIHRoaXMuYm9uZEFkZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggYm9uZCA9PiB0aGlzLmJvbmRDaGFuZ2VkRW1pdHRlci5lbWl0KCBib25kICkgKTtcclxuICAgIHRoaXMuYm9uZFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBib25kID0+IHRoaXMuYm9uZENoYW5nZWRFbWl0dGVyLmVtaXQoIGJvbmQgKSApO1xyXG4gICAgdGhpcy5ncm91cEFkZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggZ3JvdXAgPT4gdGhpcy5ncm91cENoYW5nZWRFbWl0dGVyLmVtaXQoIGdyb3VwICkgKTtcclxuICAgIHRoaXMuZ3JvdXBSZW1vdmVkRW1pdHRlci5hZGRMaXN0ZW5lciggZ3JvdXAgPT4gdGhpcy5ncm91cENoYW5nZWRFbWl0dGVyLmVtaXQoIGdyb3VwICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGlkZWFsIG9yaWVudGF0aW9ucyBmb3IgdGhlIGJvbmRzIGFyb3VuZCBhbiBhdG9tLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGFpckdyb3VwfSBhdG9tXHJcbiAgICogQHJldHVybnMge0xvY2FsU2hhcGV9XHJcbiAgICovXHJcbiAgZ2V0TG9jYWxTaGFwZSggYXRvbSApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2Fic3RyYWN0IG1ldGhvZCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfHVuZGVmaW5lZH0gaWYgYXBwbGljYWJsZVxyXG4gICAqL1xyXG4gIGdldE1heGltdW1Cb25kTGVuZ3RoKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnYWJzdHJhY3QgbWV0aG9kJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCBmdW5jdGlvbiBmb3IgdGhlIHBoeXNpY3NcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICB1cGRhdGUoIGR0ICkge1xyXG4gICAgY29uc3QgbnVtR3JvdXBzID0gdGhpcy5ncm91cHMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtR3JvdXBzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGdyb3VwID0gdGhpcy5ncm91cHNbIGkgXTtcclxuXHJcbiAgICAgIC8vIGlnbm9yZSBwcm9jZXNzaW5nIG9uIHRoZSBjZW50cmFsIGF0b21cclxuICAgICAgaWYgKCBncm91cCA9PT0gdGhpcy5jZW50cmFsQXRvbSApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcGFyZW50Qm9uZCA9IHRoaXMuZ2V0UGFyZW50Qm9uZCggZ3JvdXAgKTtcclxuICAgICAgY29uc3QgcGFyZW50R3JvdXAgPSBwYXJlbnRCb25kLmdldE90aGVyQXRvbSggZ3JvdXAgKTtcclxuXHJcbiAgICAgIC8vIHN0b3JlIHRoZSBvbGQgZGlzdGFuY2UgYmVmb3JlIHN0ZXBwaW5nIGluIHRpbWVcclxuICAgICAgY29uc3Qgb2xkRGlzdGFuY2UgPSBncm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBwYXJlbnRHcm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICBncm91cC5zdGVwRm9yd2FyZCggZHQgKTtcclxuICAgICAgZ3JvdXAuYXR0cmFjdFRvSWRlYWxEaXN0YW5jZSggZHQsIG9sZERpc3RhbmNlLCBwYXJlbnRCb25kICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHBhaXIgZ3JvdXAsIHJldHVybiBhbiBhcnJheSBvZiBhbGwgYm9uZHMgY29ubmVjdGVkIHRvIHRoYXQgcGFpciBncm91cC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gZ3JvdXBcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEJvbmQuPFBhaXJHcm91cD4+fVxyXG4gICAqL1xyXG4gIGdldEJvbmRzQXJvdW5kKCBncm91cCApIHtcclxuICAgIC8vIGFsbCBib25kcyB0byB0aGUgcGFpciBncm91cCwgaWYgc3BlY2lmaWVkXHJcbiAgICByZXR1cm4gXy5maWx0ZXIoIHRoaXMuYm9uZHMsIGJvbmQgPT4gYm9uZC5jb250YWlucyggZ3JvdXAgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYSBwYWlyIGdyb3VwLCByZXR1cm4gYW4gYXJyYXkgb2YgYWxsIHBhaXIgZ3JvdXBzIGNvbm5lY3RlZCB0byBpdCBieSBhIGJvbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGdyb3VwXHJcbiAgICogQHJldHVybnMge0FycmF5LjxQYWlyR3JvdXA+fVxyXG4gICAqL1xyXG4gIGdldE5laWdoYm9ycyggZ3JvdXAgKSB7XHJcbiAgICByZXR1cm4gXy5tYXAoIHRoaXMuZ2V0Qm9uZHNBcm91bmQoIGdyb3VwICksIGJvbmQgPT4gYm9uZC5nZXRPdGhlckF0b20oIGdyb3VwICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIG5laWdoYm9ycyByZXR1cm5lZCBieSBnZXROZWlnaGJvcnMoKSwgYnV0IG1vcmUgZWZmaWNpZW50bHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGdyb3VwXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXROZWlnaGJvckNvdW50KCBncm91cCApIHtcclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJvbmRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuYm9uZHNbIGkgXS5jb250YWlucyggZ3JvdXAgKSApIHtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY291bnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmF0aW9uIGZvciB0aGUgY2VudGVyIG9mIHRoZSBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VlNFUFJDb25maWd1cmF0aW9ufVxyXG4gICAqL1xyXG4gIGdldENlbnRyYWxWU0VQUkNvbmZpZ3VyYXRpb24oKSB7XHJcbiAgICByZXR1cm4gVlNFUFJDb25maWd1cmF0aW9uLmdldENvbmZpZ3VyYXRpb24oIHRoaXMucmFkaWFsQXRvbXMubGVuZ3RoLCB0aGlzLnJhZGlhbExvbmVQYWlycy5sZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgcGFpciBncm91cCwgcmV0dXJuIHRoZSBib25kIChpZiBpdCBleGlzdHMpIGZyb20gaXQgdG8gdGhlIGNlbnRyYWwgYXRvbSAob3IgYW4gYXRvbSBib25kZWQgdG8gdGhlIGNlbnRyYWxcclxuICAgKiBhdG9tKSwgT1IgbnVsbC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gZ3JvdXBcclxuICAgKiBAcmV0dXJucyB7Qm9uZC48UGFpckdyb3VwPiB8IG51bGx9XHJcbiAgICovXHJcbiAgZ2V0UGFyZW50Qm9uZCggZ3JvdXAgKSB7XHJcbiAgICAvLyBhc3N1bWVzIHdlIGhhdmUgc2ltcGxlIGF0b21zIChzdGFyLXNoYXBlZCkgd2l0aCB0ZXJtaW5hbCBsb25lIHBhaXJzXHJcbiAgICBpZiAoIGdyb3VwLmlzTG9uZVBhaXIgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEJvbmRzQXJvdW5kKCBncm91cCApWyAwIF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgY2VudHJhbEF0b20gPSB0aGlzLmNlbnRyYWxBdG9tO1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBfLmZpbHRlciggdGhpcy5nZXRCb25kc0Fyb3VuZCggZ3JvdXAgKSwgYm9uZCA9PiBib25kLmdldE90aGVyQXRvbSggZ3JvdXAgKSA9PT0gY2VudHJhbEF0b20gKVsgMCBdO1xyXG4gICAgICByZXR1cm4gcmVzdWx0IHx8IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHBhaXIgZ3JvdXAsIHJldHVybiB0aGUgcGFpciBncm91cCBjbG9zZXIgdG8gdGhlIGNlbnRlciBvZiB0aGUgbW9sZWN1bGUsXHJcbiAgICogZXF1aXZhbGVudCB0byBnZXRQYXJlbnRCb25kKCB4ICkuZ2V0T3RoZXJBdG9tKCB4ICk7XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGdyb3VwXHJcbiAgICogQHJldHVybnMge1BhaXJHcm91cH1cclxuICAgKi9cclxuICBnZXRQYXJlbnQoIGdyb3VwICkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50Qm9uZCggZ3JvdXAgKS5nZXRPdGhlckF0b20oIGdyb3VwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGluIHRoZSBjZW50cmFsIGF0b20uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGdyb3VwXHJcbiAgICovXHJcbiAgYWRkQ2VudHJhbEF0b20oIGdyb3VwICkge1xyXG4gICAgdGhpcy5jZW50cmFsQXRvbSA9IGdyb3VwO1xyXG4gICAgdGhpcy5hZGRHcm91cCggZ3JvdXAsIHRydWUgKTtcclxuICAgIGdyb3VwLmlzQ2VudHJhbEF0b20gPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIFwiY2hpbGRcIiBwYWlyIGdyb3VwIHRvIHRoZSBtb2xlY3VsZSwgYWxvbmcgd2l0aCBhIGJvbmQgYmV0d2VlbiBpdCBhbmQgYSBwYXJlbnQgcGFpciBncm91cC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gZ3JvdXBcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gcGFyZW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvbmRPcmRlciAtIDAgZm9yIGxvbmUgcGFpcnMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtib25kTGVuZ3RoXSAtIExlbmd0aCBvZiB0aGUgYm9uZC5cclxuICAgKi9cclxuICBhZGRHcm91cEFuZEJvbmQoIGdyb3VwLCBwYXJlbnQsIGJvbmRPcmRlciwgYm9uZExlbmd0aCApIHtcclxuICAgIC8vIGFkZCB0aGUgZ3JvdXAsIGJ1dCBkZWxheSBub3RpZmljYXRpb25zIChpbmNvbnNpc3RlbnQgc3RhdGUpXHJcbiAgICB0aGlzLmFkZEdyb3VwKCBncm91cCwgZmFsc2UgKTtcclxuXHJcbiAgICBib25kTGVuZ3RoID0gYm9uZExlbmd0aCB8fCBncm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1pbnVzKCBwYXJlbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLm1hZ25pdHVkZTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGJvbmQgYWZ0ZXIgdGhlIGdyb3VwIHNvIHdlIGNhbiByZWZlcmVuY2UgdGhpbmdzIHByb3Blcmx5XHJcbiAgICB0aGlzLmFkZEJvbmQoIG5ldyBCb25kKCBncm91cCwgcGFyZW50LCBib25kT3JkZXIsIGJvbmRMZW5ndGggKSApO1xyXG5cclxuICAgIC8vIG5vdGlmeSBhZnRlciBib25kIGFkZGVkLCBzbyB3ZSBkb24ndCBzZW5kIG5vdGlmaWNhdGlvbnMgaW4gYW4gaW5jb25zaXN0ZW50IHN0YXRlXHJcbiAgICB0aGlzLmdyb3VwQWRkZWRFbWl0dGVyLmVtaXQoIGdyb3VwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgcGFpciBncm91cCB0byB0aGUgbW9sZWN1bGUsIHdpdGggYW4gb3B0aW9uIG9mIHdoZXRoZXIgdG8gbW9kaWZ5IG9yIG5vdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gZ3JvdXBcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG5vdGlmeSAtIFdoZXRoZXIgbm90aWZpY2F0aW9ucyBzaG91bGQgYmUgc2VudCBvdXQgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGV2ZW50LlxyXG4gICAqL1xyXG4gIGFkZEdyb3VwKCBncm91cCwgbm90aWZ5ICkge1xyXG4gICAgLy8gYWx3YXlzIGFkZCB0aGUgY2VudHJhbCBncm91cCBmaXJzdFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jZW50cmFsQXRvbSAhPT0gbnVsbCApO1xyXG5cclxuICAgIGFkZFRvRW5kT2ZBcnJheSggdGhpcy5ncm91cHMsIGdyb3VwLCBncm91cC5pc0xvbmVQYWlyICk7XHJcbiAgICBpZiAoIGdyb3VwLmlzTG9uZVBhaXIgKSB7XHJcbiAgICAgIGFkZFRvRW5kT2ZBcnJheSggdGhpcy5sb25lUGFpcnMsIGdyb3VwLCBncm91cC5pc0xvbmVQYWlyICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYWRkVG9FbmRPZkFycmF5KCB0aGlzLmF0b21zLCBncm91cCwgZ3JvdXAuaXNMb25lUGFpciApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vdGlmeVxyXG4gICAgaWYgKCBub3RpZnkgKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBBZGRlZEVtaXR0ZXIuZW1pdCggZ3JvdXAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBib25kIHRvIHRoZSBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvbmQuPFBhaXJHcm91cD59XHJcbiAgICovXHJcbiAgYWRkQm9uZCggYm9uZCApIHtcclxuICAgIGNvbnN0IGlzTG9uZVBhaXJCb25kID0gYm9uZC5vcmRlciA9PT0gMDtcclxuXHJcbiAgICBhZGRUb0VuZE9mQXJyYXkoIHRoaXMuYm9uZHMsIGJvbmQsIGlzTG9uZVBhaXJCb25kICk7XHJcblxyXG4gICAgaWYgKCBib25kLmNvbnRhaW5zKCB0aGlzLmNlbnRyYWxBdG9tICkgKSB7XHJcbiAgICAgIGNvbnN0IGdyb3VwID0gYm9uZC5nZXRPdGhlckF0b20oIHRoaXMuY2VudHJhbEF0b20gKTtcclxuICAgICAgYWRkVG9FbmRPZkFycmF5KCB0aGlzLnJhZGlhbEdyb3VwcywgZ3JvdXAsIGlzTG9uZVBhaXJCb25kICk7XHJcbiAgICAgIGlmICggZ3JvdXAuaXNMb25lUGFpciApIHtcclxuICAgICAgICBhZGRUb0VuZE9mQXJyYXkoIHRoaXMucmFkaWFsTG9uZVBhaXJzLCBncm91cCwgaXNMb25lUGFpckJvbmQgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhZGRUb0VuZE9mQXJyYXkoIHRoaXMucmFkaWFsQXRvbXMsIGdyb3VwLCBpc0xvbmVQYWlyQm9uZCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ib25kQWRkZWRFbWl0dGVyLmVtaXQoIGJvbmQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBib25kIHRvIHRoZSBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvbmQuPFBhaXJHcm91cD59XHJcbiAgICovXHJcbiAgcmVtb3ZlQm9uZCggYm9uZCApIHtcclxuICAgIGFycmF5UmVtb3ZlKCB0aGlzLmJvbmRzLCBib25kICk7XHJcblxyXG4gICAgaWYgKCBib25kLmNvbnRhaW5zKCB0aGlzLmNlbnRyYWxBdG9tICkgKSB7XHJcbiAgICAgIGNvbnN0IGdyb3VwID0gYm9uZC5nZXRPdGhlckF0b20oIHRoaXMuY2VudHJhbEF0b20gKTtcclxuICAgICAgYXJyYXlSZW1vdmUoIHRoaXMucmFkaWFsR3JvdXBzLCBncm91cCApO1xyXG4gICAgICBpZiAoIGdyb3VwLmlzTG9uZVBhaXIgKSB7XHJcbiAgICAgICAgYXJyYXlSZW1vdmUoIHRoaXMucmFkaWFsTG9uZVBhaXJzLCBncm91cCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnJhZGlhbEF0b21zLCBncm91cCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ib25kUmVtb3ZlZEVtaXR0ZXIuZW1pdCggYm9uZCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIHBhaXIgZ3JvdXAgZnJvbSB0aGUgbW9sZWN1bGUgKGFuZCBhbnkgYXR0YWNoZWQgYm9uZHMpXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9XHJcbiAgICovXHJcbiAgcmVtb3ZlR3JvdXAoIGdyb3VwICkge1xyXG4gICAgbGV0IGk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jZW50cmFsQXRvbSAhPT0gZ3JvdXAgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgYWxsIG9mIGl0cyBib25kcyBmaXJzdFxyXG4gICAgY29uc3QgYm9uZExpc3QgPSB0aGlzLmdldEJvbmRzQXJvdW5kKCBncm91cCApO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCBib25kTGlzdC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5yZW1vdmVCb25kKCBib25kTGlzdFsgaSBdICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMuZ3JvdXBzLCBncm91cCApO1xyXG4gICAgaWYgKCBncm91cC5pc0xvbmVQYWlyICkge1xyXG4gICAgICBhcnJheVJlbW92ZSggdGhpcy5sb25lUGFpcnMsIGdyb3VwICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYXJyYXlSZW1vdmUoIHRoaXMuYXRvbXMsIGdyb3VwICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm90aWZ5XHJcbiAgICB0aGlzLmdyb3VwUmVtb3ZlZEVtaXR0ZXIuZW1pdCggZ3JvdXAgKTtcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYm9uZExpc3QubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIC8vIGRlbGF5ZWQgbm90aWZpY2F0aW9uIGZvciBib25kIHJlbW92YWxcclxuICAgICAgdGhpcy5ib25kUmVtb3ZlZEVtaXR0ZXIuZW1pdCggYm9uZExpc3RbIGkgXSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhbGwgcGFpciBncm91cHMgKGFuZCB0aHVzIGJvbmRzKSBmcm9tIHRoZSBtb2xlY3VsZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlQWxsR3JvdXBzKCkge1xyXG4gICAgY29uc3QgZ3JvdXBzQ29weSA9IHRoaXMuZ3JvdXBzLnNsaWNlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBncm91cHNDb3B5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGdyb3Vwc0NvcHlbIGkgXSAhPT0gdGhpcy5jZW50cmFsQXRvbSApIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUdyb3VwKCBncm91cHNDb3B5WyBpIF0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiB1bml0IHZlY3RvcnMgKG9yaWVudGF0aW9ucykgY29ycmVzcG9uZGluZyB0byB0aGUgaWRlYWwgZ2VvbWV0cnkgZm9yIHRoZSBzaGFwZSBvZiBvdXJcclxuICAgKiBjZW50cmFsIGF0b20uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogcmV0dXJucyB7QXJyYXkuPFZlY3RvcjM+fVxyXG4gICAqL1xyXG4gIGdldENvcnJlc3BvbmRpbmdJZGVhbEdlb21ldHJ5VmVjdG9ycygpIHtcclxuICAgIHJldHVybiB0aGlzLmdldENlbnRyYWxWU0VQUkNvbmZpZ3VyYXRpb24oKS5lbGVjdHJvbkdlb21ldHJ5LnVuaXRWZWN0b3JzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciBhIHBhaXIgZ3JvdXAgb2YgdGhlIHNwZWNpZmllZCBib25kIG9yZGVyIGNhbiBiZSBhZGRlZCwgb3Igd2hldGhlciB0aGlzIG1vbGVjdWxlIHdvdWxkIGdvIG92ZXIgaXRzIHBhaXJcclxuICAgKiBsaW1pdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcj4gYm9uZE9yZGVyIC0gQm9uZCBvcmRlciBvZiBwb3RlbnRpYWwgcGFpciBncm91cCB0byBhZGQgKDAgZm9yIGxvbmUgcGFpcilcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB3b3VsZEFsbG93Qm9uZE9yZGVyKCBib25kT3JkZXIgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yYWRpYWxHcm91cHMubGVuZ3RoIDwgbWF4Q29ubmVjdGlvbnNQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIGxvbmUgcGFpcnMgdGhhdCBhcmUgbm90IGRpcmVjdGx5IGNvbm5lY3RlZCB0byBvdXIgY2VudHJhbCBhdG9tLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFBhaXJHcm91cD59XHJcbiAgICovXHJcbiAgZ2V0RGlzdGFudExvbmVQYWlycygpIHtcclxuICAgIGNvbnN0IGNsb3NlTG9uZVBhaXJzID0gdGhpcy5yYWRpYWxMb25lUGFpcnM7XHJcbiAgICByZXR1cm4gXy5maWx0ZXIoIHRoaXMubG9uZVBhaXJzLCBsb25lUGFpciA9PiAhXy5pbmNsdWRlcyggY2xvc2VMb25lUGFpcnMsIGxvbmVQYWlyICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBMb2NhbFNoYXBlIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgdGhlIGlkZWFsIHNoYXBlIChsYXlvdXQpIG9mIGJvbmRzIGFyb3VuZCBhIHNwZWNpZmljIGF0b20sIGFuZCB0aGF0XHJcbiAgICogY2FuIGJlIHVzZWQgdG8gYXBwbHkgYXR0cmFjdGlvbi9yZXB1bHNpb24gZm9yY2VzIHRvIGNvbnZlcmdlIHRvIHRoYXQgc2hhcGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGF0b21cclxuICAgKiBAcmV0dXJucyB7TG9jYWxTaGFwZX1cclxuICAgKi9cclxuICBnZXRMb2NhbFZTRVBSU2hhcGUoIGF0b20gKSB7XHJcbiAgICBjb25zdCBncm91cHMgPSB0aGlzLmdldE5laWdoYm9ycyggYXRvbSApO1xyXG5cclxuICAgIC8vIGNvdW50IGxvbmUgcGFpcnNcclxuICAgIGxldCBudW1Mb25lUGFpcnMgPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGdyb3Vwc1sgaSBdLmlzTG9uZVBhaXIgKSB7XHJcbiAgICAgICAgbnVtTG9uZVBhaXJzKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBudW1BdG9tcyA9IGdyb3Vwcy5sZW5ndGggLSBudW1Mb25lUGFpcnM7XHJcbiAgICByZXR1cm4gbmV3IExvY2FsU2hhcGUoIExvY2FsU2hhcGUudnNlcHJQZXJtdXRhdGlvbnMoIGdyb3VwcyApLCBhdG9tLCBncm91cHMsICggVlNFUFJDb25maWd1cmF0aW9uLmdldENvbmZpZ3VyYXRpb24oIG51bUF0b21zLCBudW1Mb25lUGFpcnMgKSApLmVsZWN0cm9uR2VvbWV0cnkudW5pdFZlY3RvcnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgcGFpciBncm91cCBhdHRhY2hlZCB0byB0aGUgY2VudHJhbCBhdG9tLCByZXR1cm4gaXRzIGlkZWFsIGRpc3RhbmNlIGZyb20gdGhlIGNlbnRyYWwgYXRvbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gZ3JvdXBcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldElkZWFsRGlzdGFuY2VGcm9tQ2VudGVyKCBncm91cCApIHtcclxuICAgIC8vIHRoaXMgb25seSB3b3JrcyBvbiBwYWlyIGdyb3VwcyBhZGphY2VudCB0byB0aGUgY2VudHJhbCBhdG9tXHJcbiAgICBjb25zdCBib25kID0gdGhpcy5nZXRQYXJlbnRCb25kKCBncm91cCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm9uZC5jb250YWlucyggdGhpcy5jZW50cmFsQXRvbSApICk7XHJcblxyXG4gICAgcmV0dXJuIGdyb3VwLmlzTG9uZVBhaXIgPyBQYWlyR3JvdXAuTE9ORV9QQUlSX0RJU1RBTkNFIDogYm9uZC5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhbiBhdG9tIGF0dGFjaGVkIHRvIHRoZSBjZW50cmFsIGF0b20sIGFkZCBhIGNlcnRhaW4gcXVhbnRpdHkgb2YgbG9uZSBwYWlycyAoYW5kIGJvbmRzKSBhcm91bmQgaXQsIGluIHByb3BlclxyXG4gICAqIGluaXRpYWwgb3JpZW50YXRpb25zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGFpckdyb3VwfSBhdG9tXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHF1YW50aXR5XHJcbiAgICovXHJcbiAgYWRkVGVybWluYWxMb25lUGFpcnMoIGF0b20sIHF1YW50aXR5ICkge1xyXG4gICAgY29uc3QgcGFpckNvbmZpZyA9IFZTRVBSQ29uZmlndXJhdGlvbi5nZXRDb25maWd1cmF0aW9uKCAxLCBxdWFudGl0eSApO1xyXG4gICAgY29uc3QgbG9uZVBhaXJPcmllbnRhdGlvbnMgPSBwYWlyQ29uZmlnLmVsZWN0cm9uR2VvbWV0cnkudW5pdFZlY3RvcnM7XHJcblxyXG4gICAgLy8gd2Ugd2FudCB0byByb3RhdGUgdGhlIGlkZWFsIGNvbmZpZ3VyYXRpb24gb2YgbG9uZSBwYWlycyB0byB0aGUgYXRvbSdzIG9yaWVudGF0aW9uXHJcbiAgICBjb25zdCBtYXRyaXggPSBNYXRyaXgzLnJvdGF0ZUFUb0IoIGxvbmVQYWlyT3JpZW50YXRpb25zWyBsb25lUGFpck9yaWVudGF0aW9ucy5sZW5ndGggLSAxIF0ubmVnYXRlZCgpLCBhdG9tLm9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVhbnRpdHk7IGkrKyApIHtcclxuICAgICAgLy8gbWFwcGVkIGludG8gb3VyIGNvb3JkaW5hdGVzXHJcbiAgICAgIGNvbnN0IGxvbmVQYWlyT3JpZW50YXRpb24gPSBtYXRyaXgudGltZXNWZWN0b3IzKCBsb25lUGFpck9yaWVudGF0aW9uc1sgaSBdICk7XHJcbiAgICAgIHRoaXMuYWRkR3JvdXBBbmRCb25kKCBuZXcgUGFpckdyb3VwKCBhdG9tLnBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1cyggbG9uZVBhaXJPcmllbnRhdGlvbi50aW1lcyggUGFpckdyb3VwLkxPTkVfUEFJUl9ESVNUQU5DRSApICksIHRydWUgKSwgYXRvbSwgMCApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gQGFic3RyYWN0IHtib29sZWFufSAtIFdoZXRoZXIgdGhlIE1vbGVjdWxlIGlzIGNvbnNpZGVyZWQgJ3JlYWwnLCBvciBpcyBqdXN0IGEgJ21vZGVsJy5cclxuTW9sZWN1bGUucHJvdG90eXBlLmlzUmVhbCA9IGZhbHNlO1xyXG5cclxuLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59XHJcbk1vbGVjdWxlLm1heENvbm5lY3Rpb25zUHJvcGVydHkgPSBtYXhDb25uZWN0aW9uc1Byb3BlcnR5O1xyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdNb2xlY3VsZScs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