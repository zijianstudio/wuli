// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a complete (stable) molecule with a name and structure. Includes 2d and 3d representations,
 * and can generate visuals of both types.
 *
 * It's a MoleculeStructure using PubChemAtom
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import AtomNode from '../../../../nitroglycerin/js/nodes/AtomNode.js';
import C2H2Node from '../../../../nitroglycerin/js/nodes/C2H2Node.js';
import C2H4Node from '../../../../nitroglycerin/js/nodes/C2H4Node.js';
import C2H5ClNode from '../../../../nitroglycerin/js/nodes/C2H5ClNode.js';
import C2H5OHNode from '../../../../nitroglycerin/js/nodes/C2H5OHNode.js';
import C2H6Node from '../../../../nitroglycerin/js/nodes/C2H6Node.js';
import CH2ONode from '../../../../nitroglycerin/js/nodes/CH2ONode.js';
import CH3OHNode from '../../../../nitroglycerin/js/nodes/CH3OHNode.js';
import CH4Node from '../../../../nitroglycerin/js/nodes/CH4Node.js';
import Cl2Node from '../../../../nitroglycerin/js/nodes/Cl2Node.js';
import CO2Node from '../../../../nitroglycerin/js/nodes/CO2Node.js';
import CS2Node from '../../../../nitroglycerin/js/nodes/CS2Node.js';
import F2Node from '../../../../nitroglycerin/js/nodes/F2Node.js';
import H2Node from '../../../../nitroglycerin/js/nodes/H2Node.js';
import H2ONode from '../../../../nitroglycerin/js/nodes/H2ONode.js';
import H2SNode from '../../../../nitroglycerin/js/nodes/H2SNode.js';
import HClNode from '../../../../nitroglycerin/js/nodes/HClNode.js';
import HFNode from '../../../../nitroglycerin/js/nodes/HFNode.js';
import N2Node from '../../../../nitroglycerin/js/nodes/N2Node.js';
import N2ONode from '../../../../nitroglycerin/js/nodes/N2ONode.js';
import NH3Node from '../../../../nitroglycerin/js/nodes/NH3Node.js';
import NO2Node from '../../../../nitroglycerin/js/nodes/NO2Node.js';
import NONode from '../../../../nitroglycerin/js/nodes/NONode.js';
import O2Node from '../../../../nitroglycerin/js/nodes/O2Node.js';
import OF2Node from '../../../../nitroglycerin/js/nodes/OF2Node.js';
import P4Node from '../../../../nitroglycerin/js/nodes/P4Node.js';
import PCl3Node from '../../../../nitroglycerin/js/nodes/PCl3Node.js';
import PCl5Node from '../../../../nitroglycerin/js/nodes/PCl5Node.js';
import PF3Node from '../../../../nitroglycerin/js/nodes/PF3Node.js';
import PH3Node from '../../../../nitroglycerin/js/nodes/PH3Node.js';
import SO2Node from '../../../../nitroglycerin/js/nodes/SO2Node.js';
import SO3Node from '../../../../nitroglycerin/js/nodes/SO3Node.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import { Node } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../BuildAMoleculeStrings.js';
import Bond from './Bond.js';
import MoleculeStructure from './MoleculeStructure.js';

// constants
const OFFSET = 2.5; // used to model our atoms with only 2d data into a 3d representation

// Used to avoid stripping out unused strings, when string.json is accessed via bracket notation. See getDisplayName().
const TRANSLATABLE_MOLECULE_NAMES = {
  acetylene: BuildAMoleculeStrings.acetylene,
  ammonia: BuildAMoleculeStrings.ammonia,
  borane: BuildAMoleculeStrings.borane,
  carbonDioxide: BuildAMoleculeStrings.carbonDioxide,
  carbonMonoxide: BuildAMoleculeStrings.carbonMonoxide,
  chloromethane: BuildAMoleculeStrings.chloromethane,
  ethylene: BuildAMoleculeStrings.ethylene,
  fluoromethane: BuildAMoleculeStrings.fluoromethane,
  formaldehyde: BuildAMoleculeStrings.formaldehyde,
  hydrogenCyanide: BuildAMoleculeStrings.hydrogenCyanide,
  hydrogenPeroxide: BuildAMoleculeStrings.hydrogenPeroxide,
  hydrogenSulfide: BuildAMoleculeStrings.hydrogenSulfide,
  methane: BuildAMoleculeStrings.methane,
  molecularChlorine: BuildAMoleculeStrings.molecularChlorine,
  molecularFluorine: BuildAMoleculeStrings.molecularFluorine,
  molecularHydrogen: BuildAMoleculeStrings.molecularHydrogen,
  molecularNitrogen: BuildAMoleculeStrings.molecularNitrogen,
  molecularOxygen: BuildAMoleculeStrings.molecularOxygen,
  nitricOxide: BuildAMoleculeStrings.nitricOxide,
  nitrousOxide: BuildAMoleculeStrings.nitrousOxide,
  ozone: BuildAMoleculeStrings.ozone,
  phosphine: BuildAMoleculeStrings.phosphine,
  silane: BuildAMoleculeStrings.silane,
  sulfurDioxide: BuildAMoleculeStrings.sulfurDioxide,
  trifluoroborane: BuildAMoleculeStrings.trifluoroborane,
  water: BuildAMoleculeStrings.water
};

// Node types used for molecules
const nodeTypes = [Cl2Node, CO2Node, CO2Node, CS2Node, F2Node, H2Node, N2Node, NONode, N2ONode, O2Node, C2H2Node, C2H4Node, C2H5ClNode, C2H5OHNode, C2H6Node, CH2ONode, CH3OHNode, CH4Node, H2ONode, H2SNode, HClNode, HFNode, NH3Node, NO2Node, OF2Node, P4Node, PCl3Node, PCl5Node, PF3Node, PH3Node, SO2Node, SO3Node];
class CompleteMolecule extends MoleculeStructure {
  /**
   * @param {string} commonName
   * @param {string} molecularFormula
   * @param {number} atomCount
   * @param {number} bondCount
   * @param {boolean} has2d
   * @param {boolean} has3d
   */
  constructor(commonName, molecularFormula, atomCount, bondCount, has2d, has3d) {
    super(atomCount, bondCount);

    // @public {string} as said by pubchem (or overridden)
    this.commonName = commonName;

    // @public {number}
    this.cid = 0;

    // @private {string} as said by pubchem
    this.molecularFormula = molecularFormula;

    // @private {boolean}
    this.has2d = has2d;

    // @private {boolean}
    this.has3d = has3d;
  }

  /**
   * Strip out the 'molecular ' part of the string and process the result.
   *
   * @public
   * @returns {string}
   */
  filterCommonName() {
    let result = this.commonName;
    if (result.indexOf('molecular ') === 0) {
      result = result.slice('molecular '.length);
    }
    return CompleteMolecule.capitalize(result);
  }

  /**
   * A translated display name if possible. This does a weird lookup so that we can only list some of the names in the
   * translation, but can accept an even larger number of translated names in a translation file
   * @public
   *
   * @returns
   */
  getDisplayName() {
    // first check if we have the name translated. Do NOT warn on missing
    const translatableCommonName = TRANSLATABLE_MOLECULE_NAMES[_.camelCase(this.commonName)];
    if (translatableCommonName) {
      return translatableCommonName;
    } else {
      // if we didn't find it in the strings file, pull it from our English data
      return this.commonName;
    }
  }

