// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a general molecular structure (without position or instance information).
 *
 * Generics for the atom type significantly simplify a lot of other code that would need
 * either explicit casting or wrapper functions.
 *
 * Note: equivalency matrices are stored in row-major format (compared to the Java version)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import ChemUtils from '../../../../nitroglycerin/js/ChemUtils.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
import Bond from './Bond.js';
import ElementHistogram from './ElementHistogram.js';
let nextMoleculeId = 0;
class MoleculeStructure {
  // NOTE from porting: StrippedMolecule relies on the ordering of atoms, and possibly bonds for efficiency in checking
  // equivalencies. Also to make sure molecule separation isn't duplicated on the same molecule pair.
  /**
   * @param {number} [numAtoms]
   * @param {number} [numBonds]
   */
  constructor(numAtoms, numBonds) {
    // @public {number}
    this.moleculeId = nextMoleculeId++; // used for molecule identification and ordering for optimization

    // @public {Array.<Atom>}
    this.atoms = [];

    // @public {Array.<Bond>}
    this.bonds = [];
  }

  /**
   * Add an atom to the molecule structure
   * @param {Atom} atom
   *
   * @public
   * @returns {Atom}
   */
  addAtom(atom) {
    assert && assert(!_.includes(this.atoms, atom), 'Cannot add an already existing atom');
    this.atoms.push(atom); // NOTE: don't mess with the order
    return atom;
  }

  /**
   * Add a bond to the molecule structure
   * @param {Bond} bond
   *
   * @public
   */
  addBond(bond) {
    assert && assert(_.includes(this.atoms, bond.a));
    assert && assert(_.includes(this.atoms, bond.b));
    this.bonds.push(bond);
  }

  /**
   * Return the bonds connected to a specific atom
   * @param {Atom} atom
   *
   * @private
   * @returns {Array.<Bond>}
   */
  getBondsInvolving(atom) {
    // Note: (performance) optimize out function allocation here?
    return _.filter(this.bonds, bond => {
      return bond.contains(atom);
    });
  }

  /**
   * @public
   *
   * @returns {string}
   */
  getHillSystemFormulaFragment() {
    return ChemUtils.hillOrderedSymbol(this.getElementList());
  }

  /**
   * Our best attempt at getting a general molecular naming algorithm that handles organic and non-organic compounds.
   *
   * @public
   *
   * @returns {string} Text which is the molecular formula
   */
  getGeneralFormula() {
    const containsCarbon = this.containsElement(Element.C);
    const containsHydrogen = this.containsElement(Element.H);
    const organic = containsCarbon && containsHydrogen;
    const electronegativeSortValue = element => {
      return element.electronegativity;
    };
    const alphabeticSortValue = element => {
      let value = 1000 * element.symbol.charCodeAt(0);
      if (element.symbol.length > 1) {
        value += element.symbol.charCodeAt(1);
      }
      return value;
    };
    const organicSortValue = element => {
      if (element.isCarbon()) {
        return 0;
      } else if (element.isHydrogen()) {
        return 1;
      } else {
        return alphabeticSortValue(element);
      }
    };
    const sortedElements = _.sortBy(this.getElementList(),
    // carbon first, then hydrogen, then others alphabetically, otherwise sort by increasing electronegativity
    organic ? organicSortValue : electronegativeSortValue);

    // grab our formula out
    const formula = ChemUtils.createSymbolWithoutSubscripts(sortedElements);

    // return the formula, unless it is in our exception list (in which case, handle the exception case)
    return MoleculeStructure.formulaExceptions[formula] || formula;
  }

  /**
   * Use the above general molecular formula, but return it with HTML subscripts
   *
   * @public
   * @returns {string} Molecular formula with HTML subscripts
   */
  getGeneralFormulaFragment() {
    return ChemUtils.toSubscript(this.getGeneralFormula());
  }

  /**
   * @param {Atom} atom
   *
   * @public
   * @returns {Atom} All neighboring atoms that are connected by bonds to the passed in atom
   */
  getNeighbors(atom) {
    return _.map(this.getBondsInvolving(atom), bond => {
      return bond.getOtherAtom(atom);
    });
  }

