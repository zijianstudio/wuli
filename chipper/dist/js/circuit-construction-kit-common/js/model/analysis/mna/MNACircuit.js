// Copyright 2015-2022, University of Colorado Boulder

/**
 * Modified Nodal Analysis for a circuit.  An Equation is a sum of Terms equal to a numeric value.  A Term is composed
 * of a coefficient times a variable.  The variables are UnknownCurrent or UnknownVoltage.  The system of all
 * Equations is solved as a linear system.  Here is a good reference that was used during the development of this code
 * https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html
 *
 * No listeners are attached and hence no dispose implementation is necessary.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QRDecomposition from '../../../../../dot/js/QRDecomposition.js';
import Matrix from '../../../../../dot/js/Matrix.js';
import Utils from '../../../../../dot/js/Utils.js';
import arrayRemove from '../../../../../phet-core/js/arrayRemove.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNASolution from './MNASolution.js';
export default class MNACircuit {
  // the list of all the elements for ease of access

  // an object with index for all keys that have a node in the circuit, such as: {0:0, 1:1, 2:2, 7:7}

  // the number of nodes in the set

  constructor(batteries, resistors, currentSources) {
    assert && assert(batteries, 'batteries should be defined');
    assert && assert(resistors, 'resistors should be defined');
    assert && assert(currentSources, 'currentSources should be defined');
    this.batteries = batteries;
    this.resistors = resistors;
    this.currentSources = currentSources;
    this.elements = [...this.batteries, ...this.resistors, ...this.currentSources];
    this.nodeSet = {};
    for (let k = 0; k < this.elements.length; k++) {
      const element = this.elements[k];
      this.nodeSet[element.nodeId0] = element.nodeId0;
      this.nodeSet[element.nodeId1] = element.nodeId1;
    }
    this.nodeCount = _.size(this.nodeSet);

    // the node indices
    this.nodes = _.values(this.nodeSet);
  }

  /**
   * Returns a string representation of the circuit for debugging.
   */
  toString() {
    if (assert) {
      // stripped out for builds
      return `resistors:\n${this.resistors.map(resistorToString).join('\n')}\n` + `batteries:\n${this.batteries.map(batteryToString).join('\n')}\n` + `currentSources:\n${this.currentSources.map(c => c.toString()).join('\n')}`;
    } else {
      return 'toString() only defined when assertions are enabled';
    }
  }

  /**
   * Counts the number of unknown currents in the circuit.  There is an unknown current in each battery and
   * 0-resistance resistor.
   */
  getCurrentCount() {
    let numberOfResistanceFreeResistors = 0;
    for (let i = 0; i < this.resistors.length; i++) {
      if (this.resistors[i].resistance === 0) {
        numberOfResistanceFreeResistors++;
      }
    }
    return this.batteries.length + numberOfResistanceFreeResistors;
  }

  /**
   * Gets the number of variables for the system, one for each voltage and one for each current.
   */
  getNumVars() {
    return this.nodeCount + this.getCurrentCount();
  }

  /**
   * Sums all of the current leaving the node (subtracting current flowing into the node).
   *
   * @param nodeIndex - the node at which to compute current sources
   */
  getCurrentSourceTotal(nodeIndex) {
    let currentSourceTotal = 0.0;
    for (let i = 0; i < this.currentSources.length; i++) {
      const currentSource = this.currentSources[i];
      if (currentSource.nodeId1 === nodeIndex) {
        // positive current is entering the node, and the convention is for incoming current to be negative
        currentSourceTotal = currentSourceTotal - currentSource.current;
      }
      if (currentSource.nodeId0 === nodeIndex) {
        // positive current is leaving the node, and the convention is for outgoing current to be positive
        currentSourceTotal = currentSourceTotal + currentSource.current;
      }
    }
    return currentSourceTotal;
  }

  /**
   * Gets current conservation terms going into or out of a node. Incoming current is negative, outgoing is positive.
   * @param node - the node
   * @param side - 'nodeId0' for outgoing current or 'nodeId1' for incoming current
   * @param sign - 1 for incoming current and -1 for outgoing current
   * @param nodeTerms - to accumulate the result
   */
  getCurrentTerms(node, side, sign, nodeTerms) {
    // Each battery introduces an unknown current through the battery
    for (let i = 0; i < this.batteries.length; i++) {
      const battery = this.batteries[i];
      if (battery[side] === node) {
        nodeTerms.push(new Term(sign, new UnknownCurrent(battery)));
      }
    }
    for (let i = 0; i < this.resistors.length; i++) {
      const resistor = this.resistors[i];
      if (resistor[side] === node) {
        if (resistor.resistance === 0) {
          // Each resistor with 0 resistance introduces an unknown current, and v1=v2
          nodeTerms.push(new Term(sign, new UnknownCurrent(resistor)));
        } else {
          // Each resistor with nonzero resistance has unknown voltages
          nodeTerms.push(new Term(-sign / resistor.resistance, new UnknownVoltage(resistor.nodeId1)));
          nodeTerms.push(new Term(sign / resistor.resistance, new UnknownVoltage(resistor.nodeId0)));
        }
      }
    }
    return nodeTerms;
  }

  /**
   * Selects one node for each connected component to have the reference voltage of 0 volts.
   * @returns the node IDs selected for references
   */
  getReferenceNodeIds() {
    // The nodes which need to be visited.
    const toVisit = _.values(this.nodeSet);

    // Mark reference nodes as they are discovered
    const referenceNodeIds = [];
    while (toVisit.length > 0) {
      const referenceNodeId = toVisit[0];
      referenceNodeIds.push(referenceNodeId);
      const connectedNodeIds = this.getConnectedNodeIds(referenceNodeId);

      // No need to visit any nodes connected to the reference node, since their connected component already has a reference node.
      for (let i = 0; i < connectedNodeIds.length; i++) {
        arrayRemove(toVisit, connectedNodeIds[i]);
      }
    }
    return referenceNodeIds;
  }

  /**
   * Finds all nodes connected (by any path) to the given node
   */
  getConnectedNodeIds(node) {
    const visited = [];
    const toVisit = [node];
    while (toVisit.length > 0) {
      const nodeToVisit = toVisit.shift();
      visited.push(nodeToVisit);
      for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        if (element.containsNodeId(nodeToVisit)) {
          const oppositeNode = element.getOppositeNode(nodeToVisit);
          if (!visited.includes(oppositeNode)) {
            toVisit.push(oppositeNode);
          }
        }
      }
    }
    return _.uniq(visited);
  }

  /**
   * Returns an array of Equation instances that will be solved as a linear algebra problem to find the unknown
   * variables of the circuit.
   */
  getEquations() {
    const equations = [];

    // Reference node in each connected circuit element has a voltage of 0.0
    const referenceNodeIds = this.getReferenceNodeIds();
    for (let i = 0; i < referenceNodeIds.length; i++) {
      equations.push(new Equation(0, [new Term(1, new UnknownVoltage(referenceNodeIds[i]))]));
    }

    // phet.log && phet.log( referenceNodeIds );

    // For each node, charge is conserved
    const nodes = this.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const currentTerms = [];
      this.getCurrentTerms(node, 'nodeId1', +1, currentTerms);
      this.getCurrentTerms(node, 'nodeId0', -1, currentTerms);
      equations.push(new Equation(this.getCurrentSourceTotal(node), currentTerms));
    }

    // For each battery, voltage drop is given
    // Within the battery, the current flows from low to high potential, so V = -(v1-v0) in this case.
    // Because the battery moves the current from low voltage to high voltage.
    for (let i = 0; i < this.batteries.length; i++) {
      const battery = this.batteries[i];
      equations.push(new Equation(battery.voltage, [new Term(1, new UnknownVoltage(battery.nodeId0)), new Term(-1, new UnknownVoltage(battery.nodeId1))]));
    }

    // If resistor has no resistance, nodeId0 and nodeId1 should have same voltage
    for (let i = 0; i < this.resistors.length; i++) {
      const resistor = this.resistors[i];
      if (resistor.resistance === 0) {
        equations.push(new Equation(0, [new Term(1, new UnknownVoltage(resistor.nodeId0)), new Term(-1, new UnknownVoltage(resistor.nodeId1))]));
      }
    }
    return equations;
  }

  /**
   * Gets an array of the unknown currents in the circuit.
   */
  getUnknownCurrents() {
    const unknownCurrents = [];

    // Each battery has an unknown current
    for (let i = 0; i < this.batteries.length; i++) {
      unknownCurrents.push(new UnknownCurrent(this.batteries[i]));
    }

    // Treat resistors with R=0 as having unknown current and v1=v2
    for (let i = 0; i < this.resistors.length; i++) {
      if (this.resistors[i].resistance === 0) {
        unknownCurrents.push(new UnknownCurrent(this.resistors[i]));
      }
    }
    return unknownCurrents;
  }

  /**
   * Solves for all unknown currents and voltages in the circuit.
   */
  solve() {
    const equations = this.getEquations();
    const unknownCurrents = this.getUnknownCurrents();
    const unknownVoltages = this.nodes.map(node => new UnknownVoltage(node));
    const unknowns = [...unknownCurrents, ...unknownVoltages];

    // Gets the index of the specified unknown.
    const getIndex = unknown => {
      const index = getIndexByEquals(unknowns, unknown);
      assert && assert(index >= 0, 'unknown was missing');
      return index;
    };

    // Prepare the A and z matrices for the linear system Ax=z
    const A = new Matrix(equations.length, this.getNumVars());
    const z = new Matrix(equations.length, 1);

    // solve the linear matrix system for the unknowns
    let x;
    try {
      for (let i = 0; i < equations.length; i++) {
        equations[i].stamp(i, A, z, getIndex);
      }
      x = new QRDecomposition(A).solve(z);
    } catch (e) {
      // Sometimes a fuzz test gives a deficient matrix rank.  It is a rare error and I haven't got one in the
      // debugger yet to understand the cause.  Catch it and provide a solution of zeroes of the correct dimension
      // See https://github.com/phetsims/circuit-construction-kit-dc/issues/113
      x = new Matrix(A.n, 1);
    }
    if (phet.log) {
      console.log(getDebugInfo(this, A, z, equations, unknowns, x));
    }
    const voltageMap = new Map();
    for (let i = 0; i < unknownVoltages.length; i++) {
      const unknownVoltage = unknownVoltages[i];
      const rhs = x.get(getIndexByEquals(unknowns, unknownVoltage), 0);

      // Guard assertion because it is expensive to compute the debug info.
      if (assert && isNaN(rhs)) {
        assert && assert(!isNaN(rhs), `the right-hand-side-value must be a number. Instead it was ${rhs}. debug info=${getDebugInfo(this, A, z, equations, unknowns, x)}`);
      }
      voltageMap.set(unknownVoltage.node, rhs);
    }
    const currentMap = new Map();
    for (let i = 0; i < unknownCurrents.length; i++) {
      const unknownCurrent = unknownCurrents[i];
      currentMap.set(unknownCurrent.element, x.get(getIndexByEquals(unknowns, unknownCurrent), 0));
    }
    return new MNASolution(voltageMap, currentMap);
  }
}
circuitConstructionKitCommon.register('MNACircuit', MNACircuit);