  /**
   * A node that represents a 2d but quasi-3D version
   *
   * @public
   * @returns {Node}
   */
  createPseudo3DNode() {
    const molecularFormula = this.molecularFormula;
    const molecularFormulaType = `${molecularFormula}Node`;

    // if we can find it in the common chemistry nodes, use that
    const length = nodeTypes.length;
    for (let i = 0; i < length; i++) {
      const NodeType = nodeTypes[i];
      if (NodeType.name === molecularFormulaType || NodeType.name === 'NH3Node' && molecularFormula === 'H3N') {
        return new NodeType();
      }
    }

    // otherwise, use our 2d positions to construct a version. we get the correct back-to-front rendering
    const wrappers = _.sortBy(this.atoms, atom => {
      return atom.z3d;
    });
    return new Node({
      children: wrappers.map(atomWrapper => {
        return new AtomNode(atomWrapper.element, {
          // custom scale for now
          x: atomWrapper.x2d * 15,
          y: atomWrapper.y2d * 15
        });
      })
    });
  }

  /**
   * Returns serialized form of complete molecule data
   *
   * @public
   * @returns {string}
   */
  toSerial2() {
    // add in a header
    const format = this.has3d ? this.has2d ? 'full' : '3d' : '2d';
    return `${this.commonName}|${this.molecularFormula}|${this.cid}|${format}|${super.toSerial2.call(this)}`;
  }

  /**
   * @
   * @param {string} str
   *
   * @private
   */
  static capitalize(str) {
    const characters = str.split('');
    let lastWasSpace = true;
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];

      // whitespace check in general
      if (/\s/.test(character)) {
        lastWasSpace = true;
      } else {
        if (lastWasSpace && /[a-z]/.test(character)) {
          characters[i] = character.toUpperCase();
        }
        lastWasSpace = false;
      }
    }
    return characters.join('');
  }

  /*---------------------------------------------------------------------------*
   * serialization
   *----------------------------------------------------------------------------*/

  /**
   * Construct a molecule out of a pipe-separated line.
   * WARNING: this always writes out in a "full" configuration, even if the data wasn't contained before
   * @param {string} line A string that is essentially a serialized molecule
   *
   * @public
   * @returns {CompleteMolecule} that is properly constructed
   */
  static fromString(line) {
    let i;
    const tokens = line.split('|');
    let idx = 0;
    const commonName = tokens[idx++];
    const molecularFormula = tokens[idx++];
    const atomCount = Number(tokens[idx++]);
    const bondCount = Number(tokens[idx++]);
    const completeMolecule = new CompleteMolecule(commonName, molecularFormula, atomCount, bondCount, true, true);

    // for each atom, read its symbol, then 2d coordinates, then 3d coordinates (total of 6 fields)
    for (i = 0; i < atomCount; i++) {
      const symbol = tokens[idx++];
      const x2d = parseFloat(tokens[idx++]);
      const y2d = parseFloat(tokens[idx++]);
      const x3d = parseFloat(tokens[idx++]);
      const y3d = parseFloat(tokens[idx++]);
      const z3d = parseFloat(tokens[idx++]);
      const atom = new PubChemAtom(Element.getElementBySymbol(symbol), x2d, y2d, x3d, y3d, z3d);
      completeMolecule.addAtom(atom);
    }

    // for each bond, read atom indices (2 of them, which are 1-indexed), and then the order of the bond (single, double, triple, etc.)
    for (i = 0; i < bondCount; i++) {
      const a = Number(tokens[idx++]);
      const b = Number(tokens[idx++]);
      const order = Number(tokens[idx++]);
      const bond = new PubChemBond(completeMolecule.atoms[a - 1], completeMolecule.atoms[b - 1], order); // -1 since our format is 1-based
      completeMolecule.addBond(bond);
    }

    // Filled in by parsing completeMolecule
    completeMolecule.cid = Number(tokens[idx++]);
    return completeMolecule;
  }

  /**
   * @param {string} line
   *
   * @public
   * @returns {MoleculeStructure}
   */
  static fromSerial2(line) {
    /*---------------------------------------------------------------------------*
     * extract header
     *----------------------------------------------------------------------------*/
    const tokens = line.split('|');
    let idx = 0;
    const commonName = tokens[idx++];
    const molecularFormula = tokens[idx++];
    const cidString = tokens[idx++];
    const cid = Number(cidString);
    const format = tokens[idx++];
    const has2dAnd3d = format === 'full';
    const has2d = format === '2d' || has2dAnd3d;
    const has3d = format === '3d' || has2dAnd3d;
    const burnedLength = commonName.length + 1 + molecularFormula.length + 1 + cidString.length + 1 + format.length + 1;

    // select the atom parser depending on the format
    const atomParser = has3d ? has2dAnd3d ? PubChemAtom.parseFull : PubChemAtom.parse3d : PubChemAtom.parse2d;
    return MoleculeStructure.fromSerial2(line.slice(burnedLength), (atomCount, bondCount) => {
      const molecule = new CompleteMolecule(commonName, molecularFormula, atomCount, bondCount, has2d, has3d);
      molecule.cid = cid;
      return molecule;
    }, atomParser, PubChemBond.parse);
  }
}

// Signature for Atom without 2d or 3d representation
const PubChemAtomType = EnumerationDeprecated.byKeys(['TWO_DIMENSION', 'THREE_DIMENSION', 'FULL']);
class PubChemAtom extends Atom {
  constructor(element, type, x2d, y2d, x3d, y3d, z3d) {
    super(element);

    // @public {PubChemAtom}
    this.type = type;

    // @private {number}
    this.x2d = x2d;
    this.y2d = y2d;

    // @public {number}
    this.x3d = x3d;
    this.y3d = y3d;
    this.z3d = z3d;
  }

  /**
   * Stringify the structure of the atom.
   *
   * @public
   * @override
   * @returns {string}
   */
  static toString() {
    if (this.type === PubChemAtomType.TWO_DIMENSION) {
      return `${super.toString()} ${this.x2d} ${this.y2d}`;
    } else if (this.type === PubChemAtomType.THREE_DIMENSION) {
      return `${super.toString()} ${this.x3d} ${this.y3d} ${this.z3d}`;
    } else if (this.type === PubChemAtomType.FULL) {
      return `${super.toString()} ${this.x2d} ${this.y2d} ${this.x3d} ${this.y3d} ${this.z3d}`;
    } else {
      throw new Error(`Unsupported type: ${this.type}`);
    }
  }

  /**
   * Parser for PubChemAtom with only 2d data
   * @param {string} atomString
   *
   * @private
   * @returns {PubChemAtom}
   */
  static parse2d(atomString) {
    const tokens = atomString.split(' ');
    const element = Element.getElementBySymbol(tokens[0]);
    const x2d = parseFloat(tokens[1]);
    const y2d = parseFloat(tokens[2]);
    return new PubChemAtom(element, PubChemAtomType.TWO_DIMENSION, x2d, y2d, x2d - OFFSET, y2d, 0);
  }

  /**
   * Parser for PubChemAtom with only 3d data
   * @param {string} atomString
   *
   * @private
   * @returns {PubChemAtom}
   */
  static parse3d(atomString) {
    const tokens = atomString.split(' ');
    const element = Element.getElementBySymbol(tokens[0]);
    const x3d = parseFloat(tokens[1]);
    const y3d = parseFloat(tokens[2]);
    const z3d = parseFloat(tokens[3]);
    return new PubChemAtom(element, PubChemAtomType.THREE_DIMENSION, 0, 0, x3d, y3d, z3d);
  }

  /**
   * Parser for PubChemAtom with 2d and 3d data
   * @param {string} atomString
   *
   * @private
   * @returns {PubChemAtom}
   */
  static parseFull(atomString) {
    const tokens = atomString.split(' ');
    const element = Element.getElementBySymbol(tokens[0]);
    const x2d = parseFloat(tokens[1]);
    const y2d = parseFloat(tokens[2]);
    const x3d = parseFloat(tokens[3]);
    const y3d = parseFloat(tokens[4]);
    const z3d = parseFloat(tokens[5]);
    return new PubChemAtom(element, PubChemAtomType.FULL, x2d, y2d, x3d, y3d, z3d);
  }
}

// Signature for bonds, where a and b are PubChemAtoms of some type
class PubChemBond extends Bond {
  /**
   * @param {PubChemAtom*} a
   * @param {PubChemAtoms*} b
   * @param {number} order
   */
  constructor(a, b, order) {
    super(a, b);

    // @private {number}
    this.order = order;
  }

  /**
   * Returns serialized form of bond data including the bond order
   * @param {number} index - Index of bond within molecule
   *
   * @public
   * @override
   * @returns {string}
   */
  toSerial2(index) {
    return `${index}-${this.order}`;
  }

  /**
   * Parser for PubChemBond
   * @param {string} bondString
   * @param {Atom} connectedAtom
   * @param {Molecule} molecule
   *
   * @public
   * @returns {PubChemBond}
   */
  static parse(bondString, connectedAtom, molecule) {
    const tokens = bondString.split('-');
    const index = Number(tokens[0]);
    const order = Number(tokens[1]);
    return new PubChemBond(connectedAtom, molecule.atoms[index], order);
  }
}
CompleteMolecule.PubChemBond = PubChemBond;
buildAMolecule.register('CompleteMolecule', CompleteMolecule);
export default CompleteMolecule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdG9tIiwiRWxlbWVudCIsIkF0b21Ob2RlIiwiQzJIMk5vZGUiLCJDMkg0Tm9kZSIsIkMySDVDbE5vZGUiLCJDMkg1T0hOb2RlIiwiQzJINk5vZGUiLCJDSDJPTm9kZSIsIkNIM09ITm9kZSIsIkNINE5vZGUiLCJDbDJOb2RlIiwiQ08yTm9kZSIsIkNTMk5vZGUiLCJGMk5vZGUiLCJIMk5vZGUiLCJIMk9Ob2RlIiwiSDJTTm9kZSIsIkhDbE5vZGUiLCJIRk5vZGUiLCJOMk5vZGUiLCJOMk9Ob2RlIiwiTkgzTm9kZSIsIk5PMk5vZGUiLCJOT05vZGUiLCJPMk5vZGUiLCJPRjJOb2RlIiwiUDROb2RlIiwiUENsM05vZGUiLCJQQ2w1Tm9kZSIsIlBGM05vZGUiLCJQSDNOb2RlIiwiU08yTm9kZSIsIlNPM05vZGUiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJOb2RlIiwiYnVpbGRBTW9sZWN1bGUiLCJCdWlsZEFNb2xlY3VsZVN0cmluZ3MiLCJCb25kIiwiTW9sZWN1bGVTdHJ1Y3R1cmUiLCJPRkZTRVQiLCJUUkFOU0xBVEFCTEVfTU9MRUNVTEVfTkFNRVMiLCJhY2V0eWxlbmUiLCJhbW1vbmlhIiwiYm9yYW5lIiwiY2FyYm9uRGlveGlkZSIsImNhcmJvbk1vbm94aWRlIiwiY2hsb3JvbWV0aGFuZSIsImV0aHlsZW5lIiwiZmx1b3JvbWV0aGFuZSIsImZvcm1hbGRlaHlkZSIsImh5ZHJvZ2VuQ3lhbmlkZSIsImh5ZHJvZ2VuUGVyb3hpZGUiLCJoeWRyb2dlblN1bGZpZGUiLCJtZXRoYW5lIiwibW9sZWN1bGFyQ2hsb3JpbmUiLCJtb2xlY3VsYXJGbHVvcmluZSIsIm1vbGVjdWxhckh5ZHJvZ2VuIiwibW9sZWN1bGFyTml0cm9nZW4iLCJtb2xlY3VsYXJPeHlnZW4iLCJuaXRyaWNPeGlkZSIsIm5pdHJvdXNPeGlkZSIsIm96b25lIiwicGhvc3BoaW5lIiwic2lsYW5lIiwic3VsZnVyRGlveGlkZSIsInRyaWZsdW9yb2JvcmFuZSIsIndhdGVyIiwibm9kZVR5cGVzIiwiQ29tcGxldGVNb2xlY3VsZSIsImNvbnN0cnVjdG9yIiwiY29tbW9uTmFtZSIsIm1vbGVjdWxhckZvcm11bGEiLCJhdG9tQ291bnQiLCJib25kQ291bnQiLCJoYXMyZCIsImhhczNkIiwiY2lkIiwiZmlsdGVyQ29tbW9uTmFtZSIsInJlc3VsdCIsImluZGV4T2YiLCJzbGljZSIsImxlbmd0aCIsImNhcGl0YWxpemUiLCJnZXREaXNwbGF5TmFtZSIsInRyYW5zbGF0YWJsZUNvbW1vbk5hbWUiLCJfIiwiY2FtZWxDYXNlIiwiY3JlYXRlUHNldWRvM0ROb2RlIiwibW9sZWN1bGFyRm9ybXVsYVR5cGUiLCJpIiwiTm9kZVR5cGUiLCJuYW1lIiwid3JhcHBlcnMiLCJzb3J0QnkiLCJhdG9tcyIsImF0b20iLCJ6M2QiLCJjaGlsZHJlbiIsIm1hcCIsImF0b21XcmFwcGVyIiwiZWxlbWVudCIsIngiLCJ4MmQiLCJ5IiwieTJkIiwidG9TZXJpYWwyIiwiZm9ybWF0IiwiY2FsbCIsInN0ciIsImNoYXJhY3RlcnMiLCJzcGxpdCIsImxhc3RXYXNTcGFjZSIsImNoYXJhY3RlciIsInRlc3QiLCJ0b1VwcGVyQ2FzZSIsImpvaW4iLCJmcm9tU3RyaW5nIiwibGluZSIsInRva2VucyIsImlkeCIsIk51bWJlciIsImNvbXBsZXRlTW9sZWN1bGUiLCJzeW1ib2wiLCJwYXJzZUZsb2F0IiwieDNkIiwieTNkIiwiUHViQ2hlbUF0b20iLCJnZXRFbGVtZW50QnlTeW1ib2wiLCJhZGRBdG9tIiwiYSIsImIiLCJvcmRlciIsImJvbmQiLCJQdWJDaGVtQm9uZCIsImFkZEJvbmQiLCJmcm9tU2VyaWFsMiIsImNpZFN0cmluZyIsImhhczJkQW5kM2QiLCJidXJuZWRMZW5ndGgiLCJhdG9tUGFyc2VyIiwicGFyc2VGdWxsIiwicGFyc2UzZCIsInBhcnNlMmQiLCJtb2xlY3VsZSIsInBhcnNlIiwiUHViQ2hlbUF0b21UeXBlIiwiYnlLZXlzIiwidHlwZSIsInRvU3RyaW5nIiwiVFdPX0RJTUVOU0lPTiIsIlRIUkVFX0RJTUVOU0lPTiIsIkZVTEwiLCJFcnJvciIsImF0b21TdHJpbmciLCJpbmRleCIsImJvbmRTdHJpbmciLCJjb25uZWN0ZWRBdG9tIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb21wbGV0ZU1vbGVjdWxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBjb21wbGV0ZSAoc3RhYmxlKSBtb2xlY3VsZSB3aXRoIGEgbmFtZSBhbmQgc3RydWN0dXJlLiBJbmNsdWRlcyAyZCBhbmQgM2QgcmVwcmVzZW50YXRpb25zLFxyXG4gKiBhbmQgY2FuIGdlbmVyYXRlIHZpc3VhbHMgb2YgYm90aCB0eXBlcy5cclxuICpcclxuICogSXQncyBhIE1vbGVjdWxlU3RydWN0dXJlIHVzaW5nIFB1YkNoZW1BdG9tXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEF0b20gZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9BdG9tLmpzJztcclxuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9FbGVtZW50LmpzJztcclxuaW1wb3J0IEF0b21Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvQXRvbU5vZGUuanMnO1xyXG5pbXBvcnQgQzJIMk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9DMkgyTm9kZS5qcyc7XHJcbmltcG9ydCBDMkg0Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL0MySDROb2RlLmpzJztcclxuaW1wb3J0IEMySDVDbE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9DMkg1Q2xOb2RlLmpzJztcclxuaW1wb3J0IEMySDVPSE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9DMkg1T0hOb2RlLmpzJztcclxuaW1wb3J0IEMySDZOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvQzJINk5vZGUuanMnO1xyXG5pbXBvcnQgQ0gyT05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9DSDJPTm9kZS5qcyc7XHJcbmltcG9ydCBDSDNPSE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9DSDNPSE5vZGUuanMnO1xyXG5pbXBvcnQgQ0g0Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL0NINE5vZGUuanMnO1xyXG5pbXBvcnQgQ2wyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL0NsMk5vZGUuanMnO1xyXG5pbXBvcnQgQ08yTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL0NPMk5vZGUuanMnO1xyXG5pbXBvcnQgQ1MyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL0NTMk5vZGUuanMnO1xyXG5pbXBvcnQgRjJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvRjJOb2RlLmpzJztcclxuaW1wb3J0IEgyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL0gyTm9kZS5qcyc7XHJcbmltcG9ydCBIMk9Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvSDJPTm9kZS5qcyc7XHJcbmltcG9ydCBIMlNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvSDJTTm9kZS5qcyc7XHJcbmltcG9ydCBIQ2xOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvSENsTm9kZS5qcyc7XHJcbmltcG9ydCBIRk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9IRk5vZGUuanMnO1xyXG5pbXBvcnQgTjJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvTjJOb2RlLmpzJztcclxuaW1wb3J0IE4yT05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9OMk9Ob2RlLmpzJztcclxuaW1wb3J0IE5IM05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9OSDNOb2RlLmpzJztcclxuaW1wb3J0IE5PMk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9OTzJOb2RlLmpzJztcclxuaW1wb3J0IE5PTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL05PTm9kZS5qcyc7XHJcbmltcG9ydCBPMk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9PMk5vZGUuanMnO1xyXG5pbXBvcnQgT0YyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL25vZGVzL09GMk5vZGUuanMnO1xyXG5pbXBvcnQgUDROb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvUDROb2RlLmpzJztcclxuaW1wb3J0IFBDbDNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvUENsM05vZGUuanMnO1xyXG5pbXBvcnQgUENsNU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9QQ2w1Tm9kZS5qcyc7XHJcbmltcG9ydCBQRjNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvUEYzTm9kZS5qcyc7XHJcbmltcG9ydCBQSDNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvUEgzTm9kZS5qcyc7XHJcbmltcG9ydCBTTzJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvU08yTm9kZS5qcyc7XHJcbmltcG9ydCBTTzNOb2RlIGZyb20gJy4uLy4uLy4uLy4uL25pdHJvZ2x5Y2VyaW4vanMvbm9kZXMvU08zTm9kZS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQnVpbGRBTW9sZWN1bGVTdHJpbmdzIGZyb20gJy4uLy4uL0J1aWxkQU1vbGVjdWxlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCb25kIGZyb20gJy4vQm9uZC5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVN0cnVjdHVyZSBmcm9tICcuL01vbGVjdWxlU3RydWN0dXJlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBPRkZTRVQgPSAyLjU7IC8vIHVzZWQgdG8gbW9kZWwgb3VyIGF0b21zIHdpdGggb25seSAyZCBkYXRhIGludG8gYSAzZCByZXByZXNlbnRhdGlvblxyXG5cclxuLy8gVXNlZCB0byBhdm9pZCBzdHJpcHBpbmcgb3V0IHVudXNlZCBzdHJpbmdzLCB3aGVuIHN0cmluZy5qc29uIGlzIGFjY2Vzc2VkIHZpYSBicmFja2V0IG5vdGF0aW9uLiBTZWUgZ2V0RGlzcGxheU5hbWUoKS5cclxuY29uc3QgVFJBTlNMQVRBQkxFX01PTEVDVUxFX05BTUVTID0ge1xyXG4gIGFjZXR5bGVuZTogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLmFjZXR5bGVuZSxcclxuICBhbW1vbmlhOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MuYW1tb25pYSxcclxuICBib3JhbmU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy5ib3JhbmUsXHJcbiAgY2FyYm9uRGlveGlkZTogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLmNhcmJvbkRpb3hpZGUsXHJcbiAgY2FyYm9uTW9ub3hpZGU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy5jYXJib25Nb25veGlkZSxcclxuICBjaGxvcm9tZXRoYW5lOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MuY2hsb3JvbWV0aGFuZSxcclxuICBldGh5bGVuZTogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLmV0aHlsZW5lLFxyXG4gIGZsdW9yb21ldGhhbmU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy5mbHVvcm9tZXRoYW5lLFxyXG4gIGZvcm1hbGRlaHlkZTogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLmZvcm1hbGRlaHlkZSxcclxuICBoeWRyb2dlbkN5YW5pZGU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy5oeWRyb2dlbkN5YW5pZGUsXHJcbiAgaHlkcm9nZW5QZXJveGlkZTogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLmh5ZHJvZ2VuUGVyb3hpZGUsXHJcbiAgaHlkcm9nZW5TdWxmaWRlOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MuaHlkcm9nZW5TdWxmaWRlLFxyXG4gIG1ldGhhbmU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy5tZXRoYW5lLFxyXG4gIG1vbGVjdWxhckNobG9yaW5lOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MubW9sZWN1bGFyQ2hsb3JpbmUsXHJcbiAgbW9sZWN1bGFyRmx1b3JpbmU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy5tb2xlY3VsYXJGbHVvcmluZSxcclxuICBtb2xlY3VsYXJIeWRyb2dlbjogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLm1vbGVjdWxhckh5ZHJvZ2VuLFxyXG4gIG1vbGVjdWxhck5pdHJvZ2VuOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MubW9sZWN1bGFyTml0cm9nZW4sXHJcbiAgbW9sZWN1bGFyT3h5Z2VuOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MubW9sZWN1bGFyT3h5Z2VuLFxyXG4gIG5pdHJpY094aWRlOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3Mubml0cmljT3hpZGUsXHJcbiAgbml0cm91c094aWRlOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3Mubml0cm91c094aWRlLFxyXG4gIG96b25lOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3Mub3pvbmUsXHJcbiAgcGhvc3BoaW5lOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3MucGhvc3BoaW5lLFxyXG4gIHNpbGFuZTogQnVpbGRBTW9sZWN1bGVTdHJpbmdzLnNpbGFuZSxcclxuICBzdWxmdXJEaW94aWRlOiBCdWlsZEFNb2xlY3VsZVN0cmluZ3Muc3VsZnVyRGlveGlkZSxcclxuICB0cmlmbHVvcm9ib3JhbmU6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy50cmlmbHVvcm9ib3JhbmUsXHJcbiAgd2F0ZXI6IEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy53YXRlclxyXG59O1xyXG5cclxuLy8gTm9kZSB0eXBlcyB1c2VkIGZvciBtb2xlY3VsZXNcclxuY29uc3Qgbm9kZVR5cGVzID0gW1xyXG4gIENsMk5vZGUsIENPMk5vZGUsIENPMk5vZGUsIENTMk5vZGUsIEYyTm9kZSwgSDJOb2RlLCBOMk5vZGUsIE5PTm9kZSwgTjJPTm9kZSwgTzJOb2RlLCBDMkgyTm9kZSwgQzJINE5vZGUsIEMySDVDbE5vZGUsXHJcbiAgQzJINU9ITm9kZSwgQzJINk5vZGUsIENIMk9Ob2RlLCBDSDNPSE5vZGUsIENINE5vZGUsIEgyT05vZGUsIEgyU05vZGUsIEhDbE5vZGUsIEhGTm9kZSwgTkgzTm9kZSwgTk8yTm9kZSwgT0YyTm9kZSxcclxuICBQNE5vZGUsIFBDbDNOb2RlLCBQQ2w1Tm9kZSwgUEYzTm9kZSwgUEgzTm9kZSwgU08yTm9kZSwgU08zTm9kZVxyXG5dO1xyXG5cclxuY2xhc3MgQ29tcGxldGVNb2xlY3VsZSBleHRlbmRzIE1vbGVjdWxlU3RydWN0dXJlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29tbW9uTmFtZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtb2xlY3VsYXJGb3JtdWxhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGF0b21Db3VudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib25kQ291bnRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhczJkXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBoYXMzZFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb21tb25OYW1lLCBtb2xlY3VsYXJGb3JtdWxhLCBhdG9tQ291bnQsIGJvbmRDb3VudCwgaGFzMmQsIGhhczNkICkge1xyXG4gICAgc3VwZXIoIGF0b21Db3VudCwgYm9uZENvdW50ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfSBhcyBzYWlkIGJ5IHB1YmNoZW0gKG9yIG92ZXJyaWRkZW4pXHJcbiAgICB0aGlzLmNvbW1vbk5hbWUgPSBjb21tb25OYW1lO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMuY2lkID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7c3RyaW5nfSBhcyBzYWlkIGJ5IHB1YmNoZW1cclxuICAgIHRoaXMubW9sZWN1bGFyRm9ybXVsYSA9IG1vbGVjdWxhckZvcm11bGE7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICB0aGlzLmhhczJkID0gaGFzMmQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICB0aGlzLmhhczNkID0gaGFzM2Q7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RyaXAgb3V0IHRoZSAnbW9sZWN1bGFyICcgcGFydCBvZiB0aGUgc3RyaW5nIGFuZCBwcm9jZXNzIHRoZSByZXN1bHQuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBmaWx0ZXJDb21tb25OYW1lKCkge1xyXG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuY29tbW9uTmFtZTtcclxuICAgIGlmICggcmVzdWx0LmluZGV4T2YoICdtb2xlY3VsYXIgJyApID09PSAwICkge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuc2xpY2UoICdtb2xlY3VsYXIgJy5sZW5ndGggKTtcclxuICAgIH1cclxuICAgIHJldHVybiBDb21wbGV0ZU1vbGVjdWxlLmNhcGl0YWxpemUoIHJlc3VsdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSB0cmFuc2xhdGVkIGRpc3BsYXkgbmFtZSBpZiBwb3NzaWJsZS4gVGhpcyBkb2VzIGEgd2VpcmQgbG9va3VwIHNvIHRoYXQgd2UgY2FuIG9ubHkgbGlzdCBzb21lIG9mIHRoZSBuYW1lcyBpbiB0aGVcclxuICAgKiB0cmFuc2xhdGlvbiwgYnV0IGNhbiBhY2NlcHQgYW4gZXZlbiBsYXJnZXIgbnVtYmVyIG9mIHRyYW5zbGF0ZWQgbmFtZXMgaW4gYSB0cmFuc2xhdGlvbiBmaWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnNcclxuICAgKi9cclxuICBnZXREaXNwbGF5TmFtZSgpIHtcclxuICAgIC8vIGZpcnN0IGNoZWNrIGlmIHdlIGhhdmUgdGhlIG5hbWUgdHJhbnNsYXRlZC4gRG8gTk9UIHdhcm4gb24gbWlzc2luZ1xyXG4gICAgY29uc3QgdHJhbnNsYXRhYmxlQ29tbW9uTmFtZSA9IFRSQU5TTEFUQUJMRV9NT0xFQ1VMRV9OQU1FU1sgXy5jYW1lbENhc2UoIHRoaXMuY29tbW9uTmFtZSApIF07XHJcbiAgICBpZiAoIHRyYW5zbGF0YWJsZUNvbW1vbk5hbWUgKSB7XHJcbiAgICAgIHJldHVybiB0cmFuc2xhdGFibGVDb21tb25OYW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGlmIHdlIGRpZG4ndCBmaW5kIGl0IGluIHRoZSBzdHJpbmdzIGZpbGUsIHB1bGwgaXQgZnJvbSBvdXIgRW5nbGlzaCBkYXRhXHJcbiAgICAgIHJldHVybiB0aGlzLmNvbW1vbk5hbWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIG5vZGUgdGhhdCByZXByZXNlbnRzIGEgMmQgYnV0IHF1YXNpLTNEIHZlcnNpb25cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBjcmVhdGVQc2V1ZG8zRE5vZGUoKSB7XHJcbiAgICBjb25zdCBtb2xlY3VsYXJGb3JtdWxhID0gdGhpcy5tb2xlY3VsYXJGb3JtdWxhO1xyXG4gICAgY29uc3QgbW9sZWN1bGFyRm9ybXVsYVR5cGUgPSBgJHttb2xlY3VsYXJGb3JtdWxhfU5vZGVgO1xyXG5cclxuICAgIC8vIGlmIHdlIGNhbiBmaW5kIGl0IGluIHRoZSBjb21tb24gY2hlbWlzdHJ5IG5vZGVzLCB1c2UgdGhhdFxyXG4gICAgY29uc3QgbGVuZ3RoID0gbm9kZVR5cGVzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBOb2RlVHlwZSA9IG5vZGVUeXBlc1sgaSBdO1xyXG4gICAgICBpZiAoIE5vZGVUeXBlLm5hbWUgPT09IG1vbGVjdWxhckZvcm11bGFUeXBlIHx8ICggTm9kZVR5cGUubmFtZSA9PT0gJ05IM05vZGUnICYmIG1vbGVjdWxhckZvcm11bGEgPT09ICdIM04nICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlVHlwZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb3RoZXJ3aXNlLCB1c2Ugb3VyIDJkIHBvc2l0aW9ucyB0byBjb25zdHJ1Y3QgYSB2ZXJzaW9uLiB3ZSBnZXQgdGhlIGNvcnJlY3QgYmFjay10by1mcm9udCByZW5kZXJpbmdcclxuICAgIGNvbnN0IHdyYXBwZXJzID0gXy5zb3J0QnkoIHRoaXMuYXRvbXMsIGF0b20gPT4ge1xyXG4gICAgICByZXR1cm4gYXRvbS56M2Q7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IHdyYXBwZXJzLm1hcCggYXRvbVdyYXBwZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgQXRvbU5vZGUoIGF0b21XcmFwcGVyLmVsZW1lbnQsIHtcclxuXHJcbiAgICAgICAgICAvLyBjdXN0b20gc2NhbGUgZm9yIG5vd1xyXG4gICAgICAgICAgeDogYXRvbVdyYXBwZXIueDJkICogMTUsXHJcbiAgICAgICAgICB5OiBhdG9tV3JhcHBlci55MmQgKiAxNVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHNlcmlhbGl6ZWQgZm9ybSBvZiBjb21wbGV0ZSBtb2xlY3VsZSBkYXRhXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1NlcmlhbDIoKSB7XHJcbiAgICAvLyBhZGQgaW4gYSBoZWFkZXJcclxuICAgIGNvbnN0IGZvcm1hdCA9ICggdGhpcy5oYXMzZCA/ICggdGhpcy5oYXMyZCA/ICdmdWxsJyA6ICczZCcgKSA6ICcyZCcgKTtcclxuICAgIHJldHVybiBgJHt0aGlzLmNvbW1vbk5hbWV9fCR7dGhpcy5tb2xlY3VsYXJGb3JtdWxhfXwke3RoaXMuY2lkfXwke2Zvcm1hdH18JHtzdXBlci50b1NlcmlhbDIuY2FsbCggdGhpcyApfWA7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc3RhdGljIGNhcGl0YWxpemUoIHN0ciApIHtcclxuICAgIGNvbnN0IGNoYXJhY3RlcnMgPSBzdHIuc3BsaXQoICcnICk7XHJcbiAgICBsZXQgbGFzdFdhc1NwYWNlID0gdHJ1ZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoYXJhY3RlcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNoYXJhY3RlciA9IGNoYXJhY3RlcnNbIGkgXTtcclxuXHJcbiAgICAgIC8vIHdoaXRlc3BhY2UgY2hlY2sgaW4gZ2VuZXJhbFxyXG4gICAgICBpZiAoIC9cXHMvLnRlc3QoIGNoYXJhY3RlciApICkge1xyXG4gICAgICAgIGxhc3RXYXNTcGFjZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKCBsYXN0V2FzU3BhY2UgJiYgL1thLXpdLy50ZXN0KCBjaGFyYWN0ZXIgKSApIHtcclxuICAgICAgICAgIGNoYXJhY3RlcnNbIGkgXSA9IGNoYXJhY3Rlci50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsYXN0V2FzU3BhY2UgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNoYXJhY3RlcnMuam9pbiggJycgKTtcclxuICB9XHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIHNlcmlhbGl6YXRpb25cclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgYSBtb2xlY3VsZSBvdXQgb2YgYSBwaXBlLXNlcGFyYXRlZCBsaW5lLlxyXG4gICAqIFdBUk5JTkc6IHRoaXMgYWx3YXlzIHdyaXRlcyBvdXQgaW4gYSBcImZ1bGxcIiBjb25maWd1cmF0aW9uLCBldmVuIGlmIHRoZSBkYXRhIHdhc24ndCBjb250YWluZWQgYmVmb3JlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxpbmUgQSBzdHJpbmcgdGhhdCBpcyBlc3NlbnRpYWxseSBhIHNlcmlhbGl6ZWQgbW9sZWN1bGVcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Q29tcGxldGVNb2xlY3VsZX0gdGhhdCBpcyBwcm9wZXJseSBjb25zdHJ1Y3RlZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tU3RyaW5nKCBsaW5lICkge1xyXG4gICAgbGV0IGk7XHJcbiAgICBjb25zdCB0b2tlbnMgPSBsaW5lLnNwbGl0KCAnfCcgKTtcclxuICAgIGxldCBpZHggPSAwO1xyXG4gICAgY29uc3QgY29tbW9uTmFtZSA9IHRva2Vuc1sgaWR4KysgXTtcclxuICAgIGNvbnN0IG1vbGVjdWxhckZvcm11bGEgPSB0b2tlbnNbIGlkeCsrIF07XHJcbiAgICBjb25zdCBhdG9tQ291bnQgPSBOdW1iZXIoIHRva2Vuc1sgaWR4KysgXSApO1xyXG4gICAgY29uc3QgYm9uZENvdW50ID0gTnVtYmVyKCB0b2tlbnNbIGlkeCsrIF0gKTtcclxuICAgIGNvbnN0IGNvbXBsZXRlTW9sZWN1bGUgPSBuZXcgQ29tcGxldGVNb2xlY3VsZSggY29tbW9uTmFtZSwgbW9sZWN1bGFyRm9ybXVsYSwgYXRvbUNvdW50LCBib25kQ291bnQsIHRydWUsIHRydWUgKTtcclxuXHJcbiAgICAvLyBmb3IgZWFjaCBhdG9tLCByZWFkIGl0cyBzeW1ib2wsIHRoZW4gMmQgY29vcmRpbmF0ZXMsIHRoZW4gM2QgY29vcmRpbmF0ZXMgKHRvdGFsIG9mIDYgZmllbGRzKVxyXG4gICAgZm9yICggaSA9IDA7IGkgPCBhdG9tQ291bnQ7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc3ltYm9sID0gdG9rZW5zWyBpZHgrKyBdO1xyXG4gICAgICBjb25zdCB4MmQgPSBwYXJzZUZsb2F0KCB0b2tlbnNbIGlkeCsrIF0gKTtcclxuICAgICAgY29uc3QgeTJkID0gcGFyc2VGbG9hdCggdG9rZW5zWyBpZHgrKyBdICk7XHJcbiAgICAgIGNvbnN0IHgzZCA9IHBhcnNlRmxvYXQoIHRva2Vuc1sgaWR4KysgXSApO1xyXG4gICAgICBjb25zdCB5M2QgPSBwYXJzZUZsb2F0KCB0b2tlbnNbIGlkeCsrIF0gKTtcclxuICAgICAgY29uc3QgejNkID0gcGFyc2VGbG9hdCggdG9rZW5zWyBpZHgrKyBdICk7XHJcbiAgICAgIGNvbnN0IGF0b20gPSBuZXcgUHViQ2hlbUF0b20oIEVsZW1lbnQuZ2V0RWxlbWVudEJ5U3ltYm9sKCBzeW1ib2wgKSwgeDJkLCB5MmQsIHgzZCwgeTNkLCB6M2QgKTtcclxuICAgICAgY29tcGxldGVNb2xlY3VsZS5hZGRBdG9tKCBhdG9tICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZm9yIGVhY2ggYm9uZCwgcmVhZCBhdG9tIGluZGljZXMgKDIgb2YgdGhlbSwgd2hpY2ggYXJlIDEtaW5kZXhlZCksIGFuZCB0aGVuIHRoZSBvcmRlciBvZiB0aGUgYm9uZCAoc2luZ2xlLCBkb3VibGUsIHRyaXBsZSwgZXRjLilcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgYm9uZENvdW50OyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGEgPSBOdW1iZXIoIHRva2Vuc1sgaWR4KysgXSApO1xyXG4gICAgICBjb25zdCBiID0gTnVtYmVyKCB0b2tlbnNbIGlkeCsrIF0gKTtcclxuICAgICAgY29uc3Qgb3JkZXIgPSBOdW1iZXIoIHRva2Vuc1sgaWR4KysgXSApO1xyXG4gICAgICBjb25zdCBib25kID0gbmV3IFB1YkNoZW1Cb25kKCBjb21wbGV0ZU1vbGVjdWxlLmF0b21zWyBhIC0gMSBdLCBjb21wbGV0ZU1vbGVjdWxlLmF0b21zWyBiIC0gMSBdLCBvcmRlciApOyAvLyAtMSBzaW5jZSBvdXIgZm9ybWF0IGlzIDEtYmFzZWRcclxuICAgICAgY29tcGxldGVNb2xlY3VsZS5hZGRCb25kKCBib25kICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmlsbGVkIGluIGJ5IHBhcnNpbmcgY29tcGxldGVNb2xlY3VsZVxyXG4gICAgY29tcGxldGVNb2xlY3VsZS5jaWQgPSBOdW1iZXIoIHRva2Vuc1sgaWR4KysgXSApO1xyXG5cclxuICAgIHJldHVybiBjb21wbGV0ZU1vbGVjdWxlO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsaW5lXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge01vbGVjdWxlU3RydWN0dXJlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tU2VyaWFsMiggbGluZSApIHtcclxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAgICogZXh0cmFjdCBoZWFkZXJcclxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbiAgICBjb25zdCB0b2tlbnMgPSBsaW5lLnNwbGl0KCAnfCcgKTtcclxuICAgIGxldCBpZHggPSAwO1xyXG4gICAgY29uc3QgY29tbW9uTmFtZSA9IHRva2Vuc1sgaWR4KysgXTtcclxuICAgIGNvbnN0IG1vbGVjdWxhckZvcm11bGEgPSB0b2tlbnNbIGlkeCsrIF07XHJcbiAgICBjb25zdCBjaWRTdHJpbmcgPSB0b2tlbnNbIGlkeCsrIF07XHJcbiAgICBjb25zdCBjaWQgPSBOdW1iZXIoIGNpZFN0cmluZyApO1xyXG4gICAgY29uc3QgZm9ybWF0ID0gdG9rZW5zWyBpZHgrKyBdO1xyXG5cclxuICAgIGNvbnN0IGhhczJkQW5kM2QgPSBmb3JtYXQgPT09ICdmdWxsJztcclxuICAgIGNvbnN0IGhhczJkID0gZm9ybWF0ID09PSAnMmQnIHx8IGhhczJkQW5kM2Q7XHJcbiAgICBjb25zdCBoYXMzZCA9IGZvcm1hdCA9PT0gJzNkJyB8fCBoYXMyZEFuZDNkO1xyXG4gICAgY29uc3QgYnVybmVkTGVuZ3RoID0gY29tbW9uTmFtZS5sZW5ndGggKyAxICsgbW9sZWN1bGFyRm9ybXVsYS5sZW5ndGggKyAxICsgY2lkU3RyaW5nLmxlbmd0aCArIDEgKyBmb3JtYXQubGVuZ3RoICsgMTtcclxuXHJcbiAgICAvLyBzZWxlY3QgdGhlIGF0b20gcGFyc2VyIGRlcGVuZGluZyBvbiB0aGUgZm9ybWF0XHJcbiAgICBjb25zdCBhdG9tUGFyc2VyID0gaGFzM2QgPyAoIGhhczJkQW5kM2QgPyBQdWJDaGVtQXRvbS5wYXJzZUZ1bGwgOiBQdWJDaGVtQXRvbS5wYXJzZTNkICkgOiBQdWJDaGVtQXRvbS5wYXJzZTJkO1xyXG5cclxuICAgIHJldHVybiBNb2xlY3VsZVN0cnVjdHVyZS5mcm9tU2VyaWFsMiggbGluZS5zbGljZSggYnVybmVkTGVuZ3RoICksICggYXRvbUNvdW50LCBib25kQ291bnQgKSA9PiB7XHJcbiAgICAgIGNvbnN0IG1vbGVjdWxlID0gbmV3IENvbXBsZXRlTW9sZWN1bGUoIGNvbW1vbk5hbWUsIG1vbGVjdWxhckZvcm11bGEsIGF0b21Db3VudCwgYm9uZENvdW50LCBoYXMyZCwgaGFzM2QgKTtcclxuICAgICAgbW9sZWN1bGUuY2lkID0gY2lkO1xyXG4gICAgICByZXR1cm4gbW9sZWN1bGU7XHJcbiAgICB9LCBhdG9tUGFyc2VyLCBQdWJDaGVtQm9uZC5wYXJzZSApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU2lnbmF0dXJlIGZvciBBdG9tIHdpdGhvdXQgMmQgb3IgM2QgcmVwcmVzZW50YXRpb25cclxuY29uc3QgUHViQ2hlbUF0b21UeXBlID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnVFdPX0RJTUVOU0lPTicsICdUSFJFRV9ESU1FTlNJT04nLCAnRlVMTCcgXSApO1xyXG5cclxuY2xhc3MgUHViQ2hlbUF0b20gZXh0ZW5kcyBBdG9tIHtcclxuICBjb25zdHJ1Y3RvciggZWxlbWVudCwgdHlwZSwgeDJkLCB5MmQsIHgzZCwgeTNkLCB6M2QgKSB7XHJcbiAgICBzdXBlciggZWxlbWVudCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1B1YkNoZW1BdG9tfVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy54MmQgPSB4MmQ7XHJcbiAgICB0aGlzLnkyZCA9IHkyZDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLngzZCA9IHgzZDtcclxuICAgIHRoaXMueTNkID0geTNkO1xyXG4gICAgdGhpcy56M2QgPSB6M2Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdHJpbmdpZnkgdGhlIHN0cnVjdHVyZSBvZiB0aGUgYXRvbS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHN0YXRpYyB0b1N0cmluZygpIHtcclxuICAgIGlmICggdGhpcy50eXBlID09PSBQdWJDaGVtQXRvbVR5cGUuVFdPX0RJTUVOU0lPTiApIHtcclxuICAgICAgcmV0dXJuIGAke3N1cGVyLnRvU3RyaW5nKCl9ICR7dGhpcy54MmR9ICR7dGhpcy55MmR9YDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09IFB1YkNoZW1BdG9tVHlwZS5USFJFRV9ESU1FTlNJT04gKSB7XHJcbiAgICAgIHJldHVybiBgJHtzdXBlci50b1N0cmluZygpfSAke3RoaXMueDNkfSAke3RoaXMueTNkfSAke3RoaXMuejNkfWA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy50eXBlID09PSBQdWJDaGVtQXRvbVR5cGUuRlVMTCApIHtcclxuICAgICAgcmV0dXJuIGAke3N1cGVyLnRvU3RyaW5nKCl9ICR7dGhpcy54MmR9ICR7dGhpcy55MmR9ICR7dGhpcy54M2R9ICR7dGhpcy55M2R9ICR7dGhpcy56M2R9YDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbnN1cHBvcnRlZCB0eXBlOiAke3RoaXMudHlwZX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQYXJzZXIgZm9yIFB1YkNoZW1BdG9tIHdpdGggb25seSAyZCBkYXRhXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0b21TdHJpbmdcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge1B1YkNoZW1BdG9tfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBwYXJzZTJkKCBhdG9tU3RyaW5nICkge1xyXG4gICAgY29uc3QgdG9rZW5zID0gYXRvbVN0cmluZy5zcGxpdCggJyAnICk7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gRWxlbWVudC5nZXRFbGVtZW50QnlTeW1ib2woIHRva2Vuc1sgMCBdICk7XHJcbiAgICBjb25zdCB4MmQgPSBwYXJzZUZsb2F0KCB0b2tlbnNbIDEgXSApO1xyXG4gICAgY29uc3QgeTJkID0gcGFyc2VGbG9hdCggdG9rZW5zWyAyIF0gKTtcclxuICAgIHJldHVybiBuZXcgUHViQ2hlbUF0b20oIGVsZW1lbnQsIFB1YkNoZW1BdG9tVHlwZS5UV09fRElNRU5TSU9OLCB4MmQsIHkyZCwgeDJkIC0gT0ZGU0VULCB5MmQsIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlciBmb3IgUHViQ2hlbUF0b20gd2l0aCBvbmx5IDNkIGRhdGFcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXRvbVN0cmluZ1xyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7UHViQ2hlbUF0b219XHJcbiAgICovXHJcbiAgc3RhdGljIHBhcnNlM2QoIGF0b21TdHJpbmcgKSB7XHJcbiAgICBjb25zdCB0b2tlbnMgPSBhdG9tU3RyaW5nLnNwbGl0KCAnICcgKTtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBFbGVtZW50LmdldEVsZW1lbnRCeVN5bWJvbCggdG9rZW5zWyAwIF0gKTtcclxuICAgIGNvbnN0IHgzZCA9IHBhcnNlRmxvYXQoIHRva2Vuc1sgMSBdICk7XHJcbiAgICBjb25zdCB5M2QgPSBwYXJzZUZsb2F0KCB0b2tlbnNbIDIgXSApO1xyXG4gICAgY29uc3QgejNkID0gcGFyc2VGbG9hdCggdG9rZW5zWyAzIF0gKTtcclxuICAgIHJldHVybiBuZXcgUHViQ2hlbUF0b20oIGVsZW1lbnQsIFB1YkNoZW1BdG9tVHlwZS5USFJFRV9ESU1FTlNJT04sIDAsIDAsIHgzZCwgeTNkLCB6M2QgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlciBmb3IgUHViQ2hlbUF0b20gd2l0aCAyZCBhbmQgM2QgZGF0YVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdG9tU3RyaW5nXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtQdWJDaGVtQXRvbX1cclxuICAgKi9cclxuICBzdGF0aWMgcGFyc2VGdWxsKCBhdG9tU3RyaW5nICkge1xyXG4gICAgY29uc3QgdG9rZW5zID0gYXRvbVN0cmluZy5zcGxpdCggJyAnICk7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gRWxlbWVudC5nZXRFbGVtZW50QnlTeW1ib2woIHRva2Vuc1sgMCBdICk7XHJcbiAgICBjb25zdCB4MmQgPSBwYXJzZUZsb2F0KCB0b2tlbnNbIDEgXSApO1xyXG4gICAgY29uc3QgeTJkID0gcGFyc2VGbG9hdCggdG9rZW5zWyAyIF0gKTtcclxuICAgIGNvbnN0IHgzZCA9IHBhcnNlRmxvYXQoIHRva2Vuc1sgMyBdICk7XHJcbiAgICBjb25zdCB5M2QgPSBwYXJzZUZsb2F0KCB0b2tlbnNbIDQgXSApO1xyXG4gICAgY29uc3QgejNkID0gcGFyc2VGbG9hdCggdG9rZW5zWyA1IF0gKTtcclxuICAgIHJldHVybiBuZXcgUHViQ2hlbUF0b20oIGVsZW1lbnQsIFB1YkNoZW1BdG9tVHlwZS5GVUxMLCB4MmQsIHkyZCwgeDNkLCB5M2QsIHozZCApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gU2lnbmF0dXJlIGZvciBib25kcywgd2hlcmUgYSBhbmQgYiBhcmUgUHViQ2hlbUF0b21zIG9mIHNvbWUgdHlwZVxyXG5jbGFzcyBQdWJDaGVtQm9uZCBleHRlbmRzIEJvbmQge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHViQ2hlbUF0b20qfSBhXHJcbiAgICogQHBhcmFtIHtQdWJDaGVtQXRvbXMqfSBiXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9yZGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGEsIGIsIG9yZGVyICkge1xyXG4gICAgc3VwZXIoIGEsIGIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5vcmRlciA9IG9yZGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBzZXJpYWxpemVkIGZvcm0gb2YgYm9uZCBkYXRhIGluY2x1ZGluZyB0aGUgYm9uZCBvcmRlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIEluZGV4IG9mIGJvbmQgd2l0aGluIG1vbGVjdWxlXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1NlcmlhbDIoIGluZGV4ICkge1xyXG4gICAgcmV0dXJuIGAke2luZGV4fS0ke3RoaXMub3JkZXJ9YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnNlciBmb3IgUHViQ2hlbUJvbmRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYm9uZFN0cmluZ1xyXG4gICAqIEBwYXJhbSB7QXRvbX0gY29ubmVjdGVkQXRvbVxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1B1YkNoZW1Cb25kfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBwYXJzZSggYm9uZFN0cmluZywgY29ubmVjdGVkQXRvbSwgbW9sZWN1bGUgKSB7XHJcbiAgICBjb25zdCB0b2tlbnMgPSBib25kU3RyaW5nLnNwbGl0KCAnLScgKTtcclxuICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyKCB0b2tlbnNbIDAgXSApO1xyXG4gICAgY29uc3Qgb3JkZXIgPSBOdW1iZXIoIHRva2Vuc1sgMSBdICk7XHJcbiAgICByZXR1cm4gbmV3IFB1YkNoZW1Cb25kKCBjb25uZWN0ZWRBdG9tLCBtb2xlY3VsZS5hdG9tc1sgaW5kZXggXSwgb3JkZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbkNvbXBsZXRlTW9sZWN1bGUuUHViQ2hlbUJvbmQgPSBQdWJDaGVtQm9uZDtcclxuXHJcbmJ1aWxkQU1vbGVjdWxlLnJlZ2lzdGVyKCAnQ29tcGxldGVNb2xlY3VsZScsIENvbXBsZXRlTW9sZWN1bGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ29tcGxldGVNb2xlY3VsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxJQUFJLE1BQU0sc0NBQXNDO0FBQ3ZELE9BQU9DLE9BQU8sTUFBTSx5Q0FBeUM7QUFDN0QsT0FBT0MsUUFBUSxNQUFNLGdEQUFnRDtBQUNyRSxPQUFPQyxRQUFRLE1BQU0sZ0RBQWdEO0FBQ3JFLE9BQU9DLFFBQVEsTUFBTSxnREFBZ0Q7QUFDckUsT0FBT0MsVUFBVSxNQUFNLGtEQUFrRDtBQUN6RSxPQUFPQyxVQUFVLE1BQU0sa0RBQWtEO0FBQ3pFLE9BQU9DLFFBQVEsTUFBTSxnREFBZ0Q7QUFDckUsT0FBT0MsUUFBUSxNQUFNLGdEQUFnRDtBQUNyRSxPQUFPQyxTQUFTLE1BQU0saURBQWlEO0FBQ3ZFLE9BQU9DLE9BQU8sTUFBTSwrQ0FBK0M7QUFDbkUsT0FBT0MsT0FBTyxNQUFNLCtDQUErQztBQUNuRSxPQUFPQyxPQUFPLE1BQU0sK0NBQStDO0FBQ25FLE9BQU9DLE9BQU8sTUFBTSwrQ0FBK0M7QUFDbkUsT0FBT0MsTUFBTSxNQUFNLDhDQUE4QztBQUNqRSxPQUFPQyxNQUFNLE1BQU0sOENB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