  /**
   * @public
   *
   * @returns {number}
   */
  getApproximateMolecularWeight() {
    // sum the atomic weights
    return _.reduce(this.atoms, (memo, atom) => {
      return memo + atom.atomicWeight;
    }, 0);
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  isValid() {
    return !this.hasWeirdHydrogenProperties() && !this.hasLoopsOrIsDisconnected();
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  hasWeirdHydrogenProperties() {
    // check for hydrogens that are bonded to more than 1 atom
    const length = this.atoms.length;
    for (let i = 0; i < length; i++) {
      const atom = this.atoms[i];
      if (atom.isHydrogen() && this.getNeighbors(atom).length > 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * @public
   *
   * @returns {boolean}
   */
  hasLoopsOrIsDisconnected() {
    // Note: (performance) consider HashSet, or something that has a fast contains lookup
    const visitedAtoms = [];
    const dirtyAtoms = [];

    // pull one atom out. doesn't matter which one
    dirtyAtoms.push(this.atoms[0]);
    while (dirtyAtoms.length > 0) {
      // while atoms are dirty, pull one out
      const atom = dirtyAtoms.pop();

      // for each neighbor, make 'unvisited' atoms dirty and count 'visited' atoms
      let visitedCount = 0;
      this.getNeighbors(atom).forEach(otherAtom => {
        if (_.includes(visitedAtoms, otherAtom)) {
          visitedCount += 1;
        } else {
          dirtyAtoms.push(otherAtom);
        }
      });

      // if a dirty atom has two visited neighbors, it means there was a loop somewhere
      if (visitedCount > 1) {
        return true;
      }

      // move our atom from dirty to visited
      _.remove(dirtyAtoms, item => {
        return item === atom ? atom : null;
      });
      visitedAtoms.push(atom);
    }

    // since it has no loops, now we check to see if we reached all atoms. if not, the molecule must not be connected
    return visitedAtoms.length !== this.atoms.length;
  }

  /**
   * Checks if this element is within the molecule structure
   * @param {Element} element
   *
   * @private
   * @returns {boolean}
   */
  containsElement(element) {
    return _.some(this.atoms, atom => atom.element === element);
  }

  /**
   * Retrieves bonds between atoms a and b
   *
   * @param {Atom} a
   * @param {Atom} b
   * @public
   *
   * @returns {Bond}
   */
  getBond(a, b) {
    const result = _.find(this.bonds, bond => {
      return bond.contains(a) && bond.contains(b);
    });
    assert && assert(result, 'Could not find bond!');
    return result;
  }

  /**
   * @public
   * @returns {ElementHistogram}
   */
  getHistogram() {
    return new ElementHistogram(this);
  }

  /**
   * Return a copy of the molecule structure based on its bonds and atoms
   * @private
   * @returns {MoleculeStructure}
   */
  copy() {
    const result = new MoleculeStructure(this.atoms.length, this.bonds.length);
    this.atoms.forEach(result.addAtom.bind(result));
    this.bonds.forEach(result.addBond.bind(result));
    return result;
  }

  /**
   * Return a copy of the molecule structure with a specific atom removed
   * @param {Atom} atomToRemove
   *
   * @public
   * @returns {MoleculeStructure}
   */
  getCopyWithAtomRemoved(atomToRemove) {
    const result = new MoleculeStructure(this.atoms.length - 1, 12); // default to 12 bonds, probably more?
    this.atoms.forEach(atom => {
      if (atom !== atomToRemove) {
        result.addAtom(atom);
      }
    });
    this.bonds.forEach(bond => {
      if (!bond.contains(atomToRemove)) {
        result.addBond(bond);
      }
    });
    return result;
  }

  /**
   * Check whether the molecular structure is equivalent to another structure. Not terribly efficient, and will
   * probably fail for cyclic graphs.
   *
   *
   * @param {MoleculeStructure} other - Another molecular structure
   * @public
   *
   * @returns {boolean} True, if there is an isomorphism between the two molecular structures
   */
  isEquivalent(other) {
    if (this === other) {
      // same instance
      return true;
    }
    if (this.atoms.length !== other.atoms.length) {
      // must have same number of atoms
      return false;
    }
    if (!this.getHistogram().equals(other.getHistogram())) {
      // different molecular formula
      return false;
    }

    // Note: (performance) sets instead of arrays here?
    const myVisited = [];
    const otherVisited = [];
    const firstAtom = this.atoms[0]; // grab the 1st atom
    const length = other.atoms.length;
    for (let i = 0; i < length; i++) {
      const otherAtom = other.atoms[i];
      if (this.checkEquivalency(other, myVisited, otherVisited, firstAtom, otherAtom)) {
        // we found an isomorphism with firstAtom => otherAtom
        return true;
      }
    }
    return false;
  }

  /**
   * @param {Atom} atom
   * @param {Array.<Atom2>} exclusionSet: A set of atoms that should not be in the return value
   * @public
   *
   * @returns {Array.<Atom>} All neighboring atoms that are connected by bonds to the passed in atom AND aren't in the exclusionSet
   */
  getNeighborsNotInSet(atom, exclusionSet) {
    // Note: (performance) hashset with fast lookup?
    return _.filter(this.getNeighbors(atom), otherAtom => {
      return !_.includes(exclusionSet, otherAtom);
    });
  }

  /**
   * @param {MoleculeStructure} other
   * @param {Array.<Atom2>} myVisited
   * @param {Array.<Atom2>} otherVisited
   * @param {Atom} myAtom
   * @param {Atom} otherAtom
   * @public
   *
   * @returns {boolean}
   */
  checkEquivalency(other, myVisited, otherVisited, myAtom, otherAtom) {
    // basically this checks whether two different sub-trees of two different molecules are 'equivalent'

    // ------- If you change this, also consider the similar code in StrippedMolecule

    if (!myAtom.hasSameElement(otherAtom)) {
      // if the atoms are of different types, bail. subtrees can't possibly be equivalent
      return false;
    }
    const myUnvisitedNeighbors = this.getNeighborsNotInSet(myAtom, myVisited);
    const otherUnvisitedNeighbors = other.getNeighborsNotInSet(otherAtom, otherVisited);
    if (myUnvisitedNeighbors.length !== otherUnvisitedNeighbors.length) {
      return false;
    }
    if (myUnvisitedNeighbors.length === 0) {
      // no more unmatched atoms
      return true;
    }
    const size = myUnvisitedNeighbors.length;

    // for now, add visiting atoms to the visited set. we NEED to revert this before returning!
    myVisited.push(myAtom);
    otherVisited.push(otherAtom);

    /*
     equivalency matrix. each entry is basically whether the subtree in the direction of the 'my' atom is
     equivalent to the subtree in the direction of the 'other' atom, for all possible my and other atoms
     */
    const equivalences = new Array(size * size); // booleans

    // keep track of available indices for the following matrix equivalency check
    const availableIndices = [];

    // for the love of god, this matrix is NOT symmetric. It computes whether each tree branch for A is equivalent to each tree branch for B
    for (let myIndex = 0; myIndex < size; myIndex++) {
      availableIndices.push(myIndex);
      for (let otherIndex = 0; otherIndex < size; otherIndex++) {
        equivalences[myIndex * size + otherIndex] = this.checkEquivalency(other, myVisited, otherVisited, myUnvisitedNeighbors[myIndex], otherUnvisitedNeighbors[otherIndex]);
      }
    }

    // remove the atoms from the visited sets, to hold our contract
    _.remove(myVisited, item => {
      return item === myAtom ? myAtom : null;
    });
    _.remove(otherVisited, item => {
      return item === otherAtom ? otherAtom : null;
    });

    // return whether we can find a successful permutation matching from our equivalency matrix
    return MoleculeStructure.checkEquivalencyMatrix(equivalences, 0, availableIndices, size);
  }

  /**
   * @public
   *
   * @returns {Array.<Element>}
   */
  getElementList() {
    // return defensive copy. if that is changed, examine all usages
    return _.map(this.atoms, atom => atom.element);
  }

  /*---------------------------------------------------------------------------*
   * serialization and parsing
   *----------------------------------------------------------------------------*/

  /**
   * A serialized form of this structure. It is |-separated tokens, with the format:
   *         atom quantity
   *         bond quantity
   *         for each atom, it's symbol
   *         for each bond, two zero-indexed indices of atoms above
   * @private
   *
   * @returns [string]
   */
  toSerial() {
    let ret = `${this.atoms.length}|${this.bonds.length}`;
    this.atoms.forEach(atom => {
      ret += `|${atom.symbol}`;
    });
    this.bonds.forEach(bond => {
      const a = this.atoms.indexOf(bond.a);
      const b = this.atoms.indexOf(bond.b);
      ret += `|${a}|${b}`;
    });
    return ret;
  }

  /**
   * Format description, '|' is literal
   *
   * line = numAtoms|numBonds(|atomBondSpec)*
   * atomBondSpec = atomSpec(,bondSpec)*
   * atomSpec --- determined by implementation of atom. does not contain '|' or ','
   * bondSpec --- determined by implementation of bond. does not contain '|' or ','
   * @public
   *
   * @returns
   */
  toSerial2() {
    let result = '';

    // serializing and the following builder appends are not a performance bottleneck. they are left in a more readable form
    // write header: # of atoms
    result += `${this.atoms.length}|${this.bonds.length}`;
    for (let i = 0; i < this.atoms.length; i++) {
      const atom = this.atoms[i];
      result += `|${atom.toString()}`;
      this.bonds.forEach(bond => {
        if (bond.contains(atom)) {
          const otherAtom = bond.getOtherAtom(atom);
          const index = this.atoms.indexOf(otherAtom);
          if (index < i) {
            result += `,${bond.toSerial2(index)}`;
          }
        }
      });
    }
    return result;
  }

  /**
   * Combines molecules together by bonding their atoms A and B
   *
   * @param {MoleculeStructure} molA   Molecule A
   * @param {MoleculeStructure} molB   Molecule B
   * @param {Atom}              a      Atom A
   * @param {Atom}              b      Atom B
   * @param {MoleculeStructure} result An empty molecule to fill
   *
   * @public
   * @returns {MoleculeStructure} A completely new molecule with all atoms in A and B, where atom A is joined to atom B
   */
  static getCombinedMoleculeFromBond(molA, molB, a, b, result) {
    molA.atoms.forEach(atom => {
      result.addAtom(atom);
    });
    molB.atoms.forEach(atom => {
      result.addAtom(atom);
    });
    molA.bonds.forEach(bond => {
      result.addBond(bond);
    });
    molB.bonds.forEach(bond => {
      result.addBond(bond);
    });
    result.addBond(new Bond(a, b));
    return result;
  }

  /**
   * Split a bond in a molecule, and return the remaining molecule structure(s)
   * @param {MoleculeStructure} structure The molecule
   * @param {Bond}              bond      The bond to break
   * @param {MoleculeStructure} molA      An empty molecule for the 1st broken part
   * @param {MoleculeStructure} molB      An empty molecule for the 2nd broken part
   *
   * @public
   * @returns {Array.<MoleculeStructure>}   A list of remaining structures
   */
  static getMoleculesFromBrokenBond(structure, bond, molA, molB) {
    // NOTE: in the future when we have loops, we can't assume that this will break a molecule into two separate molecules!

    /*---------------------------------------------------------------------------*
     * separate out which atoms belong in which remaining molecule
     *----------------------------------------------------------------------------*/

    // Note: (performance) use sets for fast insertion, removal, and querying, wherever necessary in this function
    const atomsInA = [bond.a];

    // atoms left after removing atoms
    const remainingAtoms = structure.atoms.slice();
    _.remove(remainingAtoms, item => {
      return item === bond.a ? bond.a : null;
    });
    const dirtyAtoms = [bond.a];
    while (dirtyAtoms.length > 0) {
      const atom = dirtyAtoms.pop();
      _.remove(dirtyAtoms, item => {
        return item === atom ? atom : null;
      });

      // for all neighbors that don't use our 'bond'
      structure.bonds.forEach(otherBond => {
        if (otherBond !== bond && otherBond.contains(atom)) {
          const neighbor = otherBond.getOtherAtom(atom);

          // pick out our neighbor, mark it as in 'A', and mark it as dirty so we can process its neighbors
          if (_.includes(remainingAtoms, neighbor)) {
            _.remove(remainingAtoms, item => {
              return item === neighbor ? neighbor : null;
            });
            dirtyAtoms.push(neighbor);
            atomsInA.push(neighbor);
          }
        }
      });
    }

    /*---------------------------------------------------------------------------*
     * construct our two molecules
     *----------------------------------------------------------------------------*/

    structure.atoms.forEach(atom => {
      if (_.includes(atomsInA, atom)) {
        molA.addAtom(atom);
      } else {
        molB.addAtom(atom);
      }
    });
    structure.bonds.forEach(otherBond => {
      if (otherBond !== bond) {
        if (_.includes(atomsInA, otherBond.a)) {
          assert && assert(_.includes(atomsInA, otherBond.b));
          molA.addBond(otherBond);
        } else {
          molB.addBond(otherBond);
        }
      }
    });
    if (BAMQueryParameters.logData) {
      console.log(`splitting ${structure.toSerial()} into:`);
      console.log(molA.toSerial());
      console.log(molB.toSerial());
    }
    // return our two molecules
    return [molA, molB];
  }

  /**
   * Given a matrix of equivalencies, can we find a permutation of the 'other' atoms that are equivalent to
   * their respective 'my' atoms?
   *
   * NOTE: equivalency matrices are stored in row-major format (compared to the Java version)
   *
   * @param {Array.<boolean>} equivalences          Equivalence Matrix, square!, row-major (stored as one boolean array)
   * @param {number}          myIndex               Index for the row (index into our atoms). calls with myIndex + 1 to children
   * @param {Array.<number>}  otherRemainingIndices Remaining available 'other' indices
   * @param {number}          size                  This square matrix is size x size in dimensions
   *
   * @public
   * @returns {boolean} Whether a successful matching permutation was found
   */
  static checkEquivalencyMatrix(equivalences, myIndex, otherRemainingIndices, size) {
    // var size = Math.sqrt( equivalences.length ); // it's square, so this technically works
    // Note: (performance) this should leak memory in un-fun ways, and performance complexity should be sped up

    // should be inefficient, but not too bad (computational complexity is not optimal)
    const arr = otherRemainingIndices.slice();
    const len = arr.length;
    for (let i = 0; i < len; i++) {
      // loop over all remaining others
      const otherIndex = arr[i];
      if (equivalences[myIndex * size + otherIndex]) {
        // only follow path if it is true (equivalent)

        // remove the index from consideration for checking the following submatrix
        otherRemainingIndices.splice(otherRemainingIndices.indexOf(otherIndex), 1);
        const success = myIndex === size - 1 ||
        // there are no more permutations to check
        MoleculeStructure.checkEquivalencyMatrix(equivalences, myIndex + 1, otherRemainingIndices, size); // or we can find a good combination of the remaining indices

        // add it back in so the calling function's contract for otherRemainingIndices is satisfied
        otherRemainingIndices.push(otherIndex);
        if (success) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Deserialize a molecule structure
   * @param {string}            line              The data (string) to deserialize
   * @param {MoleculeGenerator} moleculeGenerator function( atomCount, bondCount ):MoleculeStructure. Creates a molecule with properties that we can fill with atoms/bonds
   * @param {AtomParser}        atomParser        function( atomString ):Atom. Creates an atom from a string representing an atom
   * @param {BondParser}        bondParser        function( bondString, connectedAtom, moleculeStructure ):Bond. Creates a bond from a string representing a bond
   *
   * @public
   * @returns {MoleculeStructure} A constructed molecule
   */
  static fromSerial2(line, moleculeGenerator, atomParser, bondParser) {
    const tokens = line.split('|');
    let idx = 0;
    const atomCount = Number(tokens[idx++]);
    const bondCount = Number(tokens[idx++]);
    const molecule = moleculeGenerator(atomCount, bondCount);
    for (let i = 0; i < atomCount; i++) {
      const atomBondString = tokens[idx++];
      let subIdx = 0;
      const subTokens = atomBondString.split(',');
      const atom = atomParser(subTokens[subIdx++]);
      molecule.addAtom(atom);
      while (subIdx < subTokens.length) {
        const bond = bondParser(subTokens[subIdx++], atom, molecule);
        molecule.addBond(bond);
      }
    }
    return molecule;
  }

  /**
   * @param {string} line - The data (string) to deserialize
   *
   * @public
   * @returns {MoleculeStructure}
   */
  static fromSerial2Basic(line) {
    // assumes atom base class (just symbol) and simple bonds (just connectivity)
    return MoleculeStructure.fromSerial2(line, MoleculeStructure.defaultMoleculeGenerator, MoleculeStructure.defaultAtomParser, MoleculeStructure.defaultBondParser);
  }

  /**
   * @param {number} atomCount
   * @param {number} bondCount
   *
   * @private
   * @returns {MoleculeStructure}
   */
  static defaultMoleculeGenerator(atomCount, bondCount) {
    return new MoleculeStructure(atomCount, bondCount);
  }

  /**
   * @param {string} atomString
   *
   * @private
   * @returns {Atom}
   */
  static defaultAtomParser(atomString) {
    // atomString is an element symbol
    return new Atom(Element.getElementBySymbol(atomString));
  }

  /**
   * @param {string} bondString
   * @param {Atom} connectedAtom
   * @param {MoleculeStructure} moleculeStructure
   *
   * @private
   * @returns {Bond}
   */
  static defaultBondParser(bondString, connectedAtom, moleculeStructure) {
    // bondString is index of other atom to bond
    return new Bond(connectedAtom, moleculeStructure.atoms[Number(bondString)]);
  }

  // @private {Object}
  static formulaExceptions() {
    return {
      H3N: 'NH3',
      // treated as if it is organic
      CHN: 'HCN' // not considered organic
    };
  }
}

buildAMolecule.register('MoleculeStructure', MoleculeStructure);
export default MoleculeStructure;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdG9tIiwiQ2hlbVV0aWxzIiwiRWxlbWVudCIsImJ1aWxkQU1vbGVjdWxlIiwiQkFNUXVlcnlQYXJhbWV0ZXJzIiwiQm9uZCIsIkVsZW1lbnRIaXN0b2dyYW0iLCJuZXh0TW9sZWN1bGVJZCIsIk1vbGVjdWxlU3RydWN0dXJlIiwiY29uc3RydWN0b3IiLCJudW1BdG9tcyIsIm51bUJvbmRzIiwibW9sZWN1bGVJZCIsImF0b21zIiwiYm9uZHMiLCJhZGRBdG9tIiwiYXRvbSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsInB1c2giLCJhZGRCb25kIiwiYm9uZCIsImEiLCJiIiwiZ2V0Qm9uZHNJbnZvbHZpbmciLCJmaWx0ZXIiLCJjb250YWlucyIsImdldEhpbGxTeXN0ZW1Gb3JtdWxhRnJhZ21lbnQiLCJoaWxsT3JkZXJlZFN5bWJvbCIsImdldEVsZW1lbnRMaXN0IiwiZ2V0R2VuZXJhbEZvcm11bGEiLCJjb250YWluc0NhcmJvbiIsImNvbnRhaW5zRWxlbWVudCIsIkMiLCJjb250YWluc0h5ZHJvZ2VuIiwiSCIsIm9yZ2FuaWMiLCJlbGVjdHJvbmVnYXRpdmVTb3J0VmFsdWUiLCJlbGVtZW50IiwiZWxlY3Ryb25lZ2F0aXZpdHkiLCJhbHBoYWJldGljU29ydFZhbHVlIiwidmFsdWUiLCJzeW1ib2wiLCJjaGFyQ29kZUF0IiwibGVuZ3RoIiwib3JnYW5pY1NvcnRWYWx1ZSIsImlzQ2FyYm9uIiwiaXNIeWRyb2dlbiIsInNvcnRlZEVsZW1lbnRzIiwic29ydEJ5IiwiZm9ybXVsYSIsImNyZWF0ZVN5bWJvbFdpdGhvdXRTdWJzY3JpcHRzIiwiZm9ybXVsYUV4Y2VwdGlvbnMiLCJnZXRHZW5lcmFsRm9ybXVsYUZyYWdtZW50IiwidG9TdWJzY3JpcHQiLCJnZXROZWlnaGJvcnMiLCJtYXAiLCJnZXRPdGhlckF0b20iLCJnZXRBcHByb3hpbWF0ZU1vbGVjdWxhcldlaWdodCIsInJlZHVjZSIsIm1lbW8iLCJhdG9taWNXZWlnaHQiLCJpc1ZhbGlkIiwiaGFzV2VpcmRIeWRyb2dlblByb3BlcnRpZXMiLCJoYXNMb29wc09ySXNEaXNjb25uZWN0ZWQiLCJpIiwidmlzaXRlZEF0b21zIiwiZGlydHlBdG9tcyIsInBvcCIsInZpc2l0ZWRDb3VudCIsImZvckVhY2giLCJvdGhlckF0b20iLCJyZW1vdmUiLCJpdGVtIiwic29tZSIsImdldEJvbmQiLCJyZXN1bHQiLCJmaW5kIiwiZ2V0SGlzdG9ncmFtIiwiY29weSIsImJpbmQiLCJnZXRDb3B5V2l0aEF0b21SZW1vdmVkIiwiYXRvbVRvUmVtb3ZlIiwiaXNFcXVpdmFsZW50Iiwib3RoZXIiLCJlcXVhbHMiLCJteVZpc2l0ZWQiLCJvdGhlclZpc2l0ZWQiLCJmaXJzdEF0b20iLCJjaGVja0VxdWl2YWxlbmN5IiwiZ2V0TmVpZ2hib3JzTm90SW5TZXQiLCJleGNsdXNpb25TZXQiLCJteUF0b20iLCJoYXNTYW1lRWxlbWVudCIsIm15VW52aXNpdGVkTmVpZ2hib3JzIiwib3RoZXJVbnZpc2l0ZWROZWlnaGJvcnMiLCJzaXplIiwiZXF1aXZhbGVuY2VzIiwiQXJyYXkiLCJhdmFpbGFibGVJbmRpY2VzIiwibXlJbmRleCIsIm90aGVySW5kZXgiLCJjaGVja0VxdWl2YWxlbmN5TWF0cml4IiwidG9TZXJpYWwiLCJyZXQiLCJpbmRleE9mIiwidG9TZXJpYWwyIiwidG9TdHJpbmciLCJpbmRleCIsImdldENvbWJpbmVkTW9sZWN1bGVGcm9tQm9uZCIsIm1vbEEiLCJtb2xCIiwiZ2V0TW9sZWN1bGVzRnJvbUJyb2tlbkJvbmQiLCJzdHJ1Y3R1cmUiLCJhdG9tc0luQSIsInJlbWFpbmluZ0F0b21zIiwic2xpY2UiLCJvdGhlckJvbmQiLCJuZWlnaGJvciIsImxvZ0RhdGEiLCJjb25zb2xlIiwibG9nIiwib3RoZXJSZW1haW5pbmdJbmRpY2VzIiwiYXJyIiwibGVuIiwic3BsaWNlIiwic3VjY2VzcyIsImZyb21TZXJpYWwyIiwibGluZSIsIm1vbGVjdWxlR2VuZXJhdG9yIiwiYXRvbVBhcnNlciIsImJvbmRQYXJzZXIiLCJ0b2tlbnMiLCJzcGxpdCIsImlkeCIsImF0b21Db3VudCIsIk51bWJlciIsImJvbmRDb3VudCIsIm1vbGVjdWxlIiwiYXRvbUJvbmRTdHJpbmciLCJzdWJJZHgiLCJzdWJUb2tlbnMiLCJmcm9tU2VyaWFsMkJhc2ljIiwiZGVmYXVsdE1vbGVjdWxlR2VuZXJhdG9yIiwiZGVmYXVsdEF0b21QYXJzZXIiLCJkZWZhdWx0Qm9uZFBhcnNlciIsImF0b21TdHJpbmciLCJnZXRFbGVtZW50QnlTeW1ib2wiLCJib25kU3RyaW5nIiwiY29ubmVjdGVkQXRvbSIsIm1vbGVjdWxlU3RydWN0dXJlIiwiSDNOIiwiQ0hOIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb2xlY3VsZVN0cnVjdHVyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgZ2VuZXJhbCBtb2xlY3VsYXIgc3RydWN0dXJlICh3aXRob3V0IHBvc2l0aW9uIG9yIGluc3RhbmNlIGluZm9ybWF0aW9uKS5cclxuICpcclxuICogR2VuZXJpY3MgZm9yIHRoZSBhdG9tIHR5cGUgc2lnbmlmaWNhbnRseSBzaW1wbGlmeSBhIGxvdCBvZiBvdGhlciBjb2RlIHRoYXQgd291bGQgbmVlZFxyXG4gKiBlaXRoZXIgZXhwbGljaXQgY2FzdGluZyBvciB3cmFwcGVyIGZ1bmN0aW9ucy5cclxuICpcclxuICogTm90ZTogZXF1aXZhbGVuY3kgbWF0cmljZXMgYXJlIHN0b3JlZCBpbiByb3ctbWFqb3IgZm9ybWF0IChjb21wYXJlZCB0byB0aGUgSmF2YSB2ZXJzaW9uKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBBdG9tIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvQXRvbS5qcyc7XHJcbmltcG9ydCBDaGVtVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9DaGVtVXRpbHMuanMnO1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL0VsZW1lbnQuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQkFNUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0JBTVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCb25kIGZyb20gJy4vQm9uZC5qcyc7XHJcbmltcG9ydCBFbGVtZW50SGlzdG9ncmFtIGZyb20gJy4vRWxlbWVudEhpc3RvZ3JhbS5qcyc7XHJcblxyXG5sZXQgbmV4dE1vbGVjdWxlSWQgPSAwO1xyXG5cclxuY2xhc3MgTW9sZWN1bGVTdHJ1Y3R1cmUge1xyXG4gIC8vIE5PVEUgZnJvbSBwb3J0aW5nOiBTdHJpcHBlZE1vbGVjdWxlIHJlbGllcyBvbiB0aGUgb3JkZXJpbmcgb2YgYXRvbXMsIGFuZCBwb3NzaWJseSBib25kcyBmb3IgZWZmaWNpZW5jeSBpbiBjaGVja2luZ1xyXG4gIC8vIGVxdWl2YWxlbmNpZXMuIEFsc28gdG8gbWFrZSBzdXJlIG1vbGVjdWxlIHNlcGFyYXRpb24gaXNuJ3QgZHVwbGljYXRlZCBvbiB0aGUgc2FtZSBtb2xlY3VsZSBwYWlyLlxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbbnVtQXRvbXNdXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtudW1Cb25kc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtQXRvbXMsIG51bUJvbmRzICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMubW9sZWN1bGVJZCA9IG5leHRNb2xlY3VsZUlkKys7IC8vIHVzZWQgZm9yIG1vbGVjdWxlIGlkZW50aWZpY2F0aW9uIGFuZCBvcmRlcmluZyBmb3Igb3B0aW1pemF0aW9uXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEF0b20+fVxyXG4gICAgdGhpcy5hdG9tcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxCb25kPn1cclxuICAgIHRoaXMuYm9uZHMgPSBbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhdG9tIHRvIHRoZSBtb2xlY3VsZSBzdHJ1Y3R1cmVcclxuICAgKiBAcGFyYW0ge0F0b219IGF0b21cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7QXRvbX1cclxuICAgKi9cclxuICBhZGRBdG9tKCBhdG9tICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIHRoaXMuYXRvbXMsIGF0b20gKSwgJ0Nhbm5vdCBhZGQgYW4gYWxyZWFkeSBleGlzdGluZyBhdG9tJyApO1xyXG4gICAgdGhpcy5hdG9tcy5wdXNoKCBhdG9tICk7IC8vIE5PVEU6IGRvbid0IG1lc3Mgd2l0aCB0aGUgb3JkZXJcclxuICAgIHJldHVybiBhdG9tO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgYm9uZCB0byB0aGUgbW9sZWN1bGUgc3RydWN0dXJlXHJcbiAgICogQHBhcmFtIHtCb25kfSBib25kXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkQm9uZCggYm9uZCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMuYXRvbXMsIGJvbmQuYSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCB0aGlzLmF0b21zLCBib25kLmIgKSApO1xyXG4gICAgdGhpcy5ib25kcy5wdXNoKCBib25kICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gdGhlIGJvbmRzIGNvbm5lY3RlZCB0byBhIHNwZWNpZmljIGF0b21cclxuICAgKiBAcGFyYW0ge0F0b219IGF0b21cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge0FycmF5LjxCb25kPn1cclxuICAgKi9cclxuICBnZXRCb25kc0ludm9sdmluZyggYXRvbSApIHtcclxuICAgIC8vIE5vdGU6IChwZXJmb3JtYW5jZSkgb3B0aW1pemUgb3V0IGZ1bmN0aW9uIGFsbG9jYXRpb24gaGVyZT9cclxuICAgIHJldHVybiBfLmZpbHRlciggdGhpcy5ib25kcywgYm9uZCA9PiB7XHJcbiAgICAgIHJldHVybiBib25kLmNvbnRhaW5zKCBhdG9tICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEhpbGxTeXN0ZW1Gb3JtdWxhRnJhZ21lbnQoKSB7XHJcbiAgICByZXR1cm4gQ2hlbVV0aWxzLmhpbGxPcmRlcmVkU3ltYm9sKCB0aGlzLmdldEVsZW1lbnRMaXN0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE91ciBiZXN0IGF0dGVtcHQgYXQgZ2V0dGluZyBhIGdlbmVyYWwgbW9sZWN1bGFyIG5hbWluZyBhbGdvcml0aG0gdGhhdCBoYW5kbGVzIG9yZ2FuaWMgYW5kIG5vbi1vcmdhbmljIGNvbXBvdW5kcy5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRleHQgd2hpY2ggaXMgdGhlIG1vbGVjdWxhciBmb3JtdWxhXHJcbiAgICovXHJcbiAgZ2V0R2VuZXJhbEZvcm11bGEoKSB7XHJcbiAgICBjb25zdCBjb250YWluc0NhcmJvbiA9IHRoaXMuY29udGFpbnNFbGVtZW50KCBFbGVtZW50LkMgKTtcclxuICAgIGNvbnN0IGNvbnRhaW5zSHlkcm9nZW4gPSB0aGlzLmNvbnRhaW5zRWxlbWVudCggRWxlbWVudC5IICk7XHJcblxyXG4gICAgY29uc3Qgb3JnYW5pYyA9IGNvbnRhaW5zQ2FyYm9uICYmIGNvbnRhaW5zSHlkcm9nZW47XHJcblxyXG4gICAgY29uc3QgZWxlY3Ryb25lZ2F0aXZlU29ydFZhbHVlID0gZWxlbWVudCA9PiB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50LmVsZWN0cm9uZWdhdGl2aXR5O1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBhbHBoYWJldGljU29ydFZhbHVlID0gZWxlbWVudCA9PiB7XHJcbiAgICAgIGxldCB2YWx1ZSA9IDEwMDAgKiBlbGVtZW50LnN5bWJvbC5jaGFyQ29kZUF0KCAwICk7XHJcbiAgICAgIGlmICggZWxlbWVudC5zeW1ib2wubGVuZ3RoID4gMSApIHtcclxuICAgICAgICB2YWx1ZSArPSBlbGVtZW50LnN5bWJvbC5jaGFyQ29kZUF0KCAxICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBvcmdhbmljU29ydFZhbHVlID0gZWxlbWVudCA9PiB7XHJcbiAgICAgIGlmICggZWxlbWVudC5pc0NhcmJvbigpICkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50LmlzSHlkcm9nZW4oKSApIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gYWxwaGFiZXRpY1NvcnRWYWx1ZSggZWxlbWVudCApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHNvcnRlZEVsZW1lbnRzID0gXy5zb3J0QnkoXHJcbiAgICAgIHRoaXMuZ2V0RWxlbWVudExpc3QoKSxcclxuXHJcbiAgICAgIC8vIGNhcmJvbiBmaXJzdCwgdGhlbiBoeWRyb2dlbiwgdGhlbiBvdGhlcnMgYWxwaGFiZXRpY2FsbHksIG90aGVyd2lzZSBzb3J0IGJ5IGluY3JlYXNpbmcgZWxlY3Ryb25lZ2F0aXZpdHlcclxuICAgICAgb3JnYW5pYyA/IG9yZ2FuaWNTb3J0VmFsdWUgOiBlbGVjdHJvbmVnYXRpdmVTb3J0VmFsdWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gZ3JhYiBvdXIgZm9ybXVsYSBvdXRcclxuICAgIGNvbnN0IGZvcm11bGEgPSBDaGVtVXRpbHMuY3JlYXRlU3ltYm9sV2l0aG91dFN1YnNjcmlwdHMoIHNvcnRlZEVsZW1lbnRzICk7XHJcblxyXG4gICAgLy8gcmV0dXJuIHRoZSBmb3JtdWxhLCB1bmxlc3MgaXQgaXMgaW4gb3VyIGV4Y2VwdGlvbiBsaXN0IChpbiB3aGljaCBjYXNlLCBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBjYXNlKVxyXG4gICAgcmV0dXJuIE1vbGVjdWxlU3RydWN0dXJlLmZvcm11bGFFeGNlcHRpb25zWyBmb3JtdWxhIF0gfHwgZm9ybXVsYTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBVc2UgdGhlIGFib3ZlIGdlbmVyYWwgbW9sZWN1bGFyIGZvcm11bGEsIGJ1dCByZXR1cm4gaXQgd2l0aCBIVE1MIHN1YnNjcmlwdHNcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBNb2xlY3VsYXIgZm9ybXVsYSB3aXRoIEhUTUwgc3Vic2NyaXB0c1xyXG4gICAqL1xyXG4gIGdldEdlbmVyYWxGb3JtdWxhRnJhZ21lbnQoKSB7XHJcbiAgICByZXR1cm4gQ2hlbVV0aWxzLnRvU3Vic2NyaXB0KCB0aGlzLmdldEdlbmVyYWxGb3JtdWxhKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYXRvbVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtBdG9tfSBBbGwgbmVpZ2hib3JpbmcgYXRvbXMgdGhhdCBhcmUgY29ubmVjdGVkIGJ5IGJvbmRzIHRvIHRoZSBwYXNzZWQgaW4gYXRvbVxyXG4gICAqL1xyXG4gIGdldE5laWdoYm9ycyggYXRvbSApIHtcclxuICAgIHJldHVybiBfLm1hcCggdGhpcy5nZXRCb25kc0ludm9sdmluZyggYXRvbSApLCBib25kID0+IHtcclxuICAgICAgcmV0dXJuIGJvbmQuZ2V0T3RoZXJBdG9tKCBhdG9tICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEFwcHJveGltYXRlTW9sZWN1bGFyV2VpZ2h0KCkge1xyXG4gICAgLy8gc3VtIHRoZSBhdG9taWMgd2VpZ2h0c1xyXG4gICAgcmV0dXJuIF8ucmVkdWNlKCB0aGlzLmF0b21zLCAoIG1lbW8sIGF0b20gKSA9PiB7XHJcbiAgICAgIHJldHVybiBtZW1vICsgYXRvbS5hdG9taWNXZWlnaHQ7XHJcbiAgICB9LCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1ZhbGlkKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLmhhc1dlaXJkSHlkcm9nZW5Qcm9wZXJ0aWVzKCkgJiYgIXRoaXMuaGFzTG9vcHNPcklzRGlzY29ubmVjdGVkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNXZWlyZEh5ZHJvZ2VuUHJvcGVydGllcygpIHtcclxuICAgIC8vIGNoZWNrIGZvciBoeWRyb2dlbnMgdGhhdCBhcmUgYm9uZGVkIHRvIG1vcmUgdGhhbiAxIGF0b21cclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuYXRvbXMubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGF0b20gPSB0aGlzLmF0b21zWyBpIF07XHJcbiAgICAgIGlmICggYXRvbS5pc0h5ZHJvZ2VuKCkgJiYgdGhpcy5nZXROZWlnaGJvcnMoIGF0b20gKS5sZW5ndGggPiAxICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBoYXNMb29wc09ySXNEaXNjb25uZWN0ZWQoKSB7XHJcbiAgICAvLyBOb3RlOiAocGVyZm9ybWFuY2UpIGNvbnNpZGVyIEhhc2hTZXQsIG9yIHNvbWV0aGluZyB0aGF0IGhhcyBhIGZhc3QgY29udGFpbnMgbG9va3VwXHJcbiAgICBjb25zdCB2aXNpdGVkQXRvbXMgPSBbXTtcclxuICAgIGNvbnN0IGRpcnR5QXRvbXMgPSBbXTtcclxuXHJcbiAgICAvLyBwdWxsIG9uZSBhdG9tIG91dC4gZG9lc24ndCBtYXR0ZXIgd2hpY2ggb25lXHJcbiAgICBkaXJ0eUF0b21zLnB1c2goIHRoaXMuYXRvbXNbIDAgXSApO1xyXG5cclxuICAgIHdoaWxlICggZGlydHlBdG9tcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAvLyB3aGlsZSBhdG9tcyBhcmUgZGlydHksIHB1bGwgb25lIG91dFxyXG4gICAgICBjb25zdCBhdG9tID0gZGlydHlBdG9tcy5wb3AoKTtcclxuXHJcbiAgICAgIC8vIGZvciBlYWNoIG5laWdoYm9yLCBtYWtlICd1bnZpc2l0ZWQnIGF0b21zIGRpcnR5IGFuZCBjb3VudCAndmlzaXRlZCcgYXRvbXNcclxuICAgICAgbGV0IHZpc2l0ZWRDb3VudCA9IDA7XHJcbiAgICAgIHRoaXMuZ2V0TmVpZ2hib3JzKCBhdG9tICkuZm9yRWFjaCggb3RoZXJBdG9tID0+IHtcclxuICAgICAgICBpZiAoIF8uaW5jbHVkZXMoIHZpc2l0ZWRBdG9tcywgb3RoZXJBdG9tICkgKSB7XHJcbiAgICAgICAgICB2aXNpdGVkQ291bnQgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkaXJ0eUF0b21zLnB1c2goIG90aGVyQXRvbSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gaWYgYSBkaXJ0eSBhdG9tIGhhcyB0d28gdmlzaXRlZCBuZWlnaGJvcnMsIGl0IG1lYW5zIHRoZXJlIHdhcyBhIGxvb3Agc29tZXdoZXJlXHJcbiAgICAgIGlmICggdmlzaXRlZENvdW50ID4gMSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbW92ZSBvdXIgYXRvbSBmcm9tIGRpcnR5IHRvIHZpc2l0ZWRcclxuICAgICAgXy5yZW1vdmUoIGRpcnR5QXRvbXMsIGl0ZW0gPT4ge1xyXG4gICAgICAgIHJldHVybiBpdGVtID09PSBhdG9tID8gYXRvbSA6IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdmlzaXRlZEF0b21zLnB1c2goIGF0b20gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzaW5jZSBpdCBoYXMgbm8gbG9vcHMsIG5vdyB3ZSBjaGVjayB0byBzZWUgaWYgd2UgcmVhY2hlZCBhbGwgYXRvbXMuIGlmIG5vdCwgdGhlIG1vbGVjdWxlIG11c3Qgbm90IGJlIGNvbm5lY3RlZFxyXG4gICAgcmV0dXJuIHZpc2l0ZWRBdG9tcy5sZW5ndGggIT09IHRoaXMuYXRvbXMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIHRoaXMgZWxlbWVudCBpcyB3aXRoaW4gdGhlIG1vbGVjdWxlIHN0cnVjdHVyZVxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBjb250YWluc0VsZW1lbnQoIGVsZW1lbnQgKSB7XHJcbiAgICByZXR1cm4gXy5zb21lKCB0aGlzLmF0b21zLCBhdG9tID0+IGF0b20uZWxlbWVudCA9PT0gZWxlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIGJvbmRzIGJldHdlZW4gYXRvbXMgYSBhbmQgYlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBdG9tfSBhXHJcbiAgICogQHBhcmFtIHtBdG9tfSBiXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge0JvbmR9XHJcbiAgICovXHJcbiAgZ2V0Qm9uZCggYSwgYiApIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IF8uZmluZCggdGhpcy5ib25kcywgYm9uZCA9PiB7XHJcbiAgICAgIHJldHVybiBib25kLmNvbnRhaW5zKCBhICkgJiYgYm9uZC5jb250YWlucyggYiApO1xyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0LCAnQ291bGQgbm90IGZpbmQgYm9uZCEnICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtFbGVtZW50SGlzdG9ncmFtfVxyXG4gICAqL1xyXG4gIGdldEhpc3RvZ3JhbSgpIHtcclxuICAgIHJldHVybiBuZXcgRWxlbWVudEhpc3RvZ3JhbSggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGEgY29weSBvZiB0aGUgbW9sZWN1bGUgc3RydWN0dXJlIGJhc2VkIG9uIGl0cyBib25kcyBhbmQgYXRvbXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtNb2xlY3VsZVN0cnVjdHVyZX1cclxuICAgKi9cclxuICBjb3B5KCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1vbGVjdWxlU3RydWN0dXJlKCB0aGlzLmF0b21zLmxlbmd0aCwgdGhpcy5ib25kcy5sZW5ndGggKTtcclxuICAgIHRoaXMuYXRvbXMuZm9yRWFjaCggcmVzdWx0LmFkZEF0b20uYmluZCggcmVzdWx0ICkgKTtcclxuICAgIHRoaXMuYm9uZHMuZm9yRWFjaCggcmVzdWx0LmFkZEJvbmQuYmluZCggcmVzdWx0ICkgKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJuIGEgY29weSBvZiB0aGUgbW9sZWN1bGUgc3RydWN0dXJlIHdpdGggYSBzcGVjaWZpYyBhdG9tIHJlbW92ZWRcclxuICAgKiBAcGFyYW0ge0F0b219IGF0b21Ub1JlbW92ZVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtNb2xlY3VsZVN0cnVjdHVyZX1cclxuICAgKi9cclxuICBnZXRDb3B5V2l0aEF0b21SZW1vdmVkKCBhdG9tVG9SZW1vdmUgKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTW9sZWN1bGVTdHJ1Y3R1cmUoIHRoaXMuYXRvbXMubGVuZ3RoIC0gMSwgMTIgKTsgLy8gZGVmYXVsdCB0byAxMiBib25kcywgcHJvYmFibHkgbW9yZT9cclxuICAgIHRoaXMuYXRvbXMuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIGlmICggYXRvbSAhPT0gYXRvbVRvUmVtb3ZlICkge1xyXG4gICAgICAgIHJlc3VsdC5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYm9uZHMuZm9yRWFjaCggYm9uZCA9PiB7XHJcbiAgICAgIGlmICggIWJvbmQuY29udGFpbnMoIGF0b21Ub1JlbW92ZSApICkge1xyXG4gICAgICAgIHJlc3VsdC5hZGRCb25kKCBib25kICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBtb2xlY3VsYXIgc3RydWN0dXJlIGlzIGVxdWl2YWxlbnQgdG8gYW5vdGhlciBzdHJ1Y3R1cmUuIE5vdCB0ZXJyaWJseSBlZmZpY2llbnQsIGFuZCB3aWxsXHJcbiAgICogcHJvYmFibHkgZmFpbCBmb3IgY3ljbGljIGdyYXBocy5cclxuICAgKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVN0cnVjdHVyZX0gb3RoZXIgLSBBbm90aGVyIG1vbGVjdWxhciBzdHJ1Y3R1cmVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSwgaWYgdGhlcmUgaXMgYW4gaXNvbW9ycGhpc20gYmV0d2VlbiB0aGUgdHdvIG1vbGVjdWxhciBzdHJ1Y3R1cmVzXHJcbiAgICovXHJcbiAgaXNFcXVpdmFsZW50KCBvdGhlciApIHtcclxuICAgIGlmICggdGhpcyA9PT0gb3RoZXIgKSB7XHJcbiAgICAgIC8vIHNhbWUgaW5zdGFuY2VcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuYXRvbXMubGVuZ3RoICE9PSBvdGhlci5hdG9tcy5sZW5ndGggKSB7XHJcbiAgICAgIC8vIG11c3QgaGF2ZSBzYW1lIG51bWJlciBvZiBhdG9tc1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoICF0aGlzLmdldEhpc3RvZ3JhbSgpLmVxdWFscyggb3RoZXIuZ2V0SGlzdG9ncmFtKCkgKSApIHtcclxuICAgICAgLy8gZGlmZmVyZW50IG1vbGVjdWxhciBmb3JtdWxhXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOb3RlOiAocGVyZm9ybWFuY2UpIHNldHMgaW5zdGVhZCBvZiBhcnJheXMgaGVyZT9cclxuICAgIGNvbnN0IG15VmlzaXRlZCA9IFtdO1xyXG4gICAgY29uc3Qgb3RoZXJWaXNpdGVkID0gW107XHJcbiAgICBjb25zdCBmaXJzdEF0b20gPSB0aGlzLmF0b21zWyAwIF07IC8vIGdyYWIgdGhlIDFzdCBhdG9tXHJcbiAgICBjb25zdCBsZW5ndGggPSBvdGhlci5hdG9tcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgb3RoZXJBdG9tID0gb3RoZXIuYXRvbXNbIGkgXTtcclxuICAgICAgaWYgKCB0aGlzLmNoZWNrRXF1aXZhbGVuY3koIG90aGVyLCBteVZpc2l0ZWQsIG90aGVyVmlzaXRlZCwgZmlyc3RBdG9tLCBvdGhlckF0b20gKSApIHtcclxuXHJcbiAgICAgICAgLy8gd2UgZm91bmQgYW4gaXNvbW9ycGhpc20gd2l0aCBmaXJzdEF0b20gPT4gb3RoZXJBdG9tXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYXRvbVxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEF0b20yPn0gZXhjbHVzaW9uU2V0OiBBIHNldCBvZiBhdG9tcyB0aGF0IHNob3VsZCBub3QgYmUgaW4gdGhlIHJldHVybiB2YWx1ZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48QXRvbT59IEFsbCBuZWlnaGJvcmluZyBhdG9tcyB0aGF0IGFyZSBjb25uZWN0ZWQgYnkgYm9uZHMgdG8gdGhlIHBhc3NlZCBpbiBhdG9tIEFORCBhcmVuJ3QgaW4gdGhlIGV4Y2x1c2lvblNldFxyXG4gICAqL1xyXG4gIGdldE5laWdoYm9yc05vdEluU2V0KCBhdG9tLCBleGNsdXNpb25TZXQgKSB7XHJcbiAgICAvLyBOb3RlOiAocGVyZm9ybWFuY2UpIGhhc2hzZXQgd2l0aCBmYXN0IGxvb2t1cD9cclxuICAgIHJldHVybiBfLmZpbHRlciggdGhpcy5nZXROZWlnaGJvcnMoIGF0b20gKSwgb3RoZXJBdG9tID0+IHtcclxuICAgICAgcmV0dXJuICFfLmluY2x1ZGVzKCBleGNsdXNpb25TZXQsIG90aGVyQXRvbSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVN0cnVjdHVyZX0gb3RoZXJcclxuICAgKiBAcGFyYW0ge0FycmF5LjxBdG9tMj59IG15VmlzaXRlZFxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEF0b20yPn0gb3RoZXJWaXNpdGVkXHJcbiAgICogQHBhcmFtIHtBdG9tfSBteUF0b21cclxuICAgKiBAcGFyYW0ge0F0b219IG90aGVyQXRvbVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNoZWNrRXF1aXZhbGVuY3koIG90aGVyLCBteVZpc2l0ZWQsIG90aGVyVmlzaXRlZCwgbXlBdG9tLCBvdGhlckF0b20gKSB7XHJcbiAgICAvLyBiYXNpY2FsbHkgdGhpcyBjaGVja3Mgd2hldGhlciB0d28gZGlmZmVyZW50IHN1Yi10cmVlcyBvZiB0d28gZGlmZmVyZW50IG1vbGVjdWxlcyBhcmUgJ2VxdWl2YWxlbnQnXHJcblxyXG4gICAgLy8gLS0tLS0tLSBJZiB5b3UgY2hhbmdlIHRoaXMsIGFsc28gY29uc2lkZXIgdGhlIHNpbWlsYXIgY29kZSBpbiBTdHJpcHBlZE1vbGVjdWxlXHJcblxyXG4gICAgaWYgKCAhbXlBdG9tLmhhc1NhbWVFbGVtZW50KCBvdGhlckF0b20gKSApIHtcclxuICAgICAgLy8gaWYgdGhlIGF0b21zIGFyZSBvZiBkaWZmZXJlbnQgdHlwZXMsIGJhaWwuIHN1YnRyZWVzIGNhbid0IHBvc3NpYmx5IGJlIGVxdWl2YWxlbnRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbXlVbnZpc2l0ZWROZWlnaGJvcnMgPSB0aGlzLmdldE5laWdoYm9yc05vdEluU2V0KCBteUF0b20sIG15VmlzaXRlZCApO1xyXG4gICAgY29uc3Qgb3RoZXJVbnZpc2l0ZWROZWlnaGJvcnMgPSBvdGhlci5nZXROZWlnaGJvcnNOb3RJblNldCggb3RoZXJBdG9tLCBvdGhlclZpc2l0ZWQgKTtcclxuICAgIGlmICggbXlVbnZpc2l0ZWROZWlnaGJvcnMubGVuZ3RoICE9PSBvdGhlclVudmlzaXRlZE5laWdoYm9ycy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICggbXlVbnZpc2l0ZWROZWlnaGJvcnMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAvLyBubyBtb3JlIHVubWF0Y2hlZCBhdG9tc1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNpemUgPSBteVVudmlzaXRlZE5laWdoYm9ycy5sZW5ndGg7XHJcblxyXG4gICAgLy8gZm9yIG5vdywgYWRkIHZpc2l0aW5nIGF0b21zIHRvIHRoZSB2aXNpdGVkIHNldC4gd2UgTkVFRCB0byByZXZlcnQgdGhpcyBiZWZvcmUgcmV0dXJuaW5nIVxyXG4gICAgbXlWaXNpdGVkLnB1c2goIG15QXRvbSApO1xyXG4gICAgb3RoZXJWaXNpdGVkLnB1c2goIG90aGVyQXRvbSApO1xyXG5cclxuICAgIC8qXHJcbiAgICAgZXF1aXZhbGVuY3kgbWF0cml4LiBlYWNoIGVudHJ5IGlzIGJhc2ljYWxseSB3aGV0aGVyIHRoZSBzdWJ0cmVlIGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlICdteScgYXRvbSBpc1xyXG4gICAgIGVxdWl2YWxlbnQgdG8gdGhlIHN1YnRyZWUgaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgJ290aGVyJyBhdG9tLCBmb3IgYWxsIHBvc3NpYmxlIG15IGFuZCBvdGhlciBhdG9tc1xyXG4gICAgICovXHJcbiAgICBjb25zdCBlcXVpdmFsZW5jZXMgPSBuZXcgQXJyYXkoIHNpemUgKiBzaXplICk7IC8vIGJvb2xlYW5zXHJcblxyXG4gICAgLy8ga2VlcCB0cmFjayBvZiBhdmFpbGFibGUgaW5kaWNlcyBmb3IgdGhlIGZvbGxvd2luZyBtYXRyaXggZXF1aXZhbGVuY3kgY2hlY2tcclxuICAgIGNvbnN0IGF2YWlsYWJsZUluZGljZXMgPSBbXTtcclxuXHJcbiAgICAvLyBmb3IgdGhlIGxvdmUgb2YgZ29kLCB0aGlzIG1hdHJpeCBpcyBOT1Qgc3ltbWV0cmljLiBJdCBjb21wdXRlcyB3aGV0aGVyIGVhY2ggdHJlZSBicmFuY2ggZm9yIEEgaXMgZXF1aXZhbGVudCB0byBlYWNoIHRyZWUgYnJhbmNoIGZvciBCXHJcbiAgICBmb3IgKCBsZXQgbXlJbmRleCA9IDA7IG15SW5kZXggPCBzaXplOyBteUluZGV4KysgKSB7XHJcbiAgICAgIGF2YWlsYWJsZUluZGljZXMucHVzaCggbXlJbmRleCApO1xyXG4gICAgICBmb3IgKCBsZXQgb3RoZXJJbmRleCA9IDA7IG90aGVySW5kZXggPCBzaXplOyBvdGhlckluZGV4KysgKSB7XHJcbiAgICAgICAgZXF1aXZhbGVuY2VzWyBteUluZGV4ICogc2l6ZSArIG90aGVySW5kZXggXSA9IHRoaXMuY2hlY2tFcXVpdmFsZW5jeSggb3RoZXIsIG15VmlzaXRlZCwgb3RoZXJWaXNpdGVkLCBteVVudmlzaXRlZE5laWdoYm9yc1sgbXlJbmRleCBdLCBvdGhlclVudmlzaXRlZE5laWdoYm9yc1sgb3RoZXJJbmRleCBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIGF0b21zIGZyb20gdGhlIHZpc2l0ZWQgc2V0cywgdG8gaG9sZCBvdXIgY29udHJhY3RcclxuICAgIF8ucmVtb3ZlKCBteVZpc2l0ZWQsIGl0ZW0gPT4ge1xyXG4gICAgICByZXR1cm4gaXRlbSA9PT0gbXlBdG9tID8gbXlBdG9tIDogbnVsbDtcclxuICAgIH0gKTtcclxuICAgIF8ucmVtb3ZlKCBvdGhlclZpc2l0ZWQsIGl0ZW0gPT4ge1xyXG4gICAgICByZXR1cm4gaXRlbSA9PT0gb3RoZXJBdG9tID8gb3RoZXJBdG9tIDogbnVsbDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByZXR1cm4gd2hldGhlciB3ZSBjYW4gZmluZCBhIHN1Y2Nlc3NmdWwgcGVybXV0YXRpb24gbWF0Y2hpbmcgZnJvbSBvdXIgZXF1aXZhbGVuY3kgbWF0cml4XHJcbiAgICByZXR1cm4gTW9sZWN1bGVTdHJ1Y3R1cmUuY2hlY2tFcXVpdmFsZW5jeU1hdHJpeCggZXF1aXZhbGVuY2VzLCAwLCBhdmFpbGFibGVJbmRpY2VzLCBzaXplICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEVsZW1lbnQ+fVxyXG4gICAqL1xyXG4gIGdldEVsZW1lbnRMaXN0KCkge1xyXG5cclxuICAgIC8vIHJldHVybiBkZWZlbnNpdmUgY29weS4gaWYgdGhhdCBpcyBjaGFuZ2VkLCBleGFtaW5lIGFsbCB1c2FnZXNcclxuICAgIHJldHVybiBfLm1hcCggdGhpcy5hdG9tcywgYXRvbSA9PiBhdG9tLmVsZW1lbnQgKTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIHNlcmlhbGl6YXRpb24gYW5kIHBhcnNpbmdcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBBIHNlcmlhbGl6ZWQgZm9ybSBvZiB0aGlzIHN0cnVjdHVyZS4gSXQgaXMgfC1zZXBhcmF0ZWQgdG9rZW5zLCB3aXRoIHRoZSBmb3JtYXQ6XHJcbiAgICogICAgICAgICBhdG9tIHF1YW50aXR5XHJcbiAgICogICAgICAgICBib25kIHF1YW50aXR5XHJcbiAgICogICAgICAgICBmb3IgZWFjaCBhdG9tLCBpdCdzIHN5bWJvbFxyXG4gICAqICAgICAgICAgZm9yIGVhY2ggYm9uZCwgdHdvIHplcm8taW5kZXhlZCBpbmRpY2VzIG9mIGF0b21zIGFib3ZlXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIFtzdHJpbmddXHJcbiAgICovXHJcbiAgdG9TZXJpYWwoKSB7XHJcbiAgICBsZXQgcmV0ID0gYCR7dGhpcy5hdG9tcy5sZW5ndGh9fCR7dGhpcy5ib25kcy5sZW5ndGh9YDtcclxuICAgIHRoaXMuYXRvbXMuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIHJldCArPSBgfCR7YXRvbS5zeW1ib2x9YDtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYm9uZHMuZm9yRWFjaCggYm9uZCA9PiB7XHJcbiAgICAgIGNvbnN0IGEgPSB0aGlzLmF0b21zLmluZGV4T2YoIGJvbmQuYSApO1xyXG4gICAgICBjb25zdCBiID0gdGhpcy5hdG9tcy5pbmRleE9mKCBib25kLmIgKTtcclxuICAgICAgcmV0ICs9IGB8JHthfXwke2J9YDtcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9ybWF0IGRlc2NyaXB0aW9uLCAnfCcgaXMgbGl0ZXJhbFxyXG4gICAqXHJcbiAgICogbGluZSA9IG51bUF0b21zfG51bUJvbmRzKHxhdG9tQm9uZFNwZWMpKlxyXG4gICAqIGF0b21Cb25kU3BlYyA9IGF0b21TcGVjKCxib25kU3BlYykqXHJcbiAgICogYXRvbVNwZWMgLS0tIGRldGVybWluZWQgYnkgaW1wbGVtZW50YXRpb24gb2YgYXRvbS4gZG9lcyBub3QgY29udGFpbiAnfCcgb3IgJywnXHJcbiAgICogYm9uZFNwZWMgLS0tIGRldGVybWluZWQgYnkgaW1wbGVtZW50YXRpb24gb2YgYm9uZC4gZG9lcyBub3QgY29udGFpbiAnfCcgb3IgJywnXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnNcclxuICAgKi9cclxuICB0b1NlcmlhbDIoKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcblxyXG4gICAgLy8gc2VyaWFsaXppbmcgYW5kIHRoZSBmb2xsb3dpbmcgYnVpbGRlciBhcHBlbmRzIGFyZSBub3QgYSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrLiB0aGV5IGFyZSBsZWZ0IGluIGEgbW9yZSByZWFkYWJsZSBmb3JtXHJcbiAgICAvLyB3cml0ZSBoZWFkZXI6ICMgb2YgYXRvbXNcclxuICAgIHJlc3VsdCArPSBgJHt0aGlzLmF0b21zLmxlbmd0aH18JHt0aGlzLmJvbmRzLmxlbmd0aH1gO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5hdG9tcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYXRvbSA9IHRoaXMuYXRvbXNbIGkgXTtcclxuICAgICAgcmVzdWx0ICs9IGB8JHthdG9tLnRvU3RyaW5nKCl9YDtcclxuICAgICAgdGhpcy5ib25kcy5mb3JFYWNoKCBib25kID0+IHtcclxuICAgICAgICBpZiAoIGJvbmQuY29udGFpbnMoIGF0b20gKSApIHtcclxuICAgICAgICAgIGNvbnN0IG90aGVyQXRvbSA9IGJvbmQuZ2V0T3RoZXJBdG9tKCBhdG9tICk7XHJcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuYXRvbXMuaW5kZXhPZiggb3RoZXJBdG9tICk7XHJcbiAgICAgICAgICBpZiAoIGluZGV4IDwgaSApIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IGAsJHtib25kLnRvU2VyaWFsMiggaW5kZXggKX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbWJpbmVzIG1vbGVjdWxlcyB0b2dldGhlciBieSBib25kaW5nIHRoZWlyIGF0b21zIEEgYW5kIEJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGVTdHJ1Y3R1cmV9IG1vbEEgICBNb2xlY3VsZSBBXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVN0cnVjdHVyZX0gbW9sQiAgIE1vbGVjdWxlIEJcclxuICAgKiBAcGFyYW0ge0F0b219ICAgICAgICAgICAgICBhICAgICAgQXRvbSBBXHJcbiAgICogQHBhcmFtIHtBdG9tfSAgICAgICAgICAgICAgYiAgICAgIEF0b20gQlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGVTdHJ1Y3R1cmV9IHJlc3VsdCBBbiBlbXB0eSBtb2xlY3VsZSB0byBmaWxsXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge01vbGVjdWxlU3RydWN0dXJlfSBBIGNvbXBsZXRlbHkgbmV3IG1vbGVjdWxlIHdpdGggYWxsIGF0b21zIGluIEEgYW5kIEIsIHdoZXJlIGF0b20gQSBpcyBqb2luZWQgdG8gYXRvbSBCXHJcbiAgICovXHJcbiAgc3RhdGljIGdldENvbWJpbmVkTW9sZWN1bGVGcm9tQm9uZCggbW9sQSwgbW9sQiwgYSwgYiwgcmVzdWx0ICkge1xyXG4gICAgbW9sQS5hdG9tcy5mb3JFYWNoKCBhdG9tID0+IHtcclxuICAgICAgcmVzdWx0LmFkZEF0b20oIGF0b20gKTtcclxuICAgIH0gKTtcclxuICAgIG1vbEIuYXRvbXMuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIHJlc3VsdC5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICB9ICk7XHJcbiAgICBtb2xBLmJvbmRzLmZvckVhY2goIGJvbmQgPT4ge1xyXG4gICAgICByZXN1bHQuYWRkQm9uZCggYm9uZCApO1xyXG4gICAgfSApO1xyXG4gICAgbW9sQi5ib25kcy5mb3JFYWNoKCBib25kID0+IHtcclxuICAgICAgcmVzdWx0LmFkZEJvbmQoIGJvbmQgKTtcclxuICAgIH0gKTtcclxuICAgIHJlc3VsdC5hZGRCb25kKCBuZXcgQm9uZCggYSwgYiApICk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3BsaXQgYSBib25kIGluIGEgbW9sZWN1bGUsIGFuZCByZXR1cm4gdGhlIHJlbWFpbmluZyBtb2xlY3VsZSBzdHJ1Y3R1cmUocylcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlU3RydWN0dXJlfSBzdHJ1Y3R1cmUgVGhlIG1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtCb25kfSAgICAgICAgICAgICAgYm9uZCAgICAgIFRoZSBib25kIHRvIGJyZWFrXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVN0cnVjdHVyZX0gbW9sQSAgICAgIEFuIGVtcHR5IG1vbGVjdWxlIGZvciB0aGUgMXN0IGJyb2tlbiBwYXJ0XHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVN0cnVjdHVyZX0gbW9sQiAgICAgIEFuIGVtcHR5IG1vbGVjdWxlIGZvciB0aGUgMm5kIGJyb2tlbiBwYXJ0XHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge0FycmF5LjxNb2xlY3VsZVN0cnVjdHVyZT59ICAgQSBsaXN0IG9mIHJlbWFpbmluZyBzdHJ1Y3R1cmVzXHJcbiAgICovXHJcbiAgc3RhdGljIGdldE1vbGVjdWxlc0Zyb21Ccm9rZW5Cb25kKCBzdHJ1Y3R1cmUsIGJvbmQsIG1vbEEsIG1vbEIgKSB7XHJcbiAgICAvLyBOT1RFOiBpbiB0aGUgZnV0dXJlIHdoZW4gd2UgaGF2ZSBsb29wcywgd2UgY2FuJ3QgYXNzdW1lIHRoYXQgdGhpcyB3aWxsIGJyZWFrIGEgbW9sZWN1bGUgaW50byB0d28gc2VwYXJhdGUgbW9sZWN1bGVzIVxyXG5cclxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAgICogc2VwYXJhdGUgb3V0IHdoaWNoIGF0b21zIGJlbG9uZyBpbiB3aGljaCByZW1haW5pbmcgbW9sZWN1bGVcclxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgLy8gTm90ZTogKHBlcmZvcm1hbmNlKSB1c2Ugc2V0cyBmb3IgZmFzdCBpbnNlcnRpb24sIHJlbW92YWwsIGFuZCBxdWVyeWluZywgd2hlcmV2ZXIgbmVjZXNzYXJ5IGluIHRoaXMgZnVuY3Rpb25cclxuICAgIGNvbnN0IGF0b21zSW5BID0gWyBib25kLmEgXTtcclxuXHJcbiAgICAvLyBhdG9tcyBsZWZ0IGFmdGVyIHJlbW92aW5nIGF0b21zXHJcbiAgICBjb25zdCByZW1haW5pbmdBdG9tcyA9IHN0cnVjdHVyZS5hdG9tcy5zbGljZSgpO1xyXG4gICAgXy5yZW1vdmUoIHJlbWFpbmluZ0F0b21zLCBpdGVtID0+IHtcclxuICAgICAgcmV0dXJuIGl0ZW0gPT09IGJvbmQuYSA/IGJvbmQuYSA6IG51bGw7XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBkaXJ0eUF0b21zID0gWyBib25kLmEgXTtcclxuICAgIHdoaWxlICggZGlydHlBdG9tcy5sZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zdCBhdG9tID0gZGlydHlBdG9tcy5wb3AoKTtcclxuICAgICAgXy5yZW1vdmUoIGRpcnR5QXRvbXMsIGl0ZW0gPT4ge1xyXG4gICAgICAgIHJldHVybiBpdGVtID09PSBhdG9tID8gYXRvbSA6IG51bGw7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGZvciBhbGwgbmVpZ2hib3JzIHRoYXQgZG9uJ3QgdXNlIG91ciAnYm9uZCdcclxuICAgICAgc3RydWN0dXJlLmJvbmRzLmZvckVhY2goIG90aGVyQm9uZCA9PiB7XHJcbiAgICAgICAgaWYgKCBvdGhlckJvbmQgIT09IGJvbmQgJiYgb3RoZXJCb25kLmNvbnRhaW5zKCBhdG9tICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBuZWlnaGJvciA9IG90aGVyQm9uZC5nZXRPdGhlckF0b20oIGF0b20gKTtcclxuXHJcbiAgICAgICAgICAvLyBwaWNrIG91dCBvdXIgbmVpZ2hib3IsIG1hcmsgaXQgYXMgaW4gJ0EnLCBhbmQgbWFyayBpdCBhcyBkaXJ0eSBzbyB3ZSBjYW4gcHJvY2VzcyBpdHMgbmVpZ2hib3JzXHJcbiAgICAgICAgICBpZiAoIF8uaW5jbHVkZXMoIHJlbWFpbmluZ0F0b21zLCBuZWlnaGJvciApICkge1xyXG4gICAgICAgICAgICBfLnJlbW92ZSggcmVtYWluaW5nQXRvbXMsIGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBpdGVtID09PSBuZWlnaGJvciA/IG5laWdoYm9yIDogbnVsbDtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICBkaXJ0eUF0b21zLnB1c2goIG5laWdoYm9yICk7XHJcbiAgICAgICAgICAgIGF0b21zSW5BLnB1c2goIG5laWdoYm9yICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAgKiBjb25zdHJ1Y3Qgb3VyIHR3byBtb2xlY3VsZXNcclxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgc3RydWN0dXJlLmF0b21zLmZvckVhY2goIGF0b20gPT4ge1xyXG4gICAgICBpZiAoIF8uaW5jbHVkZXMoIGF0b21zSW5BLCBhdG9tICkgKSB7XHJcbiAgICAgICAgbW9sQS5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbW9sQi5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdHJ1Y3R1cmUuYm9uZHMuZm9yRWFjaCggb3RoZXJCb25kID0+IHtcclxuICAgICAgaWYgKCBvdGhlckJvbmQgIT09IGJvbmQgKSB7XHJcbiAgICAgICAgaWYgKCBfLmluY2x1ZGVzKCBhdG9tc0luQSwgb3RoZXJCb25kLmEgKSApIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGF0b21zSW5BLCBvdGhlckJvbmQuYiApICk7XHJcbiAgICAgICAgICBtb2xBLmFkZEJvbmQoIG90aGVyQm9uZCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG1vbEIuYWRkQm9uZCggb3RoZXJCb25kICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBCQU1RdWVyeVBhcmFtZXRlcnMubG9nRGF0YSApIHtcclxuICAgICAgY29uc29sZS5sb2coIGBzcGxpdHRpbmcgJHtzdHJ1Y3R1cmUudG9TZXJpYWwoKX0gaW50bzpgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBtb2xBLnRvU2VyaWFsKCkgKTtcclxuICAgICAgY29uc29sZS5sb2coIG1vbEIudG9TZXJpYWwoKSApO1xyXG4gICAgfVxyXG4gICAgLy8gcmV0dXJuIG91ciB0d28gbW9sZWN1bGVzXHJcbiAgICByZXR1cm4gWyBtb2xBLCBtb2xCIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIG1hdHJpeCBvZiBlcXVpdmFsZW5jaWVzLCBjYW4gd2UgZmluZCBhIHBlcm11dGF0aW9uIG9mIHRoZSAnb3RoZXInIGF0b21zIHRoYXQgYXJlIGVxdWl2YWxlbnQgdG9cclxuICAgKiB0aGVpciByZXNwZWN0aXZlICdteScgYXRvbXM/XHJcbiAgICpcclxuICAgKiBOT1RFOiBlcXVpdmFsZW5jeSBtYXRyaWNlcyBhcmUgc3RvcmVkIGluIHJvdy1tYWpvciBmb3JtYXQgKGNvbXBhcmVkIHRvIHRoZSBKYXZhIHZlcnNpb24pXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5Ljxib29sZWFuPn0gZXF1aXZhbGVuY2VzICAgICAgICAgIEVxdWl2YWxlbmNlIE1hdHJpeCwgc3F1YXJlISwgcm93LW1ham9yIChzdG9yZWQgYXMgb25lIGJvb2xlYW4gYXJyYXkpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9ICAgICAgICAgIG15SW5kZXggICAgICAgICAgICAgICBJbmRleCBmb3IgdGhlIHJvdyAoaW5kZXggaW50byBvdXIgYXRvbXMpLiBjYWxscyB3aXRoIG15SW5kZXggKyAxIHRvIGNoaWxkcmVuXHJcbiAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gIG90aGVyUmVtYWluaW5nSW5kaWNlcyBSZW1haW5pbmcgYXZhaWxhYmxlICdvdGhlcicgaW5kaWNlc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSAgICAgICAgICBzaXplICAgICAgICAgICAgICAgICAgVGhpcyBzcXVhcmUgbWF0cml4IGlzIHNpemUgeCBzaXplIGluIGRpbWVuc2lvbnNcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBhIHN1Y2Nlc3NmdWwgbWF0Y2hpbmcgcGVybXV0YXRpb24gd2FzIGZvdW5kXHJcbiAgICovXHJcbiAgc3RhdGljIGNoZWNrRXF1aXZhbGVuY3lNYXRyaXgoIGVxdWl2YWxlbmNlcywgbXlJbmRleCwgb3RoZXJSZW1haW5pbmdJbmRpY2VzLCBzaXplICkge1xyXG4gICAgLy8gdmFyIHNpemUgPSBNYXRoLnNxcnQoIGVxdWl2YWxlbmNlcy5sZW5ndGggKTsgLy8gaXQncyBzcXVhcmUsIHNvIHRoaXMgdGVjaG5pY2FsbHkgd29ya3NcclxuICAgIC8vIE5vdGU6IChwZXJmb3JtYW5jZSkgdGhpcyBzaG91bGQgbGVhayBtZW1vcnkgaW4gdW4tZnVuIHdheXMsIGFuZCBwZXJmb3JtYW5jZSBjb21wbGV4aXR5IHNob3VsZCBiZSBzcGVkIHVwXHJcblxyXG4gICAgLy8gc2hvdWxkIGJlIGluZWZmaWNpZW50LCBidXQgbm90IHRvbyBiYWQgKGNvbXB1dGF0aW9uYWwgY29tcGxleGl0eSBpcyBub3Qgb3B0aW1hbClcclxuICAgIGNvbnN0IGFyciA9IG90aGVyUmVtYWluaW5nSW5kaWNlcy5zbGljZSgpO1xyXG4gICAgY29uc3QgbGVuID0gYXJyLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkgeyAvLyBsb29wIG92ZXIgYWxsIHJlbWFpbmluZyBvdGhlcnNcclxuICAgICAgY29uc3Qgb3RoZXJJbmRleCA9IGFyclsgaSBdO1xyXG4gICAgICBpZiAoIGVxdWl2YWxlbmNlc1sgbXlJbmRleCAqIHNpemUgKyBvdGhlckluZGV4IF0gKSB7IC8vIG9ubHkgZm9sbG93IHBhdGggaWYgaXQgaXMgdHJ1ZSAoZXF1aXZhbGVudClcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmRleCBmcm9tIGNvbnNpZGVyYXRpb24gZm9yIGNoZWNraW5nIHRoZSBmb2xsb3dpbmcgc3VibWF0cml4XHJcbiAgICAgICAgb3RoZXJSZW1haW5pbmdJbmRpY2VzLnNwbGljZSggb3RoZXJSZW1haW5pbmdJbmRpY2VzLmluZGV4T2YoIG90aGVySW5kZXggKSwgMSApO1xyXG5cclxuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCBteUluZGV4ID09PSBzaXplIC0gMSApIHx8IC8vIHRoZXJlIGFyZSBubyBtb3JlIHBlcm11dGF0aW9ucyB0byBjaGVja1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2xlY3VsZVN0cnVjdHVyZS5jaGVja0VxdWl2YWxlbmN5TWF0cml4KCBlcXVpdmFsZW5jZXMsIG15SW5kZXggKyAxLCBvdGhlclJlbWFpbmluZ0luZGljZXMsIHNpemUgKTsgLy8gb3Igd2UgY2FuIGZpbmQgYSBnb29kIGNvbWJpbmF0aW9uIG9mIHRoZSByZW1haW5pbmcgaW5kaWNlc1xyXG5cclxuICAgICAgICAvLyBhZGQgaXQgYmFjayBpbiBzbyB0aGUgY2FsbGluZyBmdW5jdGlvbidzIGNvbnRyYWN0IGZvciBvdGhlclJlbWFpbmluZ0luZGljZXMgaXMgc2F0aXNmaWVkXHJcbiAgICAgICAgb3RoZXJSZW1haW5pbmdJbmRpY2VzLnB1c2goIG90aGVySW5kZXggKTtcclxuXHJcbiAgICAgICAgaWYgKCBzdWNjZXNzICkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXNlcmlhbGl6ZSBhIG1vbGVjdWxlIHN0cnVjdHVyZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgIGxpbmUgICAgICAgICAgICAgIFRoZSBkYXRhIChzdHJpbmcpIHRvIGRlc2VyaWFsaXplXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZUdlbmVyYXRvcn0gbW9sZWN1bGVHZW5lcmF0b3IgZnVuY3Rpb24oIGF0b21Db3VudCwgYm9uZENvdW50ICk6TW9sZWN1bGVTdHJ1Y3R1cmUuIENyZWF0ZXMgYSBtb2xlY3VsZSB3aXRoIHByb3BlcnRpZXMgdGhhdCB3ZSBjYW4gZmlsbCB3aXRoIGF0b21zL2JvbmRzXHJcbiAgICogQHBhcmFtIHtBdG9tUGFyc2VyfSAgICAgICAgYXRvbVBhcnNlciAgICAgICAgZnVuY3Rpb24oIGF0b21TdHJpbmcgKTpBdG9tLiBDcmVhdGVzIGFuIGF0b20gZnJvbSBhIHN0cmluZyByZXByZXNlbnRpbmcgYW4gYXRvbVxyXG4gICAqIEBwYXJhbSB7Qm9uZFBhcnNlcn0gICAgICAgIGJvbmRQYXJzZXIgICAgICAgIGZ1bmN0aW9uKCBib25kU3RyaW5nLCBjb25uZWN0ZWRBdG9tLCBtb2xlY3VsZVN0cnVjdHVyZSApOkJvbmQuIENyZWF0ZXMgYSBib25kIGZyb20gYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgYm9uZFxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtNb2xlY3VsZVN0cnVjdHVyZX0gQSBjb25zdHJ1Y3RlZCBtb2xlY3VsZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tU2VyaWFsMiggbGluZSwgbW9sZWN1bGVHZW5lcmF0b3IsIGF0b21QYXJzZXIsIGJvbmRQYXJzZXIgKSB7XHJcbiAgICBjb25zdCB0b2tlbnMgPSBsaW5lLnNwbGl0KCAnfCcgKTtcclxuICAgIGxldCBpZHggPSAwO1xyXG4gICAgY29uc3QgYXRvbUNvdW50ID0gTnVtYmVyKCB0b2tlbnNbIGlkeCsrIF0gKTtcclxuICAgIGNvbnN0IGJvbmRDb3VudCA9IE51bWJlciggdG9rZW5zWyBpZHgrKyBdICk7XHJcbiAgICBjb25zdCBtb2xlY3VsZSA9IG1vbGVjdWxlR2VuZXJhdG9yKCBhdG9tQ291bnQsIGJvbmRDb3VudCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXRvbUNvdW50OyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGF0b21Cb25kU3RyaW5nID0gdG9rZW5zWyBpZHgrKyBdO1xyXG4gICAgICBsZXQgc3ViSWR4ID0gMDtcclxuICAgICAgY29uc3Qgc3ViVG9rZW5zID0gYXRvbUJvbmRTdHJpbmcuc3BsaXQoICcsJyApO1xyXG4gICAgICBjb25zdCBhdG9tID0gYXRvbVBhcnNlciggc3ViVG9rZW5zWyBzdWJJZHgrKyBdICk7XHJcbiAgICAgIG1vbGVjdWxlLmFkZEF0b20oIGF0b20gKTtcclxuICAgICAgd2hpbGUgKCBzdWJJZHggPCBzdWJUb2tlbnMubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnN0IGJvbmQgPSBib25kUGFyc2VyKCBzdWJUb2tlbnNbIHN1YklkeCsrIF0sIGF0b20sIG1vbGVjdWxlICk7XHJcbiAgICAgICAgbW9sZWN1bGUuYWRkQm9uZCggYm9uZCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbW9sZWN1bGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGluZSAtIFRoZSBkYXRhIChzdHJpbmcpIHRvIGRlc2VyaWFsaXplXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge01vbGVjdWxlU3RydWN0dXJlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tU2VyaWFsMkJhc2ljKCBsaW5lICkge1xyXG4gICAgLy8gYXNzdW1lcyBhdG9tIGJhc2UgY2xhc3MgKGp1c3Qgc3ltYm9sKSBhbmQgc2ltcGxlIGJvbmRzIChqdXN0IGNvbm5lY3Rpdml0eSlcclxuICAgIHJldHVybiBNb2xlY3VsZVN0cnVjdHVyZS5mcm9tU2VyaWFsMiggbGluZSwgTW9sZWN1bGVTdHJ1Y3R1cmUuZGVmYXVsdE1vbGVjdWxlR2VuZXJhdG9yLCBNb2xlY3VsZVN0cnVjdHVyZS5kZWZhdWx0QXRvbVBhcnNlciwgTW9sZWN1bGVTdHJ1Y3R1cmUuZGVmYXVsdEJvbmRQYXJzZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhdG9tQ291bnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYm9uZENvdW50XHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtNb2xlY3VsZVN0cnVjdHVyZX1cclxuICAgKi9cclxuICBzdGF0aWMgZGVmYXVsdE1vbGVjdWxlR2VuZXJhdG9yKCBhdG9tQ291bnQsIGJvbmRDb3VudCApIHtcclxuICAgIHJldHVybiBuZXcgTW9sZWN1bGVTdHJ1Y3R1cmUoIGF0b21Db3VudCwgYm9uZENvdW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXRvbVN0cmluZ1xyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7QXRvbX1cclxuICAgKi9cclxuICBzdGF0aWMgZGVmYXVsdEF0b21QYXJzZXIoIGF0b21TdHJpbmcgKSB7XHJcblxyXG4gICAgLy8gYXRvbVN0cmluZyBpcyBhbiBlbGVtZW50IHN5bWJvbFxyXG4gICAgcmV0dXJuIG5ldyBBdG9tKCBFbGVtZW50LmdldEVsZW1lbnRCeVN5bWJvbCggYXRvbVN0cmluZyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYm9uZFN0cmluZ1xyXG4gICAqIEBwYXJhbSB7QXRvbX0gY29ubmVjdGVkQXRvbVxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGVTdHJ1Y3R1cmV9IG1vbGVjdWxlU3RydWN0dXJlXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtCb25kfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkZWZhdWx0Qm9uZFBhcnNlciggYm9uZFN0cmluZywgY29ubmVjdGVkQXRvbSwgbW9sZWN1bGVTdHJ1Y3R1cmUgKSB7XHJcbiAgICAvLyBib25kU3RyaW5nIGlzIGluZGV4IG9mIG90aGVyIGF0b20gdG8gYm9uZFxyXG4gICAgcmV0dXJuIG5ldyBCb25kKCBjb25uZWN0ZWRBdG9tLCBtb2xlY3VsZVN0cnVjdHVyZS5hdG9tc1sgTnVtYmVyKCBib25kU3RyaW5nICkgXSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUge09iamVjdH1cclxuICBzdGF0aWMgZm9ybXVsYUV4Y2VwdGlvbnMoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBIM046ICdOSDMnLCAvLyB0cmVhdGVkIGFzIGlmIGl0IGlzIG9yZ2FuaWNcclxuICAgICAgQ0hOOiAnSENOJyAgLy8gbm90IGNvbnNpZGVyZWQgb3JnYW5pY1xyXG5cclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5idWlsZEFNb2xlY3VsZS5yZWdpc3RlciggJ01vbGVjdWxlU3RydWN0dXJlJywgTW9sZWN1bGVTdHJ1Y3R1cmUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGVTdHJ1Y3R1cmU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLElBQUksTUFBTSxzQ0FBc0M7QUFDdkQsT0FBT0MsU0FBUyxNQUFNLDJDQUEyQztBQUNqRSxPQUFPQyxPQUFPLE1BQU0seUNBQXlDO0FBQzdELE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0Msa0JBQWtCLE1BQU0sMEJBQTBCO0FBQ3pELE9BQU9DLElBQUksTUFBTSxXQUFXO0FBQzVCLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUVwRCxJQUFJQyxjQUFjLEdBQUcsQ0FBQztBQUV0QixNQUFNQyxpQkFBaUIsQ0FBQztFQUN0QjtFQUNBO0VBQ0E7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7SUFFaEM7SUFDQSxJQUFJLENBQUNDLFVBQVUsR0FBR0wsY0FBYyxFQUFFLENBQUMsQ0FBQzs7SUFFcEM7SUFDQSxJQUFJLENBQUNNLEtBQUssR0FB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