/**
 * Find the index of an element in an array comparing with the equals() method.
 * Could have used lodash's _.findIndex, but this will be called many times per frame and could be faster without
 * lodash
 * @param array
 * @param element
 * @returns the index or -1 if not found
 */
const getIndexByEquals = (array, element) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].equals(element)) {
      return i;
    }
  }
  return -1;
};

/**
 * For debugging, display a Resistor as a string
 */
const resistorToString = resistor => `node${resistor.nodeId0} -> node${resistor.nodeId1} @ ${resistor.resistance} Ohms`;

/**
 * For debugging, display a Battery as a string
 */
const batteryToString = battery => `node${battery.nodeId0} -> node${battery.nodeId1} @ ${battery.voltage} Volts`;
class Term {
  // the coefficient for the term, like '7' in 7x

  // the variable for the term, like the x variable in 7x

  /**
   * @param coefficient - the multiplier for this term
   * @param variable - the variable for this term, like the x variable in 7x
   */
  constructor(coefficient, variable) {
    assert && assert(!isNaN(coefficient), 'coefficient cannot be NaN');
    this.coefficient = coefficient;
    this.variable = variable;
  }

  /**
   * Returns a string representation for debugging.
   */
  toTermString() {
    const prefix = this.coefficient === 1 ? '' : this.coefficient === -1 ? '-' : `${this.coefficient}*`;
    return prefix + this.variable.toTermName();
  }
}
class UnknownCurrent {
  constructor(element) {
    this.element = element;
  }

  /**
   * Returns the name of the term for debugging.
   */
  toTermName() {
    return `I${this.element.nodeId0}_${this.element.nodeId1}`;
  }

  /**
   * Two UnknownCurrents are equal if the refer to the same element.
   * @param other - an UnknownCurrent to compare with this one
   */
  equals(other) {
    return other.element === this.element;
  }
}
class UnknownVoltage {
  // the index of the node

  constructor(node) {
    this.node = node;
  }

  /**
   * Returns a string variable name for this term, for debugging.
   */
  toTermName() {
    return `V${this.node}`;
  }

  /**
   * Two UnknownVoltages are equal if they refer to the same node.
   * @param other - another object to compare with this one
   */
  equals(other) {
    return other.node === this.node;
  }
}
class Equation {
  /**
   * @param value - the value on the right hand side of the equation, such as x+y=7
   * @param terms
   */
  constructor(value, terms) {
    assert && assert(!isNaN(value));

    // the value of the equation.  For instance in x+3y=12, the value is 12
    this.value = value;

    // the terms on the left-hand side of the equation.  E.g., in 3x+y=12 the terms are 3x and y
    this.terms = terms;
  }

  /**
   * Enter this Equation into the given Matrices for solving the system.
   * @param row - the index of the row for this equation
   * @param a - the matrix of coefficients in Ax=z
   * @param z - the matrix on the right hand side in Ax=z
   * @param getColumn - (UnknownCurrent|UnknownVoltage) => number
   */
  stamp(row, a, z, getColumn) {
    // Set the equation's value into the solution matrix
    z.set(row, 0, this.value);

    // For each term, augment the coefficient matrix
    for (let i = 0; i < this.terms.length; i++) {
      const term = this.terms[i];
      const column = getColumn(term.variable);
      assert && assert(!isNaN(term.coefficient), 'coefficient should be a number');
      a.set(row, column, term.coefficient + a.get(row, column));
    }
  }

  /**
   * Returns a string representation for debugging.
   */
  toString() {
    const termList = [];
    for (let i = 0; i < this.terms.length; i++) {
      termList.push(this.terms[i].toTermString());
    }
    const result = `${termList.join('+')}=${this.value}`;

    // replace +- with -. For instance, x+-3 should just be x-3
    return result.replace('\\+\\-', '\\-');
  }
}
const getDebugInfo = (modifiedNodalAnalysisCircuit, A, z, equations, unknowns, x) => {
  const conditionNumber = A.cond();
  const debugInfo = `Debugging circuit: ${modifiedNodalAnalysisCircuit.toString()}
    equations:
${equations.join('\n')}

A.cond=1E${Utils.toFixed(Math.log10(conditionNumber), 4)} = ${Utils.toFixed(conditionNumber, 4)}  
A=\n${A.transpose().toString()}
z=\n${z.transpose().toString()}
unknowns=\n${unknowns.map(u => u.toTermName()).join(', ')}
x=\n${x.transpose().toString()}
    `;
  return debugInfo;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRUkRlY29tcG9zaXRpb24iLCJNYXRyaXgiLCJVdGlscyIsImFycmF5UmVtb3ZlIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIk1OQVNvbHV0aW9uIiwiTU5BQ2lyY3VpdCIsImNvbnN0cnVjdG9yIiwiYmF0dGVyaWVzIiwicmVzaXN0b3JzIiwiY3VycmVudFNvdXJjZXMiLCJhc3NlcnQiLCJlbGVtZW50cyIsIm5vZGVTZXQiLCJrIiwibGVuZ3RoIiwiZWxlbWVudCIsIm5vZGVJZDAiLCJub2RlSWQxIiwibm9kZUNvdW50IiwiXyIsInNpemUiLCJub2RlcyIsInZhbHVlcyIsInRvU3RyaW5nIiwibWFwIiwicmVzaXN0b3JUb1N0cmluZyIsImpvaW4iLCJiYXR0ZXJ5VG9TdHJpbmciLCJjIiwiZ2V0Q3VycmVudENvdW50IiwibnVtYmVyT2ZSZXNpc3RhbmNlRnJlZVJlc2lzdG9ycyIsImkiLCJyZXNpc3RhbmNlIiwiZ2V0TnVtVmFycyIsImdldEN1cnJlbnRTb3VyY2VUb3RhbCIsIm5vZGVJbmRleCIsImN1cnJlbnRTb3VyY2VUb3RhbCIsImN1cnJlbnRTb3VyY2UiLCJjdXJyZW50IiwiZ2V0Q3VycmVudFRlcm1zIiwibm9kZSIsInNpZGUiLCJzaWduIiwibm9kZVRlcm1zIiwiYmF0dGVyeSIsInB1c2giLCJUZXJtIiwiVW5rbm93bkN1cnJlbnQiLCJyZXNpc3RvciIsIlVua25vd25Wb2x0YWdlIiwiZ2V0UmVmZXJlbmNlTm9kZUlkcyIsInRvVmlzaXQiLCJyZWZlcmVuY2VOb2RlSWRzIiwicmVmZXJlbmNlTm9kZUlkIiwiY29ubmVjdGVkTm9kZUlkcyIsImdldENvbm5lY3RlZE5vZGVJZHMiLCJ2aXNpdGVkIiwibm9kZVRvVmlzaXQiLCJzaGlmdCIsImNvbnRhaW5zTm9kZUlkIiwib3Bwb3NpdGVOb2RlIiwiZ2V0T3Bwb3NpdGVOb2RlIiwiaW5jbHVkZXMiLCJ1bmlxIiwiZ2V0RXF1YXRpb25zIiwiZXF1YXRpb25zIiwiRXF1YXRpb24iLCJjdXJyZW50VGVybXMiLCJ2b2x0YWdlIiwiZ2V0VW5rbm93bkN1cnJlbnRzIiwidW5rbm93bkN1cnJlbnRzIiwic29sdmUiLCJ1bmtub3duVm9sdGFnZXMiLCJ1bmtub3ducyIsImdldEluZGV4IiwidW5rbm93biIsImluZGV4IiwiZ2V0SW5kZXhCeUVxdWFscyIsIkEiLCJ6IiwieCIsInN0YW1wIiwiZSIsIm4iLCJwaGV0IiwibG9nIiwiY29uc29sZSIsImdldERlYnVnSW5mbyIsInZvbHRhZ2VNYXAiLCJNYXAiLCJ1bmtub3duVm9sdGFnZSIsInJocyIsImdldCIsImlzTmFOIiwic2V0IiwiY3VycmVudE1hcCIsInVua25vd25DdXJyZW50IiwicmVnaXN0ZXIiLCJhcnJheSIsImVxdWFscyIsImNvZWZmaWNpZW50IiwidmFyaWFibGUiLCJ0b1Rlcm1TdHJpbmciLCJwcmVmaXgiLCJ0b1Rlcm1OYW1lIiwib3RoZXIiLCJ2YWx1ZSIsInRlcm1zIiwicm93IiwiYSIsImdldENvbHVtbiIsInRlcm0iLCJjb2x1bW4iLCJ0ZXJtTGlzdCIsInJlc3VsdCIsInJlcGxhY2UiLCJtb2RpZmllZE5vZGFsQW5hbHlzaXNDaXJjdWl0IiwiY29uZGl0aW9uTnVtYmVyIiwiY29uZCIsImRlYnVnSW5mbyIsInRvRml4ZWQiLCJNYXRoIiwibG9nMTAiLCJ0cmFuc3Bvc2UiLCJ1Il0sInNvdXJjZXMiOlsiTU5BQ2lyY3VpdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RpZmllZCBOb2RhbCBBbmFseXNpcyBmb3IgYSBjaXJjdWl0LiAgQW4gRXF1YXRpb24gaXMgYSBzdW0gb2YgVGVybXMgZXF1YWwgdG8gYSBudW1lcmljIHZhbHVlLiAgQSBUZXJtIGlzIGNvbXBvc2VkXHJcbiAqIG9mIGEgY29lZmZpY2llbnQgdGltZXMgYSB2YXJpYWJsZS4gIFRoZSB2YXJpYWJsZXMgYXJlIFVua25vd25DdXJyZW50IG9yIFVua25vd25Wb2x0YWdlLiAgVGhlIHN5c3RlbSBvZiBhbGxcclxuICogRXF1YXRpb25zIGlzIHNvbHZlZCBhcyBhIGxpbmVhciBzeXN0ZW0uICBIZXJlIGlzIGEgZ29vZCByZWZlcmVuY2UgdGhhdCB3YXMgdXNlZCBkdXJpbmcgdGhlIGRldmVsb3BtZW50IG9mIHRoaXMgY29kZVxyXG4gKiBodHRwczovL3d3dy5zd2FydGhtb3JlLmVkdS9OYXRTY2kvZWNoZWV2ZTEvUmVmL21uYS9NTkEyLmh0bWxcclxuICpcclxuICogTm8gbGlzdGVuZXJzIGFyZSBhdHRhY2hlZCBhbmQgaGVuY2Ugbm8gZGlzcG9zZSBpbXBsZW1lbnRhdGlvbiBpcyBuZWNlc3NhcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFFSRGVjb21wb3NpdGlvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUVJEZWNvbXBvc2l0aW9uLmpzJztcclxuaW1wb3J0IE1hdHJpeCBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi8uLi8uLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IE1OQVNvbHV0aW9uIGZyb20gJy4vTU5BU29sdXRpb24uanMnO1xyXG5pbXBvcnQgTU5BQ2lyY3VpdEVsZW1lbnQgZnJvbSAnLi9NTkFDaXJjdWl0RWxlbWVudC5qcyc7XHJcbmltcG9ydCBNTkFCYXR0ZXJ5IGZyb20gJy4vTU5BQmF0dGVyeS5qcyc7XHJcbmltcG9ydCBNTkFSZXNpc3RvciBmcm9tICcuL01OQVJlc2lzdG9yLmpzJztcclxuaW1wb3J0IE1OQUN1cnJlbnQgZnJvbSAnLi9NTkFDdXJyZW50LmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNTkFDaXJjdWl0IHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJhdHRlcmllczogTU5BQmF0dGVyeVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzaXN0b3JzOiBNTkFSZXNpc3RvcltdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY3VycmVudFNvdXJjZXM6IE1OQUN1cnJlbnRbXTtcclxuXHJcbiAgLy8gdGhlIGxpc3Qgb2YgYWxsIHRoZSBlbGVtZW50cyBmb3IgZWFzZSBvZiBhY2Nlc3NcclxuICBwcml2YXRlIHJlYWRvbmx5IGVsZW1lbnRzOiBNTkFDaXJjdWl0RWxlbWVudFtdO1xyXG5cclxuICAvLyBhbiBvYmplY3Qgd2l0aCBpbmRleCBmb3IgYWxsIGtleXMgdGhhdCBoYXZlIGEgbm9kZSBpbiB0aGUgY2lyY3VpdCwgc3VjaCBhczogezA6MCwgMToxLCAyOjIsIDc6N31cclxuICBwcml2YXRlIHJlYWRvbmx5IG5vZGVTZXQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XHJcblxyXG4gIC8vIHRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIHNldFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbm9kZUNvdW50OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBub2Rlczogc3RyaW5nW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYmF0dGVyaWVzOiBNTkFCYXR0ZXJ5W10sIHJlc2lzdG9yczogTU5BUmVzaXN0b3JbXSwgY3VycmVudFNvdXJjZXM6IE1OQUN1cnJlbnRbXSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhdHRlcmllcywgJ2JhdHRlcmllcyBzaG91bGQgYmUgZGVmaW5lZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc2lzdG9ycywgJ3Jlc2lzdG9ycyBzaG91bGQgYmUgZGVmaW5lZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGN1cnJlbnRTb3VyY2VzLCAnY3VycmVudFNvdXJjZXMgc2hvdWxkIGJlIGRlZmluZWQnICk7XHJcblxyXG4gICAgdGhpcy5iYXR0ZXJpZXMgPSBiYXR0ZXJpZXM7XHJcbiAgICB0aGlzLnJlc2lzdG9ycyA9IHJlc2lzdG9ycztcclxuICAgIHRoaXMuY3VycmVudFNvdXJjZXMgPSBjdXJyZW50U291cmNlcztcclxuICAgIHRoaXMuZWxlbWVudHMgPSBbIC4uLnRoaXMuYmF0dGVyaWVzLCAuLi50aGlzLnJlc2lzdG9ycywgLi4udGhpcy5jdXJyZW50U291cmNlcyBdO1xyXG5cclxuICAgIHRoaXMubm9kZVNldCA9IHt9O1xyXG4gICAgZm9yICggbGV0IGsgPSAwOyBrIDwgdGhpcy5lbGVtZW50cy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbIGsgXTtcclxuICAgICAgdGhpcy5ub2RlU2V0WyBlbGVtZW50Lm5vZGVJZDAgXSA9IGVsZW1lbnQubm9kZUlkMDtcclxuICAgICAgdGhpcy5ub2RlU2V0WyBlbGVtZW50Lm5vZGVJZDEgXSA9IGVsZW1lbnQubm9kZUlkMTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm5vZGVDb3VudCA9IF8uc2l6ZSggdGhpcy5ub2RlU2V0ICk7XHJcblxyXG4gICAgLy8gdGhlIG5vZGUgaW5kaWNlc1xyXG4gICAgdGhpcy5ub2RlcyA9IF8udmFsdWVzKCB0aGlzLm5vZGVTZXQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNpcmN1aXQgZm9yIGRlYnVnZ2luZy5cclxuICAgKi9cclxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIGlmICggYXNzZXJ0ICkgeyAvLyBzdHJpcHBlZCBvdXQgZm9yIGJ1aWxkc1xyXG4gICAgICByZXR1cm4gYHJlc2lzdG9yczpcXG4ke3RoaXMucmVzaXN0b3JzLm1hcCggcmVzaXN0b3JUb1N0cmluZyApLmpvaW4oICdcXG4nICl9XFxuYCArXHJcbiAgICAgICAgICAgICBgYmF0dGVyaWVzOlxcbiR7dGhpcy5iYXR0ZXJpZXMubWFwKCBiYXR0ZXJ5VG9TdHJpbmcgKS5qb2luKCAnXFxuJyApfVxcbmAgK1xyXG4gICAgICAgICAgICAgYGN1cnJlbnRTb3VyY2VzOlxcbiR7dGhpcy5jdXJyZW50U291cmNlcy5tYXAoIGMgPT4gYy50b1N0cmluZygpICkuam9pbiggJ1xcbicgKX1gO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAndG9TdHJpbmcoKSBvbmx5IGRlZmluZWQgd2hlbiBhc3NlcnRpb25zIGFyZSBlbmFibGVkJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIHVua25vd24gY3VycmVudHMgaW4gdGhlIGNpcmN1aXQuICBUaGVyZSBpcyBhbiB1bmtub3duIGN1cnJlbnQgaW4gZWFjaCBiYXR0ZXJ5IGFuZFxyXG4gICAqIDAtcmVzaXN0YW5jZSByZXNpc3Rvci5cclxuICAgKi9cclxuICBwcml2YXRlIGdldEN1cnJlbnRDb3VudCgpOiBudW1iZXIge1xyXG4gICAgbGV0IG51bWJlck9mUmVzaXN0YW5jZUZyZWVSZXNpc3RvcnMgPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yZXNpc3RvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggdGhpcy5yZXNpc3RvcnNbIGkgXS5yZXNpc3RhbmNlID09PSAwICkge1xyXG4gICAgICAgIG51bWJlck9mUmVzaXN0YW5jZUZyZWVSZXNpc3RvcnMrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuYmF0dGVyaWVzLmxlbmd0aCArIG51bWJlck9mUmVzaXN0YW5jZUZyZWVSZXNpc3RvcnM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgdmFyaWFibGVzIGZvciB0aGUgc3lzdGVtLCBvbmUgZm9yIGVhY2ggdm9sdGFnZSBhbmQgb25lIGZvciBlYWNoIGN1cnJlbnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXROdW1WYXJzKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlQ291bnQgKyB0aGlzLmdldEN1cnJlbnRDb3VudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VtcyBhbGwgb2YgdGhlIGN1cnJlbnQgbGVhdmluZyB0aGUgbm9kZSAoc3VidHJhY3RpbmcgY3VycmVudCBmbG93aW5nIGludG8gdGhlIG5vZGUpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG5vZGVJbmRleCAtIHRoZSBub2RlIGF0IHdoaWNoIHRvIGNvbXB1dGUgY3VycmVudCBzb3VyY2VzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRDdXJyZW50U291cmNlVG90YWwoIG5vZGVJbmRleDogc3RyaW5nICk6IG51bWJlciB7XHJcbiAgICBsZXQgY3VycmVudFNvdXJjZVRvdGFsID0gMC4wO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jdXJyZW50U291cmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY3VycmVudFNvdXJjZSA9IHRoaXMuY3VycmVudFNvdXJjZXNbIGkgXTtcclxuICAgICAgaWYgKCBjdXJyZW50U291cmNlLm5vZGVJZDEgPT09IG5vZGVJbmRleCApIHtcclxuXHJcbiAgICAgICAgLy8gcG9zaXRpdmUgY3VycmVudCBpcyBlbnRlcmluZyB0aGUgbm9kZSwgYW5kIHRoZSBjb252ZW50aW9uIGlzIGZvciBpbmNvbWluZyBjdXJyZW50IHRvIGJlIG5lZ2F0aXZlXHJcbiAgICAgICAgY3VycmVudFNvdXJjZVRvdGFsID0gY3VycmVudFNvdXJjZVRvdGFsIC0gY3VycmVudFNvdXJjZS5jdXJyZW50O1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggY3VycmVudFNvdXJjZS5ub2RlSWQwID09PSBub2RlSW5kZXggKSB7XHJcblxyXG4gICAgICAgIC8vIHBvc2l0aXZlIGN1cnJlbnQgaXMgbGVhdmluZyB0aGUgbm9kZSwgYW5kIHRoZSBjb252ZW50aW9uIGlzIGZvciBvdXRnb2luZyBjdXJyZW50IHRvIGJlIHBvc2l0aXZlXHJcbiAgICAgICAgY3VycmVudFNvdXJjZVRvdGFsID0gY3VycmVudFNvdXJjZVRvdGFsICsgY3VycmVudFNvdXJjZS5jdXJyZW50O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY3VycmVudFNvdXJjZVRvdGFsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBjdXJyZW50IGNvbnNlcnZhdGlvbiB0ZXJtcyBnb2luZyBpbnRvIG9yIG91dCBvZiBhIG5vZGUuIEluY29taW5nIGN1cnJlbnQgaXMgbmVnYXRpdmUsIG91dGdvaW5nIGlzIHBvc2l0aXZlLlxyXG4gICAqIEBwYXJhbSBub2RlIC0gdGhlIG5vZGVcclxuICAgKiBAcGFyYW0gc2lkZSAtICdub2RlSWQwJyBmb3Igb3V0Z29pbmcgY3VycmVudCBvciAnbm9kZUlkMScgZm9yIGluY29taW5nIGN1cnJlbnRcclxuICAgKiBAcGFyYW0gc2lnbiAtIDEgZm9yIGluY29taW5nIGN1cnJlbnQgYW5kIC0xIGZvciBvdXRnb2luZyBjdXJyZW50XHJcbiAgICogQHBhcmFtIG5vZGVUZXJtcyAtIHRvIGFjY3VtdWxhdGUgdGhlIHJlc3VsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0Q3VycmVudFRlcm1zKCBub2RlOiBzdHJpbmcsIHNpZGU6ICdub2RlSWQwJyB8ICdub2RlSWQxJywgc2lnbjogbnVtYmVyLCBub2RlVGVybXM6IFRlcm1bXSApOiBUZXJtW10ge1xyXG4gICAgLy8gRWFjaCBiYXR0ZXJ5IGludHJvZHVjZXMgYW4gdW5rbm93biBjdXJyZW50IHRocm91Z2ggdGhlIGJhdHRlcnlcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYmF0dGVyaWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBiYXR0ZXJ5ID0gdGhpcy5iYXR0ZXJpZXNbIGkgXTtcclxuICAgICAgaWYgKCBiYXR0ZXJ5WyBzaWRlIF0gPT09IG5vZGUgKSB7XHJcbiAgICAgICAgbm9kZVRlcm1zLnB1c2goIG5ldyBUZXJtKCBzaWduLCBuZXcgVW5rbm93bkN1cnJlbnQoIGJhdHRlcnkgKSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJlc2lzdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcmVzaXN0b3IgPSB0aGlzLnJlc2lzdG9yc1sgaSBdO1xyXG5cclxuICAgICAgaWYgKCByZXNpc3Rvclsgc2lkZSBdID09PSBub2RlICkge1xyXG4gICAgICAgIGlmICggcmVzaXN0b3IucmVzaXN0YW5jZSA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBFYWNoIHJlc2lzdG9yIHdpdGggMCByZXNpc3RhbmNlIGludHJvZHVjZXMgYW4gdW5rbm93biBjdXJyZW50LCBhbmQgdjE9djJcclxuICAgICAgICAgIG5vZGVUZXJtcy5wdXNoKCBuZXcgVGVybSggc2lnbiwgbmV3IFVua25vd25DdXJyZW50KCByZXNpc3RvciApICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gRWFjaCByZXNpc3RvciB3aXRoIG5vbnplcm8gcmVzaXN0YW5jZSBoYXMgdW5rbm93biB2b2x0YWdlc1xyXG4gICAgICAgICAgbm9kZVRlcm1zLnB1c2goIG5ldyBUZXJtKCAtc2lnbiAvIHJlc2lzdG9yLnJlc2lzdGFuY2UsIG5ldyBVbmtub3duVm9sdGFnZSggcmVzaXN0b3Iubm9kZUlkMSApICkgKTtcclxuICAgICAgICAgIG5vZGVUZXJtcy5wdXNoKCBuZXcgVGVybSggc2lnbiAvIHJlc2lzdG9yLnJlc2lzdGFuY2UsIG5ldyBVbmtub3duVm9sdGFnZSggcmVzaXN0b3Iubm9kZUlkMCApICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbm9kZVRlcm1zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VsZWN0cyBvbmUgbm9kZSBmb3IgZWFjaCBjb25uZWN0ZWQgY29tcG9uZW50IHRvIGhhdmUgdGhlIHJlZmVyZW5jZSB2b2x0YWdlIG9mIDAgdm9sdHMuXHJcbiAgICogQHJldHVybnMgdGhlIG5vZGUgSURzIHNlbGVjdGVkIGZvciByZWZlcmVuY2VzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRSZWZlcmVuY2VOb2RlSWRzKCk6IHN0cmluZ1tdIHtcclxuXHJcbiAgICAvLyBUaGUgbm9kZXMgd2hpY2ggbmVlZCB0byBiZSB2aXNpdGVkLlxyXG4gICAgY29uc3QgdG9WaXNpdCA9IF8udmFsdWVzKCB0aGlzLm5vZGVTZXQgKTtcclxuXHJcbiAgICAvLyBNYXJrIHJlZmVyZW5jZSBub2RlcyBhcyB0aGV5IGFyZSBkaXNjb3ZlcmVkXHJcbiAgICBjb25zdCByZWZlcmVuY2VOb2RlSWRzID0gW107XHJcbiAgICB3aGlsZSAoIHRvVmlzaXQubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgIGNvbnN0IHJlZmVyZW5jZU5vZGVJZCA9IHRvVmlzaXRbIDAgXTtcclxuICAgICAgcmVmZXJlbmNlTm9kZUlkcy5wdXNoKCByZWZlcmVuY2VOb2RlSWQgKTtcclxuICAgICAgY29uc3QgY29ubmVjdGVkTm9kZUlkcyA9IHRoaXMuZ2V0Q29ubmVjdGVkTm9kZUlkcyggcmVmZXJlbmNlTm9kZUlkICk7XHJcblxyXG4gICAgICAvLyBObyBuZWVkIHRvIHZpc2l0IGFueSBub2RlcyBjb25uZWN0ZWQgdG8gdGhlIHJlZmVyZW5jZSBub2RlLCBzaW5jZSB0aGVpciBjb25uZWN0ZWQgY29tcG9uZW50IGFscmVhZHkgaGFzIGEgcmVmZXJlbmNlIG5vZGUuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvbm5lY3RlZE5vZGVJZHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgYXJyYXlSZW1vdmUoIHRvVmlzaXQsIGNvbm5lY3RlZE5vZGVJZHNbIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVmZXJlbmNlTm9kZUlkcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIGFsbCBub2RlcyBjb25uZWN0ZWQgKGJ5IGFueSBwYXRoKSB0byB0aGUgZ2l2ZW4gbm9kZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0Q29ubmVjdGVkTm9kZUlkcyggbm9kZTogc3RyaW5nICk6IHN0cmluZ1tdIHtcclxuICAgIGNvbnN0IHZpc2l0ZWQgPSBbXTtcclxuICAgIGNvbnN0IHRvVmlzaXQ6IHN0cmluZ1tdID0gWyBub2RlIF07XHJcblxyXG4gICAgd2hpbGUgKCB0b1Zpc2l0Lmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICBjb25zdCBub2RlVG9WaXNpdCA9IHRvVmlzaXQuc2hpZnQoKSE7XHJcbiAgICAgIHZpc2l0ZWQucHVzaCggbm9kZVRvVmlzaXQgKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5lbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50c1sgaSBdO1xyXG4gICAgICAgIGlmICggZWxlbWVudC5jb250YWluc05vZGVJZCggbm9kZVRvVmlzaXQgKSApIHtcclxuICAgICAgICAgIGNvbnN0IG9wcG9zaXRlTm9kZSA9IGVsZW1lbnQuZ2V0T3Bwb3NpdGVOb2RlKCBub2RlVG9WaXNpdCApO1xyXG4gICAgICAgICAgaWYgKCAhdmlzaXRlZC5pbmNsdWRlcyggb3Bwb3NpdGVOb2RlICkgKSB7XHJcbiAgICAgICAgICAgIHRvVmlzaXQucHVzaCggb3Bwb3NpdGVOb2RlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gXy51bmlxKCB2aXNpdGVkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIEVxdWF0aW9uIGluc3RhbmNlcyB0aGF0IHdpbGwgYmUgc29sdmVkIGFzIGEgbGluZWFyIGFsZ2VicmEgcHJvYmxlbSB0byBmaW5kIHRoZSB1bmtub3duXHJcbiAgICogdmFyaWFibGVzIG9mIHRoZSBjaXJjdWl0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0RXF1YXRpb25zKCk6IEVxdWF0aW9uW10ge1xyXG4gICAgY29uc3QgZXF1YXRpb25zID0gW107XHJcblxyXG4gICAgLy8gUmVmZXJlbmNlIG5vZGUgaW4gZWFjaCBjb25uZWN0ZWQgY2lyY3VpdCBlbGVtZW50IGhhcyBhIHZvbHRhZ2Ugb2YgMC4wXHJcbiAgICBjb25zdCByZWZlcmVuY2VOb2RlSWRzID0gdGhpcy5nZXRSZWZlcmVuY2VOb2RlSWRzKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZWZlcmVuY2VOb2RlSWRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBlcXVhdGlvbnMucHVzaCggbmV3IEVxdWF0aW9uKCAwLCBbIG5ldyBUZXJtKCAxLCBuZXcgVW5rbm93blZvbHRhZ2UoIHJlZmVyZW5jZU5vZGVJZHNbIGkgXSApICkgXSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcGhldC5sb2cgJiYgcGhldC5sb2coIHJlZmVyZW5jZU5vZGVJZHMgKTtcclxuXHJcbiAgICAvLyBGb3IgZWFjaCBub2RlLCBjaGFyZ2UgaXMgY29uc2VydmVkXHJcbiAgICBjb25zdCBub2RlcyA9IHRoaXMubm9kZXM7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzWyBpIF07XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRUZXJtczogVGVybVtdID0gW107XHJcblxyXG4gICAgICB0aGlzLmdldEN1cnJlbnRUZXJtcyggbm9kZSwgJ25vZGVJZDEnLCArMSwgY3VycmVudFRlcm1zICk7XHJcbiAgICAgIHRoaXMuZ2V0Q3VycmVudFRlcm1zKCBub2RlLCAnbm9kZUlkMCcsIC0xLCBjdXJyZW50VGVybXMgKTtcclxuICAgICAgZXF1YXRpb25zLnB1c2goIG5ldyBFcXVhdGlvbiggdGhpcy5nZXRDdXJyZW50U291cmNlVG90YWwoIG5vZGUgKSwgY3VycmVudFRlcm1zICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3IgZWFjaCBiYXR0ZXJ5LCB2b2x0YWdlIGRyb3AgaXMgZ2l2ZW5cclxuICAgIC8vIFdpdGhpbiB0aGUgYmF0dGVyeSwgdGhlIGN1cnJlbnQgZmxvd3MgZnJvbSBsb3cgdG8gaGlnaCBwb3RlbnRpYWwsIHNvIFYgPSAtKHYxLXYwKSBpbiB0aGlzIGNhc2UuXHJcbiAgICAvLyBCZWNhdXNlIHRoZSBiYXR0ZXJ5IG1vdmVzIHRoZSBjdXJyZW50IGZyb20gbG93IHZvbHRhZ2UgdG8gaGlnaCB2b2x0YWdlLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYXR0ZXJpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJhdHRlcnkgPSB0aGlzLmJhdHRlcmllc1sgaSBdO1xyXG4gICAgICBlcXVhdGlvbnMucHVzaCggbmV3IEVxdWF0aW9uKCBiYXR0ZXJ5LnZvbHRhZ2UsIFtcclxuICAgICAgICBuZXcgVGVybSggMSwgbmV3IFVua25vd25Wb2x0YWdlKCBiYXR0ZXJ5Lm5vZGVJZDAgKSApLFxyXG4gICAgICAgIG5ldyBUZXJtKCAtMSwgbmV3IFVua25vd25Wb2x0YWdlKCBiYXR0ZXJ5Lm5vZGVJZDEgKSApXHJcbiAgICAgIF0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHJlc2lzdG9yIGhhcyBubyByZXNpc3RhbmNlLCBub2RlSWQwIGFuZCBub2RlSWQxIHNob3VsZCBoYXZlIHNhbWUgdm9sdGFnZVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yZXNpc3RvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHJlc2lzdG9yID0gdGhpcy5yZXNpc3RvcnNbIGkgXTtcclxuICAgICAgaWYgKCByZXNpc3Rvci5yZXNpc3RhbmNlID09PSAwICkge1xyXG4gICAgICAgIGVxdWF0aW9ucy5wdXNoKCBuZXcgRXF1YXRpb24oIDAsIFtcclxuICAgICAgICAgIG5ldyBUZXJtKCAxLCBuZXcgVW5rbm93blZvbHRhZ2UoIHJlc2lzdG9yLm5vZGVJZDAgKSApLFxyXG4gICAgICAgICAgbmV3IFRlcm0oIC0xLCBuZXcgVW5rbm93blZvbHRhZ2UoIHJlc2lzdG9yLm5vZGVJZDEgKSApXHJcbiAgICAgICAgXSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZXF1YXRpb25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbiBhcnJheSBvZiB0aGUgdW5rbm93biBjdXJyZW50cyBpbiB0aGUgY2lyY3VpdC5cclxuICAgKi9cclxuICBwcml2YXRlIGdldFVua25vd25DdXJyZW50cygpOiBVbmtub3duQ3VycmVudFtdIHtcclxuICAgIGNvbnN0IHVua25vd25DdXJyZW50czogVW5rbm93bkN1cnJlbnRbXSA9IFtdO1xyXG5cclxuICAgIC8vIEVhY2ggYmF0dGVyeSBoYXMgYW4gdW5rbm93biBjdXJyZW50XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJhdHRlcmllcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdW5rbm93bkN1cnJlbnRzLnB1c2goIG5ldyBVbmtub3duQ3VycmVudCggdGhpcy5iYXR0ZXJpZXNbIGkgXSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVHJlYXQgcmVzaXN0b3JzIHdpdGggUj0wIGFzIGhhdmluZyB1bmtub3duIGN1cnJlbnQgYW5kIHYxPXYyXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJlc2lzdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLnJlc2lzdG9yc1sgaSBdLnJlc2lzdGFuY2UgPT09IDAgKSB7XHJcbiAgICAgICAgdW5rbm93bkN1cnJlbnRzLnB1c2goIG5ldyBVbmtub3duQ3VycmVudCggdGhpcy5yZXNpc3RvcnNbIGkgXSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1bmtub3duQ3VycmVudHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTb2x2ZXMgZm9yIGFsbCB1bmtub3duIGN1cnJlbnRzIGFuZCB2b2x0YWdlcyBpbiB0aGUgY2lyY3VpdC5cclxuICAgKi9cclxuICBwdWJsaWMgc29sdmUoKTogTU5BU29sdXRpb24ge1xyXG4gICAgY29uc3QgZXF1YXRpb25zID0gdGhpcy5nZXRFcXVhdGlvbnMoKTtcclxuICAgIGNvbnN0IHVua25vd25DdXJyZW50cyA9IHRoaXMuZ2V0VW5rbm93bkN1cnJlbnRzKCk7XHJcbiAgICBjb25zdCB1bmtub3duVm9sdGFnZXMgPSB0aGlzLm5vZGVzLm1hcCggbm9kZSA9PiBuZXcgVW5rbm93blZvbHRhZ2UoIG5vZGUgKSApO1xyXG5cclxuICAgIGNvbnN0IHVua25vd25zID0gWyAuLi51bmtub3duQ3VycmVudHMsIC4uLnVua25vd25Wb2x0YWdlcyBdO1xyXG5cclxuICAgIC8vIEdldHMgdGhlIGluZGV4IG9mIHRoZSBzcGVjaWZpZWQgdW5rbm93bi5cclxuICAgIGNvbnN0IGdldEluZGV4ID0gKCB1bmtub3duOiBVbmtub3duQ3VycmVudCB8IFVua25vd25Wb2x0YWdlICkgPT4ge1xyXG4gICAgICBjb25zdCBpbmRleCA9IGdldEluZGV4QnlFcXVhbHMoIHVua25vd25zLCB1bmtub3duICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAsICd1bmtub3duIHdhcyBtaXNzaW5nJyApO1xyXG4gICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFByZXBhcmUgdGhlIEEgYW5kIHogbWF0cmljZXMgZm9yIHRoZSBsaW5lYXIgc3lzdGVtIEF4PXpcclxuICAgIGNvbnN0IEEgPSBuZXcgTWF0cml4KCBlcXVhdGlvbnMubGVuZ3RoLCB0aGlzLmdldE51bVZhcnMoKSApO1xyXG4gICAgY29uc3QgeiA9IG5ldyBNYXRyaXgoIGVxdWF0aW9ucy5sZW5ndGgsIDEgKTtcclxuXHJcbiAgICAvLyBzb2x2ZSB0aGUgbGluZWFyIG1hdHJpeCBzeXN0ZW0gZm9yIHRoZSB1bmtub3duc1xyXG4gICAgbGV0IHg7XHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZXF1YXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGVxdWF0aW9uc1sgaSBdLnN0YW1wKCBpLCBBLCB6LCBnZXRJbmRleCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB4ID0gbmV3IFFSRGVjb21wb3NpdGlvbiggQSApLnNvbHZlKCB6ICk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCggZSApIHtcclxuXHJcbiAgICAgIC8vIFNvbWV0aW1lcyBhIGZ1enogdGVzdCBnaXZlcyBhIGRlZmljaWVudCBtYXRyaXggcmFuay4gIEl0IGlzIGEgcmFyZSBlcnJvciBhbmQgSSBoYXZlbid0IGdvdCBvbmUgaW4gdGhlXHJcbiAgICAgIC8vIGRlYnVnZ2VyIHlldCB0byB1bmRlcnN0YW5kIHRoZSBjYXVzZS4gIENhdGNoIGl0IGFuZCBwcm92aWRlIGEgc29sdXRpb24gb2YgemVyb2VzIG9mIHRoZSBjb3JyZWN0IGRpbWVuc2lvblxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1kYy9pc3N1ZXMvMTEzXHJcbiAgICAgIHggPSBuZXcgTWF0cml4KCBBLm4sIDEgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHBoZXQubG9nICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggZ2V0RGVidWdJbmZvKCB0aGlzLCBBLCB6LCBlcXVhdGlvbnMsIHVua25vd25zLCB4ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2b2x0YWdlTWFwID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHVua25vd25Wb2x0YWdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdW5rbm93blZvbHRhZ2UgPSB1bmtub3duVm9sdGFnZXNbIGkgXTtcclxuICAgICAgY29uc3QgcmhzID0geC5nZXQoIGdldEluZGV4QnlFcXVhbHMoIHVua25vd25zLCB1bmtub3duVm9sdGFnZSApLCAwICk7XHJcblxyXG4gICAgICAvLyBHdWFyZCBhc3NlcnRpb24gYmVjYXVzZSBpdCBpcyBleHBlbnNpdmUgdG8gY29tcHV0ZSB0aGUgZGVidWcgaW5mby5cclxuICAgICAgaWYgKCBhc3NlcnQgJiYgaXNOYU4oIHJocyApICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggcmhzICksIGB0aGUgcmlnaHQtaGFuZC1zaWRlLXZhbHVlIG11c3QgYmUgYSBudW1iZXIuIEluc3RlYWQgaXQgd2FzICR7cmhzfS4gZGVidWcgaW5mbz0ke2dldERlYnVnSW5mbyggdGhpcywgQSwgeiwgZXF1YXRpb25zLCB1bmtub3ducywgeCApfWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdm9sdGFnZU1hcC5zZXQoIHVua25vd25Wb2x0YWdlLm5vZGUsIHJocyApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRNYXAgPSBuZXcgTWFwPE1OQUNpcmN1aXRFbGVtZW50LCBudW1iZXI+KCk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdW5rbm93bkN1cnJlbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB1bmtub3duQ3VycmVudCA9IHVua25vd25DdXJyZW50c1sgaSBdO1xyXG4gICAgICBjdXJyZW50TWFwLnNldCggdW5rbm93bkN1cnJlbnQuZWxlbWVudCwgeC5nZXQoIGdldEluZGV4QnlFcXVhbHMoIHVua25vd25zLCB1bmtub3duQ3VycmVudCApLCAwICkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IE1OQVNvbHV0aW9uKCB2b2x0YWdlTWFwLCBjdXJyZW50TWFwICk7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnTU5BQ2lyY3VpdCcsIE1OQUNpcmN1aXQgKTtcclxuXHJcbi8qKlxyXG4gKiBGaW5kIHRoZSBpbmRleCBvZiBhbiBlbGVtZW50IGluIGFuIGFycmF5IGNvbXBhcmluZyB3aXRoIHRoZSBlcXVhbHMoKSBtZXRob2QuXHJcbiAqIENvdWxkIGhhdmUgdXNlZCBsb2Rhc2gncyBfLmZpbmRJbmRleCwgYnV0IHRoaXMgd2lsbCBiZSBjYWxsZWQgbWFueSB0aW1lcyBwZXIgZnJhbWUgYW5kIGNvdWxkIGJlIGZhc3RlciB3aXRob3V0XHJcbiAqIGxvZGFzaFxyXG4gKiBAcGFyYW0gYXJyYXlcclxuICogQHBhcmFtIGVsZW1lbnRcclxuICogQHJldHVybnMgdGhlIGluZGV4IG9yIC0xIGlmIG5vdCBmb3VuZFxyXG4gKi9cclxuY29uc3QgZ2V0SW5kZXhCeUVxdWFscyA9IDxUIGV4dGVuZHMgeyBlcXVhbHM6ICggdDogSW50ZW50aW9uYWxBbnkgKSA9PiBib29sZWFuIH0+KCBhcnJheTogQXJyYXk8VD4sIGVsZW1lbnQ6IEludGVudGlvbmFsQW55ICkgPT4ge1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgaWYgKCBhcnJheVsgaSBdLmVxdWFscyggZWxlbWVudCApICkge1xyXG4gICAgICByZXR1cm4gaTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZvciBkZWJ1Z2dpbmcsIGRpc3BsYXkgYSBSZXNpc3RvciBhcyBhIHN0cmluZ1xyXG4gKi9cclxuY29uc3QgcmVzaXN0b3JUb1N0cmluZyA9ICggcmVzaXN0b3I6IE1OQVJlc2lzdG9yICkgPT5cclxuICBgbm9kZSR7cmVzaXN0b3Iubm9kZUlkMH0gLT4gbm9kZSR7cmVzaXN0b3Iubm9kZUlkMX0gQCAke3Jlc2lzdG9yLnJlc2lzdGFuY2V9IE9obXNgO1xyXG5cclxuLyoqXHJcbiAqIEZvciBkZWJ1Z2dpbmcsIGRpc3BsYXkgYSBCYXR0ZXJ5IGFzIGEgc3RyaW5nXHJcbiAqL1xyXG5jb25zdCBiYXR0ZXJ5VG9TdHJpbmcgPSAoIGJhdHRlcnk6IE1OQUJhdHRlcnkgKSA9PlxyXG4gIGBub2RlJHtiYXR0ZXJ5Lm5vZGVJZDB9IC0+IG5vZGUke2JhdHRlcnkubm9kZUlkMX0gQCAke2JhdHRlcnkudm9sdGFnZX0gVm9sdHNgO1xyXG5cclxuY2xhc3MgVGVybSB7XHJcblxyXG4gIC8vIHRoZSBjb2VmZmljaWVudCBmb3IgdGhlIHRlcm0sIGxpa2UgJzcnIGluIDd4XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvZWZmaWNpZW50OiBudW1iZXI7XHJcblxyXG4gIC8vIHRoZSB2YXJpYWJsZSBmb3IgdGhlIHRlcm0sIGxpa2UgdGhlIHggdmFyaWFibGUgaW4gN3hcclxuICBwdWJsaWMgcmVhZG9ubHkgdmFyaWFibGU6IFVua25vd25DdXJyZW50IHwgVW5rbm93blZvbHRhZ2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBjb2VmZmljaWVudCAtIHRoZSBtdWx0aXBsaWVyIGZvciB0aGlzIHRlcm1cclxuICAgKiBAcGFyYW0gdmFyaWFibGUgLSB0aGUgdmFyaWFibGUgZm9yIHRoaXMgdGVybSwgbGlrZSB0aGUgeCB2YXJpYWJsZSBpbiA3eFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29lZmZpY2llbnQ6IG51bWJlciwgdmFyaWFibGU6IFVua25vd25DdXJyZW50IHwgVW5rbm93blZvbHRhZ2UgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWlzTmFOKCBjb2VmZmljaWVudCApLCAnY29lZmZpY2llbnQgY2Fubm90IGJlIE5hTicgKTtcclxuXHJcbiAgICB0aGlzLmNvZWZmaWNpZW50ID0gY29lZmZpY2llbnQ7XHJcbiAgICB0aGlzLnZhcmlhYmxlID0gdmFyaWFibGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGZvciBkZWJ1Z2dpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIHRvVGVybVN0cmluZygpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb2VmZmljaWVudCA9PT0gMSA/ICcnIDpcclxuICAgICAgICAgICAgICAgICAgIHRoaXMuY29lZmZpY2llbnQgPT09IC0xID8gJy0nIDpcclxuICAgICAgICAgICAgICAgICAgIGAke3RoaXMuY29lZmZpY2llbnR9KmA7XHJcbiAgICByZXR1cm4gcHJlZml4ICsgdGhpcy52YXJpYWJsZS50b1Rlcm1OYW1lKCk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBVbmtub3duQ3VycmVudCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IE1OQUNpcmN1aXRFbGVtZW50O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVsZW1lbnQ6IE1OQUNpcmN1aXRFbGVtZW50ICkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIHRlcm0gZm9yIGRlYnVnZ2luZy5cclxuICAgKi9cclxuICBwdWJsaWMgdG9UZXJtTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBJJHt0aGlzLmVsZW1lbnQubm9kZUlkMH1fJHt0aGlzLmVsZW1lbnQubm9kZUlkMX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHdvIFVua25vd25DdXJyZW50cyBhcmUgZXF1YWwgaWYgdGhlIHJlZmVyIHRvIHRoZSBzYW1lIGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIG90aGVyIC0gYW4gVW5rbm93bkN1cnJlbnQgdG8gY29tcGFyZSB3aXRoIHRoaXMgb25lXHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFscyggb3RoZXI6IFVua25vd25DdXJyZW50ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIG90aGVyLmVsZW1lbnQgPT09IHRoaXMuZWxlbWVudDtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFVua25vd25Wb2x0YWdlIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgbm9kZTogc3RyaW5nOyAvLyB0aGUgaW5kZXggb2YgdGhlIG5vZGVcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBub2RlOiBzdHJpbmcgKSB7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyB2YXJpYWJsZSBuYW1lIGZvciB0aGlzIHRlcm0sIGZvciBkZWJ1Z2dpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIHRvVGVybU5hbWUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgViR7dGhpcy5ub2RlfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUd28gVW5rbm93blZvbHRhZ2VzIGFyZSBlcXVhbCBpZiB0aGV5IHJlZmVyIHRvIHRoZSBzYW1lIG5vZGUuXHJcbiAgICogQHBhcmFtIG90aGVyIC0gYW5vdGhlciBvYmplY3QgdG8gY29tcGFyZSB3aXRoIHRoaXMgb25lXHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFscyggb3RoZXI6IFVua25vd25Wb2x0YWdlICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIG90aGVyLm5vZGUgPT09IHRoaXMubm9kZTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEVxdWF0aW9uIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0ZXJtczogVGVybVtdO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgdmFsdWUgb24gdGhlIHJpZ2h0IGhhbmQgc2lkZSBvZiB0aGUgZXF1YXRpb24sIHN1Y2ggYXMgeCt5PTdcclxuICAgKiBAcGFyYW0gdGVybXNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlOiBudW1iZXIsIHRlcm1zOiBUZXJtW10gKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWlzTmFOKCB2YWx1ZSApICk7XHJcblxyXG4gICAgLy8gdGhlIHZhbHVlIG9mIHRoZSBlcXVhdGlvbi4gIEZvciBpbnN0YW5jZSBpbiB4KzN5PTEyLCB0aGUgdmFsdWUgaXMgMTJcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAvLyB0aGUgdGVybXMgb24gdGhlIGxlZnQtaGFuZCBzaWRlIG9mIHRoZSBlcXVhdGlvbi4gIEUuZy4sIGluIDN4K3k9MTIgdGhlIHRlcm1zIGFyZSAzeCBhbmQgeVxyXG4gICAgdGhpcy50ZXJtcyA9IHRlcm1zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW50ZXIgdGhpcyBFcXVhdGlvbiBpbnRvIHRoZSBnaXZlbiBNYXRyaWNlcyBmb3Igc29sdmluZyB0aGUgc3lzdGVtLlxyXG4gICAqIEBwYXJhbSByb3cgLSB0aGUgaW5kZXggb2YgdGhlIHJvdyBmb3IgdGhpcyBlcXVhdGlvblxyXG4gICAqIEBwYXJhbSBhIC0gdGhlIG1hdHJpeCBvZiBjb2VmZmljaWVudHMgaW4gQXg9elxyXG4gICAqIEBwYXJhbSB6IC0gdGhlIG1hdHJpeCBvbiB0aGUgcmlnaHQgaGFuZCBzaWRlIGluIEF4PXpcclxuICAgKiBAcGFyYW0gZ2V0Q29sdW1uIC0gKFVua25vd25DdXJyZW50fFVua25vd25Wb2x0YWdlKSA9PiBudW1iZXJcclxuICAgKi9cclxuICBwdWJsaWMgc3RhbXAoIHJvdzogbnVtYmVyLCBhOiBNYXRyaXgsIHo6IE1hdHJpeCwgZ2V0Q29sdW1uOiB7XHJcbiAgICAoIHVua25vd246IFVua25vd25DdXJyZW50IHwgVW5rbm93blZvbHRhZ2UgKTogbnVtYmVyO1xyXG4gICAgKCBhcmcwOiBVbmtub3duQ3VycmVudCB8IFVua25vd25Wb2x0YWdlICk6IG51bWJlcjtcclxuICB9ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFNldCB0aGUgZXF1YXRpb24ncyB2YWx1ZSBpbnRvIHRoZSBzb2x1dGlvbiBtYXRyaXhcclxuICAgIHouc2V0KCByb3csIDAsIHRoaXMudmFsdWUgKTtcclxuXHJcbiAgICAvLyBGb3IgZWFjaCB0ZXJtLCBhdWdtZW50IHRoZSBjb2VmZmljaWVudCBtYXRyaXhcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudGVybXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRlcm0gPSB0aGlzLnRlcm1zWyBpIF07XHJcbiAgICAgIGNvbnN0IGNvbHVtbiA9IGdldENvbHVtbiggdGVybS52YXJpYWJsZSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIHRlcm0uY29lZmZpY2llbnQgKSwgJ2NvZWZmaWNpZW50IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgICAgYS5zZXQoIHJvdywgY29sdW1uLCB0ZXJtLmNvZWZmaWNpZW50ICsgYS5nZXQoIHJvdywgY29sdW1uICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZm9yIGRlYnVnZ2luZy5cclxuICAgKi9cclxuICBwcml2YXRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCB0ZXJtTGlzdCA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50ZXJtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGVybUxpc3QucHVzaCggdGhpcy50ZXJtc1sgaSBdLnRvVGVybVN0cmluZygpICk7XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXN1bHQgPSBgJHt0ZXJtTGlzdC5qb2luKCAnKycgKX09JHt0aGlzLnZhbHVlfWA7XHJcblxyXG4gICAgLy8gcmVwbGFjZSArLSB3aXRoIC0uIEZvciBpbnN0YW5jZSwgeCstMyBzaG91bGQganVzdCBiZSB4LTNcclxuICAgIHJldHVybiByZXN1bHQucmVwbGFjZSggJ1xcXFwrXFxcXC0nLCAnXFxcXC0nICk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBnZXREZWJ1Z0luZm8gPSAoIG1vZGlmaWVkTm9kYWxBbmFseXNpc0NpcmN1aXQ6IE1OQUNpcmN1aXQsIEE6IE1hdHJpeCwgejogTWF0cml4LCBlcXVhdGlvbnM6IEVxdWF0aW9uW10sIHVua25vd25zOiAoIFVua25vd25DdXJyZW50IHwgVW5rbm93blZvbHRhZ2UgKVtdLCB4OiBNYXRyaXggKSA9PiB7XHJcbiAgY29uc3QgY29uZGl0aW9uTnVtYmVyID0gQS5jb25kKCk7XHJcbiAgY29uc3QgZGVidWdJbmZvID0gYERlYnVnZ2luZyBjaXJjdWl0OiAke21vZGlmaWVkTm9kYWxBbmFseXNpc0NpcmN1aXQudG9TdHJpbmcoKX1cclxuICAgIGVxdWF0aW9uczpcclxuJHtlcXVhdGlvbnMuam9pbiggJ1xcbicgKX1cclxuXHJcbkEuY29uZD0xRSR7VXRpbHMudG9GaXhlZCggTWF0aC5sb2cxMCggY29uZGl0aW9uTnVtYmVyICksIDQgKX0gPSAke1V0aWxzLnRvRml4ZWQoIGNvbmRpdGlvbk51bWJlciwgNCApfSAgXHJcbkE9XFxuJHtBLnRyYW5zcG9zZSgpLnRvU3RyaW5nKCl9XHJcbno9XFxuJHt6LnRyYW5zcG9zZSgpLnRvU3RyaW5nKCl9XHJcbnVua25vd25zPVxcbiR7dW5rbm93bnMubWFwKCB1ID0+IHUudG9UZXJtTmFtZSgpICkuam9pbiggJywgJyApfVxyXG54PVxcbiR7eC50cmFuc3Bvc2UoKS50b1N0cmluZygpfVxyXG4gICAgYDtcclxuXHJcbiAgcmV0dXJuIGRlYnVnSW5mbztcclxufTